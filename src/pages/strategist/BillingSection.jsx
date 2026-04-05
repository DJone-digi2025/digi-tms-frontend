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

const BillingSection = () => {
  const { user } = useAuth();

const isEditableUser =
  (user?.role === "strategist" && user?.access_type === "full") ||
  user?.role === "manager";

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
  const [contentTypes, setContentTypes] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");

  const fetchBills = async () => {
    try {
      const data = await getBills();
      setBills(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMeta = async () => {
    try {
      const tasks = await getAllTasks();

      setClients([...new Set(tasks.map(t => t.client_name))]);
      setContentTypes([...new Set(tasks.map(t => t.content_type))]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBills();
    fetchMeta();
  }, []);

const handleChange = (e) => {
  const { name, value } = e.target;

  setForm({ ...form, [name]: value });

  // ✅ when client is selected → update summary
if (name === "client_name") {
  fetch(`http://localhost:5000/clients`)
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
  user_id: user.id,
  user_name: user.name,
  role: user.role
});
      setShowModal(false);
setForm({
  client_name: "",
  content_type: "",
  content_count: "",
  content_description: "", // ✅ ADD
  amount_credited: ""
});
      fetchBills();
    } catch (err) {
      console.error(err);
      alert("Failed to add bill");
    }
  };

  const handlePayment = async () => {
    const amount = Number(paymentAmount);

    if (!amount || amount <= 0) {
      alert("Enter valid amount");
      return;
    }

    if (amount > selectedBill.pending_amount) {
      alert("Amount exceeds pending");
      return;
    }

    try {
      await updatePayment(selectedBill.id, amount);
      setPaymentModal(false);
      setPaymentAmount("");
      setSelectedBill(null);
      fetchBills();
    } catch (err) {
      console.error(err);
      alert("Payment update failed");
    }
  };

  return (
    <div>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {isEditableUser && (
          <button className="primary-btn" onClick={() => setShowModal(true)}>
            + Add Bill
          </button>
        )}
      </div>

      <div className="filter-bar">
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
      <table className="task-table" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Client</th>
            <th>Content</th>
            <th>Total</th>
            <th>Credited</th>
            <th>Pending</th>
            

            {isEditableUser && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {bills
            .filter((b) =>
              selectedClient ? b.client_name === selectedClient : true
            )
            .map((b) => (
              <tr key={b.id}>
                <td>{b.client_name}</td>
                <td>{b.content_type}</td>
                <td>₹{b.total_amount}</td>
                <td>₹{b.total_received || b.amount_credited}</td>
                <td>₹{b.pending_amount}</td>

                {isEditableUser && (

                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>

                      <button
                        className="primary-btn"
                        onClick={() => {
                          setSelectedBill(b);
                          setShowDetails(true);
                        }}
                      >
                        Details
                      </button>

                      {isEditableUser && (
                        <button
                          className="primary-btn"
                          onClick={() => {
                            setSelectedBill(b);
                            setPaymentModal(true);
                          }}
                        >
                          Update
                        </button>
                      )}

                    </div>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>

      {/* Add BILL MODAL */}
      {isEditableUser && showModal &&
        createPortal(
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Add Bill</h3>

              <select name="client_name" value={form.client_name} onChange={handleChange}>
                <option value="">Select Client</option>
                {clients.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>

              <p style={{ fontSize: "13px", color: "#555" }}>
                Total Contract: ₹{clientSummary?.total_amount || "-"}
              </p>

              <p style={{ fontSize: "13px", color: "#555" }}>
                Pending: ₹{clientSummary?.pending_amount || "-"}
              </p>

              <select name="content_type" value={form.content_type} onChange={handleChange}>
                <option value="">Select Content</option>
                {contentTypes.map((c, i) => (
                  <option key={i} value={c}>{c}</option>
                ))}
              </select>

              <input name="content_count" type="number" placeholder="Content Count" value={form.content_count} onChange={handleChange} />
              <input
                name="content_description"
                placeholder="Content Description (e.g., Reel for Diwali)"
                value={form.content_description || ""}
                onChange={handleChange}
              />
              <input name="amount_credited" type="number" placeholder="Amount Credited" value={form.amount_credited} onChange={handleChange} />

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={handleSubmit}>Save</button>
                <button onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {showDetails &&
  createPortal(
    <div className="modal-overlay" onClick={() => setShowDetails(false)}>
      <div
        className="modal-content"
        style={{ width: "600px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Client Billing Details</h3>

<div style={{
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "15px",
  padding: "10px",
  background: "#f8fafc",
  borderRadius: "8px"
}}>
  <div>
    <div style={{ fontSize: "12px", color: "#666" }}>Client</div>
    <div style={{ fontWeight: "600" }}>{selectedBill?.client_name}</div>
  </div>

  <div>
    <div style={{ fontSize: "12px", color: "#666" }}>Contract</div>
    <div>₹{selectedBill?.total_amount}</div>
  </div>

  <div>
    <div style={{ fontSize: "12px", color: "#666" }}>Received</div>
    <div style={{ color: "green" }}>₹{selectedBill?.total_received}</div>
  </div>

  <div>
    <div style={{ fontSize: "12px", color: "#666" }}>Pending</div>
    <div style={{ color: "red" }}>₹{selectedBill?.pending_amount}</div>
  </div>
</div>

        <hr />

        <h4 style={{ marginTop: "10px" }}>Entries</h4>

        <div style={{ maxHeight: "300px", overflowY: "auto" }}>
          <table className="task-table">
            <thead>
              <tr>
                <th>Content</th>
                <th>Description</th>
                <th>Count</th>
                <th>Credited</th>
              </tr>
            </thead>
            <tbody>
              {bills
                .filter(b => b.client_name === selectedBill?.client_name)
                .map((entry) => (
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
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: "15px" }}>
          <button onClick={() => setShowDetails(false)}>Close</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

      {/* PAYMENT MODAL */}
      {isEditableUser && paymentModal &&
        createPortal(
          <div className="modal-overlay" onClick={() => setPaymentModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Update Payment</h3>

              <p>Client: {selectedBill?.client_name}</p>
              <p>Pending: ₹{selectedBill?.pending_amount}</p>

              <input
                type="number"
                placeholder="Enter amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />

              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={handlePayment}>Save</button>
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