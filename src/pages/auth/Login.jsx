import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import "./login.css";

const Login = () => {
  const { login, user, loading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser(form);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="login-container">
      

      {/* LEFT BRAND PANEL */}
      <div className="login-brand">
       
        <div className="brand-content">
          <img
            src="/logo.png"   // 🔥 replace with your logo path
            alt="DigiSailor"
            className="brand-logo"
          />
          <h1>DigiSailor</h1>
          <p>Manage your team, tasks & clients efficiently</p>
        </div>
      </div>

      {/* RIGHT LOGIN CARD */}
      <div className="login-card">

        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Please login to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="error-text">{error}</div>}

          <button type="submit" className="login-button">
            Login
          </button>

        </form>

      </div>
    </div>
  );
};

export default Login;