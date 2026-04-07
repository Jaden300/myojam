import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "./Footer"

const ARTICLES = [
  {
    slug: "/education/emg-explainer",
    tag: "Foundations",
    title: "The science of muscle-computer interfaces",
    summary: "What is EMG, how does surface signal acquisition work, and how does myojam turn a forearm twitch into a computer action? A full explainer from the biology up.",
    readTime: "8 min read",
    author: "Jaden W.",
  },
  // future articles go here
]

export default function Education() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* Banner */}
      <div style={{
        background: "linear-gradient(135deg, #fff0f5 0%, #ffffff 60%)",
        borderBottom: "1px solid var(--border)",
        padding: "100px 32px 64px",
      }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--accent-soft)", border: "1px solid rgba(255,45,120,0.15)",
            borderRadius: 100, padding: "5px 16px",
            fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 28
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }}/>
            Educational hub
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 600,
            letterSpacing: "-1.5px", color: "var(--text)", marginBottom: 20, lineHeight: 1.08
          }}>
            Learn about EMG<br />
            <span style={{ color: "var(--accent)" }}>& assistive technology.</span>
          </h1>
          <p style={{
            fontSize: 17, color: "var(--text-secondary)", fontWeight: 300,
            lineHeight: 1.7, maxWidth: 560
          }}>
            In-depth articles on the science behind myojam — from how muscles generate electrical signals
            to how machine learning classifies them into computer actions.
          </p>
        </div>
      </div>

      {/* Article cards */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "64px 32px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {ARTICLES.map(a => (
            <div
              key={a.slug}
              onClick={() => navigate(a.slug)}
              style={{
                background: "var(--bg-secondary)", border: "1px solid var(--border)",
                borderRadius: "var(--radius)", padding: "32px",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-3px)"
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,45,120,0.09)"
                e.currentTarget.style.borderColor = "rgba(255,45,120,0.2)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "none"
                e.currentTarget.style.borderColor = "var(--border)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 500, color: "var(--accent)",
                      background: "var(--accent-soft)", border: "1px solid rgba(255,45,120,0.15)",
                      borderRadius: 100, padding: "3px 10px"
                    }}>{a.tag}</span>
                    <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300 }}>{a.readTime}</span>
                  </div>
                  <h2 style={{
                    fontSize: 20, fontWeight: 600, color: "var(--text)",
                    letterSpacing: "-0.3px", marginBottom: 10, lineHeight: 1.3
                  }}>{a.title}</h2>
                  <p style={{
                    fontSize: 14, color: "var(--text-secondary)",
                    lineHeight: 1.7, fontWeight: 300, marginBottom: 16
                  }}>{a.summary}</p>
                  <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 300 }}>
                    By {a.author}
                  </span>
                </div>
                <span style={{ fontSize: 20, color: "var(--text-tertiary)", flexShrink: 0, marginTop: 4 }}>→</span>
              </div>
            </div>
          ))}
        </div>

        <p style={{
          marginTop: 48, fontSize: 13, color: "var(--text-tertiary)",
          fontWeight: 300, textAlign: "center", lineHeight: 1.7
        }}>
          More articles coming soon — covering signal processing, machine learning for biosignals,
          and the future of assistive input devices.
        </p>
      </div>

      <Footer />
    </div>
  )
}