/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react"
import { CircleCheck, CircleAlert, Info, X } from "lucide-react"
import "./toast.scss"

const ToastContext = createContext(null)

let idCounter = 0
const nextId = () => `toast-${++idCounter}`

const TONE_ICONS = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
}

function ToastItem({ item, onDismiss }) {
  useEffect(() => {
    if (item.duration == null) return
    const timer = setTimeout(() => onDismiss(item.id), item.duration)
    return () => clearTimeout(timer)
  }, [item.id, item.duration, onDismiss])

  const Icon = TONE_ICONS[item.type] ?? Info

  return (
    <div
      className={`ui-toast ui-toast--${item.type}`}
      role={item.type === "error" ? "alert" : "status"}
    >
      <span className="ui-toast__icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div className="ui-toast__body">
        {item.title && <p className="ui-toast__title">{item.title}</p>}
        <p className="ui-toast__message">{item.message}</p>
      </div>
      <button
        type="button"
        className="ui-toast__close"
        aria-label="Dismiss notification"
        onClick={() => onDismiss(item.id)}
      >
        <X size={16} />
      </button>
    </div>
  )
}

export function ToastProvider({ children, duration = 5000 }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((prev) => (id == null ? [] : prev.filter((t) => t.id !== id)))
  }, [])

  const push = useCallback(
    (type) =>
      (message, opts = {}) => {
        const id = nextId()
        setToasts((prev) => [
          ...prev,
          {
            id,
            type,
            message,
            title: opts.title,
            duration: opts.duration ?? duration,
          },
        ])
        return id
      },
    [duration],
  )

  const toast = useMemo(
    () => ({
      success: push("success"),
      error: push("error"),
      info: push("info"),
      dismiss,
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="ui-toast-viewport" role="region" aria-label="Notifications">
        {toasts.map((item) => (
          <ToastItem key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>")
  return ctx
}
