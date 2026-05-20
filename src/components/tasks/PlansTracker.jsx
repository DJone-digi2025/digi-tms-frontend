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

<div className="tracker-section">

        {/* HEADER */}
<div className="section-header">

          <div>
            <div className="section-title">
              {title}
            </div>

<div className="section-total">
              Total: {section.total}
            </div>
          </div>

<button
  onClick={() => toggle(key)}
  className="dropdown-btn"
>
            ▼
          </button>

        </div>

        {/* BAR */}
<div className="progress-bar">

<div
  className="progress-completed"
  style={{
    width: `${completedPercent}%`
  }}
/>

<div
  className="progress-active"
  style={{
    width: `${activePercent}%`
  }}
/>

<div
  className="progress-remaining"
  style={{
    width: `${remainingPercent}%`
  }}
/>

        </div>

        {/* LEGEND */}
<div className="legend-row">
<div className="legend-item">
  <span className="legend-dot completed-dot"></span>
  Completed: {section.completed}
</div>

<div className="legend-item">
  <span className="legend-dot active-dot"></span>
  Active: {section.active}
</div>

<div className="legend-item">
  <span className="legend-dot remaining-dot"></span>
  Remaining: {section.remaining}
</div>
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