import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useAuth } from "../../context/AuthContext";

import {
  createMeeting,
  getMeetings,
  getAllTasks,
  completeMeeting,
  cancelMeeting
} from "../../api/taskApi";

import { createPortal } from "react-dom";
import "./Meetings.css";

const MeetingsSection = () => {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date());
  const [meetings, setMeetings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");

  const [form, setForm] = useState({
    client_name: "",
    meeting_time: ""
  });

  const [clients, setClients] = useState([]);

  /* ================= FETCH ================= */

  const fetchMeetings = async () => {
    const data = await getMeetings();
    setMeetings(data);
  };

  const fetchClients = async () => {
    const tasks = await getAllTasks();
    const uniqueClients = [...new Set(tasks.map(t => t.client_name))];
    setClients(uniqueClients);
  };

  useEffect(() => {
    fetchMeetings();
    fetchClients();
  }, []);

  /* ================= HANDLERS ================= */

  const handleDateClick = (selectedDate) => {
    setDate(selectedDate);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.client_name || !form.meeting_time) {
      alert("Fill all fields");
      return;
    }

    const formattedDate = new Date(
  date.getFullYear(),
  date.getMonth(),
  date.getDate()
)
  .toISOString()
  .split("T")[0];

    await createMeeting({
      client_name: form.client_name,
      meeting_date: formattedDate,
      meeting_time: form.meeting_time,
      created_by: user.id
    });

    setShowModal(false);
    setForm({
      client_name: "",
      meeting_time: ""
    });

    fetchMeetings();
  };

  const handleCompleteMeeting = async (id) => {
    await completeMeeting(id);
    fetchMeetings();
  };

  const handleCancelMeeting = async (id) => {
    if (!window.confirm("Cancel this meeting?")) return;

    try {
        await cancelMeeting(id);
        fetchMeetings(); // safer + consistent

    } catch (err) {
      console.error(err);
      alert("Failed to cancel meeting");
    }
  };

  /* ================= CALENDAR DOT ================= */

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const formatted = date.toISOString().split("T")[0];

    const filtered = meetings.filter((m) =>
      selectedClient ? m.client_name === selectedClient : true
    );

    const meeting = filtered.find(m => m.meeting_date === formatted);

    if (!meeting) return null;

    return (
      <div
        className="calendar-dot"
        style={{
          color: meeting.status === "completed" ? "#16a34a" : "#dc2626"
        }}
      >
        •
      </div>
    );
  };

  /* ================= FILTERED ================= */

  const filteredMeetings = meetings.filter((m) =>
    selectedClient ? m.client_name === selectedClient : true
  );

  /* ================= RENDER ================= */

  return (
    <div className="meeting-layout">

      {/* ===== LEFT (CALENDAR) ===== */}
      <div className="calendar-section">

        <h3 className="section-title">Meetings Calendar</h3>

        <Calendar
          onClickDay={handleDateClick}
          value={date}
          tileContent={tileContent}
        />

      </div>

      {/* ===== RIGHT (TABLE) ===== */}
      <div className="table-section">

        {/* FILTER */}
        <div className="meeting-filter">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
          >
            <option value="">All Clients</option>
            {clients.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* TABLE */}
        <div className="table-container">
          <table className="task-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredMeetings.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                    No meetings found
                  </td>
                </tr>
              ) : (
                filteredMeetings.map((m) => (
                  <tr key={m.id}>
                    <td>{m.client_name}</td>

                    <td>
                      {new Date(m.meeting_date).toLocaleDateString()}
                    </td>

                    <td>{m.meeting_time}</td>

                    <td>
                      <span className={`meeting-status ${m.status}`}>
                        {m.status === "completed" ? "Completed" : "Pending"}
                      </span>
                    </td>

                      <td style={{ display: "flex", gap: "6px" }}>
                        {m.status !== "completed" && (
                          <>
                            <button
                              className="meeting-btn"
                              onClick={() => handleCompleteMeeting(m.id)}
                            >
                              Done
                            </button>

                            <button
                              className="meeting-btn cancel"
                              onClick={() => handleCancelMeeting(m.id)}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ===== MODAL ===== */}
      {showModal &&
        createPortal(
          <div className="meeting-modal" onClick={() => setShowModal(false)}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >

              <h3>Schedule Meeting</h3>

              <p>
                Date:{" "}
                <b>{date.toISOString().split("T")[0]}</b>
              </p>

              <select
                value={form.client_name}
                onChange={(e) =>
                  setForm({ ...form, client_name: e.target.value })
                }
              >
                <option value="">Select Client</option>
                {clients.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>

              <input
                type="time"
                value={form.meeting_time}
                onChange={(e) =>
                  setForm({ ...form, meeting_time: e.target.value })
                }
              />

              <div className="modal-actions">
                <button className="btn btn-green" onClick={handleSubmit}>
                  Save
                </button>

                <button
                  className="btn btn-red"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>,
          document.body
        )
      }

    </div>
  );
};

export default MeetingsSection;