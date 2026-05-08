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

const ABSTRACT = "Phantom limb sensation is experienced by approximately 80% of amputees — and is accompanied, in most cases, by real measurable EMG signals in the residual limb that encode intended movements of the missing hand. This article examines what phantom EMG reveals about cortical plasticity, how researchers measure it, what accuracy amputee prosthetic controllers achieve using this signal, and why the existence of phantom intent matters for the design of all gesture interfaces."

// ── Cortical remapping diagram ────────────────────────────────────────────────
function RemappingDiagram() {
  const W=540, H=180
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      {/* Before */}
      <rect x={20} y={30} width={200} height={140} rx={12} fill={`${BLUE}08`} stroke={`${BLUE}25`} strokeWidth={1}/>
      <text x={120} y={55} fontSize={11} fontWeight={700} fill={BLUE} textAnchor="middle">Before amputation</text>
      {/* Cortical regions */}
      {[
        {x:60,  y:80, w:40, h:32, color:PINK,   label:"Hand\nM1"},
        {x:110, y:90, w:30, h:24, color:BLUE,   label:"Wrist"},
        {x:148, y:74, w:35, h:40, color:PURPLE, label:"Elbow\n& arm"},
        {x:50,  y:120,w:50, h:22, color:AMBER,  label:"Face"},
      ].map((r,i)=>(
        <g key={i}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={4} fill={`${r.color}20`} stroke={r.color} strokeWidth={1.2}/>
          {r.label.split("\n").map((l,li)=>(
            <text key={li} x={r.x+r.w/2} y={r.y+r.h/2-2+li*11} fontSize={7.5} fill={r.color} textAnchor="middle" fontWeight={600}>{l}</text>
          ))}
        </g>
      ))}

      {/* Arrow */}
      <text x={W/2} y={H/2+6} fontSize={24} fill="var(--text-tertiary)" textAnchor="middle">→</text>
      <text x={W/2} y={H/2+22} fontSize={9} fill="var(--text-tertiary)" textAnchor="middle">amputation</text>

      {/* After */}
      <rect x={320} y={30} width={200} height={140} rx={12} fill={`${AMBER}08`} stroke={`${AMBER}25`} strokeWidth={1}/>
      <text x={420} y={55} fontSize={11} fontWeight={700} fill={AMBER} textAnchor="middle">Years after amputation</text>
      {[
        {x:360, y:80, w:16, h:32, color:PINK,   label:"Hand"},
        {x:386, y:80, w:24, h:32, color:AMBER,  label:"Face\n(expanded)"},
        {x:418, y:74, w:45, h:40, color:PURPLE, label:"Elbow\n& arm"},
        {x:340, y:120,w:80, h:22, color:AMBER,  label:"Face (further expansion)"},
      ].map((r,i)=>(
        <g key={i}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={4} fill={`${r.color}20`} stroke={r.color} strokeWidth={1.2}/>
          {r.label.split("\n").map((l,li)=>(
            <text key={li} x={r.x+r.w/2} y={r.y+r.h/2-2+li*11} fontSize={7} fill={r.color} textAnchor="middle" fontWeight={600}>{l}</text>
          ))}
        </g>
      ))}
      {/* Phantom hand still sends signal */}
      <path d="M 376,80 Q 376,68 376,60" stroke={PINK} strokeWidth={1.5} strokeDasharray="3,2" fill="none"/>
      <text x={376} y={57} fontSize={7.5} fill={PINK} textAnchor="middle" fontWeight={600}>phantom</text>
      <text x={376} y={48} fontSize={7.5} fill={PINK} textAnchor="middle" fontWeight={600}>motor intent</text>
    </svg>
  )
}

// ── Phantom vs intact EMG comparison ─────────────────────────────────────────
const COMPARISON_ROWS = [
  { feature:"Signal source",         phantom:"Motor cortex → spinal cord → residual stump",       intact:"Motor cortex → spinal cord → forearm muscles" },
  { feature:"Signal origin",         phantom:"Intent, not anatomy",                                 intact:"Anatomy + intent" },
  { feature:"Amplitude (typical)",   phantom:"30–60% of pre-amputation amplitude (varies by years)", intact:"Stable within sessions" },
  { feature:"Gesture specificity",   phantom:"High — 6-gesture classification 76–82% (residual EMG)", intact:"84.85% cross-subject (myojam LOSO)" },
  { feature:"Session variability",   phantom:"Higher — cortical map still drifting",                intact:"Moderate (electrode placement dependent)" },
  { feature:"Calibration needed",    phantom:"Yes — residual stump mapping per user",              intact:"Optional (cross-subject model works)" },
  { feature:"Fatigue behavior",      phantom:"Less relevant — fewer muscles involved",              intact:"Frequency shift after >5 min sustained use" },
]

// ── Prevalence chart ──────────────────────────────────────────────────────────
function PrevalenceChart() {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const data = [
    { label:"Experience phantom sensation",       pct:80, color:BLUE  },
    { label:"Report phantom movement (not pain)", pct:75, color:GREEN },
    { label:"Detectable residual EMG on attempt", pct:70, color:AMBER },
    { label:"EMG sufficient for prosthetic use",  pct:45, color:PINK  },
    { label:"Achieve 6-gesture control (residual)",pct:30, color:PURPLE },
  ]
  return (
    <div ref={ref} style={{ display:"flex", flexDirection:"column", gap:11 }}>
      {data.map((d, i) => (
        <div key={d.label} style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:240, fontSize:11, color:"var(--text-secondary)", fontWeight:300, textAlign:"right", flexShrink:0, lineHeight:1.35 }}>{d.label}</div>
          <div style={{ flex:1, height:10, background:"var(--border)", borderRadius:100, overflow:"hidden" }}>
            <div style={{
              height:"100%",
              width: vis ? `${d.pct}%` : "0%",
              background: d.color,
              borderRadius:100,
              transition: `width 0.8s ease ${i * 0.12}s`
            }}/>
          </div>
          <div style={{ width:36, fontSize:12, fontWeight:700, color:d.color, flexShrink:0 }}>{d.pct}%</div>
        </div>
      ))}
      <div style={{ marginTop:8, fontSize:10, color:"var(--text-tertiary)", textAlign:"center", fontWeight:300 }}>
        Estimated prevalence among upper-limb amputees. Values synthesised from Flor (2002), Nikolajsen & Jensen (2001), Kuiken et al. (2007).
      </div>
    </div>
  )
}

export default function PhantomLimb() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />
      <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <NeuralNoise color={[0.18, 0.45, 0.90]} opacity={0.85} speed={0.0006} />
        <div style={{ position:"absolute", inset:0, background:"rgba(3,0,18,0.65)", zIndex:1 }} />
        <div style={{ maxWidth:720, margin:"0 auto", position:"relative", zIndex:2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
            <span onClick={()=>navigate("/education")} style={{ fontSize:13, color:"var(--accent)", cursor:"pointer" }}>Education</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>→</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Phantom limb EMG</span>
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.08)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,45,120,0.3)", borderRadius:100, padding:"5px 16px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
            Neuroscience · 6 min read
          </div>
          <h1 style={{ fontSize:"clamp(28px, 5vw, 52px)", fontWeight:600, letterSpacing:"-1.5px", color:"#fff", lineHeight:1.08, marginBottom:24 }}>
            The ghost in the electrode.<br/><span style={{ color:"var(--accent)" }}>80% of amputees produce measurable EMG from limbs they don't have.</span>
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.72)", fontWeight:300, lineHeight:1.75, marginBottom:36, maxWidth:580 }}>
            Phantom EMG isn't mysticism — it's evidence for how the motor cortex encodes intent, not anatomy. And it's the basis of every myoelectric prosthetic ever built.
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <FaceAvatar seed={2} size={40} />
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"#fff" }}>myojam team</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Founder & Lead Engineer · December 3, 2025</div>
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
            { val:"80%",  label:"Phantom prevalence",  sub:"Upper-limb amputees, all types",      color:BLUE },
            { val:"70%",  label:"Detectable EMG",      sub:"On attempted phantom movement",        color:GREEN },
            { val:"76–82%",label:"Prosthetic accuracy",sub:"6-gesture, residual EMG (Kuiken 2007)",color:AMBER },
            { val:"~10 yr",label:"Cortex stabilises",  sub:"Rate of post-amputation remapping",    color:PURPLE },
          ].map(({ val, label, sub, color }, i) => (
            <div key={label} style={{ padding:"20px 12px", background:i%2===0?"var(--bg)":"var(--bg-secondary)", borderRight:i<3?"1px solid var(--border)":"none", textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:700, color, letterSpacing:"-0.5px", marginBottom:4 }}>{val}</div>
              <div style={{ fontSize:11, fontWeight:600, color:"var(--text)", marginBottom:3 }}>{label}</div>
              <div style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.4 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Section 1: The phenomenon */}
        <div style={{ padding:"0 0 40px", borderBottom:"1px solid var(--border)", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${BLUE}15`, border:`1px solid ${BLUE}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:BLUE }}>01</div>
            <span style={{ fontSize:11, fontWeight:500, color:BLUE, textTransform:"uppercase", letterSpacing:"0.06em" }}>The phenomenon</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:14 }}>What phantom limb actually is</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 16px" }}>
            Phantom limb sensation is the perception that a missing limb is still present — and often still moving. About 80% of upper-limb amputees experience it, and 75% report vivid phantom movement perception. It is not a psychological aberration. It is a predictable consequence of how the brain maintains a body map.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 24px" }}>
            The sensory and motor cortex contain a point-by-point map of the body surface — the somatosensory homunculus. After amputation, the cortical territory representing the lost limb doesn't go dark. It remains active and, over months to years, gets colonised by neighbouring cortical regions (typically face and trunk). This produces the characteristic sensation that touching the cheek stimulates the phantom hand — documented by Ramachandran et al. (1992) and replicated dozens of times since.
          </p>

          {/* Prevalence chart */}
          <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
              <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Phantom EMG prevalence cascade (upper-limb amputees)</span>
            </div>
            <div style={{ padding:"24px" }}>
              <PrevalenceChart />
            </div>
          </div>
        </div>

        {/* Section 2: The signal */}
        <div style={{ padding:"0 0 40px", borderBottom:"1px solid var(--border)", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${GREEN}15`, border:`1px solid ${GREEN}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:GREEN }}>02</div>
            <span style={{ fontSize:11, fontWeight:500, color:GREEN, textTransform:"uppercase", letterSpacing:"0.06em" }}>The signal</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:14 }}>Phantom EMG is measurable and classifiable</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 16px" }}>
            When amputees attempt to move their phantom hand, the motor cortex sends motor commands via the spinal cord to whatever muscle stumps remain in the residual limb. These produce real, recordable EMG signals — sometimes 30–60% of the amplitude of the pre-amputation signal, depending on the degree of muscle loss and years since amputation.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 24px" }}>
            Kuiken et al. (2007) demonstrated that after targeted muscle reinnervation (TMR) surgery — rerouting residual nerves to intact chest muscles — amputees could achieve 76–82% accuracy on a 6-gesture classifier using the same kind of surface EMG that myojam uses. Without TMR, using only residual forearm EMG, accuracy is lower but still sufficient for 3–4 gesture control in many patients.
          </p>
          <div style={{ padding:"16px 20px", background:`${GREEN}08`, border:`1px solid ${GREEN}20`, borderRadius:10 }}>
            <p style={{ fontSize:13.5, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, margin:0 }}>
              <span style={{ fontWeight:600, color:GREEN }}>The key insight:</span> phantom EMG is driven by motor intent, not by muscle anatomy. The brain is trying to move a hand that isn't there, and the motor command leaks out as EMG in whatever tissue is available. This means intent — not limb presence — is the primary information source, and capturing intent is the fundamental design goal of any gesture interface.
            </p>
          </div>
        </div>

        {/* Section 3: Cortical remapping diagram */}
        <div style={{ padding:"0 0 40px", borderBottom:"1px solid var(--border)", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${AMBER}15`, border:`1px solid ${AMBER}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:AMBER }}>03</div>
            <span style={{ fontSize:11, fontWeight:500, color:AMBER, textTransform:"uppercase", letterSpacing:"0.06em" }}>Cortical plasticity</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:14 }}>How the brain adapts — and why it complicates prosthetic control</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 24px" }}>
            Cortical remapping is continuous and progressive. The face region begins colonising the hand territory within weeks of amputation and can expand by 1–2 cm of cortical distance over years. A prosthetic classifier calibrated 3 months after amputation may perform worse at 3 years — not because the hardware or software changed, but because the spatial pattern of motor commands shifted as the cortex reorganised.
          </p>
          <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
              <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Motor cortex representation: before vs. years after amputation</span>
            </div>
            <div style={{ padding:"20px" }}>
              <RemappingDiagram />
            </div>
            <div style={{ padding:"12px 20px", background:"var(--bg-secondary)", borderTop:"1px solid var(--border)", fontSize:11, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.6 }}>
              After amputation, face territory (amber) expands into the vacated hand region (pink shrinks). The phantom hand signal persists but is produced from a progressively smaller cortical area, increasing variability over years. Source: Ramachandran et al. (1992), Flor et al. (1998).
            </div>
          </div>
        </div>

        {/* Section 4: Comparison table */}
        <div style={{ padding:"0 0 40px", borderBottom:"1px solid var(--border)", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${PURPLE}15`, border:`1px solid ${PURPLE}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:PURPLE }}>04</div>
            <span style={{ fontSize:11, fontWeight:500, color:PURPLE, textTransform:"uppercase", letterSpacing:"0.06em" }}>Signal comparison</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:14 }}>Phantom EMG vs intact-limb EMG</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 20px" }}>
            Understanding the differences between phantom and intact EMG clarifies both the challenges of prosthetic control and the principles behind any gesture classifier.
          </p>
          <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
                    {["Feature","Phantom EMG","Intact-limb EMG"].map(h=>(
                      <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:10.5, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map(({ feature, phantom, intact }, ri) => (
                    <tr key={feature} style={{ borderBottom:"1px solid var(--border)", background:ri%2===0?"var(--bg)":"var(--bg-secondary)" }}>
                      <td style={{ padding:"10px 16px", fontSize:12, fontWeight:600, color:"var(--text)" }}>{feature}</td>
                      <td style={{ padding:"10px 16px", fontSize:11.5, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.5 }}>{phantom}</td>
                      <td style={{ padding:"10px 16px", fontSize:11.5, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.5 }}>{intact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Section 5: For myojam */}
        <div style={{ padding:"0 0 40px", borderBottom:"1px solid var(--border)", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${PINK}15`, border:`1px solid ${PINK}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:PINK }}>05</div>
            <span style={{ fontSize:11, fontWeight:500, color:PINK, textTransform:"uppercase", letterSpacing:"0.06em" }}>What this means for all gesture interfaces</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:14 }}>Intent, not anatomy</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 16px" }}>
            Most myojam users have all their limbs, so phantom EMG is a curiosity rather than a practical constraint. But it illuminates the key principle behind all gesture classification: the classifier is not detecting anatomy, it's detecting motor intent as expressed through anatomy. Fatigue, attention, and learning all modulate motor commands. Cross-subject generalisation is hard precisely because every brain maps gesture intent to muscle activation slightly differently.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0 }}>
            The practical implication: systems that explicitly model intent — through user calibration, adaptive interfaces, or neural decoding upstream of the muscle — will outperform systems that model anatomy. Phantom EMG makes this principle concrete. A hand that isn't there produces a classifiable signal, because the brain knows exactly what it's trying to do.
          </p>
        </div>

        {/* Conclusion */}
        <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", padding:"40px", border:"1px solid var(--border)" }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Conclusion</div>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 16px" }}>
            Phantom limb EMG is one of neuroscience's stranger gifts to assistive technology. A signal produced by a brain trying to move a hand that isn't there turns out to be one of the cleanest, most intentional EMG signals we can record — because there is no actual movement to create noise, only pure motor command.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0 }}>
            The lesson is generalisable: motor intent, not muscle anatomy, is the primary information source. Building systems that capture intent — whether through better cross-subject models, calibration protocols, or neural interfaces — is the direction the whole field is moving. Phantom EMG got us there first.
          </p>
        </div>

        <ArticleBar
          url="https://myojam.com/education/phantom-limb"
          title="The ghost in the electrode: 80% of amputees produce measurable EMG from limbs they don't have."
          citation={{ apa:`Wong, J. (2025, December 3). The ghost in the electrode. myojam. https://myojam.com/education/phantom-limb` }}
          presetLikes={61}
          storageKey="like_phantom_limb"
        />
        <div style={{ marginTop:32, display:"flex", justifyContent:"center" }}>
          <button onClick={()=>navigate("/education")} style={{ background:"transparent", color:"var(--text-secondary)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, fontFamily:"var(--font)", fontWeight:400, cursor:"pointer" }}>← Back to Education</button>
        </div>
      </div>
      <UpNext current="/education/phantom-limb" />
      <Footer />
    </div>
  )
}
