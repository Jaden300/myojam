import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import Logo from "./Logo"
import { t, getLang, setLang } from "./i18n"

export default function Navbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [lang, setLangState] = useState(getLang())

  useEffect(() => {
    const handler = () => setLangState(getLang())
    window.addEventListener("langchange", handler)
    return () => window.removeEventListener("langchange", handler)
  }, [])

  function switchLang(l) {
    setLang(l)
    setLangState(l)
  }

  const links = [
    [t("nav_howItWorks"), "/how-it-works"],
    [t("nav_education"),  "/education"],
    [t("nav_about"),      "/about"],
    [t("nav_team"),       "/team"],
    [t("nav_contact"),    "/contact"],
  ]

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(255,255,255,0.82)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
      height: 52, padding: "0 32px",
      display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      <div onClick={() => navigate("/")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
        <Logo size={26} />
        <span style={{ fontFamily: "var(--font)", fontWeight: 600, fontSize: 17, letterSpacing: "-0.3px", color: "var(--text)" }}>myojam</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {links.map(([label, path]) => (
          <span key={path} onClick={() => navigate(path)} style={{
            fontSize: 14, fontWeight: 400, cursor: "pointer",
            color: pathname === path ? "var(--accent)" : "var(--text-secondary)",
            transition: "color 0.15s"
          }}>{label}</span>
        ))}

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
            fontFamily: "var(--font)", fontWeight: 500, textDecoration: "none"
          }}>{t("nav_download")}</a>
      </div>
    </nav>
  )
}