import "./card.scss"

/**
 * @typedef {"default" | "interactive"} CardVariant
 */

export function Card({
  variant = "default",
  padded = true,
  className = "",
  children,
  ...rest
}) {
  const classes = [
    "ui-card",
    `ui-card--${variant}`,
    padded ? "ui-card--padded" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}
