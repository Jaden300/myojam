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

const ABSTRACT = "Consumer EMG hardware has reached a price point where a working single-channel surface EMG acquisition system can be assembled for under $60 using off-the-shelf components. This article provides a complete, reproducible guide to building and validating such a system, covering component selection, electrode placement, Arduino firmware, and basic signal quality checks."

const SECTIONS = [
  {
    num:"01", tag:"What you need", title:"The parts list",
    body:"The minimum viable EMG system requires electrodes, amplification, digitisation, and a display. The MyoWare 2.0 muscle sensor handles acquisition and amplification in one board. An Arduino Uno R3 performs analogue-to-digital conversion. Total cost: ~$50 for MyoWare, ~$10 for Arduino, plus a few dollars for electrodes and wiring.",
    callout:"Disposable Ag/AgCl ECG electrodes (the adhesive patch type) are ideal for surface EMG and cost roughly $0.20 each in bulk. Avoid reusable dry electrodes for initial builds due to higher impedance and instability."
  },
  {
    num:"02", tag:"The circuit", title:"Wiring it up",
    body:"The MyoWare 2.0 exposes power, ground, and signal. Connect SIG to Arduino A0, VCC to 5V, and GND to ground. The sensor includes a reference electrode: place outer electrodes on the muscle belly and the centre electrode over a nearby bony area to establish differential measurement.",
    callout:null
  },
  {
    num:"03", tag:"The firmware", title:"Arduino sketch",
    body:"Use a simple loop to stream ADC values at ~200Hz over serial. Open the Arduino Serial Plotter to visualise. A correct setup shows bursts of activity during contraction and low baseline noise at rest.",
    callout:"If no signal appears, check that the reference electrode is placed on bone, not muscle. If the signal saturates, reposition electrodes further apart or onto a less dense muscle region."
  },
  {
    num:"04", tag:"Electrode placement", title:"Getting a good signal",
    body:"Place electrodes ~2cm apart along the flexor digitorum superficialis on the anterior forearm. A practical method: make a fist, identify the strongest muscle bulge, and centre electrodes there. Place the reference electrode on the lateral epicondyle. Clean skin beforehand to reduce impedance.",
    callout:null
  },
  {
    num:"05", tag:"Signal validation", title:"How to know it's working",
    body:"A valid EMG signal shows a low baseline at rest, clear activation bursts during contraction, and rapid return to baseline. Common issues include baseline drift (dry electrodes), high noise (power interference), or flatline signals (wiring errors).",
    callout:null
  },
  {
    num:"06", tag:"Next steps", title:"From waveform to classifier",
    body:"Once stable acquisition is achieved, the same setup can feed directly into myojam’s training pipeline. Collect gesture samples, train a personal model, and deploy a working classifier in under 30 minutes.",
    callout:null
  },
]

export default function BuildYourOwn() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />

      <div style={{ background:"linear-gradient(135deg, #f0fff8 0%, #fafafa 70%)", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
            <span onClick={()=>navigate("/education")} style={{ fontSize:13, color:"var(--accent)", cursor:"pointer" }}>Education</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)" }}>→</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)", fontWeight:300 }}>Build your own EMG sensor</span>
          </div>

          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.15)", borderRadius:100, padding:"5px 16px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
            Hardware · 8 min read
          </div>

          <h1 style={{ fontSize:"clamp(28px, 5vw, 52px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", lineHeight:1.08, marginBottom:24 }}>
            Build your own EMG sensor.<br/>
            <span style={{ color:"var(--accent)" }}>A weekend project for under $60.</span>
          </h1>

          <p style={{ fontSize:17, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, marginBottom:36, maxWidth:580 }}>
            You don’t need a lab to record muscle signals. This is a complete, reproducible path from parts to waveform.
          </p>

          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <FaceAvatar seed={3} size={40} />
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"var(--text)" }}>Jaden Wong</div>
              <div style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300 }}>Founder & Lead Engineer · October 30, 2025</div>
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
                  <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.7, margin:0 }}>{s.callout}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop:56, background:"var(--bg-secondary)", borderRadius:"var(--radius)", padding:"40px", border:"1px solid var(--border)" }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Conclusion</div>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0 }}>
            The barrier to entry for EMG hardware is now minimal. With inexpensive components and open-source tooling, functional biosignal systems are accessible to anyone. The constraint is no longer cost or complexity — it is awareness and execution.
          </p>
        </div>

        <ArticleBar
          url="https://myojam.com/education/build-your-own"
          title="Build your own EMG sensor."
          citation={{ apa:`Wong, J. (2025, October 30). Build your own EMG sensor. myojam. https://myojam.com/education/build-your-own` }}
          presetLikes={89}
          storageKey="like_build_your_own"
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