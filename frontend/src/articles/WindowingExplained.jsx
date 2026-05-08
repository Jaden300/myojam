import { useState, useEffect, useRef } from "react"
import Navbar from "../Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "../Footer"
import UpNext from "../UpNext"
import ArticleBar from "../ArticleUtils"
import NeuralNoise from "../components/NeuralNoise"

const BLUE="#3B82F6", GREEN="#10B981", AMBER="#F59E0B", PINK="#FF2D78", PURPLE="#8B5CF6", RED="#EF4444"

function FaceAvatar({ seed, size = 48 }) {
  const skinTones = ["#f5dce4","#e8c9a0","#c8956c","#8d5524","#f5dce4"]
  const hairColors = ["#1a1a1a","#4a2c0a","#8B4513","#FF2D78","#2c2c2c"]
  const skin = skinTones[seed % skinTones.length]
  const hair = hairColors[(seed * 3) % hairColors.length]
  const eo = (seed % 3) - 1
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="38" fill="#FFF0F5" stroke="#FFD6E7" strokeWidth="1.5"/>
      <rect x="33" y="54" width="14" height="12" rx="4" fill={skin}/>
      <ellipse cx="40" cy="38" rx="20" ry="22" fill={skin}/>
      {seed%3===0&&(<><ellipse cx="40" cy="20" rx="20" ry="10" fill={hair}/><rect x="20" y="18" width="40" height="10" fill={hair}/></>)}
      {seed%3===1&&(<><ellipse cx="40" cy="20" rx="20" ry="10" fill={hair}/><rect x="20" y="18" width="6" height="22" rx="3" fill={hair}/><rect x="54" y="18" width="6" height="22" rx="3" fill={hair}/><rect x="20" y="18" width="40" height="8" fill={hair}/></>)}
      {seed%3===2&&([...Array(8)].map((_,i)=><circle key={i} cx={22+i*5.5} cy={18+Math.sin(i)*3} r="7" fill={hair}/>))}
      <ellipse cx={33+eo} cy="37" rx="3.5" ry="4" fill="white"/><ellipse cx={47+eo} cy="37" rx="3.5" ry="4" fill="white"/>
      <circle cx={33+eo} cy="37.5" r="2.2" fill="#1D1D1F"/><circle cx={47+eo} cy="37.5" r="2.2" fill="#1D1D1F"/>
      <circle cx={34+eo} cy="36.5" r="0.7" fill="white"/><circle cx={48+eo} cy="36.5" r="0.7" fill="white"/>
      <path d={`M ${29+eo} 31 Q ${33+eo} 29 ${37+eo} 31`} stroke="#1D1D1F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d={`M ${43+eo} 31 Q ${47+eo} 29 ${51+eo} 31`} stroke="#1D1D1F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M 40 39 Q 38 44 36 45 Q 40 46.5 44 45 Q 42 44 40 39" fill="none" stroke={skin==="#f5dce4"?"#e8b8c8":"#a06040"} strokeWidth="1.2" strokeLinecap="round"/>
      <path d={seed%2===0?"M 34 50 Q 40 55 46 50":"M 33 50 Q 40 56 47 50"} stroke="#1D1D1F" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

const ABSTRACT = "Window duration and overlap ratio are the two parameters that silently determine everything downstream in an EMG classification pipeline. Published systems report windows from 100 ms to 2000 ms — a 20× range — with surprisingly little discussion of why. This article synthesises the data from myojam's systematic window duration study (Ninapro DB5, 8 conditions, LOSO cross-validation) to show exactly how accuracy varies with window size, where the clinical feasibility boundary lies, and what the 1 s window used by myojam optimises for."

// ── Window accuracy data ──────────────────────────────────────────────────────
const WINDOW_DATA = [
  { dur: 100,  samples: 20,  acc: 62.4,  color: RED,   label:"62.4%" },
  { dur: 250,  samples: 50,  acc: 73.8,  color: AMBER, label:"73.8%" },
  { dur: 500,  samples: 100, acc: 81.2,  color: AMBER, label:"81.2%" },
  { dur: 750,  samples: 150, acc: 83.9,  color: BLUE,  label:"83.9%" },
  { dur: 1000, samples: 200, acc: 84.85, color: PINK,  label:"84.85%" },
  { dur: 1250, samples: 250, acc: 85.3,  color: GREEN, label:"85.3%" },
  { dur: 1500, samples: 300, acc: 85.1,  color: GREEN, label:"85.1%" },
  { dur: 2000, samples: 400, acc: 84.2,  color: PURPLE,label:"84.2%" },
]

function WindowAccuracyChart() {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref}>
      <div style={{ display:"flex", gap:16, marginBottom:10, flexWrap:"wrap" }}>
        {[{c:GREEN,l:"Peak accuracy"},{c:PINK,l:"myojam baseline"},{c:RED,l:"Below clinical adequacy floor (80%)"}].map(({c,l})=>(
          <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:c }}/>
            <span style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300 }}>{l}</span>
          </div>
        ))}
      </div>
      {WINDOW_DATA.map((d, i) => (
        <div key={d.dur} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
          <div style={{ width:140, fontSize:11, color:"var(--text-secondary)", fontWeight:300, textAlign:"right", flexShrink:0, lineHeight:1.3 }}>
            {d.dur} ms ({d.samples} samples)
          </div>
          <div style={{ flex:1, height:11, background:d.acc < 80 ? "rgba(239,68,68,0.08)" : "var(--border)", borderRadius:100, overflow:"hidden", border:d.acc < 80 ? "1px dashed rgba(239,68,68,0.4)" : "none" }}>
            <div style={{
              height:"100%",
              width: vis ? `${d.acc}%` : "0%",
              background: d.dur===1250 ? GREEN : d.dur===1000 ? PINK : d.color,
              borderRadius:100,
              transition: `width 0.7s ease ${i * 0.1}s`
            }}/>
          </div>
          <div style={{ width:48, fontSize:12, fontWeight:700, color:d.dur===1250?GREEN:d.dur===1000?PINK:d.color, flexShrink:0 }}>{d.label}</div>
          {d.dur <= 250 && <div style={{ fontSize:10, color:RED, fontWeight:600, width:50, flexShrink:0 }}>{"< 80%"}</div>}
          {d.dur === 1250 && <div style={{ fontSize:10, color:GREEN, fontWeight:600, width:50, flexShrink:0 }}>peak</div>}
          {d.dur === 1000 && <div style={{ fontSize:10, color:PINK, fontWeight:600, width:50, flexShrink:0 }}>myojam</div>}
        </div>
      ))}
      <div style={{ marginTop:10, fontSize:10, color:"var(--text-tertiary)", textAlign:"center", fontWeight:300 }}>
        Cross-subject LOSO accuracy on Ninapro DB5 (6 gesture classes, 10 subjects). Red-shaded rows = within clinical latency threshold (≤ 300 ms → Farrell & Weir, 2007).
      </div>
    </div>
  )
}

// ── Overlap diagram ───────────────────────────────────────────────────────────
function OverlapDiagram() {
  const LABW=130, CHARTW=400, ROW_H=26, PAD=8
  const W=LABW+CHARTW+10
  const WWIN=80
  const configs = [
    { label:"0% overlap",  step:100, color:BLUE,   stepMs:"1000 ms step · 1 prediction/sec"  },
    { label:"50% overlap", step:50,  color:GREEN,  stepMs:"500 ms step · 2 predictions/sec"  },
    { label:"75% overlap", step:25,  color:AMBER,  stepMs:"250 ms step · 4 predictions/sec"  },
    { label:"95% overlap", step:5,   color:PINK,   stepMs:"50 ms step · 20 predictions/sec"  },
  ]
  const totalH = configs.length * (ROW_H+PAD) + PAD + 32
  return (
    <svg viewBox={`0 0 ${W} ${totalH}`} width="100%">
      <defs><clipPath id="ocW"><rect x={LABW} y={0} width={CHARTW} height={totalH}/></clipPath></defs>
      <text x={LABW+CHARTW/2} y={14} fontSize={9} fill="var(--text-tertiary)" textAnchor="middle" fontFamily="monospace">← signal time →</text>
      {configs.map((cfg, row) => {
        const y = row * (ROW_H+PAD) + PAD + 18
        const starts = []
        for (let x = 0; x < CHARTW + WWIN; x += cfg.step) starts.push(x)
        return (
          <g key={cfg.label}>
            <text x={LABW-6} y={y+ROW_H/2+3} fontSize={10} fill="var(--text-secondary)" textAnchor="end">{cfg.label}</text>
            {starts.map((sx, wi) => (
              sx < CHARTW && (
                <rect key={wi} x={LABW+sx} y={y+1} width={WWIN} height={ROW_H-2} rx={3}
                  fill={cfg.color} fillOpacity={0.1+(wi%2)*0.05} stroke={cfg.color} strokeWidth={1}
                  clipPath="url(#ocW)"/>
              )
            ))}
            <text x={LABW+CHARTW+4} y={y+ROW_H/2+3} fontSize={8.5} fill={cfg.color} fontFamily="monospace">{cfg.stepMs}</text>
          </g>
        )
      })}
      <text x={LABW} y={totalH-2} fontSize={9} fill="var(--text-tertiary)">Each rectangle = one 1000 ms window</text>
    </svg>
  )
}

// ── Latency vs accuracy scatterplot ──────────────────────────────────────────
function LatencyTradeoff() {
  const PAD={top:24,right:20,bottom:44,left:48}
  const SW=480, SH=200
  const CW=SW-PAD.left-PAD.right, CH=SH-PAD.top-PAD.bottom
  const xMin=0, xMax=2100, yMin=58, yMax=88
  const toX=d=>PAD.left+(d-xMin)/(xMax-xMin)*CW
  const toY=a=>PAD.top+(yMax-a)/(yMax-yMin)*CH
  const pts=WINDOW_DATA.map(d=>`${toX(d.dur)},${toY(d.acc)}`).join(" ")
  const fill=`${toX(WINDOW_DATA[0].dur)},${toY(yMin)} ${pts} ${toX(WINDOW_DATA[WINDOW_DATA.length-1].dur)},${toY(yMin)}`
  const threshX=toX(295)
  const yTicks=[60,65,70,75,80,85,90]
  const xTicks=[0,500,1000,1500,2000]
  return (
    <svg viewBox={`0 0 ${SW} ${SH}`} width="100%">
      {yTicks.map(y=>(<line key={y} x1={PAD.left} y1={toY(y)} x2={PAD.left+CW} y2={toY(y)} stroke="var(--border)" strokeWidth={0.5}/>))}
      <polygon points={fill} fill={BLUE} fillOpacity={0.07}/>
      <polyline points={pts} fill="none" stroke={BLUE} strokeWidth={1.8} strokeLinejoin="round"/>
      {/* clinical threshold */}
      <line x1={threshX} y1={PAD.top} x2={threshX} y2={PAD.top+CH} stroke={RED} strokeWidth={1.2} strokeDasharray="4,3"/>
      <rect x={PAD.left} y={PAD.top} width={threshX-PAD.left} height={CH} fill={RED} fillOpacity={0.05}/>
      <text x={threshX+3} y={PAD.top+11} fontSize={8} fill={RED} fontFamily="monospace">295 ms</text>
      <text x={threshX+3} y={PAD.top+21} fontSize={7} fill={RED} fontFamily="monospace">clinical limit</text>
      {/* 80% floor */}
      <line x1={PAD.left} y1={toY(80)} x2={PAD.left+CW} y2={toY(80)} stroke={AMBER} strokeWidth={1} strokeDasharray="3,3"/>
      <text x={PAD.left+CW-2} y={toY(80)-4} fontSize={7} fill={AMBER} textAnchor="end">80% adequacy floor</text>
      {/* Infeasibility zone label */}
      <text x={PAD.left+((threshX-PAD.left)/2)} y={toY(60)+20} fontSize={8} fill={RED} textAnchor="middle" fillOpacity={0.7}>no window here is</text>
      <text x={PAD.left+((threshX-PAD.left)/2)} y={toY(60)+30} fontSize={8} fill={RED} textAnchor="middle" fillOpacity={0.7}>clinically viable</text>
      {/* Data points */}
      {WINDOW_DATA.map(d=>(
        <circle key={d.dur} cx={toX(d.dur)} cy={toY(d.acc)} r={d.dur===1000||d.dur===1250?5:3}
          fill={d.dur===1250?GREEN:d.dur===1000?PINK:BLUE}
          stroke="var(--bg)" strokeWidth={1.2}/>
      ))}
      {/* Axes */}
      <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top+CH} stroke="var(--text-tertiary)" strokeWidth={1}/>
      <line x1={PAD.left} y1={PAD.top+CH} x2={PAD.left+CW} y2={PAD.top+CH} stroke="var(--text-tertiary)" strokeWidth={1}/>
      {xTicks.map(x=>(
        <g key={x}>
          <line x1={toX(x)} y1={PAD.top+CH} x2={toX(x)} y2={PAD.top+CH+4} stroke="var(--text-tertiary)" strokeWidth={1}/>
          <text x={toX(x)} y={PAD.top+CH+14} fontSize={8} fill="var(--text-tertiary)" textAnchor="middle">{x}</text>
        </g>
      ))}
      {yTicks.map(y=>(
        <g key={y}>
          <text x={PAD.left-4} y={toY(y)+3} fontSize={8} fill="var(--text-tertiary)" textAnchor="end">{y}%</text>
          <line x1={PAD.left-3} y1={toY(y)} x2={PAD.left} y2={toY(y)} stroke="var(--text-tertiary)" strokeWidth={1}/>
        </g>
      ))}
      <text x={PAD.left+CW/2} y={SH-2} fontSize={9} fill="var(--text-tertiary)" textAnchor="middle">Window duration (ms)</text>
      <text x={9} y={PAD.top+CH/2} fontSize={9} fill="var(--text-tertiary)" textAnchor="middle" transform={`rotate(-90,9,${PAD.top+CH/2})`}>Accuracy (%)</text>
      <text x={PAD.left+CW/2} y={PAD.top-6} fontSize={8} fill="var(--text-tertiary)" textAnchor="middle">Pink = myojam (1000 ms) · Green = peak (1250 ms) · Red zone = clinically fast, not accurate enough</text>
    </svg>
  )
}

export default function WindowingExplained() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />

      <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <NeuralNoise color={[0.15, 0.55, 0.85]} opacity={0.85} speed={0.0006} />
        <div style={{ position:"absolute", inset:0, background:"rgba(3,0,18,0.65)", zIndex:1 }} />
        <div style={{ maxWidth:720, margin:"0 auto", position:"relative", zIndex:2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
            <span onClick={()=>navigate("/education")} style={{ fontSize:13, color:"var(--accent)", cursor:"pointer" }}>Education</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>→</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Windowing explained</span>
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.08)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,45,120,0.3)", borderRadius:100, padding:"5px 16px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
            Signal processing · 7 min read
          </div>
          <h1 style={{ fontSize:"clamp(28px, 5vw, 52px)", fontWeight:600, letterSpacing:"-1.5px", color:"#fff", lineHeight:1.08, marginBottom:24 }}>
            How big should the window be?<br/>
            <span style={{ color:"var(--accent)" }}>62.4% → 85.3% in eight experiments.</span>
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.72)", fontWeight:300, lineHeight:1.75, marginBottom:36, maxWidth:580 }}>
            Before classification, a continuous EMG stream is cut into overlapping segments. That single parameter choice accounts for a 22-point swing in cross-subject accuracy. Here's the data.
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <FaceAvatar seed={6} size={40} />
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"#fff" }}>myojam team</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Founder & Lead Engineer · July 5, 2025</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"64px 32px 80px" }}>

        {/* Abstract */}
        <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", borderLeft:`3px solid ${BLUE}`, padding:"24px 28px", marginBottom:44 }}>
          <div style={{ fontSize:11, fontWeight:500, color:BLUE, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Abstract</div>
          <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0, fontStyle:"italic" }}>{ABSTRACT}</p>
        </div>

        {/* Stats strip */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0, border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:48 }}>
          {[
            { val:"62.4%", label:"100 ms window",  sub:"20 samples — feature estimation fails",  color:RED },
            { val:"84.85%",label:"1000 ms window", sub:"myojam baseline — near-optimal",          color:PINK },
            { val:"85.3%", label:"1250 ms window", sub:"Peak accuracy across all 8 conditions",   color:GREEN },
            { val:"295 ms",label:"Clinical limit", sub:"Max latency (Farrell & Weir, 2007)",      color:AMBER },
          ].map(({ val, label, sub, color }, i) => (
            <div key={label} style={{ padding:"20px 14px", background:i%2===0?"var(--bg)":"var(--bg-secondary)", borderRight:i<3?"1px solid var(--border)":"none", textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:700, color, letterSpacing:"-0.5px", marginBottom:4 }}>{val}</div>
              <div style={{ fontSize:11, fontWeight:600, color:"var(--text)", marginBottom:3 }}>{label}</div>
              <div style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Section 1: Why windows exist */}
        <div style={{ padding:"0 0 40px", borderBottom:"1px solid var(--border)", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${BLUE}15`, border:`1px solid ${BLUE}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:BLUE }}>01</div>
            <span style={{ fontSize:11, fontWeight:500, color:BLUE, textTransform:"uppercase", letterSpacing:"0.06em" }}>Why windows exist</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:14 }}>The fundamental problem</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 16px" }}>
            Machine learning classifiers expect fixed-size input vectors. A continuous EMG stream produces an unbounded sequence of samples at 200 Hz — one new data point every 5 milliseconds, forever. The solution is sliding window analysis: take N consecutive samples, compute features on them, classify, then slide forward by step S and repeat.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0 }}>
            This converts a streaming signal into a sequence of discrete classification events. Every design decision downstream — feature variance, model accuracy, real-time responsiveness — is determined by what N and S are. Yet most papers report their window size in a single sentence without explanation.
          </p>
        </div>

        {/* Section 2: Accuracy chart */}
        <div style={{ padding:"0 0 40px", borderBottom:"1px solid var(--border)", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${PINK}15`, border:`1px solid ${PINK}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:PINK }}>02</div>
            <span style={{ fontSize:11, fontWeight:500, color:PINK, textTransform:"uppercase", letterSpacing:"0.06em" }}>What the data says</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:14 }}>62.4% to 85.3% — the full accuracy curve</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 28px" }}>
            myojam ran a systematic experiment on Ninapro DB5 with 8 window durations from 100 ms to 2000 ms, using LOSO cross-validation on all 10 subjects. The accuracy increases monotonically from 62.4% (100 ms / 20 samples) to a peak of 85.3% at 1250 ms, then declines modestly at 2000 ms as the stationarity assumption begins to break down.
          </p>
          <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:20 }}>
            <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Accuracy vs. window duration</span>
              <span style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>Ninapro DB5 · 6 gestures · LOSO</span>
            </div>
            <div style={{ padding:"24px" }}>
              <WindowAccuracyChart />
            </div>
          </div>
          <p style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75 }}>
            The steepest gain is in the 100–500 ms range: +18.8 pp in 400 ms of window duration growth, as feature estimation transitions from essentially random to marginally reliable. Above 750 ms, gains are small — the classifier is near its ceiling given the feature set and number of training examples.
          </p>
        </div>

        {/* Section 3: Latency-accuracy trade-off chart */}
        <div style={{ padding:"0 0 40px", borderBottom:"1px solid var(--border)", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${AMBER}15`, border:`1px solid ${AMBER}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:AMBER }}>03</div>
            <span style={{ fontSize:11, fontWeight:500, color:AMBER, textTransform:"uppercase", letterSpacing:"0.06em" }}>The clinical constraint</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:14 }}>The prosthetic feasibility gap</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 20px" }}>
            There is a hard clinical constraint on latency: Farrell and Weir (2007) identified 300 ms as the maximum delay before users perceive a prosthetic controller as "laggy" in a psychophysical target-achievement study. Subtract the ~5 ms processing overhead, and the maximum window duration for a clinically responsive system is 295 ms.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 24px" }}>
            At 200 Hz, 295 ms is 59 samples. From the chart: a 59-sample window achieves approximately 68% accuracy — well below the 80% clinical adequacy floor. This means no window duration simultaneously satisfies both the latency and accuracy requirements for a 200 Hz system. That's not a solvable ML problem — it's a hardware constraint.
          </p>
          <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:12 }}>
            <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
              <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>The infeasibility zone (200 Hz systems)</span>
            </div>
            <div style={{ padding:"20px" }}>
              <LatencyTradeoff />
            </div>
          </div>
          <div style={{ padding:"14px 18px", background:`${RED}08`, border:`1px solid ${RED}20`, borderRadius:10 }}>
            <p style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, margin:0 }}>
              <span style={{ fontWeight:600, color:RED }}>Bottom line:</span> At 200 Hz, no window satisfies both ≤ 300 ms latency and ≥ 80% accuracy simultaneously. This is why real-time EMG prosthetics either use higher sampling rates (2000 Hz hardware can achieve 80% at shorter windows) or accept explicit trade-offs on one dimension.
            </p>
          </div>
        </div>

        {/* Section 4: Overlap diagram */}
        <div style={{ padding:"0 0 40px", borderBottom:"1px solid var(--border)", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${GREEN}15`, border:`1px solid ${GREEN}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:GREEN }}>04</div>
            <span style={{ fontSize:11, fontWeight:500, color:GREEN, textTransform:"uppercase", letterSpacing:"0.06em" }}>Overlap</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:14 }}>Trading compute for responsiveness</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 20px" }}>
            Overlap ratio controls how often the classifier fires, not how accurate it is. A 1000 ms window with 0% overlap fires once per second. The same window with 75% overlap fires every 250 ms — four predictions per second — using the same window of signal. Accuracy per window is identical; the output just updates more frequently.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 24px" }}>
            myojam uses 75% overlap (250 ms step). This produces 4 predictions per second from a 1 s window. Majority voting across the last 5 consecutive overlapping windows recovers 1.8 pp of accuracy in dynamic conditions, at the cost of 4 additional step intervals (1 s) of latency.
          </p>
          <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
              <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Overlap visualised — 1000 ms window</span>
            </div>
            <div style={{ padding:"20px" }}>
              <OverlapDiagram />
            </div>
            <div style={{ padding:"12px 20px", fontSize:11, color:"var(--text-tertiary)", fontWeight:300, borderTop:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
              Each rectangle is one window. Higher overlap = more rectangles = more frequent predictions, but each rectangle still covers the same 1000 ms of signal.
            </div>
          </div>
        </div>

        {/* Section 5: Decision table */}
        <div style={{ padding:"0 0 40px", borderBottom:"1px solid var(--border)", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${PURPLE}15`, border:`1px solid ${PURPLE}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:PURPLE }}>05</div>
            <span style={{ fontSize:11, fontWeight:500, color:PURPLE, textTransform:"uppercase", letterSpacing:"0.06em" }}>What to choose</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:14 }}>Window size by use case</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 24px" }}>
            The right window size depends entirely on your application's latency and accuracy priorities. This table maps three common use cases to concrete recommendations.
          </p>
          <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
                    {["Use case","Window","Accuracy","Latency","Overlap","Notes"].map(h=>(
                      <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:10.5, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { uc:"Browser demo (myojam)", w:"1000 ms", acc:"84.85%", lat:"~1005 ms", ov:"75%", notes:"Optimises clarity and stability", color:PINK },
                    { uc:"Research benchmark", w:"1250 ms", acc:"85.3%",  lat:"~1255 ms", ov:"50%", notes:"Peak accuracy; not real-time", color:GREEN },
                    { uc:"Responsive prototype (200 Hz)", w:"500 ms", acc:"81.2%", lat:"~505 ms", ov:"75%",  notes:"Best accuracy within 500 ms", color:BLUE },
                    { uc:"Clinical prosthetic (2000 Hz)", w:"150 ms", acc:"~83%", lat:"~155 ms", ov:"75%",  notes:"2000 Hz hardware closes the gap", color:AMBER },
                  ].map(({ uc, w, acc, lat, ov, notes, color }, ri) => (
                    <tr key={uc} style={{ borderBottom:"1px solid var(--border)", background:ri%2===0?"var(--bg)":"var(--bg-secondary)" }}>
                      <td style={{ padding:"10px 14px", fontSize:12.5, fontWeight:600, color }}>{uc}</td>
                      <td style={{ padding:"10px 14px", fontSize:12, color:"var(--text-secondary)", fontFamily:"monospace" }}>{w}</td>
                      <td style={{ padding:"10px 14px", fontSize:12, fontWeight:700, color }}>{acc}</td>
                      <td style={{ padding:"10px 14px", fontSize:12, color:"var(--text-secondary)", fontFamily:"monospace" }}>{lat}</td>
                      <td style={{ padding:"10px 14px", fontSize:12, color:"var(--text-secondary)", fontFamily:"monospace" }}>{ov}</td>
                      <td style={{ padding:"10px 14px", fontSize:11.5, color:"var(--text-tertiary)", fontWeight:300 }}>{notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", padding:"40px", border:"1px solid var(--border)" }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Conclusion</div>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 16px" }}>
            Windowing is invisible to users but foundational to system behaviour. The 22-point accuracy swing from 100 ms to 1250 ms is driven by a single parameter that costs nothing to change in software.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0 }}>
            The myojam choice of 1000 ms is intentional: it captures 99.4% of peak accuracy at 20% lower latency than the 1250 ms optimum, with no other trade-off. For a demo system, this is the right call. For a deployed assistive device on 200 Hz hardware, no window satisfies both clinical constraints simultaneously — that's the actual unsolved problem.
          </p>
        </div>

        <ArticleBar
          url="https://myojam.com/education/windowing-explained"
          title="How big should the window be? 62.4% → 85.3% in eight experiments."
          citation={{ apa:`Wong, J. (2025, July 5). How big should the window be? myojam. https://myojam.com/education/windowing-explained` }}
          presetLikes={29}
          storageKey="like_windowing"
        />

        <div style={{ marginTop:32, display:"flex", justifyContent:"center" }}>
          <button onClick={()=>navigate("/education")} style={{ background:"transparent", color:"var(--text-secondary)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, cursor:"pointer", fontFamily:"var(--font)" }}>
            ← Back to Education
          </button>
        </div>
      </div>

      <UpNext current="/education/windowing-explained" />
      <Footer />
    </div>
  )
}
