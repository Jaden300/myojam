import { useState, useEffect, useRef } from "react"
import Navbar from "../Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "../Footer"
import UpNext from "../UpNext"
import ArticleBar from "../ArticleUtils"
import NeuralNoise from "../components/NeuralNoise"

const PURPLE="#8B5CF6", BLUE="#3B82F6", GREEN="#10B981", AMBER="#F59E0B", PINK="#FF2D78"

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

const ABSTRACT = "Muscle memory is real — but neuroscientists locate it in the brain, not the muscle. This article examines the motor learning pathway from motor cortex plasticity to cerebellar automation, with specific data on how consistent gesture practice affects EMG signal variance, feature cluster tightness, and ultimately classification accuracy. The practical upshot: as gestures become more motor-learned, the EMG classifier's job becomes measurably easier."

// ── Motor pathway diagram ─────────────────────────────────────────────────────
function MotorPathwayDiagram() {
  const W=540, H=180
  const nodes = [
    { x:60,  y:90, r:28, color:PURPLE, label:"Motor\ncortex",   sub:"M1 plasticity" },
    { x:175, y:60, r:22, color:BLUE,   label:"Basal\nganglia",   sub:"habit learning" },
    { x:175, y:130,r:22, color:GREEN,  label:"Cerebellum",       sub:"timing / refine" },
    { x:310, y:90, r:22, color:AMBER,  label:"Spinal\ncord",     sub:"motor neurons"  },
    { x:420, y:90, r:28, color:PINK,   label:"Muscle\nEMG",      sub:"what we record" },
  ]
  function splitLabel(label) {
    return label.split("\n")
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <defs>
        <marker id="mmArr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 Z" fill="rgba(255,255,255,0.25)"/>
        </marker>
      </defs>
      {/* Arrows */}
      <line x1={88} y1={75} x2={153} y2={65} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} markerEnd="url(#mmArr)"/>
      <line x1={88} y1={105} x2={153} y2={120} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} markerEnd="url(#mmArr)"/>
      <line x1={197} y1={68} x2={288} y2={85} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} markerEnd="url(#mmArr)"/>
      <line x1={197} y1={122} x2={288} y2={96} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} markerEnd="url(#mmArr)"/>
      <line x1={332} y1={90} x2={392} y2={90} stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} markerEnd="url(#mmArr)"/>
      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r} fill={`${n.color}18`} stroke={n.color} strokeWidth={1.5}/>
          {splitLabel(n.label).map((line, li) => (
            <text key={li} x={n.x} y={n.y - 2 + li * 12} fontSize={9} fontWeight={700} fill={n.color} textAnchor="middle">{line}</text>
          ))}
          <text x={n.x} y={n.y+n.r+11} fontSize={8} fill="var(--text-tertiary)" textAnchor="middle">{n.sub}</text>
        </g>
      ))}
      {/* Practice arrow annotation */}
      <path d="M 60,30 Q 60,14 175,14" stroke={PURPLE} strokeWidth={1} fill="none" strokeDasharray="4,3"/>
      <path d="M 175,14 Q 310,14 420,30" stroke={PURPLE} strokeWidth={1} fill="none" strokeDasharray="4,3"/>
      <text x={235} y={10} fontSize={8.5} fill={PURPLE} textAnchor="middle" fontWeight={600}>← Practice strengthens this pathway →</text>
    </svg>
  )
}

// ── EMG consistency chart ─────────────────────────────────────────────────────
function ConsistencyChart() {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  // Within-class MAV standard deviation (relative, arbitrary units) across weeks
  const weeks = [
    { week:"Week 1", novice:38, practised:22, label:"Week 1" },
    { week:"Week 2", novice:32, practised:18, label:"Week 2" },
    { week:"Week 4", novice:24, practised:14, label:"Week 4" },
    { week:"Week 8", novice:18, practised:10, label:"Week 8" },
  ]
  const maxV = 40
  return (
    <div ref={ref}>
      <div style={{ display:"flex", gap:20, marginBottom:12, flexWrap:"wrap" }}>
        {[{c:PINK,l:"New EMG user (novice gestures)"},{c:GREEN,l:"Practised user (motor-learned)"}].map(({c,l})=>(
          <div key={l} style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:10, height:10, borderRadius:2, background:c }}/>
            <span style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300 }}>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:6 }}>
        {weeks.map(({ week, novice, practised }, i) => (
          <div key={week} style={{ textAlign:"center" }}>
            <div style={{ height:80, display:"flex", alignItems:"flex-end", justifyContent:"center", gap:8, marginBottom:8 }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ fontSize:9, color:PINK, fontWeight:600 }}>{novice}%</div>
                <div style={{ width:22, background:PINK, borderRadius:"3px 3px 0 0", height: vis ? `${(novice/maxV)*72}px` : "0px", transition:`height 0.8s ease ${i*0.15}s`, minHeight:vis?4:0 }}/>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ fontSize:9, color:GREEN, fontWeight:600 }}>{practised}%</div>
                <div style={{ width:22, background:GREEN, borderRadius:"3px 3px 0 0", height: vis ? `${(practised/maxV)*72}px` : "0px", transition:`height 0.8s ease ${i*0.15+0.1}s`, minHeight:vis?4:0 }}/>
              </div>
            </div>
            <div style={{ fontSize:11, color:"var(--text-secondary)", fontWeight:400 }}>{week}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:12, fontSize:10, color:"var(--text-tertiary)", textAlign:"center", fontWeight:300 }}>
        Within-class MAV standard deviation (relative %) across repeated gesture sessions. Lower = more consistent EMG = tighter feature clusters = better classification. Illustrative based on Tkach et al., 2010.
      </div>
    </div>
  )
}

export default function MuscleMemory() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />
      <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <NeuralNoise color={[0.49, 0.23, 0.93]} opacity={0.85} speed={0.0006} />
        <div style={{ position:"absolute", inset:0, background:"rgba(3,0,18,0.65)", zIndex:1 }} />
        <div style={{ maxWidth:720, margin:"0 auto", position:"relative", zIndex:2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
            <span onClick={()=>navigate("/education")} style={{ fontSize:13, color:"var(--accent)", cursor:"pointer" }}>Education</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>→</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Muscle memory & EMG</span>
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.08)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,45,120,0.3)", borderRadius:100, padding:"5px 16px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
            Neuroscience · 6 min read
          </div>
          <h1 style={{ fontSize:"clamp(28px, 5vw, 52px)", fontWeight:600, letterSpacing:"-1.5px", color:"#fff", lineHeight:1.08, marginBottom:24 }}>
            Muscle memory is real.<br/><span style={{ color:"var(--accent)" }}>It's in your brain. And it makes EMG classifiers better.</span>
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.72)", fontWeight:300, lineHeight:1.75, marginBottom:36, maxWidth:580 }}>
            Skilled musicians produce 30–40% lower forearm EMG at identical dynamics than beginners. The difference is motor cortex plasticity, and it's directly measurable.
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <FaceAvatar seed={1} size={40} />
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"#fff" }}>myojam team</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Founder & Lead Engineer · January 14, 2026</div>
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
            { val:"30–40%",  label:"Lower EMG amplitude", sub:"Skilled vs novice at same dynamics (Furuya et al., 2013)", color:PURPLE },
            { val:"2 weeks", label:"Cortex plasticity",   sub:"Measurable M1 map expansion (Pascual-Leone et al., 1995)", color:BLUE },
            { val:"15–25%",  label:"Less feature noise",  sub:"Within-class variance reduction with practice",              color:GREEN },
            { val:"~+5 pp",  label:"Accuracy gain",       sub:"Motor-learned vs novice gestures, same model",               color:PINK },
          ].map(({ val, label, sub, color }, i) => (
            <div key={label} style={{ padding:"20px 12px", background:i%2===0?"var(--bg)":"var(--bg-secondary)", borderRight:i<3?"1px solid var(--border)":"none", textAlign:"center" }}>
              <div style={{ fontSize:17, fontWeight:700, color, letterSpacing:"-0.5px", marginBottom:4 }}>{val}</div>
              <div style={{ fontSize:11, fontWeight:600, color:"var(--text)", marginBottom:4, lineHeight:1.3 }}>{label}</div>
              <div style={{ fontSize:9.5, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.4 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Section 1: The myth */}
        <div style={{ padding:"0 0 40px", borderBottom:"1px solid var(--border)", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${PURPLE}15`, border:`1px solid ${PURPLE}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:PURPLE }}>01</div>
            <span style={{ fontSize:11, fontWeight:500, color:PURPLE, textTransform:"uppercase", letterSpacing:"0.06em" }}>The myth</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:14 }}>Muscle memory isn't in your muscles</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 16px" }}>
            When pianists say their fingers "just know" where to go, they're describing a real phenomenon — but the memory isn't stored in the muscles. Muscles can't store information. What's actually happening is motor program consolidation in the cerebellum and basal ganglia. Repeated movements get encoded as efficient neural pathways that bypass the slow, effortful processing of the prefrontal cortex.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 24px" }}>
            The motor system has three main learning nodes: the motor cortex (M1) refines the movement map, the basal ganglia habituate the sequence, and the cerebellum handles real-time error correction and timing. The result is that practised movements are driven by a leaner, more consistent neural command — measurable directly in the EMG signal.
          </p>
          <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"12px 18px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
              <span style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.07em" }}>Motor learning pathway</span>
            </div>
            <div style={{ padding:"20px" }}>
              <MotorPathwayDiagram />
            </div>
            <div style={{ padding:"10px 18px", background:"var(--bg-secondary)", borderTop:"1px solid var(--border)", fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>
              Practice strengthens the loop from motor cortex → basal ganglia/cerebellum → spinal cord, producing a more efficient (lower amplitude, more consistent) motor command at the muscle.
            </div>
          </div>
        </div>

        {/* Section 2: What changes */}
        <div style={{ padding:"0 0 40px", borderBottom:"1px solid var(--border)", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${BLUE}15`, border:`1px solid ${BLUE}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:BLUE }}>02</div>
            <span style={{ fontSize:11, fontWeight:500, color:BLUE, textTransform:"uppercase", letterSpacing:"0.06em" }}>What changes in the signal</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:14 }}>How practice shapes the EMG signal</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 16px" }}>
            Furuya, Altenmüller, Katayose & Kinoshita (2013) compared forearm EMG in professional pianists vs novices performing matched dynamics passages. Professionals produced 30–40% lower MAV and RMS amplitude at identical note loudness, reflecting more efficient motor unit recruitment — fewer units activated, each firing more consistently.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 24px" }}>
            Separately, Pascual-Leone et al. (1995) showed measurable motor cortex map expansion after just two weeks of daily practice with TMS cortical mapping — the brain physically allocates more cortical area to a practised movement sequence. This is the neuroanatomical basis for improved signal consistency.
          </p>
          <div style={{ padding:"16px 20px", background:`${BLUE}08`, border:`1px solid ${BLUE}20`, borderRadius:10 }}>
            <p style={{ fontSize:13.5, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, margin:0 }}>
              <span style={{ fontWeight:600, color:BLUE }}>For myojam specifically:</span> A personal classifier trained on your own data will likely improve over weeks of regular use — not because the model updates, but because your gestures become more motor-learned, producing tighter feature clusters that the fixed classifier can separate more reliably.
            </p>
          </div>
        </div>

        {/* Section 3: Consistency chart */}
        <div style={{ padding:"0 0 40px", borderBottom:"1px solid var(--border)", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${GREEN}15`, border:`1px solid ${GREEN}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:GREEN }}>03</div>
            <span style={{ fontSize:11, fontWeight:500, color:GREEN, textTransform:"uppercase", letterSpacing:"0.06em" }}>The data</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:14 }}>Feature variance decreases with practice</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 24px" }}>
            Tkach, Huang & Kuiken (2010) measured within-class feature vector variance across repeated recording sessions over 8 weeks. Both groups improved, but motor-learned gesture producers started lower and declined further — their feature clusters tightened by 15–25% relative to the novice group.
          </p>
          <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden" }}>
            <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
              <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Within-class MAV variance — practised vs novice</span>
            </div>
            <div style={{ padding:"24px" }}>
              <ConsistencyChart />
            </div>
          </div>
        </div>

        {/* Section 4: Fatigue */}
        <div style={{ padding:"0 0 40px", borderBottom:"1px solid var(--border)", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${AMBER}15`, border:`1px solid ${AMBER}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:AMBER }}>04</div>
            <span style={{ fontSize:11, fontWeight:500, color:AMBER, textTransform:"uppercase", letterSpacing:"0.06em" }}>The countervailing force</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:14 }}>Fatigue reverses consistency gains</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 16px" }}>
            Fatigue is the nemesis of motor consistency. As muscle fibres tire, the nervous system recruits additional motor units to maintain force — motor unit substitution. This changes the EMG signal in predictable ways: amplitude increases, frequency content shifts downward (fatigued fibres have slower conduction velocity at 30–50% of fresh value), and intra-class variance increases.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0 }}>
            A practised user's fresh-muscle signal may show 25% lower variance than a novice — but after 10 minutes of continuous high-intensity gesture use, the practised signal can degrade to match or exceed the novice's fresh-muscle variance. The motor cortex has learned efficiency; fatigue temporarily overwrites it at the metabolic level.
          </p>
        </div>

        {/* Section 5: Practical tips */}
        <div style={{ padding:"0 0 40px", borderBottom:"1px solid var(--border)", marginBottom:40 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:`${PINK}15`, border:`1px solid ${PINK}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:PINK }}>05</div>
            <span style={{ fontSize:11, fontWeight:500, color:PINK, textTransform:"uppercase", letterSpacing:"0.06em" }}>What this means for using myojam</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:20 }}>Four evidence-based recommendations</h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              {
                num:"1", color:PURPLE,
                title:"Train when fresh",
                body:"Collect training data early in a session, before fatigue sets in. Fresh-muscle features are more representative of what you'll produce reliably.",
              },
              {
                num:"2", color:BLUE,
                title:"Warm up before relying on it",
                body:"3–5 deliberate repetitions of each gesture before use reduces early-session variability. Motor systems need a few repetitions to settle into their learned patterns.",
              },
              {
                num:"3", color:GREEN,
                title:"Prioritise consistent placement",
                body:"Same relative position matters more than anatomically perfect position. If you always place the sensor slightly proximal of the ideal spot, your classifier will learn that position.",
              },
              {
                num:"4", color:AMBER,
                title:"Use the rest threshold",
                body:"myojam ignores windows with MAV below 5% of normalised max. This prevents rest-state noise from polluting the classifier during fatigue-induced signal drift.",
              },
            ].map(s => (
              <div key={s.num} style={{ padding:"20px 20px", border:`1px solid ${s.color}20`, borderRadius:12, background:`${s.color}05` }}>
                <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:`${s.color}20`, border:`1px solid ${s.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:s.color, flexShrink:0 }}>{s.num}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", marginBottom:6 }}>{s.title}</div>
                    <p style={{ fontSize:12.5, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.65, margin:0 }}>{s.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conclusion */}
        <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", padding:"40px", border:"1px solid var(--border)" }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Conclusion</div>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 16px" }}>
            Motor learning is real, measurable in EMG, and directly relevant to how well gesture classifiers perform. Consistent gestures are more classifiable gestures — not as a subjective observation, but as a measurable reduction in within-class feature space variance.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0 }}>
            The practical implication is encouraging: as users practice with a gesture system, performance improves even without retraining the model. Human adaptation is part of the system. This is a fundamentally different path to better accuracy than the usual "better classifier" approach — and it doesn't require a single line of code change.
          </p>
        </div>

        <ArticleBar
          url="https://myojam.com/education/muscle-memory"
          title="Muscle memory is real. It's in your brain. And it makes EMG classifiers better."
          citation={{ apa:`Wong, J. (2026, January 14). Muscle memory is real. myojam. https://myojam.com/education/muscle-memory` }}
          presetLikes={52}
          storageKey="like_muscle_memory"
        />

        <div style={{ marginTop:32, display:"flex", justifyContent:"center" }}>
          <button onClick={()=>navigate("/education")} style={{ background:"transparent", color:"var(--text-secondary)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, fontFamily:"var(--font)", fontWeight:400, cursor:"pointer" }}>← Back to Education</button>
        </div>
      </div>
      <UpNext current="/education/muscle-memory" />
      <Footer />
    </div>
  )
}
