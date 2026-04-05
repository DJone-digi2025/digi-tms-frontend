import { useState } from "react";
import AdminInsights from "./AdminInsights";
import PlansSection from "../../components/tasks/PlansSection";
import MainLayout from "../../layouts/MainLayout";
import "./admin.css";

const AdminDashboard = () => {
  const [tab, setTab] = useState("insights");

return (
  <MainLayout>
    <div className="admin-container">

      {/* HEADER */}
      <div className="admin-header">
        <h2>Admin Dashboard</h2>

        <div className="admin-tabs">
          <button
            className={tab === "insights" ? "active" : ""}
            onClick={() => setTab("insights")}
          >
            Insights
          </button>

          <button
            className={tab === "plans" ? "active" : ""}
            onClick={() => setTab("plans")}
          >
            Plans
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="admin-content">
        {tab === "insights" && <AdminInsights />}
        {tab === "plans" && <PlansSection />}
      </div>

    </div>
  </MainLayout>
);
};

export default AdminDashboard;