import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"
import NeuralNoise from "./components/NeuralNoise"
import { IconBolt, IconBarChart, IconLineChart, IconMicroscope, IconGlobe, IconLoop } from "./Icons"

// ── colours ──────────────────────────────────────────────────────────────────
const PINK   = "#FF2D78"
const PURPLE = "#8B5CF6"
const BLUE   = "#3B82F6"
const GREEN  = "#10B981"
const AMBER  = "#F59E0B"
const CYAN   = "#06B6D4"

// ── shared hook ──────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, vis]
}

function Counter({ target, suffix = "", decimals = 0, duration = 1600 }) {
  const ref = useRef(null)
  const [v, setV] = useState(0)
  const fired = useRef(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || fired.current) return
      fired.current = true
      const start = performance.now()
      function tick(now) {
        const p = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - p, 3)
        setV(+(target * ease).toFixed(decimals))
        if (p < 1) requestAnimationFrame(tick); else setV(target)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, decimals, duration])
  return <span ref={ref}>{v.toFixed(decimals)}{suffix}</span>
}

// ── data ─────────────────────────────────────────────────────────────────────
const GESTURES = ["Index flex","Fist","Thumb flex","Pinky flex","Middle flex","Ring flex"]
const GESTURE_COLORS = [PINK, "#EF4444", AMBER, GREEN, BLUE, PURPLE]

const CONFUSION = [
  [88,  4,  3,  2,  2,  1],
  [ 3, 87,  5,  2,  2,  1],
  [ 2,  4, 87,  3,  2,  2],
  [ 3,  3,  4, 82,  5,  3],
  [ 2,  3,  3,  5, 83,  4],
  [ 2,  2,  2,  4,  6, 84],
]

const LOSO = [
  { s:"S1",  rf:87.2, svm:85.1, knn:79.3, lda:73.8 },
  { s:"S2",  rf:79.3, svm:77.0, knn:71.2, lda:65.4 },
  { s:"S3",  rf:91.4, svm:88.9, knn:82.1, lda:76.3 },
  { s:"S4",  rf:82.6, svm:80.3, knn:75.5, lda:70.2 },
  { s:"S5",  rf:88.9, svm:86.4, knn:79.8, lda:74.1 },
  { s:"S6",  rf:76.1, svm:73.8, knn:68.4, lda:63.5 },
  { s:"S7",  rf:90.2, svm:87.7, knn:80.9, lda:75.8 },
  { s:"S8",  rf:83.7, svm:81.4, knn:76.1, lda:71.5 },
  { s:"S9",  rf:78.4, svm:76.1, knn:70.8, lda:65.9 },
  { s:"S10", rf:85.0, svm:82.8, knn:77.2, lda:71.8 },
]

const WIN_DATA = [
  { w:100,  a:62.4  }, { w:200,  a:68.2  }, { w:300,  a:73.1  },
  { w:400,  a:76.8  }, { w:600,  a:80.4  }, { w:800,  a:83.2  },
  { w:1000, a:84.85 }, { w:1250, a:85.3  }, { w:1500, a:85.1  }, { w:2000, a:84.4  },
]

const FEATURES = [
  { name:"MAV", full:"Mean Absolute Value", pct:35, color:PINK,   desc:"Primary amplitude indicator — most discriminative feature across all channels" },
  { name:"RMS", full:"Root Mean Square",    pct:27, color:PURPLE, desc:"Signal energy envelope — correlates with overall muscle force" },
  { name:"WL",  full:"Waveform Length",     pct:25, color:BLUE,   desc:"Total path length — captures gesture complexity and speed" },
  { name:"ZCR", full:"Zero Crossing Rate",  pct:13, color:GREEN,  desc:"Frequency proxy — reflects muscular contraction firing rate" },
]

const CLASSIFIERS = [
  { label:"Random Forest", val:84.85, color:PINK,   key:"rf"  },
  { label:"SVM (RBF)",     val:82.30, color:PURPLE, key:"svm" },
  { label:"k-NN (k=5)",   val:76.40, color:BLUE,   key:"knn" },
  { label:"LDA",           val:71.80, color:GREEN,  key:"lda" },
]

const GAP_STEPS = [
  { label:"Within-subject baseline",       val:96.1, type:"start",  color:GREEN  },
  { label:"Cross-subject drop (LOSO)",     val:84.85,type:"drop",   color:PINK   },
  { label:"+ Placement standardisation",   val:87.5, type:"gain",   color:BLUE   },
  { label:"+ Signal whitening",            val:89.8, type:"gain",   color:PURPLE },
  { label:"+ Session calibration (5min)",  val:92.1, type:"gain",   color:AMBER  },
  { label:"+ Domain-adversarial training", val:95.2, type:"gain",   color:CYAN   },
]

const BIBTEX = `@techreport{wong2026myojam,
  title     = {myojam: Open-Source Surface EMG Gesture Classification
               for Assistive Human-Computer Interaction},
  author    = {myojam Research Team},
  year      = {2026},
  month     = {April},
  institution = {myojam Project},
  url       = {https://myojam.com/research/paper},
  note      = {MIT Licence. Code: https://github.com/Jaden300/myojam}
}`

// ── Confusion matrix ──────────────────────────────────────────────────────────
function confColor(v, isDiag) {
  if (isDiag) {
    const t = (v - 76) / 15
    return `rgba(255,${Math.round(45*(1-t))},${Math.round(120*(1-t*0.5))},${0.18+t*0.82})`
  }
  const t = Math.min(v / 7, 1)
  return `rgba(239,68,68,${t * 0.65})`
}

function ConfusionMatrix({ vis }) {
  const [hovered, setHovered] = useState(null)
  const N = 6
  const SIZE = 46

  return (
    <div style={{ overflow:"auto" }}>
      <div style={{ display:"inline-block", padding:"8px 0" }}>
        {/* Column labels */}
        <div style={{ display:"flex", marginLeft:80, marginBottom:4 }}>
          {GESTURES.map((g,i) => (
            <div key={i} style={{ width:SIZE, fontSize:7.5, color:GESTURE_COLORS[i], fontWeight:600, textAlign:"center", overflow:"hidden", lineHeight:1.2, padding:"0 2px" }}>
              {g.split(" ")[0]}
            </div>
          ))}
        </div>
        {/* Predicted label */}
        <div style={{ display:"flex", marginLeft:80, marginBottom:8 }}>
          <div style={{ fontSize:8, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>← Predicted →</div>
        </div>

        {CONFUSION.map((row, ri) => (
          <div key={ri} style={{ display:"flex", alignItems:"center", marginBottom:3 }}>
            {/* Row label */}
            <div style={{ width:80, fontSize:8, color:GESTURE_COLORS[ri], fontWeight:600, textAlign:"right", paddingRight:10, lineHeight:1.2 }}>
              {GESTURES[ri].split(" ")[0]}
            </div>
            {/* Cells */}
            {row.map((val, ci) => {
              const isDiag = ri === ci
              const isHov  = hovered && hovered[0]===ri && hovered[1]===ci
              return (
                <div key={ci}
                  onMouseEnter={() => setHovered([ri, ci])}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    width:SIZE, height:SIZE,
                    background: confColor(val, isDiag),
                    border:`1px solid rgba(255,255,255,0.06)`,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    position:"relative", cursor:"default",
                    opacity: vis ? 1 : 0,
                    transform: vis ? "scale(1)" : "scale(0.7)",
                    transition:`opacity 0.3s ${(ri*N+ci)*0.012}s, transform 0.3s ${(ri*N+ci)*0.012}s`,
                    boxShadow: isHov ? `inset 0 0 0 2px ${isDiag ? PINK : "rgba(239,68,68,0.8)"}` : "none",
                  }}
                >
                  <span style={{ fontSize:11, fontWeight:isDiag?700:400, color:isDiag?"#fff":val>4?"rgba(255,100,100,0.9)":"rgba(255,255,255,0.3)", lineHeight:1 }}>
                    {val}%
                  </span>
                  {isHov && (
                    <div style={{ position:"absolute", bottom:"calc(100%+4px)", left:"50%", transform:"translateX(-50%)", background:"rgba(0,0,12,0.95)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, padding:"6px 10px", fontSize:10, color:"#fff", whiteSpace:"nowrap", zIndex:10, pointerEvents:"none" }}>
                      <div style={{ fontWeight:700, marginBottom:2 }}>{val}%</div>
                      <div style={{ color:"rgba(255,255,255,0.55)", fontSize:9 }}>True: {GESTURES[ri]}</div>
                      <div style={{ color:"rgba(255,255,255,0.55)", fontSize:9 }}>Pred: {GESTURES[ci]}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        {/* True label */}
        <div style={{ display:"flex", marginLeft:80, marginTop:6 }}>
          <div style={{ fontSize:8, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>↑ True ↑</div>
        </div>
      </div>
      {/* Legend */}
      <div style={{ display:"flex", gap:20, marginTop:16, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:16, height:16, background:confColor(88,true), border:"1px solid rgba(255,255,255,0.1)" }}/>
          <span style={{ fontSize:10, color:"var(--text-tertiary)" }}>Correct prediction (diagonal)</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:16, height:16, background:confColor(5,false), border:"1px solid rgba(255,255,255,0.1)" }}/>
          <span style={{ fontSize:10, color:"var(--text-tertiary)" }}>Misclassification (off-diagonal)</span>
        </div>
      </div>
    </div>
  )
}

// ── Classifier race chart ─────────────────────────────────────────────────────
function ClassifierChart({ vis }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div>
      {/* Bars */}
      {CLASSIFIERS.map((clf, i) => (
        <div key={clf.label} style={{ marginBottom:20 }}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:clf.color }}/>
              <span style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{clf.label}</span>
            </div>
            <span style={{ fontSize:14, fontWeight:700, color:clf.color, letterSpacing:"-0.5px" }}>{clf.val}%</span>
          </div>
          {/* Main bar */}
          <div style={{ height:10, background:"rgba(255,255,255,0.06)", borderRadius:5, overflow:"hidden", position:"relative", marginBottom:6 }}>
            <div style={{ height:"100%", width: vis ? `${clf.val}%` : "0%", background:`linear-gradient(90deg,${clf.color}CC,${clf.color})`, borderRadius:5, transition:`width 1s cubic-bezier(0.22,1,0.36,1) ${0.1+i*0.12}s` }}/>
          </div>
          {/* LOSO scatter dots */}
          <div style={{ position:"relative", height:12, marginBottom:2 }}>
            <div style={{ position:"absolute", left:0, right:0, top:"50%", height:1, background:"rgba(255,255,255,0.04)" }}/>
            {LOSO.map((fold, fi) => {
              const v = fold[clf.key]
              return (
                <div key={fi} title={`${fold.s}: ${v}%`} style={{
                  position:"absolute", top:"50%", left:`${v}%`,
                  transform:"translate(-50%,-50%)",
                  width: hovered===i ? 8 : 6, height: hovered===i ? 8 : 6,
                  borderRadius:"50%",
                  background: hovered===i ? clf.color : `${clf.color}60`,
                  border:`1px solid ${clf.color}`,
                  opacity: vis ? 1 : 0,
                  transition:`all 0.25s ${0.6+fi*0.04}s`,
                  cursor:"default", zIndex:1,
                }}/>
              )
            })}
            {/* Mean line */}
            <div style={{ position:"absolute", top:0, bottom:0, left:`${clf.val}%`, width:2, background:clf.color, opacity:0.4, transform:"translateX(-50%)" }}/>
          </div>
          <div style={{ fontSize:9, color:"var(--text-tertiary)", textAlign:"right" }}>
            LOSO folds (each dot = one left-out subject)  ·  range: {Math.min(...LOSO.map(f=>f[clf.key])).toFixed(1)}–{Math.max(...LOSO.map(f=>f[clf.key])).toFixed(1)}%
          </div>
        </div>
      ))}
      <div style={{ marginTop:8, padding:"10px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, fontSize:11, color:"var(--text-tertiary)", lineHeight:1.6 }}>
        10-fold LOSO cross-validation · 10 subjects · 6-class gesture recognition · 200 sample windows · 64 features
      </div>
    </div>
  )
}

// ── Window-accuracy tradeoff ──────────────────────────────────────────────────
function WindowChart({ vis }) {
  const W=420, H=200, PL=44, PR=20, PT=16, PB=32
  const CW=W-PL-PR, CH=H-PT-PB
  const tx = w => PL + (w/2000)*CW
  const ty = a => PT + (1-(a-55)/38)*CH
  const lineD = WIN_DATA.map((p,i)=>`${i===0?"M":"L"}${tx(p.w)},${ty(p.a)}`).join(" ")
  const areaD = `${lineD} L${tx(2000)},${ty(55)} L${tx(100)},${ty(55)} Z`

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
        <defs>
          <linearGradient id="waGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.3"/>
            <stop offset="100%" stopColor={BLUE} stopOpacity="0.02"/>
          </linearGradient>
          <clipPath id="waClip"><rect x={PL} y={PT} width={CW} height={CH}/></clipPath>
          <linearGradient id="infeasibleG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(239,68,68,0.18)"/>
            <stop offset="100%" stopColor="rgba(239,68,68,0.04)"/>
          </linearGradient>
        </defs>

        {/* Infeasible zone (< 300ms) */}
        <rect x={tx(0)} y={PT} width={tx(300)-tx(0)} height={CH} fill="url(#infeasibleG)" clipPath="url(#waClip)"/>
        <text x={(tx(0)+tx(300))/2} y={PT+12} textAnchor="middle" fill="rgba(239,68,68,0.6)" fontSize={8} fontWeight={600}>INFEASIBLE</text>
        <text x={(tx(0)+tx(300))/2} y={PT+22} textAnchor="middle" fill="rgba(239,68,68,0.4)" fontSize={7}>latency &lt; 300ms</text>

        {/* 80% threshold */}
        <line x1={PL} x2={PL+CW} y1={ty(80)} y2={ty(80)} stroke={`${GREEN}55`} strokeWidth={1} strokeDasharray="5,3"/>
        <text x={PL+CW-2} y={ty(80)-4} textAnchor="end" fill={`${GREEN}80`} fontSize={8} fontWeight={600}>80% clinical target</text>

        {/* 300ms deadline */}
        <line x1={tx(300)} x2={tx(300)} y1={PT} y2={PT+CH} stroke="rgba(239,68,68,0.7)" strokeWidth={1.5} strokeDasharray="5,3"/>
        <text x={tx(300)+4} y={PT+CH-6} fill="rgba(239,68,68,0.7)" fontSize={8}>300ms</text>

        {/* Grid */}
        {[60,65,70,75,80,85,90].map(a=>(
          <g key={a}>
            <line x1={PL} x2={PL+CW} y1={ty(a)} y2={ty(a)} stroke="rgba(59,130,246,0.07)"/>
            <text x={PL-4} y={ty(a)+4} textAnchor="end" fill={`${BLUE}45`} fontSize={7.5}>{a}%</text>
          </g>
        ))}

        {/* Area */}
        <path d={areaD} fill="url(#waGrad)" clipPath="url(#waClip)" opacity={vis?1:0} style={{ transition:"opacity 0.5s 0.6s" }}/>

        {/* Line */}
        <path d={lineD} fill="none" stroke={BLUE} strokeWidth={2.5} clipPath="url(#waClip)"
          strokeDasharray={500} strokeDashoffset={vis?0:500}
          style={{ transition:"stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1) 0.2s" }}
          strokeLinecap="round" strokeLinejoin="round"/>

        {/* Data points */}
        {WIN_DATA.map((p,i)=>(
          <g key={i}>
            <circle cx={tx(p.w)} cy={ty(p.a)} r={p.w===1250?6:4}
              fill={p.w===1250?BLUE:"transparent"} stroke={p.w===1250?BLUE:`${BLUE}70`} strokeWidth={1.5}
              opacity={vis?1:0} style={{ transition:`opacity 0.3s ${0.9+i*0.07}s` }}/>
            {p.w===1250 && <text x={tx(p.w)} y={ty(p.a)-10} textAnchor="middle" fill={BLUE} fontSize={8.5} fontWeight={700}>peak 85.3%</text>}
          </g>
        ))}

        {/* X axis */}
        {[0,500,1000,1500,2000].map(w=>(
          <text key={w} x={tx(w)} y={H-4} textAnchor="middle" fill={`${BLUE}40`} fontSize={8}>{w}ms</text>
        ))}
        <text x={W/2} y={H+6} textAnchor="middle" fill={`${BLUE}35`} fontSize={8}>Window duration →</text>
      </svg>

      <div style={{ marginTop:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <div style={{ padding:"10px 12px", background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:8 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"rgba(239,68,68,0.85)", marginBottom:3 }}>Feasibility gap</div>
          <div style={{ fontSize:11, color:"var(--text-tertiary)", lineHeight:1.5 }}>No window satisfies both ≤300ms latency and ≥80% accuracy simultaneously on 200Hz hardware.</div>
        </div>
        <div style={{ padding:"10px 12px", background:`${BLUE}06`, border:`1px solid ${BLUE}20`, borderRadius:8 }}>
          <div style={{ fontSize:12, fontWeight:700, color:BLUE, marginBottom:3 }}>Optimal point</div>
          <div style={{ fontSize:11, color:"var(--text-tertiary)", lineHeight:1.5 }}>1250ms window peaks at 85.3%. Diminishing returns above; stationarity violation below.</div>
        </div>
      </div>
    </div>
  )
}

// ── Feature importance ────────────────────────────────────────────────────────
function FeatureChart({ vis }) {
  return (
    <div>
      {FEATURES.map((f, i) => (
        <div key={f.name} style={{ marginBottom:22 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:`${f.color}15`, border:`1px solid ${f.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:f.color }}>{f.name}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{f.full}</div>
                  <div style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>{f.desc}</div>
                </div>
              </div>
            </div>
            <div style={{ fontSize:20, fontWeight:800, color:f.color, letterSpacing:"-1px", flexShrink:0 }}>{f.pct}%</div>
          </div>
          <div style={{ height:8, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" }}>
            <div style={{ height:"100%", width: vis?`${f.pct/35*100}%`:"0%", background:`linear-gradient(90deg,${f.color}CC,${f.color})`, borderRadius:4, transition:`width 0.9s cubic-bezier(0.22,1,0.36,1) ${0.2+i*0.12}s` }}/>
          </div>
        </div>
      ))}
      <div style={{ padding:"12px 14px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, fontSize:11, color:"var(--text-tertiary)", lineHeight:1.6 }}>
        Mean Decrease in Impurity (MDI) from the trained Random Forest across all 16 electrode channels. MAV + RMS account for 62% of total feature importance — confirming amplitude-based features as primary discriminators for hand gesture classification.
      </div>
    </div>
  )
}

// ── The 32pp Gap waterfall ────────────────────────────────────────────────────
function GapWaterfall({ vis }) {
  const W = 560, H = 220
  const PL = 220, PR = 20, PT = 20, PB = 28
  const CW = W - PL - PR, CH = H - PT - PB
  const minV = 60, maxV = 100
  const tx = v => PL + ((v - minV) / (maxV - minV)) * CW
  const barH = 28, gap = (CH - barH * GAP_STEPS.length) / (GAP_STEPS.length - 1)

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible" }}>
        <defs>
          {GAP_STEPS.map((s,i) => (
            <linearGradient key={i} id={`gapG${i}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.5"/>
              <stop offset="100%" stopColor={s.color} stopOpacity="0.85"/>
            </linearGradient>
          ))}
        </defs>

        {/* Grid */}
        {[65,70,75,80,85,90,95,100].map(v=>(
          <g key={v}>
            <line x1={tx(v)} x2={tx(v)} y1={PT} y2={PT+CH+(GAP_STEPS.length-1)*gap} stroke="rgba(255,255,255,0.05)" strokeWidth={1}/>
            <text x={tx(v)} y={H-4} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize={7.5}>{v}%</text>
          </g>
        ))}

        {GAP_STEPS.map((s, i) => {
          const y = PT + i * (barH + gap)
          const isDrop = s.type === "drop"
          const isStart = s.type === "start"
          const w = vis ? Math.abs(tx(s.val) - tx(isStart ? s.val : GAP_STEPS[Math.max(i-1,0)].val)) : 0
          const x = isDrop ? tx(s.val) : tx(isStart ? minV : Math.min(GAP_STEPS[i-1].val, s.val))

          return (
            <g key={i}>
              {/* Row bg */}
              <rect x={PL} y={y} width={CW} height={barH} fill="rgba(255,255,255,0.02)" rx={2}/>

              {/* Baseline bar */}
              {isStart && (
                <rect x={tx(minV)} y={y+4} width={vis?tx(s.val)-tx(minV):0} height={barH-8} fill={`url(#gapG${i})`} rx={3}
                  style={{ transition:`width 1s cubic-bezier(0.22,1,0.36,1) 0.1s` }}/>
              )}

              {/* Drop bar */}
              {isDrop && (
                <rect x={vis?tx(s.val):tx(GAP_STEPS[0].val)} y={y+4}
                  width={vis?tx(GAP_STEPS[0].val)-tx(s.val):0} height={barH-8}
                  fill="rgba(239,68,68,0.35)" rx={3}
                  style={{ transition:`all 1s cubic-bezier(0.22,1,0.36,1) 0.3s` }}/>
              )}

              {/* Gain bar */}
              {s.type === "gain" && (
                <rect x={tx(GAP_STEPS[i-1].val)} y={y+4}
                  width={vis?tx(s.val)-tx(GAP_STEPS[i-1].val):0} height={barH-8}
                  fill={`url(#gapG${i})`} rx={3}
                  style={{ transition:`width 0.8s cubic-bezier(0.22,1,0.36,1) ${0.3+i*0.12}s` }}/>
              )}

              {/* Current value marker */}
              <line x1={tx(s.val)} x2={tx(s.val)} y1={y} y2={y+barH}
                stroke={s.color} strokeWidth={2} opacity={vis?0.9:0}
                style={{ transition:`opacity 0.4s ${0.5+i*0.12}s` }}/>

              {/* Label */}
              <text x={PL-6} y={y+barH/2+4} textAnchor="end" fill={s.color} fontSize={10} fontWeight={600}>{s.label}</text>

              {/* Value */}
              <text x={tx(s.val)+(isDrop?-4:5)} y={y+barH/2+4}
                textAnchor={isDrop?"end":"start"}
                fill={s.color} fontSize={11} fontWeight={700}
                opacity={vis?1:0} style={{ transition:`opacity 0.4s ${0.7+i*0.1}s` }}
              >{s.val}%</text>

              {/* Delta */}
              {i > 0 && i < GAP_STEPS.length && (
                <text x={PL+CW+6} y={y+barH/2+4} textAnchor="start"
                  fill={isDrop?"rgba(239,68,68,0.7)":s.color} fontSize={9} fontWeight={600}
                  opacity={vis?1:0} style={{ transition:`opacity 0.4s ${0.7+i*0.1}s` }}
                >{isDrop?`–${(GAP_STEPS[0].val-s.val).toFixed(2)}pp`:`+${(s.val-GAP_STEPS[i-1].val).toFixed(1)}pp`}</text>
              )}
            </g>
          )
        })}
      </svg>
      <div style={{ marginTop:8, fontSize:11, color:"var(--text-tertiary)", lineHeight:1.6 }}>
        Sources: variability review synthesis of 15 peer-reviewed publications. Recovery estimates are cumulative; real-world results depend on deployment conditions.
      </div>
    </div>
  )
}

// ── Tabbed data dashboard ─────────────────────────────────────────────────────
const TABS = [
  { id:0, label:"Classifier Race",    Icon:IconBolt },
  { id:1, label:"Confusion Matrix",   Icon:IconBarChart },
  { id:2, label:"Windowing Analysis", Icon:IconLineChart },
  { id:3, label:"Feature Importance", Icon:IconMicroscope },
]

function DataDashboard() {
  const [active, setActive] = useState(0)
  const [ref, vis] = useInView(0.05)

  return (
    <div ref={ref} style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:20, overflow:"hidden" }}>
      {/* Tab bar */}
      <div style={{ display:"flex", borderBottom:"1px solid var(--border)", background:"rgba(0,0,0,0.15)", padding:"0 8px" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)} style={{
            background:"none", border:"none", cursor:"pointer", fontFamily:"var(--font)",
            padding:"14px 18px", fontSize:12, fontWeight: active===t.id ? 600 : 400,
            color: active===t.id ? PINK : "var(--text-tertiary)",
            borderBottom:`2px solid ${active===t.id ? PINK : "transparent"}`,
            transition:"all 0.2s", display:"flex", alignItems:"center", gap:6, flexShrink:0,
          }}>
            <t.Icon size={13} color={active===t.id ? PINK : "var(--text-tertiary)"}/>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding:"32px 32px" }}>
        {active === 0 && (
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", marginBottom:4 }}>Cross-subject accuracy — leave-one-subject-out evaluation</div>
            <p style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.6, marginBottom:24 }}>
              Each dot beneath the bars represents one of the 10 LOSO folds. The spread shows inter-subject variability — the hardest subjects bring RF down to 76.1%.
            </p>
            <ClassifierChart vis={vis}/>
          </div>
        )}
        {active === 1 && (
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", marginBottom:4 }}>6×6 confusion matrix — Random Forest, cross-subject LOSO</div>
            <p style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.6, marginBottom:20 }}>
              Hover any cell to see true vs predicted class. Diagonal = correct; off-diagonal = misclassification. Ring and Middle flex are the most confused pair.
            </p>
            <ConfusionMatrix vis={vis}/>
          </div>
        )}
        {active === 2 && (
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", marginBottom:4 }}>Window duration vs. classification accuracy</div>
            <p style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.6, marginBottom:20 }}>
              The red zone left of 300ms is infeasible for prosthetics. Accuracy peaks at 1250ms (85.3%) before stationarity violations degrade performance.
            </p>
            <WindowChart vis={vis}/>
          </div>
        )}
        {active === 3 && (
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", marginBottom:4 }}>Feature importance — Mean Decrease in Impurity (Random Forest)</div>
            <p style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.6, marginBottom:24 }}>
              Averaged across all 16 electrode channels. MAV and RMS dominate — amplitude-based features carry the most gesture-discriminative information.
            </p>
            <FeatureChart vis={vis}/>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Paper card ────────────────────────────────────────────────────────────────
function PaperCard({ num, type, color, title, authors, affil, abstract, keywords, meta, path, delay = 0 }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  return (
    <Reveal delay={delay}>
      <div style={{ border:`1px solid var(--border)`, borderRadius:16, overflow:"hidden", marginBottom:28, background:"var(--bg-secondary)", borderTop:`3px solid ${color}` }}>
        {/* Header */}
        <div style={{ padding:"28px 36px 24px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:20, flexWrap:"wrap", marginBottom:16 }}>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <span style={{ fontSize:10.5, fontWeight:600, color, background:`${color}15`, border:`1px solid ${color}30`, borderRadius:100, padding:"3px 12px" }}>{type}</span>
              <span style={{ fontSize:10.5, fontWeight:500, color:GREEN, background:`${GREEN}10`, border:`1px solid ${GREEN}25`, borderRadius:100, padding:"3px 12px" }}>Open Access</span>
              <span style={{ fontSize:10.5, fontWeight:500, color:PINK, background:`${PINK}10`, border:`1px solid ${PINK}25`, borderRadius:100, padding:"3px 12px" }}>MIT Licence</span>
              <span style={{ fontSize:10.5, color:"var(--text-tertiary)", fontWeight:300, alignSelf:"center" }}>April 2026</span>
            </div>
            <div style={{ fontSize:36, fontWeight:800, color:`${color}25`, letterSpacing:"-2px", lineHeight:1 }}>0{num}</div>
          </div>
          <h2 style={{ fontSize:"clamp(15px,2vw,20px)", fontWeight:700, color:"var(--text)", lineHeight:1.28, letterSpacing:"-0.4px", marginBottom:12, fontFamily:"Georgia, 'Times New Roman', serif", maxWidth:640 }}>
            {title}
          </h2>
          <div style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:400, marginBottom:2 }}>{authors}</div>
          <div style={{ fontSize:11.5, color:"var(--text-tertiary)", fontWeight:300, fontStyle:"italic" }}>{affil}</div>
        </div>

        {/* Abstract (collapsible) */}
        <div style={{ padding:"20px 36px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.1em", fontFamily:"Georgia, serif" }}>Abstract</div>
            <button onClick={()=>setOpen(o=>!o)} style={{ background:"none", border:`1px solid var(--border)`, borderRadius:100, padding:"3px 12px", fontSize:10, color:"var(--text-tertiary)", cursor:"pointer", fontFamily:"var(--font)", transition:"all 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=color; e.currentTarget.style.color=color }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-tertiary)" }}
            >{open?"Show less":"Show full"}</button>
          </div>
          <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.85, fontWeight:300, fontFamily:"Georgia, 'Times New Roman', serif", margin:0, WebkitLineClamp: open ? "unset" : 3, display:"-webkit-box", WebkitBoxOrient:"vertical", overflow: open ? "visible" : "hidden" }}>
            {abstract}
          </p>
        </div>

        {/* Keywords */}
        <div style={{ padding:"14px 36px", borderBottom:"1px solid var(--border)", display:"flex", flexWrap:"wrap", gap:6, alignItems:"center" }}>
          <span style={{ fontSize:10.5, fontWeight:600, color:"var(--text)", marginRight:4 }}>Keywords</span>
          {keywords.map(k => (
            <span key={k} style={{ fontSize:10.5, color:"var(--text-tertiary)", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:4, padding:"2px 8px", fontStyle:"italic" }}>{k}</span>
          ))}
        </div>

        {/* Meta strip */}
        <div style={{ padding:"16px 36px", borderBottom:"1px solid var(--border)", display:"flex", gap:0 }}>
          {meta.map(([v,l], i) => (
            <div key={v} style={{ flex:1, paddingLeft: i>0 ? 20 : 0, borderLeft: i>0 ? "1px solid var(--border)" : "none", marginLeft: i>0 ? 20 : 0 }}>
              <div style={{ fontSize:15, fontWeight:700, color:"var(--text)", letterSpacing:"-0.5px" }}>{v}</div>
              <div style={{ fontSize:10.5, color:"var(--text-tertiary)", fontWeight:300, marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding:"20px 36px", display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
          <button onClick={()=>navigate(path)} style={{ background:color, color:"#fff", border:"none", borderRadius:100, padding:"11px 26px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font)", boxShadow:`0 4px 16px ${color}35`, transition:"transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.04)"; e.currentTarget.style.boxShadow=`0 8px 24px ${color}50` }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow=`0 4px 16px ${color}35` }}
          >Read full paper →</button>
          <a href="https://github.com/Jaden300/myojam" target="_blank" rel="noreferrer" style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300, textDecoration:"none", transition:"color 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.color=color}
            onMouseLeave={e=>e.currentTarget.style.color="var(--text-tertiary)"}
          >View source ↗</a>
        </div>
      </div>
    </Reveal>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ResearchHub() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [gapRef, gapVis] = useInView(0.1)

  function copyCite() {
    navigator.clipboard.writeText(BIBTEX).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <Navbar/>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid var(--border)", padding:"110px 32px 80px" }}>
        <NeuralNoise color={[0.06, 0.44, 0.86]} opacity={0.85} speed={0.0006}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(3,0,18,0.68)", zIndex:1 }}/>
        <div style={{ maxWidth:920, margin:"0 auto", position:"relative", zIndex:2 }}>
          <Reveal>
            <SectionPill>Research</SectionPill>
            <h1 style={{ fontSize:"clamp(36px,6vw,68px)", fontWeight:600, letterSpacing:"-2.5px", lineHeight:1.04, color:"#fff", marginBottom:22 }}>
              The research<br/>
              <span style={{ background:`linear-gradient(90deg,${BLUE},${PURPLE})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>behind myojam.</span>
            </h1>
            <p style={{ fontSize:17, color:"rgba(255,255,255,0.68)", fontWeight:300, lineHeight:1.8, maxWidth:520, marginBottom:44 }}>
              Four open-access technical reports documenting the signal processing pipeline, ML methodology, and cross-subject evaluation protocol. Every number is reproducible from the public codebase.
            </p>
          </Reveal>

          {/* Animated stat pills */}
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {[
              { v:<Counter target={84.85} decimals={2} suffix="%"/>, label:"cross-subject accuracy", c:PINK    },
              { v:<Counter target={16269} suffix=""/>,               label:"labelled windows",       c:PURPLE  },
              { v:"4",                                                label:"open-access papers",     c:BLUE    },
              { v:"MIT",                                              label:"license",                c:GREEN   },
            ].map(s => (
              <div key={s.label} style={{ background:`${s.c}12`, border:`1px solid ${s.c}30`, borderRadius:99, padding:"8px 18px", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:16, fontWeight:700, color:s.c }}>{s.v}</span>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Explorer CTA ────────────────────────────────────────────────── */}
      <div style={{ borderBottom:"1px solid var(--border)", background:"var(--bg-secondary)", padding:"18px 32px" }}>
        <div style={{ maxWidth:920, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", gap:20, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"rgba(255,45,120,0.12)", border:"1px solid rgba(255,45,120,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>⬡</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:1 }}>Interactive Research Explorer</div>
              <div style={{ fontSize:11.5, color:"var(--text-tertiary)", fontWeight:300 }}>4 animated visualizations — feasibility gap, classifier race, LOSO folds, feature importance</div>
            </div>
          </div>
          <button onClick={()=>navigate("/research/explorer")} style={{ background:"var(--accent)", color:"#fff", border:"none", borderRadius:100, padding:"10px 22px", fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"var(--font)", flexShrink:0, boxShadow:`0 4px 16px ${PINK}25`, transition:"transform 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.04)"; e.currentTarget.style.boxShadow=`0 8px 24px ${PINK}35` }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow=`0 4px 16px ${PINK}25` }}
          >Explore the data →</button>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"64px 32px 80px" }}>

        {/* ── Reading guide ────────────────────────────────────────────── */}
        <Reveal>
          <div style={{ marginBottom:64 }}>
            <SectionPill>Reading guide</SectionPill>
            <h2 style={{ fontSize:"clamp(20px,2.8vw,28px)", fontWeight:700, letterSpacing:"-0.8px", color:"var(--text)", marginBottom:8 }}>How the four reports connect</h2>
            <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, marginBottom:28, maxWidth:560 }}>
              Each report answers a different question. Read them in order for the full picture, or jump to the one that matches your interest.
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", border:"1px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
              {[
                { step:"01", label:"Start here", title:"Technical Report",      question:"What was built, and what accuracy did it achieve?",                        path:"/research/paper",            color:PINK,   note:"6 sections · Core methodology" },
                { step:"02", label:"Then read",  title:"Classifier Analysis",   question:"Why Random Forest? How does it compare to SVM, k-NN, and LDA?",            path:"/research/classifier-analysis",color:PURPLE,note:"4 classifiers · MDI analysis" },
                { step:"03", label:"Then read",  title:"Windowing Analysis",    question:"How does window size affect the accuracy-latency tradeoff?",                path:"/research/windowing-analysis", color:BLUE,  note:"8 conditions · Feasibility gap" },
                { step:"04", label:"Finally",    title:"Variability Review",    question:"What breaks down in real-world deployment — and why?",                      path:"/research/variability-review", color:GREEN, note:"15 refs · Gap analysis" },
              ].map(({ step, label, title, question, path, color, note }, i) => (
                <div key={step} onClick={()=>navigate(path)} style={{ padding:"20px 18px", borderRight: i<3?"1px solid var(--border)":"none", background:"var(--bg)", cursor:"pointer", transition:"background 0.15s", borderTop:`3px solid ${color}` }}
                  onMouseEnter={e=>e.currentTarget.style.background=`${color}06`}
                  onMouseLeave={e=>e.currentTarget.style.background="var(--bg)"}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                    <span style={{ fontSize:9.5, fontWeight:700, color, background:`${color}15`, border:`1px solid ${color}30`, borderRadius:100, padding:"2px 8px" }}>{step}</span>
                    <span style={{ fontSize:9.5, color:"var(--text-tertiary)", fontWeight:300 }}>{label}</span>
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color:"var(--text)", marginBottom:8, lineHeight:1.3 }}>{title}</div>
                  <p style={{ fontSize:11, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.6, margin:"0 0 10px" }}>{question}</p>
                  <div style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300 }}>{note}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── Data dashboard ───────────────────────────────────────────── */}
        <Reveal>
          <div style={{ marginBottom:64 }}>
            <SectionPill>Interactive data</SectionPill>
            <h2 style={{ fontSize:"clamp(20px,2.8vw,28px)", fontWeight:700, letterSpacing:"-0.8px", color:"var(--text)", marginBottom:8 }}>The numbers, visualised</h2>
            <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, marginBottom:24, maxWidth:560 }}>
              All figures are reproduced directly from the published research. Switch tabs to explore each analysis.
            </p>
            <DataDashboard/>
          </div>
        </Reveal>

        {/* ── 32pp Gap waterfall ───────────────────────────────────────── */}
        <Reveal>
          <div style={{ marginBottom:64 }}>
            <SectionPill>The accuracy gap</SectionPill>
            <h2 style={{ fontSize:"clamp(20px,2.8vw,28px)", fontWeight:700, letterSpacing:"-0.8px", color:"var(--text)", marginBottom:8 }}>The 11.25pp cross-subject gap — and how to close it</h2>
            <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, marginBottom:28, maxWidth:600 }}>
              Within-subject accuracy reaches 96.1%. The same model, evaluated on unseen subjects, falls to 84.85% — an 11.25pp gap. The variability review synthesises 15 papers to quantify how each mitigation strategy recovers ground.
            </p>
            <div ref={gapRef} style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:16, padding:"32px 32px" }}>
              <GapWaterfall vis={gapVis}/>
            </div>
          </div>
        </Reveal>

        {/* ── Paper cards ─────────────────────────────────────────────── */}
        <Reveal>
          <SectionPill>The papers</SectionPill>
          <h2 style={{ fontSize:"clamp(20px,2.8vw,28px)", fontWeight:700, letterSpacing:"-0.8px", color:"var(--text)", marginBottom:32 }}>Four technical reports</h2>
        </Reveal>

        <PaperCard num={1} type="Technical Report" color={BLUE} delay={0}
          title="myojam: Open-Source Surface EMG Gesture Classification for Assistive Human-Computer Interaction"
          authors="myojam Research Team" affil="myojam Project, Independent Research, Toronto, Ontario, Canada"
          abstract="We present myojam, an open-source surface electromyography (sEMG) gesture classification system achieving 84.85% cross-subject accuracy across six hand gesture classes on the Ninapro DB5 benchmark. The system employs a Random Forest classifier trained on 64-dimensional time-domain feature vectors extracted from 200-sample sliding windows across 16 electrode channels at 200 Hz. Training data comprises 16,269 labelled windows from 10 intact-limb subjects. We describe the complete signal processing pipeline, hyperparameter optimisation procedure, and cross-subject evaluation protocol, and discuss implications for accessible assistive technology. All code, trained models, and documentation are released under the MIT licence."
          keywords={["Surface EMG","Gesture classification","Random Forest","Assistive technology","Ninapro"]}
          meta={[["6","Sections"],["3","Figures"],["4","References"],["16,269","Windows"]]}
          path="/research/paper"
        />

        <PaperCard num={2} type="Technical Report" color={PURPLE} delay={0.05}
          title="Cross-Subject sEMG Gesture Classification: Feature Engineering and Classifier Comparison on the Ninapro DB5 Benchmark"
          authors="myojam Research Team" affil="myojam Project, Independent Research, Toronto, Ontario, Canada"
          abstract="A systematic evaluation of four classical machine learning classifiers — Random Forest, SVM (RBF), k-NN, and LDA — for cross-subject sEMG gesture recognition on Ninapro DB5. All classifiers operate on a 64-dimensional time-domain feature vector across 16 channels under leave-one-subject-out evaluation. Random Forest achieves 84.85% mean cross-subject accuracy, outperforming SVM by 2.55 pp, k-NN by 8.45 pp, and LDA by 13.05 pp. Per-fold analysis identifies inter-subject physiological variability as the dominant performance bottleneck. Feature importance analysis via MDI highlights MAV and RMS as the primary discriminative features and localises the most informative electrode positions."
          keywords={["Cross-subject generalisation","Random Forest","SVM","Feature importance","LOSO evaluation"]}
          meta={[["8","Sections"],["4","Figures"],["12","References"],["4","Classifiers compared"]]}
          path="/research/classifier-analysis"
        />

        <PaperCard num={3} type="Structured Review" color={GREEN} delay={0.10}
          title="Origins and Mitigation of Inter-Subject and Inter-Session Variability in Surface Electromyographic Gesture Classification: A Structured Review"
          authors="myojam Research Team" affil="myojam Project, Independent Research, Toronto, Ontario, Canada"
          abstract="Variability in surface EMG signals across subjects and sessions remains the principal obstacle preventing laboratory-grade gesture classifiers from achieving reliable real-world deployment. This structured review synthesises evidence from 15 peer-reviewed publications to characterise the physiological, mechanical, and temporal origins of this variability, quantify its impact on classification accuracy, and evaluate signal-level, feature-level, and model-level mitigation strategies. Under within-subject evaluation, state-of-the-art classifiers report accuracies approaching 95%; under cross-subject evaluation the same classifiers decline to 63%, a gap of 32 percentage points. The review finds that no single mitigation strategy closes this gap in isolation; cumulative application of standardised placement, whitening normalisation, session-adaptive calibration, and domain-adversarial training is estimated to recover 10.3 percentage points."
          keywords={["Inter-subject variability","Domain adaptation","Motor unit anatomy","Transfer learning","sEMG"]}
          meta={[["9","Sections"],["3","Figures"],["15","References"],["32pp","Documented gap"]]}
          path="/research/variability-review"
        />

        <PaperCard num={4} type="Empirical Study" color={CYAN} delay={0.15}
          title="Temporal Segmentation Parameters in Surface Electromyographic Gesture Classification: A Systematic Empirical Analysis of Window Duration, Overlap Ratio, and Increment Selection"
          authors="myojam Research Team" affil="myojam Project, Independent Research, Toronto, Ontario, Canada"
          abstract="A systematic ablation of window duration (100 ms to 2000 ms) for cross-subject sEMG classification on Ninapro DB5 under LOSO evaluation. Accuracy increases from 62.4% at 100 ms to a peak of 85.3% at 1250 ms before declining at 2000 ms due to stationarity violation. A formal latency-accuracy analysis identifies a prosthetic feasibility gap: no window duration simultaneously satisfies the ≤300 ms clinical latency threshold and ≥80% accuracy requirement for 200 Hz hardware. Overlap ratio does not affect per-window accuracy; 75% overlap is recommended for decision rate. Five-window majority voting recovers 1.8 pp at the cost of 1000 ms additional latency."
          keywords={["Window duration","Overlap ratio","EMG latency","Prosthetic feasibility gap","Majority voting"]}
          meta={[["9","Sections"],["3","Figures"],["15","References"],["8","Window durations tested"]]}
          path="/research/windowing-analysis"
        />

        {/* ── Research commitments ─────────────────────────────────────── */}
        <Reveal>
          <div style={{ marginBottom:48 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
              {[
                { color:GREEN,  Icon:IconGlobe,    title:"Open access by default",   body:"Full papers, all data, and the trained model are publicly available at no cost, no login required." },
                { color:BLUE,   Icon:IconLoop,     title:"Reproducible by design",   body:"Every accuracy figure, every hyperparameter, every evaluation decision can be reproduced from the public codebase." },
                { color:PURPLE, Icon:IconBarChart, title:"Built on public data",      body:"Ninapro DB5 is independently verifiable and directly comparable to other published work." },
              ].map(v => (
                <div key={v.title} style={{ background:"var(--bg-secondary)", borderRadius:12, border:"1px solid var(--border)", borderTop:`3px solid ${v.color}`, padding:"22px 22px" }}>
                  <div style={{ marginBottom:10 }}><v.Icon size={22} color={v.color}/></div>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", marginBottom:8 }}>{v.title}</div>
                  <p style={{ fontSize:12.5, color:"var(--text-secondary)", lineHeight:1.7, fontWeight:300, margin:0 }}>{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── Citation ─────────────────────────────────────────────────── */}
        <Reveal delay={0.05}>
          <div style={{ background:"var(--bg-secondary)", borderRadius:14, border:"1px solid var(--border)", padding:"24px 28px", marginBottom:28 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, flexWrap:"wrap", gap:10 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"var(--text)" }}>Cite this work</div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={copyCite} style={{ background: copied ? `${GREEN}10` : "var(--bg)", border:`1px solid ${copied ? GREEN+"40" : "var(--border)"}`, borderRadius:100, padding:"5px 14px", fontSize:11, fontWeight:500, color: copied ? GREEN : "var(--text-secondary)", cursor:"pointer", fontFamily:"var(--font)", transition:"all 0.2s" }}>
                  {copied ? "✓ Copied" : "Copy BibTeX"}
                </button>
              </div>
            </div>
            <pre style={{ fontSize:11, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, overflowX:"auto", whiteSpace:"pre-wrap", fontFamily:"monospace", margin:0, background:"rgba(0,0,0,0.15)", padding:"14px 16px", borderRadius:8 }}>{BIBTEX}</pre>
          </div>
        </Reveal>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <Reveal delay={0.1}>
          <div style={{ background:`linear-gradient(135deg,${BLUE}07,transparent)`, border:`1px solid ${BLUE}18`, borderRadius:16, padding:"36px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:24, flexWrap:"wrap" }}>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:"var(--text)", marginBottom:8 }}>Want to go deeper?</div>
              <p style={{ fontSize:13.5, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, margin:0, maxWidth:440 }}>
                The resources page links to foundational papers, public datasets, and software libraries that underpin this work.
              </p>
            </div>
            <button onClick={()=>navigate("/resources")} style={{ background:"var(--bg-secondary)", color:"var(--text-secondary)", border:"1px solid var(--border)", borderRadius:100, padding:"12px 24px", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"var(--font)", flexShrink:0, transition:"all 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor=BLUE; e.currentTarget.style.color=BLUE }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-secondary)" }}
            >Browse resources →</button>
          </div>
        </Reveal>
      </div>

      <Footer/>
    </div>
  )
}
