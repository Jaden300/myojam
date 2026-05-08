import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"

// ─── Amber / Ink Theme ────────────────────────────────────────────────────────
// Deliberately different from the site's pink-on-dark-purple palette.
// Deep midnight ink + warm amber gold + parchment cream.
const BG      = "#06050C"
const SURFACE = "#0B091A"
const AMBER   = "#D4922A"
const AMBER2  = "#F0AA35"
const CREAM   = "#F0E8D5"
const CREAM2  = "rgba(240,232,213,0.68)"
const CREAM3  = "rgba(240,232,213,0.38)"
const BORDER  = "rgba(212,146,42,0.13)"
const BORDERM = "rgba(212,146,42,0.30)"

// ─── Sonar ripple canvas ──────────────────────────────────────────────────────
function SonarCanvas() {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)
  const lastRef   = useRef(0)
  const ringsRef  = useRef([{ birth: 0 }])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")

    function resize() {
      const dpr  = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width  = rect.width  * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    let start = null
    function draw(ts) {
      if (!start) start = ts
      const elapsed = ts - start
      const W = canvas.getBoundingClientRect().width
      const H = canvas.getBoundingClientRect().height
      if (!W || !H) { rafRef.current = requestAnimationFrame(draw); return }

      ctx.clearRect(0, 0, W, H)

      const cx = W / 2
      const cy = H / 2
      const MAX_R   = Math.sqrt(W * W + H * H) * 0.65
      const DURATION = 5600
      const INTERVAL = 1300

      if (elapsed - lastRef.current > INTERVAL) {
        ringsRef.current.push({ birth: elapsed })
        lastRef.current = elapsed
        if (ringsRef.current.length > 7) ringsRef.current.shift()
      }

      ringsRef.current.forEach(ring => {
        const age      = elapsed - (ring.birth || 0)
        const progress = Math.min(age / DURATION, 1)
        const radius   = progress * MAX_R
        const alpha    = (1 - progress) * 0.38

        if (alpha < 0.005) return

        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(212,146,42,${alpha})`
        ctx.lineWidth   = 1 + (1 - progress) * 1.8
        ctx.stroke()
      })

      // Centre glow
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90)
      grd.addColorStop(0, "rgba(212,146,42,0.14)")
      grd.addColorStop(1, "rgba(212,146,42,0)")
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(cx, cy, 90, 0, Math.PI * 2)
      ctx.fill()

      // Dot
      ctx.beginPath()
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(212,146,42,0.8)`
      ctx.fill()

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  )
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = "", duration = 1400 }) {
  const [val, setVal] = useState(0)
  const rafRef = useRef(null)
  const elRef  = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || started.current) return
      started.current = true
      const start = performance.now()
      function tick(now) {
        const p = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - p, 3)
        setVal(Math.round(ease * target))
        if (p < 1) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }, { threshold: 0.3 })
    if (elRef.current) obs.observe(elRef.current)
    return () => { obs.disconnect(); cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return <span ref={elRef}>{val}{suffix}</span>
}

// ─── Manifesto item ───────────────────────────────────────────────────────────
function ManifestoItem({ num, text, delay = 0 }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect() }
    }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        display: "grid",
        gridTemplateColumns: "64px 1fr",
        gap: "0 28px",
        alignItems: "baseline",
        padding: "32px 0",
        borderBottom: `1px solid ${BORDER}`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.55s ${delay}s ease, transform 0.55s ${delay}s ease`,
      }}
    >
      <div style={{
        fontSize: "clamp(36px, 5vw, 56px)",
        fontWeight: 800,
        color: `rgba(212,146,42,0.18)`,
        letterSpacing: "-2px",
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
        userSelect: "none",
      }}>
        {num}
      </div>
      <p style={{
        fontSize: "clamp(16px, 2.2vw, 22px)",
        fontWeight: 500,
        color: CREAM,
        lineHeight: 1.55,
        letterSpacing: "-0.3px",
        margin: 0,
      }}>
        {text}
      </p>
    </div>
  )
}

// ─── Fade-in wrapper ──────────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, style = {} }) {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect() }
    }, { threshold: 0.08 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(22px)",
      transition: `opacity 0.6s ${delay}s ease, transform 0.6s ${delay}s ease`,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── Section label ────────────────────────────────────────────────────────────
function Label({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: AMBER,
      textTransform: "uppercase", letterSpacing: "0.12em",
      marginBottom: 16, display: "flex", alignItems: "center", gap: 10,
    }}>
      <div style={{ width: 20, height: 1, background: AMBER, opacity: 0.6 }}/>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Mission() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", background: BG, color: CREAM, fontFamily: "var(--font)" }}>
      <style>{`
        @keyframes missionPulse { 0%,100%{opacity:0.8} 50%{opacity:0.35} }
        @keyframes missionScroll { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(10px)} }
        .mission-commitment:hover .commitment-icon { transform: scale(1.08); }
        .mission-persona:hover { background: rgba(212,146,42,0.07) !important; border-color: rgba(212,146,42,0.32) !important; }
        .mission-join:hover { background: rgba(212,146,42,0.09) !important; }
      `}</style>

      <Navbar />

      {/* ════════════════════════════════════════════════════════════════
          HERO — sonar ripples, full viewport
      ════════════════════════════════════════════════════════════════ */}
      <section style={{
        position: "relative", minHeight: "100vh",
        display: "flex", alignItems: "center",
        background: BG, overflow: "hidden",
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <SonarCanvas />

        {/* Vignette */}
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 80% at 50% 50%, transparent 30%, ${BG} 100%)`, pointerEvents: "none" }}/>

        {/* Bottom fade */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 220, background: `linear-gradient(to bottom, transparent, ${BG})`, pointerEvents: "none" }}/>

        <div style={{ position: "relative", zIndex: 2, maxWidth: 860, margin: "0 auto", padding: "140px 32px 100px", width: "100%" }}>
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(212,146,42,0.10)", border: `1px solid rgba(212,146,42,0.30)`,
            borderRadius: 100, padding: "5px 16px", marginBottom: 36,
            animation: "missionPulse 2.8s ease-in-out infinite",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: AMBER }}/>
            <span style={{ fontSize: 11, fontWeight: 600, color: AMBER, letterSpacing: "0.10em", textTransform: "uppercase" }}>Mission</span>
          </div>

          <h1 style={{
            fontSize: "clamp(38px, 7vw, 80px)",
            fontWeight: 700, letterSpacing: "-3px", lineHeight: 1.04,
            color: CREAM, marginBottom: 28,
            maxWidth: 760,
          }}>
            We exist to make EMG science accessible,{" "}
            <span style={{ color: AMBER }}>honest,</span>{" "}
            and open.
          </h1>

          <p style={{
            fontSize: "clamp(15px, 2vw, 19px)",
            color: CREAM2, fontWeight: 300, lineHeight: 1.8,
            maxWidth: 540, marginBottom: 56,
          }}>
            myojam started as a question asked by one person. It became a platform, a body of research, and an education hub. This page is about why — and what we believe we owe to everyone who uses it.
          </p>

          {/* Stats strip */}
          <div style={{ display: "flex", gap: 40, flexWrap: "wrap" }}>
            {[
              [<Counter target={84} suffix=".85%" duration={1200}/>, "cross-subject accuracy"],
              [<Counter target={11} duration={900}/>, "published articles"],
              [<Counter target={3}  duration={700}/>, "lesson plans"],
              ["MIT", "open source license"],
            ].map(([val, label], i) => (
              <div key={i} style={{ minWidth: 64 }}>
                <div style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, color: AMBER, letterSpacing: "-1.5px", lineHeight: 1, marginBottom: 4 }}>
                  {val}
                </div>
                <div style={{ fontSize: 10, color: CREAM3, fontWeight: 300, textTransform: "uppercase", letterSpacing: "0.07em", lineHeight: 1.4 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.4 }}>
          <span style={{ fontSize: 9, color: AMBER, letterSpacing: "0.14em", textTransform: "uppercase" }}>scroll</span>
          <div style={{ animation: "missionScroll 1.6s ease-in-out infinite" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M3.5 8.5L7 12l3.5-3.5" stroke={AMBER} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          OPENING CONVICTION — editorial pull quote
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "96px 32px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ fontSize: "clamp(56px, 10vw, 112px)", color: AMBER, opacity: 0.18, lineHeight: 0.7, fontWeight: 800, userSelect: "none", marginBottom: 8, fontFamily: "Georgia, serif" }}>"</div>
            <blockquote style={{
              margin: 0, padding: 0,
              fontSize: "clamp(20px, 3vw, 30px)",
              fontWeight: 500, color: CREAM,
              lineHeight: 1.6, letterSpacing: "-0.5px",
              borderLeft: `4px solid ${AMBER}`,
              paddingLeft: 32,
            }}>
              Technology should adapt to people, not the other way around. We built myojam to test whether that conviction was achievable — and to make whatever we learned freely available to everyone who comes after us.
            </blockquote>
            <div style={{ marginTop: 20, paddingLeft: 36, fontSize: 12, color: CREAM3, fontWeight: 300, letterSpacing: "0.04em" }}>
              — The founding principle, September 2024
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          ORIGIN — how it started
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "96px 32px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <FadeIn>
            <Label>How it started</Label>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-1.5px", color: CREAM, marginBottom: 48, maxWidth: 600, lineHeight: 1.15 }}>
              One question. Six months.<br/>One conviction.
            </h2>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 56, alignItems: "start" }}>
            <FadeIn delay={0.05}>
              <p style={{ fontSize: 16, color: CREAM2, fontWeight: 300, lineHeight: 1.85, marginBottom: 20 }}>
                In September 2024, one person asked a specific question: <em style={{ color: CREAM, fontStyle: "normal", fontWeight: 500 }}>can you build a gesture classifier that generalises to people it has never seen, using only public data and $60 in hardware?</em>
              </p>
              <p style={{ fontSize: 16, color: CREAM2, fontWeight: 300, lineHeight: 1.85, marginBottom: 20 }}>
                Three months later, the answer was yes. 84.85% cross-subject accuracy on Ninapro DB5 — 10 subjects, 16,269 labelled windows, 6 gesture classes, tested only on subjects held out entirely from training. A number published honestly, with its limitations documented alongside it.
              </p>
              <p style={{ fontSize: 16, color: CREAM2, fontWeight: 300, lineHeight: 1.85 }}>
                The technical result was interesting. What it revealed was more interesting: the real gap isn't in the classifier. It's in the knowledge infrastructure around it. There was almost no place to learn how surface EMG actually works, to find reproducible implementations, or to use the technology without a research lab. myojam became the attempt to fix that.
              </p>
            </FadeIn>

            {/* Timeline */}
            <FadeIn delay={0.12}>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {[
                  { date: "Sep 2024", label: "The question", body: "Can one person build a clinically meaningful gesture classifier from public data alone?", color: CREAM3 },
                  { date: "Dec 2024", label: "The answer",   body: "84.85% cross-subject accuracy. 16,269 windows. 10 subjects. The question was answered.", color: AMBER },
                  { date: "Feb 2025", label: "The platform", body: "myojam.com goes live. The classifier moves from a local script to a browser-accessible tool.", color: AMBER2 },
                  { date: "Apr 2025", label: "The mission",  body: "11 articles, 3 lesson plans, 5 interactive tools, a desktop app. Education becomes the point.", color: CREAM },
                ].map((step, i) => (
                  <div key={step.date} style={{ display: "grid", gridTemplateColumns: "20px 1fr", gap: "0 18px", paddingBottom: i < 3 ? 28 : 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: step.color, flexShrink: 0, marginTop: 4, boxShadow: `0 0 8px ${step.color}60` }}/>
                      {i < 3 && <div style={{ width: 1, flex: 1, background: BORDER, minHeight: 20, marginTop: 5 }}/>}
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: AMBER, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 3 }}>{step.date}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: CREAM, marginBottom: 4, letterSpacing: "-0.2px" }}>{step.label}</div>
                      <p style={{ fontSize: 12, color: CREAM3, fontWeight: 300, lineHeight: 1.65, margin: 0 }}>{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          THREE COMMITMENTS
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "96px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <FadeIn>
            <Label>What we stand for</Label>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-1.5px", color: CREAM, marginBottom: 8 }}>
              Three commitments.
            </h2>
            <p style={{ fontSize: 15, color: CREAM3, fontWeight: 300, lineHeight: 1.7, marginBottom: 56, maxWidth: 480 }}>
              These aren't aspirations. They're constraints we've accepted — things we won't trade away for convenience.
            </p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
            {[
              {
                num: "I",
                title: "Open by default",
                body: "Every line of code, every model weight decision, every dataset choice is public on GitHub under the MIT license. No private forks, no login-gated content, no waitlist. If myojam teaches someone something, they should be able to look at the code that taught it.",
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <rect x="4" y="10" width="24" height="18" rx="3" stroke={AMBER} strokeWidth="1.6" fill="none"/>
                    <path d="M10 10V8a6 6 0 0112 0v2" stroke={AMBER} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
                    <path d="M16 18v4M14 20h4" stroke={AMBER} strokeWidth="1.6" strokeLinecap="round"/>
                    <circle cx="16" cy="18" r="2" fill={AMBER} opacity="0.4"/>
                  </svg>
                ),
              },
              {
                num: "II",
                title: "Education as the mission",
                body: "The articles, lesson plans, and interactive tools aren't supplements to the project — they are the project. Building a classifier that nobody understands is not the goal. Building one that teaches people how it works, what it can do, and where it fails, is.",
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 6L4 12l12 6 12-6-12-6z" stroke={AMBER} strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
                    <path d="M8 15.5v6c0 0 2.5 3.5 8 3.5s8-3.5 8-3.5v-6" stroke={AMBER} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
                    <path d="M27 12v7" stroke={AMBER} strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                ),
              },
              {
                num: "III",
                title: "Research-grade honesty",
                body: "84.85% is published with its limitations because a number without context isn't data — it's marketing. The cross-subject gap, the prosthetic latency problem, the electrode placement variability: all documented, all public, all part of the record.",
                icon: (
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="11" stroke={AMBER} strokeWidth="1.6" fill="none"/>
                    <path d="M16 11v5l3 3" stroke={AMBER} strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="16" cy="9" r="1.2" fill={AMBER}/>
                  </svg>
                ),
              },
            ].map((c, i) => (
              <FadeIn key={c.num} delay={i * 0.09}>
                <div
                  className="mission-commitment"
                  style={{
                    padding: "36px 32px",
                    background: i === 1 ? `rgba(212,146,42,0.05)` : BG,
                    borderRight: i < 2 ? `1px solid ${BORDER}` : "none",
                    borderTop: i === 1 ? `3px solid ${AMBER}` : `3px solid transparent`,
                    height: "100%",
                    boxSizing: "border-box",
                    transition: "background 0.2s",
                  }}
                >
                  <div className="commitment-icon" style={{ marginBottom: 20, transition: "transform 0.25s" }}>
                    {c.icon}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: AMBER, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>
                    {c.num}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: CREAM, letterSpacing: "-0.4px", marginBottom: 14, lineHeight: 1.2 }}>
                    {c.title}
                  </h3>
                  <p style={{ fontSize: 13, color: CREAM2, fontWeight: 300, lineHeight: 1.8, margin: 0 }}>
                    {c.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          WHO IT'S FOR
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "96px 32px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <FadeIn>
            <Label>Who we build for</Label>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-1.5px", color: CREAM, marginBottom: 12 }}>
              Six kinds of people.
            </h2>
            <p style={{ fontSize: 15, color: CREAM3, fontWeight: 300, lineHeight: 1.7, marginBottom: 48, maxWidth: 500 }}>
              Not a target demographic — a set of people with legitimate claims on what this platform is supposed to do.
            </p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { role: "Students", range: "Middle school → PhD", body: "Learning signal processing, machine learning, or neuroscience without a research budget or lab affiliation. The education hub exists specifically for you.", accent: AMBER },
              { role: "Teachers",  range: "K-12 → university",  body: "Delivering a unit on biomedical engineering or ethics without needing hardware, grants, or a background in signal processing. The lesson plans were designed with your constraints in mind.", accent: AMBER2 },
              { role: "Independent researchers", range: "Hobbyist → academic", body: "Looking for a reproducible, documented baseline to compare against or build from. Every design decision is published so you can understand and challenge it.", accent: AMBER },
              { role: "Hardware hackers", range: "Makers → embedded engineers", body: "Wanting a working EMG pipeline you can fork, modify, and deploy. The Arduino sketch, serial reader, and feature extractor are all in the repository.", accent: AMBER2 },
              { role: "Clinicians", range: "Prosthetists → rehabilitation specialists", body: "Needing an honest account of the gap between lab benchmarks and real-world deployment — not a sales pitch. The open problems section was written for you.", accent: AMBER },
              { role: "People who use assistive technology", range: "End users → advocates", body: "Because understanding the tools built for you matters. The articles are written for a general technical audience, not a specialist one.", accent: AMBER2 },
            ].map((p, i) => (
              <FadeIn key={p.role} delay={i * 0.06}>
                <div
                  className="mission-persona"
                  style={{
                    padding: "22px 24px",
                    borderLeft: `3px solid ${p.accent}`,
                    border: `1px solid ${BORDER}`,
                    borderLeft: `3px solid ${p.accent}`,
                    borderRadius: "2px 10px 10px 2px",
                    background: "transparent",
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: CREAM, letterSpacing: "-0.3px" }}>{p.role}</div>
                    <div style={{ fontSize: 10, color: CREAM3, fontWeight: 300, textTransform: "uppercase", letterSpacing: "0.05em" }}>{p.range}</div>
                  </div>
                  <p style={{ fontSize: 13, color: CREAM2, fontWeight: 300, lineHeight: 1.75, margin: 0 }}>{p.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          MANIFESTO — seven numbered convictions
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "96px 32px" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <FadeIn>
            <Label>What we believe</Label>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-1.5px", color: CREAM, marginBottom: 8 }}>
              Seven convictions.
            </h2>
            <p style={{ fontSize: 15, color: CREAM3, fontWeight: 300, lineHeight: 1.7, marginBottom: 4, maxWidth: 460 }}>
              These are the things we've decided are true and won't renegotiate.
            </p>
          </FadeIn>

          <div style={{ marginTop: 32 }}>
            {[
              { num: "01", text: "Technology should adapt to people — not the other way around. We built on Arduino Uno rather than a proprietary EMG armband so anyone with $30 in parts can replicate the full pipeline. No SDK license. No locked API. The hardware constraint was a design choice." },
              { num: "02", text: "Open source isn't just a license. It's a moral commitment to the people who come after you. We chose MIT — not GPL, not Apache — specifically so clinical researchers bound by institutional IP agreements can use this work without needing to contribute back. The license is load-bearing." },
              { num: "03", text: "The hardest technical problems deserve the clearest possible explanations. The How It Works page on this site explains the full Butterworth → windowing → feature extraction → Random Forest pipeline at a level a biology student can follow. That's not documentation. It's a design requirement." },
              { num: "04", text: "A published accuracy number that obscures its methodology is worse than no number at all. We report 84.85% with leave-one-subject-out validation — not the 91.4% we'd get by testing on the best single subject. The methodology is in the text, not the footnotes." },
              { num: "05", text: "Students who understand this technology today will shape who controls it tomorrow. MyoCode exists as a teaching environment, not a demo. The education hub has 11 articles because education isn't outreach — it's the mechanism by which knowledge stops being locked in labs." },
              { num: "06", text: "Assistive technology built without the people it's meant to serve is just a product. We've done limited formal user research with motor-impaired users, and we say so openly on our Careers page rather than claiming otherwise. Honesty about gaps is the first step to closing them." },
              { num: "07", text: "One person with public data and consumer hardware can produce meaningful science. The Ninapro DB5 is publicly available. An Arduino Uno costs $28. The code is on GitHub. The barrier was never the data or the hardware — it was the assumption that this required a lab." },
            ].map((item, i) => (
              <ManifestoItem key={item.num} num={item.num} text={item.text} delay={i * 0.05} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          THE LONG GAME — what success looks like
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "96px 32px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <FadeIn>
            <Label>The long game</Label>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-1.5px", color: CREAM, marginBottom: 12 }}>
              What success looks like.
            </h2>
            <p style={{ fontSize: 15, color: CREAM3, fontWeight: 300, lineHeight: 1.7, marginBottom: 56, maxWidth: 500 }}>
              Not a product roadmap. A description of the world we're trying to reach — and an honest account of how far away we are from it.
            </p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
            {[
              { stage: "Today", label: "Established", items: ["84.85% cross-subject accuracy documented", "11 articles, 3 lesson plans published", "5 interactive browser tools live", "Desktop app for Mac, Windows, Linux", "Full pipeline open on GitHub under MIT"], color: AMBER, active: true },
              { stage: "Near term", label: "In progress", items: ["Adaptive personalisation layer to narrow the cross-subject gap", "Real-world validation outside controlled lab conditions", "Electrode drift detection and automated recalibration", "Expanded gesture vocabulary beyond 6 classes"], color: `rgba(212,146,42,0.65)`, active: false },
              { stage: "Far term", label: "Target", items: ["Sub-300ms latency with >80% accuracy — closing the prosthetic feasibility gap", "EMG as a standard, accessible input method", "Community-contributed dataset extensions and multilingual education content"], color: `rgba(212,146,42,0.38)`, active: false },
              { stage: "The goal", label: "Vision", items: ["A world where the interface adapts to you — not the other way around. Where someone who needs assistive control doesn't wait a decade for a clinical trial."], color: `rgba(212,146,42,0.2)`, active: false },
            ].map((stage, i) => (
              <FadeIn key={stage.stage} delay={i * 0.08} style={{ height: "100%" }}>
                <div style={{
                  padding: "28px 24px",
                  borderRight: i < 3 ? `1px solid ${BORDER}` : "none",
                  background: stage.active ? `rgba(212,146,42,0.05)` : BG,
                  height: "100%", boxSizing: "border-box",
                  borderTop: stage.active ? `3px solid ${AMBER}` : `3px solid transparent`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color, flexShrink: 0 }}/>
                    <div style={{ fontSize: 9, fontWeight: 700, color: stage.color, textTransform: "uppercase", letterSpacing: "0.09em" }}>{stage.label}</div>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: CREAM, letterSpacing: "-0.4px", marginBottom: 16, lineHeight: 1.2 }}>{stage.stage}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {stage.items.map((item, j) => (
                      <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: stage.color, flexShrink: 0, marginTop: 5 }}/>
                        <p style={{ fontSize: 11, color: CREAM3, fontWeight: 300, lineHeight: 1.65, margin: 0 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          HOW TO JOIN — three paths
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ background: SURFACE, borderBottom: `1px solid ${BORDER}`, padding: "96px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <FadeIn>
            <Label>How to be part of it</Label>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-1.5px", color: CREAM, marginBottom: 12 }}>
              Three ways in.
            </h2>
            <p style={{ fontSize: 15, color: CREAM3, fontWeight: 300, lineHeight: 1.7, marginBottom: 48, maxWidth: 480 }}>
              Every contribution — a bug fix, a lesson plan, a cited paper — moves the mission forward.
            </p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              {
                num: "01",
                title: "Contribute code",
                body: "Fork the repository. The signal processing pipeline, classifier, FastAPI backend, and React frontend are all there. Improve the classifier, add a gesture, fix a bug, open a PR.",
                cta: "View on GitHub ↗",
                href: "https://github.com/Jaden300/myojam",
                isExternal: true,
              },
              {
                num: "02",
                title: "Use it in teaching",
                body: "The three lesson plans are free and ready to use. If you teach them, we'd love to hear what worked and what didn't. Contributions to the educator hub are also welcome.",
                cta: "Educator resources →",
                path: "/educators",
              },
              {
                num: "03",
                title: "Submit an article",
                body: "Written something about EMG, neural interfaces, or the ethics of biometric data? We publish original work with full author credit and a permanent URL.",
                cta: "Submit an article →",
                path: "/submit-article",
              },
            ].map((card, i) => (
              <FadeIn key={card.num} delay={i * 0.08}>
                <div
                  className="mission-join"
                  onClick={() => card.isExternal ? window.open(card.href, "_blank") : navigate(card.path)}
                  style={{
                    padding: "28px 24px",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 12,
                    cursor: "pointer",
                    background: "transparent",
                    transition: "background 0.2s",
                    height: "100%",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: AMBER, letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: 12 }}>{card.num}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: CREAM, letterSpacing: "-0.4px", marginBottom: 12, lineHeight: 1.2 }}>{card.title}</div>
                  <p style={{ fontSize: 13, color: CREAM2, fontWeight: 300, lineHeight: 1.75, margin: "0 0 20px", flex: 1 }}>{card.body}</p>
                  <div style={{ fontSize: 13, fontWeight: 500, color: AMBER }}>{card.cta}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          CLOSING — the final word
      ════════════════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 32px 80px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <div style={{ fontSize: 11, fontWeight: 700, color: AMBER, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 24 }}>
              The honest version
            </div>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 700, letterSpacing: "-1.5px", color: CREAM, lineHeight: 1.15, marginBottom: 24 }}>
              We haven't solved it yet.<br/>That's why it matters.
            </h2>
            <p style={{ fontSize: 16, color: CREAM2, fontWeight: 300, lineHeight: 1.85, marginBottom: 20 }}>
              84.85% is a real number. It also means roughly 1 in 7 predictions is wrong. The prosthetic feasibility gap is real. The electrode placement problem is real. We document all of it — not because it's comfortable, but because solving it requires acknowledging it.
            </p>
            <p style={{ fontSize: 16, color: CREAM2, fontWeight: 300, lineHeight: 1.85, marginBottom: 48 }}>
              If you've read this far, you probably care about the same things we do. That's the whole basis for this project.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/research")}
                style={{ background: AMBER, color: BG, border: "none", borderRadius: 100, padding: "13px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.18s", boxShadow: `0 6px 24px rgba(212,146,42,0.35)` }}
                onMouseEnter={e => { e.currentTarget.style.background = AMBER2; e.currentTarget.style.transform = "scale(1.04)" }}
                onMouseLeave={e => { e.currentTarget.style.background = AMBER; e.currentTarget.style.transform = "scale(1)" }}
              >
                Read the research →
              </button>
              <button
                onClick={() => navigate("/about")}
                style={{ background: "none", color: CREAM2, border: `1px solid ${BORDERM}`, borderRadius: 100, padding: "13px 28px", fontSize: 14, fontWeight: 400, cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = AMBER; e.currentTarget.style.color = AMBER }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BORDERM; e.currentTarget.style.color = CREAM2 }}
              >
                About the project →
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  )
}
