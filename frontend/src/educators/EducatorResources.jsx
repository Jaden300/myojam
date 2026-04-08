import { useNavigate } from "react-router-dom"
import Navbar from "../Navbar"
import Footer from "../Footer"
import { Reveal, StaggerList, HoverCard, SectionPill } from "../Animate"

const RESOURCES = [
  {
    cat:"Worksheets & handouts",
    color:"#FF2D78",
    items:[
      { title:"EMG Basics student worksheet", desc:"6-page fillable PDF covering waveform interpretation, feature calculation, and exit ticket. Designed for Lesson 1.", format:"PDF", free:true },
      { title:"Feature table template", desc:"Printable table for recording MAV, RMS, ZC, WL across gesture attempts in the Signal Playground activity.", format:"PDF", free:true },
      { title:"Confusion matrix blank", desc:"Empty 6×6 grid for students to fill in during the confusion explorer activity.", format:"PDF", free:true },
      { title:"myocode block reference card", desc:"One-page quick reference of all available myocode blocks, their parameters, and example uses.", format:"PDF", free:true },
    ]
  },
  {
    cat:"Slide decks",
    color:"#3B82F6",
    items:[
      { title:"Lesson 1: EMG basics slides", desc:"32-slide deck covering motor neurons, the NMJ, surface EMG, waveform interpretation, and feature extraction. Editable Google Slides.", format:"Slides", free:true },
      { title:"Lesson 2: Machine learning for gestures", desc:"28-slide deck covering feature extraction, classification, decision boundaries, and confusion matrices. Includes animation frames.", format:"Slides", free:true },
      { title:"myocode introduction slides", desc:"16-slide deck for introducing myocode, block coding concepts, and the event-driven programming model to younger students.", format:"Slides", free:true },
    ]
  },
  {
    cat:"Datasets",
    color:"#8B5CF6",
    items:[
      { title:"Sample EMG windows (CSV)", desc:"200 pre-labelled EMG windows from Ninapro DB5, one for each gesture class, exported as CSV. Ready to import into Python, Excel, or Google Sheets.", format:"CSV", free:true },
      { title:"Feature matrix for classroom use", desc:"Pre-computed MAV, RMS, ZC, WL values for 1000 windows with ground-truth labels. Students can plot, cluster, and classify without writing signal processing code.", format:"CSV", free:true },
    ]
  },
  {
    cat:"Assessment",
    color:"#10B981",
    items:[
      { title:"Lesson 1 assessment rubric", desc:"4-point rubric covering EMG biological basis, waveform interpretation, and real-world application. Aligned to NGSS and AP Biology standards.", format:"PDF", free:true },
      { title:"Lesson 2 assessment rubric", desc:"4-point rubric covering feature extraction, classification concepts, and confusion matrix interpretation. Aligned to CS and data science standards.", format:"PDF", free:true },
      { title:"Unit test question bank", desc:"30 short-answer and multiple-choice questions spanning both lessons. With answer key.", format:"PDF", free:true },
    ]
  },
]

const LINKS = [
  { label:"Ninapro DB5 dataset", desc:"Full publicly available EMG dataset used to train myojam's classifier.", href:"http://ninapro.hevs.ch/", cat:"Dataset" },
  { label:"myojam GitHub", desc:"Full open-source codebase including signal processing pipeline and ML training scripts.", href:"https://github.com/Jaden300/myojam", cat:"Code" },
  { label:"myojam live demo", desc:"Browser-based demo with real Ninapro data, no hardware required.", href:"https://myojam.com/demo", cat:"Tool" },
  { label:"Signal playground", desc:"Interactive signal drawing and feature extraction tool.", href:"https://myojam.com/playground", cat:"Tool" },
  { label:"Confusion matrix explorer", desc:"Interactive heatmap of classifier performance.", href:"https://myojam.com/confusion", cat:"Tool" },
  { label:"myocode", desc:"Block coding environment with EMG gesture events.", href:"https://myojam.com/myocode", cat:"Tool" },
]

const CAT_COLORS = { Dataset:"#3B82F6", Code:"#8B5CF6", Tool:"#10B981" }

export default function EducatorResources() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />

      <div style={{ background:"linear-gradient(135deg, #f0fff8 0%, #fafafa 60%)", borderBottom:"1px solid var(--border)", padding:"100px 32px 64px" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <div style={{ display:"flex", gap:8, marginBottom:24 }}>
            <span onClick={()=>navigate("/educators")} style={{ fontSize:13, color:"#10B981", cursor:"pointer" }}>For educators</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)" }}>→</span>
            <span style={{ fontSize:13, color:"var(--text-tertiary)", fontWeight:300 }}>Resource library</span>
          </div>
          <Reveal>
            <SectionPill>Free · Open access</SectionPill>
            <h1 style={{ fontSize:"clamp(32px,5vw,52px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", marginBottom:20, lineHeight:1.08 }}>
              Educator resource library.
            </h1>
            <p style={{ fontSize:17, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, maxWidth:520 }}>
              Printable worksheets, editable slide decks, assessment rubrics, datasets, and curriculum alignment guides. Everything is free and open access.
            </p>
          </Reveal>
        </div>
      </div>

      <div style={{ maxWidth:860, margin:"0 auto", padding:"56px 32px 80px" }}>

        {/* Coming soon notice */}
        <div style={{ background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.25)", borderLeft:"3px solid #F59E0B", borderRadius:"0 var(--radius) var(--radius) 0", padding:"18px 24px", marginBottom:48 }}>
          <div style={{ fontSize:12, fontWeight:600, color:"#F59E0B", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>Note</div>
          <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, margin:0 }}>
            Downloadable files are being prepared and will be available shortly. All resources listed below will be free. If you need something urgently for a class, contact us directly and we'll send it ahead of the public release.
          </p>
        </div>

        {/* Resource categories */}
        {RESOURCES.map((cat,ci)=>(
          <div key={cat.cat} style={{ marginBottom:48 }}>
            <Reveal delay={ci*0.1}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                <div style={{ width:4, height:20, borderRadius:2, background:cat.color }}/>
                <div style={{ fontSize:16, fontWeight:600, color:"var(--text)" }}>{cat.cat}</div>
              </div>
            </Reveal>
            <StaggerList items={cat.items} columns={1} gap={10} renderItem={item=>(
              <HoverCard color={cat.color+"20"} style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius-sm)", border:"1px solid var(--border)", padding:"20px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:20 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:600, color:"var(--text)", marginBottom:4 }}>{item.title}</div>
                  <p style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.65, margin:0 }}>{item.desc}</p>
                </div>
                <div style={{ display:"flex", gap:8, flexShrink:0, alignItems:"center" }}>
                  <span style={{ fontSize:11, color:cat.color, background:cat.color+"15", border:`1px solid ${cat.color}30`, borderRadius:100, padding:"3px 10px", fontWeight:500 }}>{item.format}</span>
                  <span style={{ fontSize:11, color:"#10B981", background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:100, padding:"3px 10px", fontWeight:500 }}>Free</span>
                  <button style={{ background:"var(--bg)", border:"1px solid var(--border)", borderRadius:100, padding:"6px 14px", fontSize:12, color:"var(--text-secondary)", cursor:"pointer", fontFamily:"var(--font)", transition:"all 0.15s" }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=cat.color;e.currentTarget.style.color=cat.color}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-secondary)"}}
                  >Download</button>
                </div>
              </HoverCard>
            )}/>
          </div>
        ))}

        {/* External links */}
        <div style={{ marginTop:24 }}>
          <Reveal>
            <div style={{ fontSize:16, fontWeight:600, color:"var(--text)", marginBottom:20 }}>External resources</div>
          </Reveal>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
            {LINKS.map(link=>(
              <HoverCard key={link.label} color="rgba(255,45,120,0.08)" onClick={()=>window.open(link.href,"_blank")} style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius-sm)", border:"1px solid var(--border)", padding:"18px 20px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:11, fontWeight:500, color:CAT_COLORS[link.cat]||"var(--accent)", background:(CAT_COLORS[link.cat]||"var(--accent)")+"15", borderRadius:100, padding:"2px 8px" }}>{link.cat}</span>
                  </div>
                  <div style={{ fontSize:14, fontWeight:600, color:"var(--text)", marginBottom:4 }}>{link.label}</div>
                  <p style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.6, margin:0 }}>{link.desc}</p>
                </div>
                <span style={{ fontSize:16, color:"var(--text-tertiary)", marginLeft:12, flexShrink:0 }}>↗</span>
              </HoverCard>
            ))}
          </div>
        </div>

        {/* Curriculum alignment */}
        <div style={{ marginTop:48, background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"32px" }}>
          <div style={{ fontSize:11, fontWeight:600, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:20 }}>Curriculum alignment</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {[
              { framework:"NGSS", codes:["HS-LS1-2 (Cell communication)","HS-PS4-1 (Waves and EMFs)","HS-ETS1-2 (Engineering design)"] },
              { framework:"AP / IB", codes:["AP Biology: Nervous system","AP CS Principles: Data & analysis","IB Biology: Neural signalling"] },
              { framework:"Common Core / provincial", codes:["Mathematical reasoning","Data interpretation","Scientific communication"] },
            ].map(fw=>(
              <div key={fw.framework}>
                <div style={{ fontSize:12, fontWeight:600, color:"var(--text)", marginBottom:10 }}>{fw.framework}</div>
                {fw.codes.map(c=>(
                  <div key={c} style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, marginBottom:6, lineHeight:1.5 }}>{c}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:32, textAlign:"center" }}>
          <button onClick={()=>navigate("/educators")} style={{ background:"transparent", color:"var(--text-secondary)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, fontFamily:"var(--font)", fontWeight:400, cursor:"pointer" }}>
            ← Back to educator hub
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}