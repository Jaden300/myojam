import { useRef, useEffect, useState } from "react"
import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "./Footer"
import UpNext from "./UpNext"
import ArticleBar from "./ArticleUtils"
import NeuralNoise from "./components/NeuralNoise"

function FaceAvatar({ seed, size = 48 }) {
  const skinTones = ["#f5dce4", "#e8c9a0", "#c8956c", "#8d5524", "#f5dce4"]
  const hairColors = ["#1a1a1a", "#4a2c0a", "#8B4513", "#FF2D78", "#2c2c2c"]
  const skin = skinTones[seed % skinTones.length]
  const hair = hairColors[(seed * 3) % hairColors.length]
  const eyeOffset = (seed % 3) - 1
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="38" fill="#FFF0F5" stroke="#FFD6E7" strokeWidth="1.5"/>
      <rect x="33" y="54" width="14" height="12" rx="4" fill={skin}/>
      <ellipse cx="40" cy="38" rx="20" ry="22" fill={skin}/>
      {seed % 3 === 0 && (<><ellipse cx="40" cy="20" rx="20" ry="10" fill={hair}/><rect x="20" y="18" width="40" height="10" fill={hair}/></>)}
      {seed % 3 === 1 && (<><ellipse cx="40" cy="20" rx="20" ry="10" fill={hair}/><rect x="20" y="18" width="6" height="22" rx="3" fill={hair}/><rect x="54" y="18" width="6" height="22" rx="3" fill={hair}/><rect x="20" y="18" width="40" height="8" fill={hair}/></>)}
      {seed % 3 === 2 && ([...Array(8)].map((_, i) => <circle key={i} cx={22 + i * 5.5} cy={18 + Math.sin(i) * 3} r="7" fill={hair}/>))}
      <ellipse cx={33 + eyeOffset} cy="37" rx="3.5" ry="4" fill="white"/>
      <ellipse cx={47 + eyeOffset} cy="37" rx="3.5" ry="4" fill="white"/>
      <circle cx={33 + eyeOffset} cy="37.5" r="2.2" fill="#1D1D1F"/>
      <circle cx={47 + eyeOffset} cy="37.5" r="2.2" fill="#1D1D1F"/>
      <circle cx={34 + eyeOffset} cy="36.5" r="0.7" fill="white"/>
      <circle cx={48 + eyeOffset} cy="36.5" r="0.7" fill="white"/>
      <path d={`M ${29+eyeOffset} 31 Q ${33+eyeOffset} 29 ${37+eyeOffset} 31`} stroke="#1D1D1F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d={`M ${43+eyeOffset} 31 Q ${47+eyeOffset} 29 ${51+eyeOffset} 31`} stroke="#1D1D1F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M 40 39 Q 38 44 36 45 Q 40 46.5 44 45 Q 42 44 40 39" fill="none" stroke={skin === "#f5dce4" ? "#e8b8c8" : "#a06040"} strokeWidth="1.2" strokeLinecap="round"/>
      <path d={seed % 2 === 0 ? "M 34 50 Q 40 55 46 50" : "M 33 50 Q 40 56 47 50"} stroke="#1D1D1F" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

// ── Animated cost bar
function CostBar({ label, cost, maxCost, color, year, who, vis }) {
  const pct = Math.max(4, (cost / maxCost) * 100)
  return (
    <div style={{ display:"flex", gap:14, alignItems:"center", marginBottom:10 }}>
      <div style={{ width:44, fontSize:11, fontWeight:600, color:"var(--text-tertiary)", flexShrink:0, textAlign:"right" }}>{year}</div>
      <div style={{ flex:1 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
          <span style={{ fontSize:12, fontWeight:500, color:"var(--text)" }}>{label}</span>
          <span style={{ fontSize:12, fontWeight:700, color }}>{cost === 0 ? "Free" : `$${cost.toLocaleString()}`}</span>
        </div>
        <div style={{ height:10, background:"var(--border)", borderRadius:5, overflow:"hidden" }}>
          <div style={{ height:"100%", width: vis ? `${pct}%` : "0%", background:color, borderRadius:5, transition:"width 1.1s cubic-bezier(0.22,1,0.36,1)" }}/>
        </div>
        <div style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300, marginTop:3 }}>{who}</div>
      </div>
    </div>
  )
}

const ABSTRACT = "Myoelectric prosthetics have existed since the 1960s. EMG gesture recognition research has existed for nearly as long. So why, in 2024, does muscle-computer control still feel like science fiction to most people? This article traces the shift from $50,000 proprietary clinical systems to $68 open-source hardware pipelines — and maps exactly what changed, what remains hard, and what a working open-source system like myojam actually demonstrates."

const HARDWARE = [
  { name:"Delsys Trigno",   ch:16,  hz:2000, cost:"~$30,000", openApi:false,  status:"Research standard", color:"#EF4444", note:"Gold standard accuracy; used in Ninapro DB1, DB2, DB7" },
  { name:"Myo armband",     ch:8,   hz:200,  cost:"Discontinued", openApi:true,  status:"Discontinued 2018", color:"#F59E0B", note:"Used in Ninapro DB5; SDK open-sourced after shutdown" },
  { name:"MyoWare 2.0",     ch:"1×board", hz:"200+ Hz", cost:"$40/board", openApi:true,  status:"Available", color:"#10B981", note:"Single-ended; myojam uses 1 board for proof-of-concept" },
  { name:"OpenBCI Cyton",   ch:8,   hz:250,  cost:"~$500",  openApi:true,  status:"Available", color:"#3B82F6", note:"EEG-focused but works for surface EMG; higher SNR than MyoWare" },
  { name:"BITalino (r)evolution", ch:"1–8", hz:1000, cost:"~$150", openApi:true, status:"Available", color:"#8B5CF6", note:"BioSignalPlux ecosystem; common in European research" },
]

const DATASETS = [
  { name:"Ninapro DB5",  subj:10,  gestures:52, hz:200,  hardware:"Myo armband",    url:"ninapro.hevs.ch", myojam:true,  note:"myojam's training set" },
  { name:"Ninapro DB2",  subj:40,  gestures:49, hz:2000, hardware:"Delsys Trigno",  url:"ninapro.hevs.ch", myojam:false, note:"Largest Ninapro; clinical-grade hardware" },
  { name:"PhysioNet EMG",subj:32,  gestures:8,  hz:4000, hardware:"Custom",         url:"physionet.org",   myojam:false, note:"Wrist flexion/extension; medical focus" },
  { name:"GRASP",        subj:43,  gestures:33, hz:2048, hardware:"CyberGlove+EMG", url:"epfl.ch",         myojam:false, note:"Grasping taxonomy; multi-modal" },
  { name:"UC2018 EMG",   subj:20,  gestures:6,  hz:2000, hardware:"Delsys Trigno",  url:"UCI ML Repo",     myojam:false, note:"Clean 6-class set; widely cited" },
]

const SECTIONS = [
  {
    num:"01", tag:"History", title:"EMG in prosthetics: a 60-year head start",
    body:"Myoelectric prosthetics — artificial limbs controlled by muscle signals — have existed since the 1960s. The Otto Bock system, still the clinical standard, uses two bipolar EMG electrodes on the residual limb to control a single open/close motion. The principle hasn't changed much. What has changed is the price, the data availability, and who gets to experiment. A system that cost $50,000 in 1975 in a specialist clinic is now reproducible for under $100 in a bedroom — not because the physics changed, but because the ecosystem around it did.",
    callout:null,
  },
  {
    num:"02", tag:"The shift", title:"Three things that made this possible",
    body:"The democratization wasn't one breakthrough — it was three parallel shifts arriving at roughly the same time. Consumer sensor hardware (the Myo armband in 2013, MyoWare and OpenBCI through the 2010s) brought the cost of EMG acquisition from $5,000–$30,000 down to under $200. Public datasets like Ninapro (launched 2012) gave researchers common benchmarks to compare against, ending the era where every lab trained on proprietary recordings no one else could access. And the Python ML ecosystem — scikit-learn, NumPy, SciPy — turned signal processing pipelines that once required MATLAB licenses and DSP expertise into things any Python programmer could assemble in an afternoon.",
    callout:"The Ninapro database now covers DB1–DB9, spanning over 200 subjects, multiple hardware platforms, and up to 52 hand movements. Before it existed, researchers were comparing results trained on incompatible private datasets — making progress invisible.",
  },
  {
    num:"03", tag:"What's still hard", title:"Why consumer EMG still fails in the real world",
    body:"Despite the progress, two engineering problems remain stubbornly hard at consumer price points. Electrode placement reproducibility: every time you re-attach electrodes, the signal profile shifts — slightly different position, different skin impedance, different compression. A model trained on yesterday's session can drop from 85% to 60% accuracy if placement shifts by 5mm. Clinical systems solved this with rigid electrode rigs and per-session calibration protocols costing 30+ minutes. Consumer hardware doesn't. Signal quality is the second: cheap electrodes have higher contact impedance, and single-ended acquisition (like MyoWare) picks up more common-mode noise than the differential bipolar pairs used in research hardware. Cross-talk between adjacent muscles blurs fine finger movements — the hardest classification problem in the field.",
    callout:null,
  },
  {
    num:"04", tag:"Solutions", title:"How researchers are closing the gap",
    body:"Three approaches are gaining traction, none requiring new hardware. Transfer learning pre-trains a model on a large multi-subject dataset (like all 10 Ninapro DB5 subjects), then fine-tunes it on a new user with 2–5 minutes of calibration data — cutting setup time from 30 minutes to under 5. High-density EMG grids (8×8 electrode arrays instead of 8 bipolar pairs) provide spatial muscle maps that are dramatically more robust to placement variation, though the hardware cost is still prohibitive. Domain adaptation techniques — making classifiers robust to the statistical shift between sessions — can recover 5–10 percentage points of accuracy with no hardware change, by training the model to be invariant to between-session signal drift.",
    callout:"myojam's cross-subject approach — train on 10 people, test on a new person — achieves 84.85% accuracy without any individual calibration. That's the baseline. With even a 3-minute per-user calibration session using transfer learning, published results suggest gains of 5–8 percentage points.",
  },
  {
    num:"05", tag:"Who benefits", title:"The populations this actually matters for",
    body:"The clinical case for accessible EMG is strongest for people with the most to gain and the least access to expensive alternatives. ALS patients losing fine motor control progressively over months or years, children with cerebral palsy for whom standard keyboards are inaccessible, stroke survivors relearning computer use during rehabilitation — for these populations, a $68 sensor setup and an open-source classifier could be genuinely transformative. The barrier isn't the core technology; it's the ecosystem: setup complexity, lack of driver support in mainstream operating systems, and the absence of a community actively maintaining the tools. myojam addresses the third of those directly.",
    callout:null,
  },
  {
    num:"06", tag:"myojam's role", title:"A working, documented proof of concept",
    body:"myojam doesn't claim to be a clinical device. What it demonstrates is that the full pipeline — electrode to computer action — can be built openly, cheaply, and with full reproducibility. Every architectural decision is documented. Every training script is public. The dataset (Ninapro DB5) is freely available to anyone. The goal is to give future developers, researchers, and tinkerers a working starting point with honest performance numbers, rather than a blank page and a claims-without-methodology paper. If someone improves the classifier, extends the gesture vocabulary, or adapts the system for a specific assistive use case, every line of the existing code is available to build on.",
    callout:null,
  },
]

export default function OpenSourceEMG() {
  const navigate = useNavigate()
  const barRef   = useRef(null)
  const [barVis, setBarVis] = useState(false)

  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setBarVis(true) }, { threshold:0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <NeuralNoise color={[0.18, 0.45, 0.90]} opacity={0.85} speed={0.0006} />
        <div style={{ position:"absolute", inset:0, background:"rgba(3,0,18,0.65)", zIndex:1 }}/>
        <div style={{ maxWidth:720, margin:"0 auto", position:"relative", zIndex:2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
            <span onClick={()=>navigate("/education")} style={{ fontSize:13, color:"var(--accent)", cursor:"pointer" }}>Education</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>→</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Open-source EMG</span>
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.08)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,45,120,0.3)", borderRadius:100, padding:"5px 16px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
            Accessibility · 7 min read
          </div>
          <h1 style={{ fontSize:"clamp(28px,5vw,52px)", fontWeight:600, letterSpacing:"-1.5px", color:"#fff", lineHeight:1.08, marginBottom:24 }}>
            From $50,000 to $68:<br/><span style={{ color:"var(--accent)" }}>who gets to build with EMG.</span>
          </h1>
          <p style={{ fontSize:17, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, marginBottom:36, maxWidth:580 }}>
            Myoelectric prosthetics have existed for 60 years. Open-source EMG research has existed for over a decade. Why isn't muscle-computer control mainstream yet — and exactly what changed to make it buildable for $68?
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <FaceAvatar seed={1} size={40}/>
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"#fff" }}>myojam team</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Founder & Lead Engineer · March 28, 2026</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"64px 32px 80px" }}>

        {/* Abstract */}
        <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", borderLeft:"3px solid var(--accent)", padding:"24px 28px", marginBottom:48 }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Abstract</div>
          <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0, fontStyle:"italic" }}>{ABSTRACT}</p>
        </div>

        {/* Stats strip */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0, border:"1px solid var(--border)", borderRadius:"var(--radius)", overflow:"hidden", marginBottom:48 }}>
          {[
            { val:"~1960",  label:"First myoelectric",   sub:"Otto Bock prosthetic", color:"#FF2D78" },
            { val:"$68",    label:"Min. hardware today",  sub:"Arduino + MyoWare 2.0", color:"#10B981" },
            { val:"9",      label:"Public EMG datasets",  sub:"Ninapro DB1–DB9 alone", color:"#8B5CF6" },
            { val:"200+",   label:"Subjects available",   sub:"Across public datasets", color:"#3B82F6" },
          ].map(({ val, label, sub, color }, i) => (
            <div key={label} style={{ padding:"20px 16px", background:"var(--bg-secondary)", borderRight: i < 3 ? "1px solid var(--border)" : "none", textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:700, color, letterSpacing:"-0.5px", marginBottom:4 }}>{val}</div>
              <div style={{ fontSize:11, fontWeight:600, color:"var(--text)", marginBottom:3 }}>{label}</div>
              <div style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Cost accessibility timeline */}
        <div ref={barRef} style={{ border:"1px solid var(--border)", borderRadius:"var(--radius)", overflow:"hidden", marginBottom:48 }}>
          <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Entry cost to EMG development over time</span>
            <span style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>Hardware only · approximate</span>
          </div>
          <div style={{ padding:"24px 24px 20px", background:"var(--bg)" }}>
            <CostBar year="1975" label="Otto Bock myoelectric prosthetic"  cost={50000} maxCost={50000} color="#EF4444" who="Specialist clinics only — not sold to researchers" vis={barVis}/>
            <CostBar year="1995" label="Delsys Bagnoli-8 research system"  cost={12000} maxCost={50000} color="#F59E0B" who="University labs with grant funding" vis={barVis}/>
            <CostBar year="2013" label="Thalmic Labs Myo armband"          cost={199}   maxCost={50000} color="#3B82F6" who="Consumer market — any developer" vis={barVis}/>
            <CostBar year="2021" label="MyoWare 2.0 + Arduino Uno"        cost={68}    maxCost={50000} color="#10B981" who="Hobbyists, students, researchers" vis={barVis}/>
            <CostBar year="2024" label="myojam (software layer)"           cost={0}     maxCost={50000} color="#FF2D78" who="Anyone with the $68 hardware" vis={barVis}/>
            <p style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.6, marginTop:8, marginBottom:0 }}>
              The cost collapsed 99.9% in 50 years. The physics didn't change — the ecosystem did.
            </p>
          </div>
        </div>

        {/* Hardware comparison */}
        <div style={{ border:"1px solid var(--border)", borderRadius:"var(--radius)", overflow:"hidden", marginBottom:48 }}>
          <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>EMG hardware landscape — research vs. open-source</span>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
                  {["Device", "Channels", "Hz", "Cost", "Open API", "Status"].map(h => (
                    <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HARDWARE.map(({ name, ch, hz, cost, openApi, status, color, note }, i) => (
                  <tr key={name} style={{ borderBottom:"1px solid var(--border)", background: i % 2 === 0 ? "var(--bg)" : "transparent" }}>
                    <td style={{ padding:"10px 14px" }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{name}</div>
                      <div style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300, marginTop:2 }}>{note}</div>
                    </td>
                    <td style={{ padding:"10px 14px", fontSize:12, color:"var(--text-secondary)", fontFamily:"monospace" }}>{ch}</td>
                    <td style={{ padding:"10px 14px", fontSize:12, color:"var(--text-secondary)", fontFamily:"monospace" }}>{hz}</td>
                    <td style={{ padding:"10px 14px", fontSize:12, fontWeight:600, color }}>{cost}</td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ fontSize:11, fontWeight:600, color: openApi ? "#10B981" : "#EF4444", background: openApi ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border:`1px solid ${openApi ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`, borderRadius:100, padding:"2px 8px" }}>
                        {openApi ? "Yes" : "No"}
                      </span>
                    </td>
                    <td style={{ padding:"10px 14px", fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding:"12px 20px", fontSize:11, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.6, borderTop:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
            "Open API" means the device's data stream is accessible without a proprietary SDK license. The Myo armband's SDK was open-sourced after Thalmic Labs shut down in 2018 — this is how DB5's data remains usable today.
          </div>
        </div>

        {/* Public datasets */}
        <div style={{ border:"1px solid var(--border)", borderRadius:"var(--radius)", overflow:"hidden", marginBottom:48 }}>
          <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Major public EMG datasets</span>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
                  {["Dataset", "Subjects", "Gestures", "Hz", "Hardware", "Source", "Used by myojam"].map(h => (
                    <th key={h} style={{ padding:"9px 14px", textAlign:"left", fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DATASETS.map(({ name, subj, gestures, hz, hardware, url, myojam, note }, i) => (
                  <tr key={name} style={{ borderBottom:"1px solid var(--border)", background: myojam ? "rgba(255,45,120,0.04)" : i % 2 === 0 ? "var(--bg)" : "transparent" }}>
                    <td style={{ padding:"10px 14px" }}>
                      <div style={{ fontSize:13, fontWeight: myojam ? 700 : 400, color: myojam ? "var(--accent)" : "var(--text)" }}>{name}</div>
                      <div style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300, marginTop:2 }}>{note}</div>
                    </td>
                    <td style={{ padding:"10px 14px", fontSize:12, color:"var(--text-secondary)", fontFamily:"monospace" }}>{subj}</td>
                    <td style={{ padding:"10px 14px", fontSize:12, color:"var(--text-secondary)", fontFamily:"monospace" }}>{gestures}</td>
                    <td style={{ padding:"10px 14px", fontSize:12, color:"var(--text-secondary)", fontFamily:"monospace" }}>{hz}</td>
                    <td style={{ padding:"10px 14px", fontSize:12, color:"var(--text-secondary)" }}>{hardware}</td>
                    <td style={{ padding:"10px 14px", fontSize:11, color:"var(--text-tertiary)", fontFamily:"monospace", fontWeight:300 }}>{url}</td>
                    <td style={{ padding:"10px 14px" }}>
                      {myojam
                        ? <span style={{ fontSize:11, fontWeight:600, color:"var(--accent)", background:"rgba(255,45,120,0.1)", border:"1px solid rgba(255,45,120,0.25)", borderRadius:100, padding:"2px 10px" }}>✓ myojam</span>
                        : <span style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding:"12px 20px", fontSize:11, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.6, borderTop:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
            DB5 was chosen because its hardware (Myo armband, 200 Hz) closely approximates what consumer-grade setups can achieve, making the benchmark honest about real-world performance rather than optimistic about lab conditions.
          </div>
        </div>

        {/* Sections */}
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {SECTIONS.map((s, i) => (
            <div key={s.num} style={{ padding:"48px 0", borderBottom: i < SECTIONS.length-1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--accent-soft)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:"var(--accent)", flexShrink:0 }}>{s.num}</div>
                <span style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.tag}</span>
              </div>
              <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:16 }}>{s.title}</h2>
              <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, marginBottom: s.callout ? 24 : 0 }}>{s.body}</p>
              {s.callout && (
                <div style={{ background:"var(--bg-secondary)", border:"1px solid rgba(255,45,120,0.3)", borderLeft:"3px solid var(--accent)", borderRadius:"0 var(--radius-sm) var(--radius-sm) 0", padding:"16px 20px" }}>
                  <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.7, fontWeight:400, margin:0 }}>{s.callout}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Conclusion */}
        <div style={{ marginTop:56, background:"var(--bg-secondary)", borderRadius:"var(--radius)", padding:"40px", border:"1px solid var(--border)" }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Conclusion</div>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0 }}>
            The cost of entering EMG development fell from $50,000 to $68 in fifty years. The physics didn't change — the ecosystem did. Public datasets, open-source hardware, and accessible ML libraries collectively removed the three barriers that kept this technology in specialist labs. What remains is the ecosystem problem: the tools exist, but the documentation, the community, and the worked examples are still sparse. That's the gap myojam is trying to fill — not a better classifier, but a better starting point.
          </p>
        </div>

        <ArticleBar
          url="https://myojam.com/education/open-source-emg"
          title="From $50,000 to $68: who gets to build with EMG"
          citation={{ apa:`W., J. (2026, March 28). From $50,000 to $68: Who gets to build with EMG. myojam. https://myojam.com/education/open-source-emg` }}
          presetLikes={31}
          storageKey="like_open_source_emg"
        />

        <div style={{ marginTop:32, display:"flex", justifyContent:"center" }}>
          <button onClick={()=>navigate("/education")} style={{ background:"transparent", color:"var(--text-secondary)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, fontFamily:"var(--font)", fontWeight:400, cursor:"pointer" }}>← Back to Education</button>
        </div>
      </div>

      <UpNext current="/education/open-source-emg" />
      <Footer />
    </div>
  )
}
