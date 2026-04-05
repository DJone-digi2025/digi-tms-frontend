import { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import EmployeeContent from "./EmployeeContent";
import { useAuth } from "../../context/AuthContext";

import "./EmployeeDashboard.css";

const EmployeeDashboard = () => {
  const [page, setPage] = useState("tasks");
  const { user, logout } = useAuth();

  const getTitle = () => {
    switch (page) {
      case "tasks":
        return "Tasks";
      case "completed":
        return "Completed Tasks";
      case "insights":
        return "Insights";
      default:
        return "Dashboard";
    }
  };

  const getDescription = () => {
    switch (page) {
      case "tasks":
        return "Manage your active tasks";
      case "completed":
        return "Review your completed work";
      case "insights":
        return "Track your performance";
      default:
        return "";
    }
  };

  return (
    <MainLayout page={page} setPage={setPage}>

      {/* ✅ HEADER ONLY FOR NON-SIDEBAR USERS */}


      <div className="page-section">

        <div className="section-header">
          <div>
            <h2>{getTitle()}</h2>
            <p>{getDescription()}</p>
          </div>
        </div>

        <div className="section-content">
          <EmployeeContent page={page} setPage={setPage} />
        </div>

      </div>

    </MainLayout>
  );
};

export default EmployeeDashboard;