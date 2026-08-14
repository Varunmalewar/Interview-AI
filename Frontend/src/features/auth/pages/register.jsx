import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../Hooks/useAuth";
import "../auth.form.scss";

const Register = () => {
  const navigate = useNavigate();
  const { loading, handleRegister } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handlesubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const { data, error } = await handleRegister({ username, email, password });

    if (data && !error) {
      navigate("/");
    } else {
      setErrorMessage(error || "Registration failed");
    }
  }

  if (loading) {
    return (
      <main>
        <p>Loading...</p>
      </main>
    )
  }

  return (
    <main>
      <div className="form-container">
        <h1>Register</h1>
        {errorMessage && <p className="error-message" style={{ color: "#ef4444", marginBottom: "1rem" }}>{errorMessage}</p>}
        <form onSubmit={handlesubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text" id="username" placeholder="Username" required />
          </div>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email" id="email" placeholder="Email" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password" id="password" placeholder="Password" required />
          </div>
          <button className="button primary-button" type="submit">Register</button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </main>
  )
};

export default Register;

