import { useState } from "react";
import { API } from "../../config";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleReset = async () => {
    if (!token || !password) {
      alert("Fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message || "Reset failed");
        return;
      }

      alert("✅ Password reset successful");
      navigate("/admin/login");
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
        <h2 style={titleStyle}>🔄 Reset Password</h2>

        <input
          placeholder="Paste reset token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleReset} style={buttonStyle}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </div>
    </div>
  );
}

/* same styles */

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
  background: "linear-gradient(135deg, #22c55e, #06b6d4)",
  color: "#fff",
};

export default ResetPassword;