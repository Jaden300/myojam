import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "./Footer"
import { Reveal, StaggerList, HoverCard } from "./Animate"
import { IconGear, IconChart, IconBrain, IconBolt } from "./Icons"

const STEPS = [
  {
    num: "01",
    icon: <IconGear />,
    title: "Signal capture",
    subtitle: "Hardware layer",
    body: "Surface EMG electrodes — adhesive stickers, no needles — pick up the electrical activity of your forearm muscles as you move. The MyoWare 2.0 sensor amplifies and conditions this signal across 16 channels at 200 Hz, fed into an Arduino Uno over USB.",
    tags: ["MyoWare 2.0 sensor", "16 EMG channels", "200 Hz sampling", "Arduino Uno R3"],
  },
  {
    num: "02",
    icon: <IconChart />,
    title: "Filtering & windowing",
    subtitle: "Signal processing",
    body: "Raw EMG is noisy — powerline hum, motion artifacts, baseline drift. A 4th-order Butterworth bandpass filter (20–90 Hz) strips it down to the biologically meaningful band. The cleaned signal is then sliced into 200-sample windows with 50-sample steps, ready for feature extraction.",
    tags: ["Butterworth 20–90 Hz", "200-sample windows", "50-sample step", "75% overlap"],
  },
  {
    num: "03",
    icon: <IconChart />,
    title: "Feature extraction",
    subtitle: "From waveform to numbers",
    body: "Each window is compressed into a 64-number vector — four time-domain features computed across all 16 channels. These capture activation level (MAV), signal power (RMS), frequency content (ZC), and complexity (WL). Together they form a compact fingerprint of the gesture.",
    tags: ["MAV · RMS · ZC · WL", "64-dimensional vector", "16 channels × 4 features"],
  },
  {
    num: "04",
    icon: <IconBrain />,
    title: "Gesture classification",
    subtitle: "Machine learning",
    body: "A Random Forest classifier (500 trees, hyperparameter-tuned via 100-configuration RandomizedSearchCV) maps the 64-feature vector to one of 6 gesture classes. Trained on 16,269 labeled windows from 10 subjects in the public Ninapro DB5 dataset — achieving 84.85% cross-subject accuracy.",
    tags: ["Random Forest · 500 trees", "16,269 training windows", "10 subjects · Ninapro DB5", "84.85% accuracy"],
  },
  {
    num: "05",
    icon: <IconBolt />,
    title: "Assistive action",
    subtitle: "Gesture to computer control",
    body: "The predicted gesture maps to a real computer action in under 50ms end-to-end. Cursor movement uses the macOS CoreGraphics API for hardware-level repositioning. Clicks fire via cliclick. Keypresses are injected through osascript. No accessibility overlays — direct system-level control.",
    tags: ["< 50ms latency", "CoreGraphics cursor", "osascript keypresses", "6 mapped actions"],
  },
]

export default function HowItWorks() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "120px 32px 80px" }}>

        {/* Header */}
        <Reveal>
          <p style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--accent)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginBottom: 16
          }}>
            Technical overview
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 600,
            letterSpacing: "-2px",
            lineHeight: 1.05,
            marginBottom: 28,
            color: "var(--text)"
          }}>
            From muscle signal<br />to action in 50ms.
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p style={{
            fontSize: 17,
            color: "var(--text-secondary)",
            lineHeight: 1.75,
            fontWeight: 300,
            marginBottom: 56
          }}>
            How myojam turns a forearm twitch into a cursor move, click, or keypress —
            from raw electrode data to system-level control.
          </p>
        </Reveal>

        {/* Pipeline breadcrumb */}
        <Reveal delay={0.15}>
          <div style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 6,
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-sm)",
            padding: "14px 20px",
            marginBottom: 56,
            border: "1px solid var(--border)"
          }}>
            {["Capture", "Filter", "Extract", "Classify", "Act"].map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: i === 4 ? "var(--accent)" : "var(--text-secondary)"
                }}>
                  {s}
                </span>
                {i < 4 && <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>→</span>}
              </div>
            ))}
          </div>
        </Reveal>

        {/* Steps */}
        <StaggerList
          items={STEPS}
          columns={1}
          gap={16}
          renderItem={(step, i) => (
            <Reveal delay={i * 0.1}>
              <HoverCard
                style={{
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--border)",
                  padding: "32px",
                  display: "flex",
                  gap: 24
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  flexShrink: 0,
                  background: "var(--accent-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {step.icon}
                </div>

                <div>
                  <div style={{
                    fontSize: 17,
                    fontWeight: 600,
                    color: "var(--text)",
                    marginBottom: 4
                  }}>
                    {step.title}
                  </div>

                  <div style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    fontWeight: 300,
                    marginBottom: 10
                  }}>
                    {step.subtitle}
                  </div>

                  <p style={{
                    fontSize: 14,
                    color: "var(--text-secondary)",
                    lineHeight: 1.7,
                    fontWeight: 300,
                    marginBottom: 16
                  }}>
                    {step.body}
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {step.tags.map(tag => (
                      <span key={tag} style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border-mid)",
                        borderRadius: 100,
                        padding: "4px 14px",
                        fontSize: 12,
                        color: "var(--text-secondary)"
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </HoverCard>
            </Reveal>
          )}
        />

        {/* Dataset */}
        <Reveal>
          <div style={{
            marginTop: 40,
            background: "var(--accent-soft)",
            borderRadius: "var(--radius)",
            padding: "28px 32px",
            border: "1px solid rgba(255,45,120,0.15)"
          }}>
            <div style={{
              fontSize: 12,
              fontWeight: 500,
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 10
            }}>
              Dataset — Ninapro DB5
            </div>

            <p style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              lineHeight: 1.75,
              fontWeight: 300
            }}>
              The Ninapro database is a publicly available benchmark for EMG-based gesture recognition research.
              DB5 contains recordings from 10 intact subjects performing 52 hand movements, each repeated 6 times.
              Available at{" "}
              <a href="https://ninapro.hevs.ch" target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
                ninapro.hevs.ch
              </a>.
            </p>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal>
          <div style={{ marginTop: 56, display: "flex", gap: 12 }}>
            <button onClick={() => navigate("/demo")} style={{
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: 100,
              padding: "13px 32px",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 4px 24px rgba(255,45,120,0.3)"
            }}>
              Try the demo
            </button>

            <button onClick={() => navigate("/about")} style={{
              background: "transparent",
              color: "var(--text)",
              border: "1px solid var(--border-mid)",
              borderRadius: 100,
              padding: "13px 28px",
              fontSize: 15,
              cursor: "pointer"
            }}>
              About the project
            </button>
          </div>
        </Reveal>

      </div>

      <Footer />
    </div>
  )
}