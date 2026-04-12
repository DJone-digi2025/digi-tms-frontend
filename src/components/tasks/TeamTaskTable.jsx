import "./TaskTable.css";
import React, { useState, useEffect } from "react";

const TeamTaskTable = ({
  tasks,
  userRole,
  comments = {},
  onCommentChange,
  onSubmit,
  onPublish
}) => {

const [uploadedFiles, setUploadedFiles] = useState({});
const [uploading, setUploading] = useState({});

const handleUpload = async (e, taskId) => {
  const file = e.target.files[0];
  if (!file) return;

  // 🔴 START LOADING
  setUploading(prev => ({
    ...prev,
    [taskId]: true
  }));

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(
      "https://digi-tms-backend.onrender.com/upload-output",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    if (data.url) {
      setUploadedFiles(prev => ({
        ...prev,
        [taskId]: data.url
      }));

      await fetch("https://digi-tms-backend.onrender.com/save-output", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          task_id: taskId,
          output_file: data.url
        })
      });

    } else {
      alert("Upload failed");
    }

  } catch (err) {
    console.error(err);
    alert("Upload error");
  }

  // 🔴 STOP LOADING
  setUploading(prev => ({
    ...prev,
    [taskId]: false
  }));
};

useEffect(() => {
  const initialFiles = {};

  tasks.forEach(task => {
    if (task.output_file) {
      initialFiles[task.id] = task.output_file;
    }
  });

  setUploadedFiles(initialFiles);
}, [tasks]);


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
<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>

  {/* Upload Button */}
<label
  className="upload-btn"
  style={{
    opacity: uploading[task.id] ? 0.6 : 1,
    pointerEvents: uploading[task.id] ? "none" : "auto"
  }}
>
  {uploading[task.id] ? "Uploading..." : "Upload"}

  <input
    type="file"
    hidden
    onChange={(e) => handleUpload(e, task.id)}
    disabled={uploading[task.id]}
  />
</label>

  {/* If file exists */}
  {uploadedFiles[task.id] && (
    <>
      <a
        href={uploadedFiles[task.id]}
        target="_blank"
        className="view-btn"
      >
        View
      </a>

      <button
        className="remove-btn"
        onClick={() => {
          setUploadedFiles(prev => {
            const updated = { ...prev };
            delete updated[task.id];
            return updated;
          });
        }}
      >
        Remove
      </button>
    </>
  )}

</div>

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