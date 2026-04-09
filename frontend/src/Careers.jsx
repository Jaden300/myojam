import { useEffect, useRef, useState } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { IconBolt, IconBrain, IconCode, IconChart } from "./Icons"

function FloatingOrb({ size, x, y, delay, color }) {
  return (
    <div style={{
      position: "absolute",
      width: size, height: size,
      borderRadius: "50%",
      background: color,
      left: x, top: y,
      filter: "blur(60px)",
      opacity: 0.35,
      animation: `orbFloat 8s ${delay}s ease-in-out infinite alternate`,
      pointerEvents: "none"
    }}/>
  )
}

const REASONS = [
  { Icon: IconBolt, title: "Real impact, real users", body: "myojam isn't a toy project. It's assistive technology people actually use. Your work directly affects how people with motor impairments interact with computers." },
  { Icon: IconBrain, title: "Cutting-edge research stack", body: "Work at the intersection of biosignal processing, machine learning, and human-computer interaction. Ninapro datasets, Random Forest classifiers, real-time EMG pipelines." },
  { Icon: IconCode, title: "Fully open source", body: "Everything we build is public. Your contributions are visible to the world — a portfolio piece that speaks for itself on any application." },
  { Icon: IconChart, title: "Move fast", body: "Small team, no bureaucracy. If you have an idea on Monday, it can be in production by Friday. We value execution over process." },
]

const ROLES = [
  {
    title:"ML Research Contributor",
    type:"Volunteer · Remote",
    tags:["Python","scikit-learn","EMG","Signal Processing"],
    desc:"Help improve the gesture classifier — better features, new architectures, cross-subject adaptation. You'll work directly with Ninapro DB5 and real sensor data.",
  },
  {
    title:"Frontend Developer",
    type:"Volunteer · Remote",
    tags:["React","Three.js","Vite","CSS"],
    desc:"Build new interactive features for myojam.com. The signal playground, education hub, and 3D hand model are good examples of what we make.",
  },
  {
    title:"Hardware Engineer",
    type:"Volunteer · Remote",
    tags:["Arduino","MyoWare","Embedded C","Signal Acquisition"],
    desc:"Improve the Arduino firmware, explore higher-density electrode configurations, and help make the hardware setup more accessible to new users.",
  },
  {
    title:"Biomedical Research Contributor",
    type:"Volunteer · Remote",
    tags:["Neuroscience","EMG","Research Methods","Academic Writing"],
    desc:"Contribute to the scientific documentation of myojam's methodology. Help design experiments, review signal processing decisions, and improve cross-subject generalisation.",
  },
  {
    title:"Technical Writer",
    type:"Volunteer · Remote",
    tags:["Documentation","Markdown","API docs","Education"],
    desc:"Write and maintain technical documentation — API references, setup guides, hardware walkthroughs, and tutorials. Make the project accessible to people at every skill level.",
  },
  {
    title:"Education Content Creator",
    type:"Volunteer · Remote",
    tags:["Curriculum Design","Biology","CS Education","Writing"],
    desc:"Develop lesson plans, articles, and educational resources for the myojam educators hub. Background in science communication, biology, or computer science education is a plus.",
  },
  {
    title:"iOS / Android Developer",
    type:"Volunteer · Remote",
    tags:["React Native","iOS","Android","Bluetooth"],
    desc:"Build a companion mobile app for monitoring gesture classification in real time — current gesture, confidence score, and session statistics over Bluetooth.",
  },
  {
    title:"UX / Accessibility Researcher",
    type:"Volunteer · Remote",
    tags:["UX Research","Accessibility","User Testing","A11y"],
    desc:"Conduct user research with people who have motor impairments, evaluate the usability of myojam's interfaces, and recommend improvements grounded in real user needs.",
  },
  {
    title:"Community Manager",
    type:"Volunteer · Remote",
    tags:["Community","Social Media","Outreach","Writing"],
    desc:"Help grow the myojam community — manage communications, coordinate ELEVATE competition participants, support the Discord, and amplify the project's reach.",
  },
  {
    title:"Windows / Linux Port Contributor",
    type:"Volunteer · Remote",
    tags:["Python","PyQt6","Windows","Linux","Cross-platform"],
    desc:"The desktop app currently only supports macOS due to cliclick and osascript dependencies. Help build a cross-platform input layer so myojam works on Windows and Linux.",
  },
]

export default function Careers() {
  const [visible, setVisible] = useState({})
  const refs = useRef({})

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) setVisible(v => ({ ...v, [e.target.dataset.key]: true }))
      })
    }, { threshold: 0.15 })
    Object.values(refs.current).forEach(el => el && obs.observe(el))
    return () => obs.disconnect()
  }, [])

  function ref(key) {
    return el => { refs.current[key] = el; if (el) el.dataset.key = key }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      <style>{`
        @keyframes orbFloat { from { transform: translateY(0px) scale(1); } to { transform: translateY(-40px) scale(1.08); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>

      <Navbar />

      {/* Hero */}
      <section style={{ position: "relative", padding: "120px 32px 100px", overflow: "hidden", minHeight: 520, display: "flex", alignItems: "center" }}>
        <FloatingOrb size={400} x="-80px" y="-60px" delay={0} color="rgba(255,45,120,0.25)" />
        <FloatingOrb size={300} x="60%" y="20px" delay={1.5} color="rgba(59,130,246,0.2)" />
        <FloatingOrb size={250} x="75%" y="180px" delay={3} color="rgba(139,92,246,0.18)" />

        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 1, width: "100%" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,45,120,0.2)", borderRadius: 100, padding: "6px 16px", fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 32, animation: "fadeUp 0.6s ease forwards" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: "pulse 2s infinite" }}/>
            We're building the future of assistive technology
          </div>

          <h1 style={{ fontSize: "clamp(40px, 6vw, 76px)", fontWeight: 600, letterSpacing: "-2.5px", lineHeight: 1.04, color: "var(--text)", marginBottom: 28, animation: "fadeUp 0.6s 0.1s ease both" }}>
            Lead the next generation<br />
            of <span style={{ color: "var(--accent)" }}>human-computer</span><br />
            interaction.
          </h1>

          <p style={{ fontSize: 18, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, maxWidth: 560, marginBottom: 44, animation: "fadeUp 0.6s 0.2s ease both" }}>
            myojam is a student-led open-source project turning surface EMG signals into assistive computer control. We're looking for contributors who want to build technology that genuinely matters.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", animation: "fadeUp 0.6s 0.3s ease both" }}>
            <a href="#roles" style={{ background: "var(--accent)", color: "#fff", borderRadius: 100, padding: "14px 36px", fontSize: 15, fontWeight: 500, textDecoration: "none", boxShadow: "0 4px 24px rgba(255,45,120,0.35)", transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,45,120,0.45)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(255,45,120,0.35)" }}
            >See open roles ↓</a>
            <a href="https://github.com/Jaden300/myojam" target="_blank" rel="noreferrer" style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", color: "var(--text)", border: "1px solid var(--border-mid)", borderRadius: 100, padding: "14px 28px", fontSize: 15, fontWeight: 400, textDecoration: "none", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,45,120,0.3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-mid)"}
            >View the codebase ↗</a>
          </div>
        </div>
      </section>

      {/* Why myojam */}
      <section style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", padding: "80px 32px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--accent)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 12 }}>Why contribute</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600, letterSpacing: "-1px", color: "var(--text)" }}>Why myojam?</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {REASONS.map((r, i) => (
              <div key={r.title} ref={ref(`reason_${i}`)} style={{ background: "var(--bg)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "28px 32px", opacity: visible[`reason_${i}`] ? 1 : 0, transform: visible[`reason_${i}`] ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.5s ${i * 0.1}s ease, transform 0.5s ${i * 0.1}s ease` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,45,120,0.2)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,45,120,0.07)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none" }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <r.Icon size={20} color="var(--accent)" />
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>{r.title}</div>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 300, margin: 0 }}>{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section id="roles" style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--accent)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 12 }}>Open roles</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600, letterSpacing: "-1px", color: "var(--text)", marginBottom: 16 }}>Where you fit in.</h2>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, maxWidth: 520 }}>All roles are volunteer and remote. This is a portfolio-building, mission-driven project — not a job. But the work is real and the impact is real.</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 64 }}>
            {ROLES.map((role, i) => (
              <div key={role.title} ref={ref(`role_${i}`)} style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "28px 32px", opacity: visible[`role_${i}`] ? 1 : 0, transform: visible[`role_${i}`] ? "translateY(0)" : "translateY(20px)", transition: `opacity 0.5s ${i * 0.12}s ease, transform 0.5s ${i * 0.12}s ease`, cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,45,120,0.2)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,45,120,0.07)" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <role.Icon size={18} color="var(--accent)" />
                  </div>
                  <span style={{ fontSize: 17, fontWeight: 600, color: "var(--text)" }}>{role.title}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 500, color: "var(--accent)", background: "var(--accent-soft)", border: "1px solid rgba(255,45,120,0.15)", borderRadius: 100, padding: "3px 10px" }}>{role.type}</span>
                <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 300, marginTop: 12, marginBottom: 14 }}>{role.desc}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {role.tags.map(tag => (
                    <span key={tag} style={{ fontSize: 12, color: "var(--text-secondary)", background: "var(--bg)", border: "1px solid var(--border-mid)", borderRadius: 100, padding: "3px 12px", fontWeight: 400 }}>{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tally application form */}
          <div ref={ref("form")} style={{ opacity: visible["form"] ? 1 : 0, transform: visible["form"] ? "translateY(0)" : "translateY(20px)", transition: "opacity 0.6s ease, transform 0.6s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.4px", marginBottom: 8 }}>Apply to contribute</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7 }}>Tell us about yourself, what role interests you, and what you'd like to build. We review every application personally.</p>
            </div>
            <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius)", border: "1px solid var(--border)", overflow: "hidden", padding: "0 24px" }}>
              <iframe src="https://tally.so/embed/CAREERS_FORM_ID?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1" width="100%" height="600" frameBorder="0" title="Careers application" style={{ display: "block" }} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}