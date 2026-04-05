import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DeveloperHeader from "./DeveloperHeader";

const DeveloperDashboard = () => {
  const { login } = useAuth();
  const [members, setMembers] = useState([]);

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

useEffect(() => {
  fetch(`${BASE_URL}/team-members`)
    .then(res => res.json())
    .then(data => setMembers(data))
    .catch(err => console.error(err));
}, []);

const handleSwitch = (member) => {
  const devUser = JSON.parse(localStorage.getItem("user"));

  // store ORIGINAL developer
  localStorage.setItem("dev_user", JSON.stringify(devUser));

  login(member);
  window.location.href = "/dashboard";
};

const cardStyle = {
  background: "white",
  padding: "16px",
  borderRadius: "12px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.05)"
};

const userCard = {
  background: "white",
  padding: "16px",
  borderRadius: "12px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 6px 16px rgba(0,0,0,0.05)",
  transition: "0.2s ease"
};

const enterBtn = {
  background: "#6366f1",
  color: "white",
  border: "none",
  padding: "6px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "500",
  transition: "0.2s"
};

const getRoleColor = (role) => {
  switch (role?.toLowerCase()) {
    case "designer":
      return "#3b82f6"; // blue
    case "strategist":
      return "#10b981"; // green
    case "manager":
      return "#f59e0b"; // orange
    case "admin":
      return "#ef4444"; // red
    case "developer":
      return "#8b5cf6"; // purple
    default:
      return "#6b7280";
  }
};

return (
<div style={{
  minHeight: "100vh",
  background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
  position: "relative",
  overflow: "hidden"
}}>
    {/* 🔥 BACKGROUND LOGO */}
<div className="bg-glow" />

    <DeveloperHeader />

    <div style={{ padding: "30px" }}>

      {/* TITLE */}
      <h2 style={{
        fontSize: "22px",
        fontWeight: "600",
        marginBottom: "20px"
      }}>
        Developer Control Panel
      </h2>

      {/* STATS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px",
        marginBottom: "30px"
      }}>
        
        <div style={cardStyle}>
          <div>Total Users</div>
          <h3>{members.length}</h3>
        </div>

        <div style={cardStyle}>
          <div>Designers</div>
          <h3>{members.filter(m => m.role === "designer").length}</h3>
        </div>

        <div style={cardStyle}>
          <div>Strategists</div>
          <h3>{members.filter(m => m.role === "strategist").length}</h3>
        </div>

      </div>

      {/* USER GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "16px"
      }}>
        {members.map((m) => (
          <div
                key={m.id}
                style={userCard}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 25px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.05)";
                }}
            >

            <div>
                <div style={{ fontWeight: "600" }}>{m.name}</div>

                <div
                style={{
                    fontSize: "12px",
                    color: "white",
                    background: getRoleColor(m.role),
                    padding: "2px 8px",
                    borderRadius: "6px",
                    display: "inline-block",
                    marginTop: "4px"
                }}
                >
                {m.role}
                </div>
            </div>

                <button
                    onClick={() => handleSwitch(m)}
                    style={enterBtn}
                    onMouseEnter={(e) => {
                        e.target.style.background = "#4f46e5";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = "#6366f1";
                    }}
                    >
                    Enter
                </button>

          </div>
        ))}
      </div>

    </div>
  </div>
);
};

export default DeveloperDashboard;