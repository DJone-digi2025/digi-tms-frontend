import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./DeveloperHeader.css";
import { useState, useRef, useEffect } from "react";

const DeveloperHeader = () => {

    const { logout, login } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef();

    const handleLogout = () => {
    logout();
    navigate("/");
    };



const handleReturnDev = () => {
  const devUser = JSON.parse(localStorage.getItem("dev_user"));

  if (devUser) {
    login(devUser);
    window.location.href = "/dashboard/developer";
  }
};

useEffect(() => {
  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  return (
    <div className="dev-header">

    <div className="dev-left">

    <img
        src="/logo.png"
        alt="logo"
        className="dev-logo"
    />

    <h2>Developer Console</h2>

    </div>

      <div className="dev-right">
<div
  className="dev-profile"
  ref={dropdownRef}
  onClick={(e) => {
  e.stopPropagation();
  setOpen(!open);
}}
>

  <img src="/dev.png" className="dev-avatar" />

  <div className="dev-info">
    <div className="dev-name">David</div>
    <div className="dev-role">Developer</div>
  </div>

  {/* DROPDOWN */}
  {open && (
    <div className="dev-dropdown">

      <div className="dropdown-item">
        Profile
      </div>

<div
  className="dropdown-item"
 onClick={handleReturnDev}
>
  Return to Developer
</div>

<div
  className="dropdown-item"
  onClick={() => navigate("/dashboard/developer/logs")}
>
  View Logs
</div>

      <div className="dropdown-item logout" onClick={handleLogout}>
        Logout
      </div>

    </div>
  )}
</div>
</div>
    </div>
  );
};

export default DeveloperHeader;