import { useEffect, useState } from "react";
import "./PlansTracker.css";

const PlansTracker = () => {

  const [data, setData] = useState({});
  const [openSections, setOpenSections] = useState({});

  useEffect(() => {

    const fetchTracker = async () => {

      try {

        const res = await fetch(
          "https://digi-tms-backend.onrender.com/plans/tracker"
        );

        const json = await res.json();

        console.log("TRACKER:", json);

        setData(json);

      } catch (err) {

        console.error(err);

      }

    };

    fetchTracker();

  }, []);

  const toggle = (key) => {

    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));

  };

  const renderBar = (section, title, key) => {

    const total = section.total || 0;

    const completedPercent =
      total > 0
        ? (section.completed / total) * 100
        : 0;

    const activePercent =
      total > 0
        ? (section.active / total) * 100
        : 0;

    const remainingPercent =
      total > 0
        ? (section.remaining / total) * 100
        : 0;

    return (

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "14px",
          marginBottom: "14px",
          background: "#fff"
        }}
      >

        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
            alignItems: "center"
          }}
        >

          <div>
            <div style={{ fontWeight: 700 }}>
              {title}
            </div>

            <div
              style={{
                fontSize: "13px",
                color: "#6b7280"
              }}
            >
              Total: {section.total}
            </div>
          </div>

          <button
            onClick={() => toggle(key)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "18px"
            }}
          >
            ▼
          </button>

        </div>

        {/* BAR */}
        <div
          style={{
            width: "100%",
            height: "18px",
            display: "flex",
            overflow: "hidden",
            borderRadius: "999px",
            background: "#f3f4f6"
          }}
        >

          <div
            style={{
              width: `${completedPercent}%`,
              background: "#22c55e"
            }}
          />

          <div
            style={{
              width: `${activePercent}%`,
              background: "#f59e0b"
            }}
          />

          <div
            style={{
              width: `${remainingPercent}%`,
              background: "#d1d5db"
            }}
          />

        </div>

        {/* LEGEND */}
        <div
          style={{
            display: "flex",
            gap: "14px",
            marginTop: "10px",
            fontSize: "13px"
          }}
        >
          <span>🟢 Completed: {section.completed}</span>
          <span>🟠 Active: {section.active}</span>
          <span>⚪ Remaining: {section.remaining}</span>
        </div>

        {/* TASK LIST */}
        {openSections[key] && (
          <div
            style={{
              marginTop: "12px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "10px"
            }}
          >

            {section.tasks.map((task, i) => (

              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  fontSize: "14px",
                  borderBottom: "1px solid #f3f4f6"
                }}
              >

                <div>
                  {task.task_code || task.content_type}
                </div>

                <div>
                  {task.assigned_to}
                </div>

                <div>
                  {task.status}
                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    );

  };

return (

<div className="plans-tracker-container">

      {Object.values(data).map((client, index) => (

<div
  key={index}
  className="client-card"
>

<h3 className="client-title">
            {client.client_name}
          </h3>

          {/* CSV */}
          {Object.entries(client.csv).map(([type, section]) =>
            renderBar(
              section,
              `CSV - ${type.toUpperCase()}`,
              `${client.client_name}-${type}`
            )
          )}

          {/* MANUAL */}
          {renderBar(
            client.manual,
            "MANUAL TASKS",
            `${client.client_name}-manual`
          )}

        </div>

      ))}

    </div>

  );

};

export default PlansTracker;