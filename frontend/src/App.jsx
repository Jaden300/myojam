import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts"

const API = import.meta.env.VITE_API_URL

const GESTURE_COLORS = {
  "index flex":  "#60a5fa",
  "middle flex": "#34d399",
  "ring flex":   "#a78bfa",
  "pinky flex":  "#f472b6",
  "thumb flex":  "#fbbf24",
  "fist":        "#f87171",
}

const GESTURES = [
  { id: 1, name: "index flex" },
  { id: 2, name: "middle flex" },
  { id: 3, name: "ring flex" },
  { id: 4, name: "pinky flex" },
  { id: 5, name: "thumb flex" },
  { id: 6, name: "fist" },
]

function windowToChart(window) {
  return window.map((sample, i) => ({
    t: i,
    ch1: sample[0],
    ch2: sample[1],
    ch3: sample[2],
  }))
}

function GestureCard({ name, confidence, isActive, onClick }) {
  const color = GESTURE_COLORS[name] || "#94a3b8"
  return (
    <div onClick={onClick} style={{
      background: isActive ? `${color}22` : "#1e2130",
      border: `1px solid ${isActive ? color : "#2d3148"}`,
      borderRadius: 12, padding: "14px 18px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      transition: "all 0.3s ease", cursor: "pointer",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: isActive ? color : "#4b5563"
        }}/>
        <span style={{
          fontSize: 15,
          color: isActive ? color : "#94a3b8",
          fontWeight: isActive ? 600 : 400
        }}>{name}</span>
      </div>
      <span style={{ fontSize: 14, color: isActive ? color : "#4b5563", fontWeight: 600 }}>
        {isActive && confidence ? `${(confidence * 100).toFixed(0)}%` : "—"}
      </span>
    </div>
  )
}

export default function App() {
  const navigate = useNavigate()
  const [prediction, setPrediction] = useState(null)
  const [chartData, setChartData] = useState([])
  const [allProbs, setAllProbs] = useState({})
  const [isLive, setIsLive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)

  const fetchAndPredict = useCallback(async (gestureId = null) => {
    setLoading(true)
    setError(null)
    try {
      const url = gestureId
        ? `${API}/sample?gesture_id=${gestureId}`
        : `${API}/sample`
      const { data: sample } = await axios.get(url)
      const { data: result } = await axios.post(`${API}/predict`, {
        emg_window: sample.emg_window
      })
      setChartData(windowToChart(sample.emg_window))
      setPrediction(result)
      setAllProbs(result.all_probabilities)
    } catch (e) {
      setError("Backend not reachable. Is uvicorn running on port 8000?")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAndPredict() }, [fetchAndPredict])

  useEffect(() => {
    if (isLive) {
      intervalRef.current = setInterval(() => fetchAndPredict(), 800)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [isLive, fetchAndPredict])

  const activeName = prediction?.gesture_name
  const activeColor = GESTURE_COLORS[activeName] || "#60a5fa"

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>

      <button
        onClick={() => navigate("/")}
        style={{
          background: "none", border: "none", color: "#64748b",
          fontSize: 14, cursor: "pointer", marginBottom: 24,
          padding: 0, display: "flex", alignItems: "center", gap: 6
        }}
      >
        ← back
      </button>

      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, letterSpacing: "-0.5px" }}>
          Myo<span style={{ color: "#60a5fa" }}>Signal</span>
        </h1>
        <p style={{ color: "#64748b", marginTop: 6, fontSize: 15 }}>
          Real-time EMG gesture classification for assistive control
        </p>
        {error && (
          <p style={{ color: "#f87171", marginTop: 8, fontSize: 13 }}>{error}</p>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24 }}>
        <div>
          <div style={{
            background: "#1e2130", borderRadius: 16,
            padding: "24px", border: "1px solid #2d3148"
          }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 20
            }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600 }}>EMG signal</h2>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
                  Channels 1–3 of 16 · 200 Hz · real Ninapro data
                </p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => fetchAndPredict()}
                  disabled={loading}
                  style={{
                    background: "#1e293b", border: "1px solid #334155",
                    color: "#94a3b8", borderRadius: 8, padding: "6px 14px",
                    fontSize: 13, cursor: loading ? "not-allowed" : "pointer"
                  }}
                >
                  {loading ? "..." : "↺ New sample"}
                </button>
                <button
                  onClick={() => setIsLive(l => !l)}
                  style={{
                    background: isLive ? "#ef444422" : "#1e293b",
                    border: `1px solid ${isLive ? "#ef4444" : "#334155"}`,
                    color: isLive ? "#ef4444" : "#94a3b8",
                    borderRadius: 8, padding: "6px 14px",
                    fontSize: 13, cursor: "pointer", fontWeight: 500
                  }}
                >
                  {isLive ? "■ Stop" : "▶ Live mode"}
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="t" hide />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "#1e2130", border: "1px solid #2d3148", borderRadius: 8 }}
                  labelStyle={{ display: "none" }}
                  formatter={(v) => [v.toFixed(4), ""]}
                />
                <Line type="monotone" dataKey="ch1" stroke="#60a5fa" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                <Line type="monotone" dataKey="ch2" stroke="#34d399" dot={false} strokeWidth={1.5} isAnimationActive={false} />
                <Line type="monotone" dataKey="ch3" stroke="#a78bfa" dot={false} strokeWidth={1.5} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>

            <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
              {[["ch1","#60a5fa"], ["ch2","#34d399"], ["ch3","#a78bfa"]].map(([label, color]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 16, height: 2, background: color, borderRadius: 1 }}/>
                  <span style={{ fontSize: 12, color: "#64748b" }}>Channel {label.slice(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {prediction && (
            <div style={{
              background: `${activeColor}18`,
              border: `1px solid ${activeColor}55`,
              borderRadius: 12, padding: "18px 24px",
              marginTop: 16, display: "flex",
              justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <p style={{ fontSize: 13, color: "#64748b" }}>Detected gesture</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: activeColor, marginTop: 2 }}>
                  {activeName}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 13, color: "#64748b" }}>Confidence</p>
                <p style={{ fontSize: 26, fontWeight: 700, color: activeColor, marginTop: 2 }}>
                  {(prediction.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: "#94a3b8" }}>
            Gestures
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {GESTURES.map(g => (
              <GestureCard
                key={g.id}
                name={g.name}
                isActive={activeName === g.name}
                confidence={allProbs[g.name]}
                onClick={() => fetchAndPredict(g.id)}
              />
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#374151", marginTop: 16, lineHeight: 1.6 }}>
            Click any gesture to load a real sample from the Ninapro dataset and run it through the model.
          </p>
        </div>
      </div>
    </div>
  )
}