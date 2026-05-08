import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import LiquidChrome from "./components/LiquidChrome"

const PINK   = "#FF2D78"
const BLUE   = "#3B82F6"
const GREEN  = "#10B981"
const PURPLE = "#8B5CF6"
const AMBER  = "#F59E0B"

const PATHS = [
  {
    id: "no-hardware",
    color: PINK,
    emoji: "⚡",
    title: "Try it now",
    sub: "No hardware needed",
    time: "2 min",
    desc: "Jump straight into the demo. Use real EMG data recorded from actual subjects and see the gesture classifier work live in your browser.",
    steps: [
      {
        num: "01",
        title: "Open the demo",
        body: "Pick any of the 6 gestures and watch the classifier predict it in real time. Switch between gestures to see how the signal changes.",
        href: "/demos",
        cta: "Go to demos",
        external: false,
      },
      {
        num: "02",
        title: "Draw your own signal",
        body: "In the Signal Playground, sketch a waveform with your mouse. Watch the 4 features (MAV, RMS, WL, ZCR) update live as you draw.",
        href: "/playground",
        cta: "Open playground",
        external: false,
      },
      {
        num: "03",
        title: "Understand what just happened",
        body: "The EMG Explainer walks through the full signal chain — from muscle fibre to gesture prediction — in about 8 minutes.",
        href: "/education/emg-explainer",
        cta: "Read the explainer",
        external: false,
      },
    ],
  },
  {
    id: "hardware",
    color: BLUE,
    emoji: "🔌",
    title: "Use real muscles",
    sub: "MyoWare 2.0 + Arduino",
    time: "~30 min setup",
    desc: "Wire up a MyoWare 2.0 sensor and classify gestures from your own forearm. About $68 in parts, no soldering required.",
    steps: [
      {
        num: "01",
        title: "Get the parts",
        body: "MyoWare 2.0 sensor, an Arduino Uno R3, and three Ag/AgCl electrodes. Full bill of materials with exact part names and prices.",
        href: "/education/build-your-own",
        cta: "Parts list & costs",
        external: false,
      },
      {
        num: "02",
        title: "Wire it up",
        body: "Three jumper wires: SIG → A0, VCC → 3.3V, GND → GND. Follow the wiring diagram and electrode placement guide step by step.",
        href: "/education/build-your-own",
        cta: "Wiring diagram",
        external: false,
      },
      {
        num: "03",
        title: "Flash the firmware",
        body: "Copy the Arduino sketch from the guide (< 20 lines). Flash via Arduino IDE. Open Serial Monitor at 9600 baud to verify output.",
        href: "/education/build-your-own",
        cta: "Get the firmware",
        external: false,
      },
      {
        num: "04",
        title: "Open Live Signal mode",
        body: "Connect via USB serial, open Live Signal, and watch the classifier respond to your actual gestures in real time.",
        href: "/signal",
        cta: "Open Live Signal",
        external: false,
      },
    ],
  },
  {
    id: "developer",
    color: PURPLE,
    emoji: "🛠",
    title: "Build on it",
    sub: "Fork, extend, or integrate",
    time: "Varies",
    desc: "Dig into the research, explore the full pipeline interactively, or clone the repo and start building on top of the classifier.",
    steps: [
      {
        num: "01",
        title: "Read the research",
        body: "Understand the design decisions behind myojam: 84.85% cross-subject accuracy, LOSO validation on Ninapro DB5, and the latency-accuracy trade-off.",
        href: "/research",
        cta: "View research",
        external: false,
      },
      {
        num: "02",
        title: "Walk the pipeline interactively",
        body: "The Pipeline Explorer shows each step — raw signal, bandpass filter, windowing, feature extraction, classifier — with real data you can inspect.",
        href: "/pipeline",
        cta: "Pipeline explorer",
        external: false,
      },
      {
        num: "03",
        title: "Reproduce the results",
        body: "Every accuracy number in the paper is reproducible. The Ninapro DB5 dataset is freely available; the feature extraction code is in the repo.",
        href: "https://ninapro.hevs.ch",
        cta: "Get Ninapro DB5",
        external: true,
      },
      {
        num: "04",
        title: "Clone the repo",
        body: "Open source on GitHub. Issues are tagged by difficulty. Fork it, break it, extend it — that's the point.",
        href: "https://github.com/Jaden300/myojam",
        cta: "View on GitHub",
        external: true,
      },
    ],
  },
  {
    id: "educator",
    color: GREEN,
    emoji: "📋",
    title: "Teach with myojam",
    sub: "Classroom-ready",
    time: "Free",
    desc: "Three structured lesson plans, NGSS/AP/IB aligned, with interactive tools that run in any browser. No hardware required to teach the concepts.",
    steps: [
      {
        num: "01",
        title: "Preview the student tools",
        body: "The demo and Signal Playground work in any browser with no install. Try them yourself before class — they're what students will use.",
        href: "/demos",
        cta: "Preview tools",
        external: false,
      },
      {
        num: "02",
        title: "Browse the lesson plans",
        body: "Three 75-minute lessons: EMG basics, gesture classification, and applications & ethics. Each has teacher notes, differentiation strategies, and an exit quiz.",
        href: "/educators",
        cta: "Educator hub",
        external: false,
      },
      {
        num: "03",
        title: "Download resources",
        body: "Curriculum alignment tables (NGSS, AP Bio, IB, Common Core), dataset links, and a quickstart guide for getting your class running in one period.",
        href: "/educators/resources",
        cta: "Educator resources",
        external: false,
      },
    ],
  },
]

const QUICK_FACTS = [
  { val: "84.85%", label: "Cross-subject accuracy", sub: "10-subject LOSO on Ninapro DB5", color: PINK },
  { val: "6",      label: "Gestures classified",    sub: "Index, middle, ring, pinky, thumb, fist", color: BLUE },
  { val: "$68",    label: "Hardware cost",           sub: "MyoWare 2.0 + Arduino + electrodes", color: GREEN },
  { val: "100%",   label: "Open source",             sub: "MIT licensed, free forever", color: PURPLE },
]

function StepRow({ step, color, isLast }) {
  const navigate = useNavigate()
  function go() {
    if (step.external) window.open(step.href, "_blank", "noopener")
    else navigate(step.href)
  }
  return (
    <div style={{ display: "flex", gap: 20, paddingBottom: isLast ? 0 : 28, position: "relative" }}>
      {!isLast && (
        <div style={{ position: "absolute", left: 18, top: 36, bottom: 0, width: 1, background: `${color}28` }} />
      )}
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${color}18`, border: `1.5px solid ${color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>
        {step.num}
      </div>
      <div style={{ paddingTop: 4, flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{step.title}</div>
        <p style={{ fontSize: 13.5, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, margin: "0 0 12px" }}>{step.body}</p>
        <button
          onClick={go}
          style={{ background: "none", border: `1px solid ${color}50`, borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 500, color, cursor: "pointer", fontFamily: "var(--font)", display: "inline-flex", alignItems: "center", gap: 6, transition: "background 0.15s, border-color 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.background = `${color}12`; e.currentTarget.style.borderColor = color }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = `${color}50` }}
        >
          {step.cta}
          <span style={{ fontSize: 10, opacity: 0.8 }}>{step.external ? "↗" : "→"}</span>
        </button>
      </div>
    </div>
  )
}

function PathCard({ path, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: selected ? `${path.color}0e` : "var(--bg)",
        border: `1.5px solid ${selected ? path.color : "var(--border)"}`,
        borderRadius: 16,
        padding: "22px 20px",
        cursor: "pointer",
        fontFamily: "var(--font)",
        textAlign: "left",
        width: "100%",
        transition: "border-color 0.18s, background 0.18s, transform 0.15s",
        transform: selected ? "translateY(-2px)" : "translateY(0)",
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = `${path.color}60`; e.currentTarget.style.transform = "translateY(-1px)" } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)" } }}
    >
      <div style={{ fontSize: 24, marginBottom: 10 }}>{path.emoji}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: selected ? path.color : "var(--text)", marginBottom: 3, transition: "color 0.18s" }}>{path.title}</div>
      <div style={{ fontSize: 12, color: selected ? path.color : "var(--text-tertiary)", fontWeight: 400, marginBottom: 10, transition: "color 0.18s" }}>{path.sub}</div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: selected ? `${path.color}18` : "var(--bg-secondary)", border: `1px solid ${selected ? path.color + "40" : "var(--border)"}`, borderRadius: 100, padding: "3px 10px", fontSize: 11, color: selected ? path.color : "var(--text-tertiary)", fontWeight: 500, transition: "all 0.18s" }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: selected ? path.color : "var(--text-tertiary)", flexShrink: 0, transition: "background 0.18s" }} />
        {path.time}
      </div>
    </button>
  )
}

export default function GetStarted() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(0)
  const [stepsVisible, setStepsVisible] = useState(true)

  function selectPath(idx) {
    if (idx === selected) return
    setStepsVisible(false)
    setTimeout(() => { setSelected(idx); setStepsVisible(true) }, 160)
  }

  const active = PATHS[selected]

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--border)", padding: "100px 32px 72px" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <LiquidChrome baseColor={[0.07, 0.0, 0.18]} speed={0.12} amplitude={0.2} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "rgba(3,0,18,0.62)", zIndex: 1 }} />
        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,45,120,0.3)", borderRadius: 100, padding: "5px 16px", fontSize: 13, color: PINK, fontWeight: 500, marginBottom: 24 }}>
            Get started
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 54px)", fontWeight: 600, letterSpacing: "-1.5px", color: "#fff", lineHeight: 1.08, marginBottom: 20 }}>
            Not sure where<br />
            <span style={{ color: PINK }}>to begin?</span>
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.72)", fontWeight: 300, lineHeight: 1.75, maxWidth: 520, margin: 0 }}>
            myojam works at every level — from a 2-minute browser demo to a full hardware build. Pick the path that fits where you are right now.
          </p>
        </div>
      </div>

      {/* Quick facts strip */}
      <div style={{ borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
        {QUICK_FACTS.map((f, i) => (
          <div key={f.label} style={{ padding: "20px 24px", borderRight: i < 3 ? "1px solid var(--border)" : "none", textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: f.color, letterSpacing: "-0.5px", marginBottom: 3 }}>{f.val}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{f.label}</div>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 300 }}>{f.sub}</div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "64px 32px 80px" }}>

        {/* Path picker label */}
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
          Choose your path
        </div>

        {/* Path cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 40 }}>
          {PATHS.map((path, i) => (
            <PathCard key={path.id} path={path} selected={selected === i} onClick={() => selectPath(i)} />
          ))}
        </div>

        {/* Steps panel */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>

          {/* Left: description + steps */}
          <div
            style={{
              opacity: stepsVisible ? 1 : 0,
              transform: stepsVisible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.18s ease, transform 0.18s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${active.color}18`, border: `1.5px solid ${active.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                {active.emoji}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{active.title}</div>
                <div style={{ fontSize: 12, color: active.color, fontWeight: 400 }}>{active.sub}</div>
              </div>
            </div>

            <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.8, margin: "0 0 28px", borderLeft: `3px solid ${active.color}`, paddingLeft: 14 }}>
              {active.desc}
            </p>

            <div>
              {active.steps.map((step, i) => (
                <StepRow key={step.num} step={step} color={active.color} isLast={i === active.steps.length - 1} />
              ))}
            </div>
          </div>

          {/* Right: context panel */}
          <div
            style={{
              opacity: stepsVisible ? 1 : 0,
              transform: stepsVisible ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.22s ease 0.04s, transform 0.22s ease 0.04s",
            }}
          >
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px", marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                What myojam actually is
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { icon: "〜", color: PINK,   text: "A surface EMG signal is the electrical activity of your muscles, measured from the skin surface. It looks like noise — until you filter and window it." },
                  { icon: "⊞", color: BLUE,   text: "myojam extracts 4 time-domain features (MAV, RMS, WL, ZCR) from each 1-second window across 16 electrode channels — 64 numbers total." },
                  { icon: "🌲", color: GREEN,  text: "A 500-tree Random Forest classifies those 64 numbers into one of 6 gestures. It was trained on 10 subjects from Ninapro DB5 under LOSO cross-validation." },
                  { icon: "⚠", color: AMBER,  text: "Honest limitation: 84.85% across subjects. Move electrodes 1 cm and it drops ~15 pp. Real prosthetic use would require per-user calibration." },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: `${item.color}18`, border: `1px solid ${item.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: item.color, flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <p style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, margin: 0 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Jump to other paths */}
            <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 24px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
                Other paths
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PATHS.filter((_, i) => i !== selected).map((path, i) => {
                  const originalIdx = PATHS.indexOf(path)
                  return (
                    <button
                      key={path.id}
                      onClick={() => selectPath(originalIdx)}
                      style={{ background: "none", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", cursor: "pointer", fontFamily: "var(--font)", textAlign: "left", display: "flex", alignItems: "center", gap: 10, transition: "border-color 0.15s, background 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${path.color}60`; e.currentTarget.style.background = `${path.color}06` }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "none" }}
                    >
                      <span style={{ fontSize: 16 }}>{path.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{path.title}</div>
                        <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300 }}>{path.sub} · {path.time}</div>
                      </div>
                      <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>→</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA strip */}
        <div style={{ marginTop: 64, borderTop: "1px solid var(--border)", paddingTop: 40, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Still have questions?</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300 }}>The contact page has categorised inboxes for research, hardware, and collaboration questions.</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <button
              onClick={() => navigate("/contact")}
              style={{ background: "none", border: "1px solid var(--border)", borderRadius: 100, padding: "9px 20px", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font)", transition: "border-color 0.15s, color 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)" }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)" }}
            >
              Contact us
            </button>
            <button
              onClick={() => navigate("/how-it-works")}
              style={{ background: "var(--accent)", border: "none", borderRadius: 100, padding: "9px 20px", fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer", fontFamily: "var(--font)", transition: "opacity 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              How it works →
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
