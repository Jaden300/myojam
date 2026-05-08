import { useState, useEffect, useRef } from "react"
import Navbar from "../Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "../Footer"
import UpNext from "../UpNext"
import ArticleBar from "../ArticleUtils"
import NeuralNoise from "../components/NeuralNoise"

const RED="#EF4444", AMBER="#F59E0B", GREEN="#10B981", BLUE="#3B82F6", PURPLE="#8B5CF6", PINK="#FF2D78"

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

const ABSTRACT = "Surface EMG gesture classification achieves impressive accuracy in controlled laboratory settings — myojam included, at 84.85% cross-subject LOSO. But controlled lab conditions are systematically different from deployment. This article quantifies six specific failure modes, citing the studies that measured them, and maps each to its best-available mitigation. The combined effect of all six factors simultaneously can push accuracy below 52% — a drop of over 40 percentage points from the laboratory ceiling."

// ── Degradation chart ─────────────────────────────────────────────────────────
const SCENARIOS = [
  { label: "Within-subject, controlled lab",            acc: 95.0,  color: GREEN,  note: "Idealised ceiling",             key: "baseline" },
  { label: "Cross-subject LOSO (myojam baseline)",      acc: 84.85, color: BLUE,   note: "Realistic benchmark",            key: "cross" },
  { label: "Session-to-session, same user",             acc: 79.0,  color: AMBER,  note: "Tkach et al., 2010",             key: "session" },
  { label: "Electrode displaced 1 cm (longitudinal)",   acc: 67.8,  color: RED,    note: "Young et al., 2011",             key: "elec" },
  { label: "Untrained limb position (arm raised)",      acc: 71.0,  color: RED,    note: "Castellini & Smagt, 2009",       key: "limb" },
  { label: "Extended-use fatigue (>10 min continuous)", acc: 74.0,  color: AMBER,  note: "Scheme & Englehart, 2011",       key: "fatigue" },
  { label: "All factors combined (estimated)",          acc: 52.0,  color: RED,    note: "synthesised from above",         key: "all" },
]

function DegradationChart() {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.15 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {SCENARIOS.map((s, i) => (
        <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 230, fontSize: 11, color: "var(--text-secondary)", fontWeight: 300, textAlign: "right", flexShrink: 0, lineHeight: 1.35 }}>{s.label}</div>
          <div style={{ flex: 1, height: 10, background: "var(--border)", borderRadius: 100, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: vis ? `${s.acc}%` : "0%",
              background: s.color,
              borderRadius: 100,
              transition: `width 0.8s ease ${i * 0.12}s`
            }}/>
          </div>
          <div style={{ width: 44, fontSize: 12, fontWeight: 700, color: s.color, flexShrink: 0 }}>{s.acc}%</div>
          <div style={{ width: 170, fontSize: 10, color: "var(--text-tertiary)", fontWeight: 300, fontStyle: "italic", flexShrink: 0 }}>{s.note}</div>
        </div>
      ))}
      <div style={{ marginTop: 8, fontSize: 10, color: "var(--text-tertiary)", textAlign: "center", fontWeight: 300 }}>
        Six-gesture classification accuracy under increasingly realistic deployment conditions. 80% is the widely-cited clinical adequacy floor (Scheme & Englehart, 2011).
      </div>
    </div>
  )
}

// ── Failure mode detail cards ─────────────────────────────────────────────────
const FAILURE_MODES = [
  {
    id: "01",
    mode: "Electrode displacement",
    color: RED,
    drop: "−28 pp",
    dropNum: 28,
    mechanism: "A shift of 1 cm moves the electrode's detection volume past the edge of the target motor unit pool. The classifier now receives signal from a qualitatively different set of muscle fibres — a different input distribution, not a noisy version of the same one.",
    trigger: "Longitudinal shift: −28 pp at 1 cm. Transverse shift: −25 pp at 1 cm. Below 0.5 cm: minor (< 8 pp).",
    mitigations: [
      { label: "Anatomical landmarks", detail: "Place relative to muscle belly centre and bony reference points (lateral epicondyle). Reduces placement variance from ~2 cm to ~0.4 cm.", gain: "+8–12 pp" },
      { label: "Silicone adhesive fixation", detail: "Reduces within-session drift from micro-movements during activity.", gain: "+3–5 pp" },
      { label: "Higher-density arrays", detail: "16+ electrodes spanning the full forearm circumference reduce per-electrode position sensitivity.", gain: "+5–10 pp" },
    ],
    citation: "Young, Hargrove & Kuiken (2011). IEEE Trans. Biomed. Eng., 58(2), 360–368.",
  },
  {
    id: "02",
    mode: "Session-to-session drift",
    color: AMBER,
    drop: "−10–17 pp",
    dropNum: 14,
    mechanism: "Skin impedance changes with temperature, hydration, and perspiration. Motor unit fibre composition drifts slightly over weeks. The signal the classifier sees on Friday is systematically different from the Monday signal it trained on — even with perfect electrode placement.",
    trigger: "Any re-attachment. Even daily reuse without skin preparation produces measurable drift. Variance is highest for first session after a rest day.",
    mitigations: [
      { label: "Few-shot calibration", detail: "Collect 10–20 labelled windows per gesture class from the user at session start. Recovers 8–12 pp of lost accuracy in under 60 seconds of user interaction.", gain: "+8–12 pp" },
      { label: "Skin preparation", detail: "Abrasion with prep pad + alcohol wipe before attachment. Reduces initial impedance from >500 kΩ to <50 kΩ, stabilising signal characteristics.", gain: "+3–6 pp" },
      { label: "MVC normalisation", detail: "Divide feature values by max voluntary contraction amplitude recorded at session start. Removes absolute amplitude shift while preserving gesture ratio information.", gain: "+4–7 pp" },
    ],
    citation: "Tkach, Huang & Kuiken (2010). J. NeuroEng. Rehabil., 7(1), 21.",
  },
  {
    id: "03",
    mode: "Limb position change",
    color: RED,
    drop: "−15–25 pp",
    dropNum: 20,
    mechanism: "Arm position changes the geometry of forearm muscles relative to circumferential electrodes. Shoulder elevation also activates postural stabilisers (deltoid, triceps) that were quiescent during training — their EMG bleeds into forearm electrode channels as cross-talk.",
    trigger: "Any arm position not represented in training data. Most published datasets (including Ninapro DB5) record only: seated, elbow ~90°, forearm horizontal. Elevation, pronation, or elbow extension all trigger degradation.",
    mitigations: [
      { label: "Multi-posture training", detail: "Record the same gesture set in 3–5 arm orientations. Improves generalisation to untrained positions by 10–20 pp at the cost of 3–5× training time.", gain: "+10–20 pp" },
      { label: "Position-invariant features", detail: "Ratio-based features (e.g. normalised channel weights) are less sensitive to absolute amplitude changes caused by postural shifts.", gain: "+5–10 pp" },
      { label: "IMU fusion", detail: "Add an inertial measurement unit to the armband. Feed arm orientation as an additional classifier input to condition predictions on posture.", gain: "+8–15 pp" },
    ],
    citation: "Castellini & van der Smagt (2009). J. NeuroEng. Rehabil., 6(1), 1–11.",
  },
  {
    id: "04",
    mode: "Muscle fatigue",
    color: AMBER,
    drop: "−10–20 pp",
    dropNum: 15,
    mechanism: "Sustained contraction recruits additional motor units as fatigued fibres drop out. Conduction velocity decreases, shifting the EMG power spectrum toward lower frequencies. Overall amplitude increases as compensation. A classifier trained on fresh-muscle data cannot account for this systematic spectral shift.",
    trigger: "Noticeable after 5–10 min of continuous use. Severity scales with contraction intensity. Fast-twitch (Type II) fibres fatigue disproportionately, producing a larger spectral shift than slow-twitch dominant activation.",
    mitigations: [
      { label: "Fatigue-robust feature selection", detail: "WL (Waveform Length) degrades 35% less under fatigue than ZCR (Zero Crossing Rate), which is highly frequency-sensitive. Selecting fatigue-stable features reduces classifier drift.", gain: "+5–10 pp" },
      { label: "Adaptive amplitude thresholds", detail: "Track running amplitude and update classification thresholds to track the slow fatigue-induced amplitude increase.", gain: "+4–8 pp" },
      { label: "Scheduled re-calibration", detail: "Prompt the user for a 30-second re-calibration every 20–30 min of use. Recovers most of the fatigue degradation at low cost.", gain: "+8–15 pp" },
    ],
    citation: "Scheme & Englehart (2011). J. Rehabil. Res. Dev., 48(6), 643–660.",
  },
  {
    id: "05",
    mode: "Muscle cross-talk",
    color: PURPLE,
    drop: "−5–12 pp",
    dropNum: 8,
    mechanism: "Over 20 muscles are packed into the forearm. Surface electrodes detect volume-conducted activity from muscles several centimetres away. Ring and pinky finger flexion are the worst-affected gestures — the flexor digitorum superficialis (FDS) shares deep finger slips, so activating one finger inevitably co-activates adjacent regions of the same muscle belly.",
    trigger: "Worse for: isolated finger flexions (vs. power grasp), small forearm circumference (<24 cm), and lateral electrode positions close to thenar/hypothenar muscles.",
    mitigations: [
      { label: "High-density electrode arrays", detail: "128+ electrodes with spatial filtering (Laplacian) can localise single motor units, nearly eliminating cross-talk. Not feasible on consumer hardware.", gain: "+8–15 pp" },
      { label: "Blind source separation (ICA)", detail: "Independent component analysis can partially unmix cross-talk on ≥8 channel setups. Computationally expensive for real-time use.", gain: "+3–7 pp" },
      { label: "Gesture set simplification", detail: "Choosing gestures from more anatomically distinct muscle groups (e.g. fist vs. wrist extension vs. pronation) reduces cross-talk confusability.", gain: "+5–12 pp" },
    ],
    citation: "De Luca & Mambrito (1987). J. Neurophysiol., 58(5), 1086–1098.",
  },
  {
    id: "06",
    mode: "Population distribution shift",
    color: PURPLE,
    drop: "Variable",
    dropNum: 18,
    mechanism: "Classifier performance is only valid for the population distribution of the training data. Most benchmark datasets (Ninapro DB5: 10 subjects, ages 22–40, intact limb, right-handed) systematically exclude elderly users, left-handed users, individuals with spasticity or reduced grip strength, and — critically — prosthetic users, who are the primary intended beneficiary of EMG control.",
    trigger: "Any user characteristic not represented in training distribution. Estimated accuracy on amputees from able-bodied training: 55–70% (Fougner et al., 2012). Accuracy on elderly users (60+): 65–75% (Scheme et al., 2013).",
    mitigations: [
      { label: "User-specific calibration", detail: "Even 20 labelled windows per class from the target user, appended to the training set, shifts the decision boundary toward the user's personal signal characteristics.", gain: "+10–25 pp" },
      { label: "Inclusive dataset collection", detail: "Training on diverse populations (age, handedness, limb status) improves cross-population generalization without requiring per-user calibration.", gain: "+5–15 pp" },
      { label: "Transfer learning", detail: "Domain-adaptive fine-tuning: train base model on large dataset, fine-tune final layers on small user-specific sample.", gain: "+8–20 pp" },
    ],
    citation: "Scheme & Englehart (2011). J. Rehabil. Res. Dev., 48(6), 643–660.",
  },
]

function FailureModeCard({ fm }) {
  const [open, setOpen] = useState(false)
  const c = fm.color
  return (
    <div style={{ border: `1px solid ${c}22`, borderRadius: 14, overflow: "hidden", background: "var(--bg)", transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = `${c}50`}
      onMouseLeave={e => e.currentTarget.style.borderColor = `${c}22`}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "22px 24px", borderBottom: `1px solid ${c}14`, background: `linear-gradient(120deg, ${c}06 0%, transparent 70%)` }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${c}14`, border: `1px solid ${c}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: c, fontFamily: "monospace" }}>{fm.id}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: c, textTransform: "uppercase", letterSpacing: "0.04em" }}>{fm.mode}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: c, borderRadius: 100, padding: "2px 10px" }}>{fm.drop}</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, margin: 0 }}>{fm.mechanism}</p>
        </div>
      </div>

      {/* Trigger row */}
      <div style={{ padding: "14px 24px", borderBottom: `1px solid ${c}10`, background: `${c}04` }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: c, textTransform: "uppercase", letterSpacing: "0.08em", marginRight: 10 }}>When it happens</span>
        <span style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 300 }}>{fm.trigger}</span>
      </div>

      {/* Mitigations toggle */}
      <div style={{ padding: "14px 24px", borderBottom: open ? `1px solid ${c}14` : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {fm.mitigations.length} known mitigations
        </span>
        <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: `1px solid ${c}30`, borderRadius: 100, padding: "4px 14px", fontSize: 11, color: c, cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = `${c}10`}
          onMouseLeave={e => e.currentTarget.style.background = "none"}>
          {open ? "Hide ↑" : "Show ↓"}
        </button>
      </div>

      {open && (
        <div style={{ display: "grid", gap: 0 }}>
          {fm.mitigations.map((m, i) => (
            <div key={i} style={{ padding: "16px 24px", borderTop: `1px solid ${c}10`, display: "grid", gridTemplateColumns: "1fr auto", gap: "8px 16px", alignItems: "start" }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{m.label}</div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.65, margin: 0 }}>{m.detail}</p>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, background: `${GREEN}12`, border: `1px solid ${GREEN}28`, borderRadius: 100, padding: "3px 12px", whiteSpace: "nowrap", flexShrink: 0, alignSelf: "start" }}>{m.gain}</div>
            </div>
          ))}
          <div style={{ padding: "10px 24px", background: "var(--bg-secondary)", borderTop: `1px solid ${c}10` }}>
            <span style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 300, fontStyle: "italic" }}>Source: {fm.citation}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Comparison: lab vs deployment ─────────────────────────────────────────────
function GapChart() {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const pairs = [
    { cond: "Controlled (lab)",  val: 95.0,  color: GREEN },
    { cond: "Cross-subject",      val: 84.85, color: BLUE },
    { cond: "Deployed (typical)", val: 72.0,  color: AMBER },
    { cond: "Adversarial",        val: 52.0,  color: RED },
  ]
  return (
    <div ref={ref} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
      {pairs.map((p, i) => (
        <div key={p.cond} style={{ padding: "24px 16px", borderRight: i < 3 ? "1px solid var(--border)" : "", textAlign: "center", background: i % 2 === 0 ? "var(--bg)" : "var(--bg-secondary)" }}>
          <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${p.color}15`, border: `2px solid ${p.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                width: vis ? `${(p.val / 100) * 32}px` : "0px",
                height: vis ? `${(p.val / 100) * 32}px` : "0px",
                borderRadius: "50%",
                background: p.color,
                transition: `all 0.7s ease ${i * 0.15}s`,
                opacity: 0.85,
              }}/>
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: p.color, letterSpacing: "-1px", lineHeight: 1, marginBottom: 4 }}>{p.val}%</div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 400, lineHeight: 1.4 }}>{p.cond}</div>
        </div>
      ))}
    </div>
  )
}

export default function WhyEMGHard() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />

      <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <NeuralNoise color={[0.85, 0.10, 0.30]} opacity={0.85} speed={0.0006} />
        <div style={{ position:"absolute", inset:0, background:"rgba(3,0,18,0.65)", zIndex:1 }} />
        <div style={{ maxWidth:720, margin:"0 auto", position:"relative", zIndex:2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
            <span onClick={()=>navigate("/education")} style={{ fontSize:13, color:"var(--accent)", cursor:"pointer" }}>Education</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>→</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Why EMG is hard</span>
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.08)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,45,120,0.3)", borderRadius:100, padding:"5px 16px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
            Signal processing · 8 min read
          </div>
          <h1 style={{ fontSize:"clamp(28px, 5vw, 52px)", fontWeight:600, letterSpacing:"-1.5px", color:"#fff", lineHeight:1.08, marginBottom:24 }}>
            Why EMG degrades in the real world.<br/>
            <span style={{ color:"var(--accent)" }}>Six failure modes, quantified.</span>
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.72)", fontWeight:300, lineHeight:1.75, marginBottom:36, maxWidth:580 }}>
            95% in the lab. 52% when everything goes wrong at once. The gap is not a mystery — each failure mode has a name, a magnitude, and a mitigation.
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <FaceAvatar seed={2} size={40} />
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"#fff" }}>myojam team</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Founder & Lead Engineer · November 18, 2025</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"64px 32px 80px" }}>

        {/* Abstract */}
        <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", borderLeft:`3px solid ${PINK}`, padding:"24px 28px", marginBottom:44 }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Abstract</div>
          <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0, fontStyle:"italic" }}>{ABSTRACT}</p>
        </div>

        {/* Stats strip */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0, border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:48 }}>
          {[
            { val:"95%",  label:"Lab ceiling",         sub:"Within-subject, controlled",    color: GREEN },
            { val:"84.85%", label:"myojam baseline",   sub:"Cross-subject LOSO",            color: BLUE },
            { val:"−28 pp", label:"Electrode shift",   sub:"1 cm displacement (max single)", color: RED },
            { val:"52%",  label:"Combined floor",      sub:"All 6 factors adversarial",      color: RED },
          ].map(({ val, label, sub, color }, i) => (
            <div key={label} style={{ padding:"20px 16px", background: i%2===0?"var(--bg)":"var(--bg-secondary)", borderRight:i<3?"1px solid var(--border)":"none", textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:700, color, letterSpacing:"-0.5px", marginBottom:4 }}>{val}</div>
              <div style={{ fontSize:11, fontWeight:600, color:"var(--text)", marginBottom:3 }}>{label}</div>
              <div style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Gap chart */}
        <div style={{ marginBottom:48 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:16 }}>The accuracy spectrum</div>
          <GapChart />
          <p style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.7, marginTop:12 }}>
            The gap between 95% (controlled lab) and 52% (all failure modes combined) is not a modelling failure — it's six distinct engineering problems. Addressing them individually recovers most of the loss.
          </p>
        </div>

        {/* Full degradation chart */}
        <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:56 }}>
          <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Accuracy under deployment conditions</span>
            <span style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>6-gesture classification · per published study</span>
          </div>
          <div style={{ padding:"24px" }}>
            <DegradationChart />
          </div>
        </div>

        {/* Section header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:8 }}>The six failure modes</div>
          <h2 style={{ fontSize:"clamp(20px,3vw,28px)", fontWeight:700, color:"var(--text)", letterSpacing:"-0.6px", marginBottom:8 }}>Each one has a cause, a magnitude, and a fix.</h2>
          <p style={{ fontSize:13.5, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, margin:0 }}>
            Click "Show" on each card to see the available mitigations with expected accuracy recovery estimates.
          </p>
        </div>

        <div style={{ display:"grid", gap:16, marginBottom:56 }}>
          {FAILURE_MODES.map(fm => <FailureModeCard key={fm.id} fm={fm} />)}
        </div>

        {/* Comparison table */}
        <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:48 }}>
          <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Failure mode summary</span>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
                  {["Mode","Accuracy drop","Trigger","Best mitigation","Gain"].map(h => (
                    <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:10.5, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { mode:"Electrode displacement", drop:"−28 pp",    trigger:"1 cm shift",           best:"Anatomical landmarks",       gain:"+8–12 pp", color:RED },
                  { mode:"Session-to-session",     drop:"−10–17 pp", trigger:"Any re-attachment",     best:"Few-shot calibration",       gain:"+8–12 pp", color:AMBER },
                  { mode:"Limb position",          drop:"−15–25 pp", trigger:"Arm raised/pronated",   best:"Multi-posture training",     gain:"+10–20 pp", color:RED },
                  { mode:"Muscle fatigue",         drop:"−10–20 pp", trigger:">5 min continuous",     best:"Scheduled re-calibration",   gain:"+8–15 pp", color:AMBER },
                  { mode:"Cross-talk",             drop:"−5–12 pp",  trigger:"Finger isolation tasks", best:"Gesture set simplification", gain:"+5–12 pp", color:PURPLE },
                  { mode:"Population shift",       drop:"Variable",  trigger:"Non-training users",    best:"User-specific calibration",  gain:"+10–25 pp", color:PURPLE },
                ].map(({ mode, drop, trigger, best, gain, color }, ri) => (
                  <tr key={mode} style={{ borderBottom:"1px solid var(--border)", background:ri%2===0?"var(--bg)":"var(--bg-secondary)" }}>
                    <td style={{ padding:"10px 16px", fontSize:12.5, fontWeight:600, color }}>{mode}</td>
                    <td style={{ padding:"10px 16px", fontSize:12, fontWeight:700, color, fontFamily:"monospace" }}>{drop}</td>
                    <td style={{ padding:"10px 16px", fontSize:11.5, color:"var(--text-secondary)", fontWeight:300 }}>{trigger}</td>
                    <td style={{ padding:"10px 16px", fontSize:11.5, color:"var(--text-secondary)", fontWeight:300 }}>{best}</td>
                    <td style={{ padding:"10px 16px", fontSize:12, fontWeight:600, color:GREEN }}>{gain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Conclusion */}
        <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", padding:"40px", border:"1px solid var(--border)" }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Conclusion</div>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 16px" }}>
            None of these failure modes are unsolvable — each maps to an engineering intervention with a quantified expected recovery. But they compound. Addressing only electrode placement while ignoring session drift and limb position leaves 30+ percentage points on the table.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0 }}>
            The 84.85% myojam reports is a meaningful baseline for a classifier with zero per-user calibration. Closing the gap to the 95% laboratory ceiling requires concurrent progress on at least three of these fronts: better placement protocols, at-session calibration, and multi-posture training data. That's the actual research problem.
          </p>
        </div>

        <ArticleBar
          url="https://myojam.com/education/why-emg-is-hard"
          title="Why EMG degrades in the real world: six failure modes, quantified."
          citation={{ apa:`Wong, J. (2025, November 18). Why EMG degrades in the real world. myojam. https://myojam.com/education/why-emg-is-hard` }}
          presetLikes={44}
          storageKey="like_why_emg_hard"
        />

        <div style={{ marginTop:32, display:"flex", justifyContent:"center" }}>
          <button onClick={()=>navigate("/education")} style={{ background:"transparent", color:"var(--text-secondary)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, cursor:"pointer", fontFamily:"var(--font)" }}>
            ← Back to Education
          </button>
        </div>
      </div>

      <UpNext current="/education/why-emg-is-hard" />
      <Footer />
    </div>
  )
}
