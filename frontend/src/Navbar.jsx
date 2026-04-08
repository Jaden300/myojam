import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import Logo from "./Logo"
import { t, getLang, setLang } from "./i18n"
import { IconGear, IconBook, IconBulb, IconPeople, IconRocket, IconBuilding, IconMail, IconDemo } from "./Icons"

function Dropdown({ label, items, pathname }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)
  const active = items.some(([, path]) => pathname === path)
  const timerRef = useRef(null)

  function handleMouseEnter() {
    clearTimeout(timerRef.current)
    setOpen(true)
  }

  function handleMouseLeave() {
    timerRef.current = setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ position: "relative" }}
    >
      <button style={{
        background: "none", border: "none", cursor: "pointer",
        fontFamily: "var(--font)", fontSize: 14, fontWeight: 400, padding: 0,
        color: active || open ? "var(--accent)" : "var(--text-secondary)",
        display: "flex", alignItems: "center", gap: 4,
        transition: "color 0.15s"
      }}>
        {label}
        <span style={{
          fontSize: 9, opacity: 0.5,
          display: "inline-block",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s"
        }}>▾</span>
      </button>

      <div style={{
        position: "absolute", top: "calc(100% + 10px)", left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(255,255,255,0.97)", backdropFilter: "blur(20px)",
        border: "1px solid var(--border)", borderRadius: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.09)",
        minWidth: 200, padding: "6px",
        zIndex: 200,
        pointerEvents: open ? "auto" : "none",
        opacity: open ? 1 : 0,
        transform: open
          ? "translateX(-50%) translateY(0) scale(1)"
          : "translateX(-50%) translateY(-6px) scale(0.97)",
        transition: "opacity 0.15s ease, transform 0.15s ease",
      }}>
        {items.map(([label, path, Icon]) => (
          <button key={path} onClick={() => { navigate(path); setOpen(false) }} style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", textAlign: "left",
            background: pathname === path ? "var(--accent-soft)" : "none",
            border: "none", borderRadius: 10,
            padding: "9px 14px", cursor: "pointer",
            fontFamily: "var(--font)", fontSize: 14, fontWeight: 400,
            color: pathname === path ? "var(--accent)" : "var(--text-secondary)",
            transition: "background 0.12s, color 0.12s"
          }}
            onMouseEnter={e => { if (pathname !== path) { e.currentTarget.style.background = "var(--bg-secondary)"; e.currentTarget.style.color = "var(--text)" }}}
            onMouseLeave={e => { if (pathname !== path) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-secondary)" }}}
          >
            <Icon size={15} color={pathname === path ? "var(--accent)" : "#AEAEB2"} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function NavLink({ label, path, pathname }) {
  const navigate = useNavigate()
  return (
    <span onClick={() => navigate(path)} style={{
      fontSize: 14, fontWeight: 400, cursor: "pointer",
      color: pathname === path ? "var(--accent)" : "var(--text-secondary)",
      transition: "color 0.15s"
    }}
      onMouseEnter={e => { if (pathname !== path) e.currentTarget.style.color = "var(--text)" }}
      onMouseLeave={e => { if (pathname !== path) e.currentTarget.style.color = "var(--text-secondary)" }}
    >{label}</span>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [lang, setLangState] = useState(getLang())

  useEffect(() => {
    const handler = () => setLangState(getLang())
    window.addEventListener("langchange", handler)
    return () => window.removeEventListener("langchange", handler)
  }, [])

  function switchLang(l) { setLang(l); setLangState(l) }

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
      height: 52, padding: "0 32px",
      display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
        <Logo size={26} />
        <span style={{ fontFamily: "var(--font)", fontWeight: 600, fontSize: 17, letterSpacing: "-0.3px", color: "var(--text)" }}>myojam</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>

        <NavLink label="Demos" path="/demos" pathname={pathname} />

        <Dropdown label="Learn" pathname={pathname} items={[
          ["How it works",  "/how-it-works", IconGear],
          ["Education hub", "/education",    IconBook],
          ["For educators", "/educators", IconBook],
        ]} />

        <Dropdown label="Company" pathname={pathname} items={[
          ["About",   "/about",   IconBulb],
          ["Team",    "/team",    IconPeople],
          ["Careers", "/careers", IconRocket],
        ]} />

        <NavLink label="For corporations" path="/corporations" pathname={pathname} />

        <NavLink label="Contact" path="/contact" pathname={pathname} />

        {/* Language toggle */}
        <div style={{
          display: "flex", background: "var(--bg-secondary)",
          border: "1px solid var(--border)", borderRadius: 100, padding: 2
        }}>
          {["en", "fr"].map(l => (
            <button key={l} onClick={() => switchLang(l)} style={{
              background: lang === l ? "#fff" : "transparent",
              border: "none", borderRadius: 100,
              padding: "3px 10px", fontSize: 12, fontWeight: lang === l ? 600 : 400,
              color: lang === l ? "var(--text)" : "var(--text-tertiary)",
              cursor: "pointer", fontFamily: "var(--font)",
              boxShadow: lang === l ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s"
            }}>{l.toUpperCase()}</button>
          ))}
        </div>

        <a href="https://github.com/user-attachments/files/26291771/myojam-mac.zip"
          style={{
            background: "var(--accent)", color: "#fff", border: "none",
            borderRadius: 100, padding: "7px 20px", fontSize: 14,
            fontFamily: "var(--font)", fontWeight: 500, textDecoration: "none",
            transition: "transform 0.15s, box-shadow 0.15s"
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,45,120,0.35)" }}
          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none" }}
        >{t("nav_download")}</a>
      </div>
    </nav>
  )
}