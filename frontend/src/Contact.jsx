import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, StaggerList, HoverCard, SectionPill } from "./Animate"

export default function Contact() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "120px 32px 80px" }}>

        <Reveal>
          <SectionPill>Get in touch</SectionPill>
        </Reveal>

        <h1 style={{
          fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 600,
          letterSpacing: "-2px", lineHeight: 1.05, marginBottom: 24
        }}>Get in touch.</h1>

        <p style={{
          fontSize: 16, color: "var(--text-secondary)", lineHeight: 1.7,
          fontWeight: 300, marginBottom: 56
        }}>Questions about the project, research collaboration, or building on top of myojam? Reach out.</p>

        {/* Social links */}
          <Reveal delay={0.1}>
            <div style={{ marginBottom:40 }}>
              <div style={{ fontSize:11, fontWeight:600, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:16 }}>Follow the project</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                {[
                  { icon:"fab fa-github",     href:"https://github.com/Jaden300/myojam",  label:"GitHub",   sub:"Source code" },
                  { icon:"fab fa-linkedin-in", href:"https://linkedin.com/in/jaden-wong09",label:"LinkedIn", sub:"Updates"     },
                  { icon:"fab fa-instagram",  href:"https://instagram.com/YOUR_HANDLE",   label:"Instagram",sub:"@myojam"     },
                  { icon:"fab fa-x-twitter",  href:"https://x.com/YOUR_HANDLE",           label:"X",        sub:"@myojam"     },
                  { icon:"fab fa-youtube",    href:"https://youtube.com/YOUR_CHANNEL",    label:"YouTube",  sub:"Demos"       },
                  { icon:"fab fa-tiktok",     href:"https://tiktok.com/@YOUR_HANDLE",    label:"TikTok",   sub:"@myojam"     },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" style={{
                    background:"var(--bg-secondary)", border:"1px solid var(--border)",
                    borderRadius:12, padding:"14px 16px",
                    display:"flex", alignItems:"center", gap:10,
                    transition:"border-color 0.2s, transform 0.2s"
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(255,45,120,0.3)"; e.currentTarget.style.transform="translateY(-2px)" }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.transform="translateY(0)" }}
                  >
                    <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, color:"var(--accent)", flexShrink:0 }}>
                      <i className={s.icon}/>
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:"var(--text)" }}>{s.label}</div>
                      <div style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>{s.sub}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

        {/* Links */}
        <StaggerList
          items={[
            ["GitHub", "Open an issue or pull request", "https://github.com/Jaden300/myosignal", "⌥"],
            ["Ninapro dataset", "Source data for the model", "https://ninapro.hevs.ch", "📊"],
          ]}
          columns={1}
          gap={12}
          renderItem={([label, desc, href, icon], i) => (
            <Reveal delay={i * 0.08}>
              <HoverCard
                color="rgba(255,45,120,0.08)"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  overflow: "hidden",
                  cursor: "pointer"
                }}
                onClick={() => window.open(href, "_blank")}
              >
                <div
                  style={{
                    padding: "20px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: "var(--accent-soft)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18
                      }}
                    >
                      {icon}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "var(--text)",
                          marginBottom: 4
                        }}
                      >
                        {label}
                      </div>

                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--text-secondary)",
                          fontWeight: 300
                        }}
                      >
                        {desc}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: 18, color: "var(--text-tertiary)" }}>
                    ↗
                  </span>
                </div>
              </HoverCard>
            </Reveal>
          )}
        />
      
        <div style={{ marginTop: 32 }}></div>
        <div style={{
          background: "var(--bg-secondary)", borderRadius: "var(--radius)",
          border: "1px solid var(--border)", overflow: "hidden"
        }}>
          <iframe
            src="https://tally.so/embed/gDZlkJ?hideTitle=1&transparentBackground=1&dynamicHeight=1"
            width="100%"
            height="500"
            frameBorder="0"
            marginHeight="0"
            marginWidth="0"
            title="Contact form"
            style={{ display: "block" }}
          />
        </div>

        <p style={{
          marginTop: 40, fontSize: 13, color: "var(--text-tertiary)",
          lineHeight: 1.6, fontWeight: 300
        }}>
          myojam is an open-source student research project. MIT License. Not a medical device.
        </p>
      </div>

    <Footer />
    </div>
  )
}