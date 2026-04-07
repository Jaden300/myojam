import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import Navbar from "./Navbar"
import HandModel from "./HandModel"

const API = import.meta.env.VITE_API_URL

const GESTURE_COLORS = {
  "index flex":  "#FF2D78",
  "middle flex": "#3B82F6",
  "ring flex":   "#8B5CF6",
  "pinky flex":  "#10B981",
  "thumb flex":  "#F59E0B",
  "fist":        "#EF4444",
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

// Confusion matrix from model training — 10 subjects, 3254 test samples
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
  background: "var(--bg-secondary)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
}


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

  const SIZE = 72
  const STROKE = 6
  const R = (SIZE - STROKE) / 2
  const CIRC = 2 * Math.PI * R

  return (
    <div style={{
      background: "var(--bg-secondary)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: "24px", marginTop: 16
    }}>
      <div
        onClick={handleToggle}
        style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", cursor: "pointer", userSelect: "none"
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>
            Per-gesture accuracy
          </div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300, marginTop: 2 }}>
            84.85% overall · 3,254 test samples · 10 subjects
          </div>
        </div>
        <div style={{
          fontSize: 13, color: "var(--text-tertiary)",
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
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 12, marginTop: 24
        }}>
          {GESTURE_RECALL.map((g, i) => {
            const progress = animated ? g.recall / 100 : 0
            const dash = CIRC * progress
            const gap = CIRC - dash

            return (
              <div key={g.name} style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: 10,
                opacity: animated ? 1 : 0,
                transform: animated ? "translateY(0)" : "translateY(12px)",
                transition: `opacity 0.4s ease ${i * 0.07}s, transform 0.4s ease ${i * 0.07}s`
              }}>
                {/* Ring */}
                <div style={{ position: "relative", width: SIZE, height: SIZE }}>
                  <svg width={SIZE} height={SIZE} style={{ transform: "rotate(-90deg)" }}>
                    {/* Track */}
                    <circle
                      cx={SIZE/2} cy={SIZE/2} r={R}
                      fill="none"
                      stroke={g.color}
                      strokeWidth={STROKE}
                      strokeOpacity={0.12}
                    />
                    {/* Progress */}
                    <circle
                      cx={SIZE/2} cy={SIZE/2} r={R}
                      fill="none"
                      stroke={g.color}
                      strokeWidth={STROKE}
                      strokeLinecap="round"
                      strokeDasharray={`${dash} ${gap}`}
                      style={{
                        transition: `stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.07}s`
                      }}
                    />
                  </svg>
                  {/* Center % */}
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 600, color: g.color
                  }}>
                    {animated ? `${g.recall.toFixed(0)}%` : ""}
                  </div>
                </div>

                {/* Label */}
                <div style={{
                  fontSize: 11, color: "var(--text-secondary)",
                  fontWeight: 400, textAlign: "center", lineHeight: 1.4
                }}>
                  {g.name.replace(" flex", "")}
                  {g.name !== "fist" ? " flex" : ""}
                </div>

                {/* Count */}
                <div style={{
                  fontSize: 10, color: "var(--text-tertiary)",
                  fontWeight: 300
                }}>
                  {g.correct}/{g.total}
                </div>
              </div>
            )
          })}
        </div>

        <p style={{
          fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300,
          marginTop: 20, lineHeight: 1.6
        }}>
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
  const intervalRef = useRef(null)
  const serialBufferRef = useRef([])
  const logRef = useRef(null)

  const addLog = useCallback((gesture, confidence) => {
    const color = GESTURE_COLORS[gesture] || "var(--accent)"
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
      return result
    } catch (e) {
      setError("Backend unreachable — is the server running?")
    }
  }, [addLog])

  const fetchDataset = useCallback(async (gestureId = null) => {
    setLoading(true)
    setError(null)
    try {
      // Try up to 5 samples until model agrees with label
      for (let attempt = 0; attempt < 5; attempt++) {
        const url = gestureId ? `${API}/sample?gesture_id=${gestureId}` : `${API}/sample`
        const { data: sample } = await axios.get(url)
        const { data: result } = await axios.post(`${API}/predict`, { emg_window: sample.emg_window })
        
        // If no specific gesture requested, or model agrees with label
        if (!gestureId || result.gesture_id === gestureId) {
          setPrediction(result)
          setAllProbs(result.all_probabilities)
          setChartData(windowToChart(sample.emg_window))
          setFingerCurls(computeFingerCurls(sample.emg_window))
          addLog(result.gesture_name, result.confidence)
          return
        }
      }
      // Fallback — just use last result even if mismatch
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

  const activeColor = prediction
    ? (GESTURE_COLORS[prediction.gesture_name] || "var(--accent)")
    : "var(--accent)"

  return (
    <div style={{ minHeight: "100vh", paddingTop: 52, background: "var(--bg)" }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px" }}>

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginBottom: 32,
          borderBottom: "1px solid var(--border)", paddingBottom: 20
        }}>
          <div>
            <h1 style={{
              fontSize: 28, fontWeight: 600,
              letterSpacing: "-0.8px", color: "var(--text)"
            }}>myojam demo</h1>
            <p style={{
              fontSize: 13, color: "var(--text-secondary)",
              marginTop: 4, fontWeight: 300
            }}>Real-time EMG gesture classification</p>
          </div>

          {/* Mode switcher */}
          <div style={{
            display: "flex", gap: 2,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: 100, padding: 3
          }}>
            {[["dataset", "Dataset"], ["sensor", "Sensor"]].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setIsLive(false) }} style={{
                background: mode === m ? "#fff" : "transparent",
                border: "none",
                color: mode === m ? "var(--text)" : "var(--text-secondary)",
                borderRadius: 100, padding: "6px 18px",
                fontFamily: "var(--font)", fontSize: 13, fontWeight: mode === m ? 500 : 400,
                cursor: "pointer", transition: "all 0.15s",
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none"
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#FFF0F5", border: "1px solid rgba(255,45,120,0.2)",
            borderRadius: "var(--radius-sm)", padding: "10px 16px",
            fontSize: 13, color: "var(--accent)", marginBottom: 20
          }}>{error}</div>
        )}

        {/* Sensor banner */}
        {mode === "sensor" && (
          <div style={{
            ...card,
            background: serialStatus === "connected" ? "var(--accent-soft)" : "var(--bg-secondary)",
            border: `1px solid ${serialStatus === "connected" ? "rgba(255,45,120,0.2)" : "var(--border)"}`,
            padding: "14px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 20
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: serialStatus === "connected" ? "var(--accent)" : "var(--text-tertiary)"
              }}/>
              <span style={{
                fontSize: 13, fontWeight: 500,
                color: serialStatus === "connected" ? "var(--accent)" : "var(--text-secondary)"
              }}>
                {serialStatus === "connected" ? "Sensor connected" : "No sensor connected"}
              </span>
            </div>
            <button
              onClick={serialStatus === "connected" ? disconnectSensor : connectSensor}
              style={{
                background: serialStatus === "connected" ? "transparent" : "var(--accent)",
                border: serialStatus === "connected" ? "1px solid rgba(255,45,120,0.3)" : "none",
                color: serialStatus === "connected" ? "var(--accent)" : "#fff",
                borderRadius: 100, padding: "6px 18px",
                fontFamily: "var(--font)", fontSize: 13, fontWeight: 500, cursor: "pointer"
              }}>
              {serialStatus === "connected" ? "Disconnect" : "Connect sensor"}
            </button>
          </div>
        )}

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16 }}>

          {/* LEFT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Waveform */}
            <div style={{ ...card, padding: 24 }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 20
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 2 }}>
                    EMG signal
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300 }}>
                    {mode === "sensor" ? "Live sensor · 16 channels · 9600 baud" : "Ninapro DB5 · 16 channels · 200 Hz"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {mode === "dataset" && (
                    <button onClick={() => fetchDataset()} disabled={loading} style={{
                      background: "transparent", border: "1px solid var(--border-mid)",
                      color: loading ? "var(--text-tertiary)" : "var(--text-secondary)",
                      borderRadius: 100, padding: "5px 16px",
                      fontFamily: "var(--font)", fontSize: 13,
                      cursor: loading ? "not-allowed" : "pointer"
                    }}>{loading ? "..." : "↺ New sample"}</button>
                  )}
                  {mode === "dataset" && (
                    <button onClick={() => setIsLive(l => !l)} style={{
                      background: isLive ? "var(--accent-soft)" : "var(--accent)",
                      border: isLive ? "1px solid rgba(255,45,120,0.3)" : "none",
                      color: isLive ? "var(--accent)" : "#fff",
                      borderRadius: 100, padding: "5px 18px",
                      fontFamily: "var(--font)", fontSize: 13, fontWeight: 500, cursor: "pointer"
                    }}>{isLive ? "Stop" : "▶ Live"}</button>
                  )}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <XAxis dataKey="t" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "#fff", border: "1px solid var(--border)",
                      borderRadius: 10, fontFamily: "var(--font)", fontSize: 12,
                      boxShadow: "var(--shadow)"
                    }}
                    formatter={v => [v.toFixed(4), ""]}
                    labelStyle={{ display: "none" }}
                  />
                  <Line type="monotone" dataKey="ch1" stroke="#FF2D78" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                  <Line type="monotone" dataKey="ch2" stroke="#3B82F6" dot={false} strokeWidth={1} isAnimationActive={false} />
                  <Line type="monotone" dataKey="ch3" stroke="#10B981" dot={false} strokeWidth={1} isAnimationActive={false} opacity={0.8} />
                </LineChart>
              </ResponsiveContainer>

              <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
                {[["Ch 1", "#FF2D78"], ["Ch 2", "#3B82F6"], ["Ch 3", "#10B981"]].map(([l, c]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 14, height: 2, background: c, borderRadius: 1 }}/>
                    <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300 }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prediction banner */}
            {prediction && (
              <div style={{
                ...card,
                borderLeft: `3px solid ${activeColor}`,
                padding: "20px 24px",
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: 20, alignItems: "center"
              }}>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300, marginBottom: 6 }}>
                    Detected gesture
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: activeColor, letterSpacing: "-0.5px" }}>
                    {prediction.gesture_name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300, marginBottom: 6 }}>
                    Assistive action
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: "var(--text)" }}>
                    {GESTURES.find(g => g.name === prediction.gesture_name)?.action || "—"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300, marginBottom: 6 }}>
                    Confidence
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 600, color: activeColor, letterSpacing: "-1px" }}>
                    {(prediction.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            )}

            {/* Probability bars */}
            {prediction && (
              <div style={{ ...card, padding: "20px 24px" }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 16 }}>
                  Class probabilities
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {GESTURES.map(g => {
                    const prob = allProbs[g.name] || 0
                    const isActive = prediction.gesture_name === g.name
                    const color = GESTURE_COLORS[g.name]
                    return (
                      <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{
                          fontSize: 13, fontWeight: isActive ? 500 : 300,
                          color: isActive ? color : "var(--text-secondary)",
                          width: 96
                        }}>{g.name}</span>
                        <div style={{
                          flex: 1, height: 4, background: "var(--border)",
                          borderRadius: 100, overflow: "hidden"
                        }}>
                          <div style={{
                            width: `${prob * 100}%`, height: "100%",
                            background: isActive ? color : "var(--border-mid)",
                            borderRadius: 100, transition: "width 0.3s ease"
                          }}/>
                        </div>
                        <span style={{
                          fontSize: 13, fontWeight: isActive ? 500 : 300,
                          color: isActive ? color : "var(--text-tertiary)",
                          width: 36, textAlign: "right"
                        }}>{(prob * 100).toFixed(0)}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* 3D hand */}
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>3D model</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {HAND_COLORS.map(c => (
                    <div
                      key={c.name}
                      onClick={() => setHandColor(c.color)}
                      title={c.name}
                      style={{
                        width: 14, height: 14, borderRadius: "50%",
                        background: c.color,
                        border: handColor === c.color ? "2px solid #FF2D78" : "2px solid rgba(0,0,0,0.1)",
                        cursor: "pointer", transition: "border 0.15s"
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
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 14
              }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Action log</span>
                {actionLog.length > 0 && (
                  <button onClick={() => setActionLog([])} style={{
                    background: "none", border: "none",
                    fontSize: 12, color: "var(--text-tertiary)",
                    cursor: "pointer", fontFamily: "var(--font)"
                  }}>Clear</button>
                )}
              </div>
              <div ref={logRef} style={{
                maxHeight: 260, overflowY: "auto",
                display: "flex", flexDirection: "column", gap: 4
              }}>
                {actionLog.length === 0 ? (
                  <div style={{
                    fontSize: 13, color: "var(--text-tertiary)",
                    padding: "20px 0", textAlign: "center", fontWeight: 300
                  }}>No activity yet</div>
                ) : actionLog.map(entry => (
                  <div key={entry.id} style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", padding: "8px 12px",
                    background: "var(--bg)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    borderLeft: `3px solid ${entry.color}`
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{entry.gesture}</div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300 }}>{entry.action}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: entry.color }}>{(entry.confidence * 100).toFixed(0)}%</div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300 }}>{entry.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gesture map */}
        {prediction && (
          <div style={{ ...card, padding: "20px 24px", marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 16 }}>
              Gesture map
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
                      background: isActive ? "var(--accent-soft)" : "var(--bg)",
                      border: `1px solid ${isActive ? "rgba(255,45,120,0.25)" : "var(--border)"}`,
                      borderRadius: "var(--radius-sm)", padding: "14px 10px",
                      cursor: mode === "dataset" ? "pointer" : "default",
                      transition: "all 0.2s", textAlign: "center"
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: isActive ? "var(--accent)" : "var(--border-mid)",
                      margin: "0 auto 10px", transition: "all 0.2s"
                    }}/>
                    <div style={{
                      fontSize: 12, fontWeight: isActive ? 500 : 300,
                      color: isActive ? "var(--accent)" : "var(--text-secondary)",
                      marginBottom: 6
                    }}>{g.name}</div>
                    <div style={{
                      fontSize: 18,
                      color: isActive ? "var(--accent)" : "var(--text-tertiary)",
                      marginBottom: 4
                    }}>{g.key}</div>
                    <div style={{
                      fontSize: 10, fontWeight: 300,
                      color: isActive ? "var(--accent)" : "var(--text-tertiary)"
                    }}>{g.action}</div>
                  </div>
                )
              })}
            </div>
            {mode === "dataset" && (
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 12, fontWeight: 300 }}>
                Click any gesture to load a real sample from the dataset.
              </p>
            )}
          </div>
        )}

        {/* Accuracy rings — always visible */}
        <AccuracyRings />
      </div>

        {/* Feedback button */}
        <button
          data-tally-open="jaWR24"
          data-tally-width="400"
          data-tally-hide-title="1"
          style={{
            position: "fixed", bottom: 24, left: 24, zIndex: 100,
            background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: 100, padding: "10px 18px",
            fontFamily: "var(--font)", fontSize: 13, fontWeight: 500,
            color: "var(--text-secondary)", cursor: "pointer",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            display: "flex", alignItems: "center", gap: 8,
            transition: "border-color 0.15s, color 0.15s, transform 0.15s"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "rgba(255,45,120,0.3)"
            e.currentTarget.style.color = "var(--accent)"
            e.currentTarget.style.transform = "scale(1.04)"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "var(--border)"
            e.currentTarget.style.color = "var(--text-secondary)"
            e.currentTarget.style.transform = "scale(1)"
          }}
        >
          <span>💬</span> Give feedback
        </button>

    </div>
  )
}