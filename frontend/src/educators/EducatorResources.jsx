import { useNavigate } from "react-router-dom"
import Navbar from "../Navbar"
import Footer from "../Footer"
import { Reveal, HoverCard, SectionPill } from "../Animate"
import NeuralNoise from "../components/NeuralNoise"
import { IconClipboard, IconLaptop, IconBarChart, IconMicroscope, IconPencil } from "../Icons"

const PINK   = "#FF2D78"
const BLUE   = "#3B82F6"
const GREEN  = "#10B981"
const PURPLE = "#8B5CF6"
const AMBER  = "#F59E0B"
const CYAN   = "#06B6D4"

const RESOURCE_SECTIONS = [
  {
    id: "datasets",
    label: "Datasets",
    color: GREEN,
    desc: "Publicly available EMG datasets for classroom and research use.",
    items: [
      { title:"Ninapro DB5",         source:"Atzori et al. / HES-SO Valais",      year:"2014–ongoing", href:"http://ninapro.hevs.ch/", desc:"The dataset myojam trains on. 10 subjects, 16 EMG channels, 200 Hz, 52 hand movements. Freely available under academic terms.", tags:["EMG","Gesture","Benchmark","Free"] },
      { title:"Ninapro full collection", source:"Ninapro project",               year:"2012–2022",    href:"http://ninapro.hevs.ch/", desc:"DB1–DB10 spanning >200 subjects, multiple hardware platforms, and amputee subjects. A complete benchmark family for prosthetics research.", tags:["EMG","Multi-database","Prosthetics"] },
      { title:"UCI EMG for Gestures", source:"Lobov et al. / UCI ML Repository", year:"2018",         href:"https://archive.ics.uci.edu/dataset/481/emg+data+for+gestures", desc:"30 subjects, 2-channel forearm EMG at 1000 Hz, 8 gesture classes. Accessible entry point for classroom experiments.", tags:["EMG","2-channel","Introductory"] },
      { title:"PhysioNet EEGMMIDB",  source:"Goldberger et al. / PhysioNet",     year:"2009",         href:"https://physionet.org/content/eegmmidb/1.0.0/", desc:"109 subjects, EEG + motor execution tasks. Bridges EMG concepts to EEG and motor imagery — useful for interdisciplinary units.", tags:["EEG","Motor imagery","BCI"] },
    ]
  },
  {
    id: "tools",
    label: "myojam interactive tools",
    color: PINK,
    desc: "Browser-based tools — no install required.",
    items: [
      { title:"Signal playground",         source:"myojam",    year:"",   href:"/playground", desc:"Draw waveforms with the mouse and watch MAV, RMS, ZC, and WL update in real time. Ideal for introducing feature extraction hands-on.", tags:["Feature extraction","Interactive","Foundations"] },
      { title:"Confusion matrix explorer", source:"myojam",    year:"",   href:"/confusion",  desc:"Interactive heatmap of the classifier's errors. Students identify which gestures are confused and reason about the anatomical cause.", tags:["Evaluation","ML","Interactive"] },
      { title:"EMG frequency analyzer",   source:"myojam",    year:"",   href:"/frequency",  desc:"Load real Ninapro DB5 windows and visualise how the bandpass filter works across all 16 channels.", tags:["Signal processing","Bandpass","Interactive"] },
      { title:"Gesture reaction game",    source:"myojam",    year:"",   href:"/game",       desc:"Timed gesture-matching game that builds intuition about the 6 gesture classes and reinforces classification vocabulary.", tags:["Gamified","Engagement","All levels"] },
      { title:"Pipeline explorer",        source:"myojam",    year:"",   href:"/pipeline",   desc:"Live trace from raw EMG window through feature extraction to Random Forest votes. Makes the full ML pipeline visible.", tags:["ML","Pipeline","Advanced"] },
      { title:"Live demo (dataset mode)", source:"myojam",    year:"",   href:"/signal",     desc:"The main classification demo. Load real Ninapro samples by gesture, observe EMG waveforms, confidence scores, and the 3D hand model.", tags:["Demo","Classification","Real data"] },
    ]
  },
  {
    id: "papers",
    label: "Foundational papers",
    color: BLUE,
    desc: "Seminal work that underpins the myojam methodology — most are open access.",
    items: [
      { title:"Feature reduction and selection for EMG signal classification", source:"Phinyomark, Phukpattaranont & Limsakul",      year:"2012", href:"https://doi.org/10.1016/j.eswa.2012.02.119", desc:"Established MAV, RMS, ZC, and WL as near-optimal time-domain features. The direct empirical basis for myojam's feature design.", tags:["Feature extraction","Open access"] },
      { title:"Electromyography data for non-invasive naturally-controlled robotic hand prostheses", source:"Atzori et al.",          year:"2014", href:"https://doi.org/10.1038/sdata.2014.53",       desc:"The Ninapro database paper. Background reading for students using DB5 data in class.", tags:["Dataset","Open access"] },
      { title:"Electromyogram pattern recognition for control of powered upper-limb prostheses", source:"Scheme & Englehart",        year:"2011", href:"https://doi.org/10.1682/jrrd.2010.06.0124",   desc:"State-of-the-art review of EMG control for prosthetics. Good companion reading for applications-and-ethics lessons.", tags:["Review","Prosthetics"] },
      { title:"A survey of EMG signal processing for upper limb gesture recognition", source:"Naik et al.",                         year:"2016", href:"https://doi.org/10.1016/j.procs.2016.09.095",  desc:"Accessible survey covering preprocessing, segmentation, feature extraction, and classification. Well-suited for advanced students.", tags:["Survey","Signal processing"] },
    ]
  },
  {
    id: "software",
    label: "Software & code",
    color: PURPLE,
    desc: "Open-source tools for building, training, and exploring EMG classifiers.",
    items: [
      { title:"myojam GitHub repository",     source:"myojam (MIT License)",  year:"",   href:"https://github.com/Jaden300/myojam", desc:"Full open-source codebase: signal processing pipeline, Random Forest trainer, web app, and lesson materials. Fork and build.", tags:["Python","JavaScript","MIT"] },
      { title:"scikit-learn",                source:"scikit-learn community", year:"",   href:"https://scikit-learn.org/",            desc:"The ML library used for myojam's Random Forest classifier. Extensive documentation with beginner-friendly examples.", tags:["Python","ML","Free"] },
      { title:"scipy.signal (bandpass filter)", source:"SciPy project",      year:"",   href:"https://docs.scipy.org/doc/scipy/reference/signal.html", desc:"Used for the Butterworth bandpass filter in the myojam pipeline. filtfilt documentation is especially relevant.", tags:["Python","Signal processing","Free"] },
      { title:"OpenBCI GUI",                 source:"OpenBCI",               year:"",   href:"https://docs.openbci.com/Software/OpenBCISoftware/GUIWidgets/", desc:"A visual EMG/EEG recording interface. Useful if students have access to hardware — compatible with OpenBCI Cyton boards.", tags:["Hardware","GUI","Visualization"] },
    ]
  },
]

const QUICKSTART = [
  { step:"01", color:PINK,   Icon:IconClipboard,  title:"Choose a lesson plan", desc:"Start with 'EMG Basics' for biology classes or 'Gesture Classifier' for CS. Each comes with a full teacher guide, student worksheet, and exit ticket." },
  { step:"02", color:BLUE,   Icon:IconLaptop,     title:"Open the interactive tools", desc:"All tools run in any modern browser — Chrome recommended for full WebSerial support. No accounts, downloads, or installs needed.", href:"/demos" },
  { step:"03", color:GREEN,  Icon:IconBarChart,   title:"Download the dataset (optional)", desc:"For deeper investigations, students can download Ninapro DB5 from ninapro.hevs.ch under an academic use agreement. Registration required.", href:"http://ninapro.hevs.ch/" },
  { step:"04", color:PURPLE, Icon:IconMicroscope, title:"Run the myojam demo", desc:"Load any of the 6 gesture classes in Dataset mode. Students observe the EMG waveform, class probabilities, and 3D hand model respond in real time.", href:"/signal" },
  { step:"05", color:AMBER,  Icon:IconPencil,     title:"Collect exit tickets", desc:"The 3-2-1 exit tickets from Lesson 1 and the design brief from Lesson 3 are strong formative assessments. Share unusual student proposals with us!" },
]

const CURRICULUM = [
  { framework:"NGSS",                codes:["HS-LS1-2 (Cell communication)","HS-PS4-1 (Waves and EMFs)","HS-ETS1-2 (Engineering design)","MS-PS4-2 (Wave properties)"] },
  { framework:"AP / IB",             codes:["AP Biology: Nervous system","AP CS Principles: Data & analysis","IB Biology: Neural signalling","IB CS: Computational thinking"] },
  { framework:"Common Core / ISTE",  codes:["Mathematical reasoning","Data interpretation","ISTE 1.7 Global collaborator","Scientific communication"] },
]

const CAT_COLORS = { "EMG":"#10B981", "Gesture":"#FF2D78", "Benchmark":"#3B82F6", "Free":"#8B5CF6", "Multi-database":"#F59E0B", "Prosthetics":"#06B6D4", "EEG":"#8B5CF6", "Motor imagery":"#F59E0B", "BCI":"#EF4444", "2-channel":"#10B981", "Introductory":"#3B82F6", "Feature extraction":"#FF2D78", "Interactive":"#10B981", "Foundations":"#3B82F6", "Evaluation":"#8B5CF6", "ML":"#F59E0B", "Signal processing":"#06B6D4", "Bandpass":"#06B6D4", "Gamified":"#FF2D78", "Engagement":"#F59E0B", "All levels":"#10B981", "Pipeline":"#8B5CF6", "Advanced":"#EF4444", "Demo":"#FF2D78", "Classification":"#3B82F6", "Real data":"#10B981", "Open access":"#10B981", "Dataset":"#3B82F6", "Review":"#8B5CF6", "Survey":"#F59E0B", "Python":"#3B82F6", "JavaScript":"#F59E0B", "MIT":"#10B981", "Free":"#10B981", "Hardware":"#06B6D4", "GUI":"#8B5CF6", "Visualization":"#FF2D78" }

function ResourceCard({ item, color }) {
  const isInternal = item.href && item.href.startsWith("/")
  return (
    <HoverCard color={`${color}14`} onClick={() => isInternal ? window.location.href = item.href : window.open(item.href, "_blank")}
      style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius-sm)", border:"1px solid var(--border)", padding:"18px 20px", cursor:"pointer", display:"flex", flexDirection:"column", gap:8 }}
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ fontSize:14, fontWeight:600, color:"var(--text)", lineHeight:1.3 }}>{item.title}</div>
        <span style={{ fontSize:14, color:"var(--text-tertiary)", marginLeft:12, flexShrink:0 }}>↗</span>
      </div>
      <div style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>{item.source}{item.year ? ` · ${item.year}` : ""}</div>
      <p style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.6, margin:0 }}>{item.desc}</p>
      {item.tags && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:4 }}>
          {item.tags.map(tag => (
            <span key={tag} style={{ fontSize:10, fontWeight:500, color:CAT_COLORS[tag]||color, background:(CAT_COLORS[tag]||color)+"15", borderRadius:100, padding:"2px 8px" }}>{tag}</span>
          ))}
        </div>
      )}
    </HoverCard>
  )
}

export default function EducatorResources() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />

      <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid var(--border)", padding:"100px 32px 64px" }}>
        <NeuralNoise color={[0.06, 0.72, 0.40]} opacity={0.85} speed={0.0006} />
        <div style={{ position:"absolute", inset:0, background:"rgba(3,0,18,0.65)", zIndex:1 }} />
        <div style={{ maxWidth:920, margin:"0 auto", position:"relative", zIndex:2 }}>
          <div style={{ display:"flex", gap:8, marginBottom:24 }}>
            <span onClick={()=>navigate("/educators")} style={{ fontSize:13, color:"#10B981", cursor:"pointer" }}>For educators</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>→</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Resource library</span>
          </div>
          <Reveal>
            <SectionPill>Free · Open access</SectionPill>
            <h1 style={{ fontSize:"clamp(32px,5vw,52px)", fontWeight:600, letterSpacing:"-1.5px", color:"#fff", marginBottom:20, lineHeight:1.08 }}>
              Educator resource library.
            </h1>
            <p style={{ fontSize:17, color:"rgba(255,255,255,0.72)", fontWeight:300, lineHeight:1.7, maxWidth:540 }}>
              Datasets, tools, papers, and open-source code for teaching EMG signal processing, gesture classification, and assistive technology. Everything linked here is free and publicly accessible.
            </p>
          </Reveal>
          {/* Stats */}
          <div style={{ display:"flex", gap:24, flexWrap:"wrap", marginTop:32 }}>
            {[
              { val:"6",    label:"Interactive browser tools", color:PINK },
              { val:"4+",   label:"Open datasets", color:GREEN },
              { val:"3",    label:"Lesson plans ready to teach", color:PURPLE },
              { val:"100%", label:"Free to use", color:AMBER },
            ].map(s => (
              <div key={s.label} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"12px 18px" }}>
                <div style={{ fontSize:22, fontWeight:700, color:s.color, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:920, margin:"0 auto", padding:"56px 32px 80px" }}>

        {/* Quickstart guide */}
        <Reveal>
          <SectionPill>Getting started</SectionPill>
          <h2 style={{ fontSize:"clamp(20px,3vw,28px)", fontWeight:600, letterSpacing:"-0.8px", color:"var(--text)", marginBottom:8 }}>Classroom quickstart</h2>
          <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, marginBottom:28, maxWidth:540 }}>
            Most educators run a complete 75-minute session with just a browser and the free tools. Here's the recommended sequence.
          </p>
        </Reveal>
        <div style={{ display:"flex", flexDirection:"column", gap:0, border:"1px solid var(--border)", borderRadius:"var(--radius)", overflow:"hidden", marginBottom:56 }}>
          {QUICKSTART.map((s, i) => (
            <Reveal key={s.step}>
              <div style={{ display:"flex", gap:0, borderBottom: i < QUICKSTART.length-1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ width:4, background:s.color, flexShrink:0 }} />
                <div style={{ display:"flex", gap:16, padding:"20px 24px", flex:1, alignItems:"flex-start", cursor: s.href ? "pointer" : "default", transition:"background 0.15s" }}
                  onClick={s.href ? () => s.href.startsWith("/") ? navigate(s.href) : window.open(s.href, "_blank") : undefined}
                  onMouseEnter={e => { if (s.href) e.currentTarget.style.background = "var(--bg-secondary)" }}
                  onMouseLeave={e => { if (s.href) e.currentTarget.style.background = "transparent" }}
                >
                  <s.Icon size={22} color={s.color}/>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:10, fontWeight:700, color:s.color, background:`${s.color}14`, borderRadius:100, padding:"2px 8px", letterSpacing:"0.06em" }}>STEP {s.step}</span>
                      {s.href && <span style={{ fontSize:11, color:"var(--text-tertiary)" }}>↗</span>}
                    </div>
                    <div style={{ fontSize:14, fontWeight:600, color:"var(--text)", marginBottom:4 }}>{s.title}</div>
                    <p style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.6, margin:0 }}>{s.desc}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Resource sections */}
        {RESOURCE_SECTIONS.map(section => (
          <div key={section.id} style={{ marginBottom:56 }}>
            <Reveal>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                <div style={{ width:3, height:20, background:section.color, borderRadius:2 }} />
                <h2 style={{ fontSize:18, fontWeight:600, color:"var(--text)", letterSpacing:"-0.3px" }}>{section.label}</h2>
              </div>
              <p style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.6, marginBottom:20 }}>{section.desc}</p>
            </Reveal>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:10 }}>
              {section.items.map(item => (
                <Reveal key={item.title}>
                  <ResourceCard item={item} color={section.color} />
                </Reveal>
              ))}
            </div>
          </div>
        ))}

        {/* Curriculum alignment */}
        <Reveal>
          <SectionPill>Standards</SectionPill>
          <h2 style={{ fontSize:"clamp(20px,3vw,28px)", fontWeight:600, letterSpacing:"-0.8px", color:"var(--text)", marginBottom:8 }}>Curriculum alignment</h2>
          <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, marginBottom:28, maxWidth:540 }}>
            myojam lesson plans map to standards across US and international curricula.
          </p>
        </Reveal>
        <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"32px", marginBottom:40 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:28 }}>
            {CURRICULUM.map(fw => (
              <div key={fw.framework}>
                <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:12, paddingBottom:8, borderBottom:"1px solid var(--border)" }}>{fw.framework}</div>
                {fw.codes.map(c => (
                  <div key={c} style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:8 }}>
                    <div style={{ width:4, height:4, borderRadius:"50%", background:"var(--accent)", flexShrink:0, marginTop:6 }} />
                    <div style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.5 }}>{c}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:8, textAlign:"center" }}>
          <button onClick={()=>navigate("/educators")} style={{ background:"transparent", color:"var(--text-secondary)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, fontFamily:"var(--font)", fontWeight:400, cursor:"pointer" }}>
            ← Back to educator hub
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
