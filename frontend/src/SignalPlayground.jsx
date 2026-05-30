import { useRef, useEffect, useState, useCallback } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"
import NeuralNoise from "./components/NeuralNoise"

// ── Feature math (mirrors Python backend exactly) ────────────────────────────
function computeFeatures(signal) {
  const n = signal.length
  if (n < 2) return null
  const mav = signal.reduce((s, v) => s + Math.abs(v), 0) / n
  const rms = Math.sqrt(signal.reduce((s, v) => s + v * v, 0) / n)
  let zc = 0
  for (let i = 1; i < n; i++) if ((signal[i] >= 0) !== (signal[i-1] >= 0)) zc++
  let wl = 0
  for (let i = 1; i < n; i++) wl += Math.abs(signal[i] - signal[i-1])
  return { mav, rms, zc, wl }
}

// ── Simulated bandpass filter (proxy for 20–90 Hz Butterworth) ───────────────
function simulateBandpass(signal) {
  if (signal.length < 4) return signal
  // High-pass: subtract 40-sample rolling mean (removes DC + slow drift)
  const HP = 40
  const hp = signal.map((v, i) => {
    const s = Math.max(0, i - HP), cnt = i - s + 1
    const avg = signal.slice(s, i + 1).reduce((a, x) => a + x, 0) / cnt
    return v - avg * 0.7
  })
  // Light low-pass: 3-sample causal average (remove high-freq noise)
  return hp.map((v, i) => {
    if (i < 2) return v
    return (hp[i-2] + hp[i-1] + v) / 3
  })
}

// ── Synthetic EMG preset waveforms ───────────────────────────────────────────
function generateGestureEMG(gestureName) {
  const N = 200
  const cfg = {
    "Index flex":  { amp: 0.44, freqs: [24, 40, 66],  phases: [0.0, 0.7, 1.4], noise: 0.04 },
    "Middle flex": { amp: 0.39, freqs: [27, 44, 72],  phases: [0.3, 1.0, 1.9], noise: 0.04 },
    "Ring flex":   { amp: 0.33, freqs: [21, 37, 57],  phases: [0.6, 1.3, 2.2], noise: 0.04 },
    "Pinky flex":  { amp: 0.27, freqs: [19, 34, 54],  phases: [0.9, 1.6, 2.5], noise: 0.03 },
    "Thumb flex":  { amp: 0.31, freqs: [17, 29, 47],  phases: [1.1, 1.9, 2.8], noise: 0.03 },
    "Fist":        { amp: 0.70, freqs: [33, 56, 87],  phases: [0.2, 0.9, 1.7], noise: 0.06 },
  }[gestureName] || { amp: 0.35, freqs: [25, 42, 65], phases: [0, 0.8, 1.5], noise: 0.04 }

  // Deterministic seeded noise
  let seed = gestureName.charCodeAt(0) * 31 + gestureName.length
  const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed / 0x7fffffff) * 2 - 1 }

  const normW = cfg.freqs.reduce((s, _, i) => s + 1/(i+1), 0)
  return Array.from({ length: N }, (_, i) => {
    const t = i / N
    const env = 0.5 * (1 - Math.cos(2 * Math.PI * t))
    let carrier = 0
    for (let fi = 0; fi < cfg.freqs.length; fi++) {
      carrier += (1/(fi+1)) * Math.sin(2*Math.PI * cfg.freqs[fi] * t + cfg.phases[fi])
    }
    carrier /= normW
    return env * carrier * cfg.amp + rand() * cfg.noise
  })
}

const GESTURES = [
  { name: "Index flex", color: "#FF2D78" },
  { name: "Middle flex", color: "#3B82F6" },
  { name: "Ring flex",   color: "#8B5CF6" },
  { name: "Pinky flex",  color: "#10B981" },
  { name: "Thumb flex",  color: "#F59E0B" },
  { name: "Fist",        color: "#EF4444" },
]

const FEATURE_META = [
  {
    key: "mav", label: "MAV", full: "Mean Absolute Value",
    formula: "MAV = (1/N) Σ |xᵢ|",
    desc: "Average signal energy - how active the muscle is overall. Scales with contraction force.",
    color: "#FF2D78",
    maxVal: 0.5,
  },
  {
    key: "rms", label: "RMS", full: "Root Mean Square",
    formula: "RMS = √((1/N) Σ xᵢ²)",
    desc: "Signal power - similar to MAV but emphasises high-amplitude peaks over sustained activity.",
    color: "#3B82F6",
    maxVal: 0.5,
  },
  {
    key: "zc", label: "ZCR", full: "Zero Crossing Rate",
    formula: "ZCR = Σ 𝟙[xᵢ · xᵢ₋₁ < 0]",
    desc: "How often the signal crosses zero - a proxy for dominant frequency content without FFT.",
    color: "#8B5CF6",
    maxVal: 80,
  },
  {
    key: "wl", label: "WL", full: "Waveform Length",
    formula: "WL = Σ |xᵢ - xᵢ₋₁|",
    desc: "Total waveform variation - captures both amplitude and frequency in a single scalar.",
    color: "#10B981",
    maxVal: 4.0,
  },
]

export default function SignalPlayground() {
  const canvasRef    = useRef(null)
  const [drawing, setDrawing]       = useState(false)
  const [signal,  setSignal]        = useState([])
  const [features, setFeatures]     = useState(null)
  const [hasDrawn, setHasDrawn]     = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [activePreset, setActivePreset] = useState(null)
  const [expandedFeat, setExpandedFeat] = useState(null)

  const renderCanvas = useCallback((sig, filtered) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const W = canvas.width, H = canvas.height
    const mid = H / 2

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = "#07071a"
    ctx.fillRect(0, 0, W, H)

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.04)"
    ctx.lineWidth = 1
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(0, H*i/4); ctx.lineTo(W, H*i/4); ctx.stroke()
    }
    // Centre line
    ctx.strokeStyle = "rgba(255,255,255,0.08)"
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke()

    if (!hasDrawn || sig.length < 2) {
      // Placeholder text
      ctx.fillStyle = "rgba(255,255,255,0.12)"
      ctx.font = "14px system-ui"
      ctx.textAlign = "center"
      ctx.fillText("Draw here - or load a preset gesture →", W/2, mid)
      return
    }

    const stepX = W / 200
    const ampScale = H * 0.40

    // Raw signal (always shown, dimmed when filter is on)
    ctx.strokeStyle = showFilter ? "rgba(255,45,120,0.3)" : "#FF2D78"
    ctx.lineWidth = showFilter ? 1.5 : 2.2
    ctx.beginPath()
    sig.forEach((v, i) => {
      const x = i * stepX, y = mid - v * ampScale
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Filtered signal overlay
    if (showFilter && filtered && filtered.length >= 2) {
      ctx.strokeStyle = "#22D3EE"
      ctx.lineWidth = 2.2
      ctx.beginPath()
      filtered.forEach((v, i) => {
        const x = i * stepX, y = mid - v * ampScale
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      })
      ctx.stroke()
    }

    // Sliding window indicator (last 200 samples = current window)
    if (sig.length >= 10) {
      const wStart = Math.max(0, sig.length - 200) * stepX
      const wEnd   = (sig.length - 1) * stepX
      ctx.fillStyle = "rgba(255,45,120,0.04)"
      ctx.fillRect(wStart, 0, wEnd - wStart, H)
      ctx.strokeStyle = "rgba(255,45,120,0.25)"
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath(); ctx.moveTo(wStart, 0); ctx.lineTo(wStart, H); ctx.stroke()
      ctx.setLineDash([])
    }
  }, [hasDrawn, showFilter])

  useEffect(() => {
    const filtered = showFilter ? simulateBandpass(signal) : null
    renderCanvas(signal, filtered)
  }, [signal, showFilter, renderCanvas])

  function startDraw(e) {
    e.preventDefault()
    setDrawing(true); setHasDrawn(true); setSignal([]); setFeatures(null); setActivePreset(null)
  }

  function draw(e) {
    if (!drawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientY = e.clientY ?? e.touches?.[0]?.clientY
    if (clientY == null) return
    const y = clientY - rect.top
    const H = canvas.height
    const val = Math.max(-1, Math.min(1, -((y - H/2) / (H * 0.40))))
    setSignal(prev => {
      const next = [...prev, val].slice(-200)
      setFeatures(computeFeatures(next))
      return next
    })
  }

  function endDraw() { setDrawing(false) }

  function loadPreset(gestureName) {
    const sig = generateGestureEMG(gestureName)
    setSignal(sig)
    setFeatures(computeFeatures(sig))
    setHasDrawn(true)
    setActivePreset(gestureName)
    setDrawing(false)
  }

  function clear() {
    setSignal([]); setFeatures(null); setHasDrawn(false); setActivePreset(null)
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{`
        @keyframes barGrow { from { width: 0% } to { width: var(--w) } }
        .feat-bar { transition: width 0.25s cubic-bezier(0.34,1.2,0.64,1); }
      `}</style>
      <Navbar />

      <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--border)", padding: "100px 32px 64px" }}>
        <NeuralNoise color={[0.90, 0.20, 0.50]} opacity={0.85} speed={0.0006} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(3,0,18,0.65)", zIndex: 1 }} />
        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Reveal>
            <SectionPill>Interactive · No hardware needed</SectionPill>
            <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 600, color: "#fff", marginBottom: 20, letterSpacing: "-1.5px", lineHeight: 1.08 }}>
              Signal playground.<br />
              <span style={{ color: "var(--accent)" }}>Draw a waveform, see the math.</span>
            </h1>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.72)", maxWidth: 560, fontWeight: 300, lineHeight: 1.7 }}>
              Sketch an EMG-like signal and watch MAV, RMS, ZCR, and WL compute live.
              Toggle the bandpass filter to see what the classifier actually receives.
            </p>
          </Reveal>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 32px 80px" }}>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 4 }}>Presets</span>
          {GESTURES.map(g => (
            <button key={g.name} onClick={() => loadPreset(g.name)} style={{
              background: activePreset === g.name ? `${g.color}20` : "var(--bg-secondary)",
              border: `1px solid ${activePreset === g.name ? g.color : "var(--border)"}`,
              color: activePreset === g.name ? g.color : "var(--text-secondary)",
              borderRadius: 100, padding: "5px 14px", fontSize: 12, fontWeight: 500,
              cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.15s",
            }}>{g.name}</button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => setShowFilter(f => !f)} style={{
            background: showFilter ? "rgba(34,211,238,0.12)" : "var(--bg-secondary)",
            border: `1px solid ${showFilter ? "#22D3EE" : "var(--border)"}`,
            color: showFilter ? "#22D3EE" : "var(--text-secondary)",
            borderRadius: 100, padding: "5px 14px", fontSize: 12, fontWeight: 500,
            cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.15s",
          }}>
            {showFilter ? "Filter ON" : "Filter OFF"} · 20–90 Hz
          </button>
          <button onClick={clear} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-tertiary)", borderRadius: 100, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "var(--font)" }}>
            Clear
          </button>
        </div>

        {/* Canvas */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: 12, cursor: "crosshair", background: "#07071a" }}>
          <canvas
            ref={canvasRef}
            width={836}
            height={220}
            style={{ width: "100%", display: "block", touchAction: "none" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>

        {/* Filter legend */}
        {showFilter && (
          <div style={{ display: "flex", gap: 20, marginBottom: 20, padding: "8px 14px", background: "rgba(34,211,238,0.06)", border: "1px solid rgba(34,211,238,0.15)", borderRadius: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,45,120,0.7)" }}>
              <div style={{ width: 20, height: 2, background: "rgba(255,45,120,0.5)", borderRadius: 1 }}/>
              Raw signal
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#22D3EE" }}>
              <div style={{ width: 20, height: 2, background: "#22D3EE", borderRadius: 1 }}/>
              Bandpass filtered (20–90 Hz)
            </div>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 300, alignSelf: "center" }}>
              The classifier sees only the filtered signal
            </span>
          </div>
        )}

        {/* Live feature bars */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 40 }}>
          {FEATURE_META.map(f => {
            const raw = features?.[f.key] ?? 0
            const pct = Math.min(100, (raw / f.maxVal) * 100)
            const isOpen = expandedFeat === f.key
            return (
              <div key={f.key}
                onClick={() => setExpandedFeat(k => k === f.key ? null : f.key)}
                style={{ background: "var(--bg-secondary)", border: `1px solid ${isOpen ? f.color+"60" : "var(--border)"}`, borderRadius: "var(--radius)", padding: "18px 16px", cursor: "pointer", transition: "border-color 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: f.color }}>{f.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "monospace" }}>
                    {features ? (f.key === "zc" ? Math.round(raw) : raw.toFixed(3)) : "-"}
                  </span>
                </div>
                <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                  <div className="feat-bar" style={{ height: "100%", width: `${pct}%`, background: f.color, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 300 }}>{f.full}</div>
                {isOpen && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 11, fontFamily: "monospace", color: f.color, background: `${f.color}10`, padding: "4px 8px", borderRadius: 4, marginBottom: 8 }}>{f.formula}</div>
                    <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.6, fontWeight: 300, margin: 0 }}>{f.desc}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Feature explanation strip */}
        <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "20px 24px", marginBottom: 48 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
            How these 4 features become a gesture prediction
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 0, alignItems: "center" }}>
            {[
              { label: "Draw signal", sub: "Mouse or touch", color: "#FF2D78" },
              { label: "Bandpass", sub: "20–90 Hz filter", color: "#A78BFA" },
              { label: "Window", sub: "200 samples", color: "#22D3EE" },
              { label: "4 features × 16 ch", sub: "= 64-dim vector", color: "#10B981" },
              { label: "Random Forest", sub: "500 trees → class", color: "#F59E0B" },
            ].map((step, i, arr) => (
              <div key={step.label} style={{ display: "flex", alignItems: "center" }}>
                <div style={{ flex: 1, textAlign: "center", padding: "0 4px" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: step.color }}>{step.label}</div>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 300, marginTop: 3 }}>{step.sub}</div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{ fontSize: 14, color: "var(--border)", flexShrink: 0 }}>›</div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300, lineHeight: 1.6 }}>
            This playground computes features on a single channel. The real classifier extracts all 4 features across 16 electrode channels simultaneously, producing a 64-dimensional vector. Click any feature card above to see its formula.
          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}
