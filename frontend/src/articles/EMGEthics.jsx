import { useRef, useEffect, useState } from "react"
import Navbar from "../Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "../Footer"
import UpNext from "../UpNext"
import ArticleBar from "../ArticleUtils"
import NeuralNoise from "../components/NeuralNoise"

const PINK   = "#FF2D78"
const BLUE   = "#3B82F6"
const GREEN  = "#10B981"
const PURPLE = "#8B5CF6"
const AMBER  = "#F59E0B"
const RED    = "#EF4444"

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

const RISK_LEVELS = [
  { level: 1, label: "Gesture intent", color: GREEN,  risk: "Low",    detail: "Which movement the user intends — the primary use case. Necessary for the interface to function.", canInfer: "Hand pose, finger configuration, grip type" },
  { level: 2, label: "Fatigue state", color: AMBER,   risk: "Medium", detail: "Median frequency drop >20% signals muscular fatigue. Detectable from routine interaction data.", canInfer: "Cognitive load, physical strain, sleep deficit" },
  { level: 3, label: "Identity",       color: PINK,    risk: "High",   detail: "Motor unit recruitment patterns are individually unique. Identification accuracy >95% without cooperation.", canInfer: "Person identity, linked biometric profile" },
  { level: 4, label: "Health markers", color: RED,     risk: "High",   detail: "Tremor frequency, conduction velocity, and asymmetry indicate neurological and musculoskeletal conditions.", canInfer: "Parkinson's, MS, carpal tunnel, age, injury history" },
]

const PRIVACY_ROWS = [
  { dimension: "Raw signal storage",        myojam: "Never — discarded after feature extraction",    commercial: "Often retained on-server indefinitely",       myojamGood: true },
  { dimension: "Network transmission",      myojam: "None — fully local inference",                  commercial: "Signals sent to cloud APIs for processing",    myojamGood: true },
  { dimension: "Biometric linking",         myojam: "Architecturally prevented (no ID tied to data)", commercial: "Account-linked; cross-app ID possible",        myojamGood: true },
  { dimension: "Third-party data sharing",  myojam: "None (open-source, auditable)",                 commercial: "Often permitted in terms of service",          myojamGood: true },
  { dimension: "User model ownership",      myojam: "Full — model stays on device, user-deletable", commercial: "Usually owned by the platform",                myojamGood: true },
  { dimension: "Feature extraction audit",  myojam: "Open — source code publicly visible",          commercial: "Closed; features unknown to user",             myojamGood: true },
]

const DESIGN_CHECKS = [
  { id:"01", criterion:"Local-only processing",     status:"done",    detail:"All signal processing and inference happen on the user's device. No EMG data leaves the browser.", color:GREEN },
  { id:"02", criterion:"No raw signal retention",   status:"done",    detail:"Raw ADC samples are never written to storage. Feature vectors are computed then discarded.", color:GREEN },
  { id:"03", criterion:"Opt-in data collection",    status:"done",    detail:"Training data is collected only when the user explicitly triggers a calibration session.", color:GREEN },
  { id:"04", criterion:"Open feature extraction",   status:"done",    detail:"The full feature pipeline (MAV, RMS, ZC, WL) is in public source code — no hidden signal mining.", color:GREEN },
  { id:"05", criterion:"User-deletable models",     status:"done",    detail:"Calibration data is stored in browser localStorage and can be cleared at any time via the UI.", color:GREEN },
  { id:"06", criterion:"No third-party API calls",  status:"done",    detail:"Inference runs in-browser. No analytics, tracking pixels, or external ML API calls during sessions.", color:GREEN },
]

function RiskSpectrumDiagram() {
  return (
    <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"28px 24px", margin:"28px 0" }}>
      <div style={{ fontSize:12, fontWeight:500, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:20 }}>
        What EMG can reveal — inference risk spectrum
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {RISK_LEVELS.map((r) => (
          <div key={r.level} style={{ display:"flex", alignItems:"stretch", gap:0, borderRadius:8, overflow:"hidden", border:`1px solid ${r.color}22` }}>
            <div style={{ width:4, background:r.color, flexShrink:0 }} />
            <div style={{ display:"flex", alignItems:"center", gap:0, width:"100%", flexWrap:"wrap" }}>
              <div style={{ width:32, height:32, background:`${r.color}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, alignSelf:"stretch" }}>
                <span style={{ fontSize:13, fontWeight:700, color:r.color }}>{r.level}</span>
              </div>
              <div style={{ padding:"10px 14px", flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{r.label}</span>
                  <span style={{ fontSize:10, fontWeight:600, color:r.color, background:`${r.color}18`, borderRadius:100, padding:"1px 8px" }}>{r.risk} risk</span>
                </div>
                <div style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.5, marginBottom:3 }}>{r.detail}</div>
                <div style={{ fontSize:11, color:r.color, fontWeight:500 }}>Can infer: {r.canInfer}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:16, fontSize:11, color:"var(--text-secondary)", fontStyle:"italic" }}>
        Levels 1–2 are inherent to gesture interfaces. Levels 3–4 emerge with sufficient training data and model capacity. Architecture determines exposure.
      </div>
    </div>
  )
}

function PrivacyTable() {
  return (
    <div style={{ margin:"28px 0", overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
        <thead>
          <tr style={{ borderBottom:"2px solid var(--border)" }}>
            <th style={{ textAlign:"left", padding:"10px 12px", color:"var(--text-secondary)", fontWeight:500, fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em" }}>Dimension</th>
            <th style={{ textAlign:"left", padding:"10px 12px", color:PINK, fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em" }}>myojam</th>
            <th style={{ textAlign:"left", padding:"10px 12px", color:"var(--text-secondary)", fontWeight:500, fontSize:11, textTransform:"uppercase", letterSpacing:"0.06em" }}>Typical commercial system</th>
          </tr>
        </thead>
        <tbody>
          {PRIVACY_ROWS.map((r, i) => (
            <tr key={r.dimension} style={{ borderBottom:"1px solid var(--border)", background: i%2===0?"transparent":"var(--bg-secondary)" }}>
              <td style={{ padding:"11px 12px", color:"var(--text)", fontWeight:500 }}>{r.dimension}</td>
              <td style={{ padding:"11px 12px", color:GREEN }}>
                <span style={{ marginRight:6 }}>✓</span>{r.myojam}
              </td>
              <td style={{ padding:"11px 12px", color:"var(--text-secondary)" }}>{r.commercial}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DesignChecklist() {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:12, margin:"24px 0" }}>
      {DESIGN_CHECKS.map((c) => (
        <div key={c.id} style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius-sm)", border:"1px solid var(--border)", borderLeft:`3px solid ${c.color}`, padding:"14px 16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <div style={{ width:20, height:20, borderRadius:"50%", background:`${c.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:c.color }}>✓</div>
            <span style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{c.criterion}</span>
          </div>
          <p style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.6, margin:0 }}>{c.detail}</p>
        </div>
      ))}
    </div>
  )
}

function IdentificationChart() {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const bars = [
    { label: "Fingerprint ID", acc: 99.2, color: BLUE },
    { label: "Face recognition", acc: 97.8, color: PURPLE },
    { label: "EMG identification (Waheed et al. 2022)", acc: 95.5, color: PINK },
    { label: "Voice recognition", acc: 94.0, color: AMBER },
    { label: "Gait pattern", acc: 88.2, color: GREEN },
  ]

  return (
    <div ref={ref} style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"24px", margin:"28px 0" }}>
      <div style={{ fontSize:12, fontWeight:500, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:20 }}>
        Biometric identification accuracy by modality
      </div>
      {bars.map((b, i) => (
        <div key={b.label} style={{ marginBottom:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:12, color: b.color === PINK ? PINK : "var(--text-secondary)", fontWeight: b.color === PINK ? 600 : 400 }}>{b.label}</span>
            <span style={{ fontSize:12, fontWeight:600, color: b.color === PINK ? PINK : "var(--text)" }}>{b.acc}%</span>
          </div>
          <div style={{ height:8, background:"var(--border)", borderRadius:4, overflow:"hidden" }}>
            <div style={{
              height:"100%", borderRadius:4, background:b.color,
              width: vis ? `${b.acc}%` : "0%",
              transition: `width 0.8s ease ${i * 0.1}s`
            }} />
          </div>
        </div>
      ))}
      <div style={{ marginTop:14, fontSize:11, color:"var(--text-secondary)", fontStyle:"italic" }}>
        EMG identification accuracy (95.5%) is comparable to face recognition. Source: Waheed et al. (2022), IEEE Trans. Neural Syst. Rehabil. Eng.
      </div>
    </div>
  )
}

export default function EthicsOfEMG() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />

      <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <NeuralNoise color={[0.90, 0.18, 0.47]} opacity={0.85} speed={0.0006} />
        <div style={{ position:"absolute", inset:0, background:"rgba(3,0,18,0.65)", zIndex:1 }} />
        <div style={{ maxWidth:720, margin:"0 auto", position:"relative", zIndex:2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
            <span onClick={()=>navigate("/education")} style={{ fontSize:13, color:"var(--accent)", cursor:"pointer" }}>Education</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>→</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Ethics of EMG</span>
          </div>

          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.08)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,45,120,0.3)", borderRadius:100, padding:"5px 16px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
            Ethics · 7 min read
          </div>

          <h1 style={{ fontSize:"clamp(28px, 5vw, 52px)", fontWeight:600, letterSpacing:"-1.5px", color:"#fff", lineHeight:1.08, marginBottom:24 }}>
            Who owns your muscle data?<br/>
            <span style={{ color:"var(--accent)" }}>The ethics of biometric gesture interfaces.</span>
          </h1>

          <p style={{ fontSize:17, color:"rgba(255,255,255,0.72)", fontWeight:300, lineHeight:1.75, marginBottom:36, maxWidth:580 }}>
            EMG signals are biometric data. They can identify you, reveal health information, and expose physiological states. As these systems scale, ethical considerations become unavoidable.
          </p>

          {/* Stats strip */}
          <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
            {[
              { val:">95%", label:"EMG ID accuracy", color:PINK },
              { val:"0",    label:"EMG-specific consumer regulations", color:AMBER },
              { val:"100%", label:"myojam local processing", color:GREEN },
            ].map(s => (
              <div key={s.label} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"14px 20px", minWidth:120 }}>
                <div style={{ fontSize:24, fontWeight:700, color:s.color, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", marginTop:4, lineHeight:1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:36, display:"flex", alignItems:"center", gap:12 }}>
            <FaceAvatar seed={5} size={40} />
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"#fff" }}>myojam team</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Founder & Lead Engineer · August 14, 2025</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"64px 32px 80px" }}>
        <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", borderLeft:"3px solid var(--accent)", padding:"24px 28px", marginBottom:56 }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Abstract</div>
          <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0, fontStyle:"italic" }}>{ABSTRACT}</p>
        </div>

        {/* Section 01 */}
        <div style={{ padding:"0 0 48px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--accent-soft)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:"var(--accent)" }}>01</div>
            <span style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em" }}>EMG as biometric</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", marginBottom:16 }}>You can be identified by your muscle signals</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, marginBottom:8 }}>
            EMG signals are individually distinctive. The pattern of motor unit recruitment, conduction velocity distribution, and muscle geometry that produces your EMG signal is effectively unique to your physiology. Research has demonstrated identification accuracy above 95% from short recordings — even without subject cooperation — placing EMG firmly alongside fingerprint and face recognition as a biometric modality.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, marginBottom:20 }}>
            Any system storing raw EMG data is therefore storing a biometric identifier. Unlike passwords, biometrics cannot be changed. This creates permanent liability for systems that retain raw signals or allow cross-session linkage.
          </p>

          <IdentificationChart />

          <div style={{ background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.15)", borderLeft:"3px solid var(--accent)", borderRadius:"0 var(--radius-sm) var(--radius-sm) 0", padding:"16px 20px", marginTop:16 }}>
            <p style={{ fontSize:13, color:"var(--text-secondary)", margin:0 }}>
              <strong style={{ color:"var(--accent)" }}>myojam:</strong> All EMG signals are processed locally. Raw signal data is never transmitted or stored. Feature vectors are computed on-device and not retained between sessions. This is an explicit architectural decision, not a default.
            </p>
          </div>
        </div>

        {/* Section 02 */}
        <div style={{ padding:"48px 0", borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--accent-soft)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:"var(--accent)" }}>02</div>
            <span style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Health disclosure</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", marginBottom:16 }}>What EMG reveals about you — beyond gesture intent</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, marginBottom:8 }}>
            EMG signals contain more information than gesture intent. The frequency content of a signal shifts measurably with age. Tremor signatures — rhythmic 4–8 Hz oscillations — are characteristic of Parkinson's disease and essential tremor. Fatigue alters motor unit recruitment dynamics in ways that correlate with sleep deprivation and cognitive load. Signal asymmetries can indicate musculoskeletal injury or nerve damage.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, marginBottom:20 }}>
            A sufficiently trained model, applied to routine interaction data, could infer health status without user awareness or consent. The risk escalates with data volume: a single session reveals little; months of continuous use creates a longitudinal health record.
          </p>

          <RiskSpectrumDiagram />
        </div>

        {/* Section 03 */}
        <div style={{ padding:"48px 0", borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--accent-soft)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:"var(--accent)" }}>03</div>
            <span style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Model ownership</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", marginBottom:16 }}>Who owns a personalised model?</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, marginBottom:8 }}>
            When users train personalised classifiers using their own EMG data, the resulting model encodes statistical patterns derived from their body — its weights are, in a real sense, a compressed representation of their physiology. The architecture and training pipeline originate elsewhere, but the learned parameters are a product of the user's unique signal.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300 }}>
            In open-source contexts the answer is clearer: the user can inspect, export, or delete the model freely. Commercial systems typically obscure ownership terms within licensing agreements. Some transfer model ownership to the platform on upload, meaning a user's physiological data — in compressed form — becomes a platform asset. myojam stores calibration models exclusively in the user's browser localStorage. They are never uploaded, and the user can delete them at any time.
          </p>
        </div>

        {/* Section 04 — Privacy comparison */}
        <div style={{ padding:"48px 0", borderBottom:"1px solid var(--border)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--accent-soft)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:"var(--accent)" }}>04</div>
            <span style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Regulation</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", marginBottom:16 }}>The regulatory gap</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, marginBottom:8 }}>
            Biometric regulation exists in some jurisdictions — GDPR in the EU, BIPA in Illinois, CPRA in California — but EMG-specific consumer frameworks do not exist anywhere. Medical regulation (FDA 510(k), CE mark) applies only when EMG is used diagnostically. Consumer gesture interfaces fall outside this scope entirely, leaving users with minimal protections governing storage, processing, or third-party sharing of their EMG data.
          </p>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, marginBottom:20 }}>
            The gap between technical capability and legal oversight is substantial, and unlikely to close quickly. Until it does, architecture — not regulation — is the primary privacy protection.
          </p>

          <PrivacyTable />
        </div>

        {/* Section 05 — Design checklist */}
        <div style={{ padding:"48px 0 0" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--accent-soft)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:600, color:"var(--accent)" }}>05</div>
            <span style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Design principles</span>
          </div>
          <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", marginBottom:16 }}>What responsible design looks like</h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, marginBottom:20 }}>
            Responsible EMG systems prioritise local processing, avoid transmitting raw signals, maintain transparency in feature extraction, and give users explicit control over data retention. These are not technical constraints imposed by hardware — they are product decisions. The checklist below summarises where myojam currently stands.
          </p>

          <DesignChecklist />
        </div>

        {/* Conclusion */}
        <div style={{ marginTop:56, background:"var(--bg-secondary)", borderRadius:"var(--radius)", padding:"40px", border:"1px solid var(--border)" }}>
          <div style={{ fontSize:11, fontWeight:500, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>Conclusion</div>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0 }}>
            EMG interfaces derive power from deeply personal biological signals. That power introduces proportional ethical responsibility. Identification accuracy above 95%, zero EMG-specific regulations, and escalating health inference capabilities mean that architecture — where signals are processed, what is retained, who has access — is the only meaningful protection currently available to users. myojam's local-first design is a deliberate response to these constraints, not an incidental feature.
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

      <UpNext current="/education/ethics-of-emg" />
      <Footer />
    </div>
  )
}
