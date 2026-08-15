import { createContext, useCallback, useContext, useState } from "react"
import { ChevronDown } from "lucide-react"
import "./accordion.scss"

/**
 * Compound accordion. Wrap items in <Accordion> for single/multi-open
 * behavior; <AccordionItem> also works standalone (self-managed).
 */

const AccordionContext = createContext(null)

export function Accordion({ allowMultiple = false, defaultOpenIds = [], className = "", children }) {
  const [openIds, setOpenIds] = useState(() => new Set(defaultOpenIds))

  const toggle = useCallback(
    (id) => {
      setOpenIds((prev) => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          if (!allowMultiple) next.clear()
          next.add(id)
        }
        return next
      })
    },
    [allowMultiple],
  )

  return (
    <AccordionContext.Provider value={{ openIds, toggle }}>
      <div className={["ui-accordion", className].filter(Boolean).join(" ")}>{children}</div>
    </AccordionContext.Provider>
  )
}

export function AccordionItem({
  id,
  summary,
  defaultOpen = false,
  className = "",
  children,
  ...rest
}) {
  const ctx = useContext(AccordionContext)
  const [localOpen, setLocalOpen] = useState(defaultOpen)

  const isOpen = ctx ? ctx.openIds.has(id) : localOpen
  const toggle = () => (ctx ? ctx.toggle(id) : setLocalOpen((o) => !o))

  const triggerId = `${id}-trigger`
  const panelId = `${id}-panel`

  const classes = [
    "ui-accordion-item",
    isOpen ? "ui-accordion-item--open" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className={classes} {...rest}>
      <h3 className="ui-accordion-item__heading">
        <button
          type="button"
          id={triggerId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="ui-accordion-item__trigger"
          onClick={toggle}
        >
          <span className="ui-accordion-item__summary">{summary}</span>
          <ChevronDown className="ui-accordion-item__chevron" size={18} aria-hidden="true" />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        hidden={!isOpen}
        className="ui-accordion-item__panel"
      >
        {children}
      </div>
    </div>
  )
}
