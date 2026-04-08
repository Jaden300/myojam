import { useNavigate } from "react-router-dom"
import Navbar from "../Navbar"
import Footer from "../Footer"

const META = {
  grade: "Grades 9–12",
  subject: "Biology / Physics",
  duration: "75 minutes",
  groupSize: "Individual or pairs",
  materials: ["Computer with browser", "myojam.com/demo", "myojam.com/playground", "Printed student worksheet (optional)", "Whiteboard"],
  standards: ["NGSS HS-LS1-2", "NGSS HS-PS4-1", "AP Biology: Nervous system", "IB Biology: Neural signalling"],
}

const SECTIONS = [
  {
    num:"01", phase:"Warm-up", time:"10 min", color:"#FF2D78",
    title:"What happens when you clench your fist?",
    body:"Open with this question on the board. Give students 2 minutes to write their answer individually, then discuss as a class. Expected answers will mention muscles, tendons, the brain — but rarely electricity. Introduce the concept that every muscle contraction is fundamentally an electrical event: motor neurons fire, depolarisation propagates along muscle fibres, and that electrical activity can be detected from outside the body.",
    activity:null,
    teacher:"Draw the motor neuron → neuromuscular junction → muscle fibre pathway on the board. The key concept: action potentials in motor neurons trigger action potentials in muscle fibres via acetylcholine release at the NMJ.",
  },
  {
    num:"02", phase:"Direct instruction", time:"15 min", color:"#F97316",
    title:"The biology of EMG",
    body:"Introduce surface electromyography. A surface electrode is a voltage sensor — it measures the difference in electrical potential between two points on the skin surface. When motor units beneath the electrode fire synchronously, the summed electrical field is large enough to be detected through skin, subcutaneous fat, and fascia. The result is a time-varying voltage signal: flat at rest, bursting during contraction.",
    activity:null,
    teacher:"Key terms to define and put on board: motor unit, motor unit action potential (MUAP), summation, recruitment threshold, conduction velocity. Ask: why does a stronger contraction produce a larger EMG signal? Answer: more motor units are recruited simultaneously.",
  },
  {
    num:"03", phase:"Exploration", time:"20 min", color:"#3B82F6",
    title:"Explore real EMG data",
    body:"Direct students to myojam.com/demo. In Dataset mode, students click each of the 6 gesture buttons and observe the waveform displayed. They should answer these questions in their worksheet: Which gesture produces the largest amplitude signal? Which produces the most rapid oscillations? Does the signal return to baseline immediately when you stop, or does it decay gradually? What happens to the graph when you click the same gesture repeatedly — does it look the same each time?",
    activity:"Student worksheet Q1–4: Describe the waveform shape for each gesture. Estimate the amplitude range. Count visible oscillations in 0.5 seconds for two different gestures and compare.",
    teacher:"Circulate and prompt students who finish early: 'What do you think the signal looks like for someone with more upper body mass? Would their amplitude be higher or lower and why?'",
  },
  {
    num:"04", phase:"Investigation", time:"15 min", color:"#8B5CF6",
    title:"Draw your own signal",
    body:"Move students to myojam.com/playground. They draw waveforms with the mouse and observe the feature extraction panel update in real time. Guide them through the four features: MAV (overall energy), RMS (signal power), ZC (frequency content), WL (signal complexity). Students draw three waveforms — one flat (rest), one smooth and slow, one rapid and jagged — and record the feature values for each.",
    activity:"Worksheet Q5–8: Fill in the feature table for each drawn signal. Which feature changes most between rest and active states? Which feature changes most between a slow contraction and a fast one?",
    teacher:"The key insight to draw out: MAV and RMS capture 'how much' energy; ZC and WL capture 'how complex' the signal is. These are complementary — you need both types to distinguish gestures.",
  },
  {
    num:"05", phase:"Discussion", time:"10 min", color:"#10B981",
    title:"From biology to technology",
    body:"Bring the class back together. Discuss: if we can measure muscle signals from outside the body, what could we do with them? Brainstorm applications: prosthetic limbs, gaming interfaces, assistive technology for people who can't use keyboards, rehabilitation monitoring. Introduce myojam as a specific implementation: a system that reads forearm EMG and classifies 6 gestures to control a computer cursor.",
    activity:null,
    teacher:"Ask: 'What would make this technology hard to use reliably?' Expected answers: electrode placement, sweat, signal variability. These become the next lesson's questions.",
  },
  {
    num:"06", phase:"Exit ticket", time:"5 min", color:"#F59E0B",
    title:"3-2-1 exit ticket",
    body:"Students write: 3 things they learned, 2 questions they still have, 1 real-world application they'd want to build if they could. Collect these — the questions are excellent material for the next lesson and for formative assessment.",
    activity:"Exit ticket slip (half sheet). Students keep the 'application' section — they'll build on it in the myocode lesson.",
    teacher:"Common misconceptions to watch for: 'EMG reads thoughts' (no — it reads muscle activity, which is one step downstream of thought), 'the signal is digital' (no — it's analogue voltage, digitised by the ADC).",
  },
]

const DIFFERENTIATION = [
  { label:"Support", color:"#3B82F6", items:["Provide a pre-filled waveform diagram with key terms labelled","Pair with a stronger student for the Playground activity","Provide sentence starters for exit ticket"] },
  { label:"Extension", color:"#FF2D78", items:["Research the Ninapro database and explain the data collection protocol","Calculate the Nyquist frequency for 200Hz sampling and explain its significance","Design an experiment to test how fatigue changes EMG amplitude"] },
  { label:"ELL support", color:"#10B981", items:["Vocabulary list with definitions in both English and L1 if possible","Diagram-based worksheet version available","Peer discussion in L1 permitted during exploration phase"] },
]

import Quiz from "./Quiz"

const QUIZ_QUESTIONS = [
  {
    question: "Where is the electrical signal that EMG measures actually generated?",
    options: ["In the brain's motor cortex","At the neuromuscular junction and muscle fibre membrane","In the tendon connecting muscle to bone","In the skin surface beneath the electrode"],
    correct: 1,
    explanation: "EMG records the summed electrical activity of muscle fibre action potentials. These are triggered at the neuromuscular junction when motor neurons release acetylcholine, causing depolarisation along the muscle fibre membrane — not in the brain or tendon."
  },
  {
    question: "Why does a stronger muscle contraction produce a larger amplitude EMG signal?",
    options: ["The muscle fibres physically move closer to the electrode","More motor units are recruited and fire simultaneously","The electrode gains more electrical charge from friction","The sampling rate increases with contraction force"],
    correct: 1,
    explanation: "Larger force requires recruiting more motor units. When more motor units fire simultaneously, their individual electrical fields sum together, producing a larger detectable voltage at the surface electrode. This is called spatial summation."
  },
  {
    question: "What does the Zero Crossing Rate (ZC) feature primarily capture about an EMG signal?",
    options: ["The average energy of the signal","The total signal length or path","A proxy for the frequency content of the signal","The time between bursts of activity"],
    correct: 2,
    explanation: "ZC counts how often the signal crosses zero. A high-frequency signal crosses zero many times per second; a low-frequency signal crosses few times. ZC is therefore a proxy for frequency content — cheaper to compute than a full spectral analysis."
  },
  {
    question: "A myojam window contains 200 samples recorded at 200Hz. How long is that window in time?",
    options: ["0.1 seconds","0.5 seconds","1 second","2 seconds"],
    correct: 2,
    explanation: "Time = samples / sample rate = 200 / 200 = 1 second. This is myojam's window length — each classification uses exactly one second of EMG data."
  },
  {
    question: "Which of the following is NOT a source of noise in a surface EMG signal?",
    options: ["Powerline interference at 50/60Hz","Cross-talk from neighbouring muscles","The electrode's distance from the motor cortex","Motion artefacts from electrode movement"],
    correct: 2,
    explanation: "Surface EMG detects local muscle fibre activity — it doesn't measure anything from the motor cortex directly. The cortex is the source of the motor command, but what EMG captures is the downstream effect at the muscle level. The electrode's distance from the cortex is irrelevant."
  },
  {
    question: "What is the purpose of the 20–90Hz bandpass filter applied to myojam's EMG signal?",
    options: ["To increase the signal amplitude for easier detection","To remove DC drift and high-frequency noise while preserving gesture information","To convert the analogue signal to a digital one","To synchronise the signal with the classifier's 200Hz sample rate"],
    correct: 1,
    explanation: "Useful EMG gesture information lives between roughly 20–90Hz. Below 20Hz you get electrode movement artefacts and DC drift; above 90Hz you get amplifier noise. The Butterworth bandpass filter removes both without introducing timing distortion."
  },
  {
    question: "Surface EMG electrodes are placed on skin, not inside the muscle. What limitation does this introduce?",
    options: ["The signal is too strong to record accurately","The signal picks up activity from multiple nearby muscles, causing cross-talk","The electrodes can only detect rest, not contraction","The sampling rate is limited to 20Hz at the skin surface"],
    correct: 1,
    explanation: "Surface electrodes pick up the summed electrical field from all motor units within detection range — which often spans multiple muscles. This means a ring finger flex also partially activates signals from middle and pinky muscles, blurring the classification problem."
  },
  {
    question: "A student draws a flat, nearly horizontal line in the Signal Playground. Which feature would you expect to be highest relative to other drawn signals?",
    options: ["MAV (Mean Absolute Value)","RMS (Root Mean Square)","ZC (Zero Crossing Rate)","WL (Waveform Length)"],
    correct: 2,
    explanation: "A flat line oscillating near zero would cross zero frequently if it has any noise at all, giving a relatively high ZC. MAV and RMS would be very low (little energy), and WL would also be low (little variation between samples). But actually — for a truly flat signal all features approach zero; ZC would be highest relatively because any tiny fluctuation crosses zero multiple times. In the playground, rapidly jagged signals have the highest ZC."
  },
]

export default function LessonEMGBasics() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>

      <Navbar />

      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg, #fff0f5 0%, #fafafa 70%)", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <div style={{ maxWidth:760, margin:"0 auto" }}>
          <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" }}>
            <span onClick={()=>navigate("/educators")} style={{ fontSize:13, color:"#10B981", cursor:"pointer", fontWeight:400 }}>For educators</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)" }}>→</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)", fontWeight:300 }}>Lesson plan</span>
          </div>

          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
            {[META.grade, META.subject, `⏱ ${META.duration}`].map(tag=>(
              <span key={tag} style={{ fontSize:11, fontWeight:500, color:"#FF2D78", background:"rgba(255,45,120,0.08)", border:"1px solid rgba(255,45,120,0.15)", borderRadius:100, padding:"4px 12px" }}>{tag}</span>
            ))}
          </div>

          <h1 style={{ fontSize:"clamp(28px,5vw,48px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", lineHeight:1.08, marginBottom:20 }}>
            What is EMG? Reading<br/><span style={{ color:"#FF2D78" }}>muscle signals in the classroom.</span>
          </h1>
          <p style={{ fontSize:16, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, maxWidth:580 }}>
            Students discover how surface electromyography works, explore real EMG waveforms, and connect the biology of motor neurons to measurable electrical signals — using live data from the myojam demo.
          </p>
        </div>
      </div>

      <div style={{ maxWidth:760, margin:"0 auto", padding:"56px 32px 80px" }}>

        {/* At a glance */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16, marginBottom:56 }}>
          <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"24px" }}>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Materials needed</div>
            {META.materials.map(m=>(
              <div key={m} style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, marginBottom:6, display:"flex", gap:8 }}>
                <span style={{ color:"var(--accent)", fontWeight:500 }}>✓</span>{m}
              </div>
            ))}
          </div>
          <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"24px" }}>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Curriculum standards</div>
            {META.standards.map(s=>(
              <div key={s} style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, marginBottom:6, display:"flex", gap:8 }}>
                <span style={{ color:"var(--accent)", fontWeight:500 }}>→</span>{s}
              </div>
            ))}
          </div>
        </div>

        {/* Learning objectives */}
        <div style={{ background:"rgba(255,45,120,0.04)", border:"1px solid rgba(255,45,120,0.15)", borderLeft:"3px solid #FF2D78", borderRadius:"0 var(--radius) var(--radius) 0", padding:"24px 28px", marginBottom:56 }}>
          <div style={{ fontSize:11, fontWeight:600, color:"#FF2D78", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Learning objectives</div>
          {["Students can describe the biological basis of surface EMG signals", "Students can identify MAV, RMS, ZC, and WL features in a waveform", "Students can connect motor neuron physiology to EMG signal characteristics", "Students can explain at least two real-world applications of EMG technology"].map(o=>(
            <div key={o} style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, marginBottom:8, display:"flex", gap:10 }}>
              <span style={{ color:"#FF2D78", fontWeight:600, fontSize:12, marginTop:2 }}>✓</span>{o}
            </div>
          ))}
        </div>

        {/* Lesson phases */}
        <div style={{ fontSize:14, fontWeight:600, color:"var(--text)", marginBottom:24 }}>Lesson plan</div>
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {SECTIONS.map((s,i)=>(
            <div key={s.num} style={{ padding:"40px 0", borderBottom:i<SECTIONS.length-1?"1px solid var(--border)":"none" }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:16 }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:s.color+"18", border:`2px solid ${s.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:s.color, flexShrink:0 }}>{s.num}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, fontWeight:500, color:s.color, background:s.color+"15", borderRadius:100, padding:"2px 8px" }}>{s.phase}</span>
                    <span style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>{s.time}</span>
                  </div>
                  <h3 style={{ fontSize:19, fontWeight:600, color:"var(--text)", letterSpacing:"-0.3px", marginBottom:12 }}>{s.title}</h3>
                  <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, marginBottom:s.activity||s.teacher?16:0 }}>{s.body}</p>
                  {s.activity && (
                    <div style={{ background:"rgba(59,130,246,0.06)", border:"1px solid rgba(59,130,246,0.2)", borderLeft:"3px solid #3B82F6", borderRadius:"0 8px 8px 0", padding:"14px 18px", marginBottom:s.teacher?12:0 }}>
                      <div style={{ fontSize:11, fontWeight:600, color:"#3B82F6", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Student activity</div>
                      <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.7, fontWeight:300, margin:0 }}>{s.activity}</p>
                    </div>
                  )}
                  {s.teacher && (
                    <div style={{ background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.2)", borderLeft:"3px solid #F59E0B", borderRadius:"0 8px 8px 0", padding:"14px 18px" }}>
                      <div style={{ fontSize:11, fontWeight:600, color:"#F59E0B", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Teacher notes</div>
                      <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.7, fontWeight:300, margin:0 }}>{s.teacher}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Differentiation */}
        <div style={{ marginTop:56 }}>
          <div style={{ fontSize:14, fontWeight:600, color:"var(--text)", marginBottom:20 }}>Differentiation strategies</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {DIFFERENTIATION.map(d=>(
              <div key={d.label} style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius-sm)", border:"1px solid var(--border)", borderTop:`3px solid ${d.color}`, padding:"20px" }}>
                <div style={{ fontSize:12, fontWeight:600, color:d.color, marginBottom:12 }}>{d.label}</div>
                {d.items.map(item=>(
                  <div key={item} style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.6, marginBottom:8, display:"flex", gap:6 }}>
                    <span style={{ color:d.color, fontWeight:600, fontSize:10, marginTop:2 }}>•</span>{item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Assessment */}
        <div style={{ marginTop:40, background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"32px" }}>
          <div style={{ fontSize:11, fontWeight:600, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:16 }}>Assessment rubric</div>
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:8, fontSize:12 }}>
            {[
              ["Criterion","Developing (1–2)","Proficient (3)","Extending (4)"],
              ["Explains EMG basis","Identifies muscles involved","Connects action potentials to voltage","Explains motor unit summation and recruitment"],
              ["Interprets waveform","Names one visible feature","Describes amplitude and frequency","Quantifies features and explains differences"],
              ["Applies to real world","Names one application","Explains how EMG enables it","Evaluates limitations and design trade-offs"],
            ].map((row,ri)=>(
              row.map((cell,ci)=>(
                <div key={`${ri}-${ci}`} style={{ padding:"10px 12px", background: ri===0?"var(--accent-soft)":ci===0?"var(--bg)":"white", borderRadius:6, border:"1px solid var(--border)", fontSize:ri===0?11:12, fontWeight:ri===0||ci===0?500:300, color:ri===0?"var(--accent)":"var(--text-secondary)", lineHeight:1.5 }}>{cell}</div>
              ))
            ))}
          </div>
        </div>

        <Quiz
          title="EMG Basics — quick check"
          questions={QUIZ_QUESTIONS}
          accentColor="#FF2D78"
        />

        {/* Nav */}
        <div style={{ marginTop:40, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <button onClick={()=>navigate("/educators")} style={{ background:"transparent", color:"var(--text-secondary)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, fontFamily:"var(--font)", fontWeight:400, cursor:"pointer" }}>
            ← Back to educator hub
          </button>
          <button onClick={()=>navigate("/educators/lesson-gesture-classifier")} style={{ background:"var(--accent)", color:"#fff", border:"none", borderRadius:100, padding:"10px 24px", fontSize:13, fontFamily:"var(--font)", fontWeight:500, cursor:"pointer" }}>
            Next lesson: Gesture classifier →
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}