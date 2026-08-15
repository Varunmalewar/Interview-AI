import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { Lock, Mail, User, UserPlus } from "lucide-react"
import "../auth.scss"
import { useAuth } from "../Hooks/useAuth"
import { Input } from "../../../components/ui/Input.jsx"
import { Button } from "../../../components/ui/Button.jsx"
import { Alert } from "../../../components/ui/Alert.jsx"

const Register = () => {
  const navigate = useNavigate()
  const { loading, handleRegister } = useAuth()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")
    const { data, error } = await handleRegister({ username, email, password })

    if (data && !error) {
      navigate("/")
    } else {
      setErrorMessage(error || "Registration failed")
    }
  }

  return (
    <main className="auth-page">
      <div className="form-container">
        <header className="form-header">
          <h1>Create your account</h1>
          <p>Join InterviewAI and build your custom interview strategy.</p>
        </header>

        {errorMessage && <Alert tone="error">{errorMessage}</Alert>}

        <form onSubmit={handleSubmit}>
          <Input
            label="Username"
            type="text"
            id="username"
            placeholder="e.g. alexgarcia"
            leftIcon={<User size={16} />}
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
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
            placeholder="Create a strong password"
            leftIcon={<Lock size={16} />}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={loading}
            icon={<UserPlus size={18} />}
          >
            Register
          </Button>
        </form>

        <p className="form-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  )
}

export default Register
