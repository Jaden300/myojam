import { useNavigate, useLocation } from "react-router-dom"
import Logo from "./Logo"

export default function Navbar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const links = [
    ["How it works", "/how-it-works"],
    ["About", "/about"],
    ["Team", "/team"],
    ["Contact", "/contact"],
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
        <span style={{
          fontFamily: "var(--font)", fontWeight: 600,
          fontSize: 17, letterSpacing: "-0.3px", color: "var(--text)"
        }}>myojam</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {links.map(([label, path]) => (
          <span key={label} onClick={() => navigate(path)} style={{
            fontSize: 14, fontWeight: 400, cursor: "pointer",
            color: pathname === path ? "var(--accent)" : "var(--text-secondary)",
            transition: "color 0.15s"
          }}>{label}</span>
        ))}
        <a href="https://github.com/Jaden300/myojam"
          target="_blank" rel="noreferrer"
          style={{
            fontSize: 14, color: "var(--text-secondary)",
            textDecoration: "none"
          }}>GitHub</a>
        <button onClick={() => navigate("/demo")} style={{
          background: "var(--accent)", color: "#fff",
          border: "none", borderRadius: 100,
          padding: "7px 20px", fontSize: 14,
          fontFamily: "var(--font)", fontWeight: 500,
          cursor: "pointer", letterSpacing: "-0.1px"
        }}>Try demo</button>
      </div>
    </nav>
  )
}