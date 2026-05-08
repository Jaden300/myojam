import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef, useMemo } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, StaggerList, HoverCard, SectionPill } from "./Animate"
import Threads from "./Threads"
import SignalModel3D from "./components/SignalModel3D"
import { t } from "./i18n"
import { IconBook, IconGraduate, IconBolt, IconMicroscope, IconGame, IconBrain, IconPencil, IconTarget, IconSparkle } from "./Icons"

const PINK = "#FF2D78", BLUE = "#3B82F6", GREEN = "#10B981", PURPLE = "#8B5CF6", AMBER = "#F59E0B", RED = "#EF4444"

const ALL_READS = [
  { slug:"/education/emg-explainer",       tag:"Foundations",  title:"The science of muscle-computer interfaces",       time:"8 min",  desc:"How motor neurons, muscle fibres, and surface electrodes turn movement into electrical data." },
  { slug:"/education/why-emg-is-hard",     tag:"Signal proc.", title:"Why EMG is harder than it looks",                 time:"7 min",  desc:"Noise, placement variability, and individual anatomy - the three problems that make EMG genuinely hard." },
  { slug:"/education/future-of-bci",       tag:"Future",       title:"After EMG: what comes next in BCI",               time:"6 min",  desc:"From implanted electrodes to non-invasive ultrasound - what the next decade of neural interfaces looks like." },
  { slug:"/education/build-your-own",      tag:"Hardware",     title:"Build your own EMG sensor for under $60",         time:"8 min",  desc:"MyoWare 2.0, an Arduino, and a breadboard: everything you need for a working surface EMG sensor." },
  { slug:"/education/muscle-memory",       tag:"Neuroscience", title:"What actually is muscle memory?",                 time:"5 min",  desc:"Motor cortex plasticity, cerebellar loops, and why 'muscle memory' is stored in your brain, not your muscles." },
  { slug:"/education/phantom-limb",        tag:"Neuroscience", title:"The neuroscience of phantom limb sensation",      time:"6 min",  desc:"What amputees' phantom sensations reveal about how the brain constructs and maintains a body image." },
  { slug:"/education/ethics-of-emg",       tag:"Ethics",       title:"Who owns your muscle data?",                     time:"7 min",  desc:"Consent, ownership, and corporate control of neuromuscular data - the questions the field rarely asks." },
  { slug:"/education/windowing-explained", tag:"Signal proc.", title:"Windowing: how raw EMG becomes ML features",      time:"5 min",  desc:"Sliding windows, overlap ratios, and why this single preprocessing decision shapes everything downstream." },
  { slug:"/education/random-forest-emg",   tag:"ML",           title:"Why Random Forest works so well for EMG",         time:"7 min",  desc:"Ensemble learning, feature subspace randomisation, and why RF consistently beats deep nets on tabular EMG data." },
  { slug:"/education/open-source-emg",     tag:"Open source",  title:"The state of open-source EMG",                   time:"6 min",  desc:"Ninapro, OpenBCI, and the researchers building the infrastructure for reproducible biosignal science." },
  { slug:"/research/paper",                tag:"Research",     title:"myojam: the full technical report",               time:"15 min", desc:"84.85% cross-subject accuracy from a 64-feature Random Forest on Ninapro DB5 - every decision documented." },
  { slug:"/research/classifier-analysis",  tag:"Research",     title:"Feature engineering and classifier comparison",   time:"20 min", desc:"RF vs SVM vs k-NN vs LDA under rigorous LOSO cross-validation, with feature importance analysis." },
  { slug:"/research/variability-review",   tag:"Research",     title:"Origins of inter-subject sEMG variability",       time:"25 min", desc:"A structured review of electrode displacement, fatigue, session effects, and the mitigation strategies that work." },
  { slug:"/research/windowing-analysis",   tag:"Research",     title:"Window duration, overlap, and the prosthetic feasibility gap", time:"22 min", desc:"Why no window size simultaneously satisfies both the latency and accuracy requirements for prosthetic control." },
]

const STATS = [
  { val:"84.85%", label:"Cross-subject accuracy",  sub:"Leave-one-subject-out, Ninapro DB5" },
  { val:"16,269", label:"Training windows",         sub:"200-sample · 200 Hz · 10 subjects" },
  { val:"64",     label:"Features per window",      sub:"Hudgins set · 4 features × 16 ch" },
  { val:"MIT",    label:"Open source license",      sub:"Free to use, fork, and build on" },
]

const PILLARS = [
  {
    slug:"/education", icon:IconBook, color:BLUE,
    title:"Education hub",
    sub:"11 in-depth articles",
    desc:"EMG science doesn't have a good public textbook. These 11 articles are the resource we wished existed — from how action potentials produce muscle electrical signals to why cross-subject generalization is still an open research problem.",
  },
  {
    slug:"/educators", icon:IconGraduate, color:PURPLE,
    title:"For educators",
    sub:"Ready-to-teach lesson plans",
    desc:"Three complete lesson plans tested at middle school to university level. Each includes real Ninapro EMG data, printable student worksheets, and explicit alignment to biology and CS curriculum standards.",
  },
  {
    slug:"/demos", icon:IconBolt, color:PINK,
    title:"Interactive tools",
    sub:"Seven browser tools",
    desc:"A real-time signal playground, frequency analyzer, confusion matrix explorer, reaction game, live EMG canvas, gesture block-coding environment, and classifier visualizer — all running in your browser, no install required.",
  },
  {
    slug:"/research", icon:IconMicroscope, color:GREEN,
    title:"Open research",
    sub:"Fully documented pipeline",
    desc:"Every stage documented: 16-ch EMG → Butterworth filter → 200-sample windows → 64 Hudgins features → 500-tree Random Forest. Trained weights, Ninapro DB5 training set, and full reproducible pipeline on GitHub under MIT.",
  },
]

const ARTICLES = [
  { slug:"/education/emg-explainer",    tag:"Foundations",   title:"The science of muscle-computer interfaces",     time:"8 min" },
  { slug:"/education/why-emg-is-hard",  tag:"Signal proc.",  title:"Why EMG is harder than it looks",               time:"7 min" },
  { slug:"/education/future-of-bci",    tag:"Future",        title:"After EMG: what comes next",                    time:"6 min" },
  { slug:"/education/build-your-own",   tag:"Hardware",      title:"Build your own EMG sensor for under $60",       time:"8 min" },
]

const GESTURES = [
  { label:"INDEX FLEX",  conf:0.88, color:PINK   },
  { label:"FIST",        conf:0.87, color:RED    },
  { label:"THUMB FLEX",  conf:0.87, color:AMBER  },
  { label:"MIDDLE FLEX", conf:0.83, color:BLUE   },
  { label:"PINKY FLEX",  conf:0.82, color:GREEN  },
  { label:"RING FLEX",   conf:0.80, color:PURPLE },
]

const PIPELINE_STEPS = [
  { n:"01", title:"Signal capture",     params:"16-ch · 200 Hz",        detail:"Surface EMG adhesive electrodes across the forearm, sampling at 200 Hz per channel. No needles." },
  { n:"02", title:"Bandpass filter",    params:"20 – 450 Hz",           detail:"Remove DC offset, motion artifact, and power-line noise. Preserve the 20–450 Hz muscle band." },
  { n:"03", title:"Windowing",          params:"200 samples · 50% ovlp", detail:"Segment the continuous stream into overlapping windows. Each window becomes one training/inference example." },
  { n:"04", title:"Feature extraction", params:"64 Hudgins features",   detail:"Compute MAV, RMS, ZC, and WL for each of 16 channels. 4 × 16 = 64 features per window." },
  { n:"05", title:"Classification",     params:"RF · 500 trees · <5 ms", detail:"A 500-tree Random Forest predicts the gesture label. Inference takes under 5 ms on a standard CPU." },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{ padding:"20px 24px", background:"var(--bg)", cursor:"pointer", borderBottom:"1px solid var(--border)", transition:"background 0.15s", userSelect:"none" }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--bg-secondary)"}
      onMouseLeave={e => e.currentTarget.style.background = "var(--bg)"}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
        <div style={{ fontSize:14, fontWeight:500, color:"var(--text)", lineHeight:1.5 }}>{q}</div>
        <div style={{ fontSize:18, color:"var(--accent)", flexShrink:0, lineHeight:1, transition:"transform 0.2s", transform:open?"rotate(45deg)":"none" }}>+</div>
      </div>
      {open && <p style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, margin:"12px 0 0", paddingRight:24 }}>{a}</p>}
    </div>
  )
}

function HeroSignalPanel() {
  const canvasRef = useRef(null)
  const [gi, setGi] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    const W = 480, H = 116, CH = 4, rowH = H / CH
    let t = 0, id

    function emg(x, time, seed) {
      const b = x * 0.1 + time * 0.043
      const burst = 0.35 + 0.35 * Math.abs(Math.sin(b * 0.062 + seed * 1.13))
      return (
        Math.sin(b * 7.9  + seed        ) * 0.44 +
        Math.sin(b * 14.7 + seed * 2.01 ) * 0.28 +
        Math.sin(b * 28.3 + seed * 3.17 ) * 0.18 +
        Math.sin(b * 59.1 + seed * 4.93 ) * 0.10
      ) * burst
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      ctx.strokeStyle = "rgba(255,255,255,0.04)"
      ctx.lineWidth = 1
      for (let c = 1; c < CH; c++) {
        ctx.beginPath(); ctx.moveTo(0, rowH * c); ctx.lineTo(W, rowH * c); ctx.stroke()
      }
      const cols = ["rgba(255,45,120,0.85)", "rgba(59,130,246,0.75)", "rgba(16,185,129,0.65)", "rgba(139,92,246,0.65)"]
      for (let c = 0; c < CH; c++) {
        const y0 = rowH * c + rowH / 2
        const amp = rowH * 0.37
        ctx.beginPath(); ctx.strokeStyle = cols[c]; ctx.lineWidth = 1.1
        for (let x = 0; x < W; x++) {
          const y = y0 + emg(x, t, c * 2.71) * amp
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.fillStyle = "rgba(255,255,255,0.2)"
        ctx.font = "9px monospace"
        ctx.fillText(`CH${String(c + 1).padStart(2, "0")}`, 8, rowH * c + 12)
      }
      t++
      id = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const iv = setInterval(() => setGi(g => (g + 1) % GESTURES.length), 2400)
    return () => clearInterval(iv)
  }, [])

  const g = GESTURES[gi]
  return (
    <div style={{ background:"rgba(255,255,255,0.035)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:12, overflow:"hidden" }}>
      <div style={{ padding:"10px 14px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:9, color:"rgba(255,255,255,0.35)", fontFamily:"monospace", letterSpacing:"0.06em" }}>sEMG · 4 of 16 ch shown · 200 Hz · Ninapro DB5</span>
        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          <div style={{ width:5, height:5, borderRadius:"50%", background:GREEN }}/>
          <span style={{ fontSize:8, color:"rgba(255,255,255,0.28)", fontFamily:"monospace", letterSpacing:"0.08em" }}>PREVIEW</span>
        </div>
      </div>
      <canvas ref={canvasRef} width={480} height={116} style={{ display:"block", width:"100%", height:116 }}/>
      <div style={{ padding:"11px 14px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(0,0,0,0.18)" }}>
        <div>
          <div style={{ fontSize:8, color:"rgba(255,255,255,0.28)", fontFamily:"monospace", marginBottom:3, letterSpacing:"0.08em" }}>PREDICTED CLASS</div>
          <div style={{ fontSize:13, fontWeight:700, color:g.color, fontFamily:"monospace", letterSpacing:"0.06em", transition:"color 0.3s" }}>{g.label}</div>
        </div>
        <div style={{ display:"flex", gap:20 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:8, color:"rgba(255,255,255,0.28)", fontFamily:"monospace", marginBottom:3, letterSpacing:"0.08em" }}>CONFIDENCE</div>
            <div style={{ fontSize:13, fontWeight:700, color:g.color, fontFamily:"monospace", transition:"color 0.3s" }}>{Math.round(g.conf * 100)}%</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:8, color:"rgba(255,255,255,0.28)", fontFamily:"monospace", marginBottom:3, letterSpacing:"0.08em" }}>LATENCY</div>
            <div style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.45)", fontFamily:"monospace" }}>&lt;5ms</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AccuracyRing() {
  const ref = useRef(null)
  const [drawn, setDrawn] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect() } }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    let startTs = null
    const duration = 1800
    let id = requestAnimationFrame(function tick(ts) {
      if (!startTs) startTs = ts
      const progress = Math.min((ts - startTs) / duration, 1)
      setDrawn(1 - Math.pow(1 - progress, 3))
      if (progress < 1) id = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(id)
  }, [started])

  const r = 76, circ = 2 * Math.PI * r, pct = 84.85
  const offset = circ * (1 - (pct / 100) * drawn)
  const disp = drawn >= 1 ? "84.85" : (pct * drawn).toFixed(0)

  return (
    <div ref={ref} style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"28px 24px" }}>
      <svg width={184} height={184} viewBox="0 0 184 184">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={PINK}/>
            <stop offset="100%" stopColor="#FF8AAB"/>
          </linearGradient>
        </defs>
        <circle cx={92} cy={92} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={10}/>
        <circle cx={92} cy={92} r={r} fill="none" stroke="url(#ringGrad)" strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 92 92)"/>
        <text x={92} y={86} textAnchor="middle" fill="#fff" fontSize={29} fontWeight={700} fontFamily="var(--font)" letterSpacing="-1">{disp}%</text>
        <text x={92} y={107} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize={11} fontFamily="var(--font)">cross-subject</text>
        <text x={92} y={122} textAnchor="middle" fill="rgba(255,255,255,0.28)" fontSize={9} fontFamily="var(--font)">LOSO · 10 subjects</text>
      </svg>
      <div style={{ fontSize:9, color:"rgba(255,255,255,0.22)", textTransform:"uppercase", letterSpacing:"0.14em", marginTop:4, textAlign:"center" }}>Ninapro DB5</div>
    </div>
  )
}

function GapViz() {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const rows = [
    { label:"Within-session",      sub:"same person, same session",               val:96.4,  color:GREEN,  bold:false },
    { label:"Cross-subject",        sub:"our result — 10 unseen subjects, LOSO",   val:84.85, color:PINK,   bold:true  },
    { label:"Real-world (est.)",    sub:"electrode shift · fatigue · co-contraction", val:70, color:AMBER,  bold:false },
  ]

  return (
    <div ref={ref} style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {rows.map((r, i) => (
        <div key={r.label} style={{ display:"grid", gridTemplateColumns:"176px 1fr 52px", gap:14, alignItems:"center" }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:13, color: r.bold ? "var(--text)" : "var(--text-secondary)", fontWeight: r.bold ? 600 : 300 }}>{r.label}</div>
            <div style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300 }}>{r.sub}</div>
          </div>
          <div style={{ height:9, background:"var(--border)", borderRadius:100, overflow:"visible", position:"relative" }}>
            <div style={{ height:"100%", background:r.color, borderRadius:100, width: vis ? `${r.val}%` : "0%", transition:`width 1.2s cubic-bezier(0.4,0,0.2,1) ${i * 0.12}s`, opacity: r.bold ? 1 : 0.7 }}/>
            {i === 0 && (
              <div style={{ position:"absolute", left:"95%", top:-3, bottom:-3, width:2, background:"rgba(239,68,68,0.55)", borderRadius:1 }}>
                <div style={{ position:"absolute", top:-18, left:6, fontSize:9, color:"rgba(239,68,68,0.65)", whiteSpace:"nowrap", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.04em" }}>95% clinical target</div>
              </div>
            )}
          </div>
          <div style={{ fontSize:14, fontWeight: r.bold ? 700 : 400, color:r.color }}>{r.val}%</div>
        </div>
      ))}
    </div>
  )
}

const ROTATE_WORDS = ["gesture recognition", "muscle sensing", "neural interfaces", "signal classification", "bioelectric control"]

function RotatingText() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setIdx(p => (p + 1) % ROTATE_WORDS.length); setVisible(true) }, 280)
    }, 2600)
    return () => clearInterval(t)
  }, [])
  return (
    <span style={{
      color: PINK,
      display: "inline-block",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(-10px)",
      transition: "opacity 0.28s ease, transform 0.28s ease",
    }}>
      {ROTATE_WORDS[idx]}
    </span>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const todaysRead = useMemo(() => {
    const day = Math.floor(Date.now() / 86400000)
    return ALL_READS[day % ALL_READS.length]
  }, [])

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes blink  { 0%,100%{opacity:1} 49%{opacity:1} 50%{opacity:0} }
      `}</style>
      <Navbar />

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", background:"#030012" }}>
        <div style={{ position:"absolute", inset:0, zIndex:0, opacity:0.4 }}>
          <Threads color={[1, 0.18, 0.47]} amplitude={2.6} distance={0} enableMouseInteraction={false}/>
        </div>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 65% 55% at 15% 50%, rgba(255,45,120,0.09) 0%, transparent 70%)", zIndex:1, pointerEvents:"none" }}/>
        <div style={{ maxWidth:1000, margin:"0 auto", padding:"120px 32px 100px", position:"relative", zIndex:3, width:"100%" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 420px", gap:56, alignItems:"center" }}>
            {/* Left — text */}
            <div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,45,120,0.2)", borderRadius:100, padding:"5px 16px", fontSize:12, color:"rgba(255,255,255,0.65)", fontFamily:"monospace", marginBottom:32, animation:"fadeUp 0.5s ease" }}>
                <span style={{ width:6, height:6, borderRadius:"50%", background:PINK, display:"inline-block", animation:"pulse 2s infinite" }}/>
                MIT License · Open source · Ninapro DB5
              </div>

              <h1 style={{ fontSize:"clamp(36px,5.5vw,68px)", fontWeight:700, letterSpacing:"-2.5px", lineHeight:1.08, color:"#fff", marginBottom:24, animation:"fadeUp 0.5s 0.08s ease both" }}>
                Open-source EMG<br/>
                <RotatingText /><br/>
                that generalises.
              </h1>

              <p style={{ fontSize:"clamp(15px,1.8vw,18px)", color:"rgba(255,255,255,0.62)", fontWeight:300, lineHeight:1.8, maxWidth:520, marginBottom:14, animation:"fadeUp 0.5s 0.16s ease both" }}>
                {t("landing_sub")}
              </p>

              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:40, animation:"fadeUp 0.5s 0.22s ease both" }}>
                {[
                  { k:"84.85%", v:"cross-subject accuracy" },
                  { k:"16,269", v:"training windows" },
                  { k:"64",     v:"features per window" },
                ].map(d => (
                  <div key={d.k} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"7px 14px", display:"flex", gap:6, alignItems:"baseline" }}>
                    <span style={{ fontSize:15, fontWeight:700, color:PINK, fontFamily:"monospace" }}>{d.k}</span>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", fontFamily:"monospace" }}>{d.v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", gap:12, flexWrap:"wrap", animation:"fadeUp 0.5s 0.28s ease both" }}>
                <button onClick={()=>navigate("/education")} style={{ background:PINK, color:"#fff", border:"none", borderRadius:100, padding:"14px 36px", fontSize:15, fontFamily:"var(--font)", fontWeight:600, cursor:"pointer", boxShadow:"0 4px 24px rgba(255,45,120,0.35)", transition:"transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow="0 8px 32px rgba(255,45,120,0.5)"}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 24px rgba(255,45,120,0.35)"}}
                >{t("landing_try")}</button>
                <button onClick={()=>navigate("/research")} style={{ background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.82)", border:"1px solid rgba(255,255,255,0.13)", borderRadius:100, padding:"14px 28px", fontSize:15, fontFamily:"var(--font)", fontWeight:400, cursor:"pointer", transition:"border-color 0.2s, background 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,45,120,0.4)";e.currentTarget.style.background="rgba(255,255,255,0.11)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.13)";e.currentTarget.style.background="rgba(255,255,255,0.07)"}}
                >Read the research →</button>
              </div>
            </div>

            {/* Right — live signal panel */}
            <div style={{ animation:"fadeUp 0.5s 0.34s ease both" }}>
              <HeroSignalPanel />
              <div style={{ marginTop:10, fontSize:10, color:"rgba(255,255,255,0.22)", textAlign:"center", fontFamily:"monospace", letterSpacing:"0.05em" }}>
                Animated preview — Ninapro DB5 waveform characteristics · github.com/Jaden300/myojam
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROVENANCE BAR ─────────────────────────────────────────── */}
      <div style={{ background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)", padding:"12px 32px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto", display:"flex", gap:32, alignItems:"center", flexWrap:"wrap" }}>
          {[
            { label:"Dataset", value:"Ninapro DB5",       href:"https://ninapro.hevs.ch" },
            { label:"License",  value:"MIT",              href:"https://github.com/Jaden300/myojam/blob/main/LICENSE" },
            { label:"Method",   value:"LOSO cross-validation", href:"/research/paper" },
            { label:"Hardware", value:"Delsys Trigno, 16-ch sEMG", href:null },
            { label:"Stack", value:"Python · PyQt6 · scikit-learn", href:null },
          ].map(p => (
            <div key={p.label} style={{ display:"flex", gap:6, alignItems:"center" }}>
              <span style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300, fontFamily:"monospace" }}>{p.label}:</span>
              {p.href ? (
                <a href={p.href} target={p.href.startsWith("http")?"_blank":"_self"} rel="noreferrer" style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textDecoration:"none", fontFamily:"monospace" }}>{p.value}</a>
              ) : (
                <span style={{ fontSize:11, fontWeight:500, color:"var(--text-secondary)", fontFamily:"monospace" }}>{p.value}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ──────────────────────────────────────────────────── */}
      <section style={{ background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <StaggerList items={STATS} columns={4} gap={0} renderItem={(s,i)=>(
            <div style={{ padding:"32px 24px", textAlign:"center", borderRight: i<3?"1px solid var(--border)":"none" }}>
              <div style={{ fontSize:32, fontWeight:700, color:"var(--accent)", letterSpacing:"-1.5px", marginBottom:6 }}>{s.val}</div>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.4 }}>{s.sub}</div>
            </div>
          )}/>
        </div>
      </section>

      {/* ── DEMOS ──────────────────────────────────────────────────── */}
      <section style={{ padding:"72px 32px", borderBottom:"1px solid var(--border)", background:"var(--bg)" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <Reveal>
            <SectionPill><IconGame size={11} color="var(--accent)"/> Try it now</SectionPill>
            <h2 style={{ fontSize:"clamp(28px,4vw,46px)", fontWeight:800, letterSpacing:"-1.5px", color:"var(--text)", marginBottom:10 }}>
              Don't just read about it.
            </h2>
            <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, marginBottom:44, maxWidth:440 }}>
              Five experiments running in your browser right now. No hardware, no install, no signup.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            {/* 3 featured cards */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:14 }}>
              {[
                {
                  grad:"linear-gradient(135deg,#FF2D78 0%,#F97316 100%)",
                  Icon:IconBrain, badge:"NEW",
                  title:"Signal Guesser",
                  desc:"5 rounds. Real EMG data. Can you out-guess a Random Forest?",
                  cta:"Play →", slug:"/guess",
                },
                {
                  grad:"linear-gradient(135deg,#2563EB 0%,#7C3AED 100%)",
                  Icon:IconBolt, badge:"LIVE",
                  title:"Signal Playground",
                  desc:"Draw any waveform with your mouse. Watch MAV, RMS, ZC, WL update as you draw.",
                  cta:"Draw →", slug:"/playground",
                },
                {
                  grad:"linear-gradient(135deg,#D97706 0%,#F59E0B 100%)",
                  Icon:IconTarget, badge:"GAME",
                  title:"Gesture Game",
                  desc:"A target gesture appears — match it before time runs out. Three difficulty levels.",
                  cta:"Play →", slug:"/game",
                },
              ].map(card => (
                <div key={card.slug}
                  onClick={()=>navigate(card.slug)}
                  style={{ background:card.grad, borderRadius:20, padding:"26px 22px", cursor:"pointer", transition:"transform 0.2s,box-shadow 0.2s", position:"relative", overflow:"hidden" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-5px) scale(1.01)";e.currentTarget.style.boxShadow="0 24px 56px rgba(0,0,0,0.32)"}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0) scale(1)";e.currentTarget.style.boxShadow="none"}}
                >
                  {/* Decorative circle */}
                  <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.08)", pointerEvents:"none" }}/>
                  <div style={{ background:"rgba(255,255,255,0.22)", borderRadius:100, padding:"3px 10px", fontSize:10, color:"#fff", fontWeight:700, letterSpacing:"0.04em", display:"inline-block", marginBottom:14 }}>{card.badge}</div>
                  <div style={{ marginBottom:16, display:"flex" }}><card.Icon size={44} color="rgba(255,255,255,0.9)"/></div>
                  <div style={{ fontSize:20, fontWeight:800, color:"#fff", letterSpacing:"-0.4px", marginBottom:8 }}>{card.title}</div>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.82)", fontWeight:300, lineHeight:1.65, margin:"0 0 20px" }}>{card.desc}</p>
                  <button
                    onClick={e=>{e.stopPropagation();navigate(card.slug)}}
                    style={{ background:"rgba(255,255,255,0.95)", color:"#111", border:"none", borderRadius:100, padding:"8px 18px", fontSize:12, fontWeight:800, cursor:"pointer", fontFamily:"var(--font)", letterSpacing:"0.01em" }}>
                    {card.cta}
                  </button>
                </div>
              ))}
            </div>

            {/* Secondary strip */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
              <span style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300, marginRight:2 }}>More tools →</span>
              {[
                { label:"Pipeline Explorer", slug:"/pipeline", color:PINK   },
                { label:"Confusion Matrix",  slug:"/confusion",color:BLUE   },
                { label:"Frequency Analyzer",slug:"/frequency",color:PURPLE },
                { label:"Live Signal",        slug:"/signal",   color:GREEN  },
                { label:"MyoCode",            slug:"/myocode",  color:AMBER  },
              ].map(t=>(
                <button key={t.slug} onClick={()=>navigate(t.slug)}
                  style={{ background:"none", border:"1px solid var(--border)", borderRadius:100, padding:"5px 14px", fontSize:12, color:"var(--text-secondary)", cursor:"pointer", fontFamily:"var(--font)", transition:"border-color 0.15s,color 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=t.color;e.currentTarget.style.color=t.color}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-secondary)"}}>
                  {t.label}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TODAY'S READ ───────────────────────────────────────────── */}
      <section style={{ padding:"0 32px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto", padding:"24px 0" }}>
          <Reveal>
            <div
              onClick={()=>navigate(todaysRead.slug)}
              style={{ display:"flex", alignItems:"center", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderLeft:`3px solid ${PINK}`, borderRadius:"var(--radius)", overflow:"hidden", cursor:"pointer", transition:"box-shadow 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 20px rgba(255,45,120,0.08)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}
            >
              <div style={{ padding:"16px 20px", borderRight:"1px solid var(--border)", flexShrink:0 }}>
                <div style={{ fontSize:9, fontWeight:700, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.15em", whiteSpace:"nowrap" }}>Today's Read</div>
                <div style={{ fontSize:9, color:"var(--text-tertiary)", fontWeight:300, marginTop:2, whiteSpace:"nowrap" }}>Rotates daily</div>
              </div>
              <div style={{ flex:1, padding:"16px 20px", minWidth:0 }}>
                <div style={{ display:"flex", gap:8, marginBottom:5, alignItems:"center" }}>
                  <span style={{ fontSize:10, fontWeight:500, color:"var(--accent)", background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.15)", borderRadius:100, padding:"2px 9px", flexShrink:0 }}>{todaysRead.tag}</span>
                  <span style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300 }}>{todaysRead.time} read</span>
                </div>
                <div style={{ fontSize:14, fontWeight:600, color:"var(--text)", marginBottom:2 }}>{todaysRead.title}</div>
                <div style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{todaysRead.desc}</div>
              </div>
              <div style={{ padding:"16px 20px", flexShrink:0, fontSize:16, color:"var(--accent)", opacity:0.7 }}>→</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── THE CROSS-SUBJECT GAP ──────────────────────────────────── */}
      <section style={{ padding:"80px 32px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"start" }}>
            <Reveal>
              <SectionPill>The core problem</SectionPill>
              <h2 style={{ fontSize:"clamp(26px,3.5vw,40px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", lineHeight:1.1, marginBottom:20 }}>
                The 11-point<br/>gap.
              </h2>
              <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.8, marginBottom:16 }}>
                A gesture classifier trained and tested on the same person reaches ~96% accuracy. Test it on someone new — different forearm anatomy, different electrode placement — and it drops to 84.85%.
              </p>
              <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.8, marginBottom:24 }}>
                That 11-percentage-point gap is not a bug. It is the fundamental challenge of sEMG-based control: muscle morphology, subcutaneous fat thickness, and electrode position vary enough across individuals to dramatically shift the signal distribution the model learned from.
              </p>
              <p style={{ fontSize:14, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.7 }}>
                myojam documents this honestly. The 84.85% figure is a leave-one-subject-out (LOSO) result — the hardest standard metric — not an inflated within-session number.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"32px 28px" }}>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:28 }}>Accuracy by evaluation regime</div>
                <GapViz />
                <div style={{ marginTop:24, padding:"14px 16px", background:"var(--bg)", border:"1px solid var(--border)", borderLeft:`3px solid ${AMBER}`, borderRadius:"0 8px 8px 0" }}>
                  <div style={{ fontSize:11, fontWeight:600, color:AMBER, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>Why clinical use is hard</div>
                  <div style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.6 }}>
                    Prosthetic devices typically require ≥95% to be clinically viable. Real-world placement variability, limb position, and fatigue push the true deployment figure further below that threshold.
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── NINAPRO DB5 DATASET ────────────────────────────────────── */}
      <section style={{ background:"var(--bg-secondary)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", padding:"80px 32px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <Reveal>
            <SectionPill>Source data</SectionPill>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,40px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", marginBottom:8 }}>
              Ninapro DB5.
            </h2>
            <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, maxWidth:600, marginBottom:48 }}>
              The Non-Invasive Adaptive Prosthetics database is the publicly available benchmark dataset underpinning this work. Every number on this site traces back to it.
            </p>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
            <Reveal>
              <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"var(--radius)", overflow:"hidden" }}>
                <div style={{ padding:"16px 24px", borderBottom:"1px solid var(--border)", background:"rgba(255,45,120,0.04)" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.1em" }}>Dataset specification</div>
                </div>
                <div style={{ padding:"0" }}>
                  {[
                    { k:"Subjects",     v:"10 intact (6 male, 4 female)" },
                    { k:"Age",          v:"27.6 ± 4.5 years" },
                    { k:"Hardware",     v:"Delsys Trigno Wireless EMG" },
                    { k:"Channels",     v:"16 surface electrodes" },
                    { k:"Sample rate",  v:"200 Hz (processed)" },
                    { k:"Gestures",     v:"52 total — 6 used in this work" },
                    { k:"Repetitions",  v:"10 per gesture per subject" },
                    { k:"License",      v:"Academic use — publicly available" },
                  ].map((r, i) => (
                    <div key={r.k} style={{ display:"grid", gridTemplateColumns:"140px 1fr", borderBottom: i < 7 ? "1px solid var(--border)" : "none" }}>
                      <div style={{ padding:"12px 24px", borderRight:"1px solid var(--border)", fontSize:12, color:"var(--text-tertiary)", fontWeight:600, fontFamily:"monospace" }}>{r.k}</div>
                      <div style={{ padding:"12px 20px", fontSize:13, color:"var(--text)", fontWeight:300 }}>{r.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <Reveal delay={0.1}>
                <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"24px" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>The 6 gestures we use</div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                    {[
                      { g:"Index flex",  acc:88, color:PINK   },
                      { g:"Fist",        acc:87, color:RED    },
                      { g:"Thumb flex",  acc:87, color:AMBER  },
                      { g:"Middle flex", acc:83, color:BLUE   },
                      { g:"Pinky flex",  acc:82, color:GREEN  },
                      { g:"Ring flex",   acc:80, color:PURPLE },
                    ].map(r => (
                      <div key={r.g} style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:8, height:8, borderRadius:"50%", background:r.color, flexShrink:0 }}/>
                        <div style={{ fontSize:12, color:"var(--text-secondary)", flex:1, fontWeight:300 }}>{r.g}</div>
                        <div style={{ fontSize:12, fontWeight:600, color:r.color }}>{r.acc}%</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:14, fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>Gestures chosen for biomechanical distinctiveness and assistive-tech utility.</div>
                </div>
              </Reveal>

              <Reveal delay={0.15}>
                <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"20px 24px" }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Citation</div>
                  <div style={{ fontSize:11, color:"var(--text-secondary)", fontFamily:"monospace", lineHeight:1.8, fontWeight:300 }}>
                    Atzori, M. et al. (2014).<br/>
                    <span style={{ color:"var(--text)", fontWeight:500 }}>Electromyography data for non-invasive<br/>naturally-controlled robotic hand prostheses.</span><br/>
                    <span style={{ color:BLUE }}>Scientific Data, 1, 140053.</span><br/>
                    doi: 10.1038/sdata.2014.53
                  </div>
                  <a href="https://ninapro.hevs.ch" target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:6, marginTop:12, fontSize:12, color:"var(--accent)", textDecoration:"none", fontWeight:500 }}>
                    ninapro.hevs.ch <span style={{ fontSize:10 }}>↗</span>
                  </a>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── SIGNAL PIPELINE ────────────────────────────────────────── */}
      <section style={{ padding:"80px 32px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <Reveal>
            <SectionPill>{t("how_label")}</SectionPill>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,40px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", marginBottom:8 }}>
              {t("how_title")}
            </h2>
            <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, maxWidth:560, marginBottom:48 }}>
              Five deterministic steps separate raw muscle voltage from a gesture label. Every parameter is fixed and documented.
            </p>
          </Reveal>

          {/* Horizontal pipeline flow */}
          <Reveal>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:2, marginBottom:40 }}>
              {PIPELINE_STEPS.map((s, i) => (
                <div key={s.n} style={{ position:"relative" }}>
                  <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius: i === 0 ? "var(--radius) 0 0 0" : i === 4 ? "0 var(--radius) 0 0" : "0", padding:"20px 18px", height:"100%", boxSizing:"border-box" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"var(--accent)", fontFamily:"monospace", marginBottom:10, letterSpacing:"0.08em" }}>{s.n}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:6 }}>{s.title}</div>
                    <div style={{ fontSize:10, fontWeight:600, color:"var(--text-tertiary)", fontFamily:"monospace", marginBottom:10, letterSpacing:"0.04em" }}>{s.params}</div>
                  </div>
                  {i < 4 && (
                    <div style={{ position:"absolute", right:-8, top:"50%", transform:"translateY(-50%)", zIndex:10, fontSize:14, color:"var(--text-tertiary)", background:"var(--bg)", padding:"2px 0" }}>→</div>
                  )}
                </div>
              ))}
            </div>
          </Reveal>

          {/* Pipeline step details */}
          <StaggerList items={PIPELINE_STEPS} columns={2} gap={12} renderItem={(s, i) => (
            <HoverCard style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"22px 24px" }}>
              <div style={{ display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--accent-soft)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"var(--accent)", fontFamily:"monospace", flexShrink:0 }}>{s.n}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:600, color:"var(--text)", marginBottom:4 }}>{s.title}</div>
                  <div style={{ fontSize:11, color:"var(--accent)", fontFamily:"monospace", fontWeight:500, marginBottom:8 }}>{s.params}</div>
                  <p style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, margin:0 }}>{s.detail}</p>
                </div>
              </div>
            </HoverCard>
          )}/>
          <Reveal>
            <div style={{ marginTop:20, textAlign:"center" }}>
              <button onClick={()=>navigate("/how-it-works")} style={{ background:"none", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 28px", fontSize:14, color:"var(--text-secondary)", fontFamily:"var(--font)", cursor:"pointer", transition:"border-color 0.15s, color 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.color="var(--accent)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-mid)";e.currentTarget.style.color="var(--text-secondary)"}}
              >Full technical walkthrough →</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURE ENGINEERING ────────────────────────────────────── */}
      <section style={{ background:"var(--bg-secondary)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", padding:"80px 32px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <Reveal>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"start" }}>
              <div>
                <SectionPill>Feature engineering</SectionPill>
                <h2 style={{ fontSize:"clamp(26px,3.5vw,40px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", marginBottom:20 }}>
                  64 features.<br/>4 × 16 channels.
                </h2>
                <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.8, marginBottom:24 }}>
                  Every 200-sample window is compressed to 64 numbers before classification — four time-domain features computed independently for each of the 16 electrode channels.
                </p>
                <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.8 }}>
                  This is the <span style={{ color:"var(--text)", fontWeight:500 }}>Hudgins feature set</span>, first proposed in 1993 and still competitive in 2025. Its strength: interpretable, fast to compute, robust to moderate noise, and well-suited to Random Forest ensemble learning.
                </p>
              </div>
              <div>
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {[
                    { abbr:"MAV", name:"Mean Absolute Value",   color:PINK,   desc:"Proxy for overall muscle activation level. Average rectified signal amplitude across the window." },
                    { abbr:"RMS", name:"Root Mean Square",       color:BLUE,   desc:"Particularly sensitive to constant-force isometric contractions. Related to physiological muscle force." },
                    { abbr:"ZC",  name:"Zero Crossings",         color:GREEN,  desc:"Number of times the signal crosses zero. Reflects the dominant frequency content of the EMG burst." },
                    { abbr:"WL",  name:"Waveform Length",         color:PURPLE, desc:"Cumulative length of the signal waveform. Combines frequency and amplitude into one complexity measure." },
                  ].map(f => (
                    <div key={f.abbr} style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:10, padding:"16px 18px", display:"grid", gridTemplateColumns:"48px 1fr", gap:14, alignItems:"flex-start" }}>
                      <div style={{ width:40, height:40, borderRadius:10, background:`${f.color}18`, border:`1px solid ${f.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"monospace", fontSize:11, fontWeight:700, color:f.color, letterSpacing:"0.04em" }}>{f.abbr}</div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:4 }}>{f.name}</div>
                        <div style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.6 }}>{f.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:12, padding:"12px 16px", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8 }}>
                  <div style={{ fontSize:10, fontFamily:"monospace", color:"var(--text-tertiary)", marginBottom:8 }}>4 features × 16 channels =</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                    {Array.from({length:16}, (_,i) => ["MAV","RMS","ZC","WL"].map(f => (
                      <span key={`${f}${i}`} style={{ fontSize:8, fontFamily:"monospace", color:"var(--text-tertiary)", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:3, padding:"1px 4px" }}>{f}{String(i+1).padStart(2,"0")}</span>
                    ))).flat()}
                  </div>
                  <div style={{ marginTop:8, fontSize:10, fontFamily:"monospace", color:"var(--accent)" }}>= 64 features per window</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 3D SIGNAL MODEL ────────────────────────────────────────── */}
      <SignalModel3D />

      {/* ── KEY FINDINGS ───────────────────────────────────────────── */}
      <section style={{ background:"var(--bg-secondary)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", padding:"80px 32px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <Reveal>
            <SectionPill>Results</SectionPill>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,40px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", marginBottom:12 }}>
              What the data shows.
            </h2>
            <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, maxWidth:520, marginBottom:48 }}>
              Every number below is from LOSO cross-validation on Ninapro DB5 — the model tested on subjects it was never trained on.
            </p>
          </Reveal>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            {/* Accuracy ring + per-gesture bars */}
            <Reveal>
              <div style={{ background:"var(--bg)", borderRadius:"var(--radius)", border:"1px solid var(--border)", overflow:"hidden", height:"100%" }}>
                <div style={{ background:"#030012", borderBottom:"1px solid rgba(255,45,120,0.14)", display:"flex", justifyContent:"center" }}>
                  <AccuracyRing />
                </div>
                <div style={{ padding:"22px 26px" }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>Per-gesture recall (cross-subject)</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                    {[
                      { label:"Index flex",  val:88, color:PINK   },
                      { label:"Fist",        val:87, color:RED    },
                      { label:"Thumb flex",  val:87, color:AMBER  },
                      { label:"Middle flex", val:83, color:BLUE   },
                      { label:"Pinky flex",  val:82, color:GREEN  },
                      { label:"Ring flex",   val:80, color:PURPLE },
                    ].map(r => (
                      <div key={r.label} style={{ display:"flex", alignItems:"center", gap:12 }}>
                        <div style={{ width:80, fontSize:12, color:"var(--text-secondary)", fontWeight:300, textAlign:"right", flexShrink:0 }}>{r.label}</div>
                        <div style={{ flex:1, height:6, background:"var(--border)", borderRadius:100, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${r.val}%`, background:r.color, borderRadius:100 }}/>
                        </div>
                        <div style={{ width:36, fontSize:12, fontWeight:600, color:r.color, flexShrink:0 }}>{r.val}%</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:14, fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>Mean: 84.85%  ·  LOSO  ·  10 subjects  ·  16,269 windows</div>
                </div>
              </div>
            </Reveal>

            {/* Classifier comparison + callouts */}
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <Reveal>
                <div style={{ background:"var(--bg)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"22px 26px" }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>Classifier comparison (LOSO)</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
                    {[
                      { name:"Random Forest", val:84.85, color:PINK,   best:true  },
                      { name:"SVM (RBF)",     val:82.30, color:BLUE,   best:false },
                      { name:"k-NN",          val:76.40, color:AMBER,  best:false },
                      { name:"LDA",           val:71.80, color:"#AEAEB2", best:false },
                    ].map(c => (
                      <div key={c.name} style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:104, fontSize:12, color: c.best ? "var(--text)" : "var(--text-secondary)", fontWeight: c.best ? 600 : 300, flexShrink:0 }}>{c.name}</div>
                        <div style={{ flex:1, height:5, background:"var(--border)", borderRadius:100, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${(c.val/90)*100}%`, background:c.color, borderRadius:100 }}/>
                        </div>
                        <div style={{ width:44, fontSize:12, fontWeight: c.best ? 700 : 300, color:c.color, flexShrink:0 }}>{c.val}%</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:12, fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>Same features · Same LOSO split · Same Ninapro DB5 data</div>
                </div>
              </Reveal>

              {[
                { label:"Cross-subject gap", val:"84.85% vs ~96%", sub:"Cross-subject vs. within-session — the 11 pp reality of real-world sEMG deployment", color:AMBER },
                { label:"Inference speed",   val:"< 5 ms",         sub:"Per window on a standard laptop CPU. No GPU required, no network round-trips.", color:GREEN  },
                { label:"Window budget",     val:"200 samples",    sub:"At 200 Hz = 1 second per window. Chosen to maximise accuracy over prosthetic latency.", color:BLUE  },
              ].map((item, i) => (
                <Reveal key={item.label} delay={i * 0.05}>
                  <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderLeft:`3px solid ${item.color}`, borderRadius:"0 var(--radius) var(--radius) 0", padding:"14px 18px" }}>
                    <div style={{ fontSize:10, fontWeight:600, color:item.color, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:3 }}>{item.label}</div>
                    <div style={{ fontSize:18, fontWeight:700, color:"var(--text)", letterSpacing:"-0.5px", marginBottom:3 }}>{item.val}</div>
                    <div style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.5 }}>{item.sub}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal>
            <div style={{ marginTop:24, textAlign:"center" }}>
              <button onClick={() => navigate("/research")} style={{ background:"none", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 28px", fontSize:14, color:"var(--text-secondary)", fontFamily:"var(--font)", cursor:"pointer", transition:"border-color 0.15s, color 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.color="var(--accent)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-mid)";e.currentTarget.style.color="var(--text-secondary)"}}
              >Read the full research →</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PILLARS ────────────────────────────────────────────────── */}
      <section style={{ padding:"80px 32px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <Reveal>
            <SectionPill>{t("pillars_label")}</SectionPill>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,40px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", marginBottom:12 }}>
              {t("pillars_title")}
            </h2>
            <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, maxWidth:520, marginBottom:48 }}>
              {t("pillars_sub")}
            </p>
          </Reveal>
          <StaggerList items={PILLARS} columns={2} gap={16} renderItem={p=>(
            <HoverCard color={`${p.color}20`} onClick={()=>navigate(p.slug)} style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", overflow:"hidden", cursor:"pointer" }}>
              <div style={{ background:`linear-gradient(135deg, ${p.color}10 0%, transparent 100%)`, borderBottom:"1px solid var(--border)", padding:"28px 28px 22px" }}>
                <div style={{ width:50, height:50, borderRadius:13, background:`${p.color}18`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}><p.icon size={22} color={p.color}/></div>
                <div style={{ fontSize:10, fontWeight:600, color:p.color, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>{p.sub}</div>
                <h3 style={{ fontSize:19, fontWeight:600, color:"var(--text)", letterSpacing:"-0.3px", marginBottom:10 }}>{p.title}</h3>
                <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, margin:0 }}>{p.desc}</p>
              </div>
              <div style={{ padding:"14px 28px", display:"flex", justifyContent:"flex-end" }}>
                <span style={{ fontSize:13, fontWeight:500, color:p.color }}>Explore →</span>
              </div>
            </HoverCard>
          )}/>
        </div>
      </section>

      {/* ── RECENT ARTICLES ────────────────────────────────────────── */}
      <section style={{ background:"var(--bg-secondary)", borderTop:"1px solid var(--border)", padding:"80px 32px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <Reveal>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:40, gap:16, flexWrap:"wrap" }}>
              <div>
                <SectionPill>{t("articles_label")}</SectionPill>
                <h2 style={{ fontSize:"clamp(26px,3.5vw,40px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", marginBottom:0 }}>{t("articles_title")}</h2>
              </div>
              <button onClick={()=>navigate("/education")} style={{ background:"none", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:14, color:"var(--text-secondary)", fontFamily:"var(--font)", cursor:"pointer", transition:"border-color 0.15s, color 0.15s", flexShrink:0 }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.color="var(--accent)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-mid)";e.currentTarget.style.color="var(--text-secondary)"}}
              >{t("articles_all")}</button>
            </div>
          </Reveal>
          <StaggerList items={ARTICLES} columns={2} gap={12} renderItem={a=>(
            <HoverCard onClick={()=>navigate(a.slug)} style={{ background:"var(--bg)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"22px 26px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                  <span style={{ fontSize:10, fontWeight:500, color:"var(--accent)", background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.15)", borderRadius:100, padding:"2px 9px" }}>{a.tag}</span>
                  <span style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300, alignSelf:"center" }}>{a.time}</span>
                </div>
                <div style={{ fontSize:14, fontWeight:600, color:"var(--text)", lineHeight:1.4 }}>{a.title}</div>
              </div>
              <span style={{ fontSize:15, color:"var(--text-tertiary)", flexShrink:0, marginTop:2 }}>→</span>
            </HoverCard>
          )}/>
        </div>
      </section>

      {/* ── OPEN SOURCE ────────────────────────────────────────────── */}
      <section style={{ padding:"80px 32px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <Reveal>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"start" }}>
              <div>
                <SectionPill>Open source</SectionPill>
                <h2 style={{ fontSize:"clamp(26px,3.5vw,40px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", marginBottom:20 }}>
                  Everything is public.
                </h2>
                <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.8, marginBottom:20 }}>
                  The classifier, desktop app, website, research reports, lesson plans, and preprocessed data are all published under the MIT license. Fork it, build on it, cite it.
                </p>
                <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.8, marginBottom:32 }}>
                  The training pipeline is fully reproducible: clone the repo, run <code style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:4, padding:"1px 6px", fontSize:13, fontFamily:"monospace", color:"var(--accent)" }}>train.py</code>, and you get the same model weights and LOSO accuracy reported here.
                </p>
                <a href="https://github.com/Jaden300/myojam" target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:10, background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:100, padding:"12px 24px", textDecoration:"none", transition:"border-color 0.2s, transform 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,45,120,0.3)";e.currentTarget.style.transform="translateY(-2px)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="translateY(0)"}}
                >
                  <i className="fab fa-github" style={{ fontSize:16, color:"var(--text)" }}/>
                  <span style={{ fontSize:14, fontWeight:500, color:"var(--text)" }}>github.com/Jaden300/myojam</span>
                  <span style={{ fontSize:11, color:"var(--text-tertiary)" }}>↗</span>
                </a>
              </div>

              <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"var(--radius)", overflow:"hidden" }}>
                <div style={{ padding:"12px 18px", borderBottom:"1px solid var(--border)", display:"flex", gap:8, alignItems:"center" }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:RED }}/>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:AMBER }}/>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:GREEN }}/>
                  <span style={{ fontSize:11, color:"var(--text-tertiary)", fontFamily:"monospace", marginLeft:8 }}>myojam/</span>
                </div>
                <div style={{ padding:"18px 20px", fontFamily:"monospace", fontSize:12, lineHeight:2.1 }}>
                  {[
                    { indent:0, name:"classifier/",           color:"var(--accent)",       type:"dir"  },
                    { indent:1, name:"model.pkl",             color:"var(--text-secondary)", note:"Random Forest · 500 trees · 64 features" },
                    { indent:1, name:"feature_extraction.py", color:"var(--text-secondary)", note:"Hudgins set · MAV RMS ZC WL × 16 ch" },
                    { indent:1, name:"train.py",              color:"var(--text-secondary)", note:"LOSO cross-validation · Ninapro DB5" },
                    { indent:1, name:"evaluate.py",           color:"var(--text-secondary)", note:"Reproduces the 84.85% result" },
                    { indent:0, name:"desktop/",             color:BLUE,                   type:"dir"  },
                    { indent:1, name:"...",                   color:"var(--text-tertiary)", note:"Electron + Python · macOS, Windows, Linux" },
                    { indent:0, name:"frontend/",            color:GREEN,                  type:"dir"  },
                    { indent:1, name:"...",                   color:"var(--text-tertiary)", note:"React + Vite · this website" },
                    { indent:0, name:"LICENSE",              color:AMBER,                  note:"MIT" },
                  ].map((f, i) => (
                    <div key={i} style={{ display:"flex", gap:8, alignItems:"baseline" }}>
                      <span style={{ userSelect:"none", color:"var(--text-tertiary)", fontSize:11 }}>{"  ".repeat(f.indent)}{f.indent > 0 ? "├── " : ""}</span>
                      <span style={{ color:f.color, fontWeight: f.type === "dir" ? 600 : 300 }}>{f.name}</span>
                      {f.note && <span style={{ color:"var(--text-tertiary)", fontSize:10, fontWeight:300 }}>  # {f.note}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── SOCIAL ─────────────────────────────────────────────────── */}
      <section style={{ padding:"0 32px", marginBottom:0 }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <Reveal>
            <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"28px 36px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:24, flexWrap:"wrap" }}>
              <div>
                <div style={{ fontSize:9, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:6 }}>Follow the project</div>
                <div style={{ fontSize:15, fontWeight:600, color:"var(--text)", letterSpacing:"-0.3px" }}>Stay connected as myojam grows.</div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                {[
                  { icon:"fab fa-github",      href:"https://github.com/Jaden300/myojam",          label:"GitHub"    },
                  { icon:"fab fa-linkedin-in", href:"https://www.linkedin.com/company/myojam/",     label:"LinkedIn"  },
                  { icon:"fab fa-instagram",   href:"https://www.instagram.com/myojam_official/",   label:"Instagram" },
                  { icon:"fab fa-x-twitter",   href:"https://x.com/myojam_official",                label:"X"         },
                  { icon:"fab fa-tiktok",      href:"https://www.tiktok.com/@myojam_official",       label:"TikTok"    },
                  { icon:"fab fa-youtube",     href:"https://www.youtube.com/@myojam-official",      label:"YouTube"   },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label} style={{ width:42, height:42, borderRadius:"50%", border:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--text-secondary)", fontSize:15, background:"var(--bg)", transition:"all 0.2s" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.color="var(--accent)";e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 8px 20px rgba(255,45,120,0.2)"}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-secondary)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}
                  ><i className={s.icon}/></a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section style={{ padding:"64px 32px 0" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <Reveal>
            <SectionPill>Common questions</SectionPill>
            <h2 style={{ fontSize:"clamp(24px,3.5vw,36px)", fontWeight:600, letterSpacing:"-1px", color:"var(--text)", marginBottom:40 }}>Frequently asked.</h2>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(400px, 1fr))", gap:2, border:"1px solid var(--border)", borderRadius:"var(--radius)", overflow:"hidden" }}>
            {[
              { q:"Do I need EMG hardware to use myojam?",         a:"No. All four browser tools — Signal Playground, Frequency Analyzer, Confusion Matrix Explorer, and Gesture Reaction Game — run entirely in your browser using real Ninapro DB5 data. The desktop app requires a MyoWare 2.0 sensor and Arduino, but the website works without any hardware." },
              { q:'What does "84.85% accuracy" actually mean?',    a:'It\'s cross-subject accuracy: the model was trained on 9 subjects and tested on the 10th, repeated across all 10 subjects (leave-one-subject-out, LOSO). The 84.85% is the mean across all 10 folds. It reflects how the classifier performs on people it has never seen — the realistic, hard metric.' },
              { q:"What gestures does myojam recognize?",           a:"Six hand gestures: index finger flex, middle finger flex, ring finger flex, pinky finger flex, thumb flex, and full fist. These were chosen for biomechanical distinctiveness and natural mapping to computer control actions like scroll, click, and navigate." },
              { q:"Is myojam free? Can I use it commercially?",    a:"Yes. Every part of myojam — the classifier, desktop app, website, research, lesson plans, and datasets — is released under the MIT licence. You can use it, modify it, and build on it commercially with no restrictions beyond attribution." },
              { q:"How does the classifier run without internet?",  a:"The trained Random Forest model is bundled inside the desktop app as a .pkl file and loaded locally. No API calls, no cloud inference. The entire signal processing pipeline — filter, windowing, feature extraction, prediction — runs on your machine." },
              { q:"Why is there a gap between 84.85% and clinical use?", a:"Lab benchmarks assume consistent electrode placement, controlled posture, and deliberate isolated movements. Real-world conditions introduce placement shifts between sessions (−5 to −15 pp), limb position changes, co-contraction, and fatigue. Closing this gap is an active open problem — we document it honestly in the research." },
            ].map(({ q, a }, i) => <FAQItem key={i} q={q} a={a} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────── */}
      <section style={{ padding:"0 32px 80px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <Reveal>
            <div style={{ marginTop:64, background:"linear-gradient(135deg, rgba(255,45,120,0.06) 0%, rgba(139,92,246,0.06) 100%)", border:"1px solid rgba(255,45,120,0.15)", borderRadius:"var(--radius)", padding:"52px 48px", textAlign:"center" }}>
              <h2 style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", marginBottom:16 }}>{t("cta_title")}</h2>
              <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, maxWidth:480, margin:"0 auto 36px" }}>{t("cta_sub")}</p>
              <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={()=>navigate("/education")} style={{ background:"var(--accent)", color:"#fff", border:"none", borderRadius:100, padding:"14px 36px", fontSize:15, fontFamily:"var(--font)", fontWeight:600, cursor:"pointer", boxShadow:"0 4px 24px rgba(255,45,120,0.3)", transition:"transform 0.15s, box-shadow 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow="0 8px 32px rgba(255,45,120,0.45)"}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 24px rgba(255,45,120,0.3)"}}
                >{t("cta_demos")}</button>
                <button onClick={()=>navigate("/education")} style={{ background:"none", color:"var(--text)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"14px 28px", fontSize:15, fontFamily:"var(--font)", fontWeight:400, cursor:"pointer", transition:"border-color 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,45,120,0.3)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border-mid)"}
                >{t("cta_articles")}</button>
                <button onClick={()=>navigate("/educators")} style={{ background:"none", color:PURPLE, border:"1px solid rgba(139,92,246,0.3)", borderRadius:100, padding:"14px 28px", fontSize:15, fontFamily:"var(--font)", fontWeight:400, cursor:"pointer", transition:"border-color 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=PURPLE}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(139,92,246,0.3)"}
                >{t("cta_educators")}</button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── DESKTOP APP ────────────────────────────────────────────── */}
      <section style={{ borderTop:"1px solid var(--border)", background:"var(--bg-secondary)", padding:"64px 32px" }}>
        <div style={{ maxWidth:860, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", gap:40, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:10, fontWeight:600, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Desktop App</div>
            <h2 style={{ fontSize:"clamp(22px,3.5vw,36px)", fontWeight:600, letterSpacing:"-1px", color:"var(--text)", lineHeight:1.1, marginBottom:16 }}>
              The future of EMG,<br/>in your hands.
            </h2>
            <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, maxWidth:440 }}>
              Real-time gesture classification from a surface EMG sensor — running locally, powered by a Random Forest with 84.85% cross-subject accuracy. Live waveform, 3D hand model, session tracking.
            </p>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12, flexShrink:0 }}>
            <button onClick={() => navigate("/download")} style={{ background:"var(--accent)", color:"#fff", borderRadius:100, padding:"14px 32px", fontSize:15, fontWeight:500, border:"none", fontFamily:"var(--font)", cursor:"pointer", display:"flex", alignItems:"center", gap:8, justifyContent:"center", transition:"opacity 0.15s, transform 0.15s", boxShadow:"0 4px 20px rgba(255,45,120,0.3)" }}
              onMouseEnter={e=>{e.currentTarget.style.opacity="0.88";e.currentTarget.style.transform="scale(1.03)"}}
              onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="scale(1)"}}
            >
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Get the desktop app →
            </button>
            <div style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300, textAlign:"center" }}>
              v1.0.0 · macOS, Windows & Linux · MIT licence
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
