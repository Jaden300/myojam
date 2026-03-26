import Navbar from "./Navbar"
import Footer from "./Footer"

const steps = [
  {
    number: "01",
    title: "Surface EMG acquisition",
    body: "Bipolar Ag/AgCl surface electrodes are placed over the flexor digitorum superficialis and extensor carpi radialis muscle groups of the forearm. The MyoWare 2.0 sensor amplifies and rectifies the raw differential EMG signal, which is then digitized at 200 Hz via an Arduino Uno R3 and transmitted over USB serial at 9600 baud.",
    tag: "Hardware"
  },
  {
    number: "02",
    title: "Bandpass filtering & windowing",
    body: "The raw signal undergoes 4th-order Butterworth bandpass filtering between 20–90 Hz to attenuate DC offset, movement artefact, and high-frequency noise while preserving the physiologically relevant EMG frequency band. A sliding window of 200 samples (1 second at 200 Hz) with 50% overlap is applied to segment the continuous signal stream into discrete classification epochs.",
    tag: "Signal Processing"
  },
  {
    number: "03",
    title: "Feature extraction",
    body: "For each epoch across all 16 input channels, we extract a 64-dimensional feature vector comprising time-domain descriptors — Mean Absolute Value (MAV), Root Mean Square (RMS), Zero Crossing rate (ZC), and Waveform Length (WL). These features encode the signal's amplitude envelope, frequency content, and morphological complexity, providing a compact yet discriminative representation of muscular activation state.",
    tag: "Feature Engineering"
  },
  {
    number: "04",
    title: "Random Forest classification",
    body: "The feature vector is passed to a hyperparameter-tuned Random Forest classifier trained on the Ninapro DB5 dataset — 16,269 labeled windows across 10 subjects and 3 exercise protocols. RandomizedSearchCV over 100 parameter configurations optimized tree depth, ensemble size, and split criteria. The model achieves 84.85% cross-subject accuracy across 6 gesture classes, outputting both a class prediction and a full posterior probability distribution.",
    tag: "Machine Learning"
  },
  {
    number: "05",
    title: "Action mapping & system control",
    body: "The predicted gesture label is mapped to a discrete computer interaction primitive via a configurable action table. Cursor translation is implemented through the macOS CoreGraphics CGEventCreateMouseEvent API, enabling hardware-level pointer repositioning. Keyboard events are synthesized via osascript key code injection. The full inference-to-actuation latency is under 50ms.",
    tag: "System Integration"
  },
  {
    number: "06",
    title: "Real-time visualization",
    body: "The web platform renders live EMG waveforms, per-class probability distributions, and a MAV-driven 3D hand kinematic model via Three.js. The desktop application mirrors this feedback locally, displaying the classified gesture, confidence score, and a scrolling waveform widget — giving users immediate, intuitive confirmation of the system's interpretation of their muscular intent.",
    tag: "Interface"
  },
]

export default function HowItWorks() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "100px 32px 80px" }}>

        <div style={{ marginBottom: 72 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--accent-soft)", border: "1px solid rgba(255,45,120,0.15)",
            borderRadius: 100, padding: "5px 16px",
            fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 24
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }}/>
            Technical architecture
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 600,
            letterSpacing: "-1.5px", color: "var(--text)", marginBottom: 20
          }}>How myojam works</h1>
          <p style={{
            fontSize: 17, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7
          }}>
            From electrode to action — the full signal processing and inference pipeline, 
            documented in technical detail.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {steps.map((step, i) => (
            <div key={step.number} style={{
              display: "grid", gridTemplateColumns: "80px 1fr",
              gap: 32, padding: "40px 0",
              borderBottom: i < steps.length - 1 ? "1px solid var(--border)" : "none"
            }}>
              {/* Number + line */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "var(--accent-soft)", border: "1px solid rgba(255,45,120,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 600, color: "var(--accent)", flexShrink: 0
                }}>
                  {step.number}
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: 1, flex: 1, background: "var(--border)", marginTop: 12 }}/>
                )}
              </div>

              {/* Content */}
              <div style={{ paddingBottom: i < steps.length - 1 ? 0 : 0 }}>
                <div style={{
                  display: "inline-block",
                  fontSize: 11, fontWeight: 500, color: "var(--accent)",
                  background: "var(--accent-soft)", border: "1px solid rgba(255,45,120,0.15)",
                  borderRadius: 100, padding: "2px 10px", marginBottom: 12
                }}>
                  {step.tag}
                </div>
                <h3 style={{
                  fontSize: 18, fontWeight: 600, color: "var(--text)",
                  letterSpacing: "-0.3px", marginBottom: 12
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.75, fontWeight: 300
                }}>
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 64, textAlign: "center", fontSize: 13, color: "var(--text-tertiary)", fontWeight: 300 }}>
          © 2025 myojam™. All rights reserved.
        </div>
      </div>
    </div>
  )
}