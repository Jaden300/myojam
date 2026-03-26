import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "./Footer"

const STEPS = [
  {
    num: "01", title: "Signal capture", subtitle: "The hardware layer",
    body: "Surface EMG electrodes — adhesive stickers, no needles — are placed on the forearm. When muscles contract, they produce tiny electrical potentials. The MyoWare 2.0 sensor amplifies and conditions this signal across 16 channels at 200 samples per second.",
    tags: ["16 differential EMG channels", "200 Hz sampling rate", "Passive surface electrodes", "MyoWare 2.0 sensor"]
  },
  {
    num: "02", title: "Signal processing", subtitle: "Filtering and windowing",
    body: "Raw EMG is contaminated with noise — powerline interference, motion artifacts, and baseline drift. A 4th-order Butterworth bandpass filter (20–90 Hz) isolates the relevant frequency band. The cleaned signal is segmented into 200-sample windows with 50-sample steps.",
    tags: ["Butterworth bandpass: 20–90 Hz", "Window size: 200 samples", "Step size: 50 samples", "75% window overlap"]
  },
  {
    num: "03", title: "Feature extraction", subtitle: "From waveform to numbers",
    body: "Each window is compressed into 64 numbers — four time-domain features per channel. These capture the essential character of the EMG burst: activation level, signal power, frequency content, and total variation.",
    tags: ["MAV — Mean Absolute Value", "RMS — Root Mean Square", "ZC — Zero Crossings", "WL — Waveform Length"]
  },
  {
    num: "04", title: "Classification", subtitle: "The machine learning model",
    body: "A Random Forest classifier with 500 decision trees takes the 64-feature vector and outputs a probability distribution across 6 gesture classes. Trained on 16,269 labeled windows from 10 subjects in the Ninapro DB5 dataset with cross-validated hyperparameter tuning.",
    tags: ["Random Forest (500 trees)", "16,269 training samples", "10 subjects", "84.85% cross-subject accuracy"]
  },
  {
    num: "05", title: "Assistive output", subtitle: "Gesture to action",
    body: "The predicted gesture maps to a configurable computer action. The entire inference pipeline runs in under 5ms, making the response feel instantaneous for the user.",
    tags: ["Index flex → cursor left", "Middle flex → cursor right", "Thumb flex → click", "Fist → spacebar"]
  },
]

export default function HowItWorks() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "120px 32px 80px" }}>

        <p style={{
          fontSize: 13, fontWeight: 500, color: "var(--accent)",
          letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 16
        }}>Technical overview</p>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 600,
          letterSpacing: "-2px", lineHeight: 1.05, marginBottom: 28
        }}>From muscle signal<br />to gesture in 5ms.</h1>

        <p style={{
          fontSize: 17, color: "var(--text-secondary)", lineHeight: 1.75,
          fontWeight: 300, marginBottom: 64
        }}>A full technical breakdown of the myojam pipeline — signal capture to classification.</p>

        {/* Pipeline bar */}
        <div style={{
          display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6,
          background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)",
          padding: "14px 20px", marginBottom: 56,
          border: "1px solid var(--border)"
        }}>
          {["Capture", "Filter", "Extract", "Classify", "Output"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                fontSize: 13, fontWeight: 500,
                color: i === 4 ? "var(--accent)" : "var(--text-secondary)"
              }}>{s}</span>
              {i < 4 && <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>→</span>}
            </div>
          ))}
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {STEPS.map(step => (
            <div key={step.num} style={{
              background: "var(--bg-secondary)",
              borderRadius: "var(--radius)", padding: "32px",
              border: "1px solid var(--border)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "var(--accent-soft)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 600, color: "var(--accent)", flexShrink: 0
                }}>{step.num}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>{step.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300 }}>{step.subtitle}</div>
                </div>
              </div>
              <p style={{
                fontSize: 14, color: "var(--text-secondary)",
                lineHeight: 1.75, fontWeight: 300, marginBottom: 20
              }}>{step.body}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {step.tags.map(tag => (
                  <span key={tag} style={{
                    background: "var(--surface)", border: "1px solid var(--border-mid)",
                    borderRadius: 100, padding: "4px 14px",
                    fontSize: 12, color: "var(--text-secondary)", fontWeight: 400
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Dataset note */}
        <div style={{
          marginTop: 40, background: "var(--accent-soft)",
          borderRadius: "var(--radius)", padding: "28px 32px",
          border: "1px solid rgba(255,45,120,0.15)"
        }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>Dataset — Ninapro DB5</div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.75, fontWeight: 300 }}>
            The Ninapro database is a publicly available benchmark for EMG-based gesture recognition research. 
            DB5 contains recordings from 10 intact subjects performing 52 hand movements, each repeated 6 times. 
            Available at <a href="https://ninapro.hevs.ch" target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>ninapro.hevs.ch</a>.
          </p>
        </div>

        <div style={{ marginTop: 40, display: "flex", gap: 12 }}>
          <button onClick={() => navigate("/demo")} style={{
            background: "var(--accent)", color: "#fff",
            border: "none", borderRadius: 100,
            padding: "11px 28px", fontSize: 14,
            fontFamily: "var(--font)", fontWeight: 500, cursor: "pointer"
          }}>Try the demo</button>
          <a href="https://github.com/Jaden300/myosignal" target="_blank" rel="noreferrer" style={{
            background: "var(--bg-secondary)", color: "var(--text)",
            border: "1px solid var(--border-mid)", borderRadius: 100,
            padding: "10px 24px", fontSize: 14, textDecoration: "none", fontWeight: 400
          }}>View source</a>
        </div>
      </div>
    </div>
  )
}