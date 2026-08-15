import { Spinner } from "./Spinner.jsx"
import "./button.scss"

/**
 * @typedef {"primary" | "secondary" | "ghost"} ButtonVariant
 * @typedef {"sm" | "md" | "lg"} ButtonSize
 */

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon = null,
  iconPosition = "left",
  fullWidth = false,
  type = "button",
  className = "",
  children,
  disabled,
  ...rest
}) {
  const classes = [
    "ui-button",
    `ui-button--${variant}`,
    `ui-button--${size}`,
    loading ? "ui-button--loading" : "",
    fullWidth ? "ui-button--full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <Spinner size="sm" />
      ) : (
        icon &&
        iconPosition === "left" && (
          <span className="ui-button__icon" aria-hidden="true">
            {icon}
          </span>
        )
      )}
      <span className="ui-button__label">{children}</span>
      {!loading && icon && iconPosition === "right" && (
        <span className="ui-button__icon" aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  )
}
