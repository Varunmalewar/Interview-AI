import React, { useState } from "react";
import "../auth.form.scss";
import { Link } from "react-router";
import { useAuth } from "../Hooks/useAuth";
import { useNavigate } from "react-router";

const Login = () => {
    const { loading, handleLogin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handlesubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        const { data, error } = await handleLogin({ email, password });

        if (data && !error) {
            navigate("/");
        } else {
            setErrorMessage(error || "Invalid email or password");
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
                <h1>Login</h1>
                {errorMessage && <p className="error-message" style={{ color: "#ef4444", marginBottom: "1rem" }}>{errorMessage}</p>}
                <form onSubmit={handlesubmit}>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            value={email}
                            onChange={(e) => { setEmail(e.target.value) }}
                            type="email" id="email" placeholder="Email" required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            value={password}
                            onChange={(e) => { setPassword(e.target.value) }}
                            type="password" id="password" placeholder="Password" required />
                    </div>
                    <button className="button primary-button" type="submit">Login</button>
                </form>
                <p>Don't have an account? <Link to="/register">Register</Link></p>
            </div>
        </main>
    )
};

export default Login;

