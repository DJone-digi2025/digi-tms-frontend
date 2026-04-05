import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const DeveloperLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    fetch(
      `http://localhost:5000/activity-logs?user_id=${user.id}&dev_key=DJone`
    )
      .then(res => res.json())
      .then(data => {
        console.log("LOGS:", data);

        // ✅ prevent crash if API returns error
        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          console.error("API ERROR:", data);
          setLogs([]);
        }
      })
      .catch(err => {
        console.error("FETCH ERROR:", err);
        setLogs([]);
      });
  }, [user]);

  // ✅ apply filter properly
  const filteredLogs = logs.filter(log =>
    log.action?.toLowerCase().includes(filter.toLowerCase())
  );

return (

  <div style={{ padding: "30px", background: "#f9fafb", minHeight: "100vh" }}>
    
    
    <h2 style={{ marginBottom: "20px", fontWeight: "600" }}>
      Developer Activity Logs
    </h2>

    {/* 🔍 FILTER */}
    <input
      placeholder="Filter by action (e.g. BILL_CREATED)"
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      style={{
        marginBottom: "25px",
        padding: "10px 12px",
        width: "280px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        outline: "none"
      }}
    />

    {/* 🧾 LOG LIST */}
    {filteredLogs.length === 0 ? (
      <p style={{ color: "#6b7280" }}>No logs found</p>
    ) : (
      filteredLogs.map((log) => (
        <div
          key={log.id}
          style={{
            background: "white",
            padding: "16px",
            marginBottom: "16px",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
            borderLeft: `4px solid ${
              log.module === "billing"
                ? "#10b981"
                : log.module === "tasks"
                ? "#6366f1"
                : "#9ca3af"
            }`
          }}
        >
          {/* TOP ROW */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{ fontWeight: "600" }}>
              {log.action}
            </div>

            <div style={{
              fontSize: "12px",
              color: "#6b7280"
            }}>
              {new Date(log.created_at).toLocaleString()}
            </div>
          </div>

          {/* META */}
          <div style={{
            fontSize: "13px",
            marginTop: "6px",
            color: "#374151"
          }}>
            {log.user_name} • {log.role} • {log.module}
          </div>

          {/* DETAILS */}
          <div style={{ marginTop: "10px" }}>
            <div style={{
              fontSize: "12px",
              fontWeight: "500",
              marginBottom: "4px",
              color: "#6b7280"
            }}>
              Details
            </div>

            <div style={{
              background: "#f3f4f6",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "12px"
            }}>
              {Object.entries(log.details || {}).map(([key, value]) => (
                <div key={key}>
                  {key}: {String(value)}
                </div>
              ))}
            </div>
          </div>

        </div>
      ))
    )}
  </div>
);
};

export default DeveloperLogs;