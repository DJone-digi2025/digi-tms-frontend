import { useState, useEffect } from "react";
import {
  getAllTasks,
  updatePlanLink,
  getClients,
  uploadPlanCSV
} from "../../api/taskApi";
import { useAuth } from "../../context/AuthContext";
import "./plans.css";
import { uploadPlanFile } from "../../api/taskApi";

const PlansSection = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({});

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientFilter, setClientFilter] = useState("");

  const fetchTasks = async () => {

    console.log("FETCH STARTED");

  if (!user) return;   // 🔥 ADD THIS

  const allTasks = await getAllTasks();

  console.log("RAW TASKS:", allTasks);

  console.log("ALL TASKS:", allTasks);
  console.log("USER ID:", user.id);
  console.log("TASK STRATEGIST IDS:", allTasks.map(t => t.strategist_id));

    let filtered = allTasks;


const sorted = filtered
  .filter(t => t.publish_date) // 🔥 prevent crash
  .sort((a, b) => {
    const dateA = new Date(a.publish_date);
    const dateB = new Date(b.publish_date);

    if (dateA.getTime() === dateB.getTime()) {
      return a.id - b.id;
    }

    return dateA - dateB;
  });

    let finalData = sorted;

    if (clientFilter) {
      finalData = sorted.filter(
        (t) => t.client_name === clientFilter
      );
    }

    console.log("FINAL TASKS:", finalData);

    setTasks(finalData);
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  useEffect(() => {
  if (clientFilter) {
    fetchTasks();
  }
}, [clientFilter]);

  const handleChange = (taskId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value
      }
    }));
  };

  const handleFileChange = (taskId, file) => {
    setFormData((prev) => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        file
      }
    }));
  };

  const handleSave = async (taskId) => {
    try {
      const data = formData[taskId] || {};
      const existingTask = tasks.find(t => t.id === taskId);

      let fileUrl = existingTask?.plan_file || null;

      // only upload if new file selected
      if (data.file) {
        fileUrl = await uploadPlanFile(data.file);
      }

      await updatePlanLink({
        task_id: taskId,
        plan_link: data.link ?? existingTask?.plan_link ?? null,
        plan_file: fileUrl,
        description: data.description ?? existingTask?.description ?? null
      });

      // 🔥 reset only this row
      setFormData((prev) => ({
        ...prev,
        [taskId]: {}
      }));

      fetchTasks();

    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Select CSV file");

    setLoading(true);
    setMessage("Uploading...");

    try {
      const res = await uploadPlanCSV(
        file,
        user.name,
        user.role.toLowerCase()
      );

      setMessage(res.message || "Upload successful");
      setFile(null);
      fetchTasks();

    } catch (err) {
      console.error(err);
      setMessage("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="plans-container">

      {/* 🔥 UPLOAD CARD */}
      <div className="upload-card">

        <div className="upload-header">
          <h3>Upload Monthly Plan</h3>
          <p>Upload CSV to generate tasks automatically</p>
        </div>

        <div className="upload-actions">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <button
            className="btn btn-green"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {message && (
          <p className={`upload-message ${message.includes("fail") ? "error" : "success"}`}>
            {message}
          </p>
        )}

      </div>

      <div className="plans-filter">
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
        >
          <option value="">All Clients</option>

          {[...new Set(tasks.map(t => t.client_name))].map((client) => (
            <option key={client} value={client}>
              {client}
            </option>
          ))}
        </select>
      </div>

      {/* 🔥 TABLE */}
      <div className="table-container">
        <table className="task-table">
          <thead>
            <tr>
              <th>Task Code</th>
              <th>Client</th>
              <th>Content</th>
              <th>Plan Link</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td style={{ fontWeight: 600, color: "#111827" }}>{task.task_code || `#${task.id}`}</td>
                <td>{task.client_name}</td>
                <td>{task.content_type}</td>

                <td>
                  <input
                    className="plan-input"
                    type="text"
                    value={formData[task.id]?.link ?? task.plan_link ?? ""}
                    onChange={(e) => handleChange(task.id, "link", e.target.value)}
                    placeholder="Paste plan link"
                  />

                  <input
                    type="file"
                    onChange={(e) => handleFileChange(task.id, e.target.files[0])}
                    placeholder="Filesize Limit 300MB"
                  />

                  {(formData[task.id]?.file || task.plan_file) && (
                      <div className="file-name">
                        📎{" "}
                        {formData[task.id]?.file
                          ? formData[task.id].file.name
                          : task.plan_file.split("/").pop()}
                      </div>
                    )}

                    {task.plan_file && (
                      <a
                        href={task.plan_file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        View File
                      </a>
                    )}

                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={formData[task.id]?.description ?? task.description ?? ""}
                    onChange={(e) =>
                      handleChange(task.id, "description", e.target.value)
                    }
                  />
                </td>

                <td>
                  <button
                    className="btn btn-green"
                    onClick={() => handleSave(task.id)}
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default PlansSection;