import { useEffect, useRef, useState } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { IconBolt, IconBrain, IconCode, IconChart } from "./Icons"
import { useNavigate } from "react-router-dom"
import { Reveal, StaggerList, HoverCard, SectionPill } from "./Animate"
import NeuralNoise from "./components/NeuralNoise"
import ContactForm from "./components/ContactForm"

const REASONS = [
  {
    Icon: IconBolt,
    title: "Real impact, real users",
    body: "myojam isn't a toy project. It's assistive technology people actually use. Your work directly affects how people with motor impairments interact with computers.",
    color: [255, 45, 120],
    rotY: 0,
    speedMult: 1.0,
    label: "Impact",
  },
  {
    Icon: IconBrain,
    title: "Cutting-edge research stack",
    body: "Work at the intersection of biosignal processing, machine learning, and human-computer interaction. Ninapro datasets, Random Forest classifiers, real-time EMG pipelines.",
    color: [139, 92, 246],
    rotY: 1.1,
    speedMult: 0.55,
    label: "Research",
  },
  {
    Icon: IconCode,
    title: "Fully open source",
    body: "Everything we build is public. Your contributions are visible to the world - a portfolio piece that speaks for itself on any application.",
    color: [59, 130, 246],
    rotY: 2.2,
    speedMult: 0.8,
    label: "Open",
  },
  {
    Icon: IconChart,
    title: "Move fast",
    body: "Small team, no bureaucracy. If you have an idea on Monday, it can be in production by Friday. We value execution over process.",
    color: [245, 158, 11],
    rotY: 3.3,
    speedMult: 1.6,
    label: "Speed",
  },
]

// ─── 3D Orbital Atom Canvas ───────────────────────────────────────────────────
function OrbitalViz({ activeReason }) {
  const canvasRef = useRef(null)
  const activeRef = useRef(activeReason)

  useEffect(() => { activeRef.current = activeReason }, [activeReason])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")

    const FOCAL = 420
    let width = 400, height = 500, dpr = 1, raf

    // Three rings defined by (inclination, azimuth-offset, radius, nParticles)
    const RING_DEFS = [
      { inc: Math.PI / 5.5, azOff: 0,            R: 108, np: 4, baseSpeed: 0.009 },
      { inc: Math.PI / 1.9, azOff: Math.PI / 2.8, R:  86, np: 3, baseSpeed: 0.007 },
      { inc: Math.PI / 3.0, azOff: -Math.PI / 3.5,R:  68, np: 3, baseSpeed: 0.011 },
    ]

    // Particle state: one array per ring
    const particles = RING_DEFS.map(ring =>
      Array.from({ length: ring.np }, (_, i) => ({
        t: (i / ring.np) * Math.PI * 2,
      }))
    )

    // Lerped state
    let rotY = 0
    let coreR = [255, 45, 120]
    let speedMult = 1.0
    let time = 0

    function worldPoint(ring, t, globalRotY) {
      const ψ = ring.azOff + globalRotY
      const { inc: φ, R } = ring
      return {
        wx: R * (Math.cos(t) * Math.cos(ψ) + Math.sin(t) * Math.sin(φ) * Math.sin(ψ)),
        wy: R * Math.sin(t) * Math.cos(φ),
        wz: R * (-Math.cos(t) * Math.sin(ψ) + Math.sin(t) * Math.sin(φ) * Math.cos(ψ)),
      }
    }

    function project(wx, wy, wz) {
      const ps = FOCAL / (FOCAL + wz)
      const cx = width / 2, cy = height / 2
      return {
        sx: cx + wx * ps,
        sy: cy + wy * ps,
        ps,
        depth: (wz + 120) / 240,  // 0=back, 1=front  (R_max ≈ 110)
      }
    }

    function lerpColor(a, b, t) {
      return [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
      ]
    }

    function resize() {
      dpr = window.devicePixelRatio || 1
      const p = canvas.parentElement
      if (!p) return
      width = p.offsetWidth
      height = p.offsetHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = width + "px"
      canvas.style.height = height + "px"
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function draw() {
      raf = requestAnimationFrame(draw)
      time += 0.016

      const cfg = REASONS[activeRef.current]

      // Lerp toward active config
      const rDiff = ((cfg.rotY - rotY) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI
      rotY += rDiff * 0.04
      coreR = lerpColor(coreR, cfg.color, 0.04)
      speedMult += (cfg.speedMult - speedMult) * 0.04

      ctx.clearRect(0, 0, width, height)

      // Pulsing background rings (atmospheric depth)
      for (let k = 0; k < 3; k++) {
        const prog = ((k / 3 + time * 0.012) % 1)
        ctx.beginPath()
        ctx.arc(width / 2, height / 2, 30 + prog * 140, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${coreR[0]},${coreR[1]},${coreR[2]},${0.03 * (1 - prog)})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Draw ring traces + particles
      RING_DEFS.forEach((ring, ri) => {
        // Ring trace (faint path)
        const traceSegs = 64
        ctx.beginPath()
        for (let j = 0; j <= traceSegs; j++) {
          const t = (j / traceSegs) * Math.PI * 2
          const w = worldPoint(ring, t, rotY)
          const p = project(w.wx, w.wy, w.wz)
          const alpha = 0.06 + p.depth * 0.12
          if (j === 0) ctx.moveTo(p.sx, p.sy)
          else ctx.lineTo(p.sx, p.sy)
        }
        ctx.strokeStyle = `rgba(${coreR[0]},${coreR[1]},${coreR[2]},0.18)`
        ctx.lineWidth = 0.8
        ctx.stroke()

        // Advance and draw particles
        particles[ri].forEach(pt => {
          pt.t += ring.baseSpeed * speedMult
          const w = worldPoint(ring, pt.t, rotY)
          const p = project(w.wx, w.wy, w.wz)
          const alpha = 0.25 + p.depth * 0.75
          const r = (3.5 + ri * 0.5) * (0.55 + p.depth * 0.6)

          ctx.save()
          ctx.globalAlpha = alpha
          ctx.shadowColor = `rgb(${coreR[0]},${coreR[1]},${coreR[2]})`
          ctx.shadowBlur = 10

          const grad = ctx.createRadialGradient(p.sx - r * 0.25, p.sy - r * 0.25, 0, p.sx, p.sy, r)
          grad.addColorStop(0, "#fff")
          grad.addColorStop(0.4, `rgb(${coreR[0]},${coreR[1]},${coreR[2]})`)
          grad.addColorStop(1, `rgba(${coreR[0]},${coreR[1]},${coreR[2]},0.4)`)

          ctx.beginPath()
          ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2)
          ctx.fillStyle = grad
          ctx.fill()
          ctx.restore()
        })
      })

      // Central core sphere
      const cx = width / 2, cy = height / 2
      const coreRadius = 22 + Math.sin(time * 2.2) * 1.8

      // Outer glow
      const outerGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius * 3.5)
      outerGrd.addColorStop(0, `rgba(${coreR[0]},${coreR[1]},${coreR[2]},0.3)`)
      outerGrd.addColorStop(1, `rgba(${coreR[0]},${coreR[1]},${coreR[2]},0)`)
      ctx.beginPath()
      ctx.arc(cx, cy, coreRadius * 3.5, 0, Math.PI * 2)
      ctx.fillStyle = outerGrd
      ctx.fill()

      // Core
      ctx.save()
      ctx.shadowColor = `rgb(${coreR[0]},${coreR[1]},${coreR[2]})`
      ctx.shadowBlur = 28
      const cGrd = ctx.createRadialGradient(cx - coreRadius * 0.3, cy - coreRadius * 0.3, 0, cx, cy, coreRadius)
      cGrd.addColorStop(0, "#fff")
      cGrd.addColorStop(0.35, `rgb(${coreR[0]},${coreR[1]},${coreR[2]})`)
      cGrd.addColorStop(1, `rgba(${coreR[0]},${coreR[1]},${coreR[2]},0.6)`)
      ctx.beginPath()
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2)
      ctx.fillStyle = cGrd
      ctx.fill()
      ctx.restore()
    }

    resize()
    window.addEventListener("resize", resize)
    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
}

// ─── Sticky Why Section ───────────────────────────────────────────────────────
function StickyReasons() {
  const containerRef = useRef(null)
  const [active, setActive] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    function onScroll() {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollable = el.offsetHeight - window.innerHeight
      if (scrollable <= 0) return
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable))
      setActive(Math.min(REASONS.length - 1, Math.floor(progress * REASONS.length)))
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const r = REASONS[active]
  const colorStr = `rgb(${r.color[0]},${r.color[1]},${r.color[2]})`

  return (
    <div ref={containerRef} style={{ height: `${REASONS.length * 100}vh`, position: "relative", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div style={{
        position: "sticky", top: 0, height: "100vh",
        display: "flex", flexDirection: isMobile ? "column" : "row",
        background: "var(--bg-secondary)",
        overflow: "hidden",
      }}>

        {/* Left - orbital canvas */}
        <div style={{
          flex: isMobile ? "0 0 44vh" : 1,
          position: "relative",
          borderRight: isMobile ? "none" : "1px solid var(--border)",
          borderBottom: isMobile ? "1px solid var(--border)" : "none",
        }}>
          <OrbitalViz activeReason={active} />

          {/* Progress pips */}
          <div style={{
            position: "absolute", bottom: 28, left: 0, right: 0,
            display: "flex", justifyContent: "center", gap: 7, zIndex: 2,
          }}>
            {REASONS.map((reason, i) => (
              <div key={i} style={{
                height: 6, borderRadius: 3,
                width: i === active ? 22 : 6,
                background: i === active
                  ? `rgb(${reason.color[0]},${reason.color[1]},${reason.color[2]})`
                  : "var(--border)",
                transition: "width 0.35s ease, background 0.35s ease",
              }} />
            ))}
          </div>
        </div>

        {/* Right - reason detail */}
        <div style={{
          flex: 1,
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: isMobile ? "24px 28px" : "0 64px",
          overflow: "hidden",
          background: "var(--bg-secondary)",
        }}>
          {/* Section heading - inside sticky */}
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--accent)", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>
              Why contribute
            </p>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 38px)", fontWeight: 600, letterSpacing: "-1px", color: "var(--text)", marginBottom: 6 }}>
              Why myojam?
            </h2>
          </div>

          <div key={active} style={{ animation: "reasonIn 0.38s cubic-bezier(0.22,1,0.36,1) both" }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: `rgba(${r.color[0]},${r.color[1]},${r.color[2]},0.1)`,
              border: `1px solid rgba(${r.color[0]},${r.color[1]},${r.color[2]},0.25)`,
              borderRadius: 100, padding: "5px 14px", marginBottom: 20,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: colorStr, display: "inline-block" }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: colorStr, letterSpacing: "0.07em", textTransform: "uppercase" }}>
                {active + 1} of {REASONS.length} · {r.label}
              </span>
            </div>

            {/* Icon tile */}
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: `rgba(${r.color[0]},${r.color[1]},${r.color[2]},0.12)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20,
            }}>
              <r.Icon size={24} color={colorStr} />
            </div>

            <h3 style={{
              fontSize: "clamp(20px, 2.4vw, 32px)", fontWeight: 600,
              letterSpacing: "-0.8px", lineHeight: 1.15,
              color: "var(--text)", marginBottom: 16,
            }}>
              {r.title}
            </h3>

            <p style={{
              fontSize: 15, color: "var(--text-secondary)",
              lineHeight: 1.78, fontWeight: 300,
              maxWidth: 440, marginBottom: 0,
            }}>
              {r.body}
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

const ROLES = [
  {
    area: "Research",  color: "#8B5CF6", urgent: true,
    title: "ML Research Contributor",
    commitment: "5–10 hrs / week",
    tags: ["Python", "scikit-learn", "EMG", "Signal Processing"],
    desc: "The current model hits 84.85% LOSO cross-subject accuracy. The ceiling isn't the mean - it's the three subjects that drag it down. S02 (79.3%), S06 (76.1%), and S09 (78.4%) are the open research question. Better features, domain adaptation, or personalized calibration - we don't know which, and that's the point.",
    now: "Comparing WL vs. wavelet features on S06 raw data. Investigating whether electrode placement variance explains the accuracy gap on high-variability subjects.",
  },
  {
    area: "Engineering", color: "#3B82F6", urgent: true,
    title: "Cross-platform Desktop Contributor",
    commitment: "4–8 hrs / week",
    tags: ["Python", "PyQt6", "Windows", "Linux"],
    desc: "The desktop app runs on macOS only because it uses cliclick and osascript for mouse and keyboard control. Windows and Linux users are locked out. This is the single biggest barrier to new users - and it's a solvable problem with pyautogui, win32api, or xdotool.",
    now: "macOS input layer is ~80 lines in src/input/macos.py. Windows and Linux stubs exist. They need real implementations.",
  },
  {
    area: "Engineering", color: "#3B82F6", urgent: false,
    title: "Hardware & Firmware Engineer",
    commitment: "3–8 hrs / week",
    tags: ["Arduino", "C++", "MyoWare", "Embedded"],
    desc: "The current rig needs MyoWare 2.0 + Arduino Uno + a laptop - three devices, ~$150 minimum. The goal is one device, under $50, battery-powered. The real bottleneck is ADC resolution: 10-bit at 200 Hz on the Uno isn't enough headroom for low-amplitude gestures.",
    now: "Evaluating the RP2040 as an Uno replacement - better ADC, native USB HID, same form factor. Looking for someone to prototype the firmware.",
  },
  {
    area: "Product", color: "#FF2D78", urgent: false,
    title: "Frontend Developer",
    commitment: "4–10 hrs / week",
    tags: ["React", "Canvas API", "WebGL", "Vite"],
    desc: "myojam.com is a full React SPA - WebGL hero backgrounds, a real-time signal playground, a block-based gesture coding environment, and a research education hub. The code is public. The bar is high. We build things that belong in a design portfolio, not a settings panel.",
    now: "MyoCode needs persistent variable state across script runs. The signal playground needs a frequency analysis overlay. The EMG explainer needs a dynamic windowing animation.",
  },
  {
    area: "Education", color: "#10B981", urgent: false,
    title: "Education Content Creator",
    commitment: "2–5 hrs / week",
    tags: ["Science Writing", "Biology", "CS Education"],
    desc: "The education hub publishes articles on EMG science, signal processing, and gesture recognition. The best ones have real data, cite primary sources, and teach something a biology student couldn't find in a textbook. We're not looking for blog posts - we're looking for pieces that hold up to scrutiny.",
    now: "Next article queue: muscle fiber type differences in EMG amplitude, fatigue effects on classifier accuracy, and a deep-dive on the Ninapro DB5 recording protocol.",
  },
  {
    area: "Research", color: "#8B5CF6", urgent: false,
    title: "UX & Accessibility Researcher",
    commitment: "3–6 hrs / week",
    tags: ["UX Research", "A11y", "User Testing", "Assistive Tech"],
    desc: "myojam is built for people with limited hand mobility, motor impairments, or RSI. But we've done almost no formal user research with that population. This role closes that gap - structured testing, recruitment, and ethics frameworks for a real user study.",
    now: "Drafting a recruitment protocol for participants with upper-limb motor impairments. Need help designing the study methodology before any testing begins.",
  },
]

const AREA_COLORS = { Research:"#8B5CF6", Engineering:"#3B82F6", Product:"#FF2D78", Education:"#10B981" }

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
    <div style={{ minHeight: "100vh", background: "var(--bg)", overflowX: "clip" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes reasonIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Navbar />

      {/* Hero */}
      <section style={{ position: "relative", padding: "120px 32px 100px", overflow: "hidden", minHeight: 520, display: "flex", alignItems: "center" }}>
        <NeuralNoise color={[0.49, 0.23, 0.93]} opacity={0.85} speed={0.0006} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(3,0,18,0.65)", zIndex: 1 }} />

        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 2, width: "100%" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,45,120,0.2)", borderRadius: 100, padding: "6px 16px", fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 32, animation: "fadeUp 0.6s ease forwards" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: "pulse 2s infinite" }}/>
            We're building the future of assistive technology
          </div>

          <h1 style={{ fontSize: "clamp(40px, 6vw, 76px)", fontWeight: 600, letterSpacing: "-2.5px", lineHeight: 1.04, color: "#fff", marginBottom: 28, animation: "fadeUp 0.6s 0.1s ease both", textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
            Lead the next generation<br />
            of <span style={{ color: "var(--accent)" }}>human-computer</span><br />
            interaction.
          </h1>

          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.8)", fontWeight: 300, lineHeight: 1.75, maxWidth: 560, marginBottom: 44, animation: "fadeUp 0.6s 0.2s ease both" }}>
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

      {/* Why myojam - sticky 3D orbital section */}
      <StickyReasons />

      {/* Open roles */}
      <section id="roles" style={{ padding:"80px 32px 96px" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>

          {/* Section header */}
          <div style={{ marginBottom:48 }}>
            <p style={{ fontSize:12, fontWeight:600, color:"var(--accent)", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:12 }}>Open roles</p>
            <h2 style={{ fontSize:"clamp(28px,4vw,46px)", fontWeight:600, letterSpacing:"-1.4px", color:"var(--text)", marginBottom:16, lineHeight:1.1 }}>
              Right now, we need<br/>help with these.
            </h2>
            <p style={{ fontSize:16, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, maxWidth:540 }}>
              All roles are volunteer and fully remote. This isn't a job - it's a research project with real users, real data, and real open problems. Every role below has a specific current challenge, not a vague mandate.
            </p>
          </div>

          {/* How it works strip */}
          <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:16, padding:"26px 30px", marginBottom:44 }}>
            <div style={{ fontSize:10, fontWeight:700, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:20 }}>How contributing works</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:28 }}>
              {[
                { n:"01", title:"Find your angle", body:"Browse the roles below. Each one has a specific open problem and a 'what we're working on right now' callout - not a job description, a research brief." },
                { n:"02", title:"Start the conversation", body:"Open a GitHub issue, reply to an existing thread, or use the application form at the bottom. We read and respond to every message." },
                { n:"03", title:"Ship something small", body:"Your first contribution doesn't have to be large. A fixed doc, a failing test, a bug report with reproduction steps - that's how every long-term contributor started." },
              ].map(s=>(
                <div key={s.n} style={{ display:"flex", gap:14 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"var(--accent)", opacity:0.45, lineHeight:1, marginTop:2, flexShrink:0 }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:5 }}>{s.title}</div>
                    <p style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.68, margin:0 }}>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role cards */}
          <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:72 }}>
            {ROLES.map((role, i) => (
              <div key={role.title} ref={ref(`role_${i}`)} style={{
                background:"var(--bg-secondary)", borderRadius:16,
                border:"1px solid var(--border)", overflow:"hidden",
                opacity:visible[`role_${i}`]?1:0,
                transform:visible[`role_${i}`]?"translateY(0)":"translateY(16px)",
                transition:`opacity 0.5s ${i*0.09}s ease, transform 0.5s ${i*0.09}s ease`,
              }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=role.color+"44"; e.currentTarget.style.boxShadow=`0 6px 28px ${role.color}12` }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.boxShadow="none" }}
              >
                {/* Colored top bar */}
                <div style={{ height:3, background:role.color, opacity:0.8 }}/>

                <div style={{ padding:"24px 28px 26px" }}>
                  {/* Top row */}
                  <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, marginBottom:14, flexWrap:"wrap" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                      <span style={{ fontSize:17, fontWeight:600, color:"var(--text)", letterSpacing:"-0.3px" }}>{role.title}</span>
                      {role.urgent && (
                        <span style={{ fontSize:10, fontWeight:700, color:role.color, background:role.color+"14", border:`1px solid ${role.color}30`, borderRadius:100, padding:"2px 9px", textTransform:"uppercase", letterSpacing:"0.07em" }}>Active</span>
                      )}
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0 }}>
                      <span style={{ fontSize:11, color:role.color, background:role.color+"12", border:`1px solid ${role.color}28`, borderRadius:100, padding:"3px 11px", fontWeight:500 }}>{role.area}</span>
                      <span style={{ fontSize:11, color:"var(--text-tertiary)", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:100, padding:"3px 11px", fontWeight:400 }}>
                        ⏱ {role.commitment}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.78, margin:"0 0 18px", maxWidth:680 }}>{role.desc}</p>

                  {/* Tags */}
                  <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:18 }}>
                    {role.tags.map(tag=>(
                      <span key={tag} style={{ fontSize:11, color:"var(--text-secondary)", background:"var(--bg)", border:"1px solid var(--border)", borderRadius:100, padding:"3px 11px", fontWeight:400 }}>{tag}</span>
                    ))}
                  </div>

                  {/* "Right now" callout */}
                  <div style={{ background:"#0A0A18", border:`1px solid ${role.color}28`, borderLeft:`3px solid ${role.color}`, borderRadius:8, padding:"12px 16px", display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{ fontSize:9, fontWeight:700, color:role.color, textTransform:"uppercase", letterSpacing:"0.1em", lineHeight:1, marginTop:2, flexShrink:0 }}>Now</div>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.55)", fontFamily:"monospace", lineHeight:1.65, margin:0, fontWeight:400 }}>{role.now}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Application form */}
          <div ref={ref("form")} style={{ opacity:visible["form"]?1:0, transform:visible["form"]?"translateY(0)":"translateY(20px)", transition:"opacity 0.6s ease, transform 0.6s ease" }}>
            <div style={{ marginBottom:24 }}>
              <h3 style={{ fontSize:24, fontWeight:600, color:"var(--text)", letterSpacing:"-0.6px", marginBottom:8 }}>Apply to contribute</h3>
              <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, maxWidth:480 }}>Tell us which role interests you, what you've worked on before, and what you'd like to build. We review every application and respond to every message.</p>
            </div>
            <div style={{ background:"var(--bg-secondary)", borderRadius:16, border:"1px solid var(--border)", overflow:"hidden", padding:"0 24px" }}>
              <ContactForm
                source="careers"
                namePlaceholder="Your name"
                emailPlaceholder="your@email.com"
                messagePlaceholder="Which role interests you? What have you worked on before? What do you want to build?"
                submitLabel="Submit application"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}