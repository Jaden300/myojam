import Navbar from "../Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "../Footer"
import ArticleBar from "../ArticleUtils"

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

const ABSTRACT = "Muscle memory is real — but it has nothing to do with muscles. This article explores what neuroscientists actually mean by motor learning, how repetition changes the brain's motor cortex, and what this means for EMG signal consistency over time. Spoiler: it's mostly good news for gesture classification."

const SECTIONS = [
  {
    num:"01", tag:"The myth", title:"Muscle memory isn't in your muscles",
    body:"When pianists say their fingers 'just know' where to go, they're describing a real phenomenon — but the memory isn't stored in the muscles. Muscles can't store information. What's actually happening is motor program consolidation in the cerebellum and basal ganglia. Repeated movements get encoded as efficient neural pathways that bypass the slow, effortful processing of the prefrontal cortex. The movement becomes automatic — but the automation lives in the brain, not the bicep.",
    callout:null
  },
  {
    num:"02", tag:"What changes", title:"How repetition reshapes the motor cortex",
    body:"With practice, the motor cortex reorganises itself — a process called motor map plasticity. The cortical area dedicated to a movement expands. Neurons fire more synchronously, reducing the noise in the motor command. The result is that the same intended movement produces a more consistent, lower-amplitude motor neuron volley. This is measurable directly in EMG: skilled musicians show significantly lower EMG amplitude when playing than beginners performing the same notes, because their motor commands are more efficient.",
    callout:"This is exactly why training a personal EMG classifier on your own data works better over time. As your gestures become more consistent through use, the classifier has less variance to deal with — accuracy improves even without retraining the model."
  },
  {
    num:"03", tag:"For EMG", title:"Why consistency matters for classification",
    body:"EMG classifiers are essentially pattern matchers. They learn what index flex looks like across a training set and try to recognise that pattern in new windows. If your index flex looks slightly different every time — different amplitude, slightly different timing, different motor unit recruitment — the classifier has to generalise across that variance. High variability means the decision boundary has to be drawn conservatively, which reduces accuracy. Consistent gestures (more motor-learned) produce tighter clusters in feature space, making the classifier's job dramatically easier.",
    callout:null
  },
  {
    num:"04", tag:"Fatigue", title:"The enemy of consistency: muscle fatigue",
    body:"Fatigue is the nemesis of motor consistency. As muscle fibres tire, the nervous system recruits additional motor units to maintain force output — a process called motor unit substitution. This changes the EMG signal in predictable ways: amplitude increases (more units firing), frequency content shifts downward (fatigued fibres have slower conduction velocity), and the signal becomes more variable. For a classifier trained on fresh muscle, fatigued data looks like a different person. This is one reason myojam includes a rest threshold — if the arm is at rest or fatigued below a minimum activation level, classification is skipped entirely.",
    callout:null
  },
  {
    num:"05", tag:"The practical upshot", title:"What this means for using myojam",
    body:"A few practical implications follow from all of this. First, the best time to train a personal model is when you're fresh — early in a session, before fatigue sets in. Second, consistent electrode placement matters more than precise placement: if you put the sensor in the same relative position each time, the classifier generalises better. Third, there's a real benefit to 'warming up' before using gesture control for extended periods — a few deliberate repetitions of each gesture before relying on them reduces early-session variability.",
    callout:null
  },
]

export default function MuscleMemory() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />
      <div style={{ background:"linear-gradient(135deg, #fff8f0 0%, #fafafa 70%)", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
            <span onClick={()=>navigate("/education")} style={{ fontSize:13, color:"var(--accent)", cursor:"pointer" }}>Education</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)" }}>→</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)", fontWeight:300 }}>Muscle memory & EMG</span>
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.15)", borderRadius:100, padding:"5px 16px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
            Neuroscience · 5 min read
          </div>
          <h1 style={{ fontSize:"clamp(28px, 5vw, 52px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", lineHeight:1.08, marginBottom:24 }}>
            Muscle memory is real.<br/><span style={{ color:"var(--accent)" }}>It's just not in your muscles.</span>
          </h1>
          <p style={{ fontSize:17, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, marginBottom:36, maxWidth:580 }}>
            What neuroscientists actually mean by motor learning, how repetition changes your brain, and why this matters for EMG signal consistency.
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <FaceAvatar seed={1} size={40} />
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"var(--text)" }}>Jaden Wong</div>
              <div style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300 }}>Founder & Lead Engineer · January 14, 2026</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"64px 32px 80px" }}>
        <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", borderLeft:"3px solid var(--accent)", padding:"24px 28px", marginBottom:56 }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Abstract</div>
          <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0, fontStyle:"italic" }}>{ABSTRACT}</p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {SECTIONS.map((s,i)=>(
            <div key={s.num} style={{ padding:"48px 0", borderBottom:i<SECTIONS.length-1?"1px solid var(--border)":"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--accent-soft)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:"var(--accent)", flexShrink:0 }}>{s.num}</div>
                <span style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.tag}</span>
              </div>
              <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:16 }}>{s.title}</h2>
              <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, marginBottom:s.callout?24:0 }}>{s.body}</p>
              {s.callout&&<div style={{ background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.15)", borderLeft:"3px solid var(--accent)", borderRadius:"0 var(--radius-sm) var(--radius-sm) 0", padding:"16px 20px" }}><p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.7, fontWeight:400, margin:0 }}>{s.callout}</p></div>}
            </div>
          ))}
        </div>
        <div style={{ marginTop:56, background:"var(--bg-secondary)", borderRadius:"var(--radius)", padding:"40px", border:"1px solid var(--border)" }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Conclusion</div>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0 }}>
            Motor learning is real, measurable, and directly relevant to how well EMG classifiers perform. Consistent gestures are more classifiable gestures. The implication for assistive technology is encouraging: as users practice with a system, the system gets better — not because the model changes, but because the user's motor output becomes more consistent. Human adaptation is part of the system.
          </p>
        </div>
        <ArticleBar url="https://myojam.com/education/muscle-memory" title="Muscle memory is real. It's just not in your muscles." citation={{ apa:`Wong, J. (2026, January 14). Muscle memory is real: It's just not in your muscles. myojam. https://myojam.com/education/muscle-memory` }} presetLikes={52} storageKey="like_muscle_memory" />
        <div style={{ marginTop:32, display:"flex", justifyContent:"center" }}>
          <button onClick={()=>navigate("/education")} style={{ background:"transparent", color:"var(--text-secondary)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, fontFamily:"var(--font)", fontWeight:400, cursor:"pointer" }}>← Back to Education</button>
        </div>
      </div>
      <Footer />
    </div>
  )
}