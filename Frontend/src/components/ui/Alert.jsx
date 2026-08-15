import { CircleAlert, Info, CircleCheck } from "lucide-react"
import "./alert.scss"

/**
 * @typedef {"error" | "info" | "success"} AlertTone
 */

const TONE_ICONS = {
  error: CircleAlert,
  info: Info,
  success: CircleCheck,
}

export function Alert({ tone = "error", title, className = "", children, ...rest }) {
  const Icon = TONE_ICONS[tone] ?? TONE_ICONS.info
  const classes = ["ui-alert", `ui-alert--${tone}`, className].filter(Boolean).join(" ")

  return (
    <div className={classes} role="alert" {...rest}>
      <span className="ui-alert__icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div className="ui-alert__body">
        {title && <p className="ui-alert__title">{title}</p>}
        <div className="ui-alert__content">{children}</div>
      </div>
    </div>
  )
}
