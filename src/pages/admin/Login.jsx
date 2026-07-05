import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/aai-logo.png";
import "../../App.css";

const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || "admin";
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (username === adminUsername && password === adminPassword) {
      localStorage.setItem("adminAuth", "true");
      navigate("/admin");
      return;
    }

    setError("Invalid admin username or password.");
  };

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <img src={logo} alt="AAI Logo" className="login-logo" />

        <h1>Admin Login</h1>
        <p>Airport Customer Satisfaction Dashboard</p>

        {error && <div className="login-error">{error}</div>}

        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        <button type="submit" className="login-btn">
          Login
        </button>
      </form>
    </main>
  );
}

export default Login;