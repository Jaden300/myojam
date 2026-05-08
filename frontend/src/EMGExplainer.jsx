import { useEffect, useRef, useState, useCallback } from "react"
import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "./Footer"
import UpNext from "./UpNext"
import ArticleBar from "./ArticleUtils"
import { IconRobot, IconAccessibility, IconChat, IconMuscle } from "./Icons"

// ─────────────────────────────────────────────────────────────
// Live oscilloscope canvas — hero centrepiece
// ─────────────────────────────────────────────────────────────
function Oscilloscope() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    let raf, t = 0, phase = "rest", phaseT = 0

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas.width  = canvas.offsetWidth  * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }
    window.addEventListener("resize", resize)
    resize()

    const GESTURES = [
      { name: "Index flex",  freqs: [24, 40, 66], amp: 0.44 },
      { name: "Fist",        freqs: [33, 56, 87], amp: 0.70 },
      { name: "Thumb flex",  freqs: [28, 48, 70], amp: 0.52 },
    ]
    let gestureIdx = 0, gesture = GESTURES[0]

    function draw() {
      raf = requestAnimationFrame(draw)
      t += 0.016
      phaseT += 0.016

      const W = canvas.offsetWidth, H = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)

      // Background
      ctx.fillStyle = "#07071a"
      ctx.fillRect(0, 0, W, H)

      // Grid lines
      ctx.strokeStyle = "rgba(255,255,255,0.04)"
      ctx.lineWidth = 0.5
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
      for (let y = 0; y < H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

      // Zero line
      ctx.strokeStyle = "rgba(255,45,120,0.15)"
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke()

      // Phase cycling: 1.2s rest → 2.4s contraction → 1.2s rest → switch gesture
      const cycleDur = 4.8
      const cycleT = phaseT % cycleDur
      let amp = 0, label = ""
      if (cycleT < 1.2) {
        amp = 0.04; label = "rest"
      } else if (cycleT < 3.6) {
        const ramp = Math.min(1, (cycleT - 1.2) / 0.3) * Math.max(0, 1 - Math.max(0, cycleT - 3.3) / 0.3)
        amp = gesture.amp * ramp; label = gesture.name
      } else {
        amp = 0.04; label = "rest"
        if (cycleT > 4.5 && cycleT < 4.8) {
          gestureIdx = (gestureIdx + 1) % GESTURES.length
          gesture = GESTURES[gestureIdx]
        }
      }

      // EMG waveform (multiple sinusoids + noise)
      const N = 300
      ctx.beginPath()
      let prevVisible = false
      for (let i = 0; i < N; i++) {
        const x = (i / (N - 1)) * W
        const timeAtX = t - (1 - i / (N - 1)) * 2.0
        // Phase amp at historical time
        const hCycleT = ((timeAtX % cycleDur) + cycleDur) % cycleDur
        let hAmp = 0.04
        if (hCycleT >= 1.2 && hCycleT < 3.6) {
          hAmp = gesture.amp * Math.min(1, (hCycleT - 1.2) / 0.3) * Math.max(0, 1 - Math.max(0, hCycleT - 3.3) / 0.3)
        }

        let v = 0
        for (const f of gesture.freqs) v += Math.sin(timeAtX * f * 0.3 + f * 0.1) * (1 / gesture.freqs.length)
        const noise = (Math.sin(timeAtX * 173.1) + Math.sin(timeAtX * 97.3) * 0.5) * 0.08
        v = (v + noise) * hAmp
        const y = H / 2 - v * H * 0.42

        if (!prevVisible) { ctx.moveTo(x, y); prevVisible = true }
        else ctx.lineTo(x, y)
      }

      const grad = ctx.createLinearGradient(0, 0, W, 0)
      grad.addColorStop(0,   "rgba(255,45,120,0.0)")
      grad.addColorStop(0.1, "rgba(255,45,120,0.7)")
      grad.addColorStop(0.9, "rgba(255,45,120,1.0)")
      grad.addColorStop(1,   "rgba(255,45,120,1.0)")
      ctx.strokeStyle = grad
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Live dot
      ctx.beginPath()
      ctx.arc(W - 2, H / 2 - ((t => {
        let v = 0
        for (const f of gesture.freqs) v += Math.sin(t * f * 0.3 + f * 0.1) / gesture.freqs.length
        return (v * 0.08 * 0.04 + (Math.sin(t * 173.1) + Math.sin(t * 97.3) * 0.5) * 0.08 * 0.04) * H * 0.42
      })(t)), 3.5, 0, Math.PI * 2)
      ctx.fillStyle = "#FF2D78"
      ctx.fill()

      // Labels
      ctx.font = "10px monospace"
      ctx.fillStyle = label === "rest" ? "rgba(255,255,255,0.3)" : "#FF2D78"
      ctx.fillText(label === "rest" ? "REST" : `▶ ${label.toUpperCase()}`, 10, H - 10)

      ctx.fillStyle = "rgba(255,255,255,0.25)"
      ctx.fillText("200 Hz · 1 ch", W - 72, H - 10)

      // Amplitude scale
      ctx.fillStyle = "rgba(255,255,255,0.2)"
      ctx.fillText("+1mV", 10, 14)
      ctx.fillText("−1mV", 10, H - 2)
    }

    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) }
  }, [])

  return <canvas ref={ref} style={{ width: "100%", height: 160, display: "block" }} />
}

// ─────────────────────────────────────────────────────────────
// Filter comparison canvas — section 04 visual
// ─────────────────────────────────────────────────────────────
function FilterDemo() {
  const rawRef = useRef(null), filtRef = useRef(null)

  useEffect(() => {
    const noise = (t, f) => Math.sin(t * f)

    function render(canvas, mode) {
      if (!canvas) return
      const dpr = window.devicePixelRatio || 1
      const W = canvas.offsetWidth, H = canvas.offsetHeight
      canvas.width = W * dpr; canvas.height = H * dpr
      const ctx = canvas.getContext("2d")
      ctx.scale(dpr, dpr)
      ctx.fillStyle = "#07071a"
      ctx.fillRect(0, 0, W, H)

      const N = 300
      ctx.beginPath()
      for (let i = 0; i < N; i++) {
        const x = (i / (N - 1)) * W
        const t = i / 40
        let v = Math.sin(t * 35) * 0.35 + Math.sin(t * 55) * 0.25  // gesture band
        if (mode === "raw") {
          v += Math.sin(t * 3.5) * 0.30   // motion artefact < 20 Hz
          v += noise(t, 180) * 0.18        // noise > 90 Hz
          v += noise(t, 310) * 0.10
        }
        const y = H / 2 - v * H * 0.42
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.strokeStyle = mode === "raw" ? "rgba(255,45,120,0.5)" : "#22D3EE"
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.font = "9px monospace"
      ctx.fillStyle = mode === "raw" ? "rgba(255,100,140,0.8)" : "#22D3EE"
      ctx.fillText(mode === "raw" ? "Raw signal" : "20–90 Hz filtered", 8, H - 8)
    }

    const obs = new ResizeObserver(() => { render(rawRef.current, "raw"); render(filtRef.current, "filtered") })
    if (rawRef.current)  obs.observe(rawRef.current)
    if (filtRef.current) obs.observe(filtRef.current)
    render(rawRef.current, "raw"); render(filtRef.current, "filtered")
    return () => obs.disconnect()
  }, [])

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <div>
        <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginBottom: 4, textAlign: "center", fontFamily: "monospace" }}>Before filter</div>
        <canvas ref={rawRef} style={{ width: "100%", height: 110, display: "block", borderRadius: 6 }} />
      </div>
      <div>
        <div style={{ fontSize: 10, color: "#22D3EE", marginBottom: 4, textAlign: "center", fontFamily: "monospace" }}>After bandpass</div>
        <canvas ref={filtRef} style={{ width: "100%", height: 110, display: "block", borderRadius: 6 }} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// SVG visuals per section
// ─────────────────────────────────────────────────────────────
function SignalChainDiagram() {
  const nodes = [
    { id: "brain",  label: "Brain",      sub: "motor cortex",    icon: null, x: 40 },
    { id: "nerve",  label: "Motor nerve", sub: "action potential", icon: null, x: 180 },
    { id: "muscle", label: "Muscle",      sub: "fibres fire",     icon: null, x: 320 },
    { id: "elec",   label: "Electrode",   sub: "skin surface",    icon: "◉",  x: 460 },
    { id: "signal", label: "EMG signal",  sub: "voltage output",  icon: "~",  x: 600 },
  ]
  const W = 680, H = 100
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "visible" }}>
      {nodes.map((n, i) => (
        <g key={n.id}>
          {i > 0 && (
            <line x1={nodes[i-1].x + 34} y1={50} x2={n.x - 34} y2={50}
              stroke="rgba(255,45,120,0.3)" strokeWidth={1.5} strokeDasharray="4,3">
              <animate attributeName="stroke-dashoffset" values="14;0" dur="1s" repeatCount="indefinite"/>
            </line>
          )}
          <circle cx={n.x} cy={50} r={28} fill="rgba(255,45,120,0.08)" stroke="rgba(255,45,120,0.25)" strokeWidth={1}/>
          {n.icon ? (
            <text x={n.x} y={47} textAnchor="middle" fontSize={17}>{n.icon}</text>
          ) : n.id === "brain" ? (
            <svg x={n.x-9} y={32} width={18} height={18} viewBox="0 0 16 16">
              <path d="M8 3C5.8 3 4 4.8 4 7c0 1.1.45 2.1 1.17 2.83L5 13h6l-.17-3.17A4 4 0 0 0 8 3Z" stroke="rgba(255,45,120,0.9)" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
              <path d="M6 7h4M7 9.5h2" stroke="rgba(255,45,120,0.9)" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          ) : n.id === "nerve" ? (
            <svg x={n.x-9} y={32} width={18} height={18} viewBox="0 0 16 16">
              <path d="M9.5 2L5 9h4.5L6.5 14l6.5-8H8.5L9.5 2Z" stroke="rgba(255,45,120,0.9)" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
            </svg>
          ) : (
            <svg x={n.x-9} y={32} width={18} height={18} viewBox="0 0 16 16">
              <path d="M2 8c1-3 2-4 3-4s2 2 3 4 2 4 3 4 2-1 3-4" stroke="rgba(255,45,120,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          )}
          <text x={n.x} y={86} textAnchor="middle" fontSize={9} fill="var(--text-secondary)" fontFamily="monospace">{n.label}</text>
          <text x={n.x} y={97} textAnchor="middle" fontSize={8} fill="var(--text-tertiary)">{n.sub}</text>
        </g>
      ))}
    </svg>
  )
}

function HardwareChain() {
  const items = [
    { label: "Forearm",    sub: "muscle activity",    Icon: IconMuscle, color: "#FF2D78" },
    { label: "MyoWare 2.0",sub: "amplify + rectify",  icon: "⬡",        color: "#8B5CF6" },
    { label: "Arduino Uno",sub: "ADC → USB serial",   icon: "◻",        color: "#3B82F6" },
    { label: "Python app", sub: "classify → act",     icon: "⚙",        color: "#10B981" },
  ]
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {items.map((it, i) => (
        <div key={it.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
          <div style={{ flex: 1, textAlign: "center", padding: "0 4px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${it.color}12`, border: `1px solid ${it.color}35`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px" }}>{it.Icon ? <it.Icon size={20} color={it.color}/> : <span style={{fontSize:18}}>{it.icon}</span>}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", lineHeight: 1.2 }}>{it.label}</div>
            <div style={{ fontSize: 9, color: "var(--text-tertiary)", marginTop: 2, fontFamily: "monospace" }}>{it.sub}</div>
          </div>
          {i < items.length - 1 && (
            <div style={{ fontSize: 16, color: "rgba(255,45,120,0.35)", flexShrink: 0 }}>→</div>
          )}
        </div>
      ))}
    </div>
  )
}

function WindowingDiagram() {
  const W = 420, H = 90, PAD = 20
  const CW = W - PAD * 2
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      {/* Signal line */}
      <path d={`M ${PAD} ${H/2} ${Array.from({length:80},(_,i)=>{
        const x = PAD + (i/79)*CW
        const v = Math.sin(i*0.22)*18 + Math.sin(i*0.55)*10 + Math.sin(i*0.91)*5
        return `L${x} ${H/2-v}`
      }).join(" ")}`} fill="none" stroke="rgba(255,45,120,0.4)" strokeWidth={1.2}/>

      {/* Windows */}
      {[0, 40, 80, 120].map((off, wi) => {
        const x = PAD + (off/200)*CW
        const ww = (50/200)*CW
        const colors = ["#FF2D78","#8B5CF6","#3B82F6","#10B981"]
        return (
          <g key={wi}>
            <rect x={x} y={10} width={ww} height={H-28} rx={3} fill={colors[wi]} fillOpacity={0.10} stroke={colors[wi]} strokeWidth={1} strokeOpacity={0.5}/>
            <text x={x+ww/2} y={H-8} textAnchor="middle" fontSize={8} fill={colors[wi]} fontFamily="monospace">W{wi+1}</text>
          </g>
        )
      })}
      <text x={W/2} y={H-1} textAnchor="middle" fontSize={7.5} fill="var(--text-tertiary)">
        200-sample windows · 50-sample step (75% overlap)
      </text>
    </svg>
  )
}

function FeaturePipelineDiagram() {
  const steps = [
    { label: "200-sample\nwindow", color: "#FF2D78", w: 76 },
    { label: "4 features\n×16 channels", color: "#8B5CF6", w: 88 },
    { label: "64-dim\nvector", color: "#3B82F6", w: 72 },
    { label: "RF\n500 trees", color: "#10B981", w: 72 },
    { label: "Gesture\nclass", color: "#F59E0B", w: 68 },
  ]
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: s.w, padding: "10px 6px", background: `${s.color}12`, border: `1px solid ${s.color}40`, borderRadius: 8, textAlign: "center" }}>
            {s.label.split("\n").map((line, li) => (
              <div key={li} style={{ fontSize: li === 0 ? 11 : 9.5, fontWeight: li === 0 ? 600 : 400, color: li === 0 ? s.color : "var(--text-tertiary)", fontFamily: "monospace", lineHeight: 1.3 }}>{line}</div>
            ))}
          </div>
          {i < steps.length - 1 && <div style={{ fontSize: 12, color: "rgba(255,45,120,0.4)" }}>→</div>}
        </div>
      ))}
    </div>
  )
}

function AssistiveTechCases() {
  const cases = [
    { title: "Prosthetic limb",    body: "Amputees control robotic prosthetics by contracting residual forearm muscles — the same electrodes, the same signal.", Icon: IconRobot,         color: "#FF2D78" },
    { title: "Spinal cord injury", body: "Patients with limited hand mobility can control mice, keyboards, or wheelchairs via EMG without finger contact.", Icon: IconAccessibility,  color: "#8B5CF6" },
    { title: "ALS / MND",          body: "As motor neuron disease progresses, surface EMG may preserve communication long after speech and fine movement fail.", Icon: IconChat,           color: "#3B82F6" },
  ]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {cases.map(c => (
        <div key={c.title} style={{ display: "flex", gap: 12, padding: "12px 14px", background: `${c.color}08`, border: `1px solid ${c.color}20`, borderRadius: 8, borderLeft: `3px solid ${c.color}` }}>
          <div style={{ flexShrink: 0 }}><c.Icon size={20} color={c.color}/></div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: c.color, marginBottom: 3 }}>{c.title}</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.55 }}>{c.body}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function FutureRoadmap() {
  const items = [
    { phase: "Today",    label: "Pattern recognition",    sub: "Discrete gesture classes, threshold-based", color: "#10B981", done: true },
    { phase: "Near",     label: "Per-user adaptation",    sub: "Few-shot calibration (10–20 samples/class)", color: "#3B82F6", done: false },
    { phase: "Mid",      label: "Continuous control",     sub: "Proportional force estimation, not just classes", color: "#8B5CF6", done: false },
    { phase: "Future",   label: "Neural decomposition",   sub: "Individual motor unit identification via HD-sEMG", color: "#F59E0B", done: false },
  ]
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((it, i) => (
        <div key={it.label} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 46, flexShrink: 0, textAlign: "right" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: it.done ? it.color : "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{it.phase}</div>
          </div>
          <div style={{ width: 12, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: it.done ? it.color : "var(--border)", border: `2px solid ${it.done ? it.color : "var(--border)"}`, marginTop: 1 }}/>
            {i < items.length - 1 && <div style={{ width: 1, height: 22, background: "var(--border)", marginTop: 2 }}/>}
          </div>
          <div style={{ paddingBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: it.done ? "var(--text)" : "var(--text-secondary)" }}>{it.label}</div>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>{it.sub}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Section data
// ─────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: "s01", num: "01", tag: "The biology", color: "#FF2D78",
    title: "What is EMG?",
    body: `Electromyography (EMG) is the measurement of the electrical activity produced by skeletal muscles. When your brain decides to move a finger, it dispatches a motor command down through the spinal cord and along a motor neuron to the target muscle. At the neuromuscular junction, the electrical impulse triggers the muscle fibres to contract — and that contraction generates a tiny but measurable voltage change in the surrounding tissue.

Surface EMG (sEMG) captures this signal using adhesive electrodes placed directly on the skin, above the muscle of interest. No needles, no surgical implants — just electrodes picking up the electrical chatter of your muscles through your skin. The result is a waveform that encodes when muscles activate, how strongly, and in what pattern.`,
    callout: "Each electrode records the superposition of action potentials from many individual motor units — a complex signal that grows richer as more fibres are recruited.",
    cta: null,
    Visual: SignalChainDiagram,
    visualCaption: "Signal chain: from brain command to electrode voltage",
  },
  {
    id: "s02", num: "02", tag: "The signal", color: "#f472b6",
    title: "What does an EMG signal look like?",
    body: `At rest, the EMG signal is mostly noise — a faint, random flutter around zero millivolts, with no coherent structure. When you flex a muscle, a burst of activity erupts: rapid oscillations between roughly −1 mV and +1 mV, persisting for as long as the contraction lasts. The harder the contraction, the more motor units fire simultaneously, and the larger and more complex the burst becomes.

The signal is also contaminated by interference from several sources: powerline hum at 50 or 60 Hz, motion artefacts from electrode movement (frequencies below ~20 Hz), and cross-talk from adjacent muscles. This is why bandpass filtering is an essential first step before any analysis — the gesture-relevant signal lives between roughly 20 and 90 Hz for consumer-grade hardware.`,
    callout: "The live waveform above shows a synthetic single-channel EMG recording cycling between rest and gesture activation. Real signals look remarkably similar.",
    cta: { label: "See your own signal in Signal Playground →", path: "/playground" },
    Visual: Oscilloscope,
    visualCaption: "Live synthetic EMG — cycling rest / contraction / rest",
  },
  {
    id: "s03", num: "03", tag: "The hardware", color: "#a855f7",
    title: "How MyoWare 2.0 fits in",
    body: `Medical-grade EMG amplifiers cost thousands of dollars and require trained clinicians to operate. The MyoWare 2.0 is a consumer-grade muscle sensor that brings surface EMG within reach for students, researchers, and hobbyists — for around $30. It handles the hard parts: differential amplification of the tiny (millivolt-scale) EMG signal relative to a reference electrode, active noise rejection, and signal conditioning into a 0–VCC analogue output that any microcontroller can read.

myojam chains the MyoWare output to an Arduino Uno R3, which samples it at 200 Hz via a 10-bit ADC and streams the values over USB serial to the Python classifier. The total hardware cost, excluding the laptop, is under $60 — comparable to a meal out, not a medical equipment budget.`,
    callout: "MyoWare 2.0 is not a medical device and is not intended for clinical use. myojam uses it for educational and research demonstrations only.",
    cta: { label: "See the wiring guide in the Desktop App docs →", path: "/download" },
    Visual: HardwareChain,
    visualCaption: "Signal chain from muscle to classification — ~$60 total hardware",
  },
  {
    id: "s04", num: "04", tag: "Signal processing", color: "#818cf8",
    title: "From raw signal to clean data",
    body: `The Arduino delivers raw ADC counts at 200 samples per second. Before these numbers mean anything to a classifier, they go through two processing stages.

First, a 4th-order zero-phase Butterworth bandpass filter attenuates everything outside 20–90 Hz. This removes DC bias and motion artefact below 20 Hz, and amplifier noise above 90 Hz, leaving only the biologically meaningful muscle activation band. The filter is applied bidirectionally (forward and backward) to preserve phase — so the filtered signal is time-aligned with the raw.

Second, the cleaned signal is cut into overlapping sliding windows: 200 samples (1 second) long, with a 50-sample (250 ms) step between windows. This gives the classifier a fresh observation roughly every 250 ms while retaining a full second of context per classification.`,
    callout: "The 75% overlap between consecutive windows means four predictions per second at low computational cost — critical for the responsiveness of real-time control.",
    cta: { label: "Visualise the filter live in the Frequency Analyzer →", path: "/frequency" },
    Visual: FilterDemo,
    visualCaption: "Butterworth bandpass: noise and artefact removed, gesture band preserved",
    extraVisual: WindowingDiagram,
    extraCaption: "Sliding window extraction — 4 overlapping windows per second",
  },
  {
    id: "s05", num: "05", tag: "Machine learning", color: "#38bdf8",
    title: "Teaching a computer to read gestures",
    body: `Raw waveforms are difficult to classify directly — they vary too much across people, sessions, and electrode placements. Instead, myojam compresses each window into four time-domain features computed independently for each of the 16 electrode channels:

• MAV (Mean Absolute Value) — average signal energy; the primary recruitment indicator
• RMS (Root Mean Square) — signal power; correlated with contraction force
• ZCR (Zero Crossing Rate) — frequency content proxy; rises with faster oscillations
• WL (Waveform Length) — morphological complexity; total signal variation over the window

These 4 features × 16 channels = 64 numbers form the feature vector. A Random Forest classifier — 500 independent decision trees, each trained on a random feature subset — votes on which gesture the vector most resembles. The majority vote determines the output. Trained under leave-one-subject-out cross-validation on 16,269 windows from 10 Ninapro DB5 subjects, the model achieves 84.85% cross-subject accuracy.`,
    callout: "Feature importance analysis via MDI shows MAV accounts for 35% and RMS for 27% of the model's total discriminative power — amplitude dominates.",
    cta: { label: "Trace a live prediction in the Pipeline Explorer →", path: "/pipeline" },
    Visual: FeaturePipelineDiagram,
    visualCaption: "Full inference pipeline: window → 64 features → Random Forest → gesture",
  },
  {
    id: "s06", num: "06", tag: "The bigger picture", color: "#34d399",
    title: "EMG as assistive technology",
    body: `For people with reduced hand or arm mobility — due to spinal cord injury, stroke, ALS, cerebral palsy, limb difference, or amputation — standard input devices like keyboards and mice can be inaccessible. EMG-based interfaces offer an alternative path: intent expressed through residual muscle activity, no fine motor control required.

Commercial myoelectric prosthetic hands have used EMG control since the 1960s. What myojam contributes is not the concept but the openness: a fully documented, reproducible pipeline, published under the MIT licence, that any researcher or engineer can inspect, modify, and build on. The question isn't whether EMG-based assistive technology is possible — it demonstrably is. The question is whether the tools for building it can be accessible to everyone who needs them.`,
    callout: null,
    cta: { label: "Read more in the Education Hub →", path: "/education" },
    Visual: AssistiveTechCases,
    visualCaption: "Three clinical use cases where sEMG interfaces provide meaningful access",
  },
  {
    id: "s07", num: "07", tag: "Where next", color: "#fb923c",
    title: "Where this technology is going",
    body: `Consumer EMG is genuinely early-stage. The fundamental limitations are well-understood: inter-session electrode placement variability degrades accuracy by 5–15 percentage points between sessions; cross-subject generalization plateaus below 90% with current feature sets; and the latency-accuracy tradeoff means no 200 Hz system simultaneously satisfies clinical requirements for both response speed (≤300 ms) and accuracy (≥80%).

Active research directions include deep learning methods that learn representations from raw signals (potentially closing the latency gap), higher-density electrode arrays that resolve individual finger movements, dry electrodes that eliminate gel preparation, and few-shot adaptation protocols that calibrate to new users in under 60 seconds. The path from 84.85% to clinical deployment isn't a single breakthrough — it's a sequence of incremental engineering solutions to known, quantified problems.`,
    callout: "myojam's windowing analysis documents the prosthetic feasibility gap in detail: no window duration simultaneously satisfies ≤300 ms latency and ≥80% accuracy for 200 Hz hardware.",
    cta: { label: "Read the windowing analysis →", path: "/research/windowing-analysis" },
    Visual: FutureRoadmap,
    visualCaption: "Technology readiness — where EMG gesture control sits today and what's next",
  },
]

const SECTION_IDS = SECTIONS.map(s => s.id)

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
export default function EMGExplainer() {
  const navigate = useNavigate()
  const [activeId, setActiveId] = useState(SECTION_IDS[0])
  const [progress, setProgress] = useState(0)
  const bodyRef = useRef(null)

  // Scroll progress bar
  useEffect(() => {
    function onScroll() {
      const el = bodyRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = el.offsetHeight - window.innerHeight
      setProgress(Math.max(0, Math.min(1, -rect.top / (total || 1))))
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Active section tracker
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id) })
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    )
    SECTION_IDS.forEach(id => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  const KEY_NUMBERS = [
    { val: "20–90 Hz", label: "Gesture band" },
    { val: "200 Hz",   label: "Sample rate"  },
    { val: "16",       label: "Channels"     },
    { val: "200",      label: "Samples/window" },
    { val: "64",       label: "Features"     },
    { val: "84.85%",   label: "Accuracy"     },
    { val: "$60",      label: "Hardware cost" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Reading progress bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, zIndex: 1000,
        height: 3, background: "var(--accent)",
        width: `${progress * 100}%`,
        transition: "width 0.1s linear",
        boxShadow: "0 0 8px rgba(255,45,120,0.5)",
      }} />

      <Navbar />

      {/* Hero */}
      <div style={{
        background: "linear-gradient(160deg, #060614 0%, #100028 50%, #060614 100%)",
        borderBottom: "1px solid var(--border)",
        padding: "100px 32px 0",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.05,
          backgroundImage: "radial-gradient(circle, var(--border) 1px, transparent 1px)",
          backgroundSize: "24px 24px" }}/>
        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <span onClick={() => navigate("/education")} style={{ fontSize: 12, color: "var(--accent)", cursor: "pointer" }}>Education</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>›</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 300 }}>EMG explainer</span>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#8B5CF6", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 100, padding: "3px 12px" }}>Foundations</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", alignSelf: "center" }}>7 sections · ~10 min read</span>
          </div>

          <h1 style={{ fontSize: "clamp(28px, 5vw, 54px)", fontWeight: 700, letterSpacing: "-1.8px", color: "#fff", lineHeight: 1.06, marginBottom: 18 }}>
            The science of<br/>
            <span style={{ color: "var(--accent)" }}>muscle-computer interfaces.</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", fontWeight: 300, lineHeight: 1.75, maxWidth: 560, marginBottom: 32 }}>
            What is EMG, how does surface signal acquisition work, and how does myojam turn a forearm twitch into a computer action? A full explainer from the biology up — with live visuals at every step.
          </p>

          {/* Author strip */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 36 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,45,120,0.15)", border: "1px solid rgba(255,45,120,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>J</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>myojam team</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>April 2026 · Jaden, Toronto</div>
            </div>
          </div>

          {/* Live oscilloscope */}
          <div style={{ borderRadius: "12px 12px 0 0", overflow: "hidden", border: "1px solid rgba(255,45,120,0.15)", borderBottom: "none" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px 14px", borderBottom: "1px solid rgba(255,45,120,0.1)", display: "flex", gap: 6 }}>
              {["#EF4444","#F59E0B","#10B981"].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }}/>)}
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: 6, fontFamily: "monospace" }}>live_emg_monitor · ch01 · 200 Hz</span>
            </div>
            <Oscilloscope />
          </div>
        </div>
      </div>

      {/* Key numbers strip */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex" }}>
          {KEY_NUMBERS.map((k, i) => (
            <div key={k.label} style={{
              flex: 1, padding: "16px 8px", textAlign: "center",
              borderRight: i < KEY_NUMBERS.length - 1 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.5px", lineHeight: 1 }}>{k.val}</div>
              <div style={{ fontSize: 9.5, color: "var(--text-tertiary)", marginTop: 3, fontWeight: 400 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Body: sticky TOC + article */}
      <div ref={bodyRef} style={{ maxWidth: 1040, margin: "0 auto", padding: "64px 32px 80px", display: "grid", gridTemplateColumns: "148px 1fr", gap: 48, alignItems: "start" }}>

        {/* Sticky TOC */}
        <div style={{ position: "sticky", top: 80, paddingTop: 4 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Contents</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {SECTIONS.map(s => {
              const isActive = activeId === s.id
              return (
                <a key={s.id} href={`#${s.id}`} style={{
                  display: "block", padding: "5px 10px",
                  borderLeft: `2px solid ${isActive ? s.color : "var(--border)"}`,
                  fontSize: 11.5,
                  color: isActive ? s.color : "var(--text-tertiary)",
                  textDecoration: "none", lineHeight: 1.3,
                  fontWeight: isActive ? 600 : 400,
                  transition: "color 0.2s, border-color 0.2s",
                  background: isActive ? `${s.color}08` : "transparent",
                  borderRadius: "0 4px 4px 0",
                }}>
                  <span style={{ fontSize: 9, display: "block", opacity: 0.55 }}>{s.num}</span>
                  {s.title.length > 22 ? s.title.slice(0, 22) + "…" : s.title}
                </a>
              )
            })}
          </div>
        </div>

        {/* Article sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {SECTIONS.map((s, i) => {
            const Visual = s.Visual
            const ExtraVisual = s.extraVisual || null
            return (
              <div key={s.id} id={s.id} style={{
                paddingBottom: 56, marginBottom: 56,
                borderBottom: i < SECTIONS.length - 1 ? "1px solid var(--border)" : "none",
              }}>
                {/* Section header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: `${s.color}14`, border: `1px solid ${s.color}35`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: s.color, flexShrink: 0, fontFamily: "monospace",
                  }}>{s.num}</div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: s.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.tag}</span>
                </div>

                <h2 style={{ fontSize: "clamp(20px, 2.8vw, 28px)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.6px", marginBottom: 20, lineHeight: 1.15 }}>{s.title}</h2>

                {/* Visual panel */}
                <div style={{
                  background: "var(--bg-secondary)", border: "1px solid var(--border)",
                  borderTop: `3px solid ${s.color}`,
                  borderRadius: "0 0 12px 12px", padding: 20, marginBottom: 24,
                }}>
                  <Visual />
                  {s.visualCaption && (
                    <div style={{ fontSize: 10.5, color: "var(--text-tertiary)", marginTop: 10, textAlign: "center", fontStyle: "italic" }}>{s.visualCaption}</div>
                  )}
                </div>

                {/* Body text */}
                {s.body.split("\n\n").map((para, pi) => (
                  <p key={pi} style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.82, fontWeight: 300, marginBottom: 14 }}>{para}</p>
                ))}

                {/* Extra visual */}
                {ExtraVisual && (
                  <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, margin: "20px 0" }}>
                    <ExtraVisual />
                    {s.extraCaption && <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 8, textAlign: "center", fontStyle: "italic" }}>{s.extraCaption}</div>}
                  </div>
                )}

                {/* Callout */}
                {s.callout && (
                  <div style={{
                    background: `${s.color}08`, border: `1px solid ${s.color}25`,
                    borderLeft: `3px solid ${s.color}`,
                    borderRadius: "0 10px 10px 0", padding: "14px 18px", margin: "20px 0",
                  }}>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 400, margin: 0 }}>{s.callout}</p>
                  </div>
                )}

                {/* Try it CTA */}
                {s.cta && (
                  <button onClick={() => navigate(s.cta.path)} style={{
                    marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6,
                    background: "var(--bg-secondary)", border: `1px solid ${s.color}35`,
                    borderRadius: 100, padding: "8px 18px",
                    fontSize: 12, fontWeight: 500, color: s.color,
                    cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${s.color}10`; e.currentTarget.style.borderColor = `${s.color}70` }}
                    onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-secondary)"; e.currentTarget.style.borderColor = `${s.color}35` }}
                  >
                    {s.cta.label}
                  </button>
                )}
              </div>
            )
          })}

          {/* Conclusion */}
          <div style={{ background: "linear-gradient(135deg, rgba(255,45,120,0.06) 0%, transparent 100%)", border: "1px solid rgba(255,45,120,0.15)", borderRadius: 14, padding: "36px 40px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 12 }}>Conclusion</div>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.82, fontWeight: 300, marginBottom: 20 }}>
              Surface EMG is a window into the body's intent. With the right hardware, signal processing, and machine learning, it becomes a practical interface between human movement and digital action. myojam demonstrates that this technology doesn't have to be expensive, proprietary, or inaccessible — it can be open-source, reproducible, and built with $60 of consumer hardware and public research data.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "Run the interactive demos", path: "/demos" },
                { label: "Read the research paper", path: "/research/paper" },
                { label: "Explore all findings", path: "/research/explorer" },
              ].map(btn => (
                <button key={btn.label} onClick={() => navigate(btn.path)} style={{
                  background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 100,
                  padding: "8px 18px", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)",
                  cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)" }}
                >{btn.label} →</button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 40 }}>
            <ArticleBar
              url="https://myojam.com/education/emg-explainer"
              title="The science of muscle-computer interfaces — myojam"
              citation={{ apa: `W., J. (2026, April). The science of muscle-computer interfaces. myojam. https://myojam.com/education/emg-explainer` }}
              presetLikes={47}
              storageKey="like_emg_explainer"
            />
          </div>
        </div>
      </div>

      <UpNext current="/education/emg-explainer" />
      <Footer />
    </div>
  )
}
