import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import { getEmployeeAllTasks, getAllTasks } from "../../api/taskApi";
import "./employeeInsights.css";
import { useAuth } from "../../context/AuthContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const EmployeeInsights = () => {
  const { user } = useAuth();

  const [myTasks, setMyTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        let my;

        if (user.role === "strategist") {
          const all = await getAllTasks();
          my = all.filter(t => t.strategist?.name === user.name);
        } else {
          my = await getEmployeeAllTasks(user.id);
        }
        // 🔥 CSV ONLY
        const csvTasks = allTasks.filter(
          t => t.is_manual === false
        );

// 🔥 ALL TASKS (already have allTasks)

        const all = await getAllTasks();

        const filteredMy =
          user.role === "marketing"
            ? my.filter(t => t.task_category === "marketing")
            : user.role === "designer"
            ? my.filter(t => t.task_category === "design")
            : my;

        setMyTasks(filteredMy.filter(t => t.status !== "CANCELLED"));

        const filteredAll =
          user.role === "marketing"
            ? all.filter(t => t.task_category === "marketing")
            : user.role === "designer"
            ? all.filter(t => t.task_category === "design")
            : all;

        setAllTasks(filteredAll.filter(t => t.status !== "CANCELLED"));

      } catch (err) {
        console.error(err);
      }
    };

    if (user?.id) fetchData();
  }, [user]);

  /* ================= CLIENT DATA (NO DATE FILTER) ================= */

  const clients = [...new Set(allTasks.map(t => t.client_name))];

const filteredCsvTasks = selectedClient
  ? csvTasks.filter(t => t.client_name === selectedClient)
  : csvTasks;

const filteredAllTasks = selectedClient
  ? allTasks.filter(t => t.client_name === selectedClient)
  : allTasks;

  const clientNames = [...new Set(filteredAllTasks.map(t => t.client_name))];

  const clientPending = clientNames.map(client =>
    filteredClientTasks.filter(
      t =>
        t.client_name === client &&
        !(t.status === "COMPLETED" && t.status === "CANCELLED")
    ).length
  );

  const clientCompleted = clientNames.map(client =>
    filteredAllTasks.filter(
      t =>
        t.client_name === client &&
        t.status === "COMPLETED" &&
        t.stage === "publish"
    ).length
  );

  const totalClientTasks = clientPending.reduce((a, b) => a + b, 0);
  const totalClientPending = clientPending.reduce((a, b) => a + b, 0);
  const totalClientCompleted = clientCompleted.reduce((a, b) => a + b, 0);

  const clientData = {
    labels: clientNames,
    datasets: [
      { label: "Pending", data: clientPending, backgroundColor: "#6366f1" },
      { label: "Completed", data: clientCompleted, backgroundColor: "#22c55e" }
    ]
  };

  /* ================= MY PERFORMANCE (WITH DATE FILTER) ================= */

  const filteredMyTasks = selectedDate
    ? myTasks.filter(t => t.publish_date === selectedDate)
    : myTasks;

  const myPending = filteredMyTasks.filter(
    t => t.status !== "COMPLETED"
  ).length;

  const myCompleted = filteredMyTasks.filter(
    t => t.status === "COMPLETED"
  ).length;

  const myTotal = filteredMyTasks.length;

  const myData = {
    labels: ["My Work"],
    datasets: [
      { label: "Pending", data: [myPending], backgroundColor: "#6366f1" },
      { label: "Completed", data: [myCompleted], backgroundColor: "#22c55e" }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: "#374151",
          font: {
            size: 12,
            weight: "500"
          }
        }
      }
    },
    scales: {
      x: { ticks: { color: "#6b7280" } },
      y: { ticks: { color: "#6b7280" } }
    }
  };

  return (
    <div className="insights-container">

      {/* CLIENT CARD */}
      <div className="insight-card">
        <div className="card-header">
          <h3>Client Work</h3>

          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c} value={c}>{c}</option>
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

      {/* MY PERFORMANCE */}
      <div className="insight-card">

        <div className="card-header">
          <h3>My Performance</h3>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="stats-row">
          <span>Total: {myTotal}</span>
          <span>Pending: {myPending}</span>
          <span>Completed: {myCompleted}</span>
        </div>

        <div className="chart-container">
          <Bar data={myData} options={chartOptions} />
        </div>

      </div>

    </div>
  );
};

export default EmployeeInsights;