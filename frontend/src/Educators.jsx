import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, StaggerList, HoverCard, SectionPill } from "./Animate"

const LESSONS = [
  {
    slug: "/educators/lesson-emg-basics",
    grade: "Grades 9–12",
    subject: "Biology / Physics",
    duration: "75 min",
    title: "What is EMG? Reading muscle signals in the classroom",
    summary: "Students discover how surface electromyography works, explore real EMG waveforms from the Ninapro dataset, and connect the biology of motor neurons to measurable electrical signals.",
    objectives: ["Understand the electrochemical basis of muscle contraction", "Interpret EMG waveform features", "Connect neuroscience to engineering applications"],
    color: "#FF2D78",
    icon: "⚡",
  },
  {
    slug: "/educators/lesson-gesture-classifier",
    grade: "Grades 10–12 / Intro university",
    subject: "Computer Science / Data Science",
    duration: "90 min",
    title: "Teaching a machine to read gestures",
    summary: "A hands-on introduction to supervised machine learning using EMG gesture data. Students extract features, visualise decision boundaries, and understand why cross-subject generalisation is hard.",
    objectives: ["Understand supervised classification", "Extract time-domain features from signals", "Evaluate model performance using confusion matrices"],
    color: "#3B82F6",
    icon: "🧠",
  },
  {
    slug: "/educators/lesson-myocode",
    grade: "Grades 6–10",
    subject: "Computer Science / STEM",
    duration: "60 min",
    title: "Code with your muscles using myocode",
    summary: "Students use myocode — myojam's block coding environment — to write programs that respond to simulated EMG gestures. Introduces event-driven programming concepts through physical interaction.",
    objectives: ["Understand event-driven programming", "Build block-coded programs", "Connect physical gesture to computational output"],
    color: "#8B5CF6",
    icon: "🧩",
  },
  {
    slug: "/educators/resources",
    grade: "All levels",
    subject: "Cross-curricular",
    duration: "Reference",
    title: "Educator resource library",
    summary: "Printable handouts, slide deck templates, assessment rubrics, dataset downloads, and links to curriculum standards. Everything you need to run myojam lessons without starting from scratch.",
    objectives: ["Ready-to-print materials", "Curriculum alignment guides", "Assessment frameworks"],
    color: "#10B981",
    icon: "📚",
  },
]

const SUBJECTS = [
  { icon:"🔬", label:"Biology", desc:"Motor neurons, muscle contraction, the neuromuscular junction — EMG makes the invisible visible." },
  { icon:"⚙️", label:"Physics", desc:"Signal amplitude, frequency, noise filtering — real physics in a biological context." },
  { icon:"💻", label:"Computer Science", desc:"Classification, feature extraction, event-driven programming, machine learning fundamentals." },
  { icon:"📊", label:"Data Science", desc:"Real 16-channel, 200Hz datasets. Students clean, visualise, and model genuine research data." },
  { icon:"🤝", label:"Ethics", desc:"Biometric data, accessibility, who benefits from technology — rich ethical discussion material." },
  { icon:"🏥", label:"Health & Technology", desc:"Assistive technology, motor impairment, and the engineering of prosthetics and interfaces." },
]

export default function Educators() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", overflow:"hidden" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orbFloat { from{transform:translateY(0)} to{transform:translateY(-28px)} }
      `}</style>
      <Navbar />

      {/* Hero */}
      <section style={{ position:"relative", padding:"120px 32px 80px", overflow:"hidden" }}>
        {[
          ["360px","−80px","−40px",0,"rgba(255,45,120,0.15)"],
          ["240px","65%","60px",2,"rgba(16,185,129,0.12)"],
          ["200px","80%","180px",4,"rgba(59,130,246,0.12)"],
        ].map(([size,x,y,delay,color],i)=>(
          <div key={i} style={{ position:"absolute",width:size,height:size,borderRadius:"50%",background:color,left:x,top:y,filter:"blur(64px)",pointerEvents:"none",animation:`orbFloat 8s ${delay}s ease-in-out infinite alternate` }}/>
        ))}
        <div style={{ maxWidth:860, margin:"0 auto", position:"relative", zIndex:1 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.88)", backdropFilter:"blur(8px)", border:"1px solid rgba(16,185,129,0.25)", borderRadius:100, padding:"6px 16px", fontSize:13, color:"#10B981", fontWeight:500, marginBottom:32, animation:"fadeUp 0.6s ease" }}>
            <span style={{ width:7,height:7,borderRadius:"50%",background:"#10B981",display:"inline-block" }}/>
            Free · Open access · Curriculum-aligned
          </div>
          <h1 style={{ fontSize:"clamp(40px,6vw,72px)", fontWeight:600, letterSpacing:"-2.5px", lineHeight:1.04, color:"var(--text)", marginBottom:24, animation:"fadeUp 0.6s 0.1s ease both" }}>
            Bring EMG science<br/>into your<br/><span style={{ color:"#10B981" }}>classroom.</span>
          </h1>
          <p style={{ fontSize:18, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, maxWidth:560, marginBottom:44, animation:"fadeUp 0.6s 0.2s ease both" }}>
            Ready-to-run lesson plans, real datasets, and interactive tools for teaching
            neuroscience, machine learning, and assistive technology — from middle school to university.
          </p>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap", animation:"fadeUp 0.6s 0.3s ease both" }}>
            <a href="#lessons" style={{ background:"#10B981", color:"#fff", borderRadius:100, padding:"14px 36px", fontSize:15, fontWeight:500, textDecoration:"none", boxShadow:"0 4px 24px rgba(16,185,129,0.35)", transition:"transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow="0 8px 32px rgba(16,185,129,0.45)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 24px rgba(16,185,129,0.35)"}}
            >Browse lesson plans ↓</a>
            <button onClick={()=>navigate("/educators/resources")} style={{ background:"rgba(255,255,255,0.88)", backdropFilter:"blur(8px)", color:"var(--text)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"14px 28px", fontSize:15, fontWeight:400, cursor:"pointer", fontFamily:"var(--font)", transition:"border-color 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(16,185,129,0.4)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border-mid)"}
            >Resource library →</button>
          </div>
        </div>
      </section>

      {/* Subject areas */}
      <section style={{ background:"var(--bg-secondary)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", padding:"64px 32px" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <Reveal>
            <SectionPill>Cross-curricular</SectionPill>
            <h2 style={{ fontSize:"clamp(24px,4vw,38px)", fontWeight:600, letterSpacing:"-1px", color:"var(--text)", marginBottom:40 }}>
              One project, six subject areas.
            </h2>
          </Reveal>
          <StaggerList items={SUBJECTS} columns={3} gap={12} renderItem={s=>(
            <HoverCard style={{ background:"var(--bg)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"24px" }}>
              <div style={{ fontSize:28, marginBottom:12 }}>{s.icon}</div>
              <div style={{ fontSize:15, fontWeight:600, color:"var(--text)", marginBottom:6 }}>{s.label}</div>
              <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.65, fontWeight:300, margin:0 }}>{s.desc}</p>
            </HoverCard>
          )}/>
        </div>
      </section>

      {/* Lesson plans */}
      <section id="lessons" style={{ padding:"64px 32px" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <Reveal>
            <SectionPill>Lesson plans</SectionPill>
            <h2 style={{ fontSize:"clamp(24px,4vw,38px)", fontWeight:600, letterSpacing:"-1px", color:"var(--text)", marginBottom:40 }}>
              Ready to teach this week.
            </h2>
          </Reveal>
          <StaggerList items={LESSONS} columns={1} gap={16} renderItem={lesson=>(
            <HoverCard color={lesson.color+"20"} onClick={()=>navigate(lesson.slug)} style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", overflow:"hidden", cursor:"pointer" }}>
              <div style={{ background:`linear-gradient(135deg, ${lesson.color}10 0%, transparent 100%)`, borderBottom:"1px solid var(--border)", padding:"28px 32px", display:"flex", gap:20, alignItems:"flex-start" }}>
                <div style={{ width:52, height:52, borderRadius:14, background:lesson.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{lesson.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                    <span style={{ fontSize:11, fontWeight:500, color:lesson.color, background:lesson.color+"15", border:`1px solid ${lesson.color}30`, borderRadius:100, padding:"3px 10px" }}>{lesson.grade}</span>
                    <span style={{ fontSize:11, fontWeight:400, color:"var(--text-tertiary)", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:100, padding:"3px 10px" }}>{lesson.subject}</span>
                    <span style={{ fontSize:11, fontWeight:400, color:"var(--text-tertiary)", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:100, padding:"3px 10px" }}>⏱ {lesson.duration}</span>
                  </div>
                  <h3 style={{ fontSize:19, fontWeight:600, color:"var(--text)", letterSpacing:"-0.3px", marginBottom:8, lineHeight:1.3 }}>{lesson.title}</h3>
                  <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.7, fontWeight:300, margin:0 }}>{lesson.summary}</p>
                </div>
                <span style={{ fontSize:18, color:"var(--text-tertiary)", flexShrink:0, marginTop:4 }}>→</span>
              </div>
              <div style={{ padding:"16px 32px", display:"flex", gap:8, flexWrap:"wrap" }}>
                {lesson.objectives.map(o=>(
                  <span key={o} style={{ fontSize:12, color:"var(--text-secondary)", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:100, padding:"4px 12px", fontWeight:300 }}>✓ {o}</span>
                ))}
              </div>
            </HoverCard>
          )}/>
        </div>
      </section>

      {/* Teaser quiz */}
      <section style={{ padding:"0 32px 48px" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <Reveal>
            <SectionPill>Test yourself</SectionPill>
            <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:600, letterSpacing:"-0.8px", color:"var(--text)", marginBottom:8 }}>
              How much do you already know?
            </h2>
            <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, marginBottom:0 }}>
              A 3-question preview. Full quizzes are inside each lesson.
            </p>
          </Reveal>
          <Quiz title="EMG & myojam — quick preview" questions={TEASER_QUESTIONS} accentColor="#10B981" />
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"0 32px 80px" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <Reveal>
            <div style={{ background:"linear-gradient(135deg, rgba(16,185,129,0.08) 0%, transparent 100%)", border:"1px solid rgba(16,185,129,0.2)", borderRadius:"var(--radius)", padding:"48px", textAlign:"center" }}>
              <h3 style={{ fontSize:24, fontWeight:600, color:"var(--text)", letterSpacing:"-0.5px", marginBottom:12 }}>Have a suggestion or want to contribute?</h3>
              <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, maxWidth:440, margin:"0 auto 28px" }}>
                We're actively developing new lesson plans. If you've used myojam in a classroom and want to share what worked, we'd love to hear from you.
              </p>
              <a href="https://tally.so/r/YOUR_EDUCATOR_FORM" target="_blank" rel="noreferrer" style={{ background:"#10B981", color:"#fff", borderRadius:100, padding:"12px 28px", fontSize:14, fontWeight:500, textDecoration:"none", display:"inline-block" }}>
                Share your experience →
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}