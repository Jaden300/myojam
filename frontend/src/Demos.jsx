import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"
import LiquidChrome from "./components/LiquidChrome"

const BLUE   = "#3B82F6"
const AMBER  = "#F59E0B"
const PURPLE = "#8B5CF6"
const GREEN  = "#10B981"
const PINK   = "#FF2D78"

// ── Per-tool mini preview SVGs ────────────────────────────────────────────────

function SignalViz() {
  const pts = [0,8,18,32,46,56,62,55,44,34,22,10,0,-10,-18,-24,-20,-12,-4,2,8,4,0,5,12,20,28,22,14,6,-2,-8,-12,-8,0,6,10,8,4,0]
  const W=200, H=120, MY=60
  const path = pts.map((y,i)=>`${i===0?"M":"L"}${8+i*4.8},${MY-y*0.7}`).join(" ")
  const features = [["MAV","0.38"],["RMS","0.45"],["ZC","7"],["WL","124"]]
  return(
    <svg width="100%" viewBox="0 0 200 150" style={{overflow:"visible"}}>
      <defs>
        <linearGradient id="svGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0.3"/>
          <stop offset="100%" stopColor={BLUE} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[-30,0,30].map(y=>(
        <line key={y} x1={8} x2={192} y1={MY-y*0.7} y2={MY-y*0.7} stroke={`${BLUE}18`} strokeWidth={1}/>
      ))}
      {/* Waveform area */}
      <path d={`${path} L${8+39*4.8},${MY} L8,${MY} Z`} fill="url(#svGrad)"/>
      {/* Waveform line */}
      <path d={path} fill="none" stroke={BLUE} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      {/* Feature annotations */}
      {features.map(([k,v],i)=>(
        <g key={k}>
          <text x={5} y={132+0} textAnchor="start" fill={`${BLUE}60`} fontSize={8.5} fontWeight={600}>{k}</text>
          <text x={5+i*47} y={145} fill={BLUE} fontSize={9.5} fontWeight={700}>{v}</text>
          <text x={5+i*47} y={132} fill={`${BLUE}55`} fontSize={8} fontWeight={600}>{k}</text>
        </g>
      ))}
      {/* Cursor line */}
      <line x1={128} x2={128} y1={10} y2={H} stroke={`${BLUE}50`} strokeWidth={1} strokeDasharray="3,2"/>
      <circle cx={128} cy={MY-pts[25]*0.7} r={3.5} fill={BLUE}/>
    </svg>
  )
}

function GameViz() {
  const GESTURES = [
    {label:"Fist",   emoji:"✊", x:50,  y:38 },
    {label:"Point",  emoji:"👆", x:100, y:28 },
    {label:"Peace",  emoji:"✌️", x:150, y:38 },
    {label:"Open",   emoji:"🖐", x:150, y:85 },
    {label:"Pinch",  emoji:"🤌", x:100, y:95 },
    {label:"Rest",   emoji:"✋", x:50,  y:85 },
  ]
  return(
    <svg width="100%" viewBox="0 0 200 130" style={{overflow:"visible"}}>
      {/* Active target circle */}
      <circle cx={100} cy={28} r={24} fill={`${AMBER}18`} stroke={AMBER} strokeWidth={1.5}/>
      {/* Progress ring */}
      <circle cx={100} cy={28} r={20} fill="none" stroke={`${AMBER}50`} strokeWidth={3}
        strokeDasharray="94" strokeDashoffset="30" strokeLinecap="round" transform="rotate(-90 100 28)"/>
      <text x={100} y={32} textAnchor="middle" fontSize={18}>👆</text>
      <text x={100} y={56} textAnchor="middle" fill={AMBER} fontSize={7.5} fontWeight={700} textTransform="uppercase" letterSpacing="0.06em">POINT ← target</text>
      {/* Other gestures */}
      {GESTURES.filter(g=>g.label!=="Point").map((g,i)=>(
        <g key={g.label}>
          <circle cx={g.x} cy={g.y} r={16} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth={1}/>
          <text x={g.x} y={g.y+5} textAnchor="middle" fontSize={14}>{g.emoji}</text>
        </g>
      ))}
      {/* Key hint */}
      {[["Q","✊",50,115],["W","✌️",80,115],["E","🖐",110,115],["R","🤌",140,115],["T","✋",170,115]].map(([k,e,x,y])=>(
        <g key={k}>
          <rect x={x-8} y={y-10} width={16} height={14} rx={3} fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.15)" strokeWidth={1}/>
          <text x={x} y={y} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={8} fontWeight={700}>{k}</text>
        </g>
      ))}
    </svg>
  )
}

function FreqViz() {
  const freq = Array.from({length:100},(_,i)=>i*2)
  function pow(f){
    const muscle = 0.85*Math.exp(-Math.pow(f-80,2)/(2*45*45))
    const motion = f<22?0.5*Math.exp(-f/5):0
    const spike  = 0.4*Math.exp(-Math.pow(f-50,2)/(2*1.8*1.8))
    return Math.min(1,muscle+motion+spike+0.05)
  }
  const pts = freq.map(f=>({f,p:pow(f)}))
  const W=200, H=90, PL=8, PR=8, PT=8, PB=12
  const CW=W-PL-PR, CH=H-PT-PB
  const tx=f=>PL+(f/199)*CW, ty=p=>PT+(1-p)*CH
  const pathD = pts.map((p,i)=>`${i===0?"M":"L"}${tx(p.f)},${ty(p.p)}`).join(" ")
  const areaD = `${pathD} L${tx(198)},${ty(0)} L${tx(0)},${ty(0)} Z`
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H+30}`} style={{overflow:"visible"}}>
      <defs>
        <linearGradient id="fvGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={PURPLE} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={PURPLE} stopOpacity="0"/>
        </linearGradient>
        <clipPath id="fvClip"><rect x={PL} y={PT} width={CW} height={CH}/></clipPath>
      </defs>
      <rect x={tx(20)} y={PT} width={tx(90)-tx(20)} height={CH} fill={`${GREEN}12`} clipPath="url(#fvClip)"/>
      <rect x={PL} y={PT} width={tx(20)-PL} height={CH} fill="rgba(239,68,68,0.08)" clipPath="url(#fvClip)"/>
      <path d={areaD} fill="url(#fvGrad)" clipPath="url(#fvClip)"/>
      <path d={pathD} fill="none" stroke={PURPLE} strokeWidth={1.6} clipPath="url(#fvClip)"/>
      <text x={tx(10)} y={PT+10} textAnchor="middle" fill="rgba(239,68,68,0.7)" fontSize={6.5}>noise</text>
      <text x={tx(55)} y={PT+10} textAnchor="middle" fill={`${GREEN}90`} fontSize={6.5} fontWeight={600}>20–90Hz</text>
      <text x={tx(50)} y={ty(0.4)-3} textAnchor="middle" fill="rgba(239,68,68,0.8)" fontSize={6.5}>50Hz</text>
      {[0,50,100,150,200].map(f=>(
        <text key={f} x={tx(f)} y={H-1} textAnchor="middle" fill={`${PURPLE}40`} fontSize={6.5}>{f}Hz</text>
      ))}
      {/* 16-channel pills */}
      <text x={6} y={H+14} fill={`${PURPLE}60`} fontSize={6.5} fontWeight={700}>CH</text>
      {Array.from({length:16},(_,i)=>(
        <rect key={i} x={16+i*11} y={H+7} width={9} height={7} rx={2}
          fill={i===3?PURPLE:`${PURPLE}20`} stroke={`${PURPLE}30`} strokeWidth={0.5}/>
      ))}
    </svg>
  )
}

function MatrixViz() {
  const labels = ["Fist","Point","Peace","Open","Pinch","Rest"]
  const data   = [
    [88,4,3,2,2,1],[3,85,5,4,2,1],[4,3,82,6,3,2],
    [2,3,4,84,5,2],[3,2,4,5,80,6],[2,1,2,3,5,87]
  ]
  const S=24, PAD=26
  return(
    <svg width="100%" viewBox="0 0 200 180" style={{overflow:"visible"}}>
      {data.map((row,ri)=>row.map((val,ci)=>{
        const isDiag = ri===ci
        const intensity = isDiag ? val/100 : val/20
        const fill = isDiag
          ? `rgba(16,185,129,${0.18+intensity*0.55})`
          : `rgba(239,68,68,${val>3?0.08+intensity*0.3:0.04})`
        return(
          <g key={`${ri}-${ci}`}>
            <rect x={PAD+ci*S} y={PAD+ri*S} width={S-1} height={S-1} rx={2} fill={fill} stroke="rgba(255,255,255,0.04)" strokeWidth={0.5}/>
            <text x={PAD+ci*S+S/2} y={PAD+ri*S+S/2+3.5} textAnchor="middle"
              fill={isDiag?GREEN:val>3?"rgba(239,68,68,0.8)":"rgba(255,255,255,0.25)"}
              fontSize={isDiag?8:7} fontWeight={isDiag?700:300}>{val}{isDiag?"%":""}</text>
          </g>
        )
      }))}
      {labels.map((l,i)=>(
        <g key={l}>
          <text x={PAD+i*S+S/2} y={PAD-5} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={6.5} fontWeight={500}>{l.slice(0,3)}</text>
          <text x={PAD-3} y={PAD+i*S+S/2+3.5} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize={6.5} fontWeight={500}>{l.slice(0,3)}</text>
        </g>
      ))}
      <text x={PAD+3*S} y={180} textAnchor="middle" fill={`${GREEN}60`} fontSize={7} fontWeight={600}>predicted →</text>
      <text x={10} y={PAD+3*S} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={7} transform={`rotate(-90,10,${PAD+3*S})`}>actual</text>
    </svg>
  )
}

function PipelineViz() {
  const steps=[
    {label:"16ch EMG",sublabel:"200Hz raw",color:PINK,x:14},
    {label:"Bandpass",sublabel:"20–90Hz",color:PURPLE,x:58},
    {label:"64 features",sublabel:"MAV·RMS·ZC·WL",color:BLUE,x:102},
    {label:"RF vote",sublabel:"100 trees",color:AMBER,x:146},
  ]
  return(
    <svg width="100%" viewBox="0 0 200 150" style={{overflow:"visible"}}>
      {steps.map((s,i)=>(
        <g key={i}>
          <rect x={s.x} y={20} width={38} height={54} rx={5}
            fill={`${s.color}12`} stroke={`${s.color}35`} strokeWidth={1}/>
          <text x={s.x+19} y={38} textAnchor="middle" fill={s.color} fontSize={7} fontWeight={700}>{s.label}</text>
          <text x={s.x+19} y={50} textAnchor="middle" fill={`${s.color}70`} fontSize={6} fontWeight={300}>{s.sublabel}</text>
          {/* Mini bars per step */}
          {Array.from({length:4},(_,j)=>(
            <rect key={j} x={s.x+4+j*8} y={58} width={6} height={4+j*2}
              fill={s.color} opacity={0.5} rx={1}/>
          ))}
          {i<steps.length-1&&(
            <path d={`M${s.x+38},47 L${s.x+46},47 M${s.x+43},44 L${s.x+46},47 L${s.x+43},50`}
              stroke={`${s.color}50`} strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          )}
        </g>
      ))}
      {/* Output gesture */}
      <rect x={14} y={96} width={172} height={46} rx={8} fill={`${GREEN}10`} stroke={`${GREEN}30`} strokeWidth={1}/>
      <text x={100} y={114} textAnchor="middle" fill={GREEN} fontSize={9} fontWeight={700}>Classified gesture</text>
      <text x={100} y={128} textAnchor="middle" fill={`${GREEN}70`} fontSize={8}>Fist — 91.2% confidence</text>
      <path d="M100,90 L100,96" stroke={`${GREEN}50`} strokeWidth={1.2} strokeDasharray="2,2"/>
    </svg>
  )
}

function LiveSignalViz() {
  const channels = [
    { cy: 30, amp: 11, phase: 0.0, color: "#FF2D78" },
    { cy: 55, amp: 8,  phase: 1.3, color: "#A78BFA" },
    { cy: 78, amp: 6,  phase: 2.6, color: "#22D3EE" },
  ]
  function wpt(i, cy, amp, phase) {
    const n = i / 44
    return cy
      + amp * 0.55 * Math.sin(n * 8 * Math.PI + phase)
      + amp * 0.30 * Math.sin(n * 20 * Math.PI + phase * 1.3 + 0.8)
      + amp * 0.15 * Math.sin(n * 48 * Math.PI + phase * 0.7 + 1.5)
  }
  return (
    <svg width="100%" viewBox="0 0 200 150" style={{overflow:"visible"}}>
      <rect x={0} y={0} width={126} height={100} rx={6} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.07)" strokeWidth={0.5}/>
      {channels.map(({ cy, amp, phase, color }, ci) => {
        const d = Array.from({length:45},(_,i) => `${i===0?"M":"L"}${(18+i*2.3).toFixed(1)},${wpt(i,cy,amp,phase).toFixed(1)}`).join(" ")
        return (
          <g key={ci}>
            <text x={14} y={cy+3.5} textAnchor="end" fill={`${color}70`} fontSize={6} fontWeight={700} fontFamily="monospace">CH{ci+1}</text>
            <path d={d} stroke={color} strokeWidth={1.2} fill="none" style={{filter:`drop-shadow(0 0 2px ${color})`}}/>
          </g>
        )
      })}
      <rect x={4} y={108} width={118} height={18} rx={4} fill="rgba(255,45,120,0.12)" stroke="rgba(255,45,120,0.25)" strokeWidth={0.8}/>
      <text x={12} y={121} fill="rgba(255,255,255,0.38)" fontSize={7}>Predicted</text>
      <text x={63} y={121} textAnchor="middle" fill="#FF2D78" fontSize={8.5} fontWeight={700}>FIST</text>
      <text x={115} y={121} textAnchor="end" fill="rgba(255,255,255,0.6)" fontSize={7} fontWeight={600}>94.2%</text>
      {/* 3D hand panel */}
      <rect x={132} y={0} width={68} height={100} rx={6} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.07)" strokeWidth={0.5}/>
      <text x={166} y={56} textAnchor="middle" fontSize={38}>✊</text>
      <text x={166} y={88} textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize={6.5} fontWeight={300}>3D model</text>
      <text x={166} y={136} textAnchor="middle" fill="rgba(255,45,120,0.5)" fontSize={7} fontWeight={600}>LIVE SENSOR</text>
    </svg>
  )
}

function MyoCodeViz() {
  const blocks = [
    { y:6,   indent:0,  w:148, color:"#F59E0B", label:"when gesture: FIST" },
    { y:28,  indent:0,  w:134, color:"#3B82F6", label:"repeat 3 times" },
    { y:50,  indent:10, w:112, color:"#10B981", label:"move forward 40" },
    { y:72,  indent:10, w:112, color:"#10B981", label:"turn right 90°" },
    { y:94,  indent:0,  w:134, color:"#8B5CF6", label:"draw line to stage" },
    { y:116, indent:0,  w:100, color:"#EF4444", label:"play sound: pop" },
  ]
  return (
    <svg width="100%" viewBox="0 0 200 150" style={{overflow:"visible"}}>
      {blocks.map((b,i) => (
        <g key={i}>
          <rect x={4+b.indent} y={b.y} width={b.w} height={19} rx={4} fill={`${b.color}20`} stroke={`${b.color}50`} strokeWidth={0.8}/>
          {b.indent > 0 && <line x1={10} y1={b.y+9.5} x2={14+b.indent} y2={b.y+9.5} stroke={`${b.color}40`} strokeWidth={0.8}/>}
          <text x={10+b.indent} y={b.y+13} fill={b.color} fontSize={7.5} fontWeight={600} fontFamily="monospace">{b.label}</text>
        </g>
      ))}
      {/* Mini stage */}
      <rect x={158} y={6} width={38} height={36} rx={4} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.8}/>
      <path d="M163,37 L167,29 L172,32 L176,24 L180,30 L184,22 L190,29" stroke="#10B981" strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <text x={177} y={55} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={6.5}>canvas</text>
    </svg>
  )
}

// ── Tool data ─────────────────────────────────────────────────────────────────
const TOOLS = [
  {
    slug: "/playground",
    tag: "Signal processing",
    title: "Signal Playground",
    desc: "Draw an EMG-like waveform with your mouse and watch the feature extraction pipeline compute MAV, RMS, ZC, and WL live as you draw. Understand what the classifier actually sees from a muscle signal.",
    features: ["Draw any waveform", "Live feature extraction", "Heuristic classification", "Feature explainer"],
    cta: "Open playground →",
    accent: BLUE,
    Viz: SignalViz,
    what: "You'll understand why a brief muscle contraction produces a different feature vector than a sustained hold — and what that means for the classifier.",
  },
  {
    slug: "/game",
    tag: "Learning game",
    title: "Gesture Reaction Game",
    desc: "A target gesture appears — press the matching key before time runs out. Three difficulty levels designed to build intuition for the 6 gesture classes used in myojam's classifier.",
    features: ["3 difficulty levels", "6 gesture classes", "Reaction scoring", "Keyboard-driven"],
    cta: "Play now →",
    accent: AMBER,
    Viz: GameViz,
    what: "You'll understand why pinch and peace are hard to separate — they share similar finger extension patterns — which is exactly why the classifier confuses them.",
  },
  {
    slug: "/frequency",
    tag: "Signal processing",
    title: "EMG Frequency Analyzer",
    desc: "Load a real Ninapro EMG window and inspect its frequency spectrum. Watch the 20–90 Hz bandpass filter isolate gesture signal from noise in real time across any of the 16 electrode channels.",
    features: ["Real Ninapro windows", "16 channel selector", "Bandpass filter viz", "Frequency band legend"],
    cta: "Open analyzer →",
    accent: PURPLE,
    Viz: FreqViz,
    what: "You'll see exactly how much of the raw signal is noise — and why the 50Hz powerline spike sits right in the middle of the useful band.",
  },
  {
    slug: "/confusion",
    tag: "Model evaluation",
    title: "Confusion Matrix Explorer",
    desc: "An interactive heatmap of the classifier's cross-subject accuracy. Click any cell to see how often one gesture is confused for another — and the biomechanical reason why.",
    features: ["Interactive 6×6 heatmap", "Per-gesture recall", "Biomechanical explanations", "Click-to-explore"],
    cta: "Explore →",
    accent: GREEN,
    Viz: MatrixViz,
    what: "You'll see that accuracy is not uniform — some gestures hit 88%, others 80% — and why the off-diagonal errors follow a predictable anatomical pattern.",
  },
  {
    slug: "/pipeline",
    tag: "Live ML trace",
    title: "Pipeline Explorer",
    desc: "Fetch a real Ninapro DB5 EMG window and watch every step of the prediction pipeline unfold: 16-channel waveform → bandpass filter → 4×16 feature heatmap → Random Forest vote.",
    features: ["Real EMG data", "4×16 feature heatmap", "Live API prediction", "Step-by-step trace"],
    cta: "Trace a prediction →",
    accent: PINK,
    Viz: PipelineViz,
    what: "You'll see the full signal-to-prediction chain in a single view — the only tool that shows all four pipeline stages simultaneously on real data.",
  },
  {
    slug: "/signal",
    tag: "Live hardware",
    title: "Live Signal + 3D Hand",
    desc: "Connect a MyoWare 2.0 sensor and Arduino, and watch your actual muscle signal render in real time alongside a 3D hand model that mirrors every gesture. This is the full desktop experience in the browser.",
    features: ["Real-time EMG waveform", "3D animated hand model", "Live gesture classification", "Requires sensor + Arduino"],
    cta: "Open live view →",
    accent: "#FF2D78",
    Viz: LiveSignalViz,
    what: "You'll see your own forearm signal — not simulated data — processed and classified live. The latency between muscle contraction and gesture label is typically under 5ms.",
  },
  {
    slug: "/myocode",
    tag: "Block coding",
    title: "MyoCode",
    desc: "A Scratch-style block coding environment where your EMG gestures trigger code. Build programs that respond to fist, point, peace, and more — no typing required, just flex.",
    features: ["Gesture-driven blocks", "Canvas stage", "6 gesture triggers", "No hardware needed"],
    cta: "Open MyoCode →",
    accent: "#F59E0B",
    Viz: MyoCodeViz,
    what: "You'll understand how gesture events can replace keyboard inputs — the foundation of every muscle-computer interface, expressed as visual code anyone can modify.",
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Demos() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar/>

      {/* ── Hero ── */}
      <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--border)", padding: "100px 32px 72px" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <LiquidChrome baseColor={[0.07, 0.0, 0.18]} speed={0.15} amplitude={0.25}/>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(3,0,18,0.68),rgba(3,0,18,0.55) 60%,rgba(3,0,18,0.88))", zIndex: 1 }}/>
        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Reveal>
            <SectionPill>Interactive learning tools</SectionPill>
            <h1 style={{ fontSize: "clamp(32px,5vw,58px)", fontWeight: 700, letterSpacing: "-2px", color: "#fff", marginBottom: 18, lineHeight: 1.05 }}>
              Learn by doing.<br/><span style={{ color: PINK }}>No hardware required.</span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", fontWeight: 300, lineHeight: 1.8, maxWidth: 500, marginBottom: 36 }}>
              Seven interactive tools for exploring EMG signal processing, gesture classification, and machine learning — five run entirely in the browser, two connect to live hardware.
            </p>
            <div style={{ display: "flex", gap: 36, flexWrap: "wrap" }}>
              {[["7","interactive tools"],["16,269","EMG windows"],["5","browser-only"]].map(([v,l])=>(
                <div key={l}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>{v}</div>
                  <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.38)", fontWeight: 300, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Learning path ── */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "44px 32px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Suggested order</SectionPill>
            <h2 style={{ fontSize: "clamp(18px,2.5vw,26px)", fontWeight: 700, letterSpacing: "-0.7px", color: "var(--text)", marginBottom: 6 }}>A learning path through the tools</h2>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, marginBottom: 24, maxWidth: 500 }}>
              Each tool targets a different layer of the EMG pipeline. Follow them in order to build intuition from raw signal all the way to model evaluation.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
              {[
                { step: "01", stage: "Signal",    tool: "Signal Playground",   idea: "Draw waveforms and watch MAV, RMS, ZC, WL update live.",              color: BLUE,   slug: "/playground" },
                { step: "02", stage: "Frequency", tool: "Frequency Analyzer",  idea: "See how bandpass isolates gesture signal from noise.",                  color: PURPLE, slug: "/frequency" },
                { step: "03", stage: "Classes",   tool: "Gesture Game",        idea: "Build intuition for the 6 gesture classes.",                            color: AMBER,  slug: "/game" },
                { step: "04", stage: "Evaluation",tool: "Confusion Matrix",    idea: "Where the model fails and the anatomical reason why.",                  color: GREEN,  slug: "/confusion" },
                { step: "05", stage: "Full trace", tool: "Pipeline Explorer",  idea: "Live trace: raw signal → features → RF vote on real data.",            color: PINK,   slug: "/pipeline" },
              ].map(({ step, stage, tool, idea, color, slug }, i) => (
                <div key={step} onClick={() => navigate(slug)} style={{ padding: "18px 14px", borderRight: i < 4 ? "1px solid var(--border)" : "", background: "var(--bg)", cursor: "pointer", transition: "background 0.15s", position: "relative" }}
                  onMouseEnter={e => e.currentTarget.style.background = `${color}08`}
                  onMouseLeave={e => e.currentTarget.style.background = "var(--bg)"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${color}18`, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color, flexShrink: 0 }}>{step}</div>
                    <div style={{ fontSize: 9, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{stage}</div>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text)", marginBottom: 6, lineHeight: 1.3 }}>{tool}</div>
                  <p style={{ fontSize: 11.5, color: "var(--text-tertiary)", fontWeight: 300, lineHeight: 1.6, margin: 0 }}>{idea}</p>
                  {i < 4 && <div style={{ position: "absolute", top: "50%", right: -8, transform: "translateY(-50%)", fontSize: 13, color: "var(--border)", zIndex: 1 }}>›</div>}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Tool cards ── */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "60px 32px 80px" }}>
        <Reveal>
          <SectionPill>Tools</SectionPill>
          <h2 style={{ fontSize: "clamp(20px,2.8vw,28px)", fontWeight: 700, letterSpacing: "-0.7px", color: "var(--text)", marginBottom: 8 }}>Five tools. One pipeline.</h2>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, marginBottom: 36, maxWidth: 500 }}>
            Each preview shows what the tool looks like and what you'll understand after using it.
          </p>
        </Reveal>

        <div style={{ display: "grid", gap: 20 }}>
          {TOOLS.map((tool, i) => (
            <Reveal key={tool.slug} delay={i * 0.05}>
              <div style={{ borderRadius: 16, border: `1px solid ${tool.accent}25`, background: "var(--bg)", overflow: "hidden", transition: "border-color 0.2s, transform 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${tool.accent}55`; e.currentTarget.style.transform = "translateY(-2px)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${tool.accent}25`; e.currentTarget.style.transform = "translateY(0)" }}>

                <div style={{ display: "grid", gridTemplateColumns: "200px 1fr" }}>
                  {/* Left: mini preview */}
                  <div style={{ background: `linear-gradient(145deg,#050516,#0a0a1e)`, borderRight: `1px solid ${tool.accent}18`, padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "100%", maxWidth: 180 }}>
                      <tool.Viz/>
                    </div>
                  </div>

                  {/* Right: content */}
                  <div style={{ padding: "24px 28px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: tool.accent, background: `${tool.accent}15`, border: `1px solid ${tool.accent}30`, borderRadius: 100, padding: "2px 10px", letterSpacing: "0.04em" }}>{tool.tag}</span>
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.4px", marginBottom: 8 }}>{tool.title}</h2>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, margin: "0 0 14px" }}>{tool.desc}</p>

                    {/* What you'll learn */}
                    <div style={{ padding: "10px 14px", background: `${tool.accent}07`, border: `1px solid ${tool.accent}18`, borderLeft: `3px solid ${tool.accent}60`, borderRadius: "0 8px 8px 0", marginBottom: 14 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: tool.accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>What you'll understand</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.65 }}>{tool.what}</div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {tool.features.map(f => (
                          <span key={f} style={{ fontSize: 11, color: "var(--text-tertiary)", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 100, padding: "3px 10px", fontWeight: 300 }}>✓ {f}</span>
                        ))}
                      </div>
                      <button onClick={() => navigate(tool.slug)} style={{ flexShrink: 0, background: tool.accent, color: "#fff", border: "none", borderRadius: 100, padding: "8px 20px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font)", transition: "opacity 0.15s, transform 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "scale(1.04)" }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)" }}>
                        {tool.cta}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal delay={0.25}>
          <div style={{ marginTop: 40, background: "var(--bg-secondary)", borderRadius: 16, border: "1px solid var(--border)", padding: "32px 36px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 5, letterSpacing: "-0.2px" }}>Want the science behind the tools?</div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, margin: 0, maxWidth: 420 }}>
                11 full articles cover the neuroscience, signal processing theory, and machine learning behind every tool — from first principles to implementation details.
              </p>
            </div>
            <button onClick={() => navigate("/education")} style={{ flexShrink: 0, background: "var(--accent)", color: "#fff", borderRadius: 100, padding: "12px 26px", fontSize: 14, fontWeight: 500, border: "none", fontFamily: "var(--font)", cursor: "pointer", boxShadow: "0 4px 16px rgba(255,45,120,0.3)", transition: "transform 0.15s,box-shadow 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(255,45,120,0.4)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(255,45,120,0.3)" }}>
              Education hub →
            </button>
          </div>
        </Reveal>
      </div>

      <Footer/>
    </div>
  )
}
