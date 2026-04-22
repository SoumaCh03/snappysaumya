import { useState } from "react";
import { API } from "../../config";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Login failed");
        return;
      }

      // ✅ Save token
      localStorage.setItem("admin_token", data.token);

      // 🚀 Redirect
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={wrapperStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>🔐 Admin Login</h2>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            ...buttonStyle,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* 🔥 NEW: Forgot Password */}
        <p
          style={forgotStyle}
          onClick={() => navigate("/admin/forgot")}
        >
          Forgot password?
        </p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const wrapperStyle = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #020617, #0f172a)",
};

const cardStyle = {
  width: "320px",
  padding: "35px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(20px)",
  boxShadow: "0 0 40px rgba(0,255,255,0.15)",
  textAlign: "center",
};

const titleStyle = {
  color: "#fff",
  marginBottom: "20px",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  margin: "10px 0",
  borderRadius: "8px",
  border: "none",
  outline: "none",
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
};

const buttonStyle = {
  marginTop: "15px",
  padding: "12px",
  width: "100%",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg, #22c55e, #06b6d4)",
  color: "#fff",
  fontWeight: "bold",
};

const forgotStyle = {
  marginTop: "15px",
  fontSize: "13px",
  color: "#9ca3af",
  cursor: "pointer",
};

export default Login;