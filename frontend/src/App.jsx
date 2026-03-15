import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import Navbar from "./Navbar"

const API = import.meta.env.VITE_API_URL

const GESTURE_COLORS = {
  "index flex": "#B8FF00", "middle flex": "#00E5FF",
  "ring flex": "#FF4545", "pinky flex": "#FF9F00",
  "thumb flex": "#C084FC", "fist": "#FFFFFF",
}

const GESTURES = [
  { id: 1, name: "index flex",  action: "CURSOR LEFT",  key: "←" },
  { id: 2, name: "middle flex", action: "CURSOR RIGHT", key: "→" },
  { id: 3, name: "ring flex",   action: "SCROLL DOWN",  key: "↓" },
  { id: 4, name: "pinky flex",  action: "SCROLL UP",    key: "↑" },
  { id: 5, name: "thumb flex",  action: "LEFT CLICK",   key: "◉" },
  { id: 6, name: "fist",        action: "SPACEBAR",     key: "▬" },
]

function windowToChart(window) {
  return window.map((s, i) => ({ t: i, ch1: s[0], ch2: s[1], ch3: s[2] }))
}

function generateSimEMG(length = 200, channels = 16) {
  return Array.from({ length }, () =>
    Array.from({ length: channels }, () => (Math.random() - 0.5) * 0.8)
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
  const intervalRef = useRef(null)
  const serialBufferRef = useRef([])
  const logRef = useRef(null)

  const addLog = useCallback((gesture, confidence) => {
    const color = GESTURE_COLORS[gesture] || "#fff"
    const g = GESTURES.find(g => g.name === gesture)
    setActionLog(prev => [{
      id: Date.now(),
      gesture, confidence, color,
      action: g?.action || "—",
      key: g?.key || "?",
      time: new Date().toLocaleTimeString("en-US", { hour12: false })
    }, ...prev].slice(0, 40))
  }, [])

  const predict = useCallback(async (emgWindow) => {
    try {
      const { data: result } = await axios.post(`${API}/predict`, {
        emg_window: emgWindow
      })
      setPrediction(result)
      setAllProbs(result.all_probabilities)
      setChartData(windowToChart(emgWindow))
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
      const url = gestureId ? `${API}/sample?gesture_id=${gestureId}` : `${API}/sample`
      const { data: sample } = await axios.get(url)
      await predict(sample.emg_window)
    } catch (e) {
      setError("Backend unreachable — check that Render is running.")
    } finally {
      setLoading(false)
    }
  }, [predict])

  // Dataset live mode
  useEffect(() => {
    if (mode === "dataset" && isLive) {
      intervalRef.current = setInterval(() => fetchDataset(), 900)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [mode, isLive, fetchDataset])

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0
  }, [actionLog])

  // Load initial sample
  useEffect(() => { fetchDataset() }, [])

  // WebSerial connect
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
            // replicate single-channel to 16 channels if needed
            const channels = vals.length >= 16
              ? vals.slice(0, 16)
              : Array(16).fill(vals[0] / 1023.0 - 0.5)
            serialBufferRef.current.push(channels)
            if (serialBufferRef.current.length >= 200) {
              const window = serialBufferRef.current.splice(0, 200)
              setChartData(windowToChart(window))
              predict(window)
            }
          }
        }
      }
    } catch (e) {
      setSerialStatus("disconnected")
    }
  }

  const activeColor = prediction ? (GESTURE_COLORS[prediction.gesture_name] || "#B8FF00") : "#B8FF00"

  return (
    <div style={{ minHeight: "100vh", paddingTop: 58 }}>
      <div className="grid-bg" />
      <Navbar />

      <div style={{
        maxWidth: 1280, margin: "0 auto",
        padding: "32px 40px",
        position: "relative", zIndex: 1
      }}>

        {/* Page header */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-end", marginBottom: 32,
          borderBottom: "1px solid var(--border)", paddingBottom: 20
        }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font)", fontWeight: 800,
              fontSize: 36, letterSpacing: "-1px", lineHeight: 1
            }}>
              SIGNAL DEMO
            </h1>
            <p style={{
              fontFamily: "var(--mono)", fontSize: 11,
              color: "var(--text2)", marginTop: 6, letterSpacing: "0.08em"
            }}>
              REAL-TIME EMG GESTURE CLASSIFICATION
            </p>
          </div>

          {/* Mode switcher */}
          <div style={{
            display: "flex", gap: 2,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 6, padding: 3
          }}>
            {[["dataset", "DATASET"], ["sensor", "SENSOR"]].map(([m, label]) => (
              <button key={m} onClick={() => { setMode(m); setIsLive(false) }} style={{
                background: mode === m ? "var(--border2)" : "transparent",
                border: "none", color: mode === m ? "var(--text)" : "var(--text2)",
                borderRadius: 4, padding: "6px 16px",
                fontFamily: "var(--mono)", fontSize: 11,
                letterSpacing: "0.08em", cursor: "pointer",
                transition: "all 0.15s"
              }}>{label}</button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            background: "#FF454518", border: "1px solid #FF454544",
            borderRadius: 6, padding: "10px 16px",
            fontFamily: "var(--mono)", fontSize: 12,
            color: "#FF4545", marginBottom: 20
          }}>{error}</div>
        )}

        {/* Sensor mode banner */}
        {mode === "sensor" && (
          <div style={{
            background: serialStatus === "connected" ? "#B8FF0012" : "var(--surface)",
            border: `1px solid ${serialStatus === "connected" ? "#B8FF0044" : "var(--border)"}`,
            borderRadius: 8, padding: "16px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 20
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: serialStatus === "connected" ? "var(--accent)" : "var(--text3)",
                boxShadow: serialStatus === "connected" ? "0 0 8px var(--accent)" : "none"
              }}/>
              <span style={{
                fontFamily: "var(--mono)", fontSize: 12,
                color: serialStatus === "connected" ? "var(--accent)" : "var(--text2)",
                letterSpacing: "0.08em"
              }}>
                {serialStatus === "connected" ? "SENSOR CONNECTED" : "NO SENSOR CONNECTED"}
              </span>
              {serialStatus === "connected" && (
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 11,
                  color: "var(--text2)"
                }}>9600 BAUD · 16CH</span>
              )}
            </div>
            <button
              onClick={serialStatus === "connected" ? disconnectSensor : connectSensor}
              style={{
                background: serialStatus === "connected" ? "#FF454518" : "var(--accent)",
                border: serialStatus === "connected" ? "1px solid #FF454544" : "none",
                color: serialStatus === "connected" ? "#FF4545" : "#000",
                borderRadius: 4, padding: "7px 18px",
                fontFamily: "var(--mono)", fontSize: 11,
                letterSpacing: "0.08em", cursor: "pointer"
              }}>
              {serialStatus === "connected" ? "DISCONNECT" : "CONNECT SENSOR"}
            </button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Waveform card */}
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 8, padding: 24
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 20
              }}>
                <div>
                  <div style={{
                    fontFamily: "var(--mono)", fontSize: 11,
                    color: "var(--text2)", letterSpacing: "0.1em", marginBottom: 4
                  }}>EMG WAVEFORM</div>
                  <div style={{
                    fontFamily: "var(--mono)", fontSize: 10,
                    color: "var(--text3)", letterSpacing: "0.08em"
                  }}>
                    {mode === "sensor" ? "LIVE SENSOR · 16CH · 9600 BAUD"
                      : mode === "simulate" ? "SIMULATED · 16CH · 200HZ"
                      : "NINAPRO DB5 · 16CH · 200HZ"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {mode === "dataset" && (
                    <button onClick={() => fetchDataset()} disabled={loading} style={{
                      background: "transparent", border: "1px solid var(--border2)",
                      color: loading ? "var(--text3)" : "var(--text2)",
                      borderRadius: 4, padding: "6px 14px",
                      fontFamily: "var(--mono)", fontSize: 11,
                      letterSpacing: "0.06em", cursor: loading ? "not-allowed" : "pointer"
                    }}>{loading ? "..." : "↺ NEW SAMPLE"}</button>
                  )}
                  {(mode === "dataset" || mode === "simulate") && (
                    <button onClick={() => setIsLive(l => !l)} style={{
                      background: isLive ? "#FF454518" : "var(--accent)",
                      border: isLive ? "1px solid #FF454544" : "none",
                      color: isLive ? "#FF4545" : "#000",
                      borderRadius: 4, padding: "6px 16px",
                      fontFamily: "var(--mono)", fontSize: 11,
                      letterSpacing: "0.06em", cursor: "pointer", fontWeight: 700
                    }}>{isLive ? "■ STOP" : "▶ LIVE"}</button>
                  )}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <XAxis dataKey="t" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface2)", border: "1px solid var(--border2)",
                      borderRadius: 4, fontFamily: "var(--mono)", fontSize: 11
                    }}
                    formatter={v => [v.toFixed(4), ""]}
                    labelStyle={{ display: "none" }}
                  />
                  <Line type="monotone" dataKey="ch1" stroke="var(--accent)" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                  <Line type="monotone" dataKey="ch2" stroke="#00E5FF" dot={false} strokeWidth={1} isAnimationActive={false} />
                  <Line type="monotone" dataKey="ch3" stroke="#FF4545" dot={false} strokeWidth={1} isAnimationActive={false} opacity={0.7} />
                </LineChart>
              </ResponsiveContainer>

              <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
                {[["CH1", "var(--accent)"], ["CH2", "#00E5FF"], ["CH3", "#FF4545"]].map(([l, c]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 14, height: 2, background: c }}/>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text2)" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prediction banner */}
            {prediction && (
              <div style={{
                background: "var(--surface)", border: `1px solid var(--border)`,
                borderLeft: `3px solid ${activeColor}`,
                borderRadius: 8, padding: "20px 24px",
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: 20, alignItems: "center"
              }}>
                <div>
                  <div style={{
                    fontFamily: "var(--mono)", fontSize: 10,
                    color: "var(--text2)", letterSpacing: "0.1em", marginBottom: 6
                  }}>DETECTED GESTURE</div>
                  <div style={{
                    fontFamily: "var(--font)", fontWeight: 800,
                    fontSize: 28, color: activeColor, letterSpacing: "-0.5px"
                  }}>{prediction.gesture_name.toUpperCase()}</div>
                </div>
                <div>
                  <div style={{
                    fontFamily: "var(--mono)", fontSize: 10,
                    color: "var(--text2)", letterSpacing: "0.1em", marginBottom: 6
                  }}>ASSISTIVE ACTION</div>
                  <div style={{
                    fontFamily: "var(--mono)", fontSize: 18,
                    color: "var(--text)", letterSpacing: "0.05em"
                  }}>
                    {GESTURES.find(g => g.name === prediction.gesture_name)?.action || "—"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{
                    fontFamily: "var(--mono)", fontSize: 10,
                    color: "var(--text2)", letterSpacing: "0.1em", marginBottom: 6
                  }}>CONFIDENCE</div>
                  <div style={{
                    fontFamily: "var(--font)", fontWeight: 800,
                    fontSize: 36, color: activeColor, letterSpacing: "-1px"
                  }}>{(prediction.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>
            )}

            {/* Probability bars */}
            {prediction && (
              <div style={{
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 8, padding: 20
              }}>
                <div style={{
                  fontFamily: "var(--mono)", fontSize: 10,
                  color: "var(--text2)", letterSpacing: "0.1em", marginBottom: 16
                }}>CLASS PROBABILITIES</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {GESTURES.map(g => {
                    const prob = allProbs[g.name] || 0
                    const isActive = prediction.gesture_name === g.name
                    const color = GESTURE_COLORS[g.name]
                    return (
                      <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{
                          fontFamily: "var(--mono)", fontSize: 11,
                          color: isActive ? color : "var(--text2)",
                          width: 100, letterSpacing: "0.04em"
                        }}>{g.name}</span>
                        <div style={{
                          flex: 1, height: 4, background: "var(--border2)",
                          borderRadius: 2, overflow: "hidden"
                        }}>
                          <div style={{
                            width: `${prob * 100}%`, height: "100%",
                            background: isActive ? color : "var(--text3)",
                            borderRadius: 2, transition: "width 0.3s ease"
                          }}/>
                        </div>
                        <span style={{
                          fontFamily: "var(--mono)", fontSize: 11,
                          color: isActive ? color : "var(--text3)",
                          width: 36, textAlign: "right"
                        }}>{(prob * 100).toFixed(0)}%</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Gesture map */}
            {mode === "dataset" && (
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 8, padding: 20
            }}>
              
              <div style={{
                fontFamily: "var(--mono)", fontSize: 10,
                color: "var(--text2)", letterSpacing: "0.1em", marginBottom: 14
              }}>GESTURE → ACTION MAP</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {GESTURES.map(g => {
                  const isActive = prediction?.gesture_name === g.name
                  const color = GESTURE_COLORS[g.name]
                  return (
                    <div
                      key={g.id}
                      onClick={() => mode === "dataset" && fetchDataset(g.id)}
                      style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center",
                        background: isActive ? `${color}14` : "var(--surface2)",
                        border: `1px solid ${isActive ? color + "44" : "var(--border)"}`,
                        borderRadius: 6, padding: "10px 14px",
                        cursor: mode === "dataset" ? "pointer" : "default",
                        transition: "all 0.2s"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 7, height: 7, borderRadius: "50%",
                          background: isActive ? color : "var(--text3)",
                          boxShadow: isActive ? `0 0 6px ${color}` : "none",
                          transition: "all 0.2s"
                        }}/>
                        <span style={{
                          fontFamily: "var(--mono)", fontSize: 11,
                          color: isActive ? color : "var(--text2)",
                          letterSpacing: "0.04em"
                        }}>{g.name}</span>
                      </div>
                      <span style={{
                        fontFamily: "var(--mono)", fontSize: 11,
                        color: isActive ? color : "var(--text3)"
                      }}>{g.key}</span>
                    </div>
                  )
                })}
              </div>
            

              {mode === "dataset" && (
                <p style={{
                  fontFamily: "var(--mono)", fontSize: 10,
                  color: "var(--text3)", marginTop: 12, lineHeight: 1.6
                }}>CLICK ANY GESTURE TO LOAD A REAL NINAPRO SAMPLE</p>
              )}
            </div>
          )}

            {/* Live action log */}
            <div style={{
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 8, padding: 20, flex: 1
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: 14
              }}>
                <div style={{
                  fontFamily: "var(--mono)", fontSize: 10,
                  color: "var(--text2)", letterSpacing: "0.1em"
                }}>ACTION LOG</div>
                {actionLog.length > 0 && (
                  <button onClick={() => setActionLog([])} style={{
                    background: "none", border: "none",
                    fontFamily: "var(--mono)", fontSize: 10,
                    color: "var(--text3)", cursor: "pointer",
                    letterSpacing: "0.06em"
                  }}>CLEAR</button>
                )}
              </div>
              <div ref={logRef} style={{
                maxHeight: 280, overflowY: "auto",
                display: "flex", flexDirection: "column", gap: 4
              }}>
                {actionLog.length === 0 ? (
                  <div style={{
                    fontFamily: "var(--mono)", fontSize: 11,
                    color: "var(--text3)", padding: "20px 0",
                    textAlign: "center", letterSpacing: "0.06em"
                  }}>NO ACTIVITY YET</div>
                ) : actionLog.map(entry => (
                  <div key={entry.id} style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center",
                    padding: "7px 10px",
                    background: "var(--surface2)",
                    borderRadius: 4,
                    borderLeft: `2px solid ${entry.color}`
                  }}>
                    <div>
                      <div style={{
                        fontFamily: "var(--mono)", fontSize: 11,
                        color: entry.color, letterSpacing: "0.04em"
                      }}>{entry.gesture}</div>
                      <div style={{
                        fontFamily: "var(--mono)", fontSize: 9,
                        color: "var(--text3)", letterSpacing: "0.06em"
                      }}>{entry.action}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        fontFamily: "var(--mono)", fontSize: 11,
                        color: "var(--text2)"
                      }}>{(entry.confidence * 100).toFixed(0)}%</div>
                      <div style={{
                        fontFamily: "var(--mono)", fontSize: 9,
                        color: "var(--text3)"
                      }}>{entry.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}