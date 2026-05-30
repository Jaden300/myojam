import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"
import NeuralNoise from "./components/NeuralNoise"

// ── palette ───────────────────────────────────────────────────────────────────
const PINK    = "#FF2D78"
const BLUE    = "#3B82F6"
const CYAN    = "#06B6D4"
const AMBER   = "#F59E0B"
const GREEN   = "#10B981"
const LIME    = "#65A30D"
const PURPLE  = "#8B5CF6"
const PURPLE2 = "#A855F7"
const ROSE    = "#EC4899"

// ── data ─────────────────────────────────────────────────────────────────────
const TAG_COLORS = {
  "Foundations":       { text:PINK,    bg:"rgba(255,45,120,0.08)",   border:"rgba(255,45,120,0.20)"   },
  "Machine Learning":  { text:BLUE,    bg:"rgba(59,130,246,0.08)",   border:"rgba(59,130,246,0.20)"   },
  "Signal processing": { text:CYAN,    bg:"rgba(6,182,212,0.08)",    border:"rgba(6,182,212,0.20)"    },
  "Neuroscience":      { text:AMBER,   bg:"rgba(245,158,11,0.08)",   border:"rgba(245,158,11,0.20)"   },
  "Dataset":           { text:GREEN,   bg:"rgba(16,185,129,0.08)",   border:"rgba(16,185,129,0.20)"   },
  "Hardware":          { text:LIME,    bg:"rgba(101,163,13,0.08)",   border:"rgba(101,163,13,0.20)"   },
  "Ethics":            { text:ROSE,    bg:"rgba(236,72,153,0.08)",   border:"rgba(236,72,153,0.20)"   },
  "Future":            { text:PURPLE2, bg:"rgba(168,85,247,0.08)",   border:"rgba(168,85,247,0.20)"   },
  "Accessibility":     { text:PURPLE,  bg:"rgba(139,92,246,0.08)",   border:"rgba(139,92,246,0.20)"   },
}

const ARTICLES = [
  { id:1,  slug:"/education/emg-explainer",       tag:"Foundations",       title:"The science of muscle-computer interfaces",             summary:"What is EMG, how does surface signal acquisition work, and how does myojam turn a forearm twitch into a computer action? A full explainer from the biology up.", readTime:"8 min", date:"2026-04-06", dateLabel:"Apr 6, 2026",  likes:47 },
  { id:2,  slug:"/education/random-forest-emg",   tag:"Machine Learning",  title:"Why Random Forest? The classifier behind myojam",       summary:"Why not a neural network? How ensemble tree methods handle noisy biomedical signals, and what the 84.85% cross-subject accuracy figure actually means.", readTime:"7 min", date:"2026-03-15", dateLabel:"Mar 15, 2026", likes:38 },
  { id:3,  slug:"/education/open-source-emg",     tag:"Accessibility",     title:"From lab to laptop: democratising EMG",                 summary:"EMG-based prosthetics have existed for 60 years. How open datasets, affordable hardware, and open-source tools are finally making muscle-computer control accessible.", readTime:"6 min", date:"2026-03-28", dateLabel:"Mar 28, 2026", likes:31 },
  { id:4,  slug:"/education/ninapro-db5",         tag:"Dataset",           title:"Inside Ninapro DB5: the dataset that trains myojam",    summary:"Where does the training data come from? What is Ninapro, what does DB5 contain, and what decisions went into turning 52 movements into a 6-class classifier?", readTime:"6 min", date:"2026-02-20", dateLabel:"Feb 20, 2026", likes:24 },
  { id:5,  slug:"/education/muscle-memory",       tag:"Neuroscience",      title:"Muscle memory is real. It's just not in your muscles.", summary:"What neuroscientists actually mean by motor learning, how repetition reshapes the brain's motor cortex, and why gesture consistency matters more than model accuracy.", readTime:"5 min", date:"2026-01-14", dateLabel:"Jan 14, 2026", likes:52 },
  { id:6,  slug:"/education/phantom-limb",        tag:"Neuroscience",      title:"The ghost in the electrode",                            summary:"Amputees generate measurable EMG from limbs they no longer have. What phantom limb signals reveal about cortical remapping and the future of prosthetic control.", readTime:"6 min", date:"2025-12-03", dateLabel:"Dec 3, 2025",  likes:61 },
  { id:7,  slug:"/education/why-emg-is-hard",     tag:"Signal processing", title:"Why EMG is harder than it looks",                       summary:"Lab accuracy numbers are impressive. Real-world performance is not. A systematic breakdown of the six reasons EMG gesture classification keeps failing outside the lab.", readTime:"7 min", date:"2025-11-18", dateLabel:"Nov 18, 2025", likes:44 },
  { id:8,  slug:"/education/build-your-own",      tag:"Hardware",          title:"Build your own EMG sensor for under $60",               summary:"A complete weekend project: parts list, wiring, Arduino firmware, electrode placement, and signal quality checks. From zero to streaming muscle signals in an afternoon.", readTime:"8 min", date:"2025-10-30", dateLabel:"Oct 30, 2025", likes:89 },
  { id:9,  slug:"/education/future-of-bci",       tag:"Future",            title:"After EMG: what comes next",                            summary:"Surface EMG is one point on a spectrum from skin-surface sensing to direct neural recording. Where the field is heading - high-density arrays, peripheral nerve interfaces.", readTime:"6 min", date:"2025-09-22", dateLabel:"Sep 22, 2025", likes:73 },
  { id:10, slug:"/education/ethics-of-emg",       tag:"Ethics",            title:"Who owns your muscle data?",                            summary:"EMG signals can identify you, reveal your health status, and expose conditions you don't know you have. As gesture interfaces go mainstream, these questions can't wait.", readTime:"5 min", date:"2025-08-14", dateLabel:"Aug 14, 2025", likes:38 },
  { id:11, slug:"/education/windowing-explained", tag:"Signal processing", title:"The art of cutting a signal into pieces",                summary:"Window size, overlap, and step size are the least glamorous choices in EMG classification - and silently the most consequential. Here's what they actually control.", readTime:"7 min", date:"2025-07-05", dateLabel:"Jul 5, 2025",  likes:29 },
]

const LEARNING_PATH = [
  { track:"Core science",  color:BLUE,   articles:[1,11,7,2,4] },
  { track:"Biology",       color:AMBER,  articles:[5,6]         },
  { track:"Real world",    color:GREEN,  articles:[8,3,10,9]    },
]

// ── unique card header illustrations ─────────────────────────────────────────

function FoundationsViz() {
  const pts = (amp, freq, phase, N=120) =>
    Array.from({length:N},(_,i) => {
      const x = (i/N)*100
      const y = 50 + amp * Math.sin(i * freq + phase) + (amp*0.4) * Math.sin(i * freq*2.3 + phase)
      return `${i===0?"M":"L"}${x},${y}`
    }).join(" ")
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width:"100%", height:"100%", display:"block" }}>
      <defs>
        <style>{`
          @keyframes dashScroll { from{stroke-dashoffset:300} to{stroke-dashoffset:0} }
        `}</style>
      </defs>
      <rect width="100" height="100" fill={`${PINK}08`}/>
      {[
        { amp:12, freq:0.18, phase:0, color:`${PINK}55` },
        { amp:9,  freq:0.24, phase:2, color:`${PINK}80` },
        { amp:7,  freq:0.31, phase:4, color:PINK         },
      ].map((ch,i) => (
        <path key={i} d={pts(ch.amp,ch.freq,ch.phase)} fill="none" stroke={ch.color} strokeWidth={i===2?1.5:1}
          strokeDasharray={300} style={{ animation:`dashScroll ${2.5+i*0.4}s linear infinite` }}/>
      ))}
      <text x={50} y={15} textAnchor="middle" fill={`${PINK}40`} fontSize={6} fontWeight={700} letterSpacing="0.12em">EMG · 200 Hz · 16 ch</text>
    </svg>
  )
}

function MLViz() {
  const bars = [["RF",84.85,BLUE],["SVM",82.3,`${BLUE}90`],["k-NN",76.4,`${BLUE}70`],["LDA",71.8,`${BLUE}50`]]
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width:"100%", height:"100%", display:"block" }}>
      <rect width="100" height="100" fill={`${BLUE}08`}/>
      {bars.map(([label,val,color],i) => (
        <g key={label}>
          <text x={2} y={16+i*20} fill={`${BLUE}70`} fontSize={5.5} fontWeight={600}>{label}</text>
          <rect x={18} y={9+i*20} width={val*0.75} height={10} fill={color} rx={2}/>
          <text x={18+val*0.75+2} y={16+i*20} fill={`${BLUE}CC`} fontSize={5} fontWeight={700}>{val}%</text>
        </g>
      ))}
      <line x1={18} x2={18+84.85*0.75} y1={86} y2={86} stroke={`${BLUE}30`} strokeWidth={0.5}/>
      <text x={50} y={93} textAnchor="middle" fill={`${BLUE}40`} fontSize={5.5} letterSpacing="0.1em">CROSS-SUBJECT ACCURACY</text>
    </svg>
  )
}

function SignalViz() {
  const N = 100
  function rawPow(f) {
    const muscle    = 0.85 * Math.exp(-Math.pow(f-80,2) / (2*45*45))
    const motion    = f < 22 ? 0.55 * Math.exp(-f/5) : 0
    const powerline = 0.42 * Math.exp(-Math.pow(f-50,2) / (2*2*2))
    return Math.min(1, muscle + motion + powerline + 0.07)
  }
  const pts = Array.from({length:N},(_,i) => {
    const f = (i/N)*200
    const p = rawPow(f)
    return { f, p }
  })
  const tx = f => (f/200)*100
  const ty = p => 88 - p*75
  const lineD = pts.map((p,i)=>`${i===0?"M":"L"}${tx(p.f)},${ty(p.p)}`).join(" ")
  const areaD = `${lineD} L${tx(200)},88 L${tx(0)},88 Z`
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width:"100%", height:"100%", display:"block" }}>
      <defs>
        <linearGradient id="sfGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CYAN} stopOpacity="0.4"/>
          <stop offset="100%" stopColor={CYAN} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`${CYAN}08`}/>
      {/* Noise zones */}
      <rect x={0}  y={0} width={tx(20)}           height={88} fill="rgba(239,68,68,0.07)"/>
      <rect x={tx(20)} y={0} width={tx(90)-tx(20)} height={88} fill={`${GREEN}08`}/>
      {/* Area + line */}
      <path d={areaD} fill="url(#sfGrad)"/>
      <path d={lineD} fill="none" stroke={CYAN} strokeWidth={1.2}/>
      {/* Band labels */}
      <text x={10}  y={10} textAnchor="middle" fill="rgba(239,68,68,0.6)" fontSize={4.5}>noise</text>
      <text x={55}  y={10} textAnchor="middle" fill={`${GREEN}80`}         fontSize={4.5}>useful 20–90Hz</text>
      <text x={tx(50)} y={22} textAnchor="middle" fill="rgba(239,68,68,0.65)" fontSize={4} fontWeight={700}>50Hz ▲</text>
    </svg>
  )
}

function NeuroViz() {
  const nodes = [
    {x:50,y:30},{x:20,y:55},{x:80,y:55},{x:35,y:80},{x:65,y:80},{x:50,y:60},{x:25,y:30},{x:75,y:30},
  ]
  const edges = [[0,1],[0,2],[0,5],[1,3],[2,4],[1,5],[2,5],[3,4],[6,0],[7,0],[6,1],[7,2]]
  return (
    <svg viewBox="0 0 100 100" style={{ width:"100%", height:"100%", display:"block" }}>
      <defs>
        <style>{`
          @keyframes nodePulse { 0%,100%{opacity:0.5;r:3} 50%{opacity:1;r:4.5} }
          @keyframes nodePulse2 { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        `}</style>
      </defs>
      <rect width="100" height="100" fill={`${AMBER}07`}/>
      {edges.map(([a,b],i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke={`${AMBER}35`} strokeWidth={0.7}/>
      ))}
      {nodes.map((n,i) => (
        <circle key={i} cx={n.x} cy={n.y} r={3.5}
          fill={AMBER} opacity={0.7}
          style={{ animation:`nodePulse ${1.4+i*0.3}s ease-in-out infinite`, animationDelay:`${i*0.18}s` }}/>
      ))}
      <text x={50} y={95} textAnchor="middle" fill={`${AMBER}50`} fontSize={5} letterSpacing="0.1em">MOTOR CORTEX NETWORK</text>
    </svg>
  )
}

function DatasetViz() {
  const SUBJECTS = 10, GESTURES = 6
  return (
    <svg viewBox="0 0 100 100" style={{ width:"100%", height:"100%", display:"block" }}>
      <defs>
        <style>{`@keyframes dotIn{from{opacity:0;r:0}to{opacity:0.85;r:3.5}}`}</style>
      </defs>
      <rect width="100" height="100" fill={`${GREEN}07`}/>
      {Array.from({length:SUBJECTS},(_,s) =>
        Array.from({length:GESTURES},(_,g) => {
          const x = 14 + g * 14
          const y = 12 + s * 8
          const highlight = s < 3 && g < 2
          return (
            <circle key={`${s}-${g}`} cx={x} cy={y} r={3.2}
              fill={highlight ? GREEN : `${GREEN}60`}
              style={{ animation:`dotIn 0.4s ease ${(s*GESTURES+g)*0.025}s both` }}/>
          )
        })
      )}
      {GESTURES > 0 && Array.from({length:GESTURES},(_,g) => (
        <text key={g} x={14+g*14} y={97} textAnchor="middle" fill={`${GREEN}50`} fontSize={4.5}>G{g+1}</text>
      ))}
      {SUBJECTS > 0 && Array.from({length:SUBJECTS},(_,s) => (
        <text key={s} x={4} y={14+s*8} textAnchor="middle" fill={`${GREEN}45`} fontSize={4.5}>S{s+1}</text>
      ))}
      <text x={50} y={90} textAnchor="middle" fill={`${GREEN}55`} fontSize={4.5} letterSpacing="0.1em">16,269 LABELLED WINDOWS</text>
    </svg>
  )
}

function HardwareViz() {
  const electrodes = [0,1,2,3,4,5,6,7].map(i => ({
    x: 50 + 32 * Math.cos((i/8)*Math.PI*2),
    y: 45 + 22 * Math.sin((i/8)*Math.PI*2),
  }))
  return (
    <svg viewBox="0 0 100 100" style={{ width:"100%", height:"100%", display:"block" }}>
      <defs>
        <style>{`@keyframes elPulse{0%,100%{opacity:0.6}50%{opacity:1}}`}</style>
      </defs>
      <rect width="100" height="100" fill={`${LIME}07`}/>
      {/* Forearm ellipse */}
      <ellipse cx={50} cy={45} rx={32} ry={22} fill="none" stroke={`${LIME}40`} strokeWidth={1.5} strokeDasharray="3,2"/>
      {/* Inner ellipse (fascia) */}
      <ellipse cx={50} cy={45} rx={20} ry={13} fill={`${LIME}10`} stroke={`${LIME}25`} strokeWidth={0.8}/>
      {/* Bones */}
      <ellipse cx={43} cy={45} rx={4} ry={5} fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth={0.8}/>
      <ellipse cx={57} cy={45} rx={5} ry={6} fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth={0.8}/>
      {/* Electrode dots + wires */}
      {electrodes.map((e,i) => (
        <g key={i}>
          <line x1={e.x} y1={e.y} x2={82} y2={70+i*3} stroke={`${LIME}25`} strokeWidth={0.5}/>
          <circle cx={e.x} cy={e.y} r={3.5} fill={LIME} opacity={0.85}
            style={{ animation:`elPulse ${1.2+i*0.15}s ease-in-out infinite`, animationDelay:`${i*0.1}s` }}/>
        </g>
      ))}
      {/* Arduino box */}
      <rect x={76} y={65} width={18} height={24} fill={`${LIME}20`} stroke={LIME} strokeWidth={1} rx={2}/>
      <text x={85} y={76} textAnchor="middle" fill={`${LIME}CC`} fontSize={4} fontWeight={700}>UNO</text>
      <text x={85} y={82} textAnchor="middle" fill={`${LIME}80`} fontSize={3.5}>R3</text>
      <text x={50} y={95} textAnchor="middle" fill={`${LIME}50`} fontSize={4.5} letterSpacing="0.1em">$60 HARDWARE BUILD</text>
    </svg>
  )
}

function EthicsViz() {
  return (
    <svg viewBox="0 0 100 100" style={{ width:"100%", height:"100%", display:"block" }}>
      <defs>
        <style>{`@keyframes dataFlow{0%{stroke-dashoffset:40}100%{stroke-dashoffset:0}}
                 @keyframes lockPulse{0%,100%{opacity:0.7}50%{opacity:1}}`}</style>
      </defs>
      <rect width="100" height="100" fill={`${ROSE}07`}/>
      {/* Central lock */}
      <rect x={42} y={44} width={16} height={14} rx={3} fill={`${ROSE}25`} stroke={ROSE} strokeWidth={1.5}
        style={{ animation:"lockPulse 2s ease-in-out infinite" }}/>
      <path d={`M46,44 Q46,36 50,36 Q54,36 54,44`} fill="none" stroke={ROSE} strokeWidth={1.5}/>
      <circle cx={50} cy={52} r={2} fill={ROSE}/>
      {/* Data streams coming in/blocked */}
      {[0,60,120,180,240,300].map((angle,i) => {
        const rad = (angle * Math.PI) / 180
        const x1 = 50 + 30 * Math.cos(rad), y1 = 50 + 30 * Math.sin(rad)
        const x2 = 50 + 18 * Math.cos(rad), y2 = 50 + 18 * Math.sin(rad)
        const blocked = i % 2 === 1
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={blocked ? "rgba(239,68,68,0.5)" : `${ROSE}50`} strokeWidth={1}
              strokeDasharray={blocked ? "3,2" : "4,2"}
              style={{ animation: !blocked ? `dataFlow ${1.5+i*0.2}s linear infinite` : "none" }}/>
            {blocked && <text x={x1} y={y1+1} textAnchor="middle" fill="rgba(239,68,68,0.7)" fontSize={6}>✕</text>}
            {!blocked && <circle cx={x1} cy={y1} r={2.5} fill={`${ROSE}70`}/>}
          </g>
        )
      })}
      <text x={50} y={93} textAnchor="middle" fill={`${ROSE}50`} fontSize={4.5} letterSpacing="0.1em">DATA SOVEREIGNTY</text>
    </svg>
  )
}

function FutureViz() {
  const milestones = [
    { x:10, y:75, label:"sEMG" },
    { x:32, y:60, label:"HD-sEMG" },
    { x:54, y:42, label:"PNI" },
    { x:76, y:28, label:"ECoG" },
    { x:90, y:18, label:"BCI" },
  ]
  const lineD = milestones.map((m,i)=>`${i===0?"M":"L"}${m.x},${m.y}`).join(" ")
  return (
    <svg viewBox="0 0 100 100" style={{ width:"100%", height:"100%", display:"block" }}>
      <defs>
        <linearGradient id="futGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={PURPLE2} stopOpacity="0.5"/>
          <stop offset="100%" stopColor={PURPLE2}/>
        </linearGradient>
        <style>{`@keyframes futureLine{from{stroke-dashoffset:300}to{stroke-dashoffset:0}}`}</style>
      </defs>
      <rect width="100" height="100" fill={`${PURPLE2}07`}/>
      {/* Grid */}
      {[20,40,60,80].map(y=><line key={y} x1={0} x2={100} y1={y} y2={y} stroke={`${PURPLE2}10`} strokeWidth={0.5}/>)}
      {/* Area fill */}
      <path d={`${lineD} L${milestones[milestones.length-1].x},88 L${milestones[0].x},88 Z`} fill={`${PURPLE2}12`}/>
      {/* Line */}
      <path d={lineD} fill="none" stroke="url(#futGrad)" strokeWidth={2}
        strokeDasharray={300} style={{ animation:"futureLine 2s cubic-bezier(0.22,1,0.36,1) both" }}/>
      {/* Milestone dots + labels */}
      {milestones.map((m,i) => (
        <g key={i}>
          <circle cx={m.x} cy={m.y} r={i===0?3:3.5} fill={PURPLE2} opacity={0.9}/>
          <text x={m.x} y={m.y+10} textAnchor="middle" fill={`${PURPLE2}80`} fontSize={4.5} fontWeight={600}>{m.label}</text>
        </g>
      ))}
      <text x={50} y={95} textAnchor="middle" fill={`${PURPLE2}50`} fontSize={4.5} letterSpacing="0.1em">SENSING SPECTRUM</text>
    </svg>
  )
}

function AccessViz() {
  const bars = [
    { label:"Lab",     val:95, cost:"$50k+",  color:`${PURPLE}45` },
    { label:"Desktop", val:62, cost:"$200",   color:`${PURPLE}70` },
    { label:"Pocket",  val:30, cost:"$60",    color:PURPLE         },
  ]
  return (
    <svg viewBox="0 0 100 100" style={{ width:"100%", height:"100%", display:"block" }}>
      <defs>
        <style>{`@keyframes barDown{from{height:0;y:88}to{}}`}</style>
      </defs>
      <rect width="100" height="100" fill={`${PURPLE}07`}/>
      {bars.map((b,i) => (
        <g key={b.label}>
          <rect x={18+i*26} y={88-b.val*0.72} width={18} height={b.val*0.72} fill={b.color} rx={2}
            style={{ animation:`barDown 0.8s cubic-bezier(0.22,1,0.36,1) ${i*0.15}s both` }}/>
          <text x={27+i*26} y={93} textAnchor="middle" fill={`${PURPLE}80`} fontSize={5} fontWeight={600}>{b.label}</text>
          <text x={27+i*26} y={82-b.val*0.72} textAnchor="middle" fill={`${PURPLE}CC`} fontSize={4.5}>{b.cost}</text>
        </g>
      ))}
      <text x={50} y={8} textAnchor="middle" fill={`${PURPLE}50`} fontSize={4.5} letterSpacing="0.1em">COST OVER TIME ↓</text>
    </svg>
  )
}

function CardViz({ tag }) {
  const h = 90
  const style = { height:h, width:"100%", overflow:"hidden", display:"block" }
  const wrap = (el) => <div style={style}>{el}</div>

  switch (tag) {
    case "Foundations":       return wrap(<FoundationsViz/>)
    case "Machine Learning":  return wrap(<MLViz/>)
    case "Signal processing": return wrap(<SignalViz/>)
    case "Neuroscience":      return wrap(<NeuroViz/>)
    case "Dataset":           return wrap(<DatasetViz/>)
    case "Hardware":          return wrap(<HardwareViz/>)
    case "Ethics":            return wrap(<EthicsViz/>)
    case "Future":            return wrap(<FutureViz/>)
    case "Accessibility":     return wrap(<AccessViz/>)
    default:                  return wrap(<FoundationsViz/>)
  }
}

// ── topic constellation ───────────────────────────────────────────────────────
const CONSTELLATION_NODES = [
  { tag:"Foundations",       x:50, y:32, count:1, size:10 },
  { tag:"Machine Learning",  x:72, y:22, count:1, size:8  },
  { tag:"Signal processing", x:80, y:50, count:2, size:9  },
  { tag:"Neuroscience",      x:65, y:72, count:2, size:9  },
  { tag:"Dataset",           x:35, y:72, count:1, size:8  },
  { tag:"Hardware",          x:20, y:52, count:1, size:7  },
  { tag:"Ethics",            x:28, y:22, count:1, size:7  },
  { tag:"Future",            x:50, y:82, count:1, size:8  },
  { tag:"Accessibility",     x:35, y:45, count:1, size:7  },
]
const CONSTELLATION_EDGES = [
  [0,1],[0,2],[0,3],[0,8],[1,2],[1,3],[2,5],[3,4],[3,7],[4,7],[5,8],[6,8],[6,0],[7,3],
]

function TopicConstellation() {
  const nodeStyles = CONSTELLATION_NODES.map((_,i) => ({
    animation:`constellationBob${i%3} ${2+i*0.4}s ease-in-out infinite`,
    animationDelay:`${i*0.22}s`,
  }))

  return (
    <div style={{ position:"absolute", right:0, top:0, width:"45%", height:"100%", zIndex:2, opacity:0.5 }}>
      <style>{`
        @keyframes constellationBob0{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes constellationBob1{0%,100%{transform:translateY(-3px)}50%{transform:translateY(4px)}}
        @keyframes constellationBob2{0%,100%{transform:translateY(2px)}50%{transform:translateY(-5px)}}
      `}</style>
      <svg viewBox="0 0 100 100" style={{ width:"100%", height:"100%", overflow:"visible" }}>
        {CONSTELLATION_EDGES.map(([a,b],i) => {
          const na = CONSTELLATION_NODES[a], nb = CONSTELLATION_NODES[b]
          return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="rgba(255,255,255,0.12)" strokeWidth={0.6}/>
        })}
        {CONSTELLATION_NODES.map((n,i) => {
          const tc = TAG_COLORS[n.tag]
          return (
            <g key={n.tag} style={nodeStyles[i]}>
              <circle cx={n.x} cy={n.y} r={n.size} fill={`${tc.text}30`} stroke={`${tc.text}60`} strokeWidth={1}/>
              <circle cx={n.x} cy={n.y} r={n.size*0.5} fill={tc.text} opacity={0.9}/>
              <text x={n.x} y={n.y+n.size+5} textAnchor="middle" fill={`${tc.text}90`} fontSize={4} fontWeight={600}>
                {n.tag.split(" ")[0]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── learning path ─────────────────────────────────────────────────────────────
function LearningPath({ navigate }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div style={{ marginBottom:64 }}>
      <Reveal>
        <SectionPill>Suggested reading</SectionPill>
        <h2 style={{ fontSize:"clamp(18px,2.5vw,26px)", fontWeight:700, letterSpacing:"-0.7px", color:"var(--text)", marginBottom:6 }}>Three tracks through the material</h2>
        <p style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, marginBottom:28, maxWidth:520 }}>
          New to EMG? Start with Core science. Already know the basics? Jump to Biology or Real World.
        </p>
      </Reveal>
      <div style={{ display:"grid", gap:16 }}>
        {LEARNING_PATH.map((track) => {
          const trackArticles = track.articles.map(id => ARTICLES.find(a => a.id === id))
          return (
            <Reveal key={track.track}>
              <div style={{ background:"var(--bg-secondary)", border:`1px solid ${track.color}22`, borderRadius:14, padding:"16px 20px", borderLeft:`4px solid ${track.color}` }}>
                <div style={{ fontSize:10, fontWeight:700, color:track.color, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>{track.track}</div>
                <div style={{ display:"flex", alignItems:"center", gap:0, overflowX:"auto", paddingBottom:4 }}>
                  {trackArticles.map((article, idx) => {
                    const tc = TAG_COLORS[article.tag]
                    const isHov = hovered === article.id
                    return (
                      <div key={article.id} style={{ display:"flex", alignItems:"center", flexShrink:0 }}>
                        <div
                          onClick={() => navigate(article.slug)}
                          onMouseEnter={() => setHovered(article.id)}
                          onMouseLeave={() => setHovered(null)}
                          style={{
                            border:`1px solid ${isHov ? tc.text : tc.border}`,
                            background: isHov ? `${tc.text}12` : tc.bg,
                            borderRadius:8, padding:"8px 12px", cursor:"pointer",
                            transition:"all 0.2s", minWidth:130,
                          }}
                        >
                          <div style={{ fontSize:9, fontWeight:700, color:tc.text, marginBottom:3 }}>
                            #{article.id} · {article.readTime}
                          </div>
                          <div style={{ fontSize:11, fontWeight:600, color:"var(--text)", lineHeight:1.3 }}>
                            {article.title.length > 38 ? article.title.slice(0,38)+"…" : article.title}
                          </div>
                        </div>
                        {idx < trackArticles.length - 1 && (
                          <div style={{ padding:"0 6px", color:`${track.color}70`, fontSize:14, flexShrink:0 }}>→</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>
    </div>
  )
}

// ── topic coverage bar chart ──────────────────────────────────────────────────
function TopicCoverage() {
  const counts = Object.entries(
    ARTICLES.reduce((acc, a) => ({ ...acc, [a.tag]: (acc[a.tag]||0)+1 }), {})
  ).sort((a,b) => b[1]-a[1])
  const maxCount = Math.max(...counts.map(([,c])=>c))
  const totalLikes = ARTICLES.reduce((s,a)=>s+a.likes, 0)

  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e])=>{ if(e.isIntersecting) setVis(true) },{ threshold:0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, marginBottom:56 }}>
      {/* Tag coverage */}
      <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:14, padding:"24px 24px" }}>
        <div style={{ fontSize:11, fontWeight:700, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:16 }}>Topic coverage</div>
        {counts.map(([tag,count],i) => {
          const tc = TAG_COLORS[tag] || TAG_COLORS["Foundations"]
          return (
            <div key={tag} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:11, color:"var(--text-secondary)", fontWeight:400 }}>{tag}</span>
                <span style={{ fontSize:11, fontWeight:700, color:tc.text }}>{count} {count===1?"article":"articles"}</span>
              </div>
              <div style={{ height:5, background:"rgba(255,255,255,0.06)", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width: vis?`${(count/maxCount)*100}%`:"0%", background:tc.text, borderRadius:99, transition:`width 0.8s cubic-bezier(0.22,1,0.36,1) ${i*0.07}s` }}/>
              </div>
            </div>
          )
        })}
      </div>
      {/* At a glance stats */}
      <div style={{ display:"grid", gridTemplateRows:"1fr 1fr", gap:14 }}>
        <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:14, padding:"20px 22px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Top article by reads</div>
          {(() => {
            const top = [...ARTICLES].sort((a,b)=>b.likes-a.likes)[0]
            const tc = TAG_COLORS[top.tag]
            return (
              <div>
                <div style={{ fontSize:28, fontWeight:800, color:tc.text, letterSpacing:"-1.5px", marginBottom:4 }}>♥ {top.likes}</div>
                <div style={{ fontSize:12, fontWeight:600, color:"var(--text)", marginBottom:3, lineHeight:1.3 }}>{top.title}</div>
                <span style={{ fontSize:10, color:tc.text, background:tc.bg, border:`1px solid ${tc.border}`, borderRadius:100, padding:"2px 8px" }}>{top.tag}</span>
              </div>
            )
          })()}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {[
            { v:"11", l:"Articles published", c:PINK   },
            { v:`${totalLikes}+`, l:"Total reader likes", c:BLUE   },
            { v:"9",  l:"Topics covered",     c:GREEN  },
            { v:"65 min", l:"Total reading time",  c:PURPLE },
          ].map(({ v, l, c }) => (
            <div key={l} style={{ background:"var(--bg-secondary)", border:`1px solid ${c}18`, borderRadius:12, padding:"14px 16px" }}>
              <div style={{ fontSize:22, fontWeight:800, color:c, letterSpacing:"-1px", marginBottom:2 }}>{v}</div>
              <div style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── article card ──────────────────────────────────────────────────────────────
function ArticleCard({ article }) {
  const navigate = useNavigate()
  const tc = TAG_COLORS[article.tag] || TAG_COLORS["Foundations"]
  const [hov, setHov] = useState(false)

  return (
    <div
      onClick={() => navigate(article.slug)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius:14, border:`1px solid ${hov ? tc.text+"40" : "var(--border)"}`,
        overflow:"hidden", cursor:"pointer", background:"var(--bg)",
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hov ? `0 16px 40px rgba(0,0,0,0.12), 0 0 0 1px ${tc.text}15` : "none",
        transition:"all 0.22s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Unique visual header */}
      <div style={{ height:90, borderBottom:`1px solid ${hov ? tc.text+"25" : "var(--border)"}`, position:"relative", transition:"border-color 0.2s" }}>
        <CardViz tag={article.tag}/>
        {/* Overlay badges */}
        <div style={{ position:"absolute", top:10, left:12, display:"flex", gap:6, alignItems:"center" }}>
          <span style={{ fontSize:9.5, fontWeight:700, color:tc.text, background:tc.bg, border:`1px solid ${tc.border}`, borderRadius:100, padding:"2px 9px", backdropFilter:"blur(8px)" }}>
            {article.tag}
          </span>
        </div>
        <div style={{ position:"absolute", top:10, right:12, display:"flex", gap:6, alignItems:"center" }}>
          <span style={{ fontSize:9.5, color:"rgba(255,255,255,0.5)", fontWeight:300, background:"rgba(0,0,0,0.35)", borderRadius:100, padding:"2px 8px", backdropFilter:"blur(4px)" }}>
            {article.readTime}
          </span>
        </div>
        <div style={{ position:"absolute", bottom:10, right:12, fontSize:18, fontWeight:900, color:`${tc.text}18`, fontFamily:"monospace", lineHeight:1 }}>
          {String(article.id).padStart(2,"0")}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding:"16px 18px" }}>
        <h2 style={{ fontSize:14, fontWeight:700, color:"var(--text)", letterSpacing:"-0.2px", lineHeight:1.35, marginBottom:8 }}>
          {article.title}
        </h2>
        <p style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.65, margin:"0 0 14px" }}>
          {article.summary}
        </p>
        <div style={{ display:"flex", gap:8, alignItems:"center", borderTop:"1px solid var(--border)", paddingTop:12 }}>
          <span style={{ fontSize:10.5, color:"var(--text-tertiary)", fontWeight:300 }}>{article.dateLabel}</span>
          <span style={{ marginLeft:"auto", fontSize:11, color:`${tc.text}80`, fontWeight:500, display:"flex", alignItems:"center", gap:3 }}>
            <span style={{ fontSize:12 }}>♥</span>{article.likes}
          </span>
          <span style={{ fontSize:11.5, color: hov ? tc.text : "var(--text-secondary)", fontWeight:600, transition:"color 0.2s" }}>
            Read →
          </span>
        </div>
      </div>
    </div>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { key:"latest",  label:"Latest"        },
  { key:"popular", label:"Most popular"  },
  { key:"helpful", label:"A→Z"           },
]

function sorted(articles, key) {
  const a = [...articles]
  if (key === "latest")  return a.sort((x,y)=>y.date.localeCompare(x.date))
  if (key === "popular") return a.sort((x,y)=>y.likes-x.likes)
  if (key === "helpful") return a.sort((x,y)=>x.title.localeCompare(y.title))
  return a
}

export default function Education() {
  const navigate = useNavigate()
  const [sortKey, setSortKey]   = useState("latest")
  const [tagFilter, setTagFilter] = useState("All")
  const [search, setSearch]     = useState("")

  const allTags = ["All", ...Object.keys(TAG_COLORS)]
  const filtered = ARTICLES
    .filter(a => tagFilter === "All" || a.tag === tagFilter)
    .filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.summary.toLowerCase().includes(search.toLowerCase()))
  const displayed = sorted(filtered, sortKey)

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar/>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid var(--border)", padding:"110px 32px 72px", minHeight:400 }}>
        <NeuralNoise color={[0.06, 0.72, 0.56]} opacity={0.85} speed={0.0006}/>
        <div style={{ position:"absolute", inset:0, background:"rgba(3,0,18,0.62)", zIndex:1 }}/>
        <TopicConstellation/>
        <div style={{ maxWidth:960, margin:"0 auto", position:"relative", zIndex:3 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.08)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,45,120,0.3)", borderRadius:100, padding:"5px 16px", fontSize:11, fontWeight:600, color:PINK, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:28 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:PINK, display:"inline-block" }}/>
            Education hub
          </div>
          <h1 style={{ fontSize:"clamp(36px,5.5vw,62px)", fontWeight:700, letterSpacing:"-0.03em", lineHeight:1.05, color:"#fff", marginBottom:22, maxWidth:620 }}>
            Learn about EMG<br/>
            <span style={{ background:`linear-gradient(90deg,${PINK},${PURPLE})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              and assistive technology.
            </span>
          </h1>
          <p style={{ fontSize:17, lineHeight:1.8, color:"rgba(255,255,255,0.65)", fontWeight:300, maxWidth:"52ch", marginBottom:36 }}>
            Eleven in-depth articles on the science behind myojam - from how muscles generate electrical signals to how machine learning classifies them into computer actions.
          </p>
          {/* Stat pills */}
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            {[
              { v:"11", l:"articles", c:PINK    },
              { v:"9",  l:"topics",   c:BLUE    },
              { v:"450+", l:"reads",  c:GREEN   },
              { v:"65 min", l:"total reading time", c:PURPLE },
            ].map(s=>(
              <div key={s.l} style={{ background:`${s.c}14`, border:`1px solid ${s.c}30`, borderRadius:99, padding:"6px 14px", display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:14, fontWeight:700, color:s.c }}>{s.v}</span>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"56px 32px 80px" }}>

        {/* ── Learning path ─────────────────────────────────────────── */}
        <LearningPath navigate={navigate}/>

        {/* ── Topic coverage ────────────────────────────────────────── */}
        <Reveal>
          <SectionPill>By the numbers</SectionPill>
          <h2 style={{ fontSize:"clamp(18px,2.5vw,26px)", fontWeight:700, letterSpacing:"-0.7px", color:"var(--text)", marginBottom:28 }}>
            What's covered.
          </h2>
        </Reveal>
        <TopicCoverage/>

        {/* ── Filter + sort ─────────────────────────────────────────── */}
        <Reveal>
          <SectionPill>All articles</SectionPill>
          <h2 style={{ fontSize:"clamp(18px,2.5vw,26px)", fontWeight:700, letterSpacing:"-0.7px", color:"var(--text)", marginBottom:20 }}>
            Browse & filter.
          </h2>
        </Reveal>

        <div style={{ marginBottom:28, display:"grid", gap:12 }}>
          {/* Search */}
          <div style={{ position:"relative" }}>
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search articles…"
              style={{ width:"100%", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px 10px 36px", fontSize:13, color:"var(--text)", fontFamily:"var(--font)", outline:"none", transition:"border-color 0.15s", boxSizing:"border-box" }}
              onFocus={e=>e.currentTarget.style.borderColor=PINK}
              onBlur={e=>e.currentTarget.style.borderColor="var(--border)"}
            />
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", opacity:0.4 }}>
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Tag filter */}
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {allTags.map(tag => {
              const active = tagFilter === tag
              const tc = TAG_COLORS[tag]
              const count = tag==="All" ? ARTICLES.length : ARTICLES.filter(a=>a.tag===tag).length
              return (
                <button key={tag} onClick={()=>setTagFilter(tag)} style={{
                  background: active ? (tc?tc.bg:"var(--accent-soft)") : "transparent",
                  color: active ? (tc?tc.text:"var(--accent)") : "var(--text-tertiary)",
                  border:`1px solid ${active?(tc?tc.border:"rgba(255,45,120,0.25)"):"var(--border)"}`,
                  borderRadius:100, padding:"5px 12px", fontSize:11, fontWeight:active?600:300,
                  cursor:"pointer", fontFamily:"var(--font)", transition:"all 0.15s", display:"flex", alignItems:"center", gap:5,
                }}>
                  {tag}
                  <span style={{ background:"rgba(127,127,127,0.12)", borderRadius:100, padding:"1px 5px", fontSize:9, opacity:0.75 }}>{count}</span>
                </button>
              )
            })}
          </div>

          {/* Sort */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300, textTransform:"uppercase", letterSpacing:"0.08em" }}>Sort</span>
            {SORT_OPTIONS.map(opt=>(
              <button key={opt.key} onClick={()=>setSortKey(opt.key)} style={{
                background: sortKey===opt.key?"var(--accent-soft)":"transparent",
                border:`1px solid ${sortKey===opt.key?"rgba(255,45,120,0.25)":"var(--border)"}`,
                borderRadius:100, padding:"5px 14px", fontSize:11.5,
                fontWeight: sortKey===opt.key?600:300,
                color: sortKey===opt.key?"var(--accent)":"var(--text-tertiary)",
                cursor:"pointer", fontFamily:"var(--font)", transition:"all 0.15s",
              }}>{opt.label}</button>
            ))}
            <span style={{ marginLeft:"auto", fontSize:12, color:"var(--text-tertiary)", fontWeight:300 }}>
              {displayed.length} article{displayed.length!==1?"s":""}
            </span>
          </div>
        </div>

        {/* ── Card grid ─────────────────────────────────────────────── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:14, marginBottom:40 }}>
          {displayed.map((a,i) => (
            <Reveal key={a.slug} delay={i*0.04}>
              <ArticleCard article={a}/>
            </Reveal>
          ))}
        </div>

        {displayed.length === 0 && (
          <div style={{ textAlign:"center", padding:"56px 0", color:"var(--text-tertiary)", fontSize:14, fontWeight:300 }}>
            No articles match - try a different filter or search term.
          </div>
        )}

        <p style={{ fontSize:13, color:"var(--text-tertiary)", fontWeight:300, textAlign:"center", lineHeight:1.7, maxWidth:"50ch", margin:"0 auto 0" }}>
          More articles in progress - signal processing, ML for biosignals, and the future of assistive input.
        </p>
      </div>

      {/* ── Contribute ───────────────────────────────────────────────── */}
      <div style={{ borderTop:"1px solid var(--border)", background:"var(--bg-secondary)", padding:"64px 32px" }}>
        <div style={{ maxWidth:960, margin:"0 auto", display:"flex", justifyContent:"space-between", alignItems:"center", gap:32, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>Contribute</div>
            <h2 style={{ fontSize:"clamp(20px,2.8vw,30px)", fontWeight:700, letterSpacing:"-0.5px", color:"var(--text)", marginBottom:10, lineHeight:1.2 }}>
              Submit your own article.
            </h2>
            <p style={{ fontSize:14, lineHeight:1.75, color:"var(--text-secondary)", fontWeight:300, maxWidth:"50ch", margin:0 }}>
              Written something about EMG, assistive technology, or myojam? We publish original work with full author credit and permanent attribution.
            </p>
          </div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            <button onClick={()=>navigate("/submit-article")} style={{ flexShrink:0, background:"var(--accent)", color:"#fff", border:"none", borderRadius:100, padding:"13px 28px", fontSize:14, fontWeight:600, fontFamily:"var(--font)", cursor:"pointer", boxShadow:`0 4px 16px ${PINK}30`, transition:"transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.04)"; e.currentTarget.style.boxShadow=`0 8px 24px ${PINK}45` }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow=`0 4px 16px ${PINK}30` }}
            >Submit an article →</button>
            <button onClick={()=>navigate("/educators")} style={{ flexShrink:0, background:"transparent", color:"var(--text-secondary)", border:"1px solid var(--border)", borderRadius:100, padding:"12px 24px", fontSize:14, fontWeight:400, fontFamily:"var(--font)", cursor:"pointer", transition:"all 0.15s" }}
              onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--accent)" }}
              onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-secondary)" }}
            >For educators →</button>
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  )
}
