import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, StaggerList, HoverCard, SectionPill } from "./Animate"
import { IconBolt, IconPencil, IconBrain, IconChart, IconDemo } from "./Icons"

// Map demo icon names to actual SVG components
const ICON_MAP = {
  live:   IconBolt,
  pencil: IconPencil,
  game:   IconBrain,
  chart:  IconChart,
  matrix: IconDemo,
}

// Demo data
const DEMOS = [
  {
    slug: "/demo",
    icon: "live",
    tag: "Live classifier",
    title: "EMG Gesture Demo",
    desc: "Load real EMG windows from the Ninapro DB5 dataset and watch the Random Forest classifier predict gestures in real time. Includes a 3D hand model, confidence scores, and per-gesture accuracy breakdown. No hardware needed.",
    features: ["Real Ninapro DB5 data", "6 gesture classes", "Live confidence scoring", "3D hand visualization"],
    cta: "Open demo →",
    bg: "linear-gradient(135deg, #fff0f5 0%, #fafafa 100%)",
    accent: "#FF2D78",
  },
  {
    slug: "/playground",
    icon: "pencil",
    tag: "Interactive",
    title: "Signal Playground",
    desc: "Draw an EMG-like waveform with your mouse and watch the feature extraction pipeline compute MAV, RMS, ZC, and WL live as you draw. No data loading needed — just draw.",
    features: ["Draw any waveform", "Live feature extraction", "Heuristic classification", "Feature explainer"],
    cta: "Open playground →",
    bg: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 100%)",
    accent: "#3B82F6",
  },
  {
    slug: "/game",
    icon: "game",
    tag: "Mini-game",
    title: "Gesture Reaction Game",
    desc: "A gesture flashes on screen. Press the matching key before the timer runs out. Three difficulty levels — how fast can your fingers react?",
    features: ["3 difficulty levels", "Streak tracking", "Reaction scoring", "Keyboard-driven"],
    cta: "Play now →",
    bg: "linear-gradient(135deg, #fff5f0 0%, #fafafa 100%)",
    accent: "#F59E0B",
  },
  {
    slug: "/frequency",
    icon: "chart",
    tag: "Signal processing",
    title: "EMG Frequency Analyzer",
    desc: "Load a real Ninapro EMG window and inspect its frequency spectrum. Watch the 20–90Hz bandpass filter isolate gesture signal from noise in real time across any of the 16 electrode channels.",
    features: ["Real Ninapro windows", "16 channel selector", "Bandpass filter viz", "Frequency band legend"],
    cta: "Open analyzer →",
    bg: "linear-gradient(135deg, #f5f0ff 0%, #fafafa 100%)",
    accent: "#8B5CF6",
  },
  {
    slug: "/confusion",
    icon: "matrix",
    tag: "Model evaluation",
    title: "Confusion Matrix Explorer",
    desc: "An interactive heatmap of the classifier's cross-subject accuracy. Click any cell to see how often one gesture is confused for another — and the biomechanical reason why.",
    features: ["Interactive heatmap", "Per-gesture recall", "Confusion explanations", "Click-to-explore"],
    cta: "Explore →",
    bg: "linear-gradient(135deg, #f0fff8 0%, #fafafa 100%)",
    accent: "#10B981",
  },
  {
    slug: "/myocode",
    icon: "code",
    tag: "Block coding",
    title: "myocode",
    desc: "A Scratch-like block coding environment where EMG gestures are first-class events. Snap blocks together, draw on a canvas, move a sprite, and build programs that respond to muscle signals — no hardware needed.",
    features: ["Visual block coding", "EMG gesture events", "Live canvas stage", "Example programs"],
    cta: "Open myocode →",
    bg: "linear-gradient(135deg, #f5f0ff 0%, #fafafa 100%)",
    accent: "#8B5CF6",
  },
]

export default function Demos() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #fff0f5 0%, #ffffff 60%)",
        borderBottom: "1px solid var(--border)",
        padding: "100px 32px 64px"
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Interactive demos</SectionPill>
            <h1 style={{
              fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 600,
              letterSpacing: "-1.5px", color: "var(--text)", marginBottom: 20, lineHeight: 1.08
            }}>
              See myojam<br />
              <span style={{ color: "var(--accent)" }}>working in your browser.</span>
            </h1>
            <p style={{
              fontSize: 17, color: "var(--text-secondary)", fontWeight: 300,
              lineHeight: 1.7, maxWidth: 520
            }}>
              No hardware required. Both demos run entirely in the browser using
              real data from the Ninapro DB5 dataset and the same signal processing
              pipeline as the desktop app.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Demo cards */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "64px 32px 80px" }}>
        <StaggerList
          items={DEMOS}
          columns={1}
          gap={24}
          renderItem={(demo) => (
            <HoverCard
              color="rgba(255,45,120,0.08)"
              onClick={() => navigate(demo.slug)}
              style={{
                borderRadius: "var(--radius)",
                border: "1px solid var(--border)",
                overflow: "hidden", cursor: "pointer"
              }}
            >
              {/* Card banner */}
              <div style={{
                background: demo.bg,
                borderBottom: "1px solid var(--border)",
                padding: "36px 40px",
                display: "flex", alignItems: "flex-start", gap: 24
              }}>
                {/* Icon container */}
                {(() => {
                  const Icon = ICON_MAP[demo.icon] || IconBolt
                  return (
                    <div style={{
                      width: 56, height: 56, borderRadius: 18, flexShrink: 0,
                      background: demo.accent + "18",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      <Icon size={26} color={demo.accent} />
                    </div>
                  )
                })()}

                {/* Text content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 500, color: demo.accent,
                      background: demo.accent + "18", border: `1px solid ${demo.accent}30`,
                      borderRadius: 100, padding: "3px 10px"
                    }}>{demo.tag}</span>
                  </div>
                  <h2 style={{
                    fontSize: 24, fontWeight: 600, color: "var(--text)",
                    letterSpacing: "-0.5px", marginBottom: 10
                  }}>{demo.title}</h2>
                  <p style={{
                    fontSize: 15, color: "var(--text-secondary)",
                    lineHeight: 1.7, fontWeight: 300, margin: 0, maxWidth: 560
                  }}>{demo.desc}</p>
                </div>
              </div>

              {/* Card footer */}
              <div style={{
                padding: "20px 40px",
                background: "var(--bg-secondary)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                flexWrap: "wrap", gap: 16
              }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {demo.features.map(f => (
                    <span key={f} style={{
                      fontSize: 12, color: "var(--text-secondary)",
                      background: "var(--bg)", border: "1px solid var(--border)",
                      borderRadius: 100, padding: "4px 12px", fontWeight: 300
                    }}>✓ {f}</span>
                  ))}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: demo.accent }}>{demo.cta}</span>
              </div>
            </HoverCard>
          )}
        />

        {/* Desktop app CTA */}
        <Reveal delay={0.3}>
          <div style={{
            marginTop: 48, textAlign: "center",
            padding: "32px", background: "var(--bg-secondary)",
            border: "1px solid var(--border)", borderRadius: "var(--radius)"
          }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>
              Want to try with real hardware?
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, marginBottom: 16, maxWidth: 400, margin: "0 auto 16px" }}>
              The macOS desktop app connects directly to a MyoWare 2.0 sensor for live EMG classification.
            </p>
            <a href="https://github.com/user-attachments/files/26291771/myojam-mac.zip"
              style={{
                background: "var(--accent)", color: "#fff", borderRadius: 100,
                padding: "10px 24px", fontSize: 14, fontWeight: 500,
                textDecoration: "none", display: "inline-block"
              }}>Download for Mac</a>
          </div>
        </Reveal>
      </div>

      <Footer />
    </div>
  )
}