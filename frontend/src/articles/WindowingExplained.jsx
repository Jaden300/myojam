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

const ABSTRACT = "Signal segmentation — the process of dividing a continuous EMG stream into discrete analysis windows — is the least glamorous step in the EMG classification pipeline, and arguably the most consequential. This article examines the engineering trade-offs involved in window size and overlap selection, their effects on classification latency, accuracy, and temporal resolution, and the specific choices made in myojam's pipeline."

const SECTIONS = [
  {
    num:"01", tag:"Why windows exist", title:"The fundamental problem",
    body:"Machine learning classifiers expect fixed-size input vectors. A continuous EMG stream produces an unbounded sequence of samples. The solution is sliding window analysis: take a chunk of N consecutive samples, compute features on it, classify it, then slide the window forward by some step S and repeat. This converts a streaming signal into a sequence of discrete classification events. Every design decision downstream — feature computation, model training, real-time performance — depends on what N and S are.",
    callout:null
  },
  {
    num:"02", tag:"Window length", title:"The accuracy-latency trade-off",
    body:"Longer windows contain more signal, which means features can be computed with lower statistical noise. A 500ms window gives a much more reliable estimate of mean absolute value than a 50ms window — simply because you're averaging over ten times as many samples. But a 500ms window also means the system can't respond faster than 500ms after a gesture begins. For real-time gesture control, that latency is perceptible and frustrating. The industry consensus has settled around 150–300ms as the sweet spot — long enough for stable feature estimation, short enough for responsive control.",
    callout:"myojam uses 200-sample windows at 200Hz — exactly 1 second of signal. This is longer than typical real-time systems because the web demo prioritises classification clarity over response speed. A production assistive device would use ~150ms windows."
  },
  {
    num:"03", tag:"Overlap", title:"Trading compute for smoothness",
    body:"The step size S determines how often the classifier runs. If S = N (no overlap), each window is independent and the classifier produces one prediction per window length. If S = N/4 (75% overlap), the classifier runs four times per window length, producing smoother output but requiring four times the compute. High overlap makes the output feel more responsive even though the underlying window length hasn't changed — because new predictions arrive more frequently.",
    callout:null
  },
  {
    num:"04", tag:"Post-processing", title:"The majority vote trick",
    body:"A common post-processing step is majority voting: instead of reporting the single-window prediction, report the most common prediction over the last K windows. This dramatically reduces spurious single-window mispredictions. The cost is additional latency and reduced sensitivity to rapid gesture transitions. For stable gesture control, the trade-off is usually worth it.",
    callout:null
  },
  {
    num:"05", tag:"Stationarity", title:"The hidden assumption",
    body:"Time-domain features like MAV, RMS, ZC, and WL assume the signal within a window is approximately stationary. A window that spans a gesture transition violates this assumption, producing features that are a meaningless blend of two states. Shorter windows reduce this problem, which is another argument for lower latency systems despite increased noise.",
    callout:"Onset detection — identifying when a gesture actually begins — can align windows with stable segments of signal, dramatically improving feature quality."
  },
  {
    num:"06", tag:"myojam's choices", title:"N=200, S=50, fs=200Hz",
    body:"myojam uses N=200 (1 second), S=50 (250ms step, 75% overlap). This matches the Ninapro DB5 dataset and ensures feature consistency between training and inference. These parameters prioritise clarity and stability for demonstration purposes rather than minimum latency. A production system would reduce both N and S significantly.",
    callout:null
  },
]

export default function WindowingExplained() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />

      <div style={{ background:"linear-gradient(135deg, #f0f4ff 0%, #fafafa 70%)", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
            <span onClick={()=>navigate("/education")} style={{ fontSize:13, color:"var(--accent)", cursor:"pointer" }}>Education</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)" }}>→</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)", fontWeight:300 }}>Windowing explained</span>
          </div>

          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.15)", borderRadius:100, padding:"5px 16px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
            Signal processing · 7 min read
          </div>

          <h1 style={{ fontSize:"clamp(28px, 5vw, 52px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", lineHeight:1.08, marginBottom:24 }}>
            The art of cutting a signal into pieces.<br/>
            <span style={{ color:"var(--accent)" }}>Window size, overlap, and why they matter more than you think.</span>
          </h1>

          <p style={{ fontSize:17, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, marginBottom:36, maxWidth:580 }}>
            Before any classification happens, a continuous EMG stream gets chopped into overlapping segments. The choices made here silently determine everything downstream.
          </p>

          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <FaceAvatar seed={6} size={40} />
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"var(--text)" }}>Jaden Wong</div>
              <div style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300 }}>Founder & Lead Engineer · July 5, 2025</div>
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
            Windowing is invisible to users but foundational to system behaviour. The parameters N and S define latency, responsiveness, feature quality, and compute cost. Different applications require different trade-offs — demos optimise clarity, assistive devices optimise speed, and research systems optimise reproducibility.
          </p>
        </div>

        <ArticleBar
          url="https://myojam.com/education/windowing-explained"
          title="The art of cutting a signal into pieces."
          citation={{
            apa:`Wong, J. (2025, July 5). The art of cutting a signal into pieces. myojam. https://myojam.com/education/windowing-explained`
          }}
          presetLikes={29}
          storageKey="like_windowing"
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