import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleBasedRoute = () => {
  const { user } = useAuth();

  console.log("ROLE:", user?.role);
  console.log("FULL USER:", user);

  if (!user) return <Navigate to="/" />;

  const role = user?.role?.toLowerCase();

  if (role === "developer") {
    return <Navigate to="/dashboard/developer" />;
  }

  if (role === "manager") {
    return <Navigate to="/dashboard/manager" />;
  }

  if (role === "admin") {
    return <Navigate to="/dashboard/admin" />;
  }

  if (role === "strategist") {
    return <Navigate to="/dashboard/strategist" />;
  }

  return <Navigate to="/dashboard/employee" />;
};

export default RoleBasedRoute;