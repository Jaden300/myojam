import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"
import ContactForm from "./components/ContactForm"
import NeuralNoise from "./components/NeuralNoise"

const PINK   = "#FF2D78"
const BLUE   = "#3B82F6"
const PURPLE = "#8B5CF6"
const GREEN  = "#10B981"
const AMBER  = "#F59E0B"

const CONTACT_TYPES = [
  {
    color: PINK,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="#FF2D78" strokeWidth="1.5" fill="none"/>
        <path d="M7 10h6M10 7v6" stroke="#FF2D78" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Research & methodology",
    desc: "Questions about the cross-subject accuracy gap, LOSO cross-validation, feature engineering choices, or how to reproduce the results.",
    hint: "Include which paper section or metric you're asking about. Link to any relevant prior work.",
  },
  {
    color: BLUE,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="5" width="14" height="10" rx="2" stroke="#3B82F6" strokeWidth="1.5" fill="none"/>
        <path d="M7 5V4a3 3 0 016 0v1" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <circle cx="10" cy="10" r="1.5" fill="#3B82F6"/>
      </svg>
    ),
    title: "Hardware & setup",
    desc: "Problems with the MyoWare 2.0 sensor, Arduino serial connection, signal quality, or electrode placement getting inconsistent results.",
    hint: "Include your OS, Arduino model, and describe what the signal looks like when things go wrong.",
  },
  {
    color: PURPLE,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 14l4-4 3 3 5-6" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="2" y="2" width="16" height="16" rx="3" stroke="#8B5CF6" strokeWidth="1.5" fill="none"/>
      </svg>
    ),
    title: "Building on myojam",
    desc: "Forking the repo, adding new gesture classes, integrating the classifier API into another project, or working with the signal processing pipeline.",
    hint: "Describe what you're building and where you're stuck. A GitHub link to your fork helps.",
  },
  {
    color: GREEN,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L12.4 7.4H18L13.5 10.6L15.5 16L10 12.8L4.5 16L6.5 10.6L2 7.4H7.6L10 2Z" stroke="#10B981" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    title: "Media & collaboration",
    desc: "Press inquiries, educational partnerships, grant collaboration, or featuring myojam in a course, article, or video.",
    hint: "Include your outlet or institution and a brief description of the project you have in mind.",
  },
]

const SOCIALS = [
  { icon: "fab fa-github",      href: "https://github.com/Jaden300/myojam",           label: "GitHub",    sub: "Source code & issues",    color: "#fff"    },
  { icon: "fab fa-linkedin-in", href: "https://www.linkedin.com/company/myojam/",     label: "LinkedIn",  sub: "@myojam",                  color: "#0A66C2" },
  { icon: "fab fa-instagram",   href: "https://www.instagram.com/myojam_official/",   label: "Instagram", sub: "@myojam_official",         color: "#E1306C" },
  { icon: "fab fa-x-twitter",   href: "https://x.com/myojam_official",                label: "X",         sub: "@myojam_official",         color: "#fff"    },
  { icon: "fab fa-youtube",     href: "https://www.youtube.com/@myojam-official",      label: "YouTube",   sub: "@myojam-official",         color: "#FF0000" },
  { icon: "fab fa-tiktok",      href: "https://www.tiktok.com/@myojam_official",       label: "TikTok",    sub: "@myojam_official",         color: "#fff"    },
]

const QUICK_LINKS = [
  { label: "GitHub Discussions",    sub: "Best place for technical Q&A",              href: "https://github.com/Jaden300/myojam/discussions", color: PURPLE },
  { label: "Ninapro DB5 dataset",   sub: "The source data behind the classifier",     href: "https://ninapro.hevs.ch",                        color: BLUE   },
  { label: "Full technical report", sub: "Every design decision, documented",         href: "/research/paper",                                color: PINK   },
  { label: "Hardware setup guide",  sub: "Wiring, electrode placement, Arduino code", href: "/download",                                      color: AMBER  },
]

export default function Contact() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* ── Hero ── */}
      <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--border)", padding: "100px 32px 72px" }}>
        <NeuralNoise color={[0.90, 0.18, 0.47]} opacity={0.85} speed={0.0006} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(3,0,18,0.68)", zIndex: 1 }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Reveal>
            <SectionPill>Contact</SectionPill>
            <h1 style={{ fontSize: "clamp(38px, 6vw, 64px)", fontWeight: 700, letterSpacing: "-2.5px", lineHeight: 1.04, marginBottom: 22, color: "#fff", marginTop: 16 }}>
              Let's talk about<br/>
              <span style={{ color: PINK }}>your muscles.</span>
            </h1>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, fontWeight: 300, maxWidth: 520, marginBottom: 36 }}>
              Research questions, hardware problems, collaboration ideas — we read every message. Most get a reply within a few days.
            </p>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[
                { val: "< 3 days", label: "typical reply time" },
                { val: "MIT",      label: "open source license" },
                { val: "4",        label: "ways we can help" },
              ].map(({ val, label }) => (
                <div key={label}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>{val}</div>
                  <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.38)", fontWeight: 300, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Contact type cards ── */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "64px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>What are you reaching out about?</SectionPill>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, marginTop: 12, marginBottom: 36, maxWidth: 540 }}>
              Different questions get better answers when you include the right context. Pick the category that fits and follow the hint — it saves a round-trip.
            </p>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {CONTACT_TYPES.map((ct, i) => (
              <Reveal key={ct.title} delay={i * 0.06}>
                <div style={{
                  background: "var(--bg)", border: "1px solid var(--border)",
                  borderTop: `3px solid ${ct.color}`,
                  borderRadius: "0 0 14px 14px", padding: "22px 22px 20px",
                  display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 24px ${ct.color}18`; e.currentTarget.style.borderColor = `${ct.color}40` }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--border)" }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${ct.color}14`, border: `1px solid ${ct.color}28`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    {ct.icon}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>{ct.title}</div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, margin: 0, marginBottom: 14, flex: 1 }}>{ct.desc}</p>
                  <div style={{ padding: "10px 12px", background: `${ct.color}0a`, border: `1px solid ${ct.color}1a`, borderRadius: 8 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: ct.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Include in your message</div>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.6, margin: 0 }}>{ct.hint}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content: form + sidebar ── */}
      <div style={{ padding: "64px 32px 80px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 340px", gap: 48, alignItems: "start" }}>

          {/* Form */}
          <div>
            <Reveal>
              <SectionPill>Send a message</SectionPill>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 600, letterSpacing: "-1px", color: "var(--text)", marginBottom: 8, marginTop: 14 }}>
                Write to us directly
              </h2>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, marginBottom: 28 }}>
                For longer or more technical questions, GitHub Discussions is often faster. For everything else — here's the form.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                <ContactForm source="contact" messagePlaceholder="Describe what you're working on or asking about..." submitLabel="Send message" />
              </div>
            </Reveal>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Quick links */}
            <Reveal delay={0.1}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Useful links</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {QUICK_LINKS.map(({ label, sub, href, color }) => (
                    <a key={label} href={href} target={href.startsWith("http") ? "_blank" : "_self"} rel="noreferrer"
                      style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 12, transition: "border-color 0.2s, transform 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = color + "50"; e.currentTarget.style.transform = "translateX(3px)" }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateX(0)" }}
                    >
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{label}</div>
                        <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300, marginTop: 1 }}>{sub}</div>
                      </div>
                      <span style={{ fontSize: 13, color: "var(--text-tertiary)", flexShrink: 0 }}>↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Social */}
            <Reveal delay={0.15}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Follow the project</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {SOCIALS.map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                      style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10, transition: "border-color 0.2s, transform 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}50`; e.currentTarget.style.transform = "translateY(-2px)" }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)" }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-soft)", border: "1px solid rgba(255,45,120,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--accent)", flexShrink: 0 }}>
                        <i className={s.icon}/>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{s.label}</div>
                        <div style={{ fontSize: 10, color: "var(--text-tertiary)", fontWeight: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.sub}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* What to expect */}
            <Reveal delay={0.2}>
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 14, padding: "20px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>What to expect</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { icon: "⏱", label: "Reply time", val: "Usually 1–3 business days" },
                    { icon: "🔬", label: "Research Qs", val: "Always welcome; cite the paper" },
                    { icon: "🛠", label: "Hardware Qs", val: "Check GitHub Discussions first" },
                    { icon: "🚫", label: "What we skip", val: "Sales pitches and cold outreach" },
                  ].map(({ icon, label, val }) => (
                    <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{label}</div>
                        <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.5 }}>{val}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── Open-source note ── */}
      <div style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", padding: "32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}>
          <p style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 300, lineHeight: 1.6, margin: 0 }}>
            myojam is open-source under the MIT License. Not a medical device. Data never leaves your machine.
          </p>
          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <button onClick={() => navigate("/research/paper")}
              style={{ background: "none", border: "1px solid var(--border)", borderRadius: 100, padding: "7px 16px", fontSize: 12, cursor: "pointer", fontFamily: "var(--font)", color: "var(--text-secondary)", transition: "border-color 0.15s, color 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = PINK; e.currentTarget.style.color = PINK }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)" }}
            >Read the research →</button>
            <a href="https://github.com/Jaden300/myojam" target="_blank" rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "1px solid var(--border)", borderRadius: 100, padding: "7px 16px", fontSize: 12, textDecoration: "none", color: "var(--text-secondary)", transition: "border-color 0.15s, color 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = PINK; e.currentTarget.style.color = PINK }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)" }}
            >
              <i className="fab fa-github" style={{ fontSize: 13 }}/> View on GitHub
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
