import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"
import NeuralNoise from "./components/NeuralNoise"
import Quiz from "./educators/Quiz"
import ContactForm from "./components/ContactForm"
import { IconBolt, IconBrain, IconPuzzle, IconBook, IconMicroscope, IconGear, IconLaptop, IconBarChart, IconHandshake, IconMedical, IconDocument, IconClipboard, IconDatabase, IconMap } from "./Icons"

const GREEN  = "#10B981"
const PINK   = "#FF2D78"
const BLUE   = "#3B82F6"
const PURPLE = "#8B5CF6"
const AMBER  = "#F59E0B"

const LESSONS = [
  {
    slug: "/educators/lesson-emg-basics",
    num: "01",
    grade: "Grades 9–12",
    subject: "Biology · Physics",
    duration: "75 min",
    difficulty: "Beginner-friendly",
    title: "What is EMG? Reading muscle signals in the classroom",
    summary: "Students discover how surface electromyography works, explore real EMG waveforms from the Ninapro dataset, and connect the biology of motor neurons to measurable electrical signals.",
    objectives: [
      "Electrochemical basis of muscle contraction",
      "How to read and interpret an EMG waveform",
      "Why surface EMG can't reach individual motor units",
    ],
    phases: [
      { label: "Hook", minutes: 10, color: PINK },
      { label: "Biology overview", minutes: 20, color: PURPLE },
      { label: "Signal playground", minutes: 25, color: GREEN },
      { label: "Debrief", minutes: 20, color: AMBER },
    ],
    tools: ["Signal playground", "EMG waveform explorer"],
    outcome: "Students annotate a printed EMG waveform, labelling noise zones, motion artefacts, the 50Hz powerline spike, and the 20–90Hz useful band.",
    differentiation: "Simplified waveform handout for Grades 7–8. Extension: students calculate RMS manually from a 10-sample window.",
    color: PINK,
    icon: IconBolt,
  },
  {
    slug: "/educators/lesson-gesture-classifier",
    num: "02",
    grade: "Grades 10–12 · Intro university",
    subject: "Computer Science · Data Science",
    duration: "90 min",
    difficulty: "Intermediate",
    title: "Teaching a machine to read gestures",
    summary: "A hands-on introduction to supervised machine learning using real EMG gesture data. Students extract features, read confusion matrices, and confront the cross-subject generalisation problem.",
    objectives: [
      "Training vs. test set logic",
      "Time-domain feature extraction (MAV, RMS, WL, ZCR)",
      "Reading confusion matrices and calculating precision/recall",
    ],
    phases: [
      { label: "ML framing", minutes: 15, color: BLUE },
      { label: "Feature extraction", minutes: 20, color: PURPLE },
      { label: "Confusion matrix", minutes: 30, color: GREEN },
      { label: "Generalisation", minutes: 25, color: AMBER },
    ],
    tools: ["Confusion matrix explorer", "Gesture reaction game"],
    outcome: "Students fill in a blank 6×6 confusion matrix by hand, then verify against the interactive explorer and write one sentence explaining each misclassification in biomechanical terms.",
    differentiation: "Reduce to 3 gestures for lower grades. Extension: calculate F1 score for each gesture class and rank by difficulty.",
    color: BLUE,
    icon: IconBrain,
  },
  {
    slug: "/educators/lesson-applications-ethics",
    num: "03",
    grade: "Grades 7–11",
    subject: "Technology · Ethics · Biology",
    duration: "60 min",
    difficulty: "Beginner-friendly",
    title: "EMG in the real world: applications and bioethics",
    summary: "Students explore where EMG technology is deployed today, evaluate what 84.85% accuracy means for real people, and debate who benefits — and who doesn't — when technology listens to your body.",
    objectives: [
      "EMG applications across prosthetics, gaming, and rehab",
      "Accuracy as a stakeholder-dependent concept",
      "Bias, access, and consent in biometric technology",
    ],
    phases: [
      { label: "Applications tour", minutes: 15, color: PURPLE },
      { label: "What does 84% mean?", minutes: 15, color: AMBER },
      { label: "Structured debate", minutes: 20, color: PINK },
      { label: "Written reflection", minutes: 10, color: GREEN },
    ],
    tools: ["Confusion matrix explorer"],
    outcome: "A one-page position paper: should EMG prosthetics require a minimum accuracy threshold before clinical use? Must cite at least one number from the confusion matrix explorer.",
    differentiation: "Provide sentence starters for the position paper. Extension: students research one real news story about biometric data misuse and connect it to the lesson.",
    color: PURPLE,
    icon: IconPuzzle,
  },
]

const RESOURCE_CARD = {
  slug: "/educators/resources",
  grade: "All levels",
  subject: "Cross-curricular",
  duration: "Reference",
  title: "Educator resource library",
  summary: "Printable handouts, slide deck templates, assessment rubrics, Ninapro dataset downloads, and curriculum alignment guides.",
  items: [
    { Icon: IconDocument,  label: "Student handouts", desc: "Print-ready worksheets for all 3 lessons" },
    { Icon: IconBarChart,  label: "Slide decks", desc: "Editable keynote + PPTX for each lesson" },
    { Icon: IconClipboard, label: "Assessment rubrics", desc: "Marking guides with performance descriptors" },
    { Icon: IconDatabase,  label: "Dataset access", desc: "Pre-filtered Ninapro DB5 CSV for classroom use" },
    { Icon: IconMap,       label: "Curriculum maps", desc: "Detailed alignment for 5 major frameworks" },
    { Icon: IconBook,      label: "Teacher guides", desc: "Step-by-step facilitation notes per lesson" },
  ],
  color: GREEN,
  icon: IconBook,
}

const SUBJECTS = [
  { icon: IconMicroscope, label: "Biology",          desc: "Motor neurons, muscle contraction, the neuromuscular junction — EMG makes the invisible visible." },
  { icon: IconGear,       label: "Physics",           desc: "Signal amplitude, frequency, noise filtering — real physics in a biological context." },
  { icon: IconLaptop,     label: "Computer Science",  desc: "Classification, feature extraction, event-driven programming, ML fundamentals." },
  { icon: IconBarChart,   label: "Data Science",      desc: "Real 16-channel, 200Hz datasets. Students clean, visualise, and model genuine research data." },
  { icon: IconHandshake,  label: "Ethics",            desc: "Biometric data, accessibility, who benefits from technology — rich ethical discussion material." },
  { icon: IconMedical,    label: "Health & Tech",     desc: "Assistive technology, motor impairment, and the engineering of prosthetics and interfaces." },
]

const TEASER_QUESTIONS = [
  {
    question: "Surface EMG electrodes measure electrical activity in:",
    options: ["The brain", "Muscle fibres beneath the skin", "Blood vessels", "The peripheral nerves directly"],
    correct: 1,
    explanation: "Surface electrodes pick up the summed electrical activity of muscle fibre action potentials through the skin. Brain and nerve signals require more invasive approaches."
  },
  {
    question: "myojam achieves what cross-subject classification accuracy?",
    options: ["72.3%", "84.85%", "91.2%", "78.5%"],
    correct: 1,
    explanation: "84.85% cross-subject accuracy — tested on people the model has never seen — on Ninapro DB5 across 10 subjects and 6 gesture classes."
  },
  {
    question: "Which tool lets students see exactly which gestures the classifier confuses and why?",
    options: ["The signal playground", "The gesture reaction game", "The EMG frequency analyzer", "The confusion matrix explorer"],
    correct: 3,
    explanation: "The confusion matrix explorer shows an interactive heatmap of cross-subject accuracy. Clicking any cell reveals how often one gesture is mistaken for another, along with the biomechanical reason."
  },
]

// ── Phase bar ────────────────────────────────────────────────────────────────
function PhaseBar({ phases }) {
  const total = phases.reduce((s, p) => s + p.minutes, 0)
  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 7 }}>Lesson timeline</div>
      <div style={{ display: "flex", height: 7, borderRadius: 99, overflow: "hidden", marginBottom: 9, gap: 2 }}>
        {phases.map((p, i) => (
          <div key={i} style={{ flex: p.minutes, background: p.color, opacity: 0.8, borderRadius: 99 }}/>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px" }}>
        {phases.map((p, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, flexShrink: 0 }}/>
            <span style={{ fontSize: 10.5, color: "var(--text-tertiary)", fontWeight: 300 }}>
              {p.label} <strong style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{p.minutes}m</strong>
            </span>
          </div>
        ))}
        <span style={{ fontSize: 10.5, color: "var(--text-tertiary)", fontWeight: 300, marginLeft: 4 }}>= {total} min total</span>
      </div>
    </div>
  )
}

// ── Lesson card ───────────────────────────────────────────────────────────────
function LessonCard({ lesson, navigate }) {
  const [open, setOpen] = useState(false)
  const c = lesson.color
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: `1px solid ${c}28`, background: "var(--bg)", transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = `${c}55`}
      onMouseLeave={e => e.currentTarget.style.borderColor = `${c}28`}>

      {/* Header strip */}
      <div style={{ background: `linear-gradient(120deg, ${c}10 0%, transparent 70%)`, padding: "26px 28px 20px", borderBottom: `1px solid ${c}18` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: `${c}18`, border: `1px solid ${c}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <lesson.icon size={22} color={c}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 9 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: c, background: `${c}15`, border: `1px solid ${c}30`, borderRadius: 100, padding: "2px 10px" }}>Lesson {lesson.num}</span>
              <span style={{ fontSize: 10, color: "var(--text-tertiary)", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 100, padding: "2px 10px" }}>{lesson.grade}</span>
              <span style={{ fontSize: 10, color: "var(--text-tertiary)", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 100, padding: "2px 10px" }}>⏱ {lesson.duration}</span>
              <span style={{ fontSize: 10, color: "var(--text-tertiary)", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 100, padding: "2px 10px" }}>{lesson.difficulty}</span>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.3px", lineHeight: 1.3, marginBottom: 8 }}>{lesson.title}</h3>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, margin: 0 }}>{lesson.summary}</p>
          </div>
        </div>
      </div>

      {/* Phase bar + objectives row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        <div style={{ padding: "18px 28px", borderRight: `1px solid ${c}12` }}>
          <PhaseBar phases={lesson.phases}/>
        </div>
        <div style={{ padding: "18px 28px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 9 }}>Learning objectives</div>
          <div style={{ display: "grid", gap: 5 }}>
            {lesson.objectives.map(o => (
              <div key={o} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                <span style={{ color: c, fontSize: 11, marginTop: 1, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 11.5, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.5 }}>{o}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tools used strip */}
      <div style={{ padding: "12px 28px", borderTop: `1px solid ${c}12`, background: `${c}04`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Tools used</span>
        {lesson.tools.map(t => (
          <span key={t} style={{ fontSize: 10.5, color: c, background: `${c}12`, border: `1px solid ${c}25`, borderRadius: 6, padding: "2px 10px", fontWeight: 500 }}>{t}</span>
        ))}
        <button onClick={() => setOpen(o => !o)} style={{ marginLeft: "auto", background: "none", border: `1px solid ${c}30`, borderRadius: 100, padding: "4px 14px", fontSize: 11, color: c, cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = `${c}10`}
          onMouseLeave={e => e.currentTarget.style.background = "none"}>
          {open ? "Less ↑" : "Details ↓"}
        </button>
      </div>

      {/* Expandable: student outcome + differentiation + CTA */}
      {open && (
        <div style={{ borderTop: `1px solid ${c}18`, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          <div style={{ padding: "20px 28px", borderRight: `1px solid ${c}12` }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: c, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>What students produce</div>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, margin: 0 }}>{lesson.outcome}</p>
          </div>
          <div style={{ padding: "20px 28px" }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Differentiation</div>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, margin: "0 0 16px" }}>{lesson.differentiation}</p>
            <button onClick={() => navigate(lesson.slug)} style={{ background: c, color: "#fff", border: "none", borderRadius: 100, padding: "9px 22px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
              Open full lesson →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Educators() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", overflowX: "clip" }}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <Navbar/>

      {/* ── Hero ── */}
      <section style={{ position: "relative", padding: "120px 32px 80px", overflow: "hidden", borderBottom: "1px solid var(--border)" }}>
        <NeuralNoise color={[0.06, 0.72, 0.40]} opacity={0.85} speed={0.0006}/>
        <div style={{ position: "absolute", inset: 0, background: "rgba(3,0,18,0.65)", zIndex: 1 }}/>
        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.35)", borderRadius: 100, padding: "6px 16px", fontSize: 13, color: GREEN, fontWeight: 500, marginBottom: 28, animation: "fadeUp 0.5s ease" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: GREEN, display: "inline-block" }}/>
            Free · Open access · Curriculum-aligned
          </div>
          <h1 style={{ fontSize: "clamp(38px,6vw,68px)", fontWeight: 700, letterSpacing: "-2.5px", lineHeight: 1.05, color: "#fff", marginBottom: 20, animation: "fadeUp 0.5s 0.08s ease both" }}>
            Bring EMG science<br/>into your<br/><span style={{ color: GREEN }}>classroom.</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.68)", fontWeight: 300, lineHeight: 1.8, maxWidth: 540, marginBottom: 40, animation: "fadeUp 0.5s 0.16s ease both" }}>
            Three ready-to-run lesson plans, real 16-channel datasets, and four browser-based tools for teaching neuroscience, machine learning, and assistive technology — from middle school to university. No hardware. No prior EMG experience needed.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", animation: "fadeUp 0.5s 0.24s ease both" }}>
            <a href="#lessons" style={{ background: GREEN, color: "#fff", borderRadius: 100, padding: "13px 32px", fontSize: 14, fontWeight: 600, textDecoration: "none", boxShadow: `0 4px 20px ${GREEN}40`, transition: "transform 0.2s,box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = `0 8px 28px ${GREEN}55` }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = `0 4px 20px ${GREEN}40` }}>
              Browse lesson plans ↓
            </a>
            <button onClick={() => navigate("/educators/resources")} style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 100, padding: "13px 28px", fontSize: 14, fontWeight: 400, cursor: "pointer", fontFamily: "var(--font)", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"}>
              Resource library →
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 32px", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          {[
            { val: "3", label: "Lesson plans", sub: "75–90 min each" },
            { val: "6", label: "Curriculum frameworks", sub: "Ontario · NGSS · IB · AP · Cambridge" },
            { val: "0", label: "Hardware required", sub: "Everything runs in the browser" },
            { val: "7–Uni", label: "Grade range", sub: "Differentiation included" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "24px 0", borderRight: i < 3 ? "1px solid var(--border)" : "", paddingLeft: i > 0 ? 28 : 0, paddingRight: i < 3 ? 28 : 0 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: GREEN, letterSpacing: "-1px", lineHeight: 1, marginBottom: 3 }}>{s.val}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 1 }}>{s.label}</div>
              <div style={{ fontSize: 10.5, color: "var(--text-tertiary)", fontWeight: 300 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Designed for non-specialists ── */}
      <section style={{ padding: "64px 32px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>For teachers</SectionPill>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, letterSpacing: "-1px", color: "var(--text)", marginBottom: 10 }}>You don't need to know EMG to teach it.</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, marginBottom: 36, maxWidth: 520 }}>
              Every lesson includes a step-by-step teacher guide written for educators without a signal processing background. The science is explained in the materials — your job is to facilitate the conversation.
            </p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
            {[
              {
                step: "01",
                title: "Pick your lesson",
                body: "Each plan targets a different subject area and grade band. The curriculum alignment table tells you exactly which standards it covers.",
                color: PINK,
              },
              {
                step: "02",
                title: "Preview the tools yourself",
                body: "The four interactive demos take about 15 minutes to explore. No installation — open the browser, try the confusion matrix, close the tab.",
                color: BLUE,
              },
              {
                step: "03",
                title: "Print the handouts",
                body: "Student worksheets, slide decks, and teacher facilitation notes are in the resource library as a single ZIP. Print or share digitally.",
                color: PURPLE,
              },
              {
                step: "04",
                title: "Run the lesson",
                body: "The teacher guide covers every transition, likely student questions, and common misconceptions — annotated with timing suggestions.",
                color: AMBER,
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div style={{ padding: "22px 24px", borderRadius: 14, border: `1px solid ${item.color}22`, background: "var(--bg-secondary)", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 12, right: 16, fontSize: 48, fontWeight: 900, color: `${item.color}08`, lineHeight: 1, letterSpacing: "-2px", userSelect: "none" }}>{item.step}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: item.color, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Step {item.step}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 7, letterSpacing: "-0.2px" }}>{item.title}</div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, margin: 0 }}>{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subject areas ── */}
      <section style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "64px 32px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Cross-curricular</SectionPill>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, letterSpacing: "-1px", color: "var(--text)", marginBottom: 10 }}>One project. Six subject areas.</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, marginBottom: 32, maxWidth: 480 }}>
              EMG sits at the intersection of biology, physics, computer science, and ethics. A single lesson plan can satisfy multiple departments.
            </p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {SUBJECTS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.05}>
                <div style={{ background: "var(--bg)", borderRadius: 14, border: "1px solid var(--border)", padding: "22px", transition: "border-color 0.2s, transform 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.transform = "translateY(-2px)" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <s.icon size={20} color="var(--accent)"/>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 5 }}>{s.label}</div>
                  <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.65, fontWeight: 300, margin: 0 }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Curriculum alignment ── */}
      <section style={{ borderBottom: "1px solid var(--border)", padding: "64px 32px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Standards alignment</SectionPill>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, letterSpacing: "-1px", color: "var(--text)", marginBottom: 10 }}>Mapped to curriculum standards.</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, marginBottom: 28, maxWidth: 520 }}>
              All three lessons are aligned to major curriculum frameworks. Use this table when writing your unit plan or seeking administration approval.
            </p>
            <div style={{ border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
                {["Framework", "L1 — EMG Basics", "L2 — Classifier", "L3 — Ethics"].map((h, i) => (
                  <div key={h} style={{ padding: "12px 18px", fontSize: 10.5, fontWeight: 700, color: i === 0 ? "var(--text)" : [PINK, BLUE, PURPLE][i - 1], textTransform: "uppercase", letterSpacing: "0.06em", borderRight: i < 3 ? "1px solid var(--border)" : "" }}>{h}</div>
                ))}
              </div>
              {[
                { framework: "Ontario Science (Gr 9–12)", sub: "Biology SBI3U · Physics SPH3U", l1: "SBI3U E2.1, E2.4 — nerve impulse, muscle contraction", l2: "SPH3U — data analysis, signal processing", l3: "SNC2D — technology and society" },
                { framework: "NGSS (US)", sub: "HS-LS1 · HS-PS4 · HS-ETS1", l1: "HS-LS1-2 — cell specialisation, electrical signalling", l2: "HS-PS4-5 — data analysis, pattern recognition", l3: "HS-ETS1-1 — criteria, constraints, societal impact" },
                { framework: "IB Biology / Computer Science", sub: "SL/HL Topic 6 · CS Option D", l1: "Topic 6.5 — neurons and synapses", l2: "CS Option D — machine learning, patterns", l3: "Topic 11.4 — bioethics and medical technology" },
                { framework: "AP Computer Science Principles", sub: "Big Ideas 2, 4, 5", l1: "—", l2: "BI-4 (algorithms) · BI-2 (data representation)", l3: "BI-5 — societal impacts of computing" },
                { framework: "Cambridge IGCSE / A-Level", sub: "Biology · Computer Science", l1: "A-Level Bio Ch.15 — coordination and response", l2: "IGCSE CS §2 — data, algorithms", l3: "A-Level Bio Ch.16 — nervous system and ethics" },
              ].map(({ framework, sub, l1, l2, l3 }, ri) => (
                <div key={framework} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", borderBottom: ri < 4 ? "1px solid var(--border)" : "", background: ri % 2 === 0 ? "var(--bg)" : "var(--bg-secondary)" }}>
                  <div style={{ padding: "14px 18px", borderRight: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{framework}</div>
                    <div style={{ fontSize: 10.5, color: "var(--text-tertiary)", fontWeight: 300 }}>{sub}</div>
                  </div>
                  {[l1, l2, l3].map((val, ci) => (
                    <div key={ci} style={{ padding: "14px 18px", fontSize: 11, color: val === "—" ? "var(--text-tertiary)" : "var(--text-secondary)", fontWeight: 300, lineHeight: 1.6, borderRight: ci < 2 ? "1px solid var(--border)" : "" }}>{val}</div>
                  ))}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11.5, color: "var(--text-tertiary)", fontWeight: 300, marginTop: 10 }}>
              Contact us for a detailed mapping to frameworks not listed above.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Lesson plans ── */}
      <section id="lessons" style={{ padding: "64px 32px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Lesson plans</SectionPill>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 700, letterSpacing: "-1px", color: "var(--text)", marginBottom: 8 }}>Ready to teach this week.</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, marginBottom: 32, maxWidth: 480 }}>
              Each card shows the full lesson timeline, learning objectives, tools used, and what students produce. Click "Details" to see differentiation strategies.
            </p>
          </Reveal>
          <div style={{ display: "grid", gap: 16 }}>
            {LESSONS.map((lesson, i) => (
              <Reveal key={lesson.slug} delay={i * 0.06}>
                <LessonCard lesson={lesson} navigate={navigate}/>
              </Reveal>
            ))}
          </div>

          {/* Resource library card */}
          <Reveal delay={0.18}>
            <div style={{ marginTop: 16, borderRadius: 16, border: `1px solid ${GREEN}28`, background: "var(--bg-secondary)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "22px 28px", borderBottom: `1px solid ${GREEN}15` }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${GREEN}15`, border: `1px solid ${GREEN}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IconBook size={20} color={GREEN}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 7, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: GREEN, background: `${GREEN}15`, border: `1px solid ${GREEN}30`, borderRadius: 100, padding: "2px 10px" }}>Resource library</span>
                    <span style={{ fontSize: 10, color: "var(--text-tertiary)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 100, padding: "2px 10px" }}>All levels</span>
                    <span style={{ fontSize: 10, color: "var(--text-tertiary)", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 100, padding: "2px 10px" }}>Reference</span>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.2px", margin: "0 0 4px" }}>{RESOURCE_CARD.title}</h3>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.65, margin: 0 }}>{RESOURCE_CARD.summary}</p>
                </div>
                <button onClick={() => navigate(RESOURCE_CARD.slug)} style={{ flexShrink: 0, background: GREEN, color: "#fff", border: "none", borderRadius: 100, padding: "9px 20px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font)", transition: "opacity 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                  Open library →
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
                {RESOURCE_CARD.items.map((item, i) => (
                  <div key={i} style={{ padding: "16px 20px", borderRight: i % 3 < 2 ? `1px solid ${GREEN}12` : "", borderBottom: i < 3 ? `1px solid ${GREEN}12` : "", display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ flexShrink: 0 }}><item.Icon size={18} color={GREEN}/></div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Quiz ── */}
      <section style={{ padding: "0 32px 48px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Test yourself</SectionPill>
            <h2 style={{ fontSize: "clamp(20px,3vw,30px)", fontWeight: 700, letterSpacing: "-0.8px", color: "var(--text)", marginBottom: 6 }}>How much do you already know?</h2>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, marginBottom: 0 }}>
              A 3-question preview. Full quizzes are built into each lesson plan.
            </p>
          </Reveal>
          <Quiz title="EMG & myojam — quick preview" questions={TEASER_QUESTIONS} accentColor={GREEN}/>
        </div>
      </section>

      {/* ── CTA / contact ── */}
      <section style={{ padding: "0 32px 80px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Reveal>
            <div style={{ background: `linear-gradient(135deg, ${GREEN}08 0%, transparent 100%)`, border: `1px solid ${GREEN}20`, borderRadius: 18, padding: "44px 48px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: GREEN, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Get in touch</div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.5px", marginBottom: 10 }}>Used myojam in a classroom?</h3>
                  <p style={{ fontSize: 13.5, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, marginBottom: 20 }}>
                    We're actively developing new lessons. If you've run one of these plans and have feedback — what worked, what didn't, what your students asked — we'd genuinely like to hear it.
                  </p>
                  <div style={{ display: "grid", gap: 8 }}>
                    {[
                      "New lessons in development for Grades 7–8",
                      "Seeking teachers for early access review",
                      "All feedback shapes future content",
                    ].map(item => (
                      <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: GREEN, fontSize: 12, marginTop: 1 }}>✓</span>
                        <span style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 300 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <ContactForm
                  source="educators"
                  namePlaceholder="Your name"
                  emailPlaceholder="your@school.edu"
                  messagePlaceholder="Tell us how you used myojam and what worked."
                  submitLabel="Share your experience"
                  padding="0"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer/>
    </div>
  )
}
