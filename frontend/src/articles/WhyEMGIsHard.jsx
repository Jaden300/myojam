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

const ABSTRACT = "Surface EMG gesture classification has achieved impressive accuracy in controlled laboratory settings — myojam included, at 84.85% cross-subject. But controlled lab conditions are not the real world. This article catalogues six specific sources of degradation that occur when EMG systems move from bench to daily use, and surveys the technical approaches being developed to address each one."

const SECTIONS = [
  {
    num:"01", tag:"Electrode displacement", title:"The placement problem",
    body:"Every time you reattach surface electrodes, they land in a slightly different position. The EMG signal is exquisitely sensitive to electrode location — a shift of just a few millimetres changes which motor units are closest to the electrode, altering the signal's amplitude, frequency content, and waveform shape. Studies have shown that electrode displacement alone can reduce within-subject accuracy from 95% to below 70%. No amount of better machine learning fixes a fundamentally different input signal.",
    callout:"The practical mitigation is anatomical landmarks. Placing electrodes relative to the muscle belly centre, muscle-tendon junction, or bony prominences gives more consistent positioning than eyeballing it. myojam's documentation includes a placement guide for exactly this reason."
  },
  {
    num:"02", tag:"Session variability", title:"Same person, different day",
    body:"Even with perfect electrode placement, the same person's EMG signal varies meaningfully between sessions. Skin impedance changes with temperature, hydration, and sweat. Muscle tissue swells slightly with use. The dominant motor units recruited for a given gesture shift gradually over time. A model trained on Monday morning data and deployed Friday afternoon on the same person can show 10–15% accuracy drops for these reasons alone.",
    callout:null
  },
  {
    num:"03", tag:"Limb position", title:"The forgotten variable",
    body:"Almost all EMG training datasets — including Ninapro DB5 — collect data with subjects seated, arm horizontal, elbow at roughly 90 degrees. In real life, people gesture with their arm in arbitrary positions: arm raised, elbow extended, hand pronated. Limb position changes the geometry of underlying muscles relative to electrodes, and also activates postural muscles that create EMG cross-talk. A classifier that works perfectly for arm-at-rest completely breaks for arm-raised.",
    callout:"This is arguably the most underappreciated failure mode in the literature. It's the reason myojam's web demo performs well (you're probably sitting at a desk with your arm in a similar position to the training subjects) while real-world mobile use would be significantly worse."
  },
  {
    num:"04", tag:"Muscle fatigue", title:"The signal that changes under load",
    body:"Fatigue shifts the EMG power spectrum toward lower frequencies while increasing overall amplitude. A classifier trained on fresh-muscle data sees a fatigued signal and interprets the frequency shift as a different gesture. Long continuous use sessions — exactly the scenarios where assistive technology is most critical — are the ones most likely to break the classifier.",
    callout:null
  },
  {
    num:"05", tag:"Cross-talk", title:"Your neighbour's muscle is leaking",
    body:"The forearm contains over 20 distinct muscles packed into a small space. Surface electrodes pick up electrical activity from muscles several centimetres away. When you perform a ring finger flex, adjacent muscles also activate, and that signal bleeds into every electrode channel. High-density arrays can partially separate these sources, but consumer-grade setups cannot.",
    callout:null
  },
  {
    num:"06", tag:"Distribution shift", title:"The population problem",
    body:"A classifier trained on controlled lab subjects faces significant distribution shift when deployed on real users: elderly individuals, users with spasticity, or natural co-articulated movement patterns. The 84.85% accuracy figure is valid for evaluation conditions — not for populations that differ from the training distribution.",
    callout:null
  },
]

export default function WhyEMGHard() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />

      <div style={{ background:"linear-gradient(135deg, #fff5f0 0%, #fafafa 70%)", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
            <span onClick={()=>navigate("/education")} style={{ fontSize:13, color:"var(--accent)", cursor:"pointer" }}>Education</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)" }}>→</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)", fontWeight:300 }}>Why EMG is hard</span>
          </div>

          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.15)", borderRadius:100, padding:"5px 16px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
            Signal processing · 7 min read
          </div>

          <h1 style={{ fontSize:"clamp(28px, 5vw, 52px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", lineHeight:1.08, marginBottom:24 }}>
            Why EMG is harder than it looks.<br/>
            <span style={{ color:"var(--accent)" }}>The six reasons gesture classification keeps failing.</span>
          </h1>

          <p style={{ fontSize:17, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, marginBottom:36, maxWidth:580 }}>
            Lab accuracy numbers are impressive. Real-world performance is not. Here's why — and what’s being done about it.
          </p>

          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <FaceAvatar seed={2} size={40} />
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"var(--text)" }}>Jaden Wong</div>
              <div style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300 }}>Founder & Lead Engineer · November 18, 2025</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"64px 32px 80px" }}>
        <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", borderLeft:"3px solid var(--accent)", padding:"24px 28px", marginBottom:56 }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Abstract</div>
          <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0, fontStyle:"italic" }}>{ABSTRACT}</p>
        </div>

        <div style={{ display:"flex", flexDirection:"column" }}>
          {SECTIONS.map((s,i)=>(
            <div key={s.num} style={{ padding:"48px 0", borderBottom:i<SECTIONS.length-1?"1px solid var(--border)":"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--accent-soft)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:"var(--accent)" }}>{s.num}</div>
                <span style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.tag}</span>
              </div>

              <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:16 }}>{s.title}</h2>
              <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, marginBottom:s.callout?24:0 }}>{s.body}</p>

              {s.callout && (
                <div style={{ background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.15)", borderLeft:"3px solid var(--accent)", borderRadius:"0 var(--radius-sm) var(--radius-sm) 0", padding:"16px 20px" }}>
                  <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.7, margin:0 }}>{s.callout}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop:56, background:"var(--bg-secondary)", borderRadius:"var(--radius)", padding:"40px", border:"1px solid var(--border)" }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Conclusion</div>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0 }}>
            None of these problems are unsolvable. Each failure mode maps cleanly to an engineering solution — better placement protocols, calibration, adaptive models, and more representative datasets. EMG is hard, but it is tractable. Progress in this field is incremental, but real.
          </p>
        </div>

        <ArticleBar
          url="https://myojam.com/education/why-emg-is-hard"
          title="Why EMG is harder than it looks."
          citation={{ apa:`Wong, J. (2025, November 18). Why EMG is harder than it looks. myojam. https://myojam.com/education/why-emg-is-hard` }}
          presetLikes={44}
          storageKey="like_why_emg_hard"
        />

        <div style={{ marginTop:32, display:"flex", justifyContent:"center" }}>
          <button onClick={()=>navigate("/education")} style={{ background:"transparent", color:"var(--text-secondary)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, cursor:"pointer" }}>
            ← Back to Education
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}