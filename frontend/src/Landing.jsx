import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Navbar from "./Navbar"
import HeroSphere from "./HeroSphere"
import Footer from "./Footer"


const STATS = [
  ["84.85%", "Cross-subject accuracy", "Tested across 10 clinical subjects"],
  ["6", "Gesture classes", "Finger flexions + full fist"],
  ["16ch", "EMG channels", "200 Hz surface recording"],
  ["<5ms", "Inference time", "Real-time classification"],
]

const HOW = [
  ["Signal capture", "Surface EMG electrodes on the forearm read electrical activity at 200 Hz. No needles — adhesive stickers on skin."],
  ["Feature extraction", "Each 200-sample window is compressed into 64 features capturing muscle activation patterns."],
  ["Classification", "A Random Forest model trained on 10 subjects from the Ninapro DB5 dataset identifies the gesture in under 5ms."],
  ["Assistive output", "Detected gestures map to computer actions — cursor movement, clicks, keypresses — hands-free."],
]

export default function Landing() {
  const navigate = useNavigate()

  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        padding: "110px 32px 80px",
        maxWidth: 1100, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 40,
        alignItems: "center"
      }}>
        {/* Left — text */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--accent-soft)",
            border: "1px solid rgba(255,45,120,0.15)",
            borderRadius: 100, padding: "5px 16px",
            fontSize: 13, color: "var(--accent)",
            fontWeight: 500, marginBottom: 36
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "var(--accent)", display: "inline-block"
            }}/>
            Open source · Assistive technology
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 5.5vw, 68px)",
            fontWeight: 600, lineHeight: 1.06,
            letterSpacing: "-2px",
            color: "var(--text)", marginBottom: 24
          }}>
            Control your<br />computer<br />
            <span style={{ color: "var(--accent)" }}>with your muscles.</span>
          </h1>

          <p style={{
            fontSize: 17, color: "var(--text-secondary)",
            lineHeight: 1.7, marginBottom: 40, fontWeight: 300
          }}>
            myojam reads EMG signals from your forearm and classifies 
            hand gestures in real time — giving people with motor 
            impairments a new way to interact with computers.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => navigate("/demo")} style={{
              background: "var(--accent)", color: "#fff",
              border: "none", borderRadius: 100,
              padding: "13px 32px", fontSize: 15,
              fontFamily: "var(--font)", fontWeight: 500,
              cursor: "pointer",
              boxShadow: "0 4px 24px rgba(255,45,120,0.3)"
            }}>Try the demo</button>
            <a href="https://github.com/Jaden300/myojam"
              target="_blank" rel="noreferrer"
              style={{
                background: "var(--bg-secondary)", color: "var(--text)",
                border: "1px solid var(--border-mid)", borderRadius: 100,
                padding: "12px 28px", fontSize: 15,
                fontFamily: "var(--font)", fontWeight: 400,
                textDecoration: "none", display: "inline-block"
              }}>View on GitHub</a>
          </div>
        </div>

        {/* Right — 3D sphere */}
        <div style={{
          height: 500,
          position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          {/* Soft glow behind sphere */}
          <div style={{
            position: "absolute",
            width: 340, height: 340,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,45,120,0.12) 0%, transparent 70%)",
            pointerEvents: "none"
          }}/>
          <div style={{ width: "100%", height: "100%" }}>
            <HeroSphere scrollY={scrollY} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{
        maxWidth: 860, margin: "0 auto",
        padding: "0 32px 80px"
      }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: 2, borderRadius: "var(--radius)",
          overflow: "hidden", border: "1px solid var(--border)"
        }}>
          {STATS.map(([val, label, sub]) => (
            <div key={label} style={{
              background: "var(--bg-secondary)",
              padding: "28px 24px",
              borderRight: "1px solid var(--border)"
            }}>
              <div style={{
                fontSize: 32, fontWeight: 600,
                color: "var(--accent)", letterSpacing: "-1px",
                marginBottom: 6
              }}>{val}</div>
              <div style={{
                fontSize: 14, fontWeight: 500,
                color: "var(--text)", marginBottom: 4
              }}>{label}</div>
              <div style={{
                fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.5
              }}>{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{
        background: "var(--bg-secondary)",
        padding: "80px 32px"
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{
              fontSize: 13, fontWeight: 500, color: "var(--accent)",
              letterSpacing: "0.04em", marginBottom: 12,
              textTransform: "uppercase"
            }}>How it works</p>
            <h2 style={{
              fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 600,
              letterSpacing: "-1px", color: "var(--text)"
            }}>From muscle to action</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {HOW.map(([title, desc], i) => (
              <div key={title} style={{
                background: "var(--surface)",
                borderRadius: "var(--radius)",
                padding: "32px",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow)"
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "var(--accent-soft)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 600, color: "var(--accent)",
                  marginBottom: 16
                }}>0{i + 1}</div>
                <div style={{
                  fontSize: 16, fontWeight: 600,
                  color: "var(--text)", marginBottom: 10
                }}>{title}</div>
                <p style={{
                  fontSize: 14, color: "var(--text-secondary)",
                  lineHeight: 1.7, fontWeight: 300
                }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: "100px 32px",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{
            fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 600,
            letterSpacing: "-1px", marginBottom: 20
          }}>See it in action</h2>
          <p style={{
            fontSize: 16, color: "var(--text-secondary)",
            lineHeight: 1.7, marginBottom: 36, fontWeight: 300
          }}>Load real EMG data from the Ninapro dataset and watch the classifier run live in your browser.</p>
          <button onClick={() => navigate("/demo")} style={{
            background: "var(--accent)", color: "#fff",
            border: "none", borderRadius: 100,
            padding: "14px 40px", fontSize: 16,
            fontFamily: "var(--font)", fontWeight: 500,
            cursor: "pointer",
            boxShadow: "0 4px 24px rgba(255,45,120,0.3)"
          }}>Open demo</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "24px 32px",
        display: "flex", justifyContent: "space-between",
        alignItems: "center"
      }}>
        <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500 }}>myojam</span>
        <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Open source · MIT License · Built on Ninapro DB5</span>
      </footer>

      <div style={{
        textAlign: "center", padding: "40px 32px 24px",
        borderTop: "1px solid var(--border)",
        fontSize: 13, color: "var(--text-tertiary)", fontWeight: 300
      }}>
        © 2025 myojam™. All rights reserved. · Built with ♥ for assistive technology.
      </div>

    </div>
  )
}