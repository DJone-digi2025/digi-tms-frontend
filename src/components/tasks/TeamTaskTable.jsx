import "./TaskTable.css";

const TeamTaskTable = ({
  tasks,
  userRole,
  comments = {},
  onCommentChange,
  onSubmit,
  onPublish
}) => {

  const isStrategist = userRole === "strategist";

  console.log("USER ROLE:", userRole);

  return (
    <div className="table-container">
      <table className="task-table">

        {/* HEADER */}
        <thead>
              <tr>
                {isStrategist ? (
                  <>
                    <th>Task Code</th>
                    <th>Assigned Date</th>
                    <th>Priority</th>  
                    <th>Status</th>
                    <th>Delay Reason</th>
                    <th>Manager Comment</th>
                    <th>Your Comment</th>
                  </>
                ) : (
                  <>
                    <th>Client</th>
                    <th>Content</th>
                    <th>Assigned Date</th>
                    <th>Plan Link</th>
                    <th>Plan File</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Delay Reason</th>
                    <th>Manager Comment</th>
                    <th>Your Comment</th>
                  </>
                )}

                <th>Actions</th>
              </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>

  {isStrategist ? (
    <>
      <td>{task.task_code || `#${task.id}`}</td>

      <td>{task.assign_date}</td>

      <td>
        <span
          className={`priority ${
            (task.priority_override || task.priority)?.toLowerCase()
          }`}
        >
          {task.priority_override || task.priority || "normal"}
        </span>
      </td>

      <td>
        <span className={`status ${task.status.toLowerCase()}`}>
          {task.ready_for_publish ? "READY TO PUBLISH" : task.status}
        </span>
      </td>

      <td style={{ color: "red" }}>
        {task.strategist_comment || "—"}
      </td>

      <td style={{ color: "#2563eb" }}>
        {task.manager_comment || "—"}
      </td>

      <td>
<textarea
  id={`comment-${task.id}`}
  value={comments[task.id] || ""}
  onChange={(e) => onCommentChange(task.id, e.target.value)}
/>
      </td>
    </>
  ) : (
    <>
      <td>{task.client_name}</td>
      <td>{task.content_type}</td>
      <td>{task.assign_date}</td>

      <td>
        {task.plan_link ? (
          <a href={task.plan_link} target="_blank" rel="noreferrer">
            View Plan
          </a>
        ) : "-"}
      </td>

      <td>
        {task.plan_file ? (
          <a href={task.plan_file} target="_blank" rel="noreferrer">
            View File
          </a>
        ) : "-"}
      </td>

      <td>{task.description || "-"}</td>

      <td>
<span
  className={`priority ${
    (task.priority_override || task.priority)?.toLowerCase()
  }`}
>
  {task.priority_override || task.priority || "normal"}
</span>
      </td>

      <td>
        <span className={`status ${task.status.toLowerCase()}`}>
          {task.status}
        </span>
      </td>

      <td style={{ color: "red" }}>
        {task.reason_for_delay || "No delay"}
      </td>

      <td style={{ color: "#2563eb" }}>
        {task.manager_comment || "—"}
      </td>

      <td>
        <textarea
          value={comments[task.id] ?? ""}
          onChange={(e) =>
            onCommentChange(task.id, e.target.value)
          }
        />
      </td>
    </>
  )}

              {/* ACTIONS */}
<td>
  <div style={{ display: "flex", gap: "5px" }}>

    {(userRole === "designer" || userRole === "marketing") && (
      <>


        <button
          className="btn-submit"
          onClick={() => onSubmit?.(task.id)}
        >
          Submit
        </button>
      </>
    )}

{userRole === "strategist" && (
  <>
    {task.ready_for_publish ? (
      <button
        className="btn btn-green"
        onClick={() => onPublish(task.id)}
      >
        Publish
      </button>
    ) : (
      <button
        className="btn-submit"
        onClick={() => onSubmit?.(task.id)}
      >
        Submit
      </button>
    )}
  </>
)}

  </div>
</td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
};

export default TeamTaskTable;