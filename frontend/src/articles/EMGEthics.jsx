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

const ABSTRACT = "As surface EMG transitions from research tool to consumer interface, it brings with it a set of ethical questions that the assistive technology and human-computer interaction communities have not yet adequately addressed. This article examines three specific concerns: EMG as biometric identifier, involuntary health disclosure, and the data rights of users who train personalised models."

const SECTIONS = [
  {
    num:"01", tag:"EMG as biometric", title:"You can be identified by your muscle signals",
    body:"EMG signals are individually distinctive. The pattern of motor unit recruitment, conduction velocity distribution, and muscle geometry that produces your EMG signal is effectively unique. Research has demonstrated identification accuracy above 95% from short recordings without subject cooperation. Any system storing raw EMG data is therefore storing a biometric identifier, with significant privacy implications that are rarely addressed in product design.",
    callout:"myojam processes all EMG signals locally. Raw signal data is never transmitted or stored. Feature vectors are computed on-device and not retained. This is an explicit architectural decision."
  },
  {
    num:"02", tag:"Health disclosure", title:"What EMG reveals about you",
    body:"EMG signals contain more than gesture intent. Frequency content shifts with age, tremor signatures appear in neurological conditions, and fatigue patterns alter recruitment dynamics. Signal asymmetries can indicate injury or neurological damage. A sufficiently advanced model could infer health conditions from routine interaction data — without user awareness or consent.",
    callout:null
  },
  {
    num:"03", tag:"Model ownership", title:"Who owns a personalised model?",
    body:"When users train personalised classifiers using their own EMG data, the resulting model encodes statistical patterns derived from their body. However, the architecture and training pipeline originate elsewhere. This creates ambiguity around ownership. In open-source contexts the answer is clearer, but commercial systems often obscure ownership terms within licensing agreements.",
    callout:null
  },
  {
    num:"04", tag:"Regulation", title:"The regulatory gap",
    body:"Biometric regulation exists in some jurisdictions, but EMG-specific frameworks do not. Medical regulation applies only when EMG is used diagnostically. Consumer gesture interfaces fall outside this scope, meaning there are minimal requirements governing storage, processing, or sharing of EMG data. The gap between technical capability and legal oversight remains substantial.",
    callout:null
  },
  {
    num:"05", tag:"Design principles", title:"What responsible design looks like",
    body:"Responsible EMG systems prioritise local processing, avoid transmitting raw signals, maintain transparency in feature extraction, and give users explicit control over data retention. Data collection should be opt-in and limited strictly to necessary functionality. These are not technical constraints but product decisions.",
    callout:null
  },
]

export default function EthicsOfEMG() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />

      <div style={{ background:"linear-gradient(135deg, #fff0f5 0%, #fafafa 70%)", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
            <span onClick={()=>navigate("/education")} style={{ fontSize:13, color:"var(--accent)", cursor:"pointer" }}>Education</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)" }}>→</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)", fontWeight:300 }}>Ethics of EMG</span>
          </div>

          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.15)", borderRadius:100, padding:"5px 16px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
            Ethics · 5 min read
          </div>

          <h1 style={{ fontSize:"clamp(28px, 5vw, 52px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", lineHeight:1.08, marginBottom:24 }}>
            Who owns your muscle data?<br/>
            <span style={{ color:"var(--accent)" }}>The ethics of biometric gesture interfaces.</span>
          </h1>

          <p style={{ fontSize:17, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, marginBottom:36, maxWidth:580 }}>
            EMG signals are biometric data. They can identify you, reveal health information, and expose physiological states. As these systems scale, ethical considerations become unavoidable.
          </p>

          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <FaceAvatar seed={5} size={40} />
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"var(--text)" }}>Jaden Wong</div>
              <div style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300 }}>Founder & Lead Engineer · August 14, 2025</div>
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

              <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", marginBottom:16 }}>{s.title}</h2>
              <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, marginBottom:s.callout?24:0 }}>{s.body}</p>

              {s.callout && (
                <div style={{ background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.15)", borderLeft:"3px solid var(--accent)", borderRadius:"0 var(--radius-sm) var(--radius-sm) 0", padding:"16px 20px" }}>
                  <p style={{ fontSize:13, color:"var(--text-secondary)", margin:0 }}>{s.callout}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop:56, background:"var(--bg-secondary)", borderRadius:"var(--radius)", padding:"40px", border:"1px solid var(--border)" }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Conclusion</div>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0 }}>
            EMG interfaces derive power from deeply personal biological signals. That power introduces proportional ethical responsibility. As the technology moves into mainstream use, ensuring privacy, ownership, and user autonomy will require deliberate design decisions rather than regulatory defaults.
          </p>
        </div>

        <ArticleBar
          url="https://myojam.com/education/ethics-of-emg"
          title="Who owns your muscle data?"
          citation={{
            apa:`Wong, J. (2025, August 14). Who owns your muscle data? myojam. https://myojam.com/education/ethics-of-emg`
          }}
          presetLikes={38}
          storageKey="like_ethics_emg"
        />

        <div style={{ marginTop:32, display:"flex", justifyContent:"center" }}>
          <button onClick={()=>navigate("/education")} style={{
            background:"transparent",
            color:"var(--text-secondary)",
            border:"1px solid var(--border-mid)",
            borderRadius:100,
            padding:"10px 24px",
            fontSize:13,
            cursor:"pointer"
          }}>
            ← Back to Education
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}