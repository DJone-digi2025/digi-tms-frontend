import { useEffect, useState } from "react";

const StrategistTeam = () => {
  const [designers, setDesigners] = useState([]);

  const BASE_URL = "https://digi-tms-backend.onrender.com";

  useEffect(() => {
    fetch(`${BASE_URL}/team-members`)
      .then(res => res.json())
      .then(data => {
        // ✅ ONLY DESIGNERS
const filtered = data.filter((m) => {
  const role = m.role?.toLowerCase().trim();
  return role === "designer";
});
        setDesigners(filtered);
      })
.then(data => {
  console.log("TEAM API DATA:", data);

  const filtered = data.filter((m) => {
    const role = m.role?.toLowerCase().trim();
    return role === "designer";
  });

  console.log("FILTERED DESIGNERS:", filtered);

  setDesigners(filtered);
})
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>

      <h2 style={{
        fontSize: "20px",
        fontWeight: "600",
        marginBottom: "20px"
      }}>
        Designers
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "16px"
      }}>
        {designers.map((d) => (
          <div
            key={d.id}
            style={{
              background: "white",
              padding: "16px",
              borderRadius: "12px",
              boxShadow: "0 6px 16px rgba(0,0,0,0.05)"
            }}
          >
            <div style={{ fontWeight: "600" }}>{d.name}</div>

            <div style={{
              fontSize: "12px",
              color: "white",
              background: "#3b82f6",
              padding: "2px 8px",
              borderRadius: "6px",
              display: "inline-block",
              marginTop: "6px"
            }}>
              designer
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default StrategistTeam;