import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import "./tabs.scss"

/**
 * Accessible compound tabs: <Tabs><TabList orientation=…><Tab id>…
 * <TabPanel id>…</TabList>. Roving tabindex + arrow/Home/End keys
 * (automatic activation), ARIA wiring, panels stay mounted with `hidden`.
 */

const TabsContext = createContext(null)

function TabsProvider({ defaultActiveId, children }) {
  const [activeId, setActiveState] = useState(defaultActiveId ?? null)
  const tabIds = useMemo(() => [], [])

  const registerTab = useCallback(
    (id) => {
      if (!tabIds.includes(id)) tabIds.push(id)
    },
    [tabIds],
  )

  const setActiveId = useCallback((id) => setActiveState(id), [])

  // Activate the first registered tab if no default was given.
  // Child effects run before this one, so ids are populated by then.
  useEffect(() => {
    if (activeId == null && tabIds.length > 0) {
      setActiveState(tabIds[0])
    }
  }, [activeId, tabIds])

  const value = useMemo(
    () => ({ activeId, setActiveId, registerTab }),
    [activeId, setActiveId, registerTab],
  )

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>
}

export function Tabs({ defaultActiveId, className = "", children }) {
  return (
    <TabsProvider defaultActiveId={defaultActiveId}>
      <div className={["ui-tabs", className].filter(Boolean).join(" ")}>{children}</div>
    </TabsProvider>
  )
}

export function TabList({ orientation = "horizontal", className = "", children, ...rest }) {
  const ctx = useContext(TabsContext)
  const listRef = useRef(null)

  const handleKeyDown = (e) => {
    const tabs = Array.from(listRef.current?.querySelectorAll('[role="tab"]') ?? [])
    if (tabs.length === 0) return

    const vertical = orientation === "vertical"
    let currentIndex = tabs.indexOf(document.activeElement)
    if (currentIndex < 0) currentIndex = 0

    let nextIndex
    if (e.key === "Home") nextIndex = 0
    else if (e.key === "End") nextIndex = tabs.length - 1
    else if (vertical && e.key === "ArrowDown") nextIndex = currentIndex + 1
    else if (vertical && e.key === "ArrowUp") nextIndex = currentIndex - 1
    else if (!vertical && e.key === "ArrowRight") nextIndex = currentIndex + 1
    else if (!vertical && e.key === "ArrowLeft") nextIndex = currentIndex - 1
    else return

    e.preventDefault()
    const wrapped = (nextIndex + tabs.length) % tabs.length
    const id = tabs[wrapped].getAttribute("data-tab-id")
    ctx.setActiveId(id)
    tabs[wrapped].focus()
  }

  const classes = ["ui-tablist", className].filter(Boolean).join(" ")

  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      ref={listRef}
      onKeyDown={handleKeyDown}
      className={classes}
      {...rest}
    >
      {children}
    </div>
  )
}

export function Tab({ id, icon = null, className = "", children, ...rest }) {
  const ctx = useContext(TabsContext)

  useEffect(() => {
    ctx.registerTab(id)
  }, [id, ctx.registerTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const active = ctx.activeId === id
  const classes = ["ui-tab", active ? "ui-tab--active" : "", className].filter(Boolean).join(" ")

  return (
    <button
      type="button"
      role="tab"
      id={`tab-${id}`}
      aria-selected={active}
      aria-controls={`panel-${id}`}
      data-tab-id={id}
      tabIndex={active ? 0 : -1}
      className={classes}
      onClick={() => ctx.setActiveId(id)}
      {...rest}
    >
      {icon && (
        <span className="ui-tab__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="ui-tab__label">{children}</span>
    </button>
  )
}

export function TabPanel({ id, className = "", children }) {
  const ctx = useContext(TabsContext)
  const active = ctx.activeId === id
  const classes = ["ui-tab-panel", active ? "ui-tab-panel--active" : "", className]
    .filter(Boolean)
    .join(" ")

  return (
    <div
      role="tabpanel"
      id={`panel-${id}`}
      aria-labelledby={`tab-${id}`}
      hidden={!active}
      className={classes}
    >
      {children}
    </div>
  )
}
