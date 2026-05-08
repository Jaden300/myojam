import { useState, useEffect, useRef } from "react"
import Navbar from "../Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "../Footer"
import UpNext from "../UpNext"
import ArticleBar from "../ArticleUtils"
import NeuralNoise from "../components/NeuralNoise"

const PURPLE="#8B5CF6", BLUE="#3B82F6", GREEN="#10B981", AMBER="#F59E0B", PINK="#FF2D78", RED="#EF4444", CYAN="#06B6D4"

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

const ABSTRACT = "Surface EMG represents one point on a spectrum of human-machine interfaces that extends from skin-surface sensing to direct neural recording. This article maps that full spectrum with concrete data: channel counts, classification accuracies, clinical status, and commercial availability for each modality. The landscape spans from 16-channel consumer EMG ($68 hardware) to 1024-electrode Utah arrays capable of decoding 94 words per minute from motor cortex."

// ── BCI modality data ─────────────────────────────────────────────────────────
const MODALITIES = [
  {
    id:"01",
    name:"Surface EMG",
    abbr:"sEMG",
    color:GREEN,
    invasiveness:"None",
    invasivenessScore:1,
    channels:"8–256",
    resolution:"Muscle group (~1–5 cm)",
    bestAccuracy:"84.85% cross-subject",
    latency:"<10 ms",
    hardwareCost:"$68–$30k",
    trl:9,
    trlLabel:"Commercial",
    signal:"Summed MUAPs through skin",
    limitation:"Cross-talk, displacement sensitivity, no temporal dynamics",
    example:"myojam, Myo armband, Delsys Trigno",
  },
  {
    id:"02",
    name:"High-Density sEMG",
    abbr:"HD-sEMG",
    color:BLUE,
    invasiveness:"None",
    invasivenessScore:1,
    channels:"64–512",
    resolution:"Motor unit (~2–5 mm)",
    bestAccuracy:"95%+ with motor unit decomposition",
    latency:"<15 ms",
    hardwareCost:"$5k–$50k",
    trl:7,
    trlLabel:"Research-grade",
    signal:"Spatial sampling of motor unit territory",
    limitation:"Electrode array cost, complex signal processing",
    example:"OT Bioelettronica, GN Otometrics arrays",
  },
  {
    id:"03",
    name:"Peripheral Nerve Interface",
    abbr:"PNI",
    color:AMBER,
    invasiveness:"Peripheral surgery",
    invasivenessScore:3,
    channels:"16–100 fascicles",
    resolution:"Nerve fascicle (~0.1 mm)",
    bestAccuracy:"94% (AMI amputees, 2023)",
    latency:"<5 ms",
    hardwareCost:"$50k+ clinical",
    trl:4,
    trlLabel:"Clinical trials",
    signal:"Action potentials in nerve fascicles",
    limitation:"Surgical risk, long-term biocompatibility, FDA approval pending",
    example:"Utah Slanted Array (USEA), TIME electrode",
  },
  {
    id:"04",
    name:"Electrocorticography",
    abbr:"ECoG",
    color:PURPLE,
    invasiveness:"Craniotomy required",
    invasivenessScore:5,
    channels:"256–2048 contacts",
    resolution:"Cortical column (~1 mm)",
    bestAccuracy:"97% within-session (26 gestures)",
    latency:"<5 ms",
    hardwareCost:"$100k+ implant",
    trl:5,
    trlLabel:"Clinical research",
    signal:"Local field potentials from cortex surface",
    limitation:"Requires craniotomy; typically combined with epilepsy monitoring",
    example:"Chang Lab (UCSF), Emotiv EEG (consumer, non-implanted)",
  },
  {
    id:"05",
    name:"Intracortical Array",
    abbr:"ICA",
    color:RED,
    invasiveness:"Cortical implant",
    invasivenessScore:7,
    channels:"64–1024 electrodes",
    resolution:"Single neuron (<50 µm)",
    bestAccuracy:"94 words/min handwriting decoding (2021)",
    latency:"<3 ms",
    hardwareCost:"$200k+ system",
    trl:4,
    trlLabel:"Clinical trials",
    signal:"Individual action potentials from motor neurons",
    limitation:"Gliosis, signal degradation over years, regulatory barriers",
    example:"BrainGate (Utah array), Neuralink N1",
  },
]

// ── Invasiveness spectrum SVG ─────────────────────────────────────────────────
function SpectrumDiagram() {
  const W=580, H=140, LABH=110
  const positions=[0.08, 0.26, 0.50, 0.72, 0.92]
  const fills=[GREEN, BLUE, AMBER, PURPLE, RED]
  return (
    <svg viewBox={`0 0 ${W} ${H+40}`} width="100%">
      <defs>
        <linearGradient id="specGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={GREEN} stopOpacity="0.6"/>
          <stop offset="50%" stopColor={AMBER} stopOpacity="0.5"/>
          <stop offset="100%" stopColor={RED} stopOpacity="0.6"/>
        </linearGradient>
      </defs>
      {/* Spectrum bar */}
      <rect x={20} y={60} width={W-40} height={8} rx={4} fill="url(#specGrad)"/>
      {/* Labels */}
      <text x={20} y={52} fontSize={9} fill={GREEN} fontWeight={600}>Non-invasive</text>
      <text x={W-20} y={52} fontSize={9} fill={RED} fontWeight={600} textAnchor="end">Neurosurgery</text>
      {/* Nodes */}
      {MODALITIES.map((m, i) => {
        const x = 20 + positions[i] * (W-40)
        return (
          <g key={m.id}>
            <line x1={x} y1={68} x2={x} y2={80+i*0} stroke={fills[i]} strokeWidth={1.5} strokeDasharray="3,2"/>
            <circle cx={x} cy={64} r={7} fill={fills[i]} stroke="var(--bg)" strokeWidth={1.5}/>
            <text x={x} y={89+(i%2)*14} fontSize={9.5} fill={fills[i]} textAnchor="middle" fontWeight={600}>{m.abbr}</text>
            <text x={x} y={89+(i%2)*14+12} fontSize={8.5} fill="var(--text-tertiary)" textAnchor="middle">{m.channels} ch</text>
          </g>
        )
      })}
      <text x={W/2} y={H+32} fontSize={9} fill="var(--text-tertiary)" textAnchor="middle">← Less invasive · more accessible · lower cost · lower resolution</text>
    </svg>
  )
}

// ── Accuracy comparison chart (animated) ──────────────────────────────────────
function AccuracyChart() {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const data = [
    { label:"sEMG cross-subject (myojam)",     acc:84.85, color:GREEN,  note:"Ninapro DB5 LOSO, 6 gestures" },
    { label:"HD-sEMG with MU decomposition",   acc:95.0,  color:BLUE,   note:"Lab-grade, controlled conditions" },
    { label:"PNI — amputees (2023)",            acc:94.0,  color:AMBER,  note:"AMI + USEA, dexterous hand control" },
    { label:"ECoG — 26 gestures (within-sess)",acc:97.0,  color:PURPLE, note:"Chang Lab, UCSF, epilepsy patients" },
    { label:"ICA — handwriting (2021)",         acc:94,    color:RED,    note:"~94 wpm; BrainGate, 1 subject" },
  ]
  return (
    <div ref={ref} style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {data.map((d, i) => (
        <div key={d.label} style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:250, fontSize:11, color:"var(--text-secondary)", fontWeight:300, textAlign:"right", flexShrink:0, lineHeight:1.35 }}>{d.label}</div>
          <div style={{ flex:1, height:10, background:"var(--border)", borderRadius:100, overflow:"hidden" }}>
            <div style={{
              height:"100%",
              width: vis ? `${d.acc}%` : "0%",
              background: d.color,
              borderRadius:100,
              transition: `width 0.8s ease ${i * 0.12}s`
            }}/>
          </div>
          <div style={{ width:44, fontSize:12, fontWeight:700, color:d.color, flexShrink:0 }}>{d.acc}%</div>
          <div style={{ width:200, fontSize:10, color:"var(--text-tertiary)", fontWeight:300, fontStyle:"italic", flexShrink:0 }}>{d.note}</div>
        </div>
      ))}
    </div>
  )
}

export default function FutureBCI() {
  const navigate = useNavigate()
  const [openModal, setOpenModal] = useState(null)
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />

      <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <NeuralNoise color={[0.30, 0.20, 0.85]} opacity={0.85} speed={0.0006} />
        <div style={{ position:"absolute", inset:0, background:"rgba(3,0,18,0.65)", zIndex:1 }} />
        <div style={{ maxWidth:720, margin:"0 auto", position:"relative", zIndex:2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
            <span onClick={()=>navigate("/education")} style={{ fontSize:13, color:"var(--accent)", cursor:"pointer" }}>Education</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>→</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Future of BCI</span>
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.08)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,45,120,0.3)", borderRadius:100, padding:"5px 16px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
            Future · 7 min read
          </div>
          <h1 style={{ fontSize:"clamp(28px, 5vw, 52px)", fontWeight:600, letterSpacing:"-1.5px", color:"#fff", lineHeight:1.08, marginBottom:24 }}>
            From $68 EMG to 1024-electrode brain implants.<br/>
            <span style={{ color:"var(--accent)" }}>The full BCI spectrum, by the numbers.</span>
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.72)", fontWeight:300, lineHeight:1.75, marginBottom:36, maxWidth:580 }}>
            Surface EMG is where the spectrum starts. Here's what's above it — and what each step upstream costs, achieves, and requires.
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <FaceAvatar seed={4} size={40} />
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"#fff" }}>myojam team</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Founder & Lead Engineer · September 22, 2025</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"64px 32px 80px" }}>

        {/* Abstract */}
        <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", borderLeft:`3px solid ${PURPLE}`, padding:"24px 28px", marginBottom:44 }}>
          <div style={{ fontSize:11, fontWeight:500, color:PURPLE, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Abstract</div>
          <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0, fontStyle:"italic" }}>{ABSTRACT}</p>
        </div>

        {/* Stats strip */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0, border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:48 }}>
          {[
            { val:"5",      label:"BCI modalities",   sub:"From skin to single neuron",  color:PURPLE },
            { val:"1024",   label:"Max channels",     sub:"Utah intracortical array",     color:RED },
            { val:"94 wpm", label:"Peak throughput",  sub:"Handwriting BCI, 2021",        color:BLUE },
            { val:"$68",    label:"Min hardware",     sub:"myojam sEMG setup",            color:GREEN },
          ].map(({ val, label, sub, color }, i) => (
            <div key={label} style={{ padding:"20px 14px", background:i%2===0?"var(--bg)":"var(--bg-secondary)", borderRight:i<3?"1px solid var(--border)":"none", textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:700, color, letterSpacing:"-0.5px", marginBottom:4 }}>{val}</div>
              <div style={{ fontSize:11, fontWeight:600, color:"var(--text)", marginBottom:3 }}>{label}</div>
              <div style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Spectrum diagram */}
        <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:48 }}>
          <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>The BCI spectrum — by invasiveness</span>
          </div>
          <div style={{ padding:"24px 20px 16px" }}>
            <SpectrumDiagram />
          </div>
        </div>

        {/* Accuracy chart */}
        <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:48 }}>
          <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Best-published classification accuracy per modality</span>
            <span style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>Controlled conditions · per published study</span>
          </div>
          <div style={{ padding:"24px" }}>
            <AccuracyChart />
            <div style={{ marginTop:12, fontSize:10.5, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.7 }}>
              These are best-published figures under favorable conditions — not head-to-head comparisons. The "97% ECoG" and "94 wpm ICA" figures are within-session, single-subject results, while the sEMG figure is cross-subject. Direct comparison overstates the gap.
            </div>
          </div>
        </div>

        {/* Modality cards */}
        <div style={{ fontSize:12, fontWeight:700, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:16 }}>Each modality in depth</div>
        <div style={{ display:"grid", gap:14, marginBottom:48 }}>
          {MODALITIES.map((m) => {
            const isOpen = openModal === m.id
            return (
              <div key={m.id} style={{ border:`1px solid ${m.color}22`, borderRadius:14, overflow:"hidden", background:"var(--bg)", transition:"border-color 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=`${m.color}50`}
                onMouseLeave={e=>e.currentTarget.style.borderColor=`${m.color}22`}>
                <div style={{ display:"flex", alignItems:"center", gap:14, padding:"18px 22px", borderBottom:isOpen?`1px solid ${m.color}15`:"none" }}>
                  <div style={{ width:44, height:44, borderRadius:10, background:`${m.color}14`, border:`1px solid ${m.color}28`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontSize:13, fontWeight:800, color:m.color, fontFamily:"monospace" }}>{m.id}</span>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:4, flexWrap:"wrap" }}>
                      <span style={{ fontSize:14, fontWeight:700, color:m.color }}>{m.name}</span>
                      <span style={{ fontSize:10, fontWeight:600, color:"#fff", background:m.color, borderRadius:100, padding:"1px 8px" }}>TRL {m.trl} · {m.trlLabel}</span>
                      <span style={{ fontSize:10, fontWeight:500, color:"var(--text-tertiary)", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:100, padding:"1px 8px" }}>{m.invasiveness}</span>
                    </div>
                    <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
                      <span style={{ fontSize:11, color:"var(--text-secondary)", fontWeight:300 }}>{m.channels} channels</span>
                      <span style={{ fontSize:11, color:"var(--text-secondary)", fontWeight:300 }}>{m.bestAccuracy}</span>
                      <span style={{ fontSize:11, color:"var(--text-secondary)", fontWeight:300 }}>{m.hardwareCost}</span>
                    </div>
                  </div>
                  <button onClick={()=>setOpenModal(isOpen?null:m.id)} style={{ background:"none", border:`1px solid ${m.color}30`, borderRadius:100, padding:"4px 14px", fontSize:11, color:m.color, cursor:"pointer", fontFamily:"var(--font)", flexShrink:0 }}
                    onMouseEnter={e=>e.currentTarget.style.background=`${m.color}10`}
                    onMouseLeave={e=>e.currentTarget.style.background="none"}>
                    {isOpen?"Less ↑":"Details ↓"}
                  </button>
                </div>
                {isOpen && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0 }}>
                    {[
                      { label:"Signal source", val:m.signal },
                      { label:"Spatial resolution", val:m.resolution },
                      { label:"Best latency", val:m.latency },
                      { label:"Best accuracy", val:m.bestAccuracy },
                      { label:"Primary limitation", val:m.limitation, span:2 },
                      { label:"Example systems", val:m.example, span:2 },
                    ].map(({ label, val, span }) => (
                      <div key={label} style={{ padding:"14px 22px", borderTop:`1px solid ${m.color}12`, gridColumn:span===2?"1 / -1":"auto" }}>
                        <div style={{ fontSize:10, fontWeight:600, color:m.color, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>{label}</div>
                        <div style={{ fontSize:12.5, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.6 }}>{val}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Full comparison table */}
        <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:48 }}>
          <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Side-by-side comparison</span>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
                  {["Modality","Channels","Best accuracy","Latency","Hardware cost","Surgery?","TRL"].map(h=>(
                    <th key={h} style={{ padding:"9px 12px", textAlign:"left", fontSize:10, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODALITIES.map(({ abbr, channels, bestAccuracy, latency, hardwareCost, invasiveness, trl, color }, ri) => (
                  <tr key={abbr} style={{ borderBottom:"1px solid var(--border)", background:ri%2===0?"var(--bg)":"var(--bg-secondary)" }}>
                    <td style={{ padding:"9px 12px", fontSize:12.5, fontWeight:700, color }}>{abbr}</td>
                    <td style={{ padding:"9px 12px", fontSize:11.5, color:"var(--text-secondary)", fontFamily:"monospace" }}>{channels}</td>
                    <td style={{ padding:"9px 12px", fontSize:11.5, fontWeight:600, color }}>{bestAccuracy}</td>
                    <td style={{ padding:"9px 12px", fontSize:11.5, color:"var(--text-secondary)", fontFamily:"monospace" }}>{latency}</td>
                    <td style={{ padding:"9px 12px", fontSize:11.5, color:"var(--text-secondary)" }}>{hardwareCost}</td>
                    <td style={{ padding:"9px 12px", fontSize:11.5, color:invasiveness==="None"?GREEN:invasiveness.includes("Cortical")?RED:AMBER }}>{invasiveness}</td>
                    <td style={{ padding:"9px 12px", fontSize:11.5, fontWeight:600, color }}>{trl}/9</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding:"12px 20px", fontSize:11, color:"var(--text-tertiary)", fontWeight:300, borderTop:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
            TRL = Technology Readiness Level (1 = concept, 9 = commercial product). Best accuracy figures are maximum reported under favourable conditions — not directly comparable across modalities.
          </div>
        </div>

        {/* Conclusion */}
        <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", padding:"40px", border:"1px solid var(--border)" }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Conclusion</div>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 16px" }}>
            The spectrum isn't a competition — it's a toolkit. Surface EMG is TRL 9 and costs $68. Intracortical arrays require neurosurgery, cost $200k+, and are TRL 4. These are different solutions to different problems, and advances at the frontier don't make the accessible end obsolete.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0 }}>
            The most important near-term development for myojam-level systems isn't neural implants — it's HD-sEMG decomposition algorithms that can run in real time on consumer hardware. Getting from 84.85% to 95% cross-subject without surgery is the tractable problem. Single-neuron recording can wait.
          </p>
        </div>

        <ArticleBar
          url="https://myojam.com/education/future-of-bci"
          title="From $68 EMG to 1024-electrode brain implants: the full BCI spectrum."
          citation={{ apa:`Wong, J. (2025, September 22). From $68 EMG to 1024-electrode brain implants. myojam. https://myojam.com/education/future-of-bci` }}
          presetLikes={73}
          storageKey="like_future_bci"
        />

        <div style={{ marginTop:32, display:"flex", justifyContent:"center" }}>
          <button onClick={()=>navigate("/education")} style={{ background:"transparent", color:"var(--text-secondary)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, cursor:"pointer", fontFamily:"var(--font)" }}>
            ← Back to Education
          </button>
        </div>
      </div>

      <UpNext current="/education/future-of-bci" />
      <Footer />
    </div>
  )
}
