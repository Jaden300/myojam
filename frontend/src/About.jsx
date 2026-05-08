import { useEffect, useRef, useState, useCallback } from "react"
import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"
import NeuralNoise from "./components/NeuralNoise"
import { t } from "./i18n"

/* ── palette ──────────────────────────────────────────────── */
const PINK   = "#FF2D78"
const PURPLE = "#8B5CF6"
const BLUE   = "#3B82F6"
const GREEN  = "#10B981"
const AMBER  = "#F59E0B"

/* ── animated counter ────────────────────────────────────── */
function Counter({ target, suffix = "", decimals = 0, duration = 1800 }) {
  const ref   = useRef(null)
  const [val, setVal] = useState(0)
  const fired = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || fired.current) return
      fired.current = true
      const start = performance.now()
      function tick(now) {
        const p = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - p, 3)
        setVal(+(target * ease).toFixed(decimals))
        if (p < 1) requestAnimationFrame(tick)
        else setVal(target)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, decimals, duration])
  return <span ref={ref}>{val.toFixed(decimals)}{suffix}</span>
}

/* ── accuracy donut ──────────────────────────────────────── */
function AccuracyDonut() {
  const ref   = useRef(null)
  const [vis, setVis] = useState(false)
  const R = 72, CX = 90, CY = 90, SW = 12
  const circ = 2 * Math.PI * R

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const cross  = 84.85
  const intra  = 96.1
  const crossOffset  = circ - (cross / 100) * circ
  const intraOffset  = circ - (intra  / 100) * circ

  return (
    <div ref={ref} style={{ display:"flex", alignItems:"center", gap:32, flexWrap:"wrap" }}>
      <div style={{ position:"relative", flexShrink:0 }}>
        <svg width={180} height={180} viewBox="0 0 180 180">
          <defs>
            <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={PINK}/>
              <stop offset="100%" stopColor={PURPLE}/>
            </linearGradient>
          </defs>
          {/* track */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,45,120,0.08)" strokeWidth={SW}/>
          {/* intra-subject (faint outer) */}
          <circle cx={CX} cy={CY} r={R+14} fill="none" stroke="rgba(139,92,246,0.12)" strokeWidth={6}
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={vis ? intraOffset * (2*Math.PI*(R+14))/(2*Math.PI*R) : circ}
            strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`}
            style={{ transition:"stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1) 0.3s" }}
          />
          {/* cross-subject (main arc) */}
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="url(#pinkGrad)" strokeWidth={SW}
            strokeDasharray={`${circ} ${circ}`}
            strokeDashoffset={vis ? crossOffset : circ}
            strokeLinecap="round" transform={`rotate(-90 ${CX} ${CY})`}
            style={{ transition:"stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1) 0.1s" }}
          />
          {/* center label */}
          <text x={CX} y={CY - 8} textAnchor="middle" fill="#fff" fontSize={26} fontWeight={700} letterSpacing="-1">
            {vis ? "84.85" : "0.00"}
          </text>
          <text x={CX} y={CY + 12} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={11} fontWeight={400}>
            % accuracy
          </text>
        </svg>
        <div style={{ position:"absolute", right:-4, top:18, background:"rgba(139,92,246,0.15)", border:"1px solid rgba(139,92,246,0.3)", borderRadius:6, padding:"3px 8px", fontSize:11, color:PURPLE, fontWeight:500 }}>96.1%</div>
        <div style={{ position:"absolute", right:-4, bottom:54, background:"rgba(255,45,120,0.12)", border:"1px solid rgba(255,45,120,0.25)", borderRadius:6, padding:"3px 8px", fontSize:11, color:PINK, fontWeight:500 }}>84.85%</div>
      </div>

      <div style={{ flex:1, minWidth:200 }}>
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.55)", fontWeight:400 }}>Cross-subject (held-out)</span>
            <span style={{ fontSize:13, fontWeight:600, color:PINK }}>84.85%</span>
          </div>
          <div style={{ height:6, borderRadius:99, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
            <div style={{ height:"100%", background:`linear-gradient(90deg,${PINK},${PURPLE})`, borderRadius:99, width: vis?"84.85%":"0%", transition:"width 1.4s cubic-bezier(0.22,1,0.36,1) 0.2s" }}/>
          </div>
        </div>
        <div style={{ marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.55)", fontWeight:400 }}>Intra-subject (same user)</span>
            <span style={{ fontSize:13, fontWeight:600, color:PURPLE }}>~96.1%</span>
          </div>
          <div style={{ height:6, borderRadius:99, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
            <div style={{ height:"100%", background:`linear-gradient(90deg,${PURPLE},${BLUE})`, borderRadius:99, width: vis?"96.1%":"0%", transition:"width 1.4s cubic-bezier(0.22,1,0.36,1) 0.4s" }}/>
          </div>
        </div>
        <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", lineHeight:1.6, borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:12 }}>
          Tested on 10 subjects, 16,269 labelled windows, 6 gesture classes from Ninapro DB5.
        </div>
      </div>
    </div>
  )
}

/* ── latency gauge ───────────────────────────────────────── */
function LatencyGauge() {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const zones = [
    { label:"Prosthetic target", range:"< 300ms", color:GREEN,  from:0,   to:300 },
    { label:"Acceptable",        range:"300–600ms", color:AMBER, from:300, to:600 },
    { label:"Too slow",          range:"> 600ms",  color:PINK,  from:600, to:1000 },
  ]
  const myojam = 640
  const pct = (v) => (v / 1000) * 100

  return (
    <div ref={ref}>
      <div style={{ height:28, borderRadius:8, overflow:"hidden", display:"flex", marginBottom:14 }}>
        <div style={{ flex:"3 0 0", background:`${GREEN}22`, borderRight:`1px solid ${GREEN}40`, transition:"opacity 0.6s", opacity: vis ? 1 : 0 }}/>
        <div style={{ flex:"3 0 0", background:`${AMBER}22`, borderRight:`1px solid ${AMBER}40`, transition:"opacity 0.6s 0.15s", opacity: vis ? 1 : 0 }}/>
        <div style={{ flex:"4 0 0", background:`${PINK}22`, transition:"opacity 0.6s 0.3s", opacity: vis ? 1 : 0 }}/>
      </div>

      {/* track + marker */}
      <div style={{ position:"relative", height:16, marginBottom:24 }}>
        <div style={{ height:2, background:"rgba(255,255,255,0.1)", borderRadius:99, marginTop:7 }}/>
        {/* myojam marker */}
        <div style={{
          position:"absolute", top:0, left: vis ? `${pct(myojam)}%` : "0%",
          transform:"translateX(-50%)",
          transition:"left 1.2s cubic-bezier(0.22,1,0.36,1) 0.4s",
        }}>
          <div style={{ width:14, height:14, borderRadius:"50%", background:PINK, border:"2px solid rgba(255,255,255,0.8)", boxShadow:`0 0 12px ${PINK}80` }}/>
        </div>
        {/* 300ms line */}
        <div style={{ position:"absolute", top:-12, left:"30%", width:1, height:28, background:`${GREEN}50` }}/>
        <div style={{ position:"absolute", top:18, left:"30%", transform:"translateX(-50%)", fontSize:10, color:GREEN, fontWeight:500 }}>300ms</div>
        {/* 600ms line */}
        <div style={{ position:"absolute", top:-12, left:"60%", width:1, height:28, background:`${AMBER}50` }}/>
        <div style={{ position:"absolute", top:18, left:"60%", transform:"translateX(-50%)", fontSize:10, color:AMBER, fontWeight:500 }}>600ms</div>
        {/* myojam label */}
        <div style={{ position:"absolute", top:-22, left: vis ? `${pct(myojam)}%` : "0%", transform:"translateX(-50%)", fontSize:10, color:PINK, fontWeight:600, whiteSpace:"nowrap", transition:"left 1.2s cubic-bezier(0.22,1,0.36,1) 0.4s" }}>myojam ~640ms</div>
      </div>

      <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
        {zones.map(z => (
          <div key={z.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:z.color, flexShrink:0 }}/>
            <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>{z.label} <span style={{ color:"rgba(255,255,255,0.25)" }}>({z.range})</span></span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── electrode drift scatter ─────────────────────────────── */
function DriftScatter() {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const pts = [
    { drift:0,    acc:84.85 },
    { drift:2,    acc:83.1  },
    { drift:5,    acc:80.4  },
    { drift:8,    acc:77.0  },
    { drift:12,   acc:73.2  },
    { drift:16,   acc:69.9  },
    { drift:20,   acc:67.1  },
    { drift:25,   acc:71.8  }, // partial recovery with adaptation
    { drift:28,   acc:70.3  },
    { drift:32,   acc:72.5  },
  ]
  const W = 260, H = 130
  const mx = d => 32 + (d / 35) * (W - 40)
  const my = a => H - 14 - ((a - 60) / 40) * (H - 28)

  const pathD = pts.map((p,i)=>`${i===0?"M":"L"}${mx(p.drift)},${my(p.acc)}`).join(" ")

  return (
    <div ref={ref}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
        <defs>
          <linearGradient id="driftLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={PURPLE}/>
            <stop offset="100%" stopColor={PINK}/>
          </linearGradient>
          <clipPath id="driftClip"><rect x={32} y={0} width={W-40} height={H-14}/></clipPath>
        </defs>
        {/* axes */}
        <line x1={32} y1={0} x2={32} y2={H-14} stroke="rgba(255,255,255,0.12)" strokeWidth={1}/>
        <line x1={32} y1={H-14} x2={W} y2={H-14} stroke="rgba(255,255,255,0.12)" strokeWidth={1}/>
        {/* gridlines */}
        {[65,70,75,80,85].map(a => (
          <g key={a}>
            <line x1={32} x2={W} y1={my(a)} y2={my(a)} stroke="rgba(255,255,255,0.05)" strokeDasharray="3,3"/>
            <text x={28} y={my(a)+4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize={9}>{a}%</text>
          </g>
        ))}
        {/* axis labels */}
        <text x={W/2+16} y={H+2} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9}>Electrode drift (mm)</text>
        {/* baseline */}
        <line x1={32} x2={W} y1={my(84.85)} y2={my(84.85)} stroke={`${PINK}35`} strokeDasharray="5,3"/>
        <text x={W-2} y={my(84.85)-4} textAnchor="end" fill={`${PINK}90`} fontSize={9}>baseline</text>
        {/* line */}
        <path d={pathD} fill="none" stroke="url(#driftLine)" strokeWidth={2}
          clipPath="url(#driftClip)"
          strokeDasharray={400} strokeDashoffset={vis ? 0 : 400}
          style={{ transition:"stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1) 0.2s" }}
        />
        {/* dots */}
        {pts.map((p,i) => (
          <circle key={i} cx={mx(p.drift)} cy={my(p.acc)} r={4}
            fill={PURPLE} stroke="rgba(0,0,0,0.5)" strokeWidth={1.5}
            opacity={vis ? 1 : 0}
            style={{ transition:`opacity 0.3s ${0.8 + i * 0.06}s` }}
          />
        ))}
        {/* zero drift marker */}
        <text x={mx(0)} y={H-1} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={8}>0</text>
        <text x={mx(35)} y={H-1} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={8}>35</text>
      </svg>
    </div>
  )
}

/* ── interactive project timeline ────────────────────────── */
const TIMELINE = [
  { date:"Aug 2024", label:"Research begins", body:"Question posed: can one person build a clinically meaningful gesture classifier using only public data and $60 of hardware?", color:BLUE, icon:"?" },
  { date:"Sep 2024", label:"Dataset selected", body:"Ninapro DB5 chosen — 10 subjects, sEMG from 10 forearm electrodes, 52 gestures. Subset to 6 classes for initial experiment.", color:PURPLE, icon:"📊" },
  { date:"Oct 2024", label:"Pipeline built", body:"Signal preprocessing pipeline implemented: 200Hz sampling, 300ms sliding windows, MAV + RMS + WL + ZCR feature extraction across channels.", color:AMBER, icon:"⚙️" },
  { date:"Dec 2024", label:"Classifier achieved", body:"Random Forest reaches 84.85% cross-subject accuracy — the original research question answered.", color:PINK, icon:"✓" },
  { date:"Jan 2025", label:"Platform launched", body:"Education hub goes live with first 3 articles, interactive signal playground, and open-source pipeline documentation.", color:GREEN, icon:"🚀" },
  { date:"Feb 2025", label:"Lesson plans", body:"Three structured lesson plans written for secondary and university educators. First classroom adoption reported.", color:BLUE, icon:"📚" },
  { date:"Mar 2025", label:"Desktop app", body:"macOS, Windows, and Linux desktop app released. Real-time gesture inference from webcam-compatible sEMG hardware.", color:PURPLE, icon:"💻" },
  { date:"Apr 2025", label:"Research papers", body:"Four peer-structured research papers published: classifier analysis, variability review, windowing analysis, and the main paper.", color:PINK, icon:"📄" },
]

function Timeline() {
  const [active, setActive] = useState(null)
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ position:"relative", paddingLeft:32 }}>
      {/* vertical line */}
      <div style={{
        position:"absolute", left:10, top:0, width:1.5, background:"linear-gradient(to bottom, rgba(255,45,120,0.6), rgba(139,92,246,0.4), rgba(59,130,246,0.2))",
        height: vis ? "100%" : "0%",
        transition:"height 1.2s ease 0.3s",
        borderRadius:99,
      }}/>

      {TIMELINE.map((item, i) => (
        <div key={i}
          onClick={() => setActive(active === i ? null : i)}
          style={{
            position:"relative", marginBottom:i < TIMELINE.length - 1 ? 20 : 0,
            opacity: vis ? 1 : 0, transform: vis ? "translateX(0)" : "translateX(-16px)",
            transition:`opacity 0.45s ${0.4 + i * 0.07}s ease, transform 0.45s ${0.4 + i * 0.07}s ease`,
            cursor:"pointer",
          }}
        >
          {/* dot */}
          <div style={{
            position:"absolute", left:-32+10-7, top:12, width:14, height:14, borderRadius:"50%",
            background: active === i ? item.color : `${item.color}40`,
            border:`2px solid ${item.color}`,
            boxShadow: active === i ? `0 0 12px ${item.color}60` : "none",
            transition:"all 0.25s",
            zIndex:1,
          }}/>

          <div style={{
            background: active === i ? `${item.color}0A` : "rgba(255,255,255,0.02)",
            border:`1px solid ${active === i ? item.color + "30" : "rgba(255,255,255,0.06)"}`,
            borderRadius:10, padding:"12px 16px",
            transition:"all 0.25s",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom: active === i ? 8 : 0 }}>
              <span style={{ fontSize:10, fontWeight:600, color:`${item.color}CC`, letterSpacing:"0.06em", textTransform:"uppercase" }}>{item.date}</span>
              <span style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.85)" }}>{item.label}</span>
              <span style={{ marginLeft:"auto", fontSize:11, color:"rgba(255,255,255,0.3)", transform: active===i?"rotate(180deg)":"rotate(0)", transition:"transform 0.2s" }}>▾</span>
            </div>
            {active === i && (
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", lineHeight:1.7, margin:0 }}>{item.body}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── tech stack orbit ────────────────────────────────────── */
const TECH = [
  { name:"React",     color:BLUE,   angle:0,    desc:"Frontend SPA" },
  { name:"FastAPI",   color:GREEN,  angle:45,   desc:"Python backend" },
  { name:"sklearn",   color:AMBER,  angle:90,   desc:"ML pipeline" },
  { name:"WebGL",     color:PURPLE, angle:135,  desc:"3D visuals" },
  { name:"ogl",       color:PINK,   angle:180,  desc:"WebGL layer" },
  { name:"Vite",      color:BLUE,   angle:225,  desc:"Build tool" },
  { name:"Ninapro",   color:GREEN,  angle:270,  desc:"EMG dataset" },
  { name:"MIT",       color:AMBER,  angle:315,  desc:"License" },
]

function TechOrbit() {
  const [hover, setHover] = useState(null)
  const [tick, setTick]   = useState(0)
  const raf = useRef(null)
  const start = useRef(performance.now())

  useEffect(() => {
    function loop() {
      setTick(performance.now() - start.current)
      raf.current = requestAnimationFrame(loop)
    }
    raf.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  const R1 = 80, R2 = 125
  const W = 300, CX = 150, CY = 150

  return (
    <div style={{ position:"relative", width:W, height:W, margin:"0 auto" }}>
      <svg width={W} height={W} viewBox={`0 0 ${W} ${W}`} style={{ position:"absolute", inset:0 }}>
        <circle cx={CX} cy={CY} r={R1} fill="none" stroke="rgba(255,45,120,0.08)" strokeWidth={1} strokeDasharray="4,6"/>
        <circle cx={CX} cy={CY} r={R2} fill="none" stroke="rgba(139,92,246,0.06)" strokeWidth={1} strokeDasharray="4,6"/>
      </svg>

      {/* center */}
      <div style={{ position:"absolute", left:"50%", top:"50%", transform:"translate(-50%,-50%)", textAlign:"center", zIndex:10 }}>
        <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(255,45,120,0.12)", border:`1.5px solid ${PINK}30`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div style={{ fontSize:10, fontWeight:700, color:PINK, letterSpacing:"0.04em" }}>myojam</div>
        </div>
      </div>

      {TECH.map((tech, i) => {
        const r     = i % 2 === 0 ? R1 : R2
        const speed = i % 2 === 0 ? 0.00018 : -0.00012
        const baseRad = (tech.angle * Math.PI) / 180
        const rad = baseRad + tick * speed
        const x   = CX + r * Math.cos(rad)
        const y   = CY + r * Math.sin(rad)

        return (
          <div key={tech.name}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{
              position:"absolute",
              left:x, top:y,
              transform:"translate(-50%,-50%)",
              zIndex:5,
              transition:"transform 0.15s",
            }}
          >
            <div style={{
              background: hover === i ? `${tech.color}20` : "rgba(0,0,12,0.7)",
              border:`1px solid ${hover === i ? tech.color : tech.color + "35"}`,
              borderRadius:8, padding:"5px 10px",
              fontSize:11, fontWeight:600, color: hover === i ? tech.color : `${tech.color}CC`,
              whiteSpace:"nowrap",
              backdropFilter:"blur(8px)",
              boxShadow: hover === i ? `0 4px 16px ${tech.color}40` : "none",
              transition:"all 0.2s",
            }}>
              {tech.name}
            </div>
            {hover === i && (
              <div style={{
                position:"absolute", top:"calc(100% + 4px)", left:"50%", transform:"translateX(-50%)",
                background:"rgba(0,0,12,0.92)", border:`1px solid ${tech.color}30`,
                borderRadius:6, padding:"4px 8px", fontSize:10, color:"rgba(255,255,255,0.55)",
                whiteSpace:"nowrap", zIndex:20,
              }}>
                {tech.desc}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── open problems ───────────────────────────────────────── */
const PROBLEMS = [
  {
    num:"01", color:PINK,
    title:"Cross-subject accuracy gap",
    stat:"84.85%", statSub:"vs ~96% intra-subject",
    body:"The model generalises to unseen subjects at 84.85%. Closing the 11pp gap to intra-subject accuracy likely requires personalization layers — none exist today.",
    visual: <AccuracyDonut />,
  },
  {
    num:"02", color:AMBER,
    title:"Prosthetic latency constraint",
    stat:"~640ms", statSub:"target: < 300ms",
    body:"Natural prosthetic control requires under 300ms end-to-end. Windowing and feature extraction push myojam to ~640ms. Accuracy-latency co-optimisation is an open problem.",
    visual: <LatencyGauge />,
  },
  {
    num:"03", color:PURPLE,
    title:"Electrode placement drift",
    stat:"5–15pp", statSub:"accuracy drop",
    body:"Millimetre shifts in electrode placement between sessions degrade accuracy 5–15pp. The model has no drift-detection mechanism, requiring manual recalibration.",
    visual: <DriftScatter />,
  },
]

/* ── EMG mini-canvas (decorative hero element) ───────────── */
function MiniEMG() {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")

    const CH = 4
    const phases = Array.from({ length:CH }, (_,i) => i * 1.3)
    const freqs  = [1.2, 1.7, 0.9, 1.4]
    const amps   = [0.3, 0.22, 0.28, 0.18]
    const colors = [PINK, PURPLE, BLUE, GREEN]

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas.width  = canvas.offsetWidth  * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let t = 0
    function draw() {
      const W = canvas.offsetWidth, H = canvas.offsetHeight
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = "source-over"

      for (let c = 0; c < CH; c++) {
        const cy = (H / CH) * (c + 0.5)
        const amp = (H / CH) * 0.35 * amps[c]

        ctx.save()
        ctx.filter = `blur(${2 + c * 0.5}px)`
        ctx.strokeStyle = colors[c] + "50"
        ctx.lineWidth = 1.5
        ctx.beginPath()
        for (let x = 0; x < W; x++) {
          const xn = x / W
          const y = cy + Math.sin(xn * 14 * freqs[c] + phases[c] + t * freqs[c]) * amp
            + Math.sin(xn * 31 + phases[c] * 1.7 + t * 0.7) * amp * 0.4
            + (Math.random() - 0.5) * amp * 0.12
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.restore()

        ctx.strokeStyle = colors[c] + "CC"
        ctx.lineWidth = 1.2
        ctx.beginPath()
        for (let x = 0; x < W; x++) {
          const xn = x / W
          const y = cy + Math.sin(xn * 14 * freqs[c] + phases[c] + t * freqs[c]) * amp
            + Math.sin(xn * 31 + phases[c] * 1.7 + t * 0.7) * amp * 0.4
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()

        phases[c] += 0.022
      }
      t += 0.018
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  return <canvas ref={canvasRef} style={{ width:"100%", height:"100%", display:"block" }}/>
}

/* ── VALUES data ─────────────────────────────────────────── */
const VALUES = [
  { icon:"📖", color:BLUE,   title:"Education as the mission",
    body:"MyoCode, the education hub, and the How It Works page together account for more development time than the classifier itself. The articles, lesson plans, and interactive tools aren't supplements — they are the project." },
  { icon:"🌍", color:GREEN,  title:"Open source by default",
    body:"Every model weight, training script, and architecture decision is on GitHub under MIT — including the experiments that didn't work. We publish the full confusion matrix, not just the headline accuracy. Reproducibility is the minimum bar." },
  { icon:"🔬", color:PURPLE, title:"Honest science, clear writing",
    body:"We report 84.85% with leave-one-subject-out validation, not the higher number we'd get by choosing the best test subject. The methodology is in the text, not buried in a footnote. Rigour and clarity aren't in tension." },
  { icon:"⚡", color:PINK,   title:"Technology adapts to people",
    body:"The gesture vocabulary, confidence thresholds, and electrode placement guidance are all user-adjustable. Assistive technology that requires users to conform to hardware constraints has the relationship exactly backwards." },
]

/* ── page ────────────────────────────────────────────────── */
export default function About() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", overflowX:"clip" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:0.4} 50%{opacity:1} }
      `}</style>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid var(--border)", minHeight:520, display:"flex", alignItems:"center" }}>
        <NeuralNoise color={[0.49, 0.23, 0.93]} opacity={0.85} speed={0.0006} />
        <div style={{ position:"absolute", inset:0, background:"rgba(3,0,18,0.6)", zIndex:1 }}/>

        {/* EMG waveform strip at bottom */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:90, zIndex:2, opacity:0.35 }}>
          <MiniEMG />
        </div>

        <div style={{ maxWidth:920, margin:"0 auto", padding:"120px 32px 80px", position:"relative", zIndex:3, width:"100%" }}>
          <div style={{ animation:"fadeUp 0.5s ease both" }}>
            <SectionPill>About myojam</SectionPill>
          </div>
          <h1 style={{
            fontSize:"clamp(42px,6.5vw,78px)", fontWeight:600, letterSpacing:"-3px",
            lineHeight:1.02, color:"#fff", marginBottom:28,
            animation:"fadeUp 0.55s 0.1s ease both",
          }}>
            An open platform<br/>
            <span style={{ background:`linear-gradient(90deg,${PINK},${PURPLE})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              for EMG research.
            </span>
          </h1>
          <p style={{ fontSize:18, color:"rgba(255,255,255,0.65)", fontWeight:300, lineHeight:1.8, maxWidth:560, animation:"fadeUp 0.55s 0.2s ease both" }}>
            {t("about_sub")}
          </p>

          {/* inline stat pills */}
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginTop:36, animation:"fadeUp 0.55s 0.3s ease both" }}>
            {[
              { v:"84.85%", label:"cross-subject accuracy", color:PINK },
              { v:"16,269",  label:"labelled windows",       color:PURPLE },
              { v:"10",      label:"subjects tested",        color:BLUE },
              { v:"11",      label:"open articles",          color:GREEN },
            ].map(s => (
              <div key={s.label} style={{
                background:`${s.color}12`,
                border:`1px solid ${s.color}30`,
                borderRadius:99, padding:"7px 16px",
                display:"flex", alignItems:"center", gap:8,
              }}>
                <span style={{ fontSize:15, fontWeight:700, color:s.color }}>{s.v}</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── The core result ───────────────────────────────── */}
      <section style={{ borderBottom:"1px solid var(--border)", padding:"80px 32px", background:"var(--bg)" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <Reveal>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>
              <div>
                <SectionPill>Core result</SectionPill>
                <h2 style={{ fontSize:"clamp(26px,3.5vw,38px)", fontWeight:600, letterSpacing:"-1.2px", color:"var(--text)", lineHeight:1.2, marginBottom:20 }}>
                  One question.<br/>A rigorous answer.
                </h2>
                <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, marginBottom:16 }}>
                  Starting in August 2024: can one person build a clinically meaningful EMG gesture classifier using only public datasets and $60 of hardware?
                </p>
                <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300 }}>
                  The answer arrived in December 2024 — <strong style={{ color:"var(--text)", fontWeight:600 }}>84.85% cross-subject accuracy</strong> on Ninapro DB5, trained on 10 subjects, 16,269 labelled 300ms windows, 6 gesture classes.
                </p>
              </div>
              {/* accuracy donut */}
              <div style={{ background:"rgba(255,45,120,0.03)", border:"1px solid rgba(255,45,120,0.1)", borderRadius:16, padding:"32px 28px" }}>
                <AccuracyDonut />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Origin timeline ───────────────────────────────── */}
      <section style={{ borderBottom:"1px solid var(--border)", padding:"80px 32px", background:"var(--bg-secondary)" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <Reveal>
            <SectionPill>Timeline</SectionPill>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,38px)", fontWeight:600, letterSpacing:"-1.2px", color:"var(--text)", marginBottom:40 }}>
              Building in public.
            </h2>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48 }}>
            <Reveal delay={0.1}>
              <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.8, marginBottom:0 }}>
                Every decision — dataset choice, classifier architecture, hyperparameters, deployment approach — was documented publicly as it happened. Click any milestone to expand.
              </p>
            </Reveal>
            <div/>
          </div>
          <div style={{ marginTop:40 }}>
            <Timeline />
          </div>
        </div>
      </section>

      {/* ── What myojam is ────────────────────────────────── */}
      <section style={{ borderBottom:"1px solid var(--border)", padding:"80px 32px" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <Reveal>
            <SectionPill>The platform</SectionPill>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,38px)", fontWeight:600, letterSpacing:"-1.2px", color:"var(--text)", marginBottom:48 }}>
              Four things in one.
            </h2>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
            {[
              { title:"A gesture classifier",  sub:"84.85% cross-subject accuracy on Ninapro DB5",       color:PINK,   n:"01" },
              { title:"An education hub",      sub:"11 articles, 3 lesson plans, 4 interactive tools",   color:PURPLE, n:"02" },
              { title:"Published research",    sub:"Documented signal processing pipeline, open access",  color:BLUE,   n:"03" },
              { title:"An open platform",      sub:"MIT licensed, fully documented, publicly built",      color:GREEN,  n:"04" },
            ].map(({ title, sub, color, n }, i) => (
              <Reveal key={n} delay={i * 0.08}>
                <div style={{
                  border:`1px solid ${color}20`,
                  borderLeft:`4px solid ${color}`,
                  background:`${color}06`,
                  borderRadius:"2px 12px 12px 2px",
                  padding:"24px 24px",
                  display:"flex", alignItems:"flex-start", gap:16,
                }}>
                  <div style={{ fontSize:28, fontWeight:700, color:`${color}30`, letterSpacing:"-1.5px", lineHeight:1, flexShrink:0, paddingTop:2 }}>{n}</div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:600, color:"var(--text)", marginBottom:6 }}>{title}</div>
                    <div style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.6 }}>{sub}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Open problems ─────────────────────────────────── */}
      <section style={{ borderBottom:"1px solid var(--border)", padding:"80px 32px", background:"var(--bg-secondary)" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <Reveal>
            <SectionPill>Honest limitations</SectionPill>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,38px)", fontWeight:600, letterSpacing:"-1.2px", color:"var(--text)", marginBottom:12 }}>
              Three open problems.
            </h2>
            <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, marginBottom:48, maxWidth:560 }}>
              84.85% is a meaningful result — but the gaps between research-grade and clinical deployment are real and worth visualising.
            </p>
          </Reveal>

          <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:40 }}>
            {PROBLEMS.map((p, i) => (
              <Reveal key={p.num} delay={i * 0.1}>
                <div style={{ border:`1px solid ${p.color}15`, borderRadius:16, overflow:"hidden", display:"grid", gridTemplateColumns:"1fr 1.2fr", gap:0 }}>
                  {/* left: text */}
                  <div style={{ padding:"32px 32px", borderRight:`1px solid ${p.color}15`, background:`${p.color}04` }}>
                    <div style={{ fontSize:32, fontWeight:700, color:`${p.color}20`, letterSpacing:"-2px", lineHeight:1 }}>{p.num}</div>
                    <div style={{ fontSize:16, fontWeight:600, color:"var(--text)", margin:"12px 0 8px", letterSpacing:"-0.3px" }}>{p.title}</div>
                    <div style={{ fontSize:24, fontWeight:700, color:p.color, letterSpacing:"-1px", marginBottom:4 }}>{p.stat}</div>
                    <div style={{ fontSize:11, color:"var(--text-tertiary)", marginBottom:16 }}>{p.statSub}</div>
                    <p style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, margin:0 }}>{p.body}</p>
                  </div>
                  {/* right: visualization */}
                  <div style={{ padding:"32px 28px", background:"rgba(0,0,0,0.18)", display:"flex", alignItems:"center" }}>
                    {p.visual}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────── */}
      <section style={{ borderBottom:"1px solid var(--border)", padding:"80px 32px" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <Reveal>
            <SectionPill>What we believe</SectionPill>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,38px)", fontWeight:600, letterSpacing:"-1.2px", color:"var(--text)", marginBottom:40 }}>
              Four principles.
            </h2>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <div className="about-value-card" style={{
                  border:`1px solid var(--border)`,
                  borderRadius:14, padding:"28px 28px",
                  background:"var(--bg-secondary)",
                  cursor:"default",
                  transition:"border-color 0.2s, transform 0.2s, box-shadow 0.2s",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = v.color + "50"
                    e.currentTarget.style.transform = "translateY(-3px)"
                    e.currentTarget.style.boxShadow = `0 8px 24px ${v.color}12`
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "var(--border)"
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <div style={{ fontSize:28, marginBottom:14 }}>{v.icon}</div>
                  <div style={{ fontSize:15, fontWeight:600, color:"var(--text)", marginBottom:10 }}>{v.title}</div>
                  <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.75, fontWeight:300, margin:0 }}>{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech stack orbit ──────────────────────────────── */}
      <section style={{ borderBottom:"1px solid var(--border)", padding:"80px 32px", background:"var(--bg-secondary)" }}>
        <div style={{ maxWidth:920, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>
          <Reveal>
            <SectionPill>Technology</SectionPill>
            <h2 style={{ fontSize:"clamp(24px,3vw,34px)", fontWeight:600, letterSpacing:"-1px", color:"var(--text)", lineHeight:1.2, marginBottom:20 }}>
              The stack behind the science.
            </h2>
            <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.8, marginBottom:24 }}>
              Every layer is open. The signal processing pipeline, ML model, React frontend, and FastAPI backend are all public on GitHub.
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { n:"React + Vite",  c:BLUE,   d:"Pure SPA — no SSR overhead. Vite's rolldown bundler gives sub-500ms rebuilds, which matters when you're iterating on WebGL animations and canvas timing." },
                { n:"scikit-learn",  c:AMBER,  d:"Random Forest over PyTorch because inference runs in under 5ms on a CPU. No GPU dependency — a hard requirement for real-time gesture control on consumer hardware." },
                { n:"WebGL / ogl",   c:PURPLE, d:"ogl is a minimal WebGL wrapper with no Three.js overhead. The live signal canvas renders 16 channels at 60fps with under 2ms draw time per frame." },
                { n:"Ninapro DB5",   c:PINK,   d:"The only public EMG dataset large enough to validate cross-subject generalization honestly. 10 subjects, 52 repetitions per gesture, recorded at EPFL." },
                { n:"MIT License",   c:GREEN,  d:"MIT over Apache or GPL specifically to remove friction for clinical researchers under IP agreements. Attribution required, nothing else — no copyleft, no patent clauses." },
              ].map(({ n, d, c }) => (
                <div key={n} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:c, flexShrink:0, marginTop:5 }}/>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:3 }}>{n}</div>
                    <div style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.65 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <TechOrbit />
          </Reveal>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section style={{ padding:"80px 32px" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <Reveal>
            <div style={{
              background:`linear-gradient(135deg, ${PINK}0A 0%, ${PURPLE}08 100%)`,
              border:`1px solid ${PINK}20`,
              borderRadius:20, padding:"56px 48px",
              display:"flex", justifyContent:"space-between", alignItems:"center", gap:32, flexWrap:"wrap",
            }}>
              <div>
                <div style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.5px", marginBottom:10 }}>myojam is fully open source</div>
                <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, margin:0, maxWidth:480 }}>
                  Signal processing pipeline, ML model, React frontend, FastAPI backend — all public under the MIT license.
                </p>
              </div>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                <a href="https://github.com/Jaden300/myojam" target="_blank" rel="noreferrer"
                  style={{ background:"var(--accent)", color:"#fff", borderRadius:100, padding:"13px 28px", fontSize:14, fontWeight:500, textDecoration:"none", flexShrink:0, boxShadow:`0 4px 16px ${PINK}35`, transition:"transform 0.15s, box-shadow 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform="scale(1.04)"; e.currentTarget.style.boxShadow=`0 8px 24px ${PINK}50` }}
                  onMouseLeave={e => { e.currentTarget.style.transform="scale(1)";   e.currentTarget.style.boxShadow=`0 4px 16px ${PINK}35` }}
                >View on GitHub ↗</a>
                <span onClick={() => navigate("/mission")}
                  style={{ background:"transparent", color:"var(--text)", borderRadius:100, padding:"12px 24px", fontSize:14, fontWeight:400, border:"1px solid var(--border)", cursor:"pointer", flexShrink:0, transition:"border-color 0.15s, color 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--accent)" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text)" }}
                >Read our mission →</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}
