import { useState, useEffect } from "react";
import "./TaskTable.css";
import { getTeamStats, reassignTask } from "../../api/taskApi";

const ManagerTaskTable = ({
  tasks,
  page,
  comments = {},
  onCommentChange,
  onApprove,
  onRework,
  onMarkLow,
  onCancel,
  fetchTasks,
  onPriorityOverride
}) => {

  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [teamStats, setTeamStats] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const [toast, setToast] = useState("");
  const [highlightIds, setHighlightIds] = useState([]); // 🔥 persistent highlight

  // ✅ Fetch stats only when modal opens
  useEffect(() => {
    if (showModal) {
      fetchStats();
    }
  }, [showModal]);

  const fetchStats = async () => {
    try {
      const data = await getTeamStats();
      setTeamStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="table-container">

      <table className="task-table">
<thead>
<tr>
  {page === "history" ? (
    <>
      <th>Task Code</th>
      <th>Assigned To</th>
      <th>Assigned Date</th>
      <th>Stage</th>
      <th>Status</th>
      <th>Completed At</th>
      <th>Published At</th>
    </>
  ) : (
    <>
      <th>Task Code</th>
      <th>Assigned To</th>
      <th>Assigned Date</th>
      <th>Status</th>
      <th>Stage</th>

      {page === "tasks" && (
        <>
          <th>Priority</th>
          <th>Actions</th>
        </>
      )}

      {page === "evaluation" && (
        <>
          <th>Priority</th>        
          <th>Team Comment</th>
          <th>Manager Comment</th>
          <th>Actions</th>
        </>
      )}
    </>
  )}
</tr>
        </thead>

          <tbody>
            {tasks.map((task) => (

<tr
  key={task.id}
  className={highlightIds.includes(task.id) ? "highlight-row" : ""}
>
  {page === "history" ? (
    <>
      <td style={{ fontWeight: 600, color: "#111827" }}>
        {task.task_code || `#${task.id}`}
      </td>

      <td>
        {task.stage === "publish"
          ? task.strategist?.name || "-"
          : task.team_members?.name || task.strategist?.name || "-"}
      </td>

      <td>
        {task.assign_date
          ? new Date(task.assign_date).toLocaleDateString()
          : "-"}
      </td>

      <td style={{ fontWeight: 500 }}>
        {task.stage === "publish" ? "Publish" : "Design"}
      </td>

      <td>
        <span className={`status ${task.status.toLowerCase()}`}>
          {task.status}
        </span>
      </td>

      <td>
        {task.completed_at
          ? new Date(task.completed_at).toLocaleDateString()
          : "-"}
      </td>

      <td>
        {task.published_at
          ? new Date(task.published_at).toLocaleDateString()
          : "-"}
      </td>
    </>
  ) : (
    <>
      <td style={{ fontWeight: 600, color: "#111827" }}>
        {task.task_code || `#${task.id}`}
      </td>
  
      <td>
        {task.stage === "publish"
          ? task.strategist?.name || "-"
          : task.team_members?.name || task.strategist?.name || "-"}
      </td>

      <td>
        {task.assign_date
          ? new Date(task.assign_date).toLocaleDateString()
          : "-"}
      </td>

      <td>
        <span className={`status ${task.status.toLowerCase()}`}>
          {task.ready_for_publish ? "READY TO PUBLISH" : task.status}
        </span>
      </td>

      <td style={{ fontWeight: 500 }}>
        {task.stage === "publish" ? "Publish" : "Design"}
      </td>

      {/* TASKS PAGE */}
      {page === "tasks" && (
        <>
          <td>
<span
  className={`priority ${
    (task.priority_override || task.priority)?.toLowerCase()
  }`}
>
  {task.priority_override || task.priority}
</span>
          </td>

          <td>
<select
  className="action-select"
  onChange={(e) => {
    const action = e.target.value;

    // 🔹 NEW OVERRIDE
    if (action === "high") onPriorityOverride(task.id, "high");
    console.log("CALLING OVERRIDE", task.id);
    if (action === "low") onPriorityOverride(task.id, "low");
    if (action === "clear") onPriorityOverride(task.id, null);

    // 🔹 EXISTING LOGIC (dependency)
    if (action === "prioz_low") onMarkLow(task.id);

    if (action === "cancel") onCancel(task.id);

    if (action === "reassign") {
      setSelectedTask(task);
      setShowModal(true);
    }

    e.target.value = "";
  }}
>
  <option value="">Actions</option>

  <option value="high">High</option>
  <option value="low">Low</option>

  <option value="prioz_low">Prioz Low</option>

  <option value="clear">Clear Override</option>
  <option value="reassign">Reassign</option>
  <option value="cancel">Cancel</option>
</select>
          </td>
        </>
      )}
    </>
  )}

                {/* EVALUATION PAGE */}
                {page === "evaluation" && (
                  <>
<td>
  <span
    className={`priority ${
      (task.priority_override || task.priority)?.toLowerCase()
    }`}
  >
    {task.priority_override || task.priority || "-"}
  </span>
</td>

<td style={{ color: "#374151", fontWeight: 500 }}>
  {task.strategist_comment || task.reason_for_delay || "-"}
</td>

                    <td>
                      <textarea
                        value={(comments || {})[task.id] ?? ""}
                        onChange={(e) =>
                          onCommentChange(task.id, e.target.value)
                        }
                        placeholder="Add comment..."
                      />
                    </td>

                    <td style={{ display: "flex", gap: "6px" }}>
                      <button className="btn btn-green" onClick={() => onApprove(task.id)}>
                        Complete
                      </button>

                      <button className="btn btn-red" onClick={() => onRework(task.id)}>
                        Rework
                      </button>
                    </td>
                  </>
                )}
              </tr>
              
            ))}
          </tbody>

      </table>

      {/* 🔥 TOAST */}
      {toast && (
        <div className="toast">
          {toast}
        </div>
      )}

      {/* 🔥 REASSIGN MODAL */}
      {showModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>

            <h3>Reassign Task</h3>

            <p><b>Client:</b> {selectedTask.client_name}</p>
            <p><b>Content:</b> {selectedTask.content_type}</p>

            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select Member</option>
              {teamStats.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            {/* 🔥 SHOW STATS */}
            {selectedUser && (
              <div style={{ marginTop: "10px" }}>
                {teamStats
                  .filter((m) => m.id == selectedUser)
                  .map((m) => (
                    <div key={m.id}>
                      <p>Total Tasks: {m.total}</p>
                      <p>Pending: {m.pending}</p>
                      <p>Skill: {m.skill}</p>
                    </div>
                  ))}
              </div>
            )}

            <button
              style={{ marginTop: "10px" }}
              onClick={async () => {
                if (!selectedUser) return alert("Select a member");

                try {
                  await reassignTask(selectedTask.id, selectedUser);

                  // ✅ Show toast + highlight immediately
                  setToast("Task reassigned successfully ✅");
                  setHighlightIds((prev) => [...prev, selectedTask.id]);

                  setShowModal(false);
                  setSelectedUser("");

                  // ✅ Delay refresh so UI shows feedback
                  setTimeout(() => {
                    fetchTasks && fetchTasks();
                  }, 500);

                  // ✅ Remove toast only (NOT highlight)
                  setTimeout(() => {
                    setToast("");
                  }, 3000);

                } catch (err) {
                  console.error(err);
                  setToast("Failed to reassign task ❌");
                }
              }}
            >
              Confirm
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default ManagerTaskTable;