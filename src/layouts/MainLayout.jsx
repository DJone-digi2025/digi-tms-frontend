import { useState } from "react";
import "./MainLayout.css";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import {
  LayoutDashboard,
  ClipboardList,
  FlaskConical,
  History,
  Trash2,
  Folder,
  DollarSign,
  CalendarDays,
  CheckCircle
} from "lucide-react";

const MainLayout = ({ children, setPage, page }) => {
  
  const { user, logout } = useAuth();
  
  const rawAccess = user?.access_type;
  const access = rawAccess ? rawAccess.toLowerCase().trim() : "limited";
  const isStrategist = user?.role === "strategist";
  const [collapsed, setCollapsed] = useState(false);

  if (!user) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  const isSidebarUser =
    user.role === "manager" ||
    user.role === "strategist";

  const getTitle = () => {
    switch (page) {
      case "tasks": return "Tasks";
      case "billing": return "Billing";
      case "meetings": return "Meetings";
      case "manager-insights": return "Manager Insights";
      case "evaluation": return "Evaluation";
      case "history": return "History";
      case "trash": return "Trash";
      case "plans": return "Plans";
      default: return "Dashboard";
    }
  };

    if (!isSidebarUser) {
      return (
        <div className="main-content">
          <Header 
            title={getTitle()} 
            onLogout={logout} 
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
          {children}
        </div>
      );
    }

  return (
    <div className="layout">

      {/* 🔥 SIDEBAR */}
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

        {/* 🔥 LOGO */}
        <div className="logo-container">
          <img src="/logo.png" alt="logo" className="sidebar-logo" />
          {!collapsed && <h2 className="logo-text">DigiSailor</h2>}
        </div>

        {/* 🔥 MENU */}
        <div className="menu">

          {/* MANAGER */}
          {user.role === "manager" && (
            <>
              <button className={page === "manager-insights" ? "active" : ""} onClick={() => setPage("manager-insights")}>
                <span className="icon"><LayoutDashboard size={18} /></span>
                {!collapsed && <span>Insights</span>}
              </button>

              <button className={page === "tasks" ? "active" : ""} onClick={() => setPage("tasks")}>
                <span className="icon"><ClipboardList size={18} /></span>
                {!collapsed && <span>Tasks</span>}
              </button>

              <button className={page === "evaluation" ? "active" : ""} onClick={() => setPage("evaluation")}>
                <span className="icon"><FlaskConical size={18} /></span>
                {!collapsed && <span>Evaluation</span>}
              </button>

              <button className={page === "history" ? "active" : ""} onClick={() => setPage("history")}>
                <span className="icon"><History size={18} /></span>
                {!collapsed && <span>History</span>}
              </button>

              <button className={page === "trash" ? "active" : ""} onClick={() => setPage("trash")}>
                <span className="icon"><Trash2 size={18} /></span>
                {!collapsed && <span>Trash</span>}
              </button>

              <button className={page === "plans" ? "active" : ""} onClick={() => setPage("plans")}>
                <span className="icon"><Folder size={18} /></span>
                {!collapsed && <span>Plans</span>}
              </button>
            </>
          )}

          {/* Full */}
          {user?.role === "strategist" && access === "full" && (
            <>

              <button className={page === "insights" ? "active" : ""} onClick={() => setPage("insights")}>
                <span className="icon"><LayoutDashboard size={18} /></span>
                {!collapsed && <span>Insights</span>}
              </button>

              <button className={page === "tasks" ? "active" : ""} onClick={() => setPage("tasks")}>
                <span className="icon"><ClipboardList size={18} /></span>
                {!collapsed && <span>Tasks</span>}
              </button>

                <button className={page === "completed" ? "active" : ""} onClick={() => setPage("completed")}>
                  <span className="icon"><CheckCircle size={18} /></span>
                  {!collapsed && <span>Completed</span>}
                </button>


              <button className={page === "billing" ? "active" : ""} onClick={() => setPage("billing")}>
                <span className="icon"><DollarSign size={18} /></span>
                {!collapsed && <span>Bills</span>}
              </button>

              <button className={page === "meetings" ? "active" : ""} onClick={() => setPage("meetings")}>
                <span className="icon"><CalendarDays size={18} /></span>
                {!collapsed && <span>Meetings</span>}
              </button>

              <button className={page === "plans" ? "active" : ""} onClick={() => setPage("plans")}>
                <span className="icon"><Folder size={18} /></span>
                {!collapsed && <span>Plans</span>}
              </button>
            </>
          )}

          {/* LIMITED */}
          {user?.role === "strategist" && access === "limited" && (
            <>
              <button className={page === "insights" ? "active" : ""} onClick={() => setPage("insights")}>
                <span className="icon"><LayoutDashboard size={18} /></span>
                {!collapsed && <span>Insights</span>}
              </button>

              <button className={page === "tasks" ? "active" : ""} onClick={() => setPage("tasks")}>
                <span className="icon"><ClipboardList size={18} /></span>
                {!collapsed && <span>Tasks</span>}
              </button>

              <button className={page === "completed" ? "active" : ""} onClick={() => setPage("completed")}>
                <span className="icon"><CheckCircle size={18} /></span>
                {!collapsed && <span>Completed</span>}
              </button>

              <button className={page === "plans" ? "active" : ""} onClick={() => setPage("plans")}>
                <span className="icon"><Folder size={18} /></span>
                {!collapsed && <span>Plans</span>}
              </button>
            </>
          )}

        </div>
      </div>

      {/* 🔥 MAIN */}
      <div className="main-content">
        <Header 
          title={getTitle()} 
          onLogout={logout} 
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        {children}
      </div>

    </div>
  );
};

export default MainLayout;