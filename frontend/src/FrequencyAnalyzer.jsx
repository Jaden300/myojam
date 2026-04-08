import { useState, useRef, useEffect } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"

const API = import.meta.env.VITE_API_URL

// Simple DFT (no FFT lib needed at n=200)
function computeSpectrum(signal, fs = 200) {
  const n = signal.length
  const maxFreq = fs / 2
  const freqs = []
  const mags = []
  const step = Math.ceil(n / 80) // ~80 frequency bins
  for (let k = 0; k < n / 2; k += step) {
    let re = 0, im = 0
    for (let t = 0; t < n; t++) {
      const angle = (2 * Math.PI * k * t) / n
      re += signal[t] * Math.cos(angle)
      im -= signal[t] * Math.sin(angle)
    }
    freqs.push((k * fs) / n)
    mags.push(Math.sqrt(re * re + im * im) / n)
  }
  return { freqs, mags }
}

const BANDS = [
  { lo: 0,   hi: 20,  label: "DC / motion artefact", color: "#AEAEB2", relevant: false },
  { lo: 20,  hi: 90,  label: "Gesture band (20–90Hz)", color: "#FF2D78", relevant: true  },
  { lo: 90,  hi: 150, label: "High-freq noise",       color: "#3B82F6", relevant: false },
  { lo: 150, hi: 200, label: "Very high freq",        color: "#8B5CF6", relevant: false },
]

const GESTURE_IDS = [
  { id: 1, name: "Index flex",  color: "#FF2D78" },
  { id: 2, name: "Middle flex", color: "#3B82F6" },
  { id: 3, name: "Ring flex",   color: "#8B5CF6" },
  { id: 4, name: "Pinky flex",  color: "#10B981" },
  { id: 5, name: "Thumb flex",  color: "#F59E0B" },
  { id: 6, name: "Fist",        color: "#EF4444" },
]

function butterworth(signal, lo = 20, hi = 90, fs = 200) {
  // Simple IIR approximation (2-pass for zero phase)
  const nyq = fs / 2
  const loN = lo / nyq, hiN = hi / nyq
  const filtered = [...signal]
  const alpha = 0.85
  // Highpass at lo
  let prev = filtered[0]
  for (let i = 1; i < filtered.length; i++) {
    const next = alpha * (prev + filtered[i] - filtered[i - 1])
    prev = next
    filtered[i] = next
  }
  // Lowpass at hi
  const alphaL = hiN / (hiN + 1)
  for (let i = 1; i < filtered.length; i++) {
    filtered[i] = filtered[i - 1] + alphaL * (filtered[i] - filtered[i - 1])
  }
  return filtered
}

export default function FrequencyAnalyzer() {
  const [gestureId, setGestureId] = useState(1)
  const [emgData, setEmgData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [channel, setChannel] = useState(0)
  const rawCanvasRef = useRef(null)
  const freqCanvasRef = useRef(null)

  async function loadSample(gid) {
    setLoading(true)
    try {
      const res = await fetch(`${API}/sample?gesture_id=${gid}`)
      const data = await res.json()
      setEmgData(data)
      setGestureId(gid)
    } catch { }
    setLoading(false)
  }

  useEffect(() => { loadSample(1) }, [])

  const signal = emgData?.emg_window?.map(row => row[channel]) || []
  const filtered = signal.length ? butterworth(signal) : []
  const { freqs: rawFreqs, mags: rawMags } = signal.length ? computeSpectrum(signal) : { freqs: [], mags: [] }
  const { freqs: filtFreqs, mags: filtMags } = filtered.length ? computeSpectrum(filtered) : { freqs: [], mags: [] }
  const g = GESTURE_IDS.find(g => g.id === gestureId)

  // Draw waveform
  useEffect(() => {
    const canvas = rawCanvasRef.current
    if (!canvas || !signal.length) return
    const ctx = canvas.getContext("2d")
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = "#F5F5F7"
    ctx.fillRect(0, 0, W, H)

    // Grid
    ctx.strokeStyle = "rgba(0,0,0,0.06)"; ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, H * i / 4); ctx.lineTo(W, H * i / 4); ctx.stroke() }

    const mid = H / 2
    const mn = Math.min(...signal), mx = Math.max(...signal)
    const rng = Math.max(mx - mn, 0.001)
    const norm = signal.map(v => (v - mn) / rng)
    const normFilt = filtered.map(v => (v - mn) / rng)
    const step = W / (signal.length - 1)

    // Raw (grey)
    ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.lineWidth = 1.2; ctx.beginPath()
    norm.forEach((v, i) => { const y = H - v * H * 0.85 - H * 0.075; i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * step, y) })
    ctx.stroke()

    // Filtered (pink)
    ctx.strokeStyle = g?.color || "#FF2D78"; ctx.lineWidth = 2; ctx.beginPath()
    normFilt.forEach((v, i) => { const y = H - v * H * 0.85 - H * 0.075; i === 0 ? ctx.moveTo(0, y) : ctx.lineTo(i * step, y) })
    ctx.stroke()
  }, [signal, filtered, g])

  // Draw spectrum
  useEffect(() => {
    const canvas = freqCanvasRef.current
    if (!canvas || !rawMags.length) return
    const ctx = canvas.getContext("2d")
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = "#F5F5F7"; ctx.fillRect(0, 0, W, H)

    const maxMag = Math.max(...rawMags, ...filtMags, 0.001)
    const maxFreqShow = 200

    // Band colouring
    BANDS.forEach(band => {
      const x1 = (band.lo / maxFreqShow) * W
      const x2 = (band.hi / maxFreqShow) * W
      ctx.fillStyle = band.relevant ? "rgba(255,45,120,0.06)" : "rgba(0,0,0,0.02)"
      ctx.fillRect(x1, 0, x2 - x1, H)
      ctx.strokeStyle = band.relevant ? "rgba(255,45,120,0.2)" : "rgba(0,0,0,0.06)"
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(x1, 0); ctx.lineTo(x1, H); ctx.stroke()
    })

    // Raw spectrum (grey)
    ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 1.2; ctx.beginPath()
    rawFreqs.forEach((f, i) => {
      if (f > maxFreqShow) return
      const x = (f / maxFreqShow) * W
      const y = H - (rawMags[i] / maxMag) * H * 0.88
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Filtered spectrum (pink)
    ctx.strokeStyle = g?.color || "#FF2D78"; ctx.lineWidth = 2; ctx.beginPath()
    filtFreqs.forEach((f, i) => {
      if (f > maxFreqShow) return
      const x = (f / maxFreqShow) * W
      const y = H - (filtMags[i] / maxMag) * H * 0.88
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Freq axis labels
    ctx.fillStyle = "#AEAEB2"; ctx.font = "400 11px -apple-system, sans-serif"; ctx.textAlign = "center"
    ;[0, 50, 100, 150, 200].forEach(f => {
      const x = (f / maxFreqShow) * W
      ctx.fillText(`${f}Hz`, x, H - 4)
    })
  }, [rawMags, filtMags, rawFreqs, filtFreqs, g])

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{
        background: "linear-gradient(135deg, #f5f0ff 0%, #ffffff 60%)",
        borderBottom: "1px solid var(--border)", padding: "100px 32px 48px"
      }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Signal processing · Academic</SectionPill>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 600, letterSpacing: "-1.5px", color: "var(--text)", marginBottom: 16, lineHeight: 1.1 }}>
              EMG Frequency Analyzer.
            </h1>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, maxWidth: 520 }}>
              Load a real Ninapro DB5 EMG window and inspect its frequency spectrum.
              See how the 20–90Hz bandpass filter isolates gesture-relevant signal from noise.
            </p>
          </Reveal>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 32px 80px" }}>

        {/* Controls */}
        <div style={{ display: "flex", gap: 24, marginBottom: 32, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 8, fontWeight: 300 }}>Gesture</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {GESTURE_IDS.map(g => (
                <button key={g.id} onClick={() => loadSample(g.id)} style={{
                  background: gestureId === g.id ? g.color + "18" : "var(--bg-secondary)",
                  border: `1px solid ${gestureId === g.id ? g.color : "var(--border)"}`,
                  borderRadius: 100, padding: "6px 14px",
                  fontSize: 12, color: gestureId === g.id ? g.color : "var(--text-secondary)",
                  fontWeight: gestureId === g.id ? 500 : 400,
                  cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.15s"
                }}>{g.name}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 8, fontWeight: 300 }}>Channel (electrode)</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[0,1,2,3,4,5,6,7].map(ch => (
                <button key={ch} onClick={() => setChannel(ch)} style={{
                  background: channel === ch ? "var(--accent)" : "var(--bg-secondary)",
                  border: `1px solid ${channel === ch ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: 8, padding: "5px 10px",
                  fontSize: 12, color: channel === ch ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.15s"
                }}>{ch + 1}</button>
              ))}
            </div>
          </div>
          {loading && <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Loading…</div>}
        </div>

        {/* Waveform */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Time domain</div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-tertiary)" }}>
              <span>— Raw signal</span>
              <span style={{ color: g?.color }}>— Filtered (20–90Hz)</span>
            </div>
          </div>
          <div style={{ borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border)" }}>
            <canvas ref={rawCanvasRef} width={820} height={160} style={{ display: "block", width: "100%", height: "auto" }} />
          </div>
        </div>

        {/* Spectrum */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Frequency domain (0–200Hz)</div>
          </div>
          <div style={{ borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--border)" }}>
            <canvas ref={freqCanvasRef} width={820} height={180} style={{ display: "block", width: "100%", height: "auto" }} />
          </div>
        </div>

        {/* Band legend */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 48 }}>
          {BANDS.map(band => (
            <div key={band.label} style={{
              background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)",
              border: `1px solid ${band.relevant ? "rgba(255,45,120,0.2)" : "var(--border)"}`,
              padding: "14px 18px", display: "flex", gap: 12, alignItems: "center"
            }}>
              <div style={{ width: 3, alignSelf: "stretch", borderRadius: 2, background: band.color, flexShrink: 0 }}/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: band.relevant ? band.color : "var(--text-secondary)" }}>{band.lo}–{band.hi}Hz</div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300 }}>{band.label}</div>
              </div>
              {band.relevant && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: band.color, background: band.color + "18", borderRadius: 100, padding: "2px 8px" }}>KEPT</span>}
            </div>
          ))}
        </div>

        {/* Explainer */}
        <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius)", border: "1px solid var(--border)", borderLeft: "3px solid var(--accent)", padding: "24px 28px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Why this filter?</div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, fontWeight: 300, margin: 0 }}>
            Useful EMG signal lives between 20Hz and 90Hz for surface recordings at this depth and sensor quality.
            Below 20Hz you get DC drift and movement artefacts from the electrode shifting.
            Above 90Hz you get amplifier noise and aliasing. The 4th-order Butterworth filter removes both
            without introducing phase distortion that would shift the waveform in time — which matters when
            you're correlating signal shape to gesture timing.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}