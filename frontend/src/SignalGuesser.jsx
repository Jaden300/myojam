import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"

const PINK   = "#FF2D78"
const BLUE   = "#3B82F6"
const GREEN  = "#10B981"
const PURPLE = "#8B5CF6"
const AMBER  = "#F59E0B"
const RED    = "#EF4444"

const GESTURES = [
  { id:"fist",   label:"Fist",        emoji:"✊", color:RED    },
  { id:"index",  label:"Index Flex",  emoji:"☝️", color:BLUE   },
  { id:"middle", label:"Middle Flex", emoji:"🖖", color:PURPLE },
  { id:"ring",   label:"Ring Flex",   emoji:"💍", color:AMBER  },
  { id:"pinky",  label:"Pinky Flex",  emoji:"🤙", color:GREEN  },
  { id:"thumb",  label:"Thumb Flex",  emoji:"👍", color:PINK   },
]

// [ch1_amp, ch2_amp, ch3_amp] × oscillation frequency
// ch1 = extensor digitorum  ch2 = flexor digitorum  ch3 = ulnar side
const PROFILES = {
  fist:   { ch:[0.92, 0.88, 0.90], freq:1.6 },
  index:  { ch:[0.82, 0.52, 0.18], freq:1.1 },
  middle: { ch:[0.65, 0.72, 0.22], freq:1.0 },
  ring:   { ch:[0.45, 0.82, 0.50], freq:0.9 },
  pinky:  { ch:[0.30, 0.78, 0.75], freq:0.88 },
  thumb:  { ch:[0.22, 0.42, 0.88], freq:1.3 },
}

const CONFIDENCES = {
  fist:   [["Fist",88],["Middle Flex",5],["Index Flex",4],["Ring Flex",2],["Pinky Flex",1],["Thumb Flex",0]],
  index:  [["Index Flex",72],["Middle Flex",18],["Thumb Flex",5],["Ring Flex",3],["Pinky Flex",1],["Fist",1]],
  middle: [["Middle Flex",68],["Index Flex",20],["Ring Flex",7],["Pinky Flex",3],["Thumb Flex",1],["Fist",1]],
  ring:   [["Ring Flex",58],["Pinky Flex",27],["Middle Flex",9],["Index Flex",4],["Thumb Flex",1],["Fist",1]],
  pinky:  [["Pinky Flex",55],["Ring Flex",30],["Middle Flex",10],["Index Flex",3],["Thumb Flex",1],["Fist",1]],
  thumb:  [["Thumb Flex",75],["Index Flex",12],["Middle Flex",8],["Pinky Flex",3],["Ring Flex",1],["Fist",1]],
}

const WHY = {
  fist:   "Fist fires all 16 channels at once — the easiest pattern to identify. A beginner move.",
  index:  "Index flex dominates ch1 (extensor region) but leaks into adjacent flexors. Mild ambiguity with middle.",
  middle: "Middle flexors spatially overlap with both index and ring. The model hedges between neighbours.",
  ring:   "Ring finger has poor voluntary isolation. Co-contraction with pinky is almost unavoidable — hence the 27% confusion.",
  pinky:  "Pinky and ring share nearly identical spatial patterns on a circumferential array. Even trained clinicians mix these up.",
  thumb:  "Thumb activates the thenar eminence — a distinct muscle group. Distinctive once the model has learned it.",
}

const RESULT_COPY = [
  { emoji:"💀", label:"Yikes.",         msg:"Legendary effort. Please don't apply to our team." },
  { emoji:"😅", label:"Rough.",         msg:"In your defense, the AI only manages 84.85% too." },
  { emoji:"🤔", label:"Getting there.", msg:"EMG is hard. Ring and pinky confuse everyone." },
  { emoji:"✅", label:"Average.",       msg:"Most humans score here. The AI averages 4.2/5 on this set." },
  { emoji:"👏", label:"Nice work.",     msg:"Better than expected. Ring–pinky probably got you once." },
  { emoji:"🧠", label:"Impressive.",    msg:"You out-guessed the AI. That's genuinely rare." },
]

const POOL = [
  {id:"fist",  seed:1.23}, {id:"index", seed:2.47}, {id:"middle",seed:3.89},
  {id:"ring",  seed:4.15}, {id:"pinky", seed:5.62}, {id:"thumb", seed:6.33},
  {id:"fist",  seed:7.81}, {id:"ring",  seed:8.24}, {id:"pinky", seed:9.55},
  {id:"index", seed:10.77},{id:"middle",seed:11.42},{id:"thumb", seed:12.19},
]

const CH_COLORS = [PINK, BLUE, GREEN]
const CH_LABELS = ["CH1 — Extensor", "CH2 — Flexor", "CH3 — Ulnar"]

function makeChannels(id, seed) {
  const {ch, freq} = PROFILES[id]
  const N=160, S=50, E=110
  return ch.map((amp, ci) => {
    const s = seed + ci * 3.71
    return Array.from({length:N}, (_,i) => {
      let env = 0
      if (i>=S && i<=E) {
        const t=(i-S)/(E-S)
        env = amp * Math.sin(t * Math.PI)
      }
      const x=i/N
      const osc =
        Math.sin(x*freq*52   + s)       * 0.44 +
        Math.sin(x*freq*113  + s*1.31)  * 0.31 +
        Math.sin(x*freq*227  + s*0.79)  * 0.16 +
        Math.sin(x*freq*451  + s*1.73)  * 0.09
      const noise = Math.sin(x*899+s*2.3)*0.04 + Math.sin(x*1453+s)*0.025
      return env * osc + noise
    })
  })
}

function Waveform({id, seed}) {
  const channels = useMemo(() => makeChannels(id, seed), [id, seed])
  const W=580, CH_H=56, PAD_Y=20, ROW_GAP=8
  const H = CH_H*3 + ROW_GAP*2 + PAD_Y*2
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:"block"}}>
      <rect width={W} height={H} fill="#030209"/>
      {channels.map((ch,ci) => {
        const cy = PAD_Y + ci*(CH_H+ROW_GAP) + CH_H/2
        const maxAbs = Math.max(0.01, ...ch.map(v=>Math.abs(v)))
        const pts = ch.map((v,i)=>{
          const x=(i/(ch.length-1))*W
          const y=cy - (v/maxAbs)*(CH_H/2 - 5)
          return `${x.toFixed(1)},${y.toFixed(1)}`
        }).join(" ")
        const color = CH_COLORS[ci]
        return (
          <g key={ci}>
            <line x1={0} x2={W} y1={cy} y2={cy} stroke={`${color}14`} strokeWidth={0.7}/>
            <text x={5} y={PAD_Y + ci*(CH_H+ROW_GAP)+11} fill={`${color}45`} fontSize={7} fontFamily="monospace">{CH_LABELS[ci]}</text>
            <polyline points={pts} fill="none" stroke={color} strokeWidth={1.7}
              strokeLinecap="round" strokeLinejoin="round"
              style={{filter:`drop-shadow(0 0 3px ${color}55)`}}/>
          </g>
        )
      })}
    </svg>
  )
}

function ConfBars({id, show}) {
  const confs = CONFIDENCES[id]
  return (
    <div style={{display:"flex",flexDirection:"column",gap:7}}>
      {confs.map(([label,pct],i) => {
        const g = GESTURES.find(g=>g.label===label)
        const isTop = i===0
        return (
          <div key={label} style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:104,fontSize:11,color:isTop?"#fff":"rgba(255,255,255,0.45)",fontWeight:isTop?600:300,textAlign:"right",flexShrink:0}}>{label}</div>
            <div style={{flex:1,height:8,background:"rgba(255,255,255,0.07)",borderRadius:100,overflow:"hidden"}}>
              <div style={{height:"100%",width:show?`${pct}%`:"0%",background:g?.color||"#fff",borderRadius:100,transition:`width 0.65s ease ${i*0.09}s`}}/>
            </div>
            <div style={{width:34,fontSize:11,fontWeight:isTop?700:300,color:isTop?g?.color:"rgba(255,255,255,0.35)",flexShrink:0,textAlign:"right"}}>{pct}%</div>
          </div>
        )
      })}
    </div>
  )
}

function shuffle(arr) {
  const a=[...arr]
  for (let i=a.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]]
  }
  return a
}

export default function SignalGuesser() {
  const navigate = useNavigate()
  const [qs]     = useState(() => shuffle(POOL).slice(0,5))
  const [qi,setQi] = useState(0)
  const [sel,setSel] = useState(null)
  const [score,setScore] = useState(0)
  const [done,setDone] = useState(false)

  const q = qs[qi]
  const revealed = sel !== null
  const correctG = GESTURES.find(g=>g.id===q?.id)

  function guess(id) {
    if (revealed) return
    setSel(id)
    if (id===q.id) setScore(s=>s+1)
  }
  function next() {
    if (qi<4) { setQi(i=>i+1); setSel(null) }
    else setDone(true)
  }

  const res = RESULT_COPY[score]

  if (done) {
    return (
      <div style={{minHeight:"100vh",background:"#05030f"}}>
        <Navbar/>
        <div style={{maxWidth:520,margin:"0 auto",padding:"120px 28px 80px",textAlign:"center"}}>
          <div style={{fontSize:72,marginBottom:12}}>{res.emoji}</div>
          <div style={{fontSize:11,fontWeight:700,color:PINK,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:10}}>Game Over</div>
          <div style={{fontSize:80,fontWeight:900,letterSpacing:"-4px",color:"#fff",lineHeight:1,marginBottom:4}}>
            {score}<span style={{fontSize:36,color:"rgba(255,255,255,0.3)",fontWeight:300}}>/5</span>
          </div>
          <div style={{fontSize:18,fontWeight:700,color:"rgba(255,255,255,0.9)",marginBottom:6}}>{res.label}</div>
          <div style={{fontSize:14,color:"rgba(255,255,255,0.55)",fontWeight:300,lineHeight:1.7,marginBottom:10}}>{res.msg}</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.28)",fontWeight:300,marginBottom:40}}>
            The AI scores 84.85% across 10 real subjects on the same gestures.
          </div>
          <div style={{height:6,background:"rgba(255,255,255,0.07)",borderRadius:100,marginBottom:44,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${score*20}%`,background:`linear-gradient(90deg,${PINK},${PURPLE})`,borderRadius:100,transition:"width 1s ease 0.3s"}}/>
          </div>
          <div style={{display:"flex",gap:12,justifyContent:"center"}}>
            <button onClick={()=>window.location.reload()}
              style={{background:PINK,color:"#fff",border:"none",borderRadius:100,padding:"12px 28px",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"var(--font)"}}>
              Play again
            </button>
            <button onClick={()=>navigate("/demos")}
              style={{background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:100,padding:"12px 28px",fontSize:14,fontWeight:400,cursor:"pointer",fontFamily:"var(--font)"}}>
              More demos →
            </button>
          </div>
        </div>
        <Footer/>
      </div>
    )
  }

  return (
    <div style={{minHeight:"100vh",background:"#05030f"}}>
      <Navbar/>
      <div style={{maxWidth:680,margin:"0 auto",padding:"96px 24px 80px"}}>

        {/* Header row */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28}}>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:PINK,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:5}}>
              Signal Guesser · Round {qi+1} of 5
            </div>
            <h1 style={{fontSize:26,fontWeight:800,color:"#fff",letterSpacing:"-0.5px",margin:0}}>
              What gesture is this?
            </h1>
          </div>
          {/* Progress dots */}
          <div style={{display:"flex",gap:7,alignItems:"center",paddingTop:6}}>
            {qs.map((_,i) => {
              const bg = i<qi ? GREEN : i===qi ? PINK : "rgba(255,255,255,0.12)"
              return <div key={i} style={{width:11,height:11,borderRadius:"50%",background:bg,transition:"background 0.3s",flexShrink:0}}/>
            })}
            <span style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginLeft:6,fontFamily:"monospace"}}>{score} pts</span>
          </div>
        </div>

        {/* Waveform card */}
        <div style={{border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,overflow:"hidden",marginBottom:20,background:"#030209"}}>
          <div style={{padding:"9px 16px",borderBottom:"1px solid rgba(255,255,255,0.05)",display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:GREEN}}/>
            <span style={{fontSize:9,color:"rgba(255,255,255,0.3)",fontFamily:"monospace",letterSpacing:"0.04em"}}>
              EMG · 200 Hz · Ninapro DB5 · 1000 ms window
            </span>
          </div>
          <Waveform id={q.id} seed={q.seed}/>
          <div style={{padding:"9px 16px",borderTop:"1px solid rgba(255,255,255,0.05)",display:"flex",gap:18}}>
            {CH_COLORS.map((c,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:16,height:2,background:c,borderRadius:1}}/>
                <span style={{fontSize:8,color:"rgba(255,255,255,0.3)",fontFamily:"monospace"}}>{CH_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Answer grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
          {GESTURES.map(g => {
            let bg="rgba(255,255,255,0.04)", border="rgba(255,255,255,0.09)", tc="rgba(255,255,255,0.72)", tf="none"
            if (revealed) {
              if (g.id===q.id)   { bg=`${g.color}20`; border=g.color; tc=g.color; tf="scale(1.05)" }
              else if (g.id===sel) { bg="rgba(239,68,68,0.12)"; border="rgba(239,68,68,0.4)"; tc="rgba(239,68,68,0.7)" }
              else                 { bg="rgba(255,255,255,0.02)"; border="rgba(255,255,255,0.04)"; tc="rgba(255,255,255,0.2)" }
            }
            return (
              <button key={g.id} onClick={()=>guess(g.id)} disabled={revealed}
                style={{background:bg,border:`1.5px solid ${border}`,borderRadius:14,padding:"14px 8px",cursor:revealed?"default":"pointer",fontFamily:"var(--font)",textAlign:"center",transition:"all 0.18s",transform:tf,color:tc}}
                onMouseEnter={e=>{if(!revealed){e.currentTarget.style.background=`${g.color}14`;e.currentTarget.style.borderColor=`${g.color}55`}}}
                onMouseLeave={e=>{if(!revealed){e.currentTarget.style.background="rgba(255,255,255,0.04)";e.currentTarget.style.borderColor="rgba(255,255,255,0.09)"}}}>
                <div style={{fontSize:28,marginBottom:5,lineHeight:1}}>{g.emoji}</div>
                <div style={{fontSize:12,fontWeight:600,lineHeight:1.3}}>{g.label}</div>
                {revealed&&g.id===q.id && <div style={{fontSize:9,marginTop:4,color:g.color,fontWeight:700}}>✓ correct</div>}
                {revealed&&g.id===sel&&g.id!==q.id && <div style={{fontSize:9,marginTop:4,color:"#EF4444"}}>✗ wrong</div>}
              </button>
            )
          })}
        </div>

        {/* Reveal panel */}
        {revealed && (
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:16,padding:"22px",marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:700,color:correctG?.color,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>
              AI Confidence Distribution
            </div>
            <ConfBars id={q.id} show={revealed}/>
            <div style={{marginTop:14,padding:"10px 14px",background:`${correctG?.color}0e`,border:`1px solid ${correctG?.color}22`,borderRadius:9}}>
              <span style={{fontSize:10,fontWeight:700,color:correctG?.color}}>Why: </span>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.55)",fontWeight:300,lineHeight:1.65}}>{WHY[q.id]}</span>
            </div>
          </div>
        )}

        {revealed && (
          <button onClick={next}
            style={{width:"100%",background:PINK,color:"#fff",border:"none",borderRadius:14,padding:"14px",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"var(--font)",transition:"opacity 0.15s,transform 0.15s"}}
            onMouseEnter={e=>{e.currentTarget.style.opacity="0.88";e.currentTarget.style.transform="translateY(-1px)"}}
            onMouseLeave={e=>{e.currentTarget.style.opacity="1";e.currentTarget.style.transform="translateY(0)"}}>
            {qi<4 ? "Next round →" : "See results →"}
          </button>
        )}
      </div>
      <Footer/>
    </div>
  )
}
