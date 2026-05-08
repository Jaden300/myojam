import { useRef, useEffect, useState } from "react"
import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "./Footer"
import UpNext from "./UpNext"
import ArticleBar from "./ArticleUtils"
import NeuralNoise from "./components/NeuralNoise"

const PINK = "#FF2D78", BLUE = "#3B82F6", GREEN = "#10B981", PURPLE = "#8B5CF6", AMBER = "#F59E0B"

const CLASSIFIERS = [
  { name:"Random Forest", acc:84.85, train:"~45s", infer:"<5ms", color:PINK,   note:"myojam's classifier — best cross-subject, fastest inference" },
  { name:"SVM (RBF)",     acc:82.3,  train:"~8min", infer:"~18ms", color:BLUE,  note:"Strong but slow to train; sensitive to kernel choice" },
  { name:"k-NN (k=5)",    acc:76.4,  train:"0s",    infer:"~80ms", color:AMBER, note:"No training cost; inference scales with dataset size" },
  { name:"LDA",           acc:71.8,  train:"~2s",   infer:"<1ms",  color:GREEN, note:"Fastest inference; assumes Gaussian class distributions" },
]

function ClassifierChart() {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"24px", margin:"28px 0" }}>
      <div style={{ fontSize:12, fontWeight:500, color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:20 }}>
        Cross-subject LOSO accuracy — classifier comparison
      </div>
      {CLASSIFIERS.map((c, i) => (
        <div key={c.name} style={{ marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:13, fontWeight: c.color===PINK ? 600 : 400, color: c.color===PINK ? PINK : "var(--text-secondary)" }}>{c.name}</span>
              {c.color===PINK && <span style={{ fontSize:10, fontWeight:600, color:PINK, background:"rgba(255,45,120,0.1)", border:"1px solid rgba(255,45,120,0.25)", borderRadius:100, padding:"1px 8px" }}>selected</span>}
            </div>
            <span style={{ fontSize:13, fontWeight:600, color:c.color }}>{c.acc}%</span>
          </div>
          <div style={{ height:8, background:"var(--border)", borderRadius:4, overflow:"hidden" }}>
            <div style={{
              height:"100%", borderRadius:4, background:c.color,
              width: vis ? `${c.acc}%` : "0%",
              transition: `width 0.8s ease ${i * 0.12}s`
            }} />
          </div>
          <div style={{ fontSize:11, color:"var(--text-tertiary)", marginTop:3 }}>Train: {c.train} · Infer: {c.infer} — {c.note}</div>
        </div>
      ))}
      <div style={{ marginTop:14, fontSize:11, color:"var(--text-tertiary)", fontStyle:"italic" }}>
        All classifiers trained on the same 64-dim Hudgins feature vectors, evaluated with 10-fold LOSO cross-validation on Ninapro DB5.
      </div>
    </div>
  )
}

function FeatureImportanceBars() {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const features = [
    { label:"MAV — Mean Absolute Value",   pct:35, color:PINK,   note:"Activation energy · strongest discriminator" },
    { label:"RMS — Root Mean Square",      pct:27, color:PURPLE, note:"Signal power · correlated with MAV" },
    { label:"WL — Waveform Length",        pct:25, color:BLUE,   note:"Contraction complexity · frequency-sensitive" },
    { label:"ZCR — Zero Crossing Rate",    pct:13, color:GREEN,  note:"Frequency proxy · lowest individual contribution" },
  ]
  return (
    <div ref={ref}>
      {features.map(({ label, pct, color, note }) => (
        <div key={label} style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <div>
              <span style={{ fontSize:13, fontWeight:500, color:"var(--text)" }}>{label}</span>
              <span style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300, marginLeft:10 }}>{note}</span>
            </div>
            <span style={{ fontSize:13, fontWeight:700, color }}>{pct}%</span>
          </div>
          <div style={{ height:8, background:"var(--border)", borderRadius:4, overflow:"hidden" }}>
            <div style={{
              height:"100%", width: vis ? `${pct * 2.86}%` : "0%", background:color, borderRadius:4,
              transition:`width 0.8s ease ${features.indexOf(features.find(f=>f.label===label)) * 0.1}s`
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

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

const ABSTRACT = "Random Forest classifiers have become the workhorse of EMG gesture recognition due to their robustness to noise, interpretability, and strong out-of-the-box performance on tabular feature data. This article examines why ensemble tree methods outperform simpler classifiers on biomedical signal data, how hyperparameter tuning affects cross-subject generalisation, and what the 84.85% accuracy figure achieved by myojam actually means in practice."

const SECTIONS = [
  {
    num: "01", tag: "Background", title: "Why not a neural network?",
    body: "Neural networks dominate most modern machine learning benchmarks, so it's reasonable to ask why myojam uses a Random Forest. The answer is practical: on tabular feature data - vectors of handcrafted statistics like MAV, RMS, ZC, and WL - Random Forests consistently match or outperform deep models while requiring orders of magnitude less training data and compute. With 16,269 training windows across 6 classes, a deep network would overfit aggressively without extensive regularisation and data augmentation. A Random Forest reaches competitive accuracy without any of that overhead. It's also interpretable: you can inspect which features matter most, something neural networks make difficult.",
    callout: null,
  },
  {
    num: "02", tag: "The algorithm", title: "How a Random Forest actually works",
    body: "A Random Forest is an ensemble of decision trees trained on random subsets of the training data (bagging) and random subsets of the features at each split (feature randomisation). Each tree learns a slightly different decision boundary, and the final prediction is the majority vote across all trees. This combination of diversity and aggregation dramatically reduces variance - the tendency to overfit - compared to a single deep tree. For EMG data, where the signal is inherently noisy and variable, this variance reduction is particularly valuable. myojam's classifier uses 500 trees with hyperparameters tuned via 100-configuration RandomizedSearchCV, optimising for cross-validated accuracy.",
    callout: "The key hyperparameters tuned: max_depth (limits tree complexity), min_samples_split (minimum samples to split a node), max_features (fraction of features considered at each split), and n_estimators (number of trees). More trees reduce variance but increase inference time - 500 was the sweet spot for <5ms latency.",
  },
  {
    num: "03", tag: "Feature importance", title: "Which features matter most?",
    body: "Random Forests provide a natural measure of feature importance: how much each feature reduces impurity (Gini or entropy) averaged across all trees and splits. For EMG gesture classification, waveform length (WL) and mean absolute value (MAV) consistently rank as the most discriminative features - WL captures the overall complexity and speed of muscle contraction, while MAV reflects activation intensity. Zero crossing rate (ZC), which approximates frequency content, is particularly useful for distinguishing between gestures with similar energy profiles but different oscillation rates. RMS contributes additional power information but is highly correlated with MAV, so its marginal contribution is lower.",
    callout: null,
  },
  {
    num: "04", tag: "Cross-subject generalisation", title: "What 84.85% actually means",
    body: "An 84.85% cross-subject accuracy means the model correctly classifies 84.85% of EMG windows from people it has never seen during training. This is a substantially harder challenge than within-subject accuracy, where the same person's data appears in both training and testing - a common source of inflated accuracy claims in EMG literature. Cross-subject performance drops because EMG signals vary between individuals due to differences in muscle anatomy, electrode placement, skin impedance, and muscle fibre composition. Achieving 84.85% without any per-user calibration is a meaningful result, though it means roughly 1 in 7 classifications is wrong in real-world use.",
    callout: "For comparison, within-subject accuracies on similar datasets often exceed 95%. The 10-point gap between within- and cross-subject performance is the key challenge myojam's future personal model training feature aims to close.",
  },
  {
    num: "05", tag: "Limitations", title: "Where Random Forests fall short",
    body: "Random Forests have real limitations for EMG classification. They don't model temporal dependencies - each window is classified independently, with no memory of what came before. A gesture transition produces a window that is partially one gesture and partially another, and the classifier has no way to handle this gracefully. They also don't naturally adapt to new users. A gradient boosting model or a recurrent neural network could potentially address the temporal issue, while online learning approaches (incrementally updating the model with new user data) could address the adaptation problem. These are the right directions for a more capable future system.",
    callout: null,
  },
]

export default function RandomForestEMG() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--border)", padding: "100px 32px 56px" }}>
        <NeuralNoise color={[0.30, 0.20, 0.85]} opacity={0.85} speed={0.0006} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(3,0,18,0.65)", zIndex: 1 }} />
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <span onClick={() => navigate("/education")} style={{ fontSize: 13, color: "var(--accent)", cursor: "pointer" }}>Education</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>→</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Random Forest & EMG</span>
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,45,120,0.3)",
            borderRadius: 100, padding: "5px 16px",
            fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 24
          }}>Machine Learning · 7 min read</div>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 600,
            letterSpacing: "-1.5px", color: "#fff", lineHeight: 1.08, marginBottom: 24
          }}>Why Random Forest?<br /><span style={{ color: "var(--accent)" }}>The classifier behind myojam.</span></h1>
          <p style={{
            fontSize: 17, color: "var(--text-secondary)", fontWeight: 300,
            lineHeight: 1.75, marginBottom: 36, maxWidth: 580
          }}>
            Why not a neural network? How do ensemble tree methods handle noisy biomedical signals,
            and what does the 84.85% cross-subject accuracy figure actually tell us?
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <FaceAvatar seed={1} size={40} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>myojam team</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 300 }}>Founder & Lead Engineer · March 15, 2026</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 32px 80px" }}>
        {/* Abstract */}
        <div style={{
          background: "var(--bg-secondary)", borderRadius: "var(--radius)",
          border: "1px solid var(--border)", borderLeft: "3px solid var(--accent)",
          padding: "24px 28px", marginBottom: 48
        }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Abstract</div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, fontWeight: 300, margin: 0, fontStyle: "italic" }}>{ABSTRACT}</p>
        </div>

        {/* At-a-glance stat strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: 48 }}>
          {[
            { val: "500",    label: "Trees",          sub: "n_estimators", color: "#FF2D78" },
            { val: "84.85%", label: "Cross-subject",  sub: "LOSO accuracy", color: "#8B5CF6" },
            { val: "<5 ms",  label: "Inference",      sub: "Per window", color: "#3B82F6" },
            { val: "64-dim", label: "Feature vector", sub: "4 features × 16 ch", color: "#10B981" },
          ].map(({ val, label, sub, color }, i) => (
            <div key={label} style={{ padding: "20px 16px", background: "var(--bg-secondary)", borderRight: i < 3 ? "1px solid var(--border)" : "none", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color, letterSpacing: "-0.5px", marginBottom: 4 }}>{val}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 300 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Classifier comparison */}
        <ClassifierChart />

        {/* Feature importance chart */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: 48 }}>
          <div style={{ padding: "14px 20px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Feature importance (Mean Decrease in Impurity)</span>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300 }}>Aggregated over 500 trees</span>
          </div>
          <div style={{ padding: "24px 24px 20px" }}>
            {/* Total by feature type */}
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Total MDI by feature type (all 16 channels)</div>
            <FeatureImportanceBars />

            <div style={{ height: 1, background: "var(--border)", margin: "24px 0" }} />

            {/* Top channels for MAV */}
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>MAV importance by electrode channel (top 8 of 16)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 6 }}>
              {[
                { ch: "Ch5",  pct: 4.2, note: "FDS belly" },
                { ch: "Ch6",  pct: 3.8, note: "FDS" },
                { ch: "Ch4",  pct: 3.5, note: "FDS" },
                { ch: "Ch7",  pct: 3.1, note: "FCU" },
                { ch: "Ch3",  pct: 2.8, note: "EDC" },
                { ch: "Ch8",  pct: 2.4, note: "FCR" },
                { ch: "Ch2",  pct: 2.1, note: "ECR" },
                { ch: "Ch1",  pct: 1.8, note: "ECRL" },
              ].map(({ ch, pct, note }) => (
                <div key={ch} style={{ textAlign: "center" }}>
                  <div style={{ height: 60, display: "flex", flexDirection: "column", justifyContent: "flex-end", marginBottom: 6 }}>
                    <div style={{ background: "#FF2D78", borderRadius: "3px 3px 0 0", width: "100%", height: `${(pct / 4.2) * 100}%`, minHeight: 4, transition: "height 0.6s ease" }} />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "var(--accent)" }}>{ch}</div>
                  <div style={{ fontSize: 9, color: "var(--text-tertiary)", fontWeight: 300, marginTop: 2 }}>{pct}%</div>
                  <div style={{ fontSize: 9, color: "var(--text-tertiary)", fontWeight: 300, marginTop: 1 }}>{note}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300, lineHeight: 1.6 }}>
              Ch5 (flexor digitorum superficialis belly) contributes the highest single-channel MAV importance at 4.2% of total MDI. FDS spans the index, middle, ring, and pinky fingers, making it the most informative muscle for multi-finger classification.
            </div>
          </div>
        </div>

        {/* Hyperparameter search results */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: 48 }}>
          <div style={{ padding: "14px 20px", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", textTransform: "uppercase", letterSpacing: "0.06em" }}>RandomizedSearchCV results (top 8 configs)</span>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300 }}>100 configurations · 5-fold CV</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                  {["Rank", "n_estimators", "max_depth", "max_features", "min_split", "CV accuracy"].map(h => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { rank:1,  n:500, depth:"None", feat:"sqrt", split:2,  acc:84.85, best:true },
                  { rank:2,  n:500, depth:30,     feat:"sqrt", split:2,  acc:84.71, best:false },
                  { rank:3,  n:200, depth:"None", feat:"sqrt", split:2,  acc:84.53, best:false },
                  { rank:4,  n:500, depth:"None", feat:0.3,    split:2,  acc:84.40, best:false },
                  { rank:5,  n:500, depth:20,     feat:"sqrt", split:5,  acc:83.92, best:false },
                  { rank:6,  n:200, depth:30,     feat:"sqrt", split:5,  acc:83.77, best:false },
                  { rank:7,  n:100, depth:"None", feat:"log2", split:2,  acc:83.55, best:false },
                  { rank:8,  n:500, depth:20,     feat:"log2", split:10, acc:82.88, best:false },
                ].map(({ rank, n, depth, feat, split, acc, best }) => (
                  <tr key={rank} style={{ borderBottom: "1px solid var(--border)", background: best ? "rgba(255,45,120,0.04)" : rank % 2 === 0 ? "var(--bg-secondary)" : "var(--bg)" }}>
                    <td style={{ padding: "9px 14px", fontSize: 12, fontWeight: best ? 700 : 400, color: best ? "var(--accent)" : "var(--text-secondary)" }}>#{rank}</td>
                    <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace" }}>{n}</td>
                    <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace" }}>{depth}</td>
                    <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace" }}>{feat}</td>
                    <td style={{ padding: "9px 14px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace" }}>{split}</td>
                    <td style={{ padding: "9px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden", maxWidth: 70 }}>
                          <div style={{ height: "100%", width: `${((acc - 80) / 6) * 100}%`, background: best ? "var(--accent)" : "#8B5CF6", borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: best ? 700 : 400, color: best ? "var(--accent)" : "var(--text-secondary)" }}>{acc}%</span>
                        {best && <span style={{ fontSize: 10, color: "var(--accent)", fontWeight: 600, background: "rgba(255,45,120,0.1)", border: "1px solid rgba(255,45,120,0.25)", borderRadius: 100, padding: "1px 7px" }}>selected</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 20px", fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300, lineHeight: 1.6, borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
            The winning configuration (500 trees, unlimited depth, sqrt features) was robust — the top 4 configs differ by less than 0.5pp, confirming Random Forest's low sensitivity to exact hyperparameter choice.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {SECTIONS.map((s, i) => (
            <div key={s.num} style={{ padding: "48px 0", borderBottom: i < SECTIONS.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: "var(--accent)", flexShrink: 0 }}>{s.num}</div>
                <span style={{ fontSize: 11, fontWeight: 500, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.tag}</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.4px", marginBottom: 16 }}>{s.title}</h2>
              <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.8, fontWeight: 300, marginBottom: s.callout ? 24 : 0 }}>{s.body}</p>
              {s.callout && (
                <div style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,45,120,0.3)", borderLeft: "3px solid var(--accent)", borderRadius: "0 var(--radius-sm) var(--radius-sm) 0", padding: "16px 20px" }}>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 400, margin: 0 }}>{s.callout}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 56, background: "var(--bg-secondary)", borderRadius: "var(--radius)", padding: "40px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Conclusion</div>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.8, fontWeight: 300, margin: 0 }}>
            Random Forest is not the most glamorous choice, but it's the right one for myojam's scale and constraints.
            It delivers competitive cross-subject accuracy without the data hunger of deep learning, trains in seconds,
            and runs inference in under 5ms. Understanding its limitations - no temporal modelling, no online adaptation  - 
            is equally important: they define exactly what future work needs to address.
          </p>
        </div>

        <ArticleBar
          url="https://myojam.com/education/random-forest-emg"
          title="Why Random Forest? The classifier behind myojam"
          citation={{ apa: `Wong, J. (2026, March 15). Why Random Forest? The classifier behind myojam. myojam. https://myojam.com/education/random-forest-emg` }}
          presetLikes={38}
          storageKey="like_rf_emg"
        />
        <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
          <button onClick={() => navigate("/education")} style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-mid)", borderRadius: 100, padding: "10px 24px", fontSize: 13, fontFamily: "var(--font)", fontWeight: 400, cursor: "pointer" }}>← Back to Education</button>
        </div>
      </div>
      <UpNext current="/education/random-forest-emg" />
      <Footer />
    </div>
  )
}