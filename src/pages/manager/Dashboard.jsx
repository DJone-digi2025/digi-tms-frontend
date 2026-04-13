import { useEffect, useState } from "react";
import { getManagerTasks, approveTask, reworkTask } from "../../api/taskApi";
import { getManagerHistory } from "../../api/taskApi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getTeamMembers } from "../../api/taskApi";
import "./Dashboard.css";
import MainLayout from "../../layouts/MainLayout";
import ManagerInsights from "./ManagerInsights";
import { createTask } from "../../api/taskApi";
import { cancelTask } from "../../api/taskApi";
import { markTaskLow } from "../../api/taskApi";
import ManagerTaskTable from "../../components/tasks/ManagerTaskTable";
import PlansSection from "../../components/tasks/PlansSection";
import { getAssignDatePreview } from "../../api/taskApi";
import { pauseTasks, pauseUsers } from "../../api/taskApi";
import { setPriorityOverride } from "../../api/taskApi";
import { CalendarClock } from "lucide-react";
import MeetingsSection from "../strategist/MeetingsSection";
import BillingSection from "../strategist/BillingSection";

const Dashboard = () => {

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState("tasks");
  const [showLowModal, setShowLowModal] = useState(false);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState({});
  const [members, setMembers] = useState([]);
  const [previewDate, setPreviewDate] = useState("");
  const [selectedEmergencyTask, setSelectedEmergencyTask] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [delayType, setDelayType] = useState("");
  const [delayTarget, setDelayTarget] = useState("");
  const [delayAction, setDelayAction] = useState("");
  const [delayToast, setDelayToast] = useState("");
  const [filters, setFilters] = useState({
    assigned_to: "",
    client_name: "",
    publish_date: "",
    priority: "",
    assigned_date: "",
    completed_at: "",
    status: ""
  });

  const [showModal, setShowModal] = useState(false);
const [newTask, setNewTask] = useState({
  client_name: "",
  content_type: "",
  custom_content_type: "",
  assigned_to: "",
  priority: "",
  publish_date: "",
  requires_plan: true   // 🔥 ADD THIS
});

const handleCreateChange = (e) => {
  const { name, value } = e.target;

  // 🔥 If role changes → reset member
  if (name === "assigned_to_role") {
    setNewTask(prev => ({
      ...prev,
      assigned_to_role: value,
      assigned_to: "" // ✅ RESET MEMBER
    }));
    return;
  }

  setNewTask(prev => ({
    ...prev,
    [name]: value
  }));
};

  const handleCreateTask = async () => {
    // 🔥 VALIDATION HERE ONLY
    if (!newTask.publish_date) {
      alert("Publish date is required");
      return;
    }

if (
  !newTask.client_name ||
  !newTask.assigned_to ||
  !newTask.assigned_to_role ||   // ✅ ADD THIS
  !newTask.priority
) {
  alert("Fill all required fields");
  return;
}

try {

  // 🔥 VALIDATION (add this first)

  if (newTask.client_name === "custom" && !newTask.custom_client_name) {
    alert("Enter custom client name");
    return;
  }

  if (newTask.content_type === "custom" && !newTask.custom_content_type) {
    alert("Enter custom content type");
    return;
  }

  // 🔥 TRANSFORM DATA
  const finalClientName =
    newTask.client_name === "custom"
      ? newTask.custom_client_name?.trim()
      : newTask.client_name;

  const finalData = {
    ...newTask,
    client_name: finalClientName,
    content_type:
      newTask.content_type === "custom"
        ? newTask.custom_content_type?.toLowerCase().trim()
        : newTask.content_type,
      
        strategist_id: user.id
  };

  // 🔥 SEND CORRECT DATA
  await createTask(finalData);

  alert("Task created");
  setShowModal(false);
  fetchTasks();

} catch (err) {
  console.error(err);
}
  };

  useEffect(() => {
    const fetchPreview = async () => {
      if (
        !newTask.publish_date ||
        !newTask.priority ||
        !newTask.content_type
      ) {
        setPreviewDate("");
        return;
      }

      try {
        const res = await getAssignDatePreview({
          publish_date: newTask.publish_date,
          priority: newTask.priority,
          content_type: newTask.content_type
        });

        setPreviewDate(res.assign_date);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPreview();
  }, [newTask.publish_date, newTask.priority, newTask.content_type]);

  const getTitle = () => {
    switch (page) {
      case "tasks":
        return "Tasks";
      case "evaluation":
        return "Evaluation";
      case "history":
        return "History";
      case "manager-insights":
        return "Manager Insights";
      case "plans":
        return "Plans";
      default:
        return "";
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleCancel = async (taskId) => {
    if (!confirm("Are you sure to cancel this task?")) return;

    try {
      await cancelTask(taskId);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkLowClick = (taskId) => {
    setSelectedTaskId(taskId);
    setShowLowModal(true);
  };

  const handleConfirmLow = async () => {
    if (!selectedEmergencyTask) {
      alert("Select a task");
      return;
    }

    try {
      await markTaskLow(selectedEmergencyTask);

      setShowEmergencyModal(false);
      setSelectedEmergencyTask("");

      fetchTasks(); // refresh

    } catch (err) {
      console.error(err);
    }
  };

const fetchTasks = async () => {
  try {
    setLoading(true);

    let data;

    if (page === "history") {
      data = await getManagerHistory();

      let filtered = data;

      if (filters.client_name) {
        filtered = filtered.filter((t) =>
          t.client_name
            .toLowerCase()
            .includes(filters.client_name.toLowerCase())
        );
      }

      if (filters.assigned_to) {
        filtered = filtered.filter(
          (t) => t.team_member_id === filters.assigned_to
        );
      }

      if (filters.completed_at) {
        filtered = filtered.filter((t) =>
          (t.completed_at || t.completed_at)
            ?.startsWith(filters.completed_at)
        );
      }

      setTasks(filtered);

    } else {
      // 🔥 THIS WAS MISSING
const { priority, ...restFilters } = filters;

data = await getManagerTasks({
  page,
  ...restFilters
});

      setTasks(data);
    }

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};
  
  useEffect(() => {
  setTasks([]); // 🔥 clears stale data
  setStatusFilter("");
  setStageFilter("");
}, [page]);


  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getTeamMembers();
        setMembers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMembers();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [page, filters]);

  const handleCommentChange = (taskId, value) => {
    setComments((prev) => ({
      ...prev,
      [taskId]: value,
    }));
  };

  const handleApprove = async (taskId) => {
    try {
      await approveTask(taskId);
      alert("Task completed");
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRework = async (taskId) => {
    try {
      await reworkTask(taskId, comments[taskId] || null); // ✅ optional
      alert("Marked for rework");
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const getStats = () => {
    const total = tasks.length;

    const pending = tasks.filter(
      (t) => t.status === "ASSIGNED" || t.status === "SUBMITTED" || t.status === "REWORK"
    ).length;

    const completed = tasks.filter(
      (t) => t.status === "COMPLETED"
    ).length;

    const rework = tasks.filter(
      (t) => t.status === "REWORK"
    ).length;

    return { total, pending, completed, rework };
  };

const stats = getStats();

let filteredTasks = tasks;

const getPriorityValue = (task) => {
  const p = (task.priority_override || task.priority || "").toLowerCase();
  if (p === "high") return 3;
  if (p === "normal") return 2;
  if (p === "low") return 1;
  return 0;
};

filteredTasks = [...filteredTasks].sort((a, b) => {
  // 🔥 Priority first
  const prioDiff = getPriorityValue(b) - getPriorityValue(a);
  if (prioDiff !== 0) return prioDiff;

  // 🔥 Then newest first
  return (b.id || 0) - (a.id || 0);
});

if (filters.priority) {
  filteredTasks = filteredTasks.filter(t =>
    (t.priority_override || t.priority)
      ?.toLowerCase() === filters.priority.toLowerCase()
  );
}

if (statusFilter) {
  filteredTasks = filteredTasks.filter(
    t => t.status === statusFilter
  );
}

if (stageFilter) {
  filteredTasks = filteredTasks.filter((t) => {
    const stage = (t.stage || "design").toLowerCase();

    // 🔥 FIX: treat completed as publish
    if (stage === "completed") {
      return stageFilter === "publish";
    }

    return stage === stageFilter.toLowerCase();
  });
}

useEffect(() => {
  if (delayToast) {
    const t = setTimeout(() => setDelayToast(""), 3000);
    return () => clearTimeout(t);
  }
}, [delayToast]);

const handlePriorityOverride = async (taskId, priority) => {
  try {
    await setPriorityOverride(taskId, priority);
    fetchTasks();
  } catch (err) {
    console.error(err);
    alert("Failed to update priority");
  }
};

return (
  <MainLayout page={page} setPage={setPage}>

      {/* MANAGER INSIGHTS */}
    {page === "manager-insights" && (
      <ManagerInsights tasks={tasks} />
    )}

    {/* TASKS */}
{page === "tasks" && (
  <div className="page-section">

    {/* HEADER */}
    <div className="section-header">
      <div className="section-header-left">
        <h2>Tasks</h2>
        <p>Manage and track all assigned tasks</p>
      </div>

<div className="section-header-right" style={{ display: "flex", gap: "10px" }}>

  <button
    className="secondary-btn"
    onClick={() => setShowDelayModal(true)}
  >
    Delay Control
  </button>

  <button
    className="primary-btn"
    onClick={() => setShowModal(true)}
  >
    + Create Task
  </button>

</div>
    </div> 

    <div className="stats-grid">

  <div className="stat-card">
    <div className="stat-title">Total Tasks</div>
    <div className="stat-value">{stats.total}</div>
  </div>

  <div className="stat-card">
    <div className="stat-title">Pending</div>
    <div className="stat-value yellow">{stats.pending}</div>
  </div>

  <div className="stat-card">
    <div className="stat-title">Completed</div>
    <div className="stat-value green">{stats.completed}</div>
  </div>

  <div className="stat-card">
    <div className="stat-title">Rework</div>
    <div className="stat-value red">{stats.rework}</div>
  </div>

</div>

    {/* FILTERS */}
    <div className="filter-bar">
<div className="custom-dropdown">
  <div
    className="dropdown-selected"
    onClick={() => setShowMemberDropdown(prev => !prev)}
  >
    {filters.assigned_to || "All Members"}
    <span className="arrow">▾</span>
  </div>

  {showMemberDropdown && (
    <div className="dropdown-menu">
      <div
        className="dropdown-item"
        onClick={() => {
          setFilters({ ...filters, assigned_to: "" });
          setShowMemberDropdown(false);
        }}
      >
        All Members
      </div>

      {members.map((m) => (
        <div
          key={m.id}
          className={`dropdown-item ${
            filters.assigned_to === m.name ? "active" : ""
          }`}
          onClick={() => {
            setFilters({ ...filters, assigned_to: m.name });
            setShowMemberDropdown(false);
          }}
        >
          {m.name}
        </div>
      ))}
    </div>
  )}
</div>

      <input
        type="text"
        name="client_name"
        placeholder="Client"
        onChange={handleFilterChange}
      />

      <input
        type="date"
        name="publish_date"
        onChange={handleFilterChange}
      />

      <select name="priority" onChange={handleFilterChange}>
        <option value="">All Priority</option>
        <option value="high">High</option>
        <option value="normal">Normal</option>
        <option value="low">Low</option>
      </select>

     <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
  <option value="">All Status</option>
  <option value="ASSIGNED">Assigned</option>
  <option value="SUBMITTED">Submitted</option>
  <option value="COMPLETED">Completed</option>
</select>

<select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
  <option value="">All Stage</option>
  <option value="design">Design</option>
  <option value="publish">Publish</option>
</select>

    </div>

    {/* CONTENT */}
    <div className="section-content">
      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">No tasks found</div>
      ) : (
        <ManagerTaskTable
          tasks={filteredTasks}
          page={page}
          comments={comments}
          onCommentChange={handleCommentChange}
          onApprove={handleApprove}
          onRework={handleRework}
          onMarkLow={handleMarkLowClick}
          onCancel={handleCancel}
          fetchTasks={fetchTasks}
          onPriorityOverride={handlePriorityOverride}
        />
      )}
    </div>

  </div>
)}

    {/* EVALUATION */}
{page === "evaluation" && (
  <div className="page-section">

    <div className="section-header">
      <div>
        <h2>Evaluation</h2>
        <p>Review submitted tasks and take action</p>
      </div>
    </div>

    <div className="filter-bar">
      <input
        type="date"
        name="assigned_date"
        onChange={handleFilterChange}
      />

      <select name="status" onChange={handleFilterChange}>
        <option value="">All Status</option>
        <option value="SUBMITTED">Submitted</option>
        <option value="REWORK">Rework</option>
      </select>

<div className="select-wrapper">
  <select
    name="assigned_to"
    className="filter-select"
    onChange={handleFilterChange}
  >
    <option value="">All Members</option>
    {members.map((m) => (
      <option key={m.id} value={m.name}>{m.name}</option>
    ))}
  </select>
</div>

      <input
        type="text"
        name="client_name"
        placeholder="Client"
        onChange={handleFilterChange}
      />
    </div>

    <div className="section-content">
      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">No tasks found</div>
      ) : (
        <ManagerTaskTable
          tasks={tasks}
          page={page}
          comments={comments}
          onCommentChange={handleCommentChange}
          onApprove={handleApprove}
          onRework={handleRework}
          fetchTasks={fetchTasks}
          onPriorityOverride={handlePriorityOverride}

        />
      )}
    </div>

  </div>
)}

    {/* HISTORY */}
  {page === "history" && (
  <div className="page-section">

    <div className="section-header">
      <div>
        <h2>History</h2>
        <p>Track completed and past tasks</p>
      </div>
    </div>

    <div className="filter-bar">
<div className="select-wrapper">
  <select
    name="assigned_to"
    className="filter-select"
    onChange={handleFilterChange}
  >
    <option value="">All Members</option>
    {members.map((m) => (
      <option key={m.id} value={m.id}>{m.name}</option>
    ))}
  </select>

  <select
  value={stageFilter}
  onChange={(e) => setStageFilter(e.target.value)}
>
  <option value="">All Stage</option>
  <option value="design">Design</option>
  <option value="publish">Publish</option>
</select>
</div>

      <input
        type="text"
        name="client_name"
        placeholder="Client"
        onChange={handleFilterChange}
      />

      <input
        type="date"
        name="completed_at"
        onChange={handleFilterChange}
      />
    </div>

    <div className="section-content">
      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">No tasks found</div>
      ) : (
        <ManagerTaskTable
          tasks={filteredTasks}
          page={page}
          comments={comments}
          onCommentChange={handleCommentChange}
          onApprove={handleApprove}
          onRework={handleRework}
          fetchTasks={fetchTasks}
          onPriorityOverride={handlePriorityOverride}
        />
      )}
    </div>

  </div>
)}

    {/* TRASH */}
{page === "trash" && (
  <div className="page-section">

    <div className="section-header">
      <div>
        <h2>Trash</h2>
        <p>View cancelled or removed tasks</p>
      </div>
    </div>

    <div className="section-content">
      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : tasks.filter(t => t.status === "CANCELLED").length === 0 ? (
        <div className="empty-state">No cancelled tasks</div>
      ) : (
        <ManagerTaskTable
          tasks={tasks.filter(t => t.status === "CANCELLED")}
          page="trash"
        />
      )}
    </div>

  </div>
)}


    {page === "meetings" && (
      <div className="page-section">
        <div className="section-header">
          <h2>Meetings</h2>
          <p>Schedule and manage meetings</p>
        </div>

        <div className="section-content">
          <MeetingsSection />
        </div>
      </div>
    )}

{page === "billing" && (
  <div className="page-section">
    <div className="section-header">
      <h2>Billing</h2>
      <p>Manage client billing</p>
    </div>

    <div className="section-content">
      <BillingSection page={page} />
    </div>
  </div>
)}

    {/* PLANS */}
    {page === "plans" && (
      <div className="section">
        <div className="section-title">Plans</div>

        <PlansSection />
      </div>
    )}



{/* 🔥 CREATE MODAL */}
  {showModal && (
    <div className="modal-overlay">
      <div className="modal">

        <h3>Create Task</h3>

        {/* CLIENT */}
        <select name="client_name" onChange={handleCreateChange}>
          <option value="">Select Client</option>
          {[...new Set(tasks.map(t => t.client_name))].map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
          <option value="custom">Custom</option> 
        </select>

        {newTask.client_name === "custom" && (
          <input
            type="text"
            placeholder="Enter custom client name"
            name="custom_client_name"
            onChange={handleCreateChange}
          />
        )}

        {/* CONTENT */}
        <select name="content_type" onChange={handleCreateChange}>
          <option value="">Select Content</option>
          <option value="reel">Reel</option>
          <option value="post">Post</option>
          <option value="carousel">Carousel</option>
          <option value="custom">Custom</option>
        </select>

        
        {newTask.content_type === "custom" && (
           <input
             type="text"
             placeholder="Enter custom content type"
             name="custom_content_type"
             onChange={handleCreateChange}
           />
        )}

<select name="assigned_to_role" onChange={handleCreateChange}>
  <option value="">Select Role</option>
  <option value="designer">Designer</option>
  <option value="strategist">Strategist</option>
</select>

        {/* MEMBER */}
<select
  name="assigned_to"
  onChange={handleCreateChange}
  disabled={!newTask.assigned_to_role} // ✅ important
>
  <option value="">Select Member</option>
  {members
    .filter(m => m.role?.toLowerCase() === newTask.assigned_to_role)
    .map(m => (
      <option key={m.id} value={m.name}>{m.name}</option>
    ))
  }
</select>

        {/* 🔥 PRIORITY */}
        <select name="priority" onChange={handleCreateChange}>
          <option value="">Select Priority</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>

        {/* 🔥 PUBLISH DATE (REQUIRED) */}
        <input
          type="date"
          name="publish_date"
          onChange={handleCreateChange}
        />
<label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
  <input
    type="checkbox"
    name="requires_plan"
    checked={newTask.requires_plan}
    onChange={(e) =>
      setNewTask(prev => ({
        ...prev,
        requires_plan: e.target.checked
      }))
    }
  />
  Requires Plan
</label>

        {previewDate && (
          <div style={{
            background: "#eef2ff",
            padding: "8px",
            borderRadius: "6px",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <CalendarClock size={16} />
            Will be assigned on: <b>{previewDate}</b>
          </div>
        )}

        <div style={{ marginTop: "10px" }}>
          <button className="btn btn-green" onClick={handleCreateTask}>
            Create
          </button>

          <button
            className="btn btn-red"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  )}

{showDelayModal && (
  <div className="modal-overlay">
    <div className="modal">

      <h3>Delay Control</h3>

      {/* TYPE */}
      <select
        value={delayType}
        onChange={(e) => {
          setDelayType(e.target.value);
          setDelayTarget("");
        }}
      >
        <option value="">Select Type</option>
        <option value="task">Task</option>
        <option value="user">Person</option>
      </select>

      {/* TARGET */}
      <select
        value={delayTarget}
        onChange={(e) => setDelayTarget(e.target.value)}
        disabled={!delayType}
      >
        <option value="">Select Target</option>

        {delayType === "task" &&
          tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.task_code || t.id}
            </option>
          ))}

        {delayType === "user" &&
          members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
      </select>

      {/* ACTION */}
      <select
          value={delayAction}
          onChange={(e) => setDelayAction(e.target.value)}
        >
        <option value="">Select Action</option>
        <option value="pause">Pause</option>
        <option value="resume">Resume</option>
      </select>

      <div style={{ marginTop: "10px" }}>
       
<button
  className="btn btn-green"
  disabled={!delayType || !delayTarget || !delayAction}
  onClick={async () => {



    try {
      const isPause = delayAction === "pause";

      if (delayType === "task") {
        await pauseTasks([delayTarget], isPause);
      }

      if (delayType === "user") {
        await pauseUsers([delayTarget], isPause);
      }

setDelayToast(
  `${delayAction === "pause" ? "Paused" : "Resumed"} successfully`
);

      setShowDelayModal(false);
      setDelayType("");
      setDelayTarget("");
      setDelayAction("");

      fetchTasks(); // refresh

    } catch (err) {
      console.error(err);
      alert("Action failed");
    }

  }}
>
  Apply
</button>

        <button
          className="btn btn-red"
          onClick={() => {
  setShowDelayModal(false);
  setDelayType("");
  setDelayTarget("");
  setDelayAction("");
}}
>
          Cancel
        </button>
      </div>

    </div>
  </div>
)}

      {showLowModal && (
      <div className="modal-overlay">
        <div className="modal">

          <h3>Select Emergency Task</h3>

            <select
              value={selectedEmergencyTask}
              onChange={(e) => setSelectedEmergencyTask(e.target.value)}
            >
            <option value="">Select High Priority Task</option>

            {tasks
              .filter(t => t.priority === "high")
              .map(t => (
                <option key={t.id} value={t.id}>
                  {t.client_name} - {t.content_type}
                </option>
              ))}
          </select>

            <div className="modal-actions">
              <button
                className="btn-confirm"
                disabled={!selectedEmergencyTask}
                onClick={handleConfirmLow}
              >
                Confirm
              </button>

              <button
                className="btn-cancel"
                onClick={() => setShowLowModal(false)}
              >
                Cancel
              </button>
            </div>

        </div>
      </div>
    )}
   {/* GLOBAL TOAST */}
<div style={{ position: "fixed", top: "20px", right: "20px", zIndex: 9999 }}>
  {delayToast && <div className="toast">{delayToast}</div>}
</div>

  </MainLayout>
);
};

export default Dashboard;