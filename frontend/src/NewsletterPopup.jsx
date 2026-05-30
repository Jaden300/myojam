import { useState, useEffect } from "react"
import ContactForm from "./components/ContactForm"

export default function NewsletterPopup() {
  const [show, setShow] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("newsletter_shown")) return
    const t = setTimeout(() => setShow(true), 10000)
    return () => clearTimeout(t)
  }, [])

  function close() {
    setClosing(true)
    sessionStorage.setItem("newsletter_shown", "true")
    setTimeout(() => { setShow(false); setClosing(false) }, 300)
  }

  if (!show) return null

  return (
    <>
      <style>{`
        @keyframes overlayIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes overlayOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes panelIn  { from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); } to { opacity: 1; transform: translate(-50%, -50%) scale(1); } }
        @keyframes panelOut { from { opacity: 1; transform: translate(-50%, -50%) scale(1); } to { opacity: 0; transform: translate(-50%, -48%) scale(0.96); } }
      `}</style>

      {/* Overlay - just the dark bg, no flex, no children */}
      <div onClick={close} style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)",
        animation: `${closing ? "overlayOut" : "overlayIn"} 0.3s ease forwards`
      }} />

      {/* Panel - sibling, not child, centered with transform */}
      <div onClick={e => e.stopPropagation()} style={{
        position: "fixed",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 501,
        width: "min(680px, calc(100vw - 32px))",
        maxHeight: "90vh",
        background: "var(--bg)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        animation: `${closing ? "panelOut" : "panelIn"} 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards`
      }}>
        {/* Header */}
        <div style={{
          background: "linear-gradient(135deg, #fff0f5 0%, #ffffff 70%)",
          borderBottom: "1px solid var(--border)",
          padding: "32px 36px 28px",
          position: "relative"
        }}>
          <button onClick={close} style={{
            position: "absolute", top: 20, right: 20,
            background: "rgba(0,0,0,0.06)", border: "none",
            borderRadius: "50%", width: 32, height: 32,
            fontSize: 16, cursor: "pointer", color: "var(--text-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s, transform 0.15s"
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.12)"; e.currentTarget.style.transform = "scale(1.1)" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "scale(1)" }}
          >✕</button>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--accent-soft)", border: "1px solid rgba(255,45,120,0.2)",
            borderRadius: 100, padding: "4px 12px",
            fontSize: 12, color: "var(--accent)", fontWeight: 500, marginBottom: 16
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }}/>
            Stay in the loop
          </div>

          <h2 style={{
            fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 600,
            letterSpacing: "-1px", color: "var(--text)", marginBottom: 10, lineHeight: 1.1
          }}>
            Be kept in the know on<br />
            <span style={{ color: "var(--accent)" }}>the latest EMG developments.</span>
          </h2>
          <p style={{
            fontSize: 14, color: "var(--text-secondary)", fontWeight: 300,
            lineHeight: 1.6, maxWidth: 420, margin: 0
          }}>
            New articles, project updates, and breakthroughs in assistive EMG technology - 
            delivered to your inbox. No spam, unsubscribe anytime.
          </p>
        </div>

        <div style={{ overflowY: "auto" }}>
          <ContactForm
            source="newsletter"
            namePlaceholder="Your name"
            emailPlaceholder="your@email.com"
            showMessage={false}
            submitLabel="Subscribe"
            padding="0 0 8px"
          />
        </div>
      </div>
    </>
  )
}