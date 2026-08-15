import { useId } from "react"
import "./input.scss"

/**
 * Text input with label, hint, error and optional left icon.
 * `ref` is a plain prop (React 19 — no forwardRef needed).
 */
export function Input({
  label,
  error,
  hint,
  leftIcon = null,
  id,
  className = "",
  type = "text",
  ...rest
}) {
  const autoId = useId()
  const inputId = id ?? autoId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const describedBy = [error ? errorId : "", hint && !error ? hintId : ""]
    .filter(Boolean)
    .join(" ") || undefined

  const classes = ["ui-input", error ? "ui-input--error" : "", className].filter(Boolean).join(" ")

  return (
    <div className={classes}>
      {label && (
        <label className="ui-input__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="ui-input__field">
        {leftIcon && (
          <span className="ui-input__icon" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          type={type}
          className="ui-input__control"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
      </div>
      {error && (
        <p className="ui-input__message ui-input__message--error" id={errorId} role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="ui-input__message" id={hintId}>
          {hint}
        </p>
      )}
    </div>
  )
}
