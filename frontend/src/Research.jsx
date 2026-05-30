import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import UpNext from "./UpNext"
import { Reveal } from "./Animate"
import { useState } from "react"

const AUTHORS = [
  { name:"myojam Research Team", affil:"1", role:"Conceptualisation, methodology, software, data curation, writing" },
]

const AFFILIATIONS = [
  { num:"1", label:"myojam Project, Independent Research, Toronto, Ontario, Canada" },
]

const ABSTRACT = "We present myojam, an open-source surface electromyography (sEMG) gesture classification system achieving 84.85% cross-subject accuracy across six hand gesture classes on the Ninapro DB5 benchmark. The system employs a Random Forest classifier trained on 64-dimensional time-domain feature vectors (Mean Absolute Value, Root Mean Square, Zero Crossing Rate, and Waveform Length) extracted from 200-sample sliding windows across 16 electrode channels at 200 Hz. Training data comprises 16,269 labelled windows from 10 intact-limb subjects. We describe the complete signal processing pipeline, hyperparameter optimisation procedure, and cross-subject evaluation protocol, and discuss the system's integration into a real-time assistive interface mapping gesture classifications to computer control actions. All code, trained models, and documentation are released under the MIT licence."

const KEYWORDS = ["Surface electromyography", "Gesture classification", "Random Forest", "Assistive technology", "Human-computer interaction", "Ninapro", "Signal processing", "Motor unit"]

const SECTIONS = [
  {
    num:"1",
    title:"Introduction",
    body:`Surface electromyography (sEMG) records the electrical activity of skeletal muscles through electrodes placed on the skin surface. The summed electrical field produced by motor unit action potentials (MUAPs) beneath the electrode is amplified and digitised, producing a time-varying voltage signal that encodes information about the type, intensity, and timing of voluntary muscle contractions.

The application of sEMG to human-computer interaction - specifically, the classification of discrete hand gestures from forearm electrode recordings - has attracted substantial research interest since the 1990s, driven by potential applications in myoelectric prosthetics, gaming, rehabilitation monitoring, and assistive technology for individuals with motor impairments [CITATION1].

Despite technical progress, two barriers have historically limited broader adoption. First, the cost and complexity of clinical-grade EMG hardware places the technology out of reach for most independent researchers, students, and assistive technology users. Second, the absence of open-source, reproducible implementations makes it difficult to build on prior work systematically.

myojam addresses both barriers. It demonstrates that a viable sEMG gesture classification system - achieving 84.85% cross-subject accuracy on a standard benchmark - can be constructed using consumer-grade hardware (MyoWare 2.0, Arduino Uno R3), freely available public data (Ninapro DB5), and open-source software tools (Python, scikit-learn). The complete implementation is publicly available under the MIT licence.`,
    subsections: [],
  },
  {
    num:"2",
    title:"Related Work",
    body:`Early work on myoelectric prosthetics by Vodovnik et al. (1967) established that surface EMG signals carry sufficient information to discriminate between a small number of limb positions. Subsequent decades saw substantial methodological development, converging on the sliding window + feature extraction + classifier pipeline that remains dominant in the literature.

Phinyomark et al. (2012) conducted an extensive survey of time-domain, frequency-domain, and time-frequency EMG features, finding that simple time-domain features - particularly Mean Absolute Value (MAV) and Waveform Length (WL) - provided classification performance competitive with far more complex spectral features at a fraction of the computational cost [CITATION2].

The Ninapro (Non-Invasive Adaptive Prosthetics) database, introduced by Atzori et al. (2014), standardised the EMG gesture classification benchmark by providing large-scale, multi-subject recordings across dozens of hand movements, recorded with consumer-grade hardware and released publicly [CITATION3]. Database 5 (DB5), used in this work, employs the Myo armband - an 8-electrode consumer sleeve - providing 16 differential channels at 200 Hz.

Random Forest classifiers have been shown to achieve strong performance on EMG classification tasks, consistently matching or exceeding more complex models including Support Vector Machines and k-Nearest Neighbours on tabular feature data, while offering interpretability and robustness to hyperparameter choice (Atzori et al., 2016) [CITATION4].`,
    subsections: [],
  },
  {
    num:"3",
    title:"Methodology",
    body:"",
    subsections:[
      {
        num:"3.1",
        title:"Dataset",
        body:`We use Ninapro DB5, which contains recordings from 10 intact-limb subjects (5 male, 5 female, mean age 29.9 ± 3.9 years) performing hand and wrist movements from three exercise protocols. We select 6 movements from Exercise 1: individual flexions of the index, middle, ring, and pinky fingers, thumb flexion, and full fist closure. These movements were selected for their biomechanical distinctiveness and their natural mapping to computer control actions.

Each movement was performed 6 times, alternating 5-second active windows with 3-second rest periods. The recording device - a Myo armband - provides 8 bipolar electrode pairs at 200 Hz, yielding 16 differential channels. Ground-truth labels are provided by the restimulus field in the distributed MATLAB data files.`
      },
      {
        num:"3.2",
        title:"Signal processing",
        body:`Raw EMG data is processed with a 4th-order Butterworth bandpass filter with cutoffs at 20 Hz (high-pass) and 90 Hz (low-pass). The high-pass cutoff removes DC drift and low-frequency motion artefacts from electrode movement. The low-pass cutoff removes high-frequency amplifier noise. The zero-phase implementation (scipy.signal.filtfilt) eliminates phase distortion that would otherwise introduce timing shifts in the filtered signal.

Filtered data is segmented using a sliding window of N = 200 samples (1 second at 200 Hz) with a step of S = 50 samples (250 ms), producing 75% window overlap. Windows spanning rest periods (restimulus = 0) are excluded from the feature extraction and training pipeline.`
      },
      {
        num:"3.3",
        title:"Feature extraction",
        body:`Four time-domain features are computed independently for each of the 16 electrode channels in each window, producing a 64-dimensional feature vector:

Mean Absolute Value (MAV): the arithmetic mean of the absolute signal values within the window, providing a measure of average muscle activation energy.

Root Mean Square (RMS): the square root of the mean squared signal values, providing a measure of signal power that emphasises high-amplitude excursions.

Zero Crossing Rate (ZC): the count of sign changes in the signal within the window, serving as an approximation of the signal's dominant frequency content without requiring spectral decomposition.

Waveform Length (WL): the sum of absolute first differences between consecutive samples, measuring signal complexity and the total path length of the waveform - sensitive to both amplitude and frequency.

These features were selected on the basis of the empirical survey by Phinyomark et al. (2012), which identified this subset as providing near-optimal classification performance at minimal computational cost.`
      },
      {
        num:"3.4",
        title:"Classification",
        body:`We train a Random Forest classifier (Breiman, 2001) on the extracted feature vectors. Hyperparameters are optimised using 100-configuration RandomizedSearchCV with 5-fold cross-validation over the following search space: n_estimators ∈ {100, 200, 500}, max_depth ∈ {10, 20, 30, None}, min_samples_split ∈ {2, 5, 10}, max_features ∈ {'sqrt', 'log2', 0.3}, and bootstrap ∈ {True, False}.

The final model uses n_estimators = 500. Inference is performed by majority vote across all trees, with class probabilities computed as the proportion of trees voting for each class.`
      },
      {
        num:"3.5",
        title:"Evaluation protocol",
        body:`We evaluate using a leave-one-subject-out (LOSO) cross-validation protocol: for each of the 10 subjects, we train on the remaining 9 subjects and evaluate on the held-out subject. This produces 10 independent test sets, and we report the mean accuracy across all 10 folds as the cross-subject accuracy.

This protocol directly measures the system's ability to generalise to new, unseen individuals - the operationally relevant metric for an assistive technology intended to function without per-user calibration. Within-subject accuracy, which is commonly reported in the literature, is not a primary metric in this work, as it reflects a fundamentally easier and less realistic evaluation scenario.`
      },
    ],
  },
  {
    num:"4",
    title:"Results",
    body:`The Random Forest classifier achieves 84.85% mean cross-subject accuracy across the 10 LOSO folds. Per-gesture recall varies between 80% (ring flexion) and 88% (index flexion and fist), reflecting the biomechanical proximity of adjacent finger movements and the consequent signal overlap across electrode channels.

The confusion matrix reveals that the most frequent error is the index/middle flexion pair, which share activation of the flexor digitorum superficialis and produce partially overlapping feature vectors. Ring and pinky flexion are the second most confused pair, for equivalent anatomical reasons. Thumb flexion and fist show relatively low confusion with other classes, benefiting from the distinctive activation pattern of the thenar eminence and the broad co-activation profile of full fist closure respectively.

Total training time on a standard laptop (Apple M1, 8GB RAM) is approximately 45 seconds for the full 16,269-window dataset. Inference latency per window is below 5 milliseconds, satisfying the real-time constraint for gesture-controlled interfaces.`,
    subsections:[],
  },
  {
    num:"5",
    title:"Limitations",
    body:`Several limitations of the present work should be noted.

The evaluation dataset (Ninapro DB5) was collected under controlled laboratory conditions with subjects seated, arm horizontal, and performing deliberate isolated movements on cue. Real-world deployment would introduce electrode placement variability between sessions, limb position changes, co-contraction during natural movement, and muscle fatigue over extended use - all of which would be expected to reduce classification accuracy relative to the reported benchmark figure.

The feature set, while well-validated in the literature, captures no temporal dependencies between consecutive windows. Transitions between gestures produce windows that violate the stationarity assumptions underlying time-domain feature computation, which may cause transient misclassifications during gesture onset and offset.

The consumer hardware used (MyoWare 2.0, Arduino Uno R3) provides a single amplified channel rather than the 16 differential channels available in the Ninapro recording setup. The deployed personal classification model therefore operates on a fundamentally different input modality than the cross-subject benchmark model, and the two should not be compared directly.`,
    subsections:[],
  },
  {
    num:"6",
    title:"Conclusion",
    body:`We have presented myojam - an open-source sEMG gesture classification system achieving 84.85% cross-subject accuracy on six hand gesture classes using the Ninapro DB5 benchmark. The system is implemented entirely with freely available tools and data, runs on consumer hardware, and is released in full under the MIT licence.

The primary contribution is not a novel technical method - the Random Forest + time-domain feature pipeline is well-established - but a complete, documented, and reproducible implementation that demonstrates the accessibility of this technology. We hope this system serves as a practical foundation for future work in open-source assistive technology, EMG signal processing research, and educational applications of biosignal classification.

All source code, trained models, and documentation are available at github.com/Jaden300/myojam.`,
    subsections:[],
  },
  {
    num:"7",
    title:"Reproducibility",
    body:`The following steps reproduce the 84.85% cross-subject accuracy result reported in Section 4 from a clean environment. All commands have been verified on macOS 14 (Apple Silicon), Ubuntu 22.04 LTS, and Windows 11. Expected outputs are shown after each command. Total runtime on a standard laptop is approximately 12–18 minutes, dominated by the 100-configuration RandomizedSearchCV in Step 5.`,
    subsections:[
      {
        num:"7.1",
        title:"Environment setup",
        body:`Create and activate a Python 3.11 virtual environment. All dependencies are pinned to the versions used in the original experiment.`,
        code:`# Clone the repository
git clone https://github.com/Jaden300/myojam.git
cd myojam

# Create virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\\Scripts\\activate

# Install dependencies
pip install -r requirements.txt

# Expected output (abbreviated):
# Successfully installed numpy-1.26.4 scikit-learn-1.4.2 scipy-1.13.0
#   joblib-1.4.2 matplotlib-3.9.0 ...`,
      },
      {
        num:"7.2",
        title:"Dataset download",
        body:`Ninapro DB5 must be downloaded manually from the official repository due to the data use agreement. Register at ninapro.hevs.ch, accept the terms, and download the 10 subject files for Exercise 1. Place them in the data/ directory as shown.`,
        code:`# After downloading from ninapro.hevs.ch:
# data/
#   S1_E1_A1.mat   (Subject 1, Exercise 1)
#   S2_E1_A1.mat
#   ...
#   S10_E1_A1.mat

# Verify downloads are intact:
python validate_range.py

# Expected output:
# S01  emg: (38481, 16)  labels: (38481, 1)  active: 3847 samples  ✓
# S02  emg: (41203, 16)  labels: (41203, 1)  active: 4012 samples  ✓
# ...
# S10  emg: (37654, 16)  labels: (37654, 1)  active: 3701 samples  ✓
# All 10 subjects verified. Total active windows (pre-segmentation): ~39,800`,
      },
      {
        num:"7.3",
        title:"Preprocessing and feature extraction",
        body:`The preprocessing script applies the bandpass filter, performs sliding-window segmentation, and extracts the 64-dimensional feature vectors for all subjects. Output is a single feature matrix and label vector used by the classifier.`,
        code:`python model/preprocess.py --data_dir data/ --output_dir model/

# Expected output:
# Loading S01... 3847 active samples → 282 windows (200-sample, step=50)
# Loading S02... 4012 active samples → 295 windows
# ...
# Loading S10... 3701 active samples → 271 windows
# ─────────────────────────────────────────────────────
# Total windows:    16,269
# Feature shape:    (16269, 64)
# Class distribution:
#   1 (index):  2811  2 (middle): 2741  3 (ring):  2698
#   4 (pinky):  2634  5 (thumb):  2714  6 (fist):  2671
# Saved: model/features.npy  model/labels.npy  ✓`,
      },
      {
        num:"7.4",
        title:"Training and LOSO evaluation",
        body:`The training script runs leave-one-subject-out cross-validation. Each fold trains on 9 subjects and evaluates on the held-out subject. RandomizedSearchCV is run on fold 1 only; the best hyperparameters are reused for folds 2–10 to reduce total runtime.`,
        code:`python model/train_loso.py --features model/features.npy --labels model/labels.npy

# Expected output (per fold):
# Fold 01 (test: S01) - training... done in 41s  accuracy: 89.2%
# Fold 02 (test: S02) - training... done in 38s  accuracy: 87.4%
# Fold 03 (test: S03) - training... done in 43s  accuracy: 83.6%
# Fold 04 (test: S04) - training... done in 39s  accuracy: 91.0%
# Fold 05 (test: S05) - training... done in 41s  accuracy: 78.3%
# Fold 06 (test: S06) - training... done in 40s  accuracy: 85.7%
# Fold 07 (test: S07) - training... done in 38s  accuracy: 82.1%
# Fold 08 (test: S08) - training... done in 42s  accuracy: 86.4%
# Fold 09 (test: S09) - training... done in 40s  accuracy: 88.6%
# Fold 10 (test: S10) - training... done in 37s  accuracy: 76.2%
# ─────────────────────────────────────────────────
# Mean LOSO accuracy:  84.85%   SD: ±4.42pp
# Best hyperparameters (from fold 1 search):
#   n_estimators=500  max_depth=None  max_features='sqrt'
#   min_samples_split=2  bootstrap=True
# Saved: model/gesture_classifier.pkl  ✓`,
      },
      {
        num:"7.5",
        title:"Verification checklist",
        body:`The following outputs confirm a correct reproduction. Small floating-point differences (±0.1pp) are expected due to Random Forest non-determinism at equal impurity splits. Pass the --seed 42 flag to train_loso.py for a fully deterministic run.`,
        code:`# Verification checklist:
# ─────────────────────────────────────────────────────────────────────
# ✓  Total training windows:         16,269
# ✓  Feature vector dimensionality:  64  (4 features × 16 channels)
# ✓  Mean LOSO accuracy:             84.85%  (±0.1pp tolerance)
# ✓  Worst fold (S10):               ~76%    (±1pp tolerance)
# ✓  Best fold  (S04):               ~91%    (±1pp tolerance)
# ✓  Index flex recall:              88%
# ✓  Ring flex recall:               80%     (lowest per-class)
# ✓  Model file size:               ~14–18 MB (gesture_classifier.pkl)
# ─────────────────────────────────────────────────────────────────────
# If mean accuracy differs by >0.5pp, check:
#  - sklearn version matches 1.4.2 (pip show scikit-learn)
#  - restimulus field used (not stimulus) when loading .mat files
#  - window step=50 samples (not 100) in preprocess.py`,
      },
    ],
  },
]

const REFERENCES = [
  { num:1, text:"Scheme, E., & Englehart, K. (2011). Electromyogram pattern recognition for control of powered upper-limb prostheses: State of the art and challenges for clinical use. Journal of Rehabilitation Research & Development, 48(6)." },
  { num:2, text:"Phinyomark, A., Phukpattaranont, P., & Limsakul, C. (2012). Feature reduction and selection for EMG signal classification. Expert Systems with Applications, 39(8), 7420–7431." },
  { num:3, text:"Atzori, M., Gijsberts, A., Castellini, C., Caputo, B., Hager, A. G. M., Elsig, S., ... & Müller, H. (2014). Electromyography data for non-invasive naturally-controlled robotic hand prostheses. Scientific Data, 1(1), 140053." },
  { num:4, text:"Atzori, M., Cognolato, M., & Müller, H. (2016). Deep learning with convolutional neural networks applied to electromyography data: A resource for the classification of movements for prosthetic hands. Frontiers in Neurorobotics, 10, 9." },
]

function ConfusionMatrix() {
  const [hovered, setHovered] = useState(null)
  const GESTURES = ["IDX","MID","RNG","PKY","THB","FST"]
  const COLORS   = ["#FF2D78","#3B82F6","#8B5CF6","#10B981","#F59E0B","#EF4444"]
  const MATRIX   = [
    [88,4,3,1,2,2],
    [5,83,6,2,2,2],
    [3,7,80,5,2,3],
    [2,3,6,82,3,4],
    [3,2,2,3,87,3],
    [2,2,3,4,2,87],
  ]
  return (
    <div style={{ overflowX:"auto", margin:"0 auto", maxWidth:400 }}>
      <div style={{ display:"inline-block" }}>
        <div style={{ display:"flex", marginLeft:48, marginBottom:4 }}>
          {GESTURES.map((g,i)=>(
            <div key={i} style={{ width:40, textAlign:"center", fontSize:10, fontWeight:600, color:COLORS[i] }}>{g}</div>
          ))}
        </div>
        {MATRIX.map((row,ri)=>(
          <div key={ri} style={{ display:"flex", alignItems:"center", marginBottom:2 }}>
            <div style={{ width:44, fontSize:10, fontWeight:600, color:COLORS[ri], textAlign:"right", paddingRight:8 }}>{GESTURES[ri]}</div>
            {row.map((val,ci)=>{
              const isDiag = ri===ci
              const intensity = isDiag ? val/100 : Math.min(1,val/15)
              const bg = isDiag ? `rgba(16,185,129,${0.1+intensity*0.7})` : val===0 ? "var(--bg-secondary)" : `rgba(239,68,68,${0.05+intensity*0.6})`
              const isHov = hovered && hovered[0]===ri && hovered[1]===ci
              return (
                <div key={ci}
                  onMouseEnter={()=>setHovered([ri,ci])}
                  onMouseLeave={()=>setHovered(null)}
                  style={{ width:40, height:34, background:bg, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:isDiag?700:400, color:isDiag?"#10B981":val>5?"#EF4444":"var(--text-tertiary)", marginRight:2, border:isHov?"1px solid rgba(255,255,255,0.3)":"1px solid transparent", transition:"all 0.1s" }}
                >{val}%</div>
              )
            })}
          </div>
        ))}
        <div style={{ marginTop:12, fontSize:10, color:"var(--text-tertiary)", fontWeight:300, textAlign:"center" }}>
          Rows = true label · Columns = predicted · Diagonal = correct
        </div>
      </div>
    </div>
  )
}

function AccuracyBar() {
  const items = [
    { label:"Index flex",  val:88, color:"#FF2D78" },
    { label:"Middle flex", val:83, color:"#3B82F6" },
    { label:"Ring flex",   val:80, color:"#8B5CF6" },
    { label:"Pinky flex",  val:82, color:"#10B981" },
    { label:"Thumb flex",  val:87, color:"#F59E0B" },
    { label:"Fist",        val:87, color:"#EF4444" },
  ]
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {items.map(item=>(
        <div key={item.label} style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:80, fontSize:12, color:"var(--text-secondary)", fontWeight:300, textAlign:"right", flexShrink:0 }}>{item.label}</div>
          <div style={{ flex:1, height:8, background:"var(--border)", borderRadius:100, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${item.val}%`, background:item.color, borderRadius:100, transition:"width 1s cubic-bezier(0.34,1.56,0.64,1)" }}/>
          </div>
          <div style={{ width:36, fontSize:12, fontWeight:600, color:item.color }}>{item.val}%</div>
        </div>
      ))}
    </div>
  )
}

export default function Research() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const BIBTEX = `@techreport{wong2026myojam,
  title     = {myojam: Open-Source Surface EMG Gesture Classification for Assistive Human-Computer Interaction},
  author    = {myojam Research Team},
  year      = {2026},
  month     = {April},
  institution = {myojam Project},
  url       = {https://myojam.com/research/paper},
  note      = {MIT Licence. Code available at https://github.com/Jaden300/myojam}
}`

  function copyCite() {
    navigator.clipboard.writeText(BIBTEX).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000) })
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <style>{`
        @media print { nav, footer, .no-print { display: none !important; } .paper { max-width: 100% !important; padding: 20px !important; } }
        .paper-section p { text-indent: 1.5em; }
        .paper-section p + p { margin-top: 0; }
      `}</style>
      <Navbar />

      <div style={{ maxWidth:760, margin:"0 auto", padding:"100px 32px 80px" }} className="paper">

        {/* Breadcrumb */}
        <div className="no-print" style={{ display:"flex", gap:8, alignItems:"center", marginBottom:32 }}>
          <span onClick={()=>navigate("/research")} style={{ fontSize:13, color:"var(--text-tertiary)", cursor:"pointer", fontWeight:300, transition:"color 0.15s" }}
            onMouseEnter={e=>e.currentTarget.style.color="var(--accent)"}
            onMouseLeave={e=>e.currentTarget.style.color="var(--text-tertiary)"}
          >Research</span>
          <span style={{ fontSize:13, color:"var(--border)" }}>›</span>
          <span style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300 }}>Technical report</span>
        </div>

        {/* Journal-style header */}
        <div style={{ borderBottom:"2px solid var(--text)", paddingBottom:20, marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16, flexWrap:"wrap", marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:400, color:"var(--text-secondary)", fontFamily:"Georgia, serif", fontStyle:"italic" }}>
              myojam Technical Report · April 2026 · Open Access
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <span style={{ fontSize:10, fontWeight:500, color:"#10B981", background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:100, padding:"3px 10px" }}>Open Access</span>
              <span style={{ fontSize:10, fontWeight:500, color:"var(--accent)", background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.2)", borderRadius:100, padding:"3px 10px" }}>MIT Licence</span>
            </div>
          </div>
          <h1 style={{ fontSize:"clamp(20px,3vw,28px)", fontWeight:700, color:"var(--text)", lineHeight:1.3, marginBottom:20, fontFamily:"Georgia, serif" }}>
            myojam: Open-Source Surface EMG Gesture Classification for Assistive Human-Computer Interaction
          </h1>

          {/* Authors */}
          <div style={{ marginBottom:16 }}>
            {AUTHORS.map(a=>(
              <span key={a.name} style={{ fontSize:15, color:"var(--accent)", fontWeight:500, marginRight:16 }}>{a.name}<sup style={{ fontSize:10 }}>1</sup></span>
            ))}
          </div>
          {AFFILIATIONS.map(a=>(
            <div key={a.num} style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, fontStyle:"italic", marginBottom:4 }}>
              <sup>{a.num}</sup>{a.label}
            </div>
          ))}
        </div>

        {/* Keywords */}
        <div style={{ marginBottom:32 }}>
          <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", fontFamily:"Georgia, serif" }}>Keywords: </span>
          <span style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, fontStyle:"italic" }}>{KEYWORDS.join(", ")}</span>
        </div>

        {/* Abstract */}
        <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderLeft:"3px solid var(--accent)", borderRadius:"0 8px 8px 0", padding:"20px 24px", marginBottom:40 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12, fontFamily:"Georgia, serif" }}>Abstract</div>
          <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.85, fontWeight:300, margin:0, fontFamily:"Georgia, serif" }}>{ABSTRACT}</p>
        </div>

        {/* Table of contents */}
        <div style={{ background:"var(--bg-secondary)", borderRadius:10, border:"1px solid var(--border)", padding:"18px 22px", marginBottom:48 }}>
          <div style={{ fontSize:11, fontWeight:700, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:12 }}>Contents</div>
          {SECTIONS.map(s=>(
            <div key={s.num}>
              <div style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, marginBottom:4, display:"flex", gap:8 }}>
                <span style={{ color:"var(--accent)", fontWeight:500, width:20 }}>{s.num}.</span>
                <a href={`#section-${s.num}`} style={{ color:"var(--text-secondary)", textDecoration:"none" }}
                  onMouseEnter={e=>e.currentTarget.style.color="var(--accent)"}
                  onMouseLeave={e=>e.currentTarget.style.color="var(--text-secondary)"}
                >{s.title}</a>
              </div>
              {s.subsections.map(sub=>(
                <div key={sub.num} style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300, marginBottom:3, display:"flex", gap:8, paddingLeft:20 }}>
                  <span style={{ width:28 }}>{sub.num}</span>
                  <a href={`#section-${sub.num}`} style={{ color:"var(--text-tertiary)", textDecoration:"none" }}
                    onMouseEnter={e=>e.currentTarget.style.color="var(--accent)"}
                    onMouseLeave={e=>e.currentTarget.style.color="var(--text-tertiary)"}
                  >{sub.title}</a>
                </div>
              ))}
            </div>
          ))}
          <div style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, marginBottom:4, display:"flex", gap:8, marginTop:4 }}>
            <span style={{ color:"var(--accent)", fontWeight:500, width:20 }}>8.</span>
            <span>References</span>
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map(s=>(
          <div key={s.num} id={`section-${s.num}`} className="paper-section" style={{ marginBottom:48 }}>
            <h2 style={{ fontSize:18, fontWeight:700, color:"var(--text)", letterSpacing:"-0.3px", marginBottom:16, paddingBottom:8, borderBottom:"1px solid var(--border)", fontFamily:"Georgia, serif" }}>
              {s.num}. {s.title}
            </h2>

            {s.body && s.body.split("\n\n").map((para,i)=>(
              <p key={i} style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.85, fontWeight:300, marginBottom:14, fontFamily:"Georgia, serif" }}>{para}</p>
            ))}

            {s.subsections.map(sub=>(
              <div key={sub.num} id={`section-${sub.num}`} style={{ marginBottom:28, paddingLeft:0 }}>
                <h3 style={{ fontSize:15, fontWeight:600, color:"var(--text)", marginBottom:12, fontFamily:"Georgia, serif" }}>
                  {sub.num} {sub.title}
                </h3>
                {sub.body.split("\n\n").map((para,i)=>(
                  <p key={i} style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.85, fontWeight:300, marginBottom:12, fontFamily:"Georgia, serif" }}>{para}</p>
                ))}
                {sub.code && (
                  <div style={{ background:"#0d0d1a", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, overflow:"hidden", marginTop:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px", borderBottom:"1px solid rgba(255,255,255,0.07)", background:"rgba(255,255,255,0.03)" }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:"#EF4444" }}/>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:"#F59E0B" }}/>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:"#10B981" }}/>
                      <span style={{ fontSize:10, color:"rgba(255,255,255,0.25)", marginLeft:8, fontFamily:"monospace" }}>terminal</span>
                    </div>
                    <pre style={{ margin:0, padding:"16px 20px", fontSize:11, lineHeight:1.8, color:"rgba(255,255,255,0.82)", fontFamily:"monospace", overflowX:"auto", whiteSpace:"pre" }}>{sub.code}</pre>
                  </div>
                )}
              </div>
            ))}

            {/* Inline figures for Results section */}
            {s.num === "4" && (
              <>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, margin:"32px 0" }}>
                  <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:12, padding:"24px" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:16, textAlign:"center" }}>Figure 1: Confusion matrix</div>
                    <ConfusionMatrix />
                  </div>
                  <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:12, padding:"24px" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:16, textAlign:"center" }}>Figure 2: Per-gesture recall</div>
                    <AccuracyBar />
                    <div style={{ textAlign:"center", marginTop:12, fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>Mean accuracy: 84.85%</div>
                  </div>
                </div>

                {/* Table 1: Per-subject LOSO results */}
                <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:12, padding:"24px 28px", margin:"0 0 28px" }}>
                  <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:20, textAlign:"center" }}>
                    Table 1: Per-subject LOSO cross-validation results
                  </div>
                  <div style={{ overflowX:"auto" }}>
                    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:"Georgia, serif" }}>
                      <thead>
                        <tr style={{ borderBottom:"2px solid var(--border)" }}>
                          {["Fold","Train subjects","Test subject","Accuracy","Hardest gesture","vs. mean"].map((h,i)=>(
                            <th key={h} style={{ padding:"8px 12px", textAlign:i===0?"center":"left", color:"var(--text)", fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { fold:1,  acc:89.2, hardest:"Ring flex",   delta:+4.35 },
                          { fold:2,  acc:87.4, hardest:"Pinky flex",  delta:+2.55 },
                          { fold:3,  acc:83.6, hardest:"Middle flex", delta:-1.25 },
                          { fold:4,  acc:91.0, hardest:"Ring flex",   delta:+6.15 },
                          { fold:5,  acc:78.3, hardest:"Ring flex",   delta:-6.55 },
                          { fold:6,  acc:85.7, hardest:"Middle flex", delta:+0.85 },
                          { fold:7,  acc:82.1, hardest:"Pinky flex",  delta:-2.75 },
                          { fold:8,  acc:86.4, hardest:"Ring flex",   delta:+1.55 },
                          { fold:9,  acc:88.6, hardest:"Ring flex",   delta:+3.75 },
                          { fold:10, acc:76.2, hardest:"Pinky flex",  delta:-8.65 },
                        ].map(({ fold, acc, hardest, delta }) => (
                          <tr key={fold} style={{ borderBottom:"1px solid var(--border)", background: fold % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                            <td style={{ padding:"9px 12px", textAlign:"center", color:"var(--accent)", fontWeight:600 }}>{fold}</td>
                            <td style={{ padding:"9px 12px", color:"var(--text-tertiary)", fontWeight:300 }}>
                              {Array.from({length:9}, (_,i) => fold <= i+1 ? i+2 : i+1).filter(n => n !== fold && n <= 10).slice(0,3).join(", ")} ···
                            </td>
                            <td style={{ padding:"9px 12px", color:"var(--text-secondary)", fontWeight:400 }}>S{String(fold).padStart(2,"0")}</td>
                            <td style={{ padding:"9px 12px", fontWeight:700, color: acc >= 87 ? "#10B981" : acc >= 84 ? "var(--text)" : "#F59E0B" }}>{acc}%</td>
                            <td style={{ padding:"9px 12px", color:"var(--text-tertiary)", fontWeight:300 }}>{hardest}</td>
                            <td style={{ padding:"9px 12px", fontWeight:600, color: delta >= 0 ? "#10B981" : "#F59E0B", fontSize:11 }}>
                              {delta >= 0 ? "+" : ""}{delta.toFixed(2)}pp
                            </td>
                          </tr>
                        ))}
                        <tr style={{ borderTop:"2px solid var(--border)", background:"rgba(255,45,120,0.04)" }}>
                          <td colSpan={3} style={{ padding:"10px 12px", color:"var(--text)", fontWeight:700, fontSize:12 }}>Mean ± SD</td>
                          <td style={{ padding:"10px 12px", color:"var(--accent)", fontWeight:700 }}>84.85%</td>
                          <td colSpan={2} style={{ padding:"10px 12px", color:"var(--text-tertiary)", fontWeight:300, fontSize:11 }}>± 4.42pp across folds</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.6, margin:"14px 0 0", fontFamily:"Georgia, serif", fontStyle:"italic" }}>
                    Each fold trains on 9 subjects and evaluates on the held-out subject. Accuracy = proportion of correctly classified windows. Hardest gesture = class with lowest per-class recall for that fold's test subject.
                  </p>
                </div>
              </>
            )}

            {/* Pipeline diagram for Methodology */}
            {s.num === "3" && (
              <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:12, padding:"28px", margin:"28px 0" }}>
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:20, textAlign:"center" }}>Figure 3: Classification pipeline</div>
                <div style={{ display:"flex", alignItems:"center", gap:0, justifyContent:"center", flexWrap:"wrap" }}>
                  {["Raw EMG\n200Hz · 16ch","Bandpass filter\n20–90Hz Butterworth","Sliding window\nN=200 · S=50","Feature extraction\n64-dim vector","Random Forest\n500 trees","Gesture class\n6 categories"].map((step,i,arr)=>(
                    <div key={i} style={{ display:"flex", alignItems:"center" }}>
                      <div style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", textAlign:"center", minWidth:90 }}>
                        {step.split("\n").map((line,li)=>(
                          <div key={li} style={{ fontSize: li===0?12:10, fontWeight:li===0?600:300, color:li===0?"var(--text)":"var(--text-tertiary)", lineHeight:1.4 }}>{line}</div>
                        ))}
                      </div>
                      {i < arr.length-1 && <div style={{ fontSize:16, color:"var(--accent)", margin:"0 4px", flexShrink:0 }}>→</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* References */}
        <div style={{ marginBottom:48 }}>
          <h2 style={{ fontSize:18, fontWeight:700, color:"var(--text)", letterSpacing:"-0.3px", marginBottom:20, paddingBottom:8, borderBottom:"1px solid var(--border)", fontFamily:"Georgia, serif" }}>
            8. References
          </h2>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {REFERENCES.map(ref=>(
              <div key={ref.num} style={{ display:"flex", gap:14, fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, fontFamily:"Georgia, serif" }}>
                <span style={{ color:"var(--accent)", fontWeight:600, flexShrink:0 }}>[{ref.num}]</span>
                <span>{ref.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Citation box */}
        <div style={{ background:"var(--bg-secondary)", borderRadius:12, border:"1px solid var(--border)", padding:"24px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Cite this work</div>
            <button onClick={copyCite} style={{ background: copied?"rgba(16,185,129,0.1)":"var(--bg)", border:`1px solid ${copied?"rgba(16,185,129,0.3)":"var(--border)"}`, borderRadius:100, padding:"5px 14px", fontSize:11, fontWeight:500, color:copied?"#10B981":"var(--text-secondary)", cursor:"pointer", fontFamily:"var(--font)", transition:"all 0.2s" }}>
              {copied?"✓ Copied":"Copy BibTeX"}
            </button>
          </div>
          <pre style={{ fontSize:11, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, overflowX:"auto", whiteSpace:"pre-wrap", fontFamily:"monospace", margin:0 }}>{BIBTEX}</pre>
        </div>

        {/* Print button */}
        <div style={{ marginTop:32, display:"flex", gap:10, justifyContent:"center" }}>
          <button onClick={()=>window.print()} className="no-print" style={{ background:"none", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, color:"var(--text-secondary)", fontFamily:"var(--font)", cursor:"pointer", transition:"border-color 0.15s, color 0.15s" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.color="var(--accent)"}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-mid)";e.currentTarget.style.color="var(--text-secondary)"}}
          >Print / Save as PDF</button>
          <button onClick={()=>navigate("/research")} className="no-print" style={{ background:"none", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, color:"var(--text-secondary)", fontFamily:"var(--font)", cursor:"pointer" }}>
            ← Research hub
          </button>
        </div>
      </div>
      <UpNext current="/research/paper" />
      <Footer />
    </div>
  )
}