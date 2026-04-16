import { useState, useEffect } from "react";
import EmployeeInsights from "./EmployeeInsights";
import { getDesignerActiveTasks, getDesignerHistory } from "../../api/taskApi";
import { useAuth } from "../../context/AuthContext";
import "./EmployeeDashboard.css";
import TeamTaskTable from "../../components/tasks/TeamTaskTable";
import PlansSection from "../../components/tasks/PlansSection";
import { saveComment, submitTask, publishTask } from "../../api/taskApi";
import CompletedTaskTable from "../../components/tasks/CompletedTaskTable";
import StrategistTeam from "../strategist/StrategistTeam.jsx";

const EmployeeContent = ({ page }) => {
  const { user } = useAuth();

  const isStrategist = user?.role?.toLowerCase() === "strategist";

  const [tab, setTab] = useState("active");
  const [allTasks, setAllTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState({});
  const [clientFilter, setClientFilter] = useState("");
  const [contentFilter, setContentFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [showPendingBefore, setShowPendingBefore] = useState(false);

const handleCommentChange = async (taskId, value) => {

  // ✅ 1. update UI instantly
  setComments((prev) => ({
    ...prev,
    [taskId]: value
  }));

  // ✅ 2. save to DB (IMPORTANT)
  try {
    await fetch(`https://digi-tms-backend.onrender.com/tasks/${taskId}/save-reason`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        comment: value,
        user_role: user.role   // 🔥 IMPORTANT (dynamic)
      })
    });
  } catch (err) {
    console.error("Comment save failed", err);
  }
};

  
const handleSubmit = async (taskId) => {
  try {
    const task = tasks.find(t => t.id === taskId);

    console.log("🔥 HANDLE SUBMIT CALLED:", taskId);

    // 🔥 get latest input value directly
    const input = document.getElementById(`comment-${taskId}`);
    const currentValue = input?.value?.trim();

    // 🔥 SAVE COMMENT FIRST (if exists)
    if (currentValue) {
      await saveComment(taskId, currentValue, user.role);
    }

    const today = new Date();
    const assignDate = new Date(task.assign_date);

    today.setHours(0,0,0,0);
    assignDate.setHours(0,0,0,0);

    const isDelayed = !task.completed_at && today > assignDate;

    // ✅ strategist: no delay validation
    if (user.role === "strategist") {
      await submitTask(taskId,currentValue);
      fetchTasks();
      return;
    }

    // ✅ delay validation only for non-strategist
// ✅ always allow submit
await submitTask(taskId, currentValue || null);
fetchTasks();

    // ✅ normal submit
    await submitTask(taskId);
    fetchTasks();

  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "Submit failed");
  }
};

const handlePublish = async (taskId) => {
  try {
    const input = document.getElementById(`comment-${taskId}`);
    const comment = input?.value?.trim();

    // 🔥 save comment first (if exists)
    if (comment) {
      await saveComment(taskId, comment, user.role);
    }

    // 🔥 then publish
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

const getPriorityValue = (task) => {
  const p = (task.priority_override || task.priority || "").toLowerCase();
  if (p === "high") return 3;
  if (p === "normal") return 2;
  if (p === "low") return 1;
  return 0;
};

setAllTasks(
  [...(data || [])].sort((a, b) => {
    // 🔥 1. Priority first
    const prioDiff = getPriorityValue(b) - getPriorityValue(a);
    if (prioDiff !== 0) return prioDiff;

    // 🔥 2. Newest first
    return (b.id || 0) - (a.id || 0);
  })
);

  } catch (err) {
    console.error(err);
  }
};

  useEffect(() => {
    let filtered = allTasks;

    // 🔥 DATE FILTER
    if (selectedDate) {
      const selected = new Date(selectedDate);
      selected.setHours(0,0,0,0);

      filtered = filtered.filter(task => {
        const taskDate = new Date(task.assign_date);
        taskDate.setHours(0,0,0,0);

        // ✅ Exact date
        if (taskDate.getTime() === selected.getTime()) {
          return true;
        }

        // ✅ Previous pending (if enabled)
        if (
          showPendingBefore &&
          taskDate < selected &&
          task.status !== "COMPLETED" &&
          task.status !== "CANCELLED"
        ) {
          return true;
        }

        return false;
      });
    }

      // 🔥 STRATEGIST FILTER
if (user.role === "strategist") {
  filtered = filtered.filter(task => {

    // ❌ remove cancelled
    if ((task.status || "").toUpperCase() === "CANCELLED") return false;

    // ❌ must belong to strategist
    if (task.strategist_id !== user.id) return false;

    // ✅ workflow tasks ONLY after approval
    if (task.ready_for_publish === true) return true;

    if (task.stage === "publish") return true;

    // ✅ manual tasks ONLY if directly assigned to strategist
    if (
      task.is_manual === true &&
      (task.team_member_id === null || task.team_member_id === user.id)
    ) {
      return true;
    }

    return false;
  });
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

  setComments(prev => {
    const updated = { ...prev };

tasks.forEach(task => {

  // ✅ designer
  if (
    user.role === "designer" &&
    task.reason_for_delay &&
    !updated[task.id]
  ) {
    updated[task.id] = task.reason_for_delay;
  }

  // ✅ strategist
  if (
    user.role === "strategist" &&
    task.strategist_comment &&
    !updated[task.id]
  ) {
    updated[task.id] = task.strategist_comment;
  }

});

    return updated;
  });

}, [tasks, user.role]);



  return (
    <div className="page-section">

<div className="filter-bar">

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

  <div className="date-filter">
    <input
      type="date"
      value={selectedDate}
      onChange={(e) => setSelectedDate(e.target.value)}
    />

    <label className="pending-toggle">
      <input
        type="checkbox"
        checked={showPendingBefore}
        onChange={(e) => setShowPendingBefore(e.target.checked)}
      />
      Pending Before
    </label>
  </div>

</div>


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



          <div className="section-content">
            {tab === "active" && (
              <TeamTaskTable
                tasks={tasks}
                userRole={user.role}
                comments={comments}
                onCommentChange={handleCommentChange}
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
              onSubmit={handleSubmit}
              onPublish={handlePublish}
            />
          )}

          {/* 🔵 COMPLETED PAGE */}
          {page === "completed" && (
            <CompletedTaskTable tasks={tasks} />
          )}

{page === "team" && (
  <StrategistTeam />
)}

        </div>
      )}
    </div>
  );
};

export default EmployeeContent;