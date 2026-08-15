import "./badge.scss"

/**
 * @typedef {"neutral" | "accent" | "success" | "warning" | "danger" | "info" | "intention"} BadgeTone
 * @typedef {"soft" | "solid" | "outline"} BadgeVariant
 */

export function Badge({ tone = "neutral", variant = "soft", className = "", children, ...rest }) {
  const classes = [
    "ui-badge",
    `ui-badge--${tone}`,
    `ui-badge--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  )
}
