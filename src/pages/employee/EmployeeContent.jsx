import { useState, useEffect } from "react";
import EmployeeInsights from "./EmployeeInsights";
import { getDesignerActiveTasks, getDesignerHistory } from "../../api/taskApi";
import { useAuth } from "../../context/AuthContext";
import "./EmployeeDashboard.css";
import TeamTaskTable from "../../components/tasks/TeamTaskTable";
import PlansSection from "../../components/tasks/PlansSection";
import { saveComment, submitTask, publishTask } from "../../api/taskApi";
import CompletedTaskTable from "../../components/tasks/CompletedTaskTable";

const EmployeeContent = ({ page }) => {
  const { user } = useAuth();

  const isStrategist = user?.role?.toLowerCase() === "strategist";

  const [tab, setTab] = useState("active");
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState({});
  const [clientFilter, setClientFilter] = useState("");
  const [contentFilter, setContentFilter] = useState("");

  const handleCommentChange = (taskId, value) => {
    setComments((prev) => ({
      ...prev,
      [taskId]: value
    }));
  };

  const handleSave = async (taskId) => {
    try {
      const comment = comments[taskId] || "";

      if (!comment.trim()) {
        return alert("Reason required for delay");  // 🔥 ADD THIS
      }

      await saveComment(taskId, comment, user.role);
      fetchTasks();
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

const handleSubmit = async (taskId) => {
  try {
    const task = tasks.find(t => t.id === taskId);

    console.log("🔥 HANDLE SUBMIT CALLED:", taskId);

    const comment = comments[taskId] || "";
    const existingReason = task.reason_for_delay || "";
    const finalComment = comment || existingReason;

    const today = new Date();
    const assignDate = new Date(task.assign_date);

    today.setHours(0,0,0,0);
    assignDate.setHours(0,0,0,0);

    const isDelayed = today > assignDate;

    if (user.role === "strategist") {
      await submitTask(taskId);
      fetchTasks();
      return;
    }

    if (isDelayed) {
      if (!finalComment) {
        return alert("Reason required for delay");
      }

      if (comment) {
        await saveComment(taskId, comment, user.role);
      }

      await submitTask(taskId, finalComment);
      fetchTasks();
      return;
    }

    // 🔥 ✅ THIS WAS MISSING
    await submitTask(taskId);
    fetchTasks();

  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "Submit failed");
  }
};

  const handlePublish = async (taskId) => {
  try {
    await publishTask(taskId);
    fetchTasks();
  } catch (err) {
    console.error(err);
    alert("Publish failed");
  }
};

const fetchTasks = async () => {
  try {
     // clear old data

    let data;

    if (isStrategist) {
      if (page === "tasks") {
        data = await getDesignerActiveTasks(user);
      } else if (page === "completed") {
        data = await getDesignerHistory(user);
      } else if (page === "insights") {
        data = await getDesignerHistory(user); // ✅ for table under charts
      }
    } else {
      if (tab === "active") {
        data = await getDesignerActiveTasks(user);
      } else {
        data = await getDesignerHistory(user);
      }
    }

    setAllTasks(
      (data || []).sort((a, b) => {
  const dateDiff = new Date(a.assign_date) - new Date(b.assign_date);
  if (dateDiff !== 0) return dateDiff;

  return a.id - b.id; // 🔥 stable order
})
    );

  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    let filtered = allTasks;

      // 🔥 STRATEGIST FILTER
    if (user.role === "strategist") {
      filtered = filtered.filter(task =>
        task.strategist_id === user.id &&
        (
          task.ready_for_publish === true ||
          task.stage === "publish" ||
          task.status === "SUBMITTED"
        )
      );
    }

    if (clientFilter) {
      filtered = filtered.filter(t =>
        t.client_name?.toLowerCase().includes(clientFilter.toLowerCase())
      );
    }

    if (contentFilter) {
      filtered = filtered.filter(t =>
        t.content_type?.toLowerCase().includes(contentFilter.toLowerCase())
      );
    }

    setTasks(filtered);

  }, [clientFilter, contentFilter, allTasks]);

  useEffect(() => {
    if (user?.id) fetchTasks();
  }, [user, tab, page]);

useEffect(() => {
  if (!user?.id) return;

  const interval = setInterval(() => {
    fetchTasks();
  }, 5000);

  return () => clearInterval(interval);
}, [user, tab, page]); // 🔥 IMPORTANT

useEffect(() => {
  if (!tasks.length) return;

  const initialComments = {};

  tasks.forEach(task => {
    // ✅ ONLY designers should see previous delay reason
    if (user.role === "designer" && task.reason_for_delay) {
      initialComments[task.id] = task.reason_for_delay;
    }

    // ❌ strategist → DO NOTHING (keep empty)
  });

  setComments(initialComments);

}, [tasks, user.role]);

  return (
    <div className="page-section">

      {/* 🔵 NORMAL EMPLOYEE */}
      {!isStrategist && (
        <>
          <EmployeeInsights tasks={tasks} user={user} />

          <div className="tab-container">
            <div className="tabs">
              <div
                className={`tab ${tab === "active" ? "active" : ""}`}
                onClick={() => setTab("active")}
              >
                Active Tasks
              </div>

              <div
                className={`tab ${tab === "completed" ? "active" : ""}`}
                onClick={() => setTab("completed")}
              >
                Completed Tasks
              </div>

              <div className={`slider ${tab}`} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input
              placeholder="Filter by client"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            />
            <input
              placeholder="Filter by content"
              value={contentFilter}
              onChange={(e) => setContentFilter(e.target.value)}
            />
          </div>

          <div className="section-content">
            {tab === "active" && (
              <TeamTaskTable
                tasks={tasks}
                userRole={user.role}
                comments={comments}
                onCommentChange={handleCommentChange}
                onSave={handleSave}
                onSubmit={handleSubmit}
              />
            )}

            {tab === "completed" && (
              <CompletedTaskTable tasks={tasks} />
            )}
          </div>
        </>
      )}

      {/* 🟣 STRATEGIST */}
      {isStrategist && (
        <div className="section-content">

          {/* 🔵 INSIGHTS PAGE */}
          {page === "insights" && (
            <>
              <EmployeeInsights />

              <div style={{ marginTop: "20px" }}>
                {tasks.length > 0 && (
                  <CompletedTaskTable tasks={tasks} />
                )}
              </div>
            </>
          )}

          {/* 🔵 TASKS PAGE */}
          {page === "tasks" && (
            <TeamTaskTable
              tasks={tasks}
              userRole={user.role}
              comments={comments}
              onCommentChange={handleCommentChange}
              onSave={handleSave}
              onSubmit={handleSubmit}
              onPublish={handlePublish}
            />
          )}

          {/* 🔵 COMPLETED PAGE */}
          {page === "completed" && (
            <CompletedTaskTable tasks={tasks} />
          )}

        </div>
      )}
    </div>
  );
};

export default EmployeeContent;