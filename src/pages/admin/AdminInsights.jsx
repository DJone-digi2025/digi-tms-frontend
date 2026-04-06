import { useEffect, useState } from "react";
import {
  getAllTasks,
  getClients
} from "../../api/taskApi";

import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import "./AdminInsights.css";
import BillingSection from "../strategist/BillingSection";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const AdminInsights = () => {
  const [tasks, setTasks] = useState([]);
  const [clients, setClients] = useState([]);
  

  const [selectedClient, setSelectedClient] = useState("");
  const [taskCategory, setTaskCategory] = useState("design"); // default safe
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const allTasks = await getAllTasks();
      const clientData = await getClients();
      

      setTasks(allTasks);
      setClients(clientData);
      
    };

    fetchData();
  }, []);

  /* ===== CLIENT ANALYSIS ===== */

const baseTasks = tasks.filter(
  t => t.task_category === taskCategory && t.status !== "CANCELLED"
);

const filteredClientTasks = selectedClient
  ? baseTasks.filter(t => t.client_name === selectedClient)
  : baseTasks;

  const clientNames = [...new Set(filteredClientTasks.map(t => t.client_name))];

  const clientPending = clientNames.map(client =>
    filteredClientTasks.filter(
      t => t.client_name === client &&
      !(t.status === "COMPLETED" && t.stage === "publish")
    ).length
  );

  const clientCompleted = clientNames.map(client =>
    filteredClientTasks.filter(
      t => t.client_name === client && t.status === "COMPLETED" && t.stage === "publish"
    ).length
  );

  const clientData = {
    labels: clientNames,
datasets: [
  { label: "Pending", data: teamPending, backgroundColor: "#6366f1" },
  { label: "Completed", data: teamCompleted, backgroundColor: "#22c55e" },
  { label: "Rework", data: teamRework, backgroundColor: "#ef4444" },
  { label: "Cancelled", data: teamCancelled, backgroundColor: "#9ca3af" } // 🔥 ADD
]
  };
  const totalClientPending = clientPending.reduce((a, b) => a + b, 0);
  const totalClientCompleted = clientCompleted.reduce((a, b) => a + b, 0);
  const totalClientTasks = totalClientPending + totalClientCompleted;

  /* ===== TEAM ANALYSIS ===== */
  // ✅ Extract valid member names safely
const members = [
  ...new Set([
    ...tasks.map(t => t.team_members?.name),
    ...tasks.map(t => t.strategist?.name)
  ].filter(Boolean))
];

  // ✅ Filter tasks based on selected member
const filteredTeamTasks = baseTasks.filter(t => {
  const memberMatch = selectedMember
    ? t.team_members?.name === selectedMember
    : true;

  const dateMatch = selectedDate
    ? t.publish_date === selectedDate
    : true;

  return memberMatch && dateMatch;
});

  // ✅ Pending count
const teamPending = members.map(member =>
  filteredTeamTasks.filter(
    t =>
      t.team_members?.name === member &&
      t.status !== "COMPLETED"
  ).length
);

  // ✅ Completed count
const teamCompleted = members.map(member =>
  filteredTeamTasks.filter(
    t =>
      t.team_members?.name === member &&
      t.status === "COMPLETED"
  ).length
);

  const teamRework = members.map(member =>
  filteredTeamTasks.filter(
    t =>
      t.team_members?.name === member &&
      t.status === "REWORK"
  ).length
);

const teamCancelled = members.map(member =>
  tasks.filter(
    t =>
      t.team_members?.name === member &&
      t.status === "CANCELLED"
  ).length
);

const totalTeamPending = teamPending.reduce((a, b) => a + b, 0);
const totalTeamCompleted = teamCompleted.reduce((a, b) => a + b, 0);
const totalTeamRework = teamRework.reduce((a, b) => a + b, 0);

const totalTeamTasks = filteredTeamTasks.length;

  // ✅ Chart data
const teamData = {
  labels: ["Pending", "Completed", "Rework"],
  datasets: [
    {
      data: [
        totalTeamPending,
        totalTeamCompleted,
        totalTeamRework
      ],
      backgroundColor: ["#6366f1", "#22c55e", "#ef4444"]
    }
  ]
};

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top"
      }
    },
    maintainAspectRatio: false
  };


return (
  <div className="manager-insights">

    {/* ===== TOP (2 CHARTS SIDE BY SIDE) ===== */}
    <div className="insights-top">

      {/* CLIENT */}
      <div className="insight-card">
        <div className="card-header">
          <h3>Client Analysis</h3>

          <select
            value={taskCategory}
            onChange={(e) => setTaskCategory(e.target.value)}
          >
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
          </select>

          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            <option value="">All Clients</option>
            {clients.map((c, i) => (
              <option key={i}>{c.client_name}</option>
            ))}
          </select>
        </div>

          <div className="stats-row">
            <span>Total: {totalClientTasks}</span>
            <span>Pending: {totalClientPending}</span>
            <span>Completed: {totalClientCompleted}</span>
          </div>

          <div className="chart-container">
            <Bar data={clientData} options={chartOptions} />
          </div>
      </div>

      {/* TEAM */}
      <div className="insight-card">
        <div className="card-header">
          <h3>Team Analysis</h3>

<div className="select-wrapper">
  <select
    name="assigned_to"
    className="filter-select"
    value={selectedMember}
    onChange={(e) => setSelectedMember(e.target.value)}
  >
    <option value="">All Members</option>
    {members.map((m) => (
      <option key={m} value={m}>{m}</option>
    ))}
  </select>
  <input
  type="date"
  value={selectedDate}
  onChange={(e) => setSelectedDate(e.target.value)}
/>
</div>
        </div>

          <div className="stats-row">
            <span>Total: {totalTeamTasks}</span>
            <span>Pending: {totalTeamPending}</span>
            <span>Completed: {totalTeamCompleted}</span>
            <span>Cancelled: {totalTeamCancelled}</span>
          </div>

          <div className="chart-container">
            <Doughnut data={teamData} options={chartOptions} />
          </div>
      </div>

    </div>

    {/* ===== BOTTOM (FULL WIDTH TABLE) ===== */}
<div className="insights-bottom">
  <div className="insight-card full">

    <div className="card-header">
      <h3>Billing</h3>
    </div>

    <BillingSection />

  </div>
</div>

</div>
  
);
};

export default AdminInsights;

