import { useState } from "react";
import { API } from "../../config";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRequest = async () => {
    if (!username) {
      alert("Enter username");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Failed");
        return;
      }

      setToken(data.token); // 🔥 Show token for now
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
        <h2 style={titleStyle}>🔑 Forgot Password</h2>

        <input
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleRequest} style={buttonStyle}>
          {loading ? "Generating..." : "Generate Reset Token"}
        </button>

        {token && (
          <div style={{ marginTop: "15px", color: "#22c55e" }}>
            <p>🔐 Your Reset Token:</p>
            <small style={{ wordBreak: "break-all" }}>{token}</small>
          </div>
        )}

        <p style={linkStyle} onClick={() => navigate("/admin/reset")}>
          Go to Reset Password →
        </p>
      </div>
    </div>
  );
}

/* reuse styles */

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

const titleStyle = { color: "#fff", marginBottom: "20px" };

const inputStyle = {
  width: "100%",
  padding: "12px",
  margin: "10px 0",
  borderRadius: "8px",
  border: "none",
  background: "rgba(255,255,255,0.1)",
  color: "#fff",
};

const buttonStyle = {
  marginTop: "15px",
  padding: "12px",
  width: "100%",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(135deg, #f59e0b, #ef4444)",
  color: "#fff",
};

const linkStyle = {
  marginTop: "15px",
  fontSize: "13px",
  color: "#38bdf8",
  cursor: "pointer",
};

export default ForgotPassword;