import { useRef, useState } from "react"
import { UploadCloud, FileText } from "lucide-react"
import "./dropzone.scss"

/**
 * Accessible drag-and-drop file zone.
 *
 * - The file input is sr-only (NOT `hidden`) so it stays keyboard-focusable.
 * - Whole zone is clickable; inner interactive elements (remove button, links)
 *   still work because clicks on them don't reopen the picker.
 * - `children` may be a render-prop `({ hasFile, dragActive }) => node`;
 *   when omitted, a sensible default (icon + filename + hint) is rendered.
 */
export function Dropzone({
  value,
  onChange,
  accept = ".pdf",
  maxSizeMB = 5,
  onReject,
  disabled = false,
  className = "",
  children,
  ...rest
}) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)
  const maxBytes = maxSizeMB * 1024 * 1024

  const openPicker = () => inputRef.current?.click()

  const processFiles = (fileList) => {
    const file = fileList?.[0]
    if (!file) return
    const ext = accept.replace(/^\./, "").toLowerCase()
    const typeOk =
      accept === "*" || file.name.toLowerCase().endsWith(`.${ext}`) || file.type === accept
    if (file.size > maxBytes) {
      onReject?.("size", file)
    } else if (!typeOk) {
      onReject?.("type", file)
    } else {
      onChange?.(file)
    }
  }

  const handleDragOver = (e) => {
    if (disabled) return
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    if (disabled) return
    if (e.currentTarget.contains(e.relatedTarget)) return
    setDragActive(false)
  }

  const handleDrop = (e) => {
    if (disabled) return
    e.preventDefault()
    setDragActive(false)
    processFiles(e.dataTransfer.files)
  }

  const handleClick = (e) => {
    if (disabled) return
    if (e.target.closest("button, a, input, [role='button']")) return
    openPicker()
  }

  const state = { hasFile: Boolean(value), dragActive }
  const rendered = typeof children === "function" ? children(state) : children

  const classes = [
    "ui-dropzone",
    dragActive ? "ui-dropzone--dragover" : "",
    value ? "ui-dropzone--has-file" : "",
    disabled ? "ui-dropzone--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      className={classes}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...rest}
    >
      <input
        ref={inputRef}
        type="file"
        className="ui-dropzone__input"
        accept={accept}
        disabled={disabled}
        aria-label={`Upload file (${accept}, max ${maxSizeMB} MB)`}
        onChange={(e) => {
          processFiles(e.target.files)
          e.target.value = ""
        }}
      />
      {rendered ?? (
        <div className="ui-dropzone__content">
          {value ? (
            <FileText className="ui-dropzone__icon" size={28} />
          ) : (
            <UploadCloud className="ui-dropzone__icon" size={28} />
          )}
          <p className="ui-dropzone__primary">
            {value ? value.name : "Drop your resume here or browse"}
          </p>
          <p className="ui-dropzone__hint">
            {value ? "Click to replace" : `PDF, up to ${maxSizeMB} MB`}
          </p>
        </div>
      )}
    </div>
  )
}
