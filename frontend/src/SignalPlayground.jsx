import { useRef, useEffect, useState } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, StaggerList, HoverCard, SectionPill } from "./Animate"

// Same feature math as the Python backend
function computeFeatures(signal) {
  const n = signal.length
  if (n < 2) return null

  const mav = signal.reduce((s, v) => s + Math.abs(v), 0) / n
  const rms = Math.sqrt(signal.reduce((s, v) => s + v * v, 0) / n)

  let zc = 0
  for (let i = 1; i < n; i++) {
    if ((signal[i] >= 0) !== (signal[i - 1] >= 0)) zc++
  }

  let wl = 0
  for (let i = 1; i < n; i++) {
    wl += Math.abs(signal[i] - signal[i - 1])
  }

  return { mav, rms, zc, wl }
}

function classifyGesture(features) {
  if (!features) return null
  const { mav, rms, zc, wl } = features

  if (mav < 0.02 && rms < 0.02) return { name: "rest", confidence: 0.91, color: "#AEAEB2" }
  if (zc > 60 && wl > 3.0) return { name: "fist", confidence: 0.84, color: "#EF4444" }
  if (zc > 45 && mav > 0.25) return { name: "index flex", confidence: 0.78, color: "#FF2D78" }
  if (zc > 35 && rms > 0.28) return { name: "middle flex", confidence: 0.74, color: "#3B82F6" }
  if (wl > 2.0 && mav > 0.18) return { name: "ring flex", confidence: 0.71, color: "#8B5CF6" }
  if (zc < 20 && wl > 1.2) return { name: "thumb flex", confidence: 0.68, color: "#F59E0B" }
  if (zc < 15) return { name: "pinky flex", confidence: 0.65, color: "#10B981" }
  return { name: "index flex", confidence: 0.60, color: "#FF2D78" }
}

const FEATURE_INFO = {
  mav: { label: "MAV", full: "Mean Absolute Value", desc: "Average signal energy — how active the muscle is overall.", color: "#FF2D78" },
  rms: { label: "RMS", full: "Root Mean Square", desc: "Signal power — similar to MAV but emphasises peaks.", color: "#3B82F6" },
  zc:  { label: "ZC",  full: "Zero Crossing Rate", desc: "How often the signal crosses zero — a proxy for frequency content.", color: "#8B5CF6" },
  wl:  { label: "WL",  full: "Waveform Length", desc: "Total variation of the signal — captures complexity and speed.", color: "#10B981" },
}

export default function SignalPlayground() {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [signal, setSignal] = useState([])
  const [features, setFeatures] = useState(null)
  const [gesture, setGesture] = useState(null)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const W = canvas.width, H = canvas.height
    const mid = H / 2

    ctx.clearRect(0, 0, W, H)
    ctx.fillStyle = "#F5F5F7"
    ctx.fillRect(0, 0, W, H)

    ctx.strokeStyle = "rgba(0,0,0,0.06)"
    for (let i = 1; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(0, H * i / 4)
      ctx.lineTo(W, H * i / 4)
      ctx.stroke()
    }

    if (!hasDrawn) return
    if (signal.length < 2) return

    const stepX = W / 200
    const ampScale = H * 0.42

    ctx.strokeStyle = "#FF2D78"
    ctx.lineWidth = 2.5
    ctx.beginPath()
    signal.forEach((v, i) => {
      const x = i * stepX, y = mid - v * ampScale
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()

  }, [signal, hasDrawn])

  function startDraw() {
    setDrawing(true)
    setHasDrawn(true)
    setSignal([])
    setFeatures(null)
    setGesture(null)
  }

  function draw(e) {
    if (!drawing) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const y = (e.clientY || e.touches[0].clientY) - rect.top
    const H = canvas.height

    const val = -((y - H / 2) / (H * 0.42))
    const clamped = Math.max(-1, Math.min(1, val))

    setSignal(prev => {
      const next = [...prev, clamped].slice(-200)
      const feats = computeFeatures(next)
      setFeatures(feats)
      setGesture(classifyGesture(feats))
      return next
    })
  }

  function endDraw() {
    setDrawing(false)
  }

  function clear() {
    setSignal([])
    setFeatures(null)
    setGesture(null)
    setHasDrawn(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #fff0f5 0%, #ffffff 60%)",
        borderBottom: "1px solid var(--border)",
        padding: "100px 32px 64px"
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Interactive · No hardware needed</SectionPill>

            <h1 style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 600,
              marginBottom: 20
            }}>
              Signal playground.<br />
              <span style={{ color: "var(--accent)" }}>
                Draw a waveform, see the math.
              </span>
            </h1>

            <p style={{ fontSize: 17, color: "var(--text-secondary)", maxWidth: 560 }}>
              Sketch an EMG-like signal and watch MAV, RMS, ZC, and WL compute live.
            </p>
          </Reveal>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "56px 32px 80px" }}>

        {/* Canvas */}
        <div style={{
          border: "2px solid var(--border)",
          borderRadius: "var(--radius)",
          cursor: "crosshair",
          marginBottom: 32
        }}>
          <canvas
            ref={canvasRef}
            width={820}
            height={220}
            style={{ width: "100%" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
        </div>

        {/* Feature explainer */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 48 }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 32 }}>
            What are these features?
          </h2>

          <StaggerList
            items={Object.entries(FEATURE_INFO)}
            columns={1}
            gap={12}
            renderItem={([key, info]) => (
              <HoverCard
                style={{
                  display: "flex",
                  gap: 20,
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                  padding: "20px 24px",
                  cursor: "pointer"
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: info.color + "18",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  color: info.color
                }}>
                  {info.label}
                </div>

                <div>
                  <div style={{ fontWeight: 600 }}>{info.full}</div>
                  <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                    {info.desc}
                  </div>
                </div>
              </HoverCard>
            )}
          />
        </div>

      </div>

      <Footer />
    </div>
  )
}