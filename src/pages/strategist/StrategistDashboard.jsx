import { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import EmployeeContent from "../employee/EmployeeContent";
import BillingSection from "./BillingSection";
import MeetingsSection from "./MeetingsSection";
import PlansSection from "../../components/tasks/PlansSection";
import EmployeeInsights from "../employee/EmployeeInsights";
import "../manager/Dashboard.css";
import { useAuth } from "../../context/AuthContext";

const StrategistDashboard = () => {
  const { user } = useAuth();
  const [page, setPage] = useState("plans");

  console.log("CURRENT PAGE VALUE:", page);

  return (
    <MainLayout page={page} setPage={setPage}>

      {page === "insights" && (
        <div className="page-section">
          <div className="section-header">
            <div>
              <h2>Insights</h2>
              <p>Analyze performance and workload</p>
            </div>
          </div>

          <div className="section-content">
            <EmployeeInsights user={user} />
          </div>
        </div>
      )}

      {/* ===== TASKS ===== */}
      {(page === "tasks" || page === "completed") && (
        <div className="page-section">

          <div className="section-header">
            <div>
              <h2>
                {page === "tasks" && "Tasks"}
                {page === "completed" && "Completed Tasks"}
               
              </h2>

              <p>
                {page === "tasks" && "Manage your assigned tasks"}
                {page === "completed" && "Review completed work"}
                
              </p>
            </div>
          </div>

          <div className="section-content">
            <EmployeeContent page={page} setPage={setPage} />
          </div>

        </div>
      )}

      {/* ===== BILLING ===== */}
      {page === "billing" && (
        <div className="page-section">

          <div className="section-header">
            <div>
              <h2>Billing</h2>
              <p>Track client payments and balances</p>
            </div>
          </div>

          <div className="section-content">
            <BillingSection />
          </div>

        </div>
      )}

      {/* ===== MEETINGS ===== */}
      {page === "meetings" && (
        <div className="page-section">

          <div className="section-header">
            <div>
              <h2>Meetings</h2>
              <p>Schedule and manage meetings</p>
            </div>
          </div>

          <div className="section-content">
            <MeetingsSection />
          </div>

        </div>
      )}

      {/* ===== PLANS ===== */}
      {page === "plans" && (
        <div className="page-section">

          <div className="section-header">
            <div>
              <h2>Plans</h2>
              <p>Upload and manage content plans</p>
            </div>
          </div>

          <div className="section-content">
            <PlansSection />
          </div>

        </div>
      )}

    </MainLayout>
  );
};

export default StrategistDashboard;