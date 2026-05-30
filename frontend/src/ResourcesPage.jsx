import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"
import NeuralNoise from "./components/NeuralNoise"

const SECTIONS = [
  {
    id: "datasets",
    label: "Datasets",
    color: "#10B981",
    desc: "Publicly available EMG datasets used in research.",
    items: [
      {
        title: "Ninapro DB5",
        source: "Atzori et al. / University of Geneva",
        year: "2014–ongoing",
        href: "http://ninapro.hevs.ch/",
        desc: "The primary benchmark used by myojam. 10 intact-limb subjects, 16 differential EMG channels at 200 Hz, 53 hand movement classes across three exercise protocols. Publicly available under academic use terms.",
        tags: ["EMG", "Gesture", "Benchmark"],
      },
      {
        title: "Ninapro DB1–DB10",
        source: "Ninapro project",
        year: "2012–2022",
        href: "http://ninapro.hevs.ch/",
        desc: "The full Ninapro collection spans 10 database versions with varying subjects, hardware, and movement sets. DB1 uses the CyberGlove as ground truth; DB8–DB10 include force measurements and amputee subjects.",
        tags: ["EMG", "Multi-database", "Prosthetics"],
      },
      {
        title: "PhysioNet EEGMMIDB",
        source: "Goldberger et al. / PhysioNet",
        year: "2009",
        href: "https://physionet.org/content/eegmmidb/1.0.0/",
        desc: "EEG and motor movement dataset from 109 subjects. While primarily an EEG dataset, it includes motor execution and imagination tasks - useful for cross-modal BCI research.",
        tags: ["EEG", "Motor imagery", "BCI"],
      },
      {
        title: "UCI EMG for Gestures",
        source: "Lobov et al. / UCI ML Repository",
        year: "2018",
        href: "https://archive.ics.uci.edu/ml/datasets/EMG+data+for+gestures",
        desc: "30 subjects, 2-channel forearm EMG at 1000 Hz, 8 gesture classes. Smaller and more accessible than Ninapro - good for introductory experiments.",
        tags: ["EMG", "2-channel", "Introductory"],
      },
    ],
  },
  {
    id: "papers",
    label: "Foundational papers",
    color: "#3B82F6",
    desc: "Seminal work that underpins the myojam methodology.",
    items: [
      {
        title: "Feature reduction and selection for EMG signal classification",
        source: "Phinyomark, Phukpattaranont & Limsakul",
        year: "2012",
        href: "https://www.sciencedirect.com/science/article/pii/S0957417412002382",
        desc: "The paper that established the case for time-domain features (MAV, RMS, ZC, WL) as near-optimal for EMG gesture classification. Direct basis for myojam's feature extraction design.",
        tags: ["Feature extraction", "Time-domain", "Classification"],
      },
      {
        title: "Electromyography data for non-invasive naturally-controlled robotic hand prostheses",
        source: "Atzori et al.",
        year: "2014",
        href: "https://www.nature.com/articles/sdata201453",
        desc: "Introduces the Ninapro database. Describes the dataset collection protocol, recording hardware, and baseline classification results that myojam builds on. Published in Scientific Data (Nature).",
        tags: ["Ninapro", "Dataset", "Prosthetics"],
      },
      {
        title: "Electromyogram pattern recognition for control of powered upper-limb prostheses",
        source: "Scheme & Englehart",
        year: "2011",
        href: "https://www.jrheum.org/content/48/6/643",
        desc: "Comprehensive state-of-the-art review of EMG pattern recognition for prosthetic control. Covers feature extraction, classifiers, real-time implementation, and clinical barriers - essential background reading.",
        tags: ["Review", "Prosthetics", "Pattern recognition"],
      },
      {
        title: "A novel approach to on-line movement classification of upper limb amputees",
        source: "Hudgins, Parker & Scott",
        year: "1993",
        href: "https://ieeexplore.ieee.org/document/246949",
        desc: "The foundational paper for modern EMG gesture classification. Introduced the sliding window + time-domain feature + classifier pipeline that is still the dominant approach 30 years later.",
        tags: ["Classic", "Sliding window", "Pipeline"],
      },
      {
        title: "Deep learning with CNNs applied to electromyography data",
        source: "Atzori, Cognolato & Müller",
        year: "2016",
        href: "https://www.frontiersin.org/articles/10.3389/fnbot.2016.00009/full",
        desc: "Applies CNNs to the Ninapro dataset and compares against traditional classifiers including Random Forest. Shows that deep learning does not consistently outperform well-tuned traditional methods on small EMG datasets.",
        tags: ["Deep learning", "CNN", "Comparison"],
      },
      {
        title: "The use of surface electromyography in biomechanics",
        source: "De Luca",
        year: "1997",
        href: "https://www.sciencedirect.com/science/article/pii/S0021929097000220",
        desc: "Comprehensive overview of surface EMG signal characteristics, sources of noise, electrode placement principles, and physiological interpretation. A foundational reference for understanding what the signal actually means.",
        tags: ["Physiology", "Signal theory", "Biomechanics"],
      },
    ],
  },
  {
    id: "software",
    label: "Software & libraries",
    color: "#8B5CF6",
    desc: "Open-source tools for EMG signal processing and machine learning.",
    items: [
      {
        title: "scikit-learn",
        source: "Pedregosa et al. / scikit-learn.org",
        year: "2011–ongoing",
        href: "https://scikit-learn.org/",
        desc: "The machine learning library underlying myojam's Random Forest classifier. Provides RandomForestClassifier, RandomizedSearchCV, and cross-validation utilities. Excellent documentation and tutorials.",
        tags: ["Python", "Machine learning", "Random Forest"],
      },
      {
        title: "MNE-Python",
        source: "Gramfort et al. / mne.tools",
        year: "2013–ongoing",
        href: "https://mne.tools/",
        desc: "Comprehensive library for processing EEG, MEG, and other biosignals in Python. Includes filtering, epoching, visualisation, and source estimation. More powerful than scipy for complex biosignal pipelines.",
        tags: ["Python", "Biosignals", "EEG/MEG"],
      },
      {
        title: "BioSPPy",
        source: "biosppy.readthedocs.io",
        year: "2015–ongoing",
        href: "https://biosppy.readthedocs.io/",
        desc: "Biosignal processing library for Python with modules for ECG, EMG, EEG, and respiration. Provides ready-made EMG segmentation and feature extraction routines that complement myojam's custom pipeline.",
        tags: ["Python", "EMG", "Biosignals"],
      },
      {
        title: "SciPy signal processing",
        source: "SciPy community / scipy.org",
        year: "2001–ongoing",
        href: "https://docs.scipy.org/doc/scipy/reference/signal.html",
        desc: "Used in myojam for Butterworth filter design and zero-phase filtering (filtfilt). The scipy.signal module is the standard for digital filter implementation in Python.",
        tags: ["Python", "Filtering", "DSP"],
      },
      {
        title: "NumPy",
        source: "Harris et al. / numpy.org",
        year: "2006–ongoing",
        href: "https://numpy.org/",
        desc: "The foundation of myojam's numerical pipeline. Feature extraction (MAV, RMS, ZC, WL) is implemented as vectorised NumPy operations for performance across 16 channels simultaneously.",
        tags: ["Python", "Arrays", "Numerical computing"],
      },
    ],
  },
  {
    id: "courses",
    label: "Courses & tutorials",
    color: "#F59E0B",
    desc: "Structured learning resources for the underlying science.",
    items: [
      {
        title: "Machine Learning Specialization",
        source: "Andrew Ng / Coursera",
        year: "Ongoing",
        href: "https://www.coursera.org/specializations/machine-learning-introduction",
        desc: "The best starting point for understanding supervised classification, decision trees, and ensemble methods. Directly relevant to understanding how myojam's Random Forest classifier works.",
        tags: ["Coursera", "ML fundamentals", "Beginner–intermediate"],
      },
      {
        title: "Digital Signal Processing",
        source: "EPFL / Coursera",
        year: "Ongoing",
        href: "https://www.coursera.org/learn/dsp",
        desc: "Rigorous treatment of filtering, frequency-domain analysis, and sampling theory. Covers the Butterworth filter design and Fourier analysis that underpin myojam's preprocessing pipeline.",
        tags: ["Coursera", "DSP", "Intermediate"],
      },
      {
        title: "The Fourier Transform and its Applications",
        source: "Brad Osgood / Stanford (YouTube)",
        year: "2008",
        href: "https://www.youtube.com/playlist?list=PLB24BC7956EE040CD",
        desc: "Full Stanford course on Fourier analysis. Deeper than needed for myojam's feature pipeline, but essential for anyone who wants to understand why frequency-domain features (ZC as a proxy) work.",
        tags: ["YouTube", "Fourier", "Advanced"],
      },
      {
        title: "Essence of Linear Algebra",
        source: "3Blue1Brown / YouTube",
        year: "2016",
        href: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
        desc: "Visual intuition for the linear algebra underlying machine learning. Particularly relevant for understanding feature spaces, decision boundaries, and what the Random Forest is doing geometrically.",
        tags: ["YouTube", "Linear algebra", "Visual / beginner"],
      },
    ],
  },
  {
    id: "reading",
    label: "Books & review articles",
    color: "#EC4899",
    desc: "Deeper references for serious study of EMG and biosignal processing.",
    items: [
      {
        title: "Electromyography: Physiology, Engineering, and Non-Invasive Applications",
        source: "Merletti & Parker (eds.) / Wiley-IEEE Press",
        year: "2004",
        href: "https://www.wiley.com/en-us/Electromyography%3A+Physiology%2C+Engineering%2C+and+Non+Invasive+Applications-p-9780471675808",
        desc: "The standard reference textbook for surface EMG. Covers signal generation physiology, electrode design, filtering, decomposition, and clinical applications in depth.",
        tags: ["Textbook", "Reference", "Comprehensive"],
      },
      {
        title: "Pattern Recognition and Machine Learning",
        source: "Bishop / Springer",
        year: "2006",
        href: "https://www.microsoft.com/en-us/research/publication/pattern-recognition-machine-learning/",
        desc: "The standard graduate-level ML reference. Chapters on decision trees, ensemble methods, and Bayesian classifiers are directly relevant. Available free as PDF from Microsoft Research.",
        tags: ["Textbook", "Machine learning", "Advanced"],
      },
      {
        title: "A review of the surface EMG decomposition literature",
        source: "Holobar & Farina",
        year: "2014",
        href: "https://iopscience.iop.org/article/10.1088/1741-2560/11/3/035001",
        desc: "Comprehensive review of algorithms for decomposing surface EMG into individual motor unit contributions. Important background for understanding the fundamental signal structure that gesture classifiers operate on.",
        tags: ["Review", "Motor units", "Decomposition"],
      },
    ],
  },
]

const TAG_COLORS = {
  "EMG": "#10B981",
  "Gesture": "#FF2D78",
  "Benchmark": "#3B82F6",
  "Python": "#8B5CF6",
  "Machine learning": "#3B82F6",
  "Textbook": "#EC4899",
  "Review": "#F59E0B",
  "Coursera": "#F59E0B",
  "YouTube": "#EF4444",
  "Classic": "#AEAEB2",
}

function TagPill({ tag }) {
  const color = TAG_COLORS[tag] || "#AEAEB2"
  return (
    <span style={{ fontSize:10, fontWeight:500, color, background:`${color}18`, border:`1px solid ${color}30`, borderRadius:100, padding:"2px 8px" }}>
      {tag}
    </span>
  )
}

const TOTAL = SECTIONS.reduce((s, sec) => s + sec.items.length, 0)

export default function ResourcesPage() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <style>{`
        .res-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
        .res-card:hover { transform: translateY(-3px) !important; box-shadow: 0 12px 32px rgba(0,0,0,0.09) !important; }
      `}</style>
      <Navbar />

      {/* ── Hero ── */}
      <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid var(--border)", padding:"100px 32px 72px" }}>
        <NeuralNoise color={[0.93, 0.30, 0.61]} opacity={0.85} speed={0.0006} />
        <div style={{ position:"absolute", inset:0, background:"rgba(3,0,18,0.65)", zIndex:1 }}/>
        <div style={{ maxWidth:860, margin:"0 auto", position:"relative", zIndex:2 }}>
          <Reveal>
            <SectionPill>External resources</SectionPill>
            <h1 style={{ fontSize:"clamp(36px,6vw,64px)", fontWeight:600, letterSpacing:"-2px", lineHeight:1.04, color:"#fff", marginBottom:20 }}>
              Further reading.<br/><span style={{ color:"var(--accent)" }}>Beyond myojam.</span>
            </h1>
            <p style={{ fontSize:17, color:"rgba(255,255,255,0.72)", fontWeight:300, lineHeight:1.75, maxWidth:520, marginBottom:36 }}>
              Datasets, foundational papers, software libraries, and courses that form the broader context for what myojam does - curated for students, educators, and independent researchers.
            </p>
            <div style={{ display:"flex", gap:28 }}>
              {[[String(TOTAL),"curated resources"],["5","categories"],["Free","all open access"]].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontSize:22, fontWeight:700, color:"var(--accent)", letterSpacing:"-0.5px" }}>{val}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontWeight:300, textTransform:"uppercase", letterSpacing:"0.08em", marginTop:2 }}>{label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"64px 32px 80px" }}>

        {/* Section nav */}
        <div style={{ display:"flex", gap:8, marginBottom:56, flexWrap:"wrap" }}>
          {SECTIONS.map(s => (
            <a key={s.id} href={`#${s.id}`} style={{
              fontSize:12, fontWeight:500, color:s.color,
              background:`${s.color}12`, border:`1px solid ${s.color}30`,
              borderRadius:100, padding:"5px 14px", textDecoration:"none",
              transition:"all 0.15s",
              display:"inline-flex", alignItems:"center", gap:6,
            }}
              onMouseEnter={e => e.currentTarget.style.background = `${s.color}22`}
              onMouseLeave={e => e.currentTarget.style.background = `${s.color}12`}
            >
              {s.label}
              <span style={{ fontSize:10, opacity:0.75, background:"rgba(0,0,0,0.08)", borderRadius:100, padding:"1px 5px" }}>{s.items.length}</span>
            </a>
          ))}
        </div>

        {/* Sections */}
        {SECTIONS.map((section, si) => (
          <div key={section.id} id={section.id} style={{ marginBottom:64 }}>
            <Reveal delay={si * 0.04}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
                <div style={{ width:4, height:28, borderRadius:2, background:section.color, flexShrink:0 }}/>
                <h2 style={{ fontSize:22, fontWeight:600, color:"var(--text)", letterSpacing:"-0.5px" }}>
                  {section.label}
                  <span style={{ fontSize:13, fontWeight:400, color:"var(--text-tertiary)", marginLeft:10 }}>
                    {section.items.length} {section.items.length === 1 ? "resource" : "resources"}
                  </span>
                </h2>
              </div>
              <p style={{ fontSize:14, color:"var(--text-tertiary)", fontWeight:300, marginBottom:20, marginLeft:16 }}>{section.desc}</p>
            </Reveal>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))", gap:12 }}>
              {section.items.map((item, ii) => (
                <Reveal key={item.title} delay={si * 0.04 + ii * 0.03}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="res-card"
                    style={{
                      display:"flex", flexDirection:"column",
                      borderRadius:12,
                      border:`1px solid var(--border)`,
                      borderTop:`3px solid ${section.color}`,
                      padding:"20px", background:"var(--bg)",
                      textDecoration:"none",
                      height:"100%", boxSizing:"border-box",
                    }}
                  >
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, marginBottom:6 }}>
                      <h3 style={{ fontSize:15, fontWeight:600, color:"var(--text)", letterSpacing:"-0.2px", lineHeight:1.3, flex:1 }}>
                        {item.title}
                      </h3>
                      <span style={{ fontSize:14, color:section.color, flexShrink:0, opacity:0.8 }}>↗</span>
                    </div>
                    <div style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300, marginBottom:10 }}>
                      {item.source} · {item.year}
                    </div>
                    <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.65, fontWeight:300, flex:1, margin:"0 0 14px" }}>
                      {item.desc}
                    </p>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {item.tags.map(t => <TagPill key={t} tag={t} />)}
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          </div>
        ))}

        {/* Attribution note */}
        <Reveal delay={0.1}>
          <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"28px 32px", marginTop:16 }}>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>A note on these links</div>
            <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.75, fontWeight:300, margin:"0 0 16px" }}>
              All resources listed here are independent of myojam and maintained by their respective authors and organisations. Links are provided for educational reference only. If you find a broken link or want to suggest an addition, open an issue on the myojam GitHub.
            </p>
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              <a href="https://github.com/Jaden300/myojam" target="_blank" rel="noreferrer" style={{ fontSize:13, color:"var(--accent)", fontWeight:400, textDecoration:"none" }}>Suggest a resource on GitHub ↗</a>
              <span style={{ color:"var(--border)" }}>·</span>
              <span onClick={() => navigate("/research")} style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, cursor:"pointer", transition:"color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.color = "var(--text-secondary)"}
              >Back to research →</span>
            </div>
          </div>
        </Reveal>
      </div>

      <Footer />
    </div>
  )
}
