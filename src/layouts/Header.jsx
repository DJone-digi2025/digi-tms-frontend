import { useState, useEffect } from "react";
import { getMeetings } from "../api/taskApi";
import { useAuth } from "../context/AuthContext";
import { Bell, User } from "lucide-react";
import "./Header.css";

const Header = ({ title, onLogout, collapsed, setCollapsed }) => {
  const [open, setOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [seenNotifications, setSeenNotifications] = useState([]);
  const { user } = useAuth();

  const handleNotificationClick = (id) => {
    setSeenNotifications((prev) => [...prev, id]);
  };

  const isSidebarUser =
    user?.role === "manager" ||
    user?.role === "strategist";

  const fetchNotifications = async () => {
    try {
      const data = await getMeetings();

const today = new Date();
today.setHours(0, 0, 0, 0); // 🔥 start of today

const filtered = data.filter((m) => {
  const [year, month, day] = m.meeting_date.split("-");

  const meetingDate = new Date(year, month - 1, day);

  return (
    m.created_by?.toString() === user.id?.toString() &&
    meetingDate >= today &&   // ✅ only compare DATE (ignore time)
    m.status !== "completed" &&
    !seenNotifications.includes(m.id)
  );
});



      setNotifications(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [seenNotifications]);

  // 🔥 CLOSE ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
    };

    if (showNotifications) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <div className="header">

    <div className="header-left">

      {/* 🔥 TOGGLE (ONLY FOR SIDEBAR USERS) */}
      {isSidebarUser && (
        <button 
          className="menu-toggle"
          onClick={() => setCollapsed(prev => !prev)}
        >
          ☰
        </button>
      )}

      {/* LOGO (ONLY FOR NON SIDEBAR USERS) */}
      {!isSidebarUser && (
        <img src="/logo.png" alt="logo" className="header-logo" />
      )}

    </div>

      {/* CENTER */}
      <div className="header-title">{title}</div>

      {/* RIGHT */}
      <div className="header-right">

        {/* 🔔 NOTIFICATION */}
        <div
          className="notification-wrapper"
          onClick={(e) => {
            e.stopPropagation();
            setShowNotifications((prev) => !prev);
          }}
        >
          <span className="bell-icon"><Bell size={18} /></span>

          {/* 🔴 BADGE */}
          {notifications.length > 0 && (
            <span className="badge">{notifications.length}</span>
          )}

          {/* 🔥 DROPDOWN */}
          {showNotifications && (
            <div className="notification-dropdown">
              {notifications.length === 0 ? (
                <p>No upcoming meetings</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className="notification-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNotificationClick(n.id);
                    }}
                  >
                    <div className="notif-title">📅 Meeting Scheduled</div>

                    <div className="notif-client">
                      Client: <strong>{n.client_name}</strong>
                    </div>

<div className="notif-client">
  Called by: 
  <strong>
    {n.creator?.name || "Unknown"}
  </strong>

  {n.creator?.role && (
    <span className="role-badge">
      {n.creator.role}
    </span>
  )}
</div>

                    <div className="notif-time">
                      🕒 {new Date(n.meeting_date).toLocaleDateString()} at {n.meeting_time}
                    </div>

                    <div className="notif-status">
                      Status: <span className="pending">Pending</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 👤 PROFILE */}
        <div
          className="profile-section"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="user-name">{user?.name}</span>

          <div className="profile-icon"><User size={18} /></div>

          {open && (
            <div className="dropdown">
              <div className="dropdown-item" onClick={onLogout}>
                Logout
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Header;