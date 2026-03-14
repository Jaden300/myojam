import { useNavigate } from "react-router-dom"

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px" }}>

      <div style={{
        display: "inline-block", background: "#60a5fa18",
        border: "1px solid #60a5fa44", borderRadius: 20,
        padding: "4px 14px", fontSize: 13, color: "#60a5fa",
        marginBottom: 28
      }}>
        Open-source · Built on Ninapro DB5
      </div>

      <h1 style={{
        fontSize: 48, fontWeight: 700, lineHeight: 1.15,
        letterSpacing: "-1px", marginBottom: 24
      }}>
        Control a computer<br />
        <span style={{ color: "#60a5fa" }}>with your muscles.</span>
      </h1>

      <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.8, marginBottom: 16 }}>
        MyoSignal reads surface EMG signals — the electrical activity your muscles
        produce when you move — and classifies hand gestures in real time using a
        machine learning model trained on clinical data.
      </p>

      <p style={{ fontSize: 18, color: "#94a3b8", lineHeight: 1.8, marginBottom: 48 }}>
        For people with limb differences or motor impairments, this means an
        alternative way to interact with computers — no keyboard or mouse required.
      </p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
  <button
    onClick={() => navigate("/demo")}
    style={{
      background: "#60a5fa", color: "#0f1117",
      border: "none", borderRadius: 10,
      padding: "14px 28px", fontSize: 16,
      fontWeight: 700, cursor: "pointer",
    }}
  >
    Open demo →
  </button>

  <a
    href="https://github.com/Jaden300/myosignal"
    target="_blank"
    rel="noreferrer"
    style={{
      background: "#1e2130", color: "#94a3b8",
      border: "1px solid #2d3148", borderRadius: 10,
      padding: "14px 28px", fontSize: 16,
      fontWeight: 500, cursor: "pointer",
      textDecoration: "none", display: "inline-block"
    }}
  >
    GitHub
  </a>
</div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        gap: 16, marginTop: 72
      }}>
        {[
          ["92%", "Model accuracy", "on held-out Ninapro test set"],
          ["6", "Gesture classes", "index, middle, ring, pinky, thumb, fist"],
          ["200 Hz", "Sample rate", "16-channel surface EMG"],
        ].map(([value, label, sub]) => (
          <div key={label} style={{
            background: "#1e2130", border: "1px solid #2d3148",
            borderRadius: 12, padding: "20px"
          }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#e2e8f0" }}>{value}</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8", marginTop: 4 }}>{label}</p>
            <p style={{ fontSize: 12, color: "#475569", marginTop: 4, lineHeight: 1.5 }}>{sub}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 72 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>How it works</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            ["01", "Signal capture", "Surface EMG electrodes on the forearm pick up muscle activation signals at 200 Hz across 16 channels."],
            ["02", "Feature extraction", "Each 200-sample window is filtered and reduced to 64 features — mean absolute value, RMS, zero crossings, and waveform length per channel."],
            ["03", "Classification", "A Random Forest model trained on 10 subjects from the Ninapro DB5 dataset predicts the gesture from those features in under 5ms."],
            ["04", "Control output", "The predicted gesture maps to a keyboard or mouse action, giving the user hands-free computer control."],
          ].map(([num, title, desc]) => (
            <div key={num} style={{
              display: "flex", gap: 20,
              background: "#1e2130", border: "1px solid #2d3148",
              borderRadius: 12, padding: "20px"
            }}>
              <span style={{
                fontSize: 13, fontWeight: 700, color: "#374151",
                minWidth: 28, paddingTop: 2
              }}>{num}</span>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>{title}</p>
                <p style={{ fontSize: 14, color: "#64748b", marginTop: 6, lineHeight: 1.7 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}