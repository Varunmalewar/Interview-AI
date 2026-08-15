import "./skeleton.scss"

/**
 * @typedef {"rect" | "text" | "circle"} SkeletonVariant
 */

export function Skeleton({ width, height, variant = "rect", radius, className = "", ...rest }) {
  const style = {
    width,
    height,
    borderRadius: radius,
  }

  const classes = [
    "ui-skeleton",
    `ui-skeleton--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return <div className={classes} style={style} aria-hidden="true" {...rest} />
}
