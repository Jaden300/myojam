import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, StaggerList, HoverCard, SectionPill } from "./Animate"
import { IconAccessibility, IconHeart, IconBrain, IconRobot } from "./Icons"

const USE_CASES = [
  {
    Icon: IconAccessibility,
    title: "Accessibility tooling",
    body: "Integrate gesture-based input into your product for users with motor impairments. myojam's open pipeline is a working proof of concept you can build on."
  },
  {
    Icon: IconHeart,
    title: "Rehabilitation technology",
    body: "EMG-based interaction has direct applications in physical and occupational therapy. Our signal processing pipeline is designed to run on consumer hardware at low latency."
  },
  {
    Icon: IconBrain,
    title: "Human-computer interaction research",
    body: "Academic labs and R&D teams can use myojam as a baseline for EMG gesture classification experiments — saving months of pipeline development."
  },
  {
    Icon: IconRobot,
    title: "Robotics & prosthetics",
    body: "The same gesture classification approach that controls a cursor can control a robotic limb. The Ninapro-trained model generalises across subjects out of the box."
  },
]

const STATS = [
  ["84.85%", "Cross-subject accuracy"],
  ["<5ms", "Inference latency"],
  ["16ch", "EMG input channels"],
  ["MIT", "License"],
]

export default function Corporations() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes orbFloat { from { transform:translateY(0) scale(1); } to { transform:translateY(-30px) scale(1.06); } }
      `}</style>

      <Navbar />

      {/* Hero */}
      <section style={{ position: "relative", padding: "120px 32px 96px", overflow: "hidden" }}>
        {/* Orbs */}
        {[
          ["400px", "-100px", "-80px", 0,   "rgba(255,45,120,0.2)"],
          ["280px", "65%",    "40px",  1.5, "rgba(59,130,246,0.15)"],
          ["220px", "80%",    "200px", 3,   "rgba(139,92,246,0.15)"],
        ].map(([size, x, y, delay, color], i) => (
          <div key={i} style={{
            position: "absolute", width: size, height: size,
            borderRadius: "50%", background: color,
            left: x, top: y, filter: "blur(70px)", opacity: 0.5,
            animation: `orbFloat 9s ${delay}s ease-in-out infinite alternate`,
            pointerEvents: "none"
          }}/>
        ))}

        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,45,120,0.2)",
            borderRadius: 100, padding: "6px 16px",
            fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 32,
            animation: "fadeUp 0.6s ease forwards"
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }}/>
            Enterprise & research partnerships
          </div>

          <h1 style={{
            fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 600,
            letterSpacing: "-2.5px", lineHeight: 1.04, color: "var(--text)",
            marginBottom: 28, animation: "fadeUp 0.6s 0.1s ease both"
          }}>
            Open-source EMG<br />
            technology, ready for<br />
            <span style={{ color: "var(--accent)" }}>your application.</span>
          </h1>

          <p style={{
            fontSize: 18, color: "var(--text-secondary)", fontWeight: 300,
            lineHeight: 1.75, maxWidth: 560, marginBottom: 44,
            animation: "fadeUp 0.6s 0.2s ease both"
          }}>
            myojam is a production-ready EMG gesture classification pipeline — MIT licensed,
            fully documented, and trained on a clinical-grade public dataset.
            Whether you're building assistive technology, conducting HCI research, or
            exploring gesture interfaces, we're open to collaboration.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", animation: "fadeUp 0.6s 0.3s ease both" }}>
            <a href="#contact" style={{
              background: "var(--accent)", color: "#fff",
              borderRadius: 100, padding: "14px 36px",
              fontSize: 15, fontWeight: 500, textDecoration: "none",
              boxShadow: "0 4px 24px rgba(255,45,120,0.35)",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,45,120,0.45)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(255,45,120,0.35)" }}
            >Get in touch ↓</a>
            <a href="https://github.com/Jaden300/myojam" target="_blank" rel="noreferrer" style={{
              background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)",
              color: "var(--text)", border: "1px solid var(--border-mid)",
              borderRadius: 100, padding: "14px 28px",
              fontSize: 15, fontWeight: 400, textDecoration: "none",
              transition: "border-color 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,45,120,0.3)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-mid)"}
            >View on GitHub ↗</a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <StaggerList
            items={STATS}
            columns={4}
            gap={0}
            renderItem={([val, label]) => (
              <div style={{
                padding: "36px 32px", borderRight: "1px solid var(--border)",
                textAlign: "center"
              }}>
                <div style={{ fontSize: 36, fontWeight: 600, color: "var(--accent)", letterSpacing: "-1.5px", marginBottom: 6 }}>{val}</div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300 }}>{label}</div>
              </div>
            )}
          />
        </div>
      </section>

      {/* Use cases */}
      <section style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Use cases</SectionPill>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600,
              letterSpacing: "-1px", color: "var(--text)", marginBottom: 48
            }}>Where myojam fits.</h2>
          </Reveal>
          <StaggerList
            items={USE_CASES}
            columns={2}
            gap={16}
            renderItem={(uc) => (
              <HoverCard style={{
                background: "var(--bg-secondary)", borderRadius: "var(--radius)",
                border: "1px solid var(--border)", padding: "28px 32px",
                display: "flex", gap: 20, alignItems: "flex-start"
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: "var(--accent-soft)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <uc.Icon size={22} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
                    {uc.title}
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 300, margin: 0 }}>
                    {uc.body}
                  </p>
                </div>
              </HoverCard>
            )}
          />
        </div>
      </section>

      {/* What we offer */}
      <section style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", padding: "80px 32px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>What we offer</SectionPill>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600,
              letterSpacing: "-1px", color: "var(--text)", marginBottom: 16
            }}>Open collaboration, not licensing.</h2>
            <p style={{
              fontSize: 16, color: "var(--text-secondary)", fontWeight: 300,
              lineHeight: 1.7, maxWidth: 560, marginBottom: 48
            }}>
              myojam is MIT licensed — you can use it freely. What we offer beyond the code
              is direct collaboration: integration support, custom model training, and joint research.
            </p>
          </Reveal>
          <StaggerList
            items={[
              ["🔧", "Integration support", "Help adapting the pipeline to your hardware configuration, sample rate, or electrode setup."],
              ["🧠", "Custom model training", "Retrain the classifier on your own dataset or gesture set with our established pipeline."],
              ["📄", "Research collaboration", "Joint authorship on papers, shared datasets, and co-development of novel gesture classification approaches."],
              ["📡", "Hardware consulting", "Advice on electrode placement, sensor selection, and signal acquisition for your specific application."],
            ]}
            columns={2}
            gap={12}
            renderItem={([icon, title, body]) => (
              <HoverCard style={{
                background: "var(--bg)", borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)", padding: "24px 28px",
                display: "flex", gap: 16, alignItems: "flex-start"
              }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{title}</div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, fontWeight: 300, margin: 0 }}>{body}</p>
                </div>
              </HoverCard>
            )}
          />
        </div>
      </section>

      {/* Contact form */}
      <section id="contact" style={{ padding: "80px 32px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Get in touch</SectionPill>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600,
              letterSpacing: "-1px", color: "var(--text)", marginBottom: 12
            }}>Let's talk.</h2>
            <p style={{
              fontSize: 16, color: "var(--text-secondary)", fontWeight: 300,
              lineHeight: 1.7, maxWidth: 480, marginBottom: 40
            }}>
              Tell us about your project, your organisation, and what you're hoping to build.
              We respond to every inquiry personally.
            </p>
          </Reveal>
          <div style={{
            background: "var(--bg-secondary)", borderRadius: "var(--radius)",
            border: "1px solid var(--border)", overflow: "hidden", padding: "0 24px"
          }}>
            <iframe
              src="https://tally.so/embed/CORPORATIONS_FORM_ID?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
              width="100%"
              height="600"
              frameBorder="0"
              title="Corporate inquiry"
              style={{ display: "block" }}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}