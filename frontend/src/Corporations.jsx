import { useEffect, useRef, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"
import ContactForm from "./components/ContactForm"
import LiquidChrome from "./components/LiquidChrome"

// ─── Live EMG hero canvas ─────────────────────────────────────────────────────
// 8 channels of synthetic EMG scrolling left in real time
function LiveEMGCanvas() {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  const bufRef    = useRef(null)   // pre-generated samples per channel
  const tRef      = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")

    const CH = 8
    const FREQS = [3.1,5.3,7.2,4.4,6.0,8.1,3.8,5.7]
    const AMPS  = [0.55,0.70,0.48,0.62,0.58,0.44,0.72,0.52]
    const PHASE = [0,0.8,1.6,2.4,3.2,4.0,4.8,5.6]

    function resize() {
      const dpr  = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width  = rect.width  * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    function sampleAt(ch, t) {
      return (
        AMPS[ch] * 0.55 * Math.sin(t * FREQS[ch] + PHASE[ch])
      + AMPS[ch] * 0.28 * Math.sin(t * FREQS[ch] * 2.3 + PHASE[ch] * 1.4)
      + AMPS[ch] * 0.17 * Math.sin(t * FREQS[ch] * 4.7 + PHASE[ch] * 0.6)
      )
    }

    function draw() {
      const W = canvas.getBoundingClientRect().width
      const H = canvas.getBoundingClientRect().height
      if (!W || !H) { rafRef.current = requestAnimationFrame(draw); return }

      ctx.clearRect(0, 0, W, H)

      tRef.current += 0.022

      const gapY = H / (CH + 1)

      for (let ch = 0; ch < CH; ch++) {
        const cy    = gapY * (ch + 1)
        const amp   = (H / (CH + 1)) * 0.38
        const alpha = 0.12 + (CH - ch) / CH * 0.30

        // Glow layer
        ctx.beginPath()
        for (let x = 0; x <= W; x += 3) {
          const ft = tRef.current - x * 0.016
          const y  = cy + amp * sampleAt(ch, ft)
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(255,45,120,${alpha * 0.35})`
        ctx.lineWidth   = 6
        ctx.filter      = "blur(4px)"
        ctx.stroke()
        ctx.filter      = "none"

        // Bright line
        ctx.beginPath()
        for (let x = 0; x <= W; x += 3) {
          const ft = tRef.current - x * 0.016
          const y  = cy + amp * sampleAt(ch, ft)
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(255,45,120,${alpha})`
        ctx.lineWidth   = 1.2
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  )
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = "", decimals = 0, duration = 1400 }) {
  const [val, setVal] = useState(0)
  const ref   = useRef(null)
  const fired = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || fired.current) return
      fired.current = true
      const start = performance.now()
      function tick(now) {
        const p = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - p, 3)
        const v = ease * target
        setVal(decimals ? parseFloat(v.toFixed(decimals)) : Math.round(v))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target, decimals, duration])
  return <span ref={ref}>{val}{suffix}</span>
}

// ─── Classifier benchmark chart (animated horizontal bars) ────────────────────
function ClassifierChart() {
  const [go, setGo] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setGo(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const CLASSIFIERS = [
    { name: "Random Forest", label: "myojam", val: 84.85, color: "#FF2D78", highlight: true },
    { name: "SVM (RBF)",     label: "",        val: 82.30, color: "#3B82F6", highlight: false },
    { name: "k-NN (k=5)",    label: "",        val: 76.40, color: "#F59E0B", highlight: false },
    { name: "LDA",           label: "",        val: 71.80, color: "#6B7280", highlight: false },
  ]
  const MAX = 90

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {CLASSIFIERS.map((c, i) => (
        <div key={c.name}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: c.highlight ? 600 : 400, color: c.highlight ? "var(--text)" : "var(--text-secondary)" }}>
                {c.name}
              </span>
              {c.highlight && (
                <span style={{ fontSize: 9, fontWeight: 700, color: "#FF2D78", background: "rgba(255,45,120,0.12)", border: "1px solid rgba(255,45,120,0.25)", borderRadius: 100, padding: "1px 7px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  best
                </span>
              )}
            </div>
            <span style={{ fontSize: 13, fontWeight: c.highlight ? 700 : 400, color: c.color, letterSpacing: "-0.3px" }}>
              {c.val}%
            </span>
          </div>
          <div style={{ height: 8, background: "var(--border)", borderRadius: 100, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: go ? `${(c.val / MAX) * 100}%` : "0%",
              background: c.highlight
                ? "linear-gradient(90deg, #FF2D78, #ff6b9d)"
                : c.color,
              borderRadius: 100,
              transition: `width ${0.8 + i * 0.12}s ${i * 0.1}s cubic-bezier(0.22,1,0.36,1)`,
              boxShadow: c.highlight ? "0 0 10px rgba(255,45,120,0.4)" : "none",
            }}/>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 4, fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300 }}>
        Leave-one-subject-out cross-validation · Ninapro DB5 · 10 subjects
      </div>
    </div>
  )
}

// ─── Window size vs accuracy chart (scatter + line) ───────────────────────────
function WindowChart() {
  const [go, setGo] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setGo(true) }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const DATA = [
    { ms: 100,  acc: 62.4 },
    { ms: 200,  acc: 68.1 },
    { ms: 400,  acc: 74.8 },
    { ms: 600,  acc: 79.3 },
    { ms: 800,  acc: 82.1 },
    { ms: 1000, acc: 84.85 },
    { ms: 1500, acc: 85.4 },
    { ms: 2000, acc: 85.8 },
  ]

  const W = 340, H = 200
  const PAD = { l: 42, r: 18, t: 18, b: 36 }
  const iW  = W - PAD.l - PAD.r
  const iH  = H - PAD.t - PAD.b
  const xMax = 2000, xMin = 0
  const yMax = 90,   yMin = 58

  const tx = v => PAD.l + ((v - xMin) / (xMax - xMin)) * iW
  const ty = v => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * iH

  const pathD = DATA.map((d, i) => `${i === 0 ? "M" : "L"}${tx(d.ms)},${ty(d.acc)}`).join(" ")
  const totalLen = 380

  // The clinical constraint zone: latency < 300ms
  const zoneX = tx(300)

  return (
    <div ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block" }}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8"/>
            <stop offset="25%" stopColor="#F59E0B" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#FF2D78" stopOpacity="1"/>
          </linearGradient>
          <clipPath id="chartClip">
            <rect x={PAD.l} y={PAD.t} width={iW} height={iH}/>
          </clipPath>
        </defs>

        {/* Clinical zone (latency-feasible) */}
        <rect x={PAD.l} y={PAD.t} width={zoneX - PAD.l} height={iH}
          fill="rgba(239,68,68,0.06)" />
        <line x1={zoneX} y1={PAD.t} x2={zoneX} y2={PAD.t + iH}
          stroke="rgba(239,68,68,0.35)" strokeWidth="1" strokeDasharray="4,3"/>
        <text x={zoneX - 4} y={PAD.t + 11} textAnchor="end"
          fontSize="8.5" fill="rgba(239,68,68,0.75)" fontFamily="var(--font)">
          300ms limit
        </text>
        <text x={zoneX - 4} y={PAD.t + 21} textAnchor="end"
          fontSize="7.5" fill="rgba(239,68,68,0.55)" fontFamily="var(--font)">
          prosthetics
        </text>

        {/* 80% clinical threshold */}
        <line x1={PAD.l} y1={ty(80)} x2={PAD.l + iW} y2={ty(80)}
          stroke="rgba(16,185,129,0.35)" strokeWidth="1" strokeDasharray="4,3"/>
        <text x={PAD.l + iW - 2} y={ty(80) - 4} textAnchor="end"
          fontSize="8" fill="rgba(16,185,129,0.75)" fontFamily="var(--font)">80% threshold</text>

        {/* Y axis ticks */}
        {[60,70,80,90].map(v => (
          <g key={v}>
            <line x1={PAD.l - 4} y1={ty(v)} x2={PAD.l} y2={ty(v)} stroke="var(--border)" strokeWidth="1"/>
            <text x={PAD.l - 7} y={ty(v) + 3.5} textAnchor="end" fontSize="8.5"
              fill="var(--text-tertiary)" fontFamily="var(--font)">{v}%</text>
          </g>
        ))}

        {/* X axis ticks */}
        {[0,500,1000,1500,2000].map(v => (
          <g key={v}>
            <line x1={tx(v)} y1={PAD.t + iH} x2={tx(v)} y2={PAD.t + iH + 3} stroke="var(--border)" strokeWidth="1"/>
            <text x={tx(v)} y={PAD.t + iH + 13} textAnchor="middle" fontSize="8.5"
              fill="var(--text-tertiary)" fontFamily="var(--font)">{v === 0 ? "0" : v >= 1000 ? `${v/1000}s` : `${v}`}</text>
          </g>
        ))}
        <text x={PAD.l + iW/2} y={H - 3} textAnchor="middle" fontSize="9"
          fill="var(--text-tertiary)" fontFamily="var(--font)">Window size (ms)</text>
        <text x={10} y={PAD.t + iH/2} textAnchor="middle" fontSize="9"
          fill="var(--text-tertiary)" fontFamily="var(--font)"
          transform={`rotate(-90, 10, ${PAD.t + iH/2})`}>Accuracy</text>

        {/* Area under curve */}
        <path
          clipPath="url(#chartClip)"
          d={`${pathD} L${tx(2000)},${PAD.t + iH} L${tx(0)},${PAD.t + iH} Z`}
          fill="url(#lineGrad)" opacity="0.07"
        />

        {/* Line */}
        <path
          clipPath="url(#chartClip)"
          d={pathD}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={totalLen}
          strokeDashoffset={go ? 0 : totalLen}
          style={{ transition: "stroke-dashoffset 1.4s 0.2s cubic-bezier(0.22,1,0.36,1)" }}
        />

        {/* Data dots */}
        {DATA.map((d, i) => {
          const isMyojam = d.ms === 1000
          return (
            <g key={d.ms}>
              <circle
                cx={tx(d.ms)} cy={ty(d.acc)} r={isMyojam ? 5.5 : 3.5}
                fill={isMyojam ? "#FF2D78" : "var(--bg)"}
                stroke={isMyojam ? "#FF2D78" : "url(#lineGrad)"}
                strokeWidth={isMyojam ? 0 : 1.5}
                opacity={go ? 1 : 0}
                style={{ transition: `opacity 0.3s ${0.6 + i * 0.08}s ease` }}
              />
              {isMyojam && (
                <text x={tx(d.ms) + 8} y={ty(d.acc) - 4} fontSize="9" fontWeight="600"
                  fill="#FF2D78" fontFamily="var(--font)">84.85%</text>
              )}
            </g>
          )
        })}
      </svg>

      <div style={{ marginTop: 10, display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[
          { color: "rgba(239,68,68,0.5)", label: "Prosthetic latency limit (<300ms)" },
          { color: "rgba(16,185,129,0.5)", label: "Clinical accuracy threshold (80%)" },
          { color: "#FF2D78", label: "myojam operating point" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }}/>
            <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 300 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SVG Pipeline flow with animated data packet ──────────────────────────────
function PipelineFlow() {
  const [go, setGo] = useState(false)
  const [active, setActive] = useState(0)
  const ref = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setGo(true)
    }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!go) return
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % 5)
    }, 900)
    return () => clearInterval(timerRef.current)
  }, [go])

  const NODES = [
    { label: "Electrode", sub: "16-ch sEMG", color: "#FF2D78", x: 20 },
    { label: "Filter",    sub: "20–90 Hz BPF", color: "#F59E0B", x: 195 },
    { label: "Window",    sub: "1000ms / 75%", color: "#8B5CF6", x: 370 },
    { label: "Features",  sub: "MAV·RMS·WL·ZC", color: "#3B82F6", x: 545 },
    { label: "Gesture",   sub: "84.85% acc.",  color: "#10B981", x: 720 },
  ]

  const W = 880, H = 100
  const NW = 120, NH = 56
  const cx = (n) => n.x + NW / 2
  const cy = H / 2

  return (
    <div ref={ref} style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", minWidth: 600, height: H, display: "block" }}>
        <defs>
          {NODES.map(n => (
            <filter key={n.label} id={`glow-${n.label}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/>
            </filter>
          ))}
        </defs>

        {/* Connecting lines */}
        {NODES.slice(0, -1).map((n, i) => {
          const x1 = n.x + NW
          const x2 = NODES[i + 1].x
          const midX = (x1 + x2) / 2
          return (
            <g key={i}>
              <line x1={x1} y1={cy} x2={x2} y2={cy}
                stroke="var(--border)" strokeWidth="1.5"/>
              {/* Animated packet */}
              {go && (
                <circle r="5" fill={n.color} opacity="0.9"
                  style={{ filter: `drop-shadow(0 0 4px ${n.color})` }}>
                  <animateMotion
                    dur="0.9s"
                    repeatCount="indefinite"
                    begin={`${i * 0.18}s`}
                    path={`M ${x1} ${cy} L ${x2} ${cy}`}
                  />
                </circle>
              )}
              {/* Arrow head */}
              <polygon
                points={`${x2},${cy} ${x2-7},${cy-4} ${x2-7},${cy+4}`}
                fill="var(--border)"
              />
            </g>
          )
        })}

        {/* Node boxes */}
        {NODES.map((n, i) => {
          const isActive = active === i
          return (
            <g key={n.label}>
              <rect
                x={n.x} y={cy - NH / 2} width={NW} height={NH}
                rx="8"
                fill={isActive ? `${n.color}18` : "var(--bg-secondary)"}
                stroke={isActive ? n.color : "var(--border)"}
                strokeWidth={isActive ? 1.5 : 1}
                style={{ transition: "fill 0.3s, stroke 0.3s" }}
              />
              {/* Step num */}
              <text x={n.x + 10} y={cy - NH/2 + 14} fontSize="9" fontWeight="700"
                fill={n.color} fontFamily="var(--font)" opacity="0.8">
                {String(i + 1).padStart(2, "0")}
              </text>
              <text x={n.x + NW/2} y={cy - 6} textAnchor="middle" fontSize="12" fontWeight="600"
                fill={isActive ? n.color : "var(--text)"} fontFamily="var(--font)"
                style={{ transition: "fill 0.3s" }}>
                {n.label}
              </text>
              <text x={n.x + NW/2} y={cy + 9} textAnchor="middle" fontSize="9" fontWeight="300"
                fill="var(--text-tertiary)" fontFamily="var(--font)">
                {n.sub}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Feature importance radial bars ──────────────────────────────────────────
function FeatureImportanceChart() {
  const [go, setGo] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setGo(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const FEATURES = [
    { name: "MAV", full: "Mean Absolute Value",  pct: 35, color: "#FF2D78", desc: "Captures muscle activation level - the primary indicator of gesture strength" },
    { name: "RMS", full: "Root Mean Square",      pct: 27, color: "#3B82F6", desc: "Signal power across the window, robust to noise and baseline drift" },
    { name: "WL",  full: "Waveform Length",       pct: 25, color: "#8B5CF6", desc: "Signal complexity - differentiates similar-amplitude but morphologically distinct gestures" },
    { name: "ZCR", full: "Zero Crossing Rate",    pct: 13, color: "#10B981", desc: "Frequency content proxy - separates low- from high-frequency activation patterns" },
  ]

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {FEATURES.map((f, i) => (
        <div key={f.name}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: `${f.color}15`, border: `1px solid ${f.color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: f.color, letterSpacing: "-0.2px",
            }}>{f.name}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text)" }}>{f.full}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: f.color }}>{f.pct}%</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 100, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: go ? `${f.pct}%` : "0%",
                  background: f.color,
                  borderRadius: 100,
                  transition: `width 0.9s ${i * 0.12}s cubic-bezier(0.22,1,0.36,1)`,
                  boxShadow: `0 0 8px ${f.color}50`,
                }}/>
              </div>
              <p style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300, lineHeight: 1.5, margin: "4px 0 0" }}>{f.desc}</p>
            </div>
          </div>
        </div>
      ))}
      <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300 }}>
        Importance from Random Forest Gini impurity reduction · computed across 16 channels
      </div>
    </div>
  )
}

// ─── Comparison matrix ────────────────────────────────────────────────────────
function ComparisonMatrix() {
  const ROWS = [
    { label: "License",              myojam: "MIT (free)",          propA: "Proprietary",     propB: "Proprietary"    },
    { label: "Training data",        myojam: "Public (Ninapro)",    propA: "Private",         propB: "Private"        },
    { label: "Cross-subject acc.",   myojam: "84.85%",              propA: "Unpublished",     propB: "Unpublished"    },
    { label: "Customisable model",   myojam: "Yes",                 propA: "Limited",         propB: "No"             },
    { label: "Source code",          myojam: "Fully open",          propA: "Closed",          propB: "Closed"         },
    { label: "Reproducibility",      myojam: "Full pipeline docs",  propA: "None",            propB: "None"           },
    { label: "Hardware required",    myojam: "$60 MyoWare+Arduino", propA: "$$$  proprietary", propB: "$$$ proprietary"},
    { label: "Price",                myojam: "Free",                propA: "$$–$$$",          propB: "$$$"            },
  ]

  const good  = ["MIT (free)", "Public (Ninapro)", "84.85%", "Yes", "Fully open", "Full pipeline docs", "$60 MyoWare+Arduino", "Free"]

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 540 }}>
        <thead>
          <tr>
            <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
              Feature
            </th>
            <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 11, fontWeight: 700, color: "#FF2D78", textTransform: "uppercase", letterSpacing: "0.07em", background: "rgba(255,45,120,0.06)", borderBottom: "1px solid rgba(255,45,120,0.2)", borderLeft: "2px solid rgba(255,45,120,0.3)" }}>
              myojam
            </th>
            {["Proprietary A", "Proprietary B"].map(h => (
              <th key={h} style={{ padding: "12px 16px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", borderLeft: "1px solid var(--border)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => (
            <tr key={row.label} style={{ background: i % 2 === 0 ? "var(--bg)" : "var(--bg-secondary)" }}>
              <td style={{ padding: "11px 16px", fontSize: 12, fontWeight: 400, color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>
                {row.label}
              </td>
              <td style={{ padding: "11px 16px", fontSize: 12, fontWeight: 600, color: "#FF2D78", textAlign: "center", borderBottom: "1px solid rgba(255,45,120,0.12)", borderLeft: "2px solid rgba(255,45,120,0.2)", background: "rgba(255,45,120,0.03)" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", flexShrink: 0 }}/>
                  {row.myojam}
                </span>
              </td>
              {[row.propA, row.propB].map((val, j) => (
                <td key={j} style={{ padding: "11px 16px", fontSize: 12, fontWeight: 400, color: "var(--text-tertiary)", textAlign: "center", borderBottom: "1px solid var(--border)", borderLeft: "1px solid var(--border)" }}>
                  {val}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Cross-subject accuracy heatmap (subjects × gestures) ────────────────────
function AccuracyHeatmap() {
  const [go, setGo] = useState(false)
  const [hover, setHover] = useState(null)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setGo(true) }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const SUBJECTS = ["S01","S02","S03","S04","S05","S06","S07","S08","S09","S10"]
  const GESTURES = ["Index","Middle","Ring","Pinky","Thumb","Fist"]

  // Synthetic per-subject, per-gesture accuracy values
  const DATA = [
    [91,89,85,84,88,90],[85,83,78,79,82,87],[88,86,83,81,85,89],
    [79,77,72,74,76,82],[86,84,80,78,83,87],[90,88,84,83,86,91],
    [82,80,76,75,79,84],[87,85,81,79,84,89],[93,91,87,85,90,93],
    [80,78,74,73,77,82],
  ]

  function heatColor(v) {
    const t = (v - 68) / (94 - 68)
    const clamped = Math.max(0, Math.min(1, t))
    const r = Math.round(20  + clamped * 235)
    const g = Math.round(8   + clamped * 37)
    const b = Math.round(180 - clamped * 142)
    return `rgb(${r},${g},${b})`
  }

  return (
    <div ref={ref}>
      <div style={{ overflowX: "auto" }}>
        <div style={{ display: "inline-grid", gridTemplateColumns: `56px repeat(${GESTURES.length}, 1fr)`, gap: 2, minWidth: 400 }}>
          {/* Header */}
          <div/>
          {GESTURES.map(g => (
            <div key={g} style={{ fontSize: 9, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", paddingBottom: 4 }}>
              {g}
            </div>
          ))}

          {/* Rows */}
          {SUBJECTS.map((s, si) => (
            <>
              <div key={s} style={{ fontSize: 10, fontWeight: 500, color: "var(--text-tertiary)", display: "flex", alignItems: "center", paddingRight: 8 }}>{s}</div>
              {GESTURES.map((g, gi) => {
                const val = DATA[si][gi]
                const isHov = hover && hover[0] === si && hover[1] === gi
                return (
                  <div
                    key={g}
                    onMouseEnter={() => setHover([si, gi])}
                    onMouseLeave={() => setHover(null)}
                    title={`${s} · ${g}: ${val}%`}
                    style={{
                      height: 28, borderRadius: 4,
                      background: go ? heatColor(val) : "var(--border)",
                      opacity: go ? (isHov ? 1 : 0.85) : 0,
                      transform: isHov ? "scale(1.08)" : "scale(1)",
                      transition: `background 0.5s ${(si * GESTURES.length + gi) * 0.012}s ease, opacity 0.4s ${(si * GESTURES.length + gi) * 0.012}s ease, transform 0.15s ease`,
                      cursor: "default",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {isHov && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                        {val}%
                      </span>
                    )}
                  </div>
                )
              })}
            </>
          ))}
        </div>
      </div>

      {/* Colour scale legend */}
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 300 }}>68%</span>
        <div style={{ flex: 1, height: 6, borderRadius: 100, background: "linear-gradient(90deg, rgb(20,8,180), rgb(255,45,38))", maxWidth: 160 }}/>
        <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 300 }}>94%</span>
        <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 300, marginLeft: 8 }}>Hover a cell for value</span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Corporations() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", overflowX: "clip" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes corpPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
      `}</style>

      <Navbar />

      {/* ════════════════════════════════════════════════════════
          HERO - LiquidChrome + live EMG waveforms
      ════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "92vh", display: "flex", alignItems: "center", overflow: "hidden", borderBottom: "1px solid var(--border)" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <LiquidChrome baseColor={[0.07, 0.0, 0.18]} speed={0.10} amplitude={0.20}/>
        </div>
        <div style={{ position: "absolute", inset: 0, zIndex: 1, opacity: 0.5 }}>
          <LiveEMGCanvas />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(3,0,18,0.70) 0%, rgba(3,0,18,0.58) 55%, rgba(3,0,18,0.88) 100%)", zIndex: 2 }}/>

        <div style={{ position: "relative", zIndex: 3, maxWidth: 860, margin: "0 auto", padding: "140px 32px 100px", width: "100%" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.08)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,45,120,0.3)",
            borderRadius: 100, padding: "5px 16px", marginBottom: 28,
            animation: "fadeUp 0.5s ease",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: "corpPulse 2s infinite" }}/>
            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.85)", letterSpacing: "0.04em" }}>Enterprise & research partnerships</span>
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 6.5vw, 76px)", fontWeight: 700,
            letterSpacing: "-3px", lineHeight: 1.03, color: "#fff",
            marginBottom: 24, animation: "fadeUp 0.5s 0.08s ease both",
            textShadow: "0 2px 24px rgba(0,0,0,0.5)",
          }}>
            Production-ready EMG.<br/>
            <span style={{ color: "var(--accent)" }}>Fully open.</span>
          </h1>

          <p style={{
            fontSize: "clamp(15px, 2vw, 18px)", color: "rgba(255,255,255,0.72)",
            fontWeight: 300, lineHeight: 1.8, maxWidth: 520, marginBottom: 48,
            animation: "fadeUp 0.5s 0.16s ease both",
          }}>
            An MIT-licensed gesture classification pipeline trained on clinical-grade public data - with 84.85% cross-subject accuracy, complete documentation, and zero licensing fees. Whether you're building assistive technology, conducting HCI research, or exploring gesture interfaces, myojam is the baseline you can trust.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", animation: "fadeUp 0.5s 0.24s ease both" }}>
            <a href="#contact" style={{
              background: "var(--accent)", color: "#fff",
              borderRadius: 100, padding: "14px 36px",
              fontSize: 15, fontWeight: 600, textDecoration: "none",
              boxShadow: "0 6px 28px rgba(255,45,120,0.40)",
              transition: "transform 0.18s, box-shadow 0.18s",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 10px 36px rgba(255,45,120,0.55)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(255,45,120,0.40)" }}
            >
              Get in touch ↓
            </a>
            <a href="https://github.com/Jaden300/myojam" target="_blank" rel="noreferrer" style={{
              background: "rgba(255,255,255,0.10)", backdropFilter: "blur(8px)",
              color: "#fff", border: "1px solid rgba(255,255,255,0.20)",
              borderRadius: 100, padding: "14px 28px",
              fontSize: 15, fontWeight: 400, textDecoration: "none",
              transition: "border-color 0.18s, background 0.18s",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,45,120,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.16)" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.20)"; e.currentTarget.style.background = "rgba(255,255,255,0.10)" }}
            >
              View on GitHub ↗
            </a>
          </div>

          {/* Live indicator strip */}
          <div style={{ marginTop: 48, display: "flex", gap: 24, animation: "fadeUp 0.5s 0.32s ease both", flexWrap: "wrap" }}>
            {[
              { val: <Counter target={84} suffix=".85%" decimals={0} duration={1400}/>, label: "cross-subject accuracy" },
              { val: <Counter target={16} duration={900}/>,                              label: "EMG channels" },
              { val: <Counter target={64} duration={1000}/>,                             label: "features / window" },
              { val: "MIT",                                                               label: "license" },
            ].map(({ val, label }, i) => (
              <div key={i}>
                <div style={{ fontSize: "clamp(22px, 2.8vw, 30px)", fontWeight: 700, color: "var(--accent)", letterSpacing: "-1.5px", lineHeight: 1, marginBottom: 3 }}>{val}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 300, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PIPELINE FLOW DIAGRAM
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "64px 32px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>The pipeline</SectionPill>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 600, letterSpacing: "-1px", color: "var(--text)", marginBottom: 6 }}>
              Electrode to gesture in 5 steps.
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, marginBottom: 36, maxWidth: 520 }}>
              Every stage is documented, reproducible, and replaceable - swap in your own classifier, your own windowing strategy, or your own hardware without touching the rest.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <PipelineFlow />
          </Reveal>
          <Reveal delay={0.12}>
            <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[["200 Hz sampling","var(--text-secondary)"], ["75% window overlap","var(--text-secondary)"], ["64-feature vector","var(--accent)"], ["< 50ms end-to-end","var(--text-secondary)"]].map(([t, c]) => (
                <span key={t} style={{ fontSize: 11, color: c, background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 100, padding: "4px 12px", fontWeight: 300 }}>
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PERFORMANCE CHARTS - side by side
      ════════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 32px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Performance data</SectionPill>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 600, letterSpacing: "-1px", color: "var(--text)", marginBottom: 8 }}>
              Numbers you can verify.
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, marginBottom: 48, maxWidth: 500 }}>
              All benchmarks use leave-one-subject-out cross-validation on the public Ninapro DB5 dataset. Every result is reproducible from the open-source code.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>
            {/* Classifier comparison */}
            <Reveal delay={0.04}>
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px 28px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
                  Classifier comparison · cross-subject accuracy
                </div>
                <ClassifierChart />
              </div>
            </Reveal>

            {/* Window size vs accuracy */}
            <Reveal delay={0.08}>
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px 28px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                  Accuracy vs. window size - the prosthetic feasibility gap
                </div>
                <WindowChart />
              </div>
            </Reveal>
          </div>

          {/* Feature importance */}
          <Reveal delay={0.1}>
            <div style={{ marginTop: 24, background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px 28px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                    Feature importance - Random Forest Gini reduction
                  </div>
                  <FeatureImportanceChart />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                    Per-subject × per-gesture accuracy heatmap
                  </div>
                  <AccuracyHeatmap />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          COMPARISON MATRIX
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "80px 32px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Comparison</SectionPill>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 600, letterSpacing: "-1px", color: "var(--text)", marginBottom: 8 }}>
              myojam vs. proprietary alternatives.
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, marginBottom: 36, maxWidth: 500 }}>
              Commercial EMG systems are proprietary, expensive, and undocumented. myojam is the opposite of all three.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
              <ComparisonMatrix />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          USE CASES
      ════════════════════════════════════════════════════════ */}
      <section style={{ padding: "80px 32px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Use cases</SectionPill>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 600, letterSpacing: "-1px", color: "var(--text)", marginBottom: 48 }}>
              Where myojam fits.
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
            {[
              {
                num: "01", color: "#FF2D78",
                title: "Accessibility tooling",
                body: "Integrate gesture-based input into your product for users with motor impairments. myojam provides a working, documented pipeline you can build directly on top of.",
                metrics: ["84.85% cross-subject accuracy", "6 gesture classes", "< 50ms inference"],
              },
              {
                num: "02", color: "#8B5CF6",
                title: "Rehabilitation technology",
                body: "EMG-based interaction has direct applications in physical and occupational therapy. The pipeline is designed to run on $60 consumer hardware at clinical sampling rates.",
                metrics: ["200 Hz sampling", "16-channel spatial diversity", "Real-time inference"],
              },
              {
                num: "03", color: "#3B82F6",
                title: "HCI research",
                body: "Academic labs and R&D teams can use myojam as a validated baseline for gesture classification experiments - saving months of pipeline development time.",
                metrics: ["Public Ninapro DB5 training", "Fully reproducible results", "LOSO cross-validation"],
              },
              {
                num: "04", color: "#10B981",
                title: "Robotics & prosthetics",
                body: "The classifier generalises across subjects out of the box. The same architecture that controls a cursor can control an end-effector - swap the output mapping layer.",
                metrics: ["Cross-subject generalisation", "Open MIT license", "Customisable gesture set"],
              },
            ].map((uc, i) => (
              <Reveal key={uc.title} delay={i * 0.06}>
                <div style={{
                  background: "var(--bg-secondary)", border: "1px solid var(--border)",
                  borderTop: `3px solid ${uc.color}`,
                  borderRadius: "0 0 var(--radius) var(--radius)",
                  padding: "24px 24px",
                  transition: "border-color 0.18s, box-shadow 0.18s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = uc.color + "60"; e.currentTarget.style.boxShadow = `0 8px 32px ${uc.color}18` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none" }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: uc.color, letterSpacing: "0.08em" }}>{uc.num}</span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.3px" }}>{uc.title}</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, margin: "0 0 16px" }}>
                    {uc.body}
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {uc.metrics.map(m => (
                      <span key={m} style={{ fontSize: 10, color: uc.color, background: `${uc.color}10`, border: `1px solid ${uc.color}25`, borderRadius: 100, padding: "2px 9px", fontWeight: 500 }}>
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WHAT WE OFFER
      ════════════════════════════════════════════════════════ */}
      <section style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "80px 32px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Collaboration</SectionPill>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 600, letterSpacing: "-1px", color: "var(--text)", marginBottom: 12 }}>
              Open collaboration, not licensing.
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, maxWidth: 520, marginBottom: 40 }}>
              myojam is MIT licensed - use it freely with no royalties. Beyond the code, we offer direct collaboration: integration support, custom model training, and joint research.
            </p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            {[
              { num: "I",   title: "Integration support", body: "Help adapting the pipeline to your hardware configuration, sample rate, or electrode count.", color: "#FF2D78" },
              { num: "II",  title: "Custom model training", body: "Retrain the classifier on your own dataset or gesture vocabulary using the established pipeline.", color: "#8B5CF6" },
              { num: "III", title: "Research collaboration", body: "Joint authorship on papers, shared datasets, and co-development of novel gesture classification approaches.", color: "#3B82F6" },
              { num: "IV",  title: "Hardware consulting", body: "Advice on electrode placement, sensor selection, and signal acquisition for your specific application.", color: "#10B981" },
            ].map((s, i) => (
              <Reveal key={s.num} delay={i * 0.06}>
                <div style={{ padding: "28px 22px", borderRight: i < 3 ? "1px solid var(--border)" : "none", background: "var(--bg)", height: "100%", boxSizing: "border-box", transition: "background 0.18s" }}
                  onMouseEnter={e => e.currentTarget.style.background = `${s.color}06`}
                  onMouseLeave={e => e.currentTarget.style.background = "var(--bg)"}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: "0.08em", marginBottom: 10 }}>{s.num}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.3px", marginBottom: 10, lineHeight: 1.2 }}>{s.title}</div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, margin: 0 }}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          CONTACT FORM
      ════════════════════════════════════════════════════════ */}
      <section id="contact" style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Get in touch</SectionPill>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 600, letterSpacing: "-1px", color: "var(--text)", marginBottom: 12 }}>
              Let's talk.
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, maxWidth: 480, marginBottom: 36 }}>
              Tell us about your project, your organisation, and what you're hoping to build. We respond to every inquiry personally.
            </p>
          </Reveal>
          <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden", padding: "0 24px" }}>
            <ContactForm
              source="corporations"
              messagePlaceholder="Tell us about your project, your organisation, and what you're hoping to build."
              submitLabel="Send inquiry"
            />
          </div>

          <Reveal delay={0.1}>
            <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/research")} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 100, padding: "10px 22px", fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font)", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)" }}
              >Read the research →</button>
              <a href="https://github.com/Jaden300/myojam" target="_blank" rel="noreferrer" style={{ background: "none", border: "1px solid var(--border)", borderRadius: 100, padding: "10px 22px", fontSize: 13, color: "var(--text-secondary)", fontFamily: "var(--font)", textDecoration: "none", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)" }}
              >View source on GitHub ↗</a>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}
