import { useState, useEffect } from "react";
import {
  createBill,
  getBills,
  getAllTasks,
  updatePayment
} from "../../api/taskApi";
import { createPortal } from "react-dom";
import { useAuth } from "../../context/AuthContext";
import "./BillingSection.css";
import BASE_URL from "../../config/api";

const BillingSection = ({page}) => {
  const { user } = useAuth();

const isEditableUser =
  user?.role === "strategist" || user?.role === "manager";

  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);

  const [selectedBill, setSelectedBill] = useState(null);
  const [clientSummary, setClientSummary] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");


const [form, setForm] = useState({
  client_name: "",
  content_type: "",
  content_count: "",
  content_description: "", // ✅ ADD THIS
  amount_credited: ""
});

  const [bills, setBills] = useState([]);
  const [clients, setClients] = useState([]);

  const [selectedClient, setSelectedClient] = useState("");

const fetchBills = async () => {
  try {
    const data = await getBills();

    console.log("🔥 API Bills Response:", data);  // ADD THIS

    setBills(data);
  } catch (err) {
    console.error(err);
  }
};

const fetchMeta = async () => {
  try {
    const res = await fetch(`${BASE_URL}/clients`)
    const data = await res.json();

    setClients(data);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  if (page === "billing") {
    fetchBills();
    fetchMeta();
  }
}, [page]);
const handleChange = (e) => {
  const { name, value } = e.target;

  setForm({ ...form, [name]: value });

  // ✅ when client is selected → update summary
if (name === "client_name") {
  fetch(`${BASE_URL}/clients`)
    .then(res => res.json())
    .then(data => {
      const client = data.find(c => c.client_name === value);

      if (client) {
        setClientSummary({
          total_amount: client.total_contract_amount,
          pending_amount: client.total_contract_amount // initially same
        });
      } else {
        setClientSummary(null);
      }
    })
    .catch(err => console.error(err));
}
}

  const handleSubmit = async () => {
    if (!form.client_name || !form.content_type) {
      alert("Fill required fields");
      return;
    }

    try {
await createBill({
  ...form,
  content_count: form.content_count ? Number(form.content_count) : null,
  amount_credited: form.amount_credited ? Number(form.amount_credited) : null,
  user_id: user.id
});

// 🔥 THEN CLOSE
setPaymentModal(false);
setSelectedBill(null);


setForm({
  client_name: "",
  content_type: "",
  content_count: "",
  content_description: "",
  amount_credited: ""
});
      await fetchBills();
    } catch (err) {
      console.error(err);
      alert("Failed to add bill");
    }
  };



const getClientTotal = (clientName) => {
  const client = clients.find(c => c.client_name === clientName);
  return client?.total_contract_amount || 0;
};

const grouped = Object.values(
  bills.reduce((acc, bill) => {
    if (!acc[bill.client_name]) {
      acc[bill.client_name] = {
        ...bill,
        amount_credited: 0
      };
    }

    acc[bill.client_name].amount_credited += bill.amount_credited || 0;

    return acc;
  }, {})
);

  return (
    <div className="billing-container">
  <div className="billing-table-container">
    <div>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
      </div>

      <div className="filter-bar">
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
        >
          <option value="">All Clients</option>
        {clients.map((c, i) => (
          <option key={i} value={c.client_name}>{c.client_name}</option>
        ))}
        </select>
      </div>

      {/* TABLE */}
      <table className="task-table" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Client</th>
            <th>Status</th>
            <th>Total</th>
            <th>Credited</th>      

            {isEditableUser && <th>Actions</th>}
          </tr>
        </thead>

<tbody>
  {clients
    .filter((c) =>
      selectedClient ? c.client_name === selectedClient : true
    )
    .map((client) => {

      const clientBills = bills.filter(
        (b) => b.client_name === client.client_name
      );

      const totalCredited = clientBills.reduce(
        (sum, b) => sum + (b.amount_credited || 0),
        0
      );

      return (
        <tr key={client.client_name}>
          <td>{client.client_name}</td>

          <td>
            <span style={{
              padding: "4px 10px",
              borderRadius: "12px",
              background: client.active ? "#dcfce7" : "#fee2e2",
              color: client.active ? "#166534" : "#991b1b",
              fontSize: "12px"
            }}>
              {client.active ? "Active" : "Inactive"}
            </span>
          </td>

          <td>₹{client.total_contract_amount || 0}</td>

          <td>₹{totalCredited}</td>

          {isEditableUser && (
            <td>
              <div style={{ display: "flex", gap: "8px" }}>

                <button
                  className="primary-btn"
                  onClick={() => {
                    setSelectedBill(client);
                    setShowDetails(true);
                  }}
                >
                  Details
                </button>

                <button
                  className="primary-btn"
                  onClick={() => {
                    setSelectedBill(client);
                    setPaymentModal(true);
                  }}
                >
                  Update
                </button>

              </div>
            </td>
          )}
        </tr>
      );
    })}
</tbody>
      </table>
       </div>
</div>

{showDetails &&
  createPortal(
    <div
      className="modal-overlay"
      onClick={() => setShowDetails(false)}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "90%",
          maxWidth: "900px",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: "20px"
        }}
      >
        {/* HEADER */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px"
  }}
>
  <h3 style={{ margin: 0 }}>
    Client Billing Details
  </h3>


</div>

{/* CLIENT INFO */}
<div
  style={{
    display: "flex",
    gap: "40px",
    marginBottom: "15px"
  }}
>
  <div>
    <div style={{ fontSize: "12px", color: "#666" }}>
      Client
    </div>
    <div style={{ fontWeight: "600" }}>
      {selectedBill?.client_name}
    </div>
  </div>

  <div>
    <div style={{ fontSize: "12px", color: "#666" }}>
      Contract
    </div>
    <div style={{ fontWeight: "600" }}>
      ₹{getClientTotal(selectedBill?.client_name)}
    </div>
  </div>
</div>

        <hr />

        <h4 style={{ margin: "10px 0" }}>Entries</h4>

        {/* TABLE SCROLL */}
        <div
          style={{
            overflowY: "auto",
            overflowX: "auto",
            maxHeight: "50vh"
          }}
        >
          <table className="task-table">
            <thead>
              <tr>
                <th>Content</th>
                <th>Description</th>
                <th>Count</th>
                <th>Credited</th>
                <th>Logged By</th>
              </tr>
            </thead>

<tbody>
  {(() => {
    const entries = bills.filter(
      (b) =>
        b.client_name === selectedBill?.client_name
    );

    console.log("Selected Client:", selectedBill?.client_name);
    console.log("All Bills:", bills);
    console.log("Filtered Entries:", entries);

    return entries.map((entry) => (
      <tr key={entry.id}>
        <td>{entry.content_type}</td>
        <td>{entry.content_description || "-"}</td>
        <td>{entry.content_count}</td>

        <td>
          ₹{entry.amount_credited}
          <div style={{ fontSize: "11px", color: "#888" }}>
            {entry.created_at?.split("T")[0]}
          </div>
        </td>

        <td>{entry.logged_by || "-"}</td>
      </tr>
    ));
  })()}
</tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body
  )}
      {/* PAYMENT MODAL */}
      {isEditableUser && paymentModal &&
        createPortal(
          <div className="modal-overlay" onClick={() => setPaymentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
<h3>Add Bill Entry</h3>

<select
  name="client_name"
  value={form.client_name}
  onChange={handleChange}
>
  <option value="">Select Client</option>
  {clients.map((c, i) => (
    <option key={i} value={c.client_name}>{c.client_name}</option>
  ))}
</select>

<input
  name="bill_type"
  placeholder="Bill Type"
  onChange={handleChange}
/>

<input
  name="content_type"
  placeholder="Content"
  onChange={handleChange}
/>

<input
  name="content_count"
  type="number"
  placeholder="Content Count"
  onChange={handleChange}
/>

<input
  name="content_description"
  placeholder="Description"
  onChange={handleChange}
/>

<input
  name="amount_credited"
  type="number"
  placeholder="Amount Credited"
  onChange={handleChange}
/>

<div style={{ display: "flex", gap: "10px" }}>
  <button onClick={handleSubmit}>Save</button>
  <button onClick={() => setPaymentModal(false)}>Cancel</button>
</div>
            </div>
          </div>,
          document.body
        )
      }

    </div>
  );
};

export default BillingSection;