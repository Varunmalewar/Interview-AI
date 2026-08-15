import "./spinner.scss"

export function Spinner({ size = "md", className = "", ...rest }) {
  const classes = ["ui-spinner", `ui-spinner--${size}`, className].filter(Boolean).join(" ")
  return (
    <span className={classes} role="status" {...rest}>
      <span className="ui-spinner__sr">Loading…</span>
    </span>
  )
}
