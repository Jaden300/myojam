import { useNavigate } from "react-router-dom"

export default function Footer() {
  const navigate = useNavigate()
  return (
    <footer style={{
      borderTop: "1px solid var(--border)",
      padding: "32px",
      marginTop: 80,
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 16
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>myojam</span>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 300 }}>
              Open source · MIT License · Built on Ninapro DB5
            </span>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            {[
              ["Terms of Service", "/terms"],
              ["Privacy Policy", "/privacy"],
              ["Team", "/team"],
              ["GitHub", "https://github.com/Jaden300/myosignal"],
            ].map(([label, href]) => (
              href.startsWith("http")
                ? <a key={label} href={href} target="_blank" rel="noreferrer" style={{
                    fontSize: 13, color: "var(--text-tertiary)", fontWeight: 300,
                    textDecoration: "none"
                  }}>{label}</a>
                : <span key={label} onClick={() => navigate(href)} style={{
                    fontSize: 13, color: "var(--text-tertiary)", fontWeight: 300,
                    cursor: "pointer"
                  }}>{label}</span>
            ))}
          </div>
        </div>
        <div style={{
          marginTop: 16, fontSize: 12,
          color: "var(--text-tertiary)", fontWeight: 300
        }}>
          © 2025 myojam™. All rights reserved. · Built with ♥ for assistive technology.
        </div>
      </div>
    </footer>
  )
}