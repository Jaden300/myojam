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

const ABSTRACT = "Surface EMG represents one point on a spectrum of human-machine interfaces that extends from skin-surface sensing to direct neural recording. This article maps that spectrum, examines the engineering trade-offs at each level, and surveys the most promising near-term developments in high-density EMG, peripheral nerve interfaces, and motor cortex decoding."

const SECTIONS = [
  {
    num:"01", tag:"The spectrum", title:"From skin to neuron",
    body:"Human-computer interfaces can be ordered by where in the nervous system they tap the signal. At one end, surface EMG sits at the muscle — the furthest downstream from the brain, the least invasive, the most accessible. Moving upstream: needle EMG records from within individual muscle fibres. Peripheral nerve interfaces record from nerve fascicles. Electrocorticography records from the cortical surface. Intracortical arrays record from individual neurons. Each step upstream means more information, less noise, but dramatically more invasive procedures.",
    callout:null
  },
  {
    num:"02", tag:"High-density EMG", title:"The near-term upgrade",
    body:"The most actionable near-term improvement to consumer EMG doesn't require any surgery. High-density surface EMG uses arrays of 64–256 electrodes over the muscle surface. The dense spatial sampling allows decomposition of the signal into individual motor unit action potentials — identifying which motor neurons are firing rather than averaging them. This increases information content and improves fine-grained gesture resolution.",
    callout:"Several research groups have demonstrated individual finger classification accuracy above 95% using HD-sEMG with minimal calibration. The primary constraint is hardware cost — not algorithmic capability."
  },
  {
    num:"03", tag:"Peripheral nerve", title:"Recording closer to the source",
    body:"Peripheral nerve interfaces record directly from the nerve bundles carrying motor commands. Because they operate upstream of the muscle, they capture intent before it is distorted by biomechanics. Experimental systems have demonstrated dexterous prosthetic control with tactile feedback, enabling near-natural manipulation in controlled settings.",
    callout:null
  },
  {
    num:"04", tag:"Motor cortex", title:"The frontier",
    body:"Motor cortex decoding represents the highest-bandwidth interface currently achievable. Clinical trials have shown that imagined handwriting can be decoded into text at high speeds, and intracortical arrays enable cursor control and device interaction. These systems require neurosurgery and carry significant risk, but they define the upper bound of interface performance.",
    callout:null
  },
  {
    num:"05", tag:"For myojam", title:"The platform angle",
    body:"myojam operates at the accessible end of this spectrum — consumer hardware and non-invasive sensing. However, the signal processing pipeline is architecture-agnostic. The same feature extraction and classification approach can scale from 16-channel EMG to high-density arrays or even neural recordings by modifying the input layer. Building robust infrastructure at the low end creates a foundation that scales upward with hardware improvements.",
    callout:null
  },
]

export default function FutureBCI() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />

      <div style={{ background:"linear-gradient(135deg, #f5f0ff 0%, #fafafa 70%)", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
            <span onClick={()=>navigate("/education")} style={{ fontSize:13, color:"var(--accent)", cursor:"pointer" }}>Education</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)" }}>→</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)", fontWeight:300 }}>Future of BCI</span>
          </div>

          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.15)", borderRadius:100, padding:"5px 16px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
            Future · 6 min read
          </div>

          <h1 style={{ fontSize:"clamp(28px, 5vw, 52px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", lineHeight:1.08, marginBottom:24 }}>
            After EMG: what comes next.<br/>
            <span style={{ color:"var(--accent)" }}>From surface signals to brain-computer interfaces.</span>
          </h1>

          <p style={{ fontSize:17, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, marginBottom:36, maxWidth:580 }}>
            Surface EMG is powerful but limited. Neural implants, high-density arrays, and AI-driven decoding are converging on something much more ambitious.
          </p>

          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <FaceAvatar seed={4} size={40} />
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"var(--text)" }}>Jaden Wong</div>
              <div style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300 }}>Founder & Lead Engineer · September 22, 2025</div>
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
            The trajectory of human-computer interfaces is toward capturing signals closer to their neural origin while reducing invasiveness. Surface EMG remains the most practical non-invasive interface today, and it will coexist with more advanced systems rather than be replaced by them. Progress will come from both ends of the spectrum simultaneously.
          </p>
        </div>

        <ArticleBar
          url="https://myojam.com/education/future-of-bci"
          title="After EMG: what comes next."
          citation={{
            apa:`Wong, J. (2025, September 22). After EMG: what comes next. myojam. https://myojam.com/education/future-of-bci`
          }}
          presetLikes={73}
          storageKey="like_future_bci"
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