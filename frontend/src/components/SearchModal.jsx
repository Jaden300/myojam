import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

const DATA = [
  { slug:"/education/emg-explainer",              tag:"Article",  title:"The science of muscle-computer interfaces",     desc:"Motor neurons, muscle fibres, surface electrodes, sEMG" },
  { slug:"/education/why-emg-is-hard",            tag:"Article",  title:"Why EMG is harder than it looks",               desc:"Noise, placement variability, inter-subject differences" },
  { slug:"/education/muscle-memory",              tag:"Article",  title:"What actually is muscle memory?",               desc:"Motor cortex, cerebellum, plasticity, motor learning" },
  { slug:"/education/phantom-limb",               tag:"Article",  title:"The neuroscience of phantom limb sensation",    desc:"Amputation, cortical remapping, body image, prosthetics" },
  { slug:"/education/ethics-of-emg",              tag:"Article",  title:"Who owns your muscle data?",                    desc:"Biometric data, consent, privacy, corporate control" },
  { slug:"/education/future-of-bci",              tag:"Article",  title:"After EMG: what comes next in BCI",             desc:"Implants, ultrasound, neural interfaces, next-gen" },
  { slug:"/education/build-your-own",             tag:"Article",  title:"Build your own EMG sensor for under $60",       desc:"MyoWare 2.0, Arduino, DIY hardware, wiring guide" },
  { slug:"/education/open-source-emg",            tag:"Article",  title:"The state of open-source EMG",                  desc:"Ninapro, OpenBCI, reproducible research, community" },
  { slug:"/education/random-forest-emg",          tag:"Article",  title:"Why Random Forest works so well for EMG",       desc:"Ensemble learning, feature importance, classification" },
  { slug:"/education/windowing-explained",        tag:"Article",  title:"Windowing: how raw EMG becomes features",       desc:"Sliding windows, overlap, stationarity, segmentation" },
  { slug:"/education/ninapro-db5",                tag:"Article",  title:"Ninapro DB5: the benchmark explained",          desc:"Dataset, 52 gestures, 10 subjects, Myo armband, benchmark" },
  { slug:"/research/paper",                       tag:"Research", title:"myojam: the full technical report",             desc:"84.85% accuracy, Random Forest, pipeline, Ninapro DB5" },
  { slug:"/research/classifier-analysis",         tag:"Research", title:"Feature engineering and classifier comparison", desc:"RF vs SVM vs k-NN vs LDA, LOSO, feature importance" },
  { slug:"/research/variability-review",          tag:"Research", title:"Origins of inter-subject sEMG variability",      desc:"Structured review: electrode placement, fatigue, session variability, mitigation" },
  { slug:"/research/windowing-analysis",          tag:"Research", title:"Window duration, overlap, and the prosthetic feasibility gap", desc:"Systematic ablation: 100ms–2000ms windows, clinical latency, majority voting" },
  { slug:"/playground",                           tag:"Tool",     title:"Signal playground",                             desc:"Simulate and visualise EMG signal processing in browser" },
  { slug:"/frequency",                            tag:"Tool",     title:"Frequency analyzer",                            desc:"Explore EMG frequency content, bandpass filtering" },
  { slug:"/confusion",                            tag:"Tool",     title:"Confusion matrix explorer",                     desc:"See which gestures the classifier confuses and why" },
  { slug:"/game",                                 tag:"Tool",     title:"Gesture reaction game",                         desc:"Test your reaction time with gesture challenges" },
  { slug:"/educators/lesson-emg-basics",          tag:"Lesson",   title:"Lesson: EMG basics",                           desc:"Grades 6-9, 50 min, intro to surface electromyography" },
  { slug:"/educators/lesson-gesture-classifier",  tag:"Lesson",   title:"Lesson: Building a gesture classifier",        desc:"Grades 8-11, 60 min, machine learning pipeline" },
  { slug:"/educators/lesson-applications-ethics", tag:"Lesson",   title:"Lesson: Applications and ethics",              desc:"Grades 7-11, 60 min, real-world EMG and bioethics" },
  { slug:"/education",    tag:"Hub",  title:"Education hub",      desc:"11 in-depth articles from foundations to ethics" },
  { slug:"/research",     tag:"Hub",  title:"Research hub",       desc:"Open-access technical reports and documentation" },
  { slug:"/resources",    tag:"Hub",  title:"Resources",          desc:"Curated datasets, papers, software, and courses" },
  { slug:"/educators",    tag:"Hub",  title:"For educators",      desc:"Lesson plans, tools, curriculum alignment" },
  { slug:"/demos",        tag:"Hub",  title:"Interactive demos",  desc:"4 browser-based EMG tools" },
  { slug:"/download",     tag:"Page", title:"Desktop app",         desc:"macOS, Windows & Linux download - real-time EMG gesture classification" },
  { slug:"/blog",         tag:"Page", title:"Blog",               desc:"myojam news and EMG fact posts" },
  { slug:"/about",        tag:"Page", title:"About myojam",       desc:"Mission, open source, approach" },
  { slug:"/how-it-works", tag:"Page", title:"How it works",       desc:"Signal processing pipeline overview" },
  { slug:"/changelog",    tag:"Page", title:"Changelog",          desc:"Version history and roadmap" },
]

const TAG_COLOR = {
  Article:  "#3B82F6",
  Research: "#10B981",
  Tool:     "#FF2D78",
  Lesson:   "#8B5CF6",
  Hub:      "#F59E0B",
  Page:     "#6B7280",
}

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const navigate = useNavigate()

  const results = query.trim()
    ? DATA.filter(d => `${d.title} ${d.desc} ${d.tag}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : DATA.slice(0, 7)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { setActive(0) }, [query])

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") { onClose(); return }
      if (e.key === "ArrowDown") { e.preventDefault(); setActive(i => Math.min(i + 1, results.length - 1)) }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActive(i => Math.max(i - 1, 0)) }
      if (e.key === "Enter" && results[active]) { navigate(results[active].slug); onClose() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [results, active, onClose, navigate])

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", backdropFilter:"blur(6px)", zIndex:1000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"80px 16px" }}
    >
      <div style={{ width:"100%", maxWidth:560, background:"var(--bg)", borderRadius:16, border:"1px solid var(--border)", boxShadow:"0 24px 64px rgba(0,0,0,0.18)", overflow:"hidden" }}>

        {/* Input row */}
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"16px 20px", borderBottom:"1px solid var(--border)" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, opacity:0.4 }}>
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search articles, tools, lessons..."
            style={{ flex:1, background:"none", border:"none", outline:"none", fontSize:15, color:"var(--text)", fontFamily:"var(--font)", fontWeight:400 }}
          />
          <kbd style={{ fontSize:11, color:"var(--text-tertiary)", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:6, padding:"2px 7px", fontFamily:"monospace", flexShrink:0 }}>esc</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight:380, overflowY:"auto" }}>
          {results.length === 0 ? (
            <div style={{ padding:"28px 20px", fontSize:14, color:"var(--text-tertiary)", textAlign:"center" }}>No results for "{query}"</div>
          ) : results.map((r, i) => {
            const color = TAG_COLOR[r.tag] || "var(--accent)"
            return (
              <div
                key={r.slug}
                onClick={() => { navigate(r.slug); onClose() }}
                onMouseEnter={() => setActive(i)}
                style={{ display:"flex", alignItems:"center", gap:14, padding:"11px 20px", cursor:"pointer", background: i === active ? "var(--bg-secondary)" : "transparent", borderBottom:"1px solid var(--border)", transition:"background 0.08s" }}
              >
                <span style={{ fontSize:10, fontWeight:600, color, background:`${color}14`, border:`1px solid ${color}28`, borderRadius:100, padding:"2px 9px", flexShrink:0, whiteSpace:"nowrap" }}>{r.tag}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:500, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.title}</div>
                  <div style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop:1 }}>{r.desc}</div>
                </div>
                <span style={{ fontSize:14, color:"var(--text-tertiary)", flexShrink:0, opacity: i === active ? 1 : 0 }}>→</span>
              </div>
            )
          })}
        </div>

        {/* Hint row */}
        <div style={{ padding:"10px 20px", borderTop:"1px solid var(--border)", display:"flex", gap:18 }}>
          {[["↵","select"],["↑↓","navigate"],["esc","close"]].map(([key, label]) => (
            <div key={key} style={{ display:"flex", gap:5, alignItems:"center" }}>
              <kbd style={{ fontSize:10, color:"var(--text-tertiary)", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:4, padding:"1px 6px", fontFamily:"monospace" }}>{key}</kbd>
              <span style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
