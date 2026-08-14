import { AuthContext } from "../auth.context.jsx"
import { useContext } from "react"
import { login, register, logout } from "../services/auth.api.js"

export const useAuth = () => {
    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true)
        let data = null
        let error = null
        try {
            data = await login({ email, password })
            if (data?.user) {
                setUser(data.user)
            }
        } catch (err) {
            console.error("Login failed", err)
            error = err.response?.data?.message || err.message || "Login failed"
        } finally {
            setLoading(false)
        }

        return { data, error }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true)
        let data = null
        let error = null
        try {
            data = await register({ username, email, password })
            if (data?.user) {
                setUser(data.user)
            }
        } catch (err) {
            console.error("Register failed", err)
            error = err.response?.data?.message || err.message || "Registration failed"
        } finally {
            setLoading(false)
        }

        return { data, error }
    }

    const handleLogout = async () => {
        setLoading(true)
        let data = null
        let error = null
        try {
            data = await logout()
            setUser(null)
        } catch (err) {
            console.error("Logout failed", err)
            error = err.response?.data?.message || err.message || "Logout failed"
        } finally {
            setLoading(false)
        }

        return { data, error }
    }

    return {
        user,
        setUser,
        loading,
        setLoading,
        handleLogin,
        handleRegister,
        handleLogout
    }
}