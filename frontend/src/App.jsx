import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import Navbar from "./Navbar"
import HandModel from "./HandModel"
import { IconChat, IconGestureIndex, IconGestureMiddle, IconGestureRing, IconGesturePinky, IconGestureThumb, IconGestureFist } from "./Icons"

const API = import.meta.env.VITE_API_URL

const GESTURE_COLORS = {
  "index flex":  "#FF2D78",
  "middle flex": "#3B82F6",
  "ring flex":   "#8B5CF6",
  "pinky flex":  "#10B981",
  "thumb flex":  "#F59E0B",
  "fist":        "#EF4444",
}

const GESTURE_ICON = {
  "index flex":  IconGestureIndex,
  "middle flex": IconGestureMiddle,
  "ring flex":   IconGestureRing,
  "pinky flex":  IconGesturePinky,
  "thumb flex":  IconGestureThumb,
  "fist":        IconGestureFist,
}

const HAND_COLORS = [
  { name: "skin",   color: "#f5dce4" },
  { name: "slate",  color: "#c8d4e0" },
  { name: "sand",   color: "#e8d5b0" },
  { name: "rose",   color: "#f2b8c6" },
  { name: "mint",   color: "#b8e0d0" },
]

const GESTURES = [
  { id: 1, name: "index flex",  action: "Cursor left",  key: "←" },
  { id: 2, name: "middle flex", action: "Cursor right", key: "→" },
  { id: 3, name: "ring flex",   action: "Scroll down",  key: "↓" },
  { id: 4, name: "pinky flex",  action: "Scroll up",    key: "↑" },
  { id: 5, name: "thumb flex",  action: "Left click",   key: "◉" },
  { id: 6, name: "fist",        action: "Spacebar",     key: "▬" },
]

const LABELS = ["index flex", "middle flex", "ring flex", "pinky flex", "thumb flex", "fist"]

const GESTURE_RECALL = [
  { name: "index flex",  recall: 88.0, correct: 528, total: 600, color: "#FF2D78" },
  { name: "middle flex", recall: 81.1, correct: 415, total: 512, color: "#FF6B9D" },
  { name: "ring flex",   recall: 89.0, correct: 493, total: 554, color: "#3B82F6" },
  { name: "pinky flex",  recall: 80.1, correct: 410, total: 512, color: "#8B5CF6" },
  { name: "thumb flex",  recall: 85.0, correct: 446, total: 525, color: "#10B981" },
  { name: "fist",        recall: 86.0, correct: 474, total: 551, color: "#F59E0B" },
]

function windowToChart(window) {
  return window.map((s, i) => ({ t: i, ch1: s[0], ch2: s[1], ch3: s[2] }))
}

function computeFingerCurls(emgWindow) {
  if (!emgWindow || emgWindow.length === 0) return [0, 0, 0, 0, 0]
  const nCh = emgWindow[0].length
  const mav = Array.from({ length: nCh }, (_, ch) =>
    emgWindow.reduce((s, row) => s + Math.abs(row[ch]), 0) / emgWindow.length
  )
  const peak = Math.max(...mav, 0.0001)
  const n = mav.map(v => v / peak)
  return [
    (n[0] + n[1]) / 2,
    (n[2] + n[3]) / 2,
    (n[4] + n[5]) / 2,
    (n[6] + n[7]) / 2,
    (n[8] + n[9]) / 2,
  ]
}

const card = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
}

// ── Custom SVG waveform (replaces Recharts) ───────────────────────────────────
function WaveformSVG({ data }) {
  const CH_COLORS = ["#FF2D78", "#3B82F6", "#10B981"]
  const W = 800, H = 180
  const channels = ["ch1", "ch2", "ch3"]

  if (!data || data.length < 2) {
    return (
      <div style={{ height: H, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "rgba(255,255,255,0.18)", fontSize: 13 }}>Loading signal…</span>
      </div>
    )
  }

  const allVals = data.flatMap(d => channels.map(c => d[c] ?? 0))
  const minV = Math.min(...allVals)
  const maxV = Math.max(...allVals)
  const range = maxV - minV || 0.001
  const tx = i => (i / (data.length - 1)) * W
  const ty = v => 12 + (1 - (v - minV) / range) * (H - 24)

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        {CH_COLORS.map((c, i) => (
          <linearGradient key={i} id={`wg${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c} stopOpacity="0.2"/>
            <stop offset="100%" stopColor={c} stopOpacity="0"/>
          </linearGradient>
        ))}
        <filter id="wglow">
          <feGaussianBlur stdDeviation="1.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {[0.15, 0.35, 0.5, 0.65, 0.85].map((t, i) => (
        <line key={i} x1={0} x2={W} y1={H * t} y2={H * t}
          stroke="rgba(255,255,255,0.04)" strokeWidth={1}/>
      ))}
      {channels.map((ch, ci) => {
        const pts = data.map((d, i) => `${tx(i)},${ty(d[ch] ?? 0)}`).join(" ")
        const areaD = `M${tx(0)},${ty(data[0][ch] ?? 0)} ` +
          data.slice(1).map((d, i) => `L${tx(i+1)},${ty(d[ch] ?? 0)}`).join(" ") +
          ` L${W},${H} L0,${H} Z`
        return (
          <g key={ch}>
            {ci === 0 && <path d={areaD} fill={`url(#wg${ci})`}/>}
            <polyline
              points={pts} fill="none"
              stroke={CH_COLORS[ci]}
              strokeWidth={ci === 0 ? 1.8 : 1.2}
              filter="url(#wglow)"
              opacity={ci === 0 ? 1 : 0.7}
            />
          </g>
        )
      })}
    </svg>
  )
}

// ── Animated confidence arc ───────────────────────────────────────────────────
function ConfArc({ value, color, animated }) {
  const SIZE = 96, STROKE = 7, R = (SIZE - STROKE) / 2
  const CIRC = 2 * Math.PI * R
  const pct = animated ? value : 0
  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0 }}>
      <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke={color} strokeWidth={STROKE} strokeOpacity={0.12}/>
        <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke={color} strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${CIRC * pct} ${CIRC * (1 - pct)}`}
          style={{
            transition: "stroke-dasharray 0.6s cubic-bezier(0.34,1.56,0.64,1)",
            filter: `drop-shadow(0 0 5px ${color}88)`
          }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, fontWeight: 700, color,
        letterSpacing: "-0.5px"
      }}>
        {animated ? `${(value * 100).toFixed(0)}%` : ""}
      </div>
    </div>
  )
}

// ── Per-gesture accuracy rings ────────────────────────────────────────────────
function AccuracyRings() {
  const [visible, setVisible] = useState(true)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(t)
  }, [])

  function handleToggle() {
    setVisible(v => {
      const next = !v
      if (next) setTimeout(() => setAnimated(true), 50)
      else setAnimated(false)
      return next
    })
  }

  const SIZE = 72, STROKE = 6, R = (SIZE - STROKE) / 2
  const CIRC = 2 * Math.PI * R

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "24px", marginTop: 16
    }}>
      <div onClick={handleToggle} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", userSelect: "none" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>Per-gesture accuracy</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 300, marginTop: 2 }}>
            84.85% overall · 3,254 test samples · 10 subjects
          </div>
        </div>
        <div style={{
          fontSize: 13, color: "rgba(255,255,255,0.4)",
          transition: "transform 0.25s ease",
          transform: visible ? "rotate(180deg)" : "rotate(0deg)",
          display: "inline-block"
        }}>▾</div>
      </div>

      <div style={{
        overflow: "hidden",
        maxHeight: visible ? 400 : 0,
        opacity: visible ? 1 : 0,
        transition: "max-height 0.4s ease, opacity 0.3s ease",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginTop: 24 }}>
          {GESTURE_RECALL.map((g, i) => {
            const progress = animated ? g.recall / 100 : 0
            const dash = CIRC * progress
            const gap = CIRC - dash
            return (
              <div key={g.name} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                opacity: animated ? 1 : 0,
                transform: animated ? "translateY(0)" : "translateY(12px)",
                transition: `opacity 0.4s ease ${i * 0.07}s, transform 0.4s ease ${i * 0.07}s`
              }}>
                <div style={{ position: "relative", width: SIZE, height: SIZE }}>
                  <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)" }}>
                    <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke={g.color} strokeWidth={STROKE} strokeOpacity={0.15}/>
                    <circle cx={SIZE/2} cy={SIZE/2} r={R} fill="none" stroke={g.color} strokeWidth={STROKE}
                      strokeLinecap="round" strokeDasharray={`${dash} ${gap}`}
                      style={{
                        transition: `stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.07}s`,
                        filter: `drop-shadow(0 0 3px ${g.color}88)`
                      }}
                    />
                  </svg>
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 600, color: g.color
                  }}>
                    {animated ? `${g.recall.toFixed(0)}%` : ""}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 400, textAlign: "center", lineHeight: 1.4 }}>
                  {g.name.replace(" flex", "")}{g.name !== "fist" ? " flex" : ""}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 300 }}>
                  {g.correct}/{g.total}
                </div>
              </div>
            )
          })}
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontWeight: 300, marginTop: 20, lineHeight: 1.6 }}>
          Recall per gesture — correct predictions divided by total samples of that gesture in the test set.
        </p>
      </div>
    </div>
  )
}

export default function App() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("dataset")
  const [prediction, setPrediction] = useState(null)
  const [chartData, setChartData] = useState([])
  const [allProbs, setAllProbs] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isLive, setIsLive] = useState(false)
  const [actionLog, setActionLog] = useState([])
  const [serialPort, setSerialPort] = useState(null)
  const [serialStatus, setSerialStatus] = useState("disconnected")
  const [fingerCurls, setFingerCurls] = useState([0, 0, 0, 0, 0])
  const [handColor, setHandColor] = useState("#f5dce4")
  const [confAnimated, setConfAnimated] = useState(false)
  const intervalRef = useRef(null)
  const serialBufferRef = useRef([])
  const logRef = useRef(null)

  const addLog = useCallback((gesture, confidence) => {
    const color = GESTURE_COLORS[gesture] || "#FF2D78"
    const g = GESTURES.find(g => g.name === gesture)
    setActionLog(prev => [{
      id: Date.now() + Math.random(), gesture, confidence, color,
      action: g?.action || "—", key: g?.key || "?",
      time: new Date().toLocaleTimeString("en-US", { hour12: false })
    }, ...prev].slice(0, 40))
  }, [])

  const predict = useCallback(async (emgWindow) => {
    try {
      const { data: result } = await axios.post(`${API}/predict`, { emg_window: emgWindow })
      setPrediction(result)
      setAllProbs(result.all_probabilities)
      setChartData(windowToChart(emgWindow))
      setFingerCurls(computeFingerCurls(emgWindow))
      addLog(result.gesture_name, result.confidence)
      setConfAnimated(false)
      setTimeout(() => setConfAnimated(true), 50)
      return result
    } catch (e) {
      setError("Backend unreachable — is the server running?")
    }
  }, [addLog])

  const fetchDataset = useCallback(async (gestureId = null) => {
    setLoading(true)
    setError(null)
    try {
      for (let attempt = 0; attempt < 5; attempt++) {
        const url = gestureId ? `${API}/sample?gesture_id=${gestureId}` : `${API}/sample`
        const { data: sample } = await axios.get(url)
        const { data: result } = await axios.post(`${API}/predict`, { emg_window: sample.emg_window })
        if (!gestureId || result.gesture_id === gestureId) {
          setPrediction(result)
          setAllProbs(result.all_probabilities)
          setChartData(windowToChart(sample.emg_window))
          setFingerCurls(computeFingerCurls(sample.emg_window))
          addLog(result.gesture_name, result.confidence)
          setConfAnimated(false)
          setTimeout(() => setConfAnimated(true), 50)
          return
        }
      }
      const url = gestureId ? `${API}/sample?gesture_id=${gestureId}` : `${API}/sample`
      const { data: sample } = await axios.get(url)
      await predict(sample.emg_window)
    } catch (e) {
      setError("Backend unreachable — is the server running?")
    } finally {
      setLoading(false)
    }
  }, [predict, addLog])

  useEffect(() => {
    if (mode === "dataset" && isLive) {
      intervalRef.current = setInterval(() => fetchDataset(), 900)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [mode, isLive, fetchDataset])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0
  }, [actionLog])

  useEffect(() => { fetchDataset() }, [])

  async function connectSensor() {
    if (!("serial" in navigator)) {
      setError("WebSerial not supported. Use Chrome or Edge.")
      return
    }
    try {
      const port = await navigator.serial.requestPort()
      await port.open({ baudRate: 9600 })
      setSerialPort(port)
      setSerialStatus("connected")
      setMode("sensor")
      readSerial(port)
    } catch (e) {
      setError("Sensor connection cancelled or failed.")
    }
  }

  async function disconnectSensor() {
    if (serialPort) {
      try { await serialPort.close() } catch (_) {}
      setSerialPort(null)
    }
    setSerialStatus("disconnected")
    setIsLive(false)
  }

  async function readSerial(port) {
    const decoder = new TextDecoderStream()
    port.readable.pipeTo(decoder.writable)
    const reader = decoder.readable.getReader()
    let line = ""
    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        line += value
        const lines = line.split("\n")
        line = lines.pop()
        for (const l of lines) {
          const vals = l.trim().split(",").map(Number).filter(n => !isNaN(n))
          if (vals.length > 0) {
            const channels = vals.length >= 16
              ? vals.slice(0, 16)
              : Array(16).fill(vals[0] / 1023.0 - 0.5)
            serialBufferRef.current.push(channels)
            if (serialBufferRef.current.length >= 200) {
              const window = serialBufferRef.current.splice(0, 200)
              predict(window)
            }
          }
        }
      }
    } catch (e) {
      setSerialStatus("disconnected")
    }
  }

  const activeColor = prediction ? (GESTURE_COLORS[prediction.gesture_name] || "#FF2D78") : "#FF2D78"

  return (
    <div style={{ minHeight: "100vh", paddingTop: 52, background: "#05051a" }}>
      <Navbar />

      {/* Hero strip */}
      <div style={{
        background: "linear-gradient(180deg, rgba(255,45,120,0.07) 0%, transparent 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "32px 32px 24px"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 400, marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                myojam · live demo
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.8px", margin: 0 }}>
                EMG Gesture Classifier
              </h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4, fontWeight: 300 }}>
                {mode === "sensor"
                  ? "Live sensor · 16 channels · 9600 baud"
                  : "Ninapro DB5 dataset · Random Forest · 84.85% accuracy"}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {isLive && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 7, height: 7, borderRadius: "50%", background: "#FF2D78",
                    boxShadow: "0 0 10px #FF2D78, 0 0 20px #FF2D7866"
                  }}/>
                  <span style={{ fontSize: 12, color: "#FF2D78", fontWeight: 600, letterSpacing: "0.05em" }}>LIVE</span>
                </div>
              )}

              <div style={{
                display: "flex", gap: 2,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 100, padding: 3
              }}>
                {[["dataset", "Dataset"], ["sensor", "Sensor"]].map(([m, label]) => (
                  <button key={m} onClick={() => { setMode(m); setIsLive(false) }} style={{
                    background: mode === m ? "rgba(255,255,255,0.12)" : "transparent",
                    border: "none",
                    color: mode === m ? "#fff" : "rgba(255,255,255,0.4)",
                    borderRadius: 100, padding: "6px 18px",
                    fontFamily: "var(--font)", fontSize: 13, fontWeight: mode === m ? 500 : 400,
                    cursor: "pointer", transition: "all 0.15s",
                    boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.3)" : "none"
                  }}>{label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 32px 64px" }}>

        {error && (
          <div style={{
            background: "rgba(255,45,120,0.1)", border: "1px solid rgba(255,45,120,0.25)",
            borderRadius: 12, padding: "10px 16px",
            fontSize: 13, color: "#FF2D78", marginBottom: 20
          }}>{error}</div>
        )}

        {mode === "sensor" && (
          <div style={{
            background: serialStatus === "connected" ? "rgba(255,45,120,0.08)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${serialStatus === "connected" ? "rgba(255,45,120,0.25)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 12, padding: "14px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 20
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: serialStatus === "connected" ? "#FF2D78" : "rgba(255,255,255,0.2)",
                boxShadow: serialStatus === "connected" ? "0 0 8px #FF2D78" : "none"
              }}/>
              <span style={{ fontSize: 13, fontWeight: 500, color: serialStatus === "connected" ? "#FF2D78" : "rgba(255,255,255,0.5)" }}>
                {serialStatus === "connected" ? "Sensor connected" : "No sensor connected"}
              </span>
            </div>
            <button
              onClick={serialStatus === "connected" ? disconnectSensor : connectSensor}
              style={{
                background: serialStatus === "connected" ? "transparent" : "#FF2D78",
                border: serialStatus === "connected" ? "1px solid rgba(255,45,120,0.3)" : "none",
                color: serialStatus === "connected" ? "#FF2D78" : "#fff",
                borderRadius: 100, padding: "6px 18px",
                fontFamily: "var(--font)", fontSize: 13, fontWeight: 500, cursor: "pointer"
              }}>
              {serialStatus === "connected" ? "Disconnect" : "Connect sensor"}
            </button>
          </div>
        )}

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>

          {/* LEFT column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Waveform card */}
            <div style={{ ...card, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#fff", marginBottom: 2 }}>EMG signal</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 300 }}>
                    {mode === "sensor" ? "Live · 16 ch · 9600 baud" : "Ninapro DB5 · 16 ch · 200 Hz"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {mode === "dataset" && (
                    <button onClick={() => fetchDataset()} disabled={loading} style={{
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: loading ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.5)",
                      borderRadius: 100, padding: "5px 16px",
                      fontFamily: "var(--font)", fontSize: 13,
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: "border-color 0.15s, color 0.15s"
                    }}>{loading ? "…" : "↺ New sample"}</button>
                  )}
                  {mode === "dataset" && (
                    <button onClick={() => setIsLive(l => !l)} style={{
                      background: isLive ? "rgba(255,45,120,0.15)" : "#FF2D78",
                      border: isLive ? "1px solid rgba(255,45,120,0.35)" : "none",
                      color: isLive ? "#FF2D78" : "#fff",
                      borderRadius: 100, padding: "5px 18px",
                      fontFamily: "var(--font)", fontSize: 13, fontWeight: 500,
                      cursor: "pointer", transition: "all 0.15s"
                    }}>{isLive ? "■ Stop" : "▶ Live"}</button>
                  )}
                </div>
              </div>

              <WaveformSVG data={chartData} />

              <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
                {[["Ch 1", "#FF2D78"], ["Ch 2", "#3B82F6"], ["Ch 3", "#10B981"]].map(([l, c]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 14, height: 2, background: c, borderRadius: 1, boxShadow: `0 0 4px ${c}` }}/>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 300 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prediction banner */}
            {prediction && (
              <div style={{
                ...card,
                borderLeft: `3px solid ${activeColor}`,
                padding: "24px",
                display: "grid", gridTemplateColumns: "auto 1fr auto",
                gap: 24, alignItems: "center"
              }}>
                <ConfArc value={prediction.confidence} color={activeColor} animated={confAnimated} />

                <div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 300, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    Detected gesture
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: activeColor, letterSpacing: "-0.5px", lineHeight: 1.1, display: "flex", alignItems: "center", gap: 10 }}>
                    {(() => { const I = GESTURE_ICON[prediction.gesture_name]; return I ? <I size={28} color={activeColor} /> : null })()}
                    {prediction.gesture_name}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 8, fontWeight: 300 }}>
                    Mapped to:{" "}
                    <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
                      {GESTURES.find(g => g.name === prediction.gesture_name)?.action || "—"}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: 52, height: 52,
                    background: `${activeColor}15`,
                    border: `1.5px solid ${activeColor}40`,
                    borderRadius: 12,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, color: activeColor, fontWeight: 700,
                    boxShadow: `0 0 20px ${activeColor}28`
                  }}>
                    {GESTURES.find(g => g.name === prediction.gesture_name)?.key || "?"}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 6 }}>action key</div>
                </div>
              </div>
            )}

            {/* Probability bars */}
            {prediction && (
              <div style={{ ...card, padding: "20px 24px" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#fff", marginBottom: 16 }}>Class probabilities</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {GESTURES.map(g => {
                    const prob = allProbs[g.name] || 0
                    const isActive = prediction.gesture_name === g.name
                    const color = GESTURE_COLORS[g.name]
                    return (
                      <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: isActive ? 500 : 300, color: isActive ? color : "rgba(255,255,255,0.4)", width: 96 }}>
                          {g.name}
                        </span>
                        <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 100, overflow: "hidden" }}>
                          <div style={{
                            width: `${prob * 100}%`, height: "100%",
                            background: isActive ? color : "rgba(255,255,255,0.14)",
                            borderRadius: 100, transition: "width 0.35s ease",
                            boxShadow: isActive ? `0 0 8px ${color}66` : "none"
                          }}/>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 300, color: isActive ? color : "rgba(255,255,255,0.3)", width: 36, textAlign: "right" }}>
                          {(prob * 100).toFixed(0)}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* 3D hand */}
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>3D model</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {HAND_COLORS.map(c => (
                    <div
                      key={c.name}
                      onClick={() => setHandColor(c.color)}
                      title={c.name}
                      style={{
                        width: 14, height: 14, borderRadius: "50%",
                        background: c.color,
                        border: handColor === c.color ? "2px solid #FF2D78" : "2px solid rgba(255,255,255,0.1)",
                        cursor: "pointer", transition: "border 0.15s",
                        boxShadow: handColor === c.color ? "0 0 6px #FF2D7866" : "none"
                      }}
                    />
                  ))}
                </div>
              </div>
              <div style={{ height: 260 }}>
                <HandModel gestureName={prediction?.gesture_name} fingerCurls={fingerCurls} skinColor={handColor} />
              </div>
            </div>

            {/* Action log */}
            <div style={{ ...card, padding: "18px 20px", flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Action log</span>
                {actionLog.length > 0 && (
                  <button onClick={() => setActionLog([])} style={{
                    background: "none", border: "none",
                    fontSize: 12, color: "rgba(255,255,255,0.3)",
                    cursor: "pointer", fontFamily: "var(--font)"
                  }}>Clear</button>
                )}
              </div>
              <div ref={logRef} style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                {actionLog.length === 0 ? (
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", padding: "20px 0", textAlign: "center", fontWeight: 300 }}>
                    No activity yet
                  </div>
                ) : actionLog.map(entry => (
                  <div key={entry.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderLeft: `3px solid ${entry.color}`
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>{entry.gesture}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 300 }}>{entry.action}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: entry.color }}>{(entry.confidence * 100).toFixed(0)}%</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 300 }}>{entry.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gesture map */}
        {prediction && (
          <div style={{ ...card, padding: "24px", marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Gesture map</div>
              {mode === "dataset" && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontWeight: 300 }}>
                  Click any gesture to load a real dataset sample
                </div>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
              {GESTURES.map(g => {
                const isActive = prediction?.gesture_name === g.name
                const color = GESTURE_COLORS[g.name]
                return (
                  <div
                    key={g.id}
                    onClick={() => mode === "dataset" && fetchDataset(g.id)}
                    style={{
                      background: isActive ? `${color}18` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${isActive ? `${color}45` : "rgba(255,255,255,0.07)"}`,
                      borderRadius: 14, padding: "16px 10px",
                      cursor: mode === "dataset" ? "pointer" : "default",
                      transition: "all 0.2s", textAlign: "center",
                      boxShadow: isActive ? `0 0 24px ${color}22` : "none"
                    }}
                    onMouseEnter={e => {
                      if (!isActive && mode === "dataset") {
                        e.currentTarget.style.background = "rgba(255,255,255,0.07)"
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.03)"
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"
                      }
                    }}
                  >
                    <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
                      {(() => { const I = GESTURE_ICON[g.name]; return I ? <I size={26} color={isActive ? color : "rgba(255,255,255,0.45)"} /> : null })()}
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: isActive ? 600 : 300,
                      color: isActive ? color : "rgba(255,255,255,0.45)",
                      marginBottom: 8, lineHeight: 1.3
                    }}>
                      {g.name}
                    </div>
                    <div style={{
                      display: "inline-block",
                      background: isActive ? `${color}22` : "rgba(255,255,255,0.06)",
                      border: `1px solid ${isActive ? `${color}40` : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 6, padding: "2px 8px",
                      fontSize: 10, color: isActive ? color : "rgba(255,255,255,0.3)",
                      fontWeight: 500
                    }}>
                      {g.action}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <AccuracyRings />
      </div>

      {/* Feedback button */}
      <button
        data-tally-open="jaWR24"
        data-tally-width="400"
        data-tally-hide-title="1"
        style={{
          position: "fixed", bottom: 24, left: 24, zIndex: 100,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 100, padding: "10px 18px",
          fontFamily: "var(--font)", fontSize: 13, fontWeight: 500,
          color: "rgba(255,255,255,0.5)", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", gap: 8,
          transition: "border-color 0.15s, color 0.15s, transform 0.15s"
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = "rgba(255,45,120,0.4)"
          e.currentTarget.style.color = "#FF2D78"
          e.currentTarget.style.transform = "scale(1.04)"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"
          e.currentTarget.style.color = "rgba(255,255,255,0.5)"
          e.currentTarget.style.transform = "scale(1)"
        }}
      >
        <IconChat size={14} color="currentColor" /> Give feedback
      </button>

    </div>
  )
}
