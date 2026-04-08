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

const ABSTRACT = "Phantom limb sensation — the vivid perception of a missing limb — is experienced by the majority of amputees. What's less well known is that it's often accompanied by real, measurable EMG signals in the residual limb that correspond to intended movements of the phantom. This article explores what phantom EMG reveals about cortical remapping, and why it matters for the future of prosthetic control."

const SECTIONS = [
  {
    num:"01", tag:"The phenomenon", title:"What phantom limb actually is",
    body:"Phantom limb sensation is the perception that a missing limb is still present — and often still moving. It's experienced by approximately 80% of amputees, and it's not a psychological aberration. It's a predictable consequence of how the brain represents the body. The sensory and motor cortex maintain a detailed map of every body part — the homunculus. After amputation, the cortical territory that represented the lost limb doesn't go dark. It remains active, and it gradually gets colonised by neighbouring regions (typically the face and trunk), producing the characteristic sensation that the missing hand is being touched when the cheek is stroked.",
    callout:null
  },
  {
    num:"02", tag:"The signal", title:"Phantom EMG is measurable",
    body:"Here's the remarkable part: when amputees attempt to move their phantom hand, the motor cortex still sends motor commands down the spinal cord. Those commands reach the residual limb, activating whatever muscle stumps remain. This produces real, recordable EMG signals — sometimes strong enough to control a myoelectric prosthetic directly. The pattern of those signals corresponds to the intended gesture, not to any actual muscle contraction in the stump. The brain is, in effect, trying to move a hand that isn't there, and the signal leaks out into the tissue that remains.",
    callout:"This is the basis of modern myoelectric prosthetics. By recording from the residual limb and classifying the phantom motor intent, it's possible to give an amputee intuitive control over a prosthetic hand — with no additional training required, because the brain already knows how to signal the intended movements."
  },
  {
    num:"03", tag:"Cortical remapping", title:"How the brain adapts",
    body:"The plasticity that causes phantom sensation also creates challenges for EMG-based prosthetics. As the cortex remaps after amputation, the spatial pattern of motor commands shifts. A gesture that originally produced a clean, localised EMG burst may, years after amputation, produce a different pattern as surrounding cortical regions expand into the vacated territory. This means that a prosthetic controller calibrated shortly after amputation may perform differently five years later — not because the hardware changed, but because the brain did.",
    callout:null
  },
  {
    num:"04", tag:"For intact users", title:"What this means for myojam",
    body:"Most myojam users have all their limbs, so phantom EMG is a curiosity rather than a practical concern. But it illuminates something important: the relationship between motor intent and EMG signal is mediated by the brain, not fixed by anatomy. Fatigue, attention, emotional state, and learning all modulate the motor command. This is why cross-subject generalisation is hard — every brain maps motor intent to muscle activation slightly differently.",
    callout:null
  },
  {
    num:"05", tag:"The future", title:"Phantom signals and neural interfaces",
    body:"The existence of phantom EMG is one of the reasons researchers are optimistic about neural prosthetics. If the motor cortex continues to generate gesture-specific signals even after the hand is gone, then capturing those signals — either from the residual EMG or directly from the cortex via implanted electrodes — could give amputees near-natural prosthetic control. Several groups have demonstrated that amputees can control individual prosthetic fingers through phantom intent with sub-second latency after brief calibration sessions.",
    callout:null
  },
]

export default function PhantomLimb() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />
      <div style={{ background:"linear-gradient(135deg, #f0f0ff 0%, #fafafa 70%)", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
            <span onClick={()=>navigate("/education")} style={{ fontSize:13, color:"var(--accent)", cursor:"pointer" }}>Education</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)" }}>→</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)", fontWeight:300 }}>Phantom limb EMG</span>
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.15)", borderRadius:100, padding:"5px 16px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
            Neuroscience · 6 min read
          </div>
          <h1 style={{ fontSize:"clamp(28px, 5vw, 52px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", lineHeight:1.08, marginBottom:24 }}>
            The ghost in the electrode.<br/><span style={{ color:"var(--accent)" }}>Phantom limb EMG and what it tells us about the brain.</span>
          </h1>
          <p style={{ fontSize:17, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, marginBottom:36, maxWidth:580 }}>
            Amputees can generate measurable EMG signals from limbs they no longer have. This isn't mysticism — it's evidence for how radically the brain remaps itself after injury.
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <FaceAvatar seed={2} size={40} />
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"var(--text)" }}>Jaden Wong</div>
              <div style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300 }}>Founder & Lead Engineer · December 3, 2025</div>
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
            Phantom limb EMG is one of neuroscience's stranger gifts to assistive technology. A signal produced by a brain trying to move a hand that isn't there turns out to be one of the cleanest, most intentional EMG signals we can record. The lesson is that motor intent — not muscle anatomy — is the primary information source. Building systems that capture intent rather than anatomy is the direction the whole field is moving.
          </p>
        </div>
        <ArticleBar url="https://myojam.com/education/phantom-limb" title="The ghost in the electrode." citation={{ apa:`Wong, J. (2025, December 3). The ghost in the electrode. myojam. https://myojam.com/education/phantom-limb` }} presetLikes={61} storageKey="like_phantom_limb" />
        <div style={{ marginTop:32, display:"flex", justifyContent:"center" }}>
          <button onClick={()=>navigate("/education")} style={{ background:"transparent", color:"var(--text-secondary)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, fontFamily:"var(--font)", fontWeight:400, cursor:"pointer" }}>← Back to Education</button>
        </div>
      </div>
      <Footer />
    </div>
  )
}