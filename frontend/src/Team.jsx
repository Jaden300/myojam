import Navbar from "./Navbar"
import Footer from "./Footer"

function FaceAvatar({ seed, size = 80 }) {
  const s = seed * 1000
  const skinTones = ["#f5dce4", "#e8c9a0", "#c8956c", "#8d5524", "#f5dce4"]
  const hairColors = ["#1a1a1a", "#4a2c0a", "#8B4513", "#FF2D78", "#2c2c2c"]
  const skin = skinTones[seed % skinTones.length]
  const hair = hairColors[(seed * 3) % hairColors.length]
  const eyeOffset = (seed % 3) - 1

  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      {/* Background circle */}
      <circle cx="40" cy="40" r="38" fill="#FFF0F5" stroke="#FFD6E7" strokeWidth="1.5"/>
      
      {/* Neck */}
      <rect x="33" y="54" width="14" height="12" rx="4" fill={skin}/>
      
      {/* Head */}
      <ellipse cx="40" cy="38" rx="20" ry="22" fill={skin}/>
      
      {/* Hair */}
      {seed % 3 === 0 && (
        // Short hair
        <>
          <ellipse cx="40" cy="20" rx="20" ry="10" fill={hair}/>
          <rect x="20" y="18" width="40" height="10" fill={hair}/>
        </>
      )}
      {seed % 3 === 1 && (
        // Longer hair
        <>
          <ellipse cx="40" cy="20" rx="20" ry="10" fill={hair}/>
          <rect x="20" y="18" width="6" height="22" rx="3" fill={hair}/>
          <rect x="54" y="18" width="6" height="22" rx="3" fill={hair}/>
          <rect x="20" y="18" width="40" height="8" fill={hair}/>
        </>
      )}
      {seed % 3 === 2 && (
        // Curly/voluminous
        <>
          {[...Array(8)].map((_, i) => (
            <circle key={i}
              cx={22 + i * 5.5} cy={18 + Math.sin(i) * 3}
              r="7" fill={hair}/>
          ))}
        </>
      )}

      {/* Eyes */}
      <ellipse cx={33 + eyeOffset} cy="37" rx="3.5" ry="4" fill="white"/>
      <ellipse cx={47 + eyeOffset} cy="37" rx="3.5" ry="4" fill="white"/>
      <circle cx={33 + eyeOffset} cy="37.5" r="2.2" fill="#1D1D1F"/>
      <circle cx={47 + eyeOffset} cy="37.5" r="2.2" fill="#1D1D1F"/>
      <circle cx={34 + eyeOffset} cy="36.5" r="0.7" fill="white"/>
      <circle cx={48 + eyeOffset} cy="36.5" r="0.7" fill="white"/>

      {/* Eyebrows */}
      <path d={`M ${29 + eyeOffset} 31 Q ${33 + eyeOffset} 29 ${37 + eyeOffset} 31`}
        stroke="#1D1D1F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d={`M ${43 + eyeOffset} 31 Q ${47 + eyeOffset} 29 ${51 + eyeOffset} 31`}
        stroke="#1D1D1F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* Nose */}
      <path d="M 40 39 Q 38 44 36 45 Q 40 46.5 44 45 Q 42 44 40 39"
        fill="none" stroke={skin === "#f5dce4" ? "#e8b8c8" : "#a06040"}
        strokeWidth="1.2" strokeLinecap="round"/>

      {/* Smile */}
      <path d={seed % 2 === 0
        ? "M 34 50 Q 40 55 46 50"
        : "M 33 50 Q 40 56 47 50"}
        stroke="#1D1D1F" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

const TEAM = [
  {
    seed: 1,
    name: "Jaden W.",
    role: "Founder & Lead Engineer",
    bio: "Designed and built the full myojam system end-to-end — from training the EMG gesture classification model on the Ninapro DB5 dataset to architecting the FastAPI backend, React frontend, and native macOS desktop application. Passionate about building technology that expands human capability.",
    tags: ["Machine Learning", "Full-Stack", "Biomedical Signal Processing"]
  },
  {
    seed: 2,
    name: "Matthew T.",
    role: "Hardware Consultant",
    bio: "Provided expertise on embedded systems and sensor integration, advising on the MyoWare 2.0 hardware setup and Arduino signal pipeline. Contributed to early-stage hardware testing and electrode placement methodology.",
    tags: ["Embedded Systems", "Arduino", "Signal Acquisition"]
  },
  {
    seed: 0,
    name: "Darren N.",
    role: "Research Advisor",
    bio: "Contributed to the research methodology, reviewing the signal processing pipeline and feature extraction approach. Provided feedback on model evaluation strategy and cross-subject generalization.",
    tags: ["Signal Processing", "Research", "Model Evaluation"]
  },
]

export default function Team() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "100px 32px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--accent-soft)",
            border: "1px solid rgba(255,45,120,0.15)",
            borderRadius: 100, padding: "5px 16px",
            fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 24
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }}/>
            The people behind myojam
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 600,
            letterSpacing: "-1.5px", color: "var(--text)", marginBottom: 16
          }}>Meet the team</h1>
          <p style={{
            fontSize: 17, color: "var(--text-secondary)", fontWeight: 300,
            maxWidth: 520, margin: "0 auto", lineHeight: 1.7
          }}>
            A small group of engineers and researchers building the future of assistive human-computer interaction.
          </p>
        </div>

        {/* Team grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24
        }}>
          {TEAM.map((member, i) => (
            <div key={member.name} style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: 32,
              display: "flex", flexDirection: "column", alignItems: "center",
              textAlign: "center", gap: 16,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)"
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,45,120,0.1)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <FaceAvatar seed={member.seed} size={80} />

              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.3px" }}>
                  {member.name}
                </div>
                <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500, marginTop: 4 }}>
                  {member.role}
                </div>
              </div>

              <p style={{
                fontSize: 14, color: "var(--text-secondary)",
                lineHeight: 1.65, fontWeight: 300
              }}>
                {member.bio}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
                {member.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: 11, fontWeight: 500,
                    color: "var(--accent)",
                    background: "var(--accent-soft)",
                    border: "1px solid rgba(255,45,120,0.15)",
                    borderRadius: 100, padding: "3px 10px"
                  }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{
          textAlign: "center", marginTop: 72,
          padding: "32px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)"
        }}>
          <div style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7 }}>
            myojam was built with a deep belief that technology should adapt to people,
            not the other way around. We're just getting started.
          </div>
        </div>

      </div>
    </div>
  )
}