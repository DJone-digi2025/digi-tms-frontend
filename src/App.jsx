import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/auth/Login";
import ManagerDashboard from "./pages/manager/Dashboard";
import StrategistDashboard from "./pages/strategist/StrategistDashboard";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DeveloperDashboard from "./pages/developer/DeveloperDashboard";
import DeveloperLogs from "./pages/developer/DeveloperLogs";


import ProtectedRoute from "./routes/ProtectedRoute";
import RoleBasedRoute from "./routes/RoleBasedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 PUBLIC */}
        <Route path="/" element={<Login />} />
        

        {/* 🔒 PROTECTED */}
        <Route element={<ProtectedRoute />}>

          {/* 🔁 ROLE REDIRECT */}
          <Route path="/dashboard" element={<RoleBasedRoute />} />

          {/* 🎯 ACTUAL DASHBOARDS */}
          <Route path="/dashboard/manager" element={<ManagerDashboard />} />
          <Route path="/dashboard/strategist" element={<StrategistDashboard />} />
          <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/dashboard/developer" element={<DeveloperDashboard />} />
          <Route path="/dashboard/developer/logs" element={<DeveloperLogs />} />
          

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;