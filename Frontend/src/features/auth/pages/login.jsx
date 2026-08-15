import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { Lock, LogIn, Mail } from "lucide-react"
import "../auth.scss"
import { useAuth } from "../Hooks/useAuth"
import { Input } from "../../../components/ui/Input.jsx"
import { Button } from "../../../components/ui/Button.jsx"
import { Alert } from "../../../components/ui/Alert.jsx"

const Login = () => {
  const { loading, handleLogin } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")
    const { data, error } = await handleLogin({ email, password })

    if (data && !error) {
      navigate("/")
    } else {
      setErrorMessage(error || "Invalid email or password")
    }
  }

  return (
    <main className="auth-page">
      <div className="form-container">
        <header className="form-header">
          <h1>Welcome back</h1>
          <p>Log in to view and create your interview plans.</p>
        </header>

        {errorMessage && <Alert tone="error">{errorMessage}</Alert>}

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            id="email"
            placeholder="you@example.com"
            leftIcon={<Mail size={16} />}
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            id="password"
            placeholder="Your password"
            leftIcon={<Lock size={16} />}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" size="lg" fullWidth loading={loading} icon={<LogIn size={18} />}>
            Login
          </Button>
        </form>

        <p className="form-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </main>
  )
}

export default Login
