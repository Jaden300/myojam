import { useState, useRef, useEffect, useCallback } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"

const API = import.meta.env.VITE_API_URL

const GESTURES = [
  { id: 1, name: "index flex",  color: "#FF2D78", action: "Cursor left"  },
  { id: 2, name: "middle flex", color: "#3B82F6", action: "Cursor right" },
  { id: 3, name: "ring flex",   color: "#8B5CF6", action: "Scroll down"  },
  { id: 4, name: "pinky flex",  color: "#10B981", action: "Scroll up"    },
  { id: 5, name: "thumb flex",  color: "#F59E0B", action: "Left click"   },
  { id: 6, name: "fist",        color: "#EF4444", action: "Spacebar"     },
]

const FEAT_ROWS = [
  { key: "mav", label: "MAV", fullName: "Mean Absolute Value",  color: "#FF2D78", importance: 35 },
  { key: "rms", label: "RMS", fullName: "Root Mean Square",     color: "#F59E0B", importance: 27 },
  { key: "wl",  label: "WL",  fullName: "Waveform Length",      color: "#10B981", importance: 25 },
  { key: "zcr", label: "ZCR", fullName: "Zero Crossing Rate",   color: "#8B5CF6", importance: 13 },
]

// IIR approximation of 20–90 Hz bandpass (matches FrequencyAnalyzer logic)
function bandpassApprox(sig) {
  const f = [...sig]
  const alpha = 0.85
  let prev = f[0]
  for (let i = 1; i < f.length; i++) {
    const next = alpha * (prev + f[i] - f[i - 1])
    prev = next; f[i] = next
  }
  const alphaL = 0.45
  for (let i = 1; i < f.length; i++)
    f[i] = f[i - 1] + alphaL * (f[i] - f[i - 1])
  return f
}

// Extract MAV, RMS, WL, ZCR per channel from a [200][16] window
function extractFeatures(window) {
  const n = window.length
  const mav = new Array(16).fill(0)
  const rms = new Array(16).fill(0)
  const zcr = new Array(16).fill(0)
  const wl  = new Array(16).fill(0)
  for (let ch = 0; ch < 16; ch++) {
    const sig = bandpassApprox(window.map(r => r[ch]))
    for (let t = 0; t < n; t++) { mav[ch] += Math.abs(sig[t]); rms[ch] += sig[t] ** 2 }
    mav[ch] /= n; rms[ch] = Math.sqrt(rms[ch] / n)
    for (let t = 1; t < n; t++) {
      if (sig[t] * sig[t - 1] < 0) zcr[ch]++
      wl[ch] += Math.abs(sig[t] - sig[t - 1])
    }
  }
  return { mav, rms, zcr, wl }
}

function normalize(arr) {
  const mn = Math.min(...arr), mx = Math.max(...arr)
  return arr.map(v => mx === mn ? 0.5 : (v - mn) / (mx - mn))
}

// Dark purple → pink heat colour
function heatColor(t) {
  const r = Math.round(18 + t * (255 - 18))
  const g = Math.round(8  + t * (45  - 8))
  const b = Math.round(38 + t * (90  - 38))
  return `rgb(${r},${g},${b})`
}

// ── 16-channel stacked waveform canvas
function MultiChannelCanvas({ emgWindow, highlightCh }) {
  const ref = useRef(null)

  const draw = useCallback(() => {
    const canvas = ref.current
    if (!canvas || !emgWindow) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    if (!rect.width) return
    canvas.width  = rect.width  * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext("2d")
    ctx.scale(dpr, dpr)
    const W = rect.width, H = rect.height

    ctx.fillStyle = "#07071a"
    ctx.fillRect(0, 0, W, H)

    const rowH = H / 16
    for (let ch = 0; ch < 16; ch++) {
      const sig = emgWindow.map(r => r[ch])
      const mn = Math.min(...sig), mx = Math.max(...sig)
      const rng = mx - mn || 1
      const y0 = ch * rowH + rowH / 2
      const isHL = highlightCh === ch

      ctx.strokeStyle = "rgba(255,255,255,0.035)"
      ctx.lineWidth = 0.5
      ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke()

      ctx.strokeStyle = isHL ? "#FF2D78" : `rgba(255,45,120,${isHL ? 1 : 0.22})`
      ctx.lineWidth = isHL ? 1.5 : 0.75
      ctx.beginPath()
      for (let t = 0; t < sig.length; t++) {
        const x = (t / (sig.length - 1)) * W
        const y = y0 - ((sig[t] - mn) / rng - 0.5) * rowH * 0.82
        t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()

      ctx.fillStyle = isHL ? "#FF2D78" : "rgba(255,255,255,0.22)"
      ctx.font = `${isHL ? "600 " : ""}8px monospace`
      ctx.fillText(`Ch${String(ch + 1).padStart(2, "0")}`, 4, y0 + 3)
    }
  }, [emgWindow, highlightCh])

  useEffect(() => {
    draw()
    window.addEventListener("resize", draw)
    return () => window.removeEventListener("resize", draw)
  }, [draw])

  return <canvas ref={ref} style={{ width: "100%", height: 256, display: "block", borderRadius: 8 }} />
}

// ── Single-channel raw vs filtered canvas
function FilterCanvas({ emgWindow, channel }) {
  const ref = useRef(null)

  const draw = useCallback(() => {
    const canvas = ref.current
    if (!canvas || !emgWindow) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    if (!rect.width) return
    canvas.width  = rect.width  * dpr
    canvas.height = rect.height * dpr
    const ctx = canvas.getContext("2d")
    ctx.scale(dpr, dpr)
    const W = rect.width, H = rect.height

    ctx.fillStyle = "#07071a"
    ctx.fillRect(0, 0, W, H)

    const raw  = emgWindow.map(r => r[channel])
    const filt = bandpassApprox(raw)

    const drawLine = (sig, color, lw) => {
      const mn = Math.min(...sig), mx = Math.max(...sig)
      const rng = mx - mn || 1
      ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.beginPath()
      for (let t = 0; t < sig.length; t++) {
        const x = (t / (sig.length - 1)) * W
        const y = H / 2 - ((sig[t] - mn) / rng - 0.5) * H * 0.76
        t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    drawLine(raw,  "rgba(255,45,120,0.30)", 1)
    drawLine(filt, "#22D3EE", 1.5)
  }, [emgWindow, channel])

  useEffect(() => {
    draw()
    window.addEventListener("resize", draw)
    return () => window.removeEventListener("resize", draw)
  }, [draw])

  return <canvas ref={ref} style={{ width: "100%", height: 120, display: "block", borderRadius: 6 }} />
}

// ── Step wrapper
function StepCard({ n, title, subtitle, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%", background: "var(--accent)",
          color: "#fff", fontSize: 13, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 3,
        }}>{n}</div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.4px", marginBottom: 3 }}>{title}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{subtitle}</div>
        </div>
      </div>
      <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 20px 16px" }}>
        {children}
      </div>
      {n < 4 && (
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
          <div style={{ width: 1, height: 28, background: "var(--border)" }} />
        </div>
      )}
    </div>
  )
}

// ── Feature heatmap: 4 rows × 16 channels
function FeatureHeatmap({ features, onHover }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "52px repeat(16, 1fr)", gap: 2, marginBottom: 4 }}>
        <div />
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} style={{ fontSize: 8, color: "var(--text-tertiary)", textAlign: "center", fontFamily: "monospace" }}>
            {i + 1}
          </div>
        ))}
      </div>
      {FEAT_ROWS.map(row => {
        const vals = features[row.key]
        const norm = normalize(vals)
        return (
          <div key={row.key} style={{ display: "grid", gridTemplateColumns: "52px repeat(16, 1fr)", gap: 2, marginBottom: 2 }}>
            <div style={{
              fontSize: 10, fontWeight: 700, color: row.color, display: "flex",
              alignItems: "center", fontFamily: "monospace", gap: 4,
            }}>
              {row.label}
              <span style={{ fontSize: 8, color: "var(--text-tertiary)", fontWeight: 400 }}>{row.importance}%</span>
            </div>
            {vals.map((v, ch) => (
              <div
                key={ch}
                title={`${row.fullName}  Ch${ch + 1}: ${v.toFixed(5)}`}
                onMouseEnter={() => onHover(ch)}
                onMouseLeave={() => onHover(-1)}
                style={{
                  height: 36, borderRadius: 3, cursor: "crosshair",
                  background: heatColor(norm[ch]),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 6.5, fontFamily: "monospace",
                  color: norm[ch] > 0.55 ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.38)",
                  transition: "transform 0.1s, outline 0.1s",
                  outline: "1px solid transparent",
                }}
                onMouseOver={e => { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.outline = "1px solid rgba(255,255,255,0.3)" }}
                onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.outline = "1px solid transparent" }}
              >
                {v < 0.001 ? v.toExponential(0) : v.toFixed(2)}
              </div>
            ))}
          </div>
        )
      })}
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>low</span>
        <div style={{ flex: 1, height: 6, borderRadius: 3, background: "linear-gradient(90deg, rgb(18,8,38), rgb(255,45,90))" }} />
        <span style={{ fontSize: 10, color: "var(--text-tertiary)" }}>high</span>
      </div>
    </div>
  )
}

// ── RF prediction probability bars
function PredictionBars({ prediction, trueGesture }) {
  const probs = prediction.all_probabilities
  const sorted = Object.entries(probs).sort(([, a], [, b]) => b - a)
  const isCorrect = prediction.gesture_name === trueGesture?.name
  const winnerG = GESTURES.find(g => g.name === prediction.gesture_name) || { color: "#FF2D78" }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div style={{
          padding: "14px 20px", borderRadius: 10, flex: "0 0 auto",
          background: isCorrect ? "rgba(16,185,129,0.10)" : "rgba(239,68,68,0.10)",
          border: `1px solid ${isCorrect ? "#10B981" : "#EF4444"}40`,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4, color: isCorrect ? "#10B981" : "#EF4444" }}>
            {isCorrect ? "✓ Correct prediction" : "✗ Incorrect prediction"}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", lineHeight: 1.1 }}>{prediction.gesture_name}</div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>True label: <span style={{ color: "var(--text-secondary)" }}>{trueGesture?.name}</span></div>
        </div>
        <div style={{ padding: "14px 20px", borderRadius: 10, background: "var(--bg)", border: "1px solid var(--border)", flex: "0 0 auto" }}>
          <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Confidence</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: winnerG.color, lineHeight: 1 }}>
            {(prediction.confidence * 100).toFixed(1)}<span style={{ fontSize: 14, fontWeight: 400 }}>%</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>of 500 trees voted</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sorted.map(([name, prob]) => {
          const g = GESTURES.find(x => x.name === name) || { color: "#888" }
          const isWinner = name === prediction.gesture_name
          const action = GESTURES.find(x => x.name === name)?.action || ""
          return (
            <div key={name}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: isWinner ? 700 : 400, color: isWinner ? g.color : "var(--text-secondary)" }}>{name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{action}</div>
                </div>
                <div style={{ fontSize: 12, fontFamily: "monospace", color: isWinner ? g.color : "var(--text-tertiary)", fontWeight: isWinner ? 700 : 400 }}>
                  {(prob * 100).toFixed(1)}%
                </div>
              </div>
              <div style={{ height: isWinner ? 8 : 5, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${prob * 100}%`,
                  background: isWinner ? g.color : `${g.color}50`,
                  borderRadius: 4, transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main page
export default function PipelineExplorer() {
  const [selectedId,  setSelectedId]  = useState(null)
  const [emgWindow,   setEmgWindow]   = useState(null)
  const [gesture,     setGesture]     = useState(null)
  const [features,    setFeatures]    = useState(null)
  const [prediction,  setPrediction]  = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [hovCh,       setHovCh]       = useState(-1)

  async function loadSample(gestureId) {
    setLoading(true); setError(null)
    setPrediction(null); setFeatures(null); setEmgWindow(null); setGesture(null)
    try {
      const sampleRes = await fetch(`${API}/sample?gesture_id=${gestureId}`)
      if (!sampleRes.ok) throw new Error("Could not fetch sample")
      const sample = await sampleRes.json()

      setEmgWindow(sample.emg_window)
      setGesture({ id: sample.gesture_id, name: sample.gesture_name })
      setFeatures(extractFeatures(sample.emg_window))

      const predRes = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emg_window: sample.emg_window }),
      })
      if (!predRes.ok) throw new Error("Prediction API error")
      const pred = await predRes.json()
      setPrediction(pred)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        background: "linear-gradient(155deg, #060614 0%, #130030 50%, #060614 100%)",
        borderBottom: "1px solid var(--border)", padding: "100px 32px 64px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Subtle grid */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Reveal>
            <SectionPill>Step-by-step ML trace</SectionPill>
            <h1 style={{ fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 600, letterSpacing: "-1.5px", color: "#fff", marginBottom: 16, lineHeight: 1.08 }}>
              How does the model<br />
              <span style={{ color: "var(--accent)" }}>actually decide?</span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.70)", fontWeight: 400, lineHeight: 1.7, maxWidth: 560, marginBottom: 28 }}>
              Select a gesture. myojam fetches a real 200-sample window from the Ninapro DB5 dataset, runs the full 64-feature extraction pipeline in your browser, and calls the trained Random Forest - showing every transformation step live.
            </p>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[
                { n: "200",  label: "samples per window" },
                { n: "16",   label: "electrode channels" },
                { n: "64",   label: "features extracted" },
                { n: "500",  label: "trees in the forest" },
              ].map(({ n, label }) => (
                <div key={n} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Gesture selector */}
      <div style={{ borderBottom: "1px solid var(--border)", padding: "28px 32px", background: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            Choose a gesture to trace
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            {GESTURES.map(g => (
              <button
                key={g.id}
                onClick={() => { setSelectedId(g.id); loadSample(g.id) }}
                disabled={loading}
                style={{
                  padding: "8px 16px", borderRadius: 8, cursor: loading ? "wait" : "pointer",
                  border: `1px solid ${selectedId === g.id ? g.color : "var(--border)"}`,
                  background: selectedId === g.id ? `${g.color}18` : "transparent",
                  color: selectedId === g.id ? g.color : "var(--text-secondary)",
                  fontSize: 13, fontWeight: selectedId === g.id ? 600 : 400,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ marginRight: 6, fontSize: 11, opacity: 0.6 }}>#{g.id}</span>{g.name}
              </button>
            ))}
            {selectedId && (
              <button
                onClick={() => loadSample(selectedId)}
                disabled={loading}
                style={{
                  marginLeft: "auto", padding: "8px 18px", borderRadius: 8,
                  background: "var(--accent)", color: "#fff", border: "none",
                  fontSize: 13, fontWeight: 600, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? "Loading…" : "New sample ↺"}
              </button>
            )}
          </div>
          {error && (
            <div style={{ marginTop: 12, fontSize: 12, color: "#EF4444" }}>
              Error: {error}. Make sure the myojam API is reachable.
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!emgWindow && !loading && (
        <div style={{ maxWidth: 860, margin: "80px auto", textAlign: "center", padding: "0 32px" }}>
          <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.18 }}>⟳</div>
          <p style={{ fontSize: 15, color: "var(--text-tertiary)" }}>Select a gesture above to begin the trace.</p>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 6, opacity: 0.7 }}>
            Each click fetches a randomly selected window of that gesture class from subject S01.
          </p>
        </div>
      )}

      {loading && (
        <div style={{ maxWidth: 860, margin: "80px auto", textAlign: "center", padding: "0 32px" }}>
          <div style={{ fontSize: 13, color: "var(--text-secondary)", opacity: 0.7 }}>
            Fetching EMG window from Ninapro DB5 via API…
          </div>
        </div>
      )}

      {/* Pipeline steps */}
      {emgWindow && (
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 32px 64px", display: "flex", flexDirection: "column", gap: 0 }}>

          {/* ── Step 1: Raw signal */}
          <StepCard
            n={1}
            title="Raw EMG signal - 200 × 16"
            subtitle={`A single gesture window (1 second at 200 Hz) from Ninapro DB5, labeled "${gesture?.name}". All 16 electrode channels are shown stacked.`}
          >
            <MultiChannelCanvas emgWindow={emgWindow} highlightCh={hovCh} />
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {[
                { label: "Window length", value: "200 samples (1 s)" },
                { label: "Sampling rate", value: "200 Hz" },
                { label: "True label", value: gesture?.name },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "var(--bg)", borderRadius: 6, padding: "8px 12px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", fontFamily: "monospace" }}>{value}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 10, lineHeight: 1.65 }}>
              Hover any cell in Step 3 to highlight that channel here. Each row is one electrode around the forearm. Channels 1–8 cover the flexor compartment (palm-side), channels 9–16 the extensor compartment.
            </p>
          </StepCard>

          {/* ── Step 2: Bandpass filter */}
          <StepCard
            n={2}
            title="Bandpass filter - 20 to 90 Hz"
            subtitle="Zero-phase 4th-order Butterworth applied per channel. Pink = raw signal. Cyan = filtered signal retaining only the gesture band."
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[0, 4, 8, 12].map(ch => (
                <div key={ch}>
                  <div style={{ fontSize: 9, color: "var(--text-tertiary)", marginBottom: 4, fontFamily: "monospace", textAlign: "center" }}>
                    Ch{String(ch + 1).padStart(2, "0")}
                  </div>
                  <FilterCanvas emgWindow={emgWindow} channel={ch} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-tertiary)" }}>
                <div style={{ width: 20, height: 2, background: "rgba(255,45,120,0.45)", borderRadius: 1 }} />
                Raw signal
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-tertiary)" }}>
                <div style={{ width: 20, height: 2, background: "#22D3EE", borderRadius: 1 }} />
                Filtered (20–90 Hz)
              </div>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 10, lineHeight: 1.65 }}>
              Channels 1, 5, 9, and 13 are shown (one per quadrant of the forearm). Below 20 Hz: electrode motion artefact. Above 90 Hz: amplifier noise. The bandpass isolates genuine motor unit firing from both artefact sources simultaneously.
            </p>
          </StepCard>

          {/* ── Step 3: Feature heatmap */}
          <StepCard
            n={3}
            title="Feature extraction - 4 × 16 = 64 values"
            subtitle="Each row is one time-domain feature computed from the filtered signal of each electrode. Colour intensity = relative magnitude within that feature. The % labels are MDI feature importances from the trained RF."
          >
            <FeatureHeatmap features={features} onHover={setHovCh} />
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {FEAT_ROWS.map(row => (
                <div key={row.key} style={{ background: "var(--bg)", borderRadius: 6, padding: "10px 12px", border: "1px solid var(--border)", borderLeft: `3px solid ${row.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: row.color, fontFamily: "monospace" }}>{row.label}</div>
                    <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>{row.importance}% importance</div>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-secondary)" }}>{row.fullName}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 12, lineHeight: 1.65 }}>
              MAV and RMS together account for 62% of the RF's decision. They primarily encode motor unit recruitment intensity. WL captures signal morphological complexity. ZCR is correlated with dominant firing frequency. Hover any cell to see the exact value and highlight that channel in Step 1.
            </p>
          </StepCard>

          {/* ── Step 4: Prediction */}
          <StepCard
            n={4}
            title="Random Forest classification - 500 trees"
            subtitle="The 64-feature vector is passed to the trained model. Each tree votes independently; the gesture with the plurality wins. Confidence = fraction of trees that agreed."
          >
            {prediction ? (
              <PredictionBars prediction={prediction} trueGesture={gesture} />
            ) : (
              <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-tertiary)", fontSize: 13 }}>
                Running prediction…
              </div>
            )}
            {prediction && (
              <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 14, lineHeight: 1.65 }}>
                The model was trained under leave-one-subject-out (LOSO) cross-validation: 9 of 10 subjects trained, 1 tested, repeated for all subjects. Cross-subject accuracy = 84.85% ± 1.91%. Low confidence on a correct prediction typically indicates gesture similarity - see the Confusion Matrix for which pairs confuse the model.
              </p>
            )}
          </StepCard>

        </div>
      )}

      <Footer />
    </div>
  )
}
