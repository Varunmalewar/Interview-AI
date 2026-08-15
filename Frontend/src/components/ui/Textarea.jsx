import { useId } from "react"
import "./input.scss"

/**
 * Multiline textarea with label, hint, error and a live char counter
 * (counter only shown when a maxLength is provided).
 * `ref` is a plain prop (React 19 — no forwardRef needed).
 */
export function Textarea({
  label,
  error,
  hint,
  maxLength,
  id,
  className = "",
  value,
  onChange,
  ...rest
}) {
  const autoId = useId()
  const inputId = id ?? autoId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const countId = `${inputId}-count`
  const describedBy = [error ? errorId : "", hint && !error ? hintId : "", maxLength ? countId : ""]
    .filter(Boolean)
    .join(" ") || undefined

  const classes = ["ui-input", "ui-input--textarea", error ? "ui-input--error" : "", className]
    .filter(Boolean)
    .join(" ")

  const length = typeof value === "string" ? value.length : 0

  return (
    <div className={classes}>
      <div className="ui-input__label-row">
        {label && (
          <label className="ui-input__label" htmlFor={inputId}>
            {label}
          </label>
        )}
        {maxLength && (
          <span className="ui-input__count" id={countId}>
            {length} / {maxLength} chars
          </span>
        )}
      </div>
      <textarea
        id={inputId}
        className="ui-input__control"
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
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
