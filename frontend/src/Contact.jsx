import Navbar from "./Navbar"
import Footer from "./Footer"

export default function Contact() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "120px 32px 80px" }}>

        <p style={{
          fontSize: 13, fontWeight: 500, color: "var(--accent)",
          letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 16
        }}>Contact</p>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 600,
          letterSpacing: "-2px", lineHeight: 1.05, marginBottom: 24
        }}>Get in touch.</h1>

        <p style={{
          fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.7,
          fontWeight: 300, marginBottom: 56
        }}>Questions about the project, research collaboration, or building on top of myojam? Reach out.</p>

        {/* Links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 56 }}>
          {[
            ["GitHub", "Open an issue or pull request", "https://github.com/Jaden300/myosignal"],
            ["Ninapro dataset", "Source data for the model", "https://ninapro.hevs.ch"],
          ].map(([label, desc, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer"
              style={{
                background: "var(--bg-secondary)", border: "1px solid var(--border)",
                borderRadius: "var(--radius)", padding: "20px 24px",
                display: "flex", justifyContent: "space-between",
                alignItems: "center", textDecoration: "none",
                transition: "border-color 0.15s, box-shadow 0.15s"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(255,45,120,0.3)"
                e.currentTarget.style.boxShadow = "0 4px 24px rgba(255,45,120,0.08)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300 }}>{desc}</div>
              </div>
              <span style={{ fontSize: 18, color: "var(--text-tertiary)" }}>↗</span>
            </a>
          ))}
        </div>

        {/* Message form */}
        <div style={{
          background: "var(--bg-secondary)", borderRadius: "var(--radius)",
          padding: "32px", border: "1px solid var(--border)"
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>Send a message</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[["Name", "text", "Your name"], ["Email", "email", "your@email.com"]].map(([label, type, placeholder]) => (
              <div key={label}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 6 }}>{label}</div>
                <input type={type} placeholder={placeholder} style={{
                  width: "100%", background: "var(--surface)",
                  border: "1px solid var(--border-mid)", borderRadius: "var(--radius-sm)",
                  padding: "10px 14px", color: "var(--text)",
                  fontFamily: "var(--font)", fontSize: 14, outline: "none"
                }}
                  onFocus={e => e.target.style.borderColor = "var(--accent)"}
                  onBlur={e => e.target.style.borderColor = "var(--border-mid)"}
                />
              </div>
            ))}
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 6 }}>Message</div>
              <textarea rows={4} placeholder="What's on your mind?" style={{
                width: "100%", background: "var(--surface)",
                border: "1px solid var(--border-mid)", borderRadius: "var(--radius-sm)",
                padding: "10px 14px", color: "var(--text)",
                fontFamily: "var(--font)", fontSize: 14, outline: "none", resize: "vertical"
              }}
                onFocus={e => e.target.style.borderColor = "var(--accent)"}
                onBlur={e => e.target.style.borderColor = "var(--border-mid)"}
              />
            </div>
            <button
              onClick={() => window.location.href = "mailto:your@email.com"}
              style={{
                background: "var(--accent)", color: "#fff",
                border: "none", borderRadius: 100,
                padding: "11px 28px", fontSize: 14,
                fontFamily: "var(--font)", fontWeight: 500,
                cursor: "pointer", alignSelf: "flex-start"
              }}>Send message</button>
          </div>
        </div>

        <p style={{
          marginTop: 40, fontSize: 13, color: "var(--text-tertiary)",
          lineHeight: 1.6, fontWeight: 300
        }}>
          myojam is an open-source student research project. MIT License. Not a medical device.
        </p>
      </div>
    </div>
  )
}