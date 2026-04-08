import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "./Footer"
import { t } from "./i18n"

const VALUES = [
  {
    title: "Technology should adapt to people",
    body: "Most assistive tech forces users to conform to hardware constraints. We believe the opposite — the system should learn to understand you, not the other way around.",
  },
  {
    title: "Open source by default",
    body: "Every line of code, every model weight decision, every dataset choice is public. If myojam helps someone, we want them to be able to understand, modify, and build on it.",
  },
  {
    title: "Research-grade, human-scale",
    body: "The underlying science — EMG signal processing, gesture classification, real-time inference — is rigorous. But the experience should feel as simple as flexing a finger.",
  },
]

const TIMELINE = [
  { when: "Late 2024", what: "Project started as a personal challenge: build a working EMG classifier from scratch using public data." },
  { when: "Early 2025", what: "First working pipeline — raw Arduino signal to gesture prediction in under 50ms. Trained on Ninapro DB5 across 10 subjects." },
  { when: "March 2025", what: "Full-stack web demo launched at myojam.com. Live EMG visualization, 3D hand model, and no-hardware dataset mode." },
  { when: "Now", what: "Open source, actively maintained. Personal model training (collect your own data, retrain on your own arm) in progress." },
]

export default function About() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "120px 32px 80px" }}>

        {/* Header */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "var(--accent-soft)", border: "1px solid rgba(255,45,120,0.15)",
          borderRadius: 100, padding: "5px 16px",
          fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 32
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
          {t("landing_badge")}
        </div>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 600,
          letterSpacing: "-2px", lineHeight: 1.05, marginBottom: 28, color: "var(--text)"
        }}>
          We believe muscle<br />signals shouldn't be<br />
          <span style={{ color: "var(--accent)" }}>a barrier.</span>
        </h1>

        <p style={{
          fontSize: 17, color: "var(--text-secondary)", lineHeight: 1.75,
          fontWeight: 300, marginBottom: 64
        }}>
          myojam is an open-source assistive technology project that lets people control a computer
          using surface EMG signals from their forearm — no keyboard, no mouse, no hands required.
          It started as a personal research project and grew into something we think could genuinely
          help people.
        </p>

        {/* Mission */}
        <div style={{
          background: "var(--bg-secondary)", borderRadius: "var(--radius)",
          padding: "40px", border: "1px solid var(--border)", marginBottom: 64
        }}>
          <p style={{
            fontSize: 13, fontWeight: 500, color: "var(--accent)",
            letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 16
          }}>Our mission</p>
          <p style={{
            fontSize: 20, fontWeight: 500, color: "var(--text)",
            lineHeight: 1.6, letterSpacing: "-0.3px"
          }}>
            To make gesture-based human-computer interaction accessible, open, and free —
            starting with people who need it most.
          </p>
        </div>

        {/* What it is */}
        <h2 style={{
          fontSize: 26, fontWeight: 600, letterSpacing: "-0.5px",
          color: "var(--text)", marginBottom: 20
        }}>What myojam actually does</h2>
        <p style={{
          fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.75,
          fontWeight: 300, marginBottom: 48
        }}>
          myojam reads electrical signals from your muscles using surface EMG electrodes — 
          the same technology used in clinical prosthetics research, made accessible with 
          consumer hardware. A machine learning model trained on public research data classifies 
          which hand gesture you're making, and maps it to a real computer action: moving the cursor, 
          clicking, or pressing a key. The whole pipeline runs in under 50ms, locally on your machine.
          No cloud, no subscription, no data sent anywhere.
        </p>

        {/* Values */}
        <h2 style={{
          fontSize: 26, fontWeight: 600, letterSpacing: "-0.5px",
          color: "var(--text)", marginBottom: 24
        }}>What we believe</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 64 }}>
          {VALUES.map((v, i) => (
            <div key={i} style={{
              background: "var(--bg-secondary)", borderRadius: "var(--radius)",
              padding: "28px 32px", border: "1px solid var(--border)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-3px)"
                e.currentTarget.style.boxShadow = "0 10px 32px rgba(255,45,120,0.08)"
                e.currentTarget.style.borderColor = "rgba(255,45,120,0.18)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "none"
                e.currentTarget.style.borderColor = "var(--border)"
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>{v.title}</div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 300 }}>{v.body}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <h2 style={{
          fontSize: 26, fontWeight: 600, letterSpacing: "-0.5px",
          color: "var(--text)", marginBottom: 32
        }}>How we got here</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 64 }}>
          {TIMELINE.map((entry, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "120px 1fr",
              gap: 24, padding: "24px 0",
              borderBottom: i < TIMELINE.length - 1 ? "1px solid var(--border)" : "none"
            }}>
              <div style={{
                fontSize: 13, fontWeight: 500, color: "var(--accent)",
                paddingTop: 2
              }}>{entry.when}</div>
              <div style={{
                fontSize: 14, color: "var(--text-secondary)",
                lineHeight: 1.7, fontWeight: 300
              }}>{entry.what}</div>
            </div>
          ))}
        </div>

        {/* Open source callout */}
        <div style={{
          background: "var(--accent-soft)", borderRadius: "var(--radius)",
          padding: "36px 40px", border: "1px solid rgba(255,45,120,0.15)",
          marginBottom: 48
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>
            myojam is fully open source
          </div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 300, marginBottom: 20 }}>
            The full codebase — signal processing pipeline, ML model, web frontend, FastAPI backend,
            and macOS desktop app — is public on GitHub under the MIT license. Fork it, build on it,
            improve it.
          </p>
          <a
            href="https://github.com/Jaden300/myojam"
            target="_blank" rel="noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 14, fontWeight: 500, color: "var(--accent)",
              textDecoration: "none"
            }}
          >
            View on GitHub ↗
          </a>
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => navigate("/demo")} style={{
            background: "var(--accent)", color: "#fff", border: "none",
            borderRadius: 100, padding: "13px 32px", fontSize: 15,
            fontFamily: "var(--font)", fontWeight: 500, cursor: "pointer",
            boxShadow: "0 4px 24px rgba(255,45,120,0.3)"
          }}>{t("landing_try")}</button>
          <button onClick={() => navigate("/how-it-works")} style={{
            background: "transparent", color: "var(--text)",
            border: "1px solid var(--border-mid)", borderRadius: 100,
            padding: "13px 28px", fontSize: 15,
            fontFamily: "var(--font)", fontWeight: 400, cursor: "pointer",
          }}>How it works</button>
          <button onClick={() => navigate("/team")} style={{
            background: "transparent", color: "var(--text)",
            border: "1px solid var(--border-mid)", borderRadius: 100,
            padding: "13px 28px", fontSize: 15,
            fontFamily: "var(--font)", fontWeight: 400, cursor: "pointer",
          }}>Meet the team</button>
        </div>

      </div>

      <Footer />
    </div>
  )
}