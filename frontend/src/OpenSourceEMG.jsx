import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "./Footer"
import ArticleBar from "./ArticleUtils"

function FaceAvatar({ seed, size = 48 }) {
  const skinTones = ["#f5dce4", "#e8c9a0", "#c8956c", "#8d5524", "#f5dce4"]
  const hairColors = ["#1a1a1a", "#4a2c0a", "#8B4513", "#FF2D78", "#2c2c2c"]
  const skin = skinTones[seed % skinTones.length]
  const hair = hairColors[(seed * 3) % hairColors.length]
  const eyeOffset = (seed % 3) - 1
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="38" fill="#FFF0F5" stroke="#FFD6E7" strokeWidth="1.5"/>
      <rect x="33" y="54" width="14" height="12" rx="4" fill={skin}/>
      <ellipse cx="40" cy="38" rx="20" ry="22" fill={skin}/>
      {seed % 3 === 0 && (<><ellipse cx="40" cy="20" rx="20" ry="10" fill={hair}/><rect x="20" y="18" width="40" height="10" fill={hair}/></>)}
      {seed % 3 === 1 && (<><ellipse cx="40" cy="20" rx="20" ry="10" fill={hair}/><rect x="20" y="18" width="6" height="22" rx="3" fill={hair}/><rect x="54" y="18" width="6" height="22" rx="3" fill={hair}/><rect x="20" y="18" width="40" height="8" fill={hair}/></>)}
      {seed % 3 === 2 && ([...Array(8)].map((_, i) => <circle key={i} cx={22 + i * 5.5} cy={18 + Math.sin(i) * 3} r="7" fill={hair}/>))}
      <ellipse cx={33 + eyeOffset} cy="37" rx="3.5" ry="4" fill="white"/>
      <ellipse cx={47 + eyeOffset} cy="37" rx="3.5" ry="4" fill="white"/>
      <circle cx={33 + eyeOffset} cy="37.5" r="2.2" fill="#1D1D1F"/>
      <circle cx={47 + eyeOffset} cy="37.5" r="2.2" fill="#1D1D1F"/>
      <circle cx={34 + eyeOffset} cy="36.5" r="0.7" fill="white"/>
      <circle cx={48 + eyeOffset} cy="36.5" r="0.7" fill="white"/>
      <path d={`M ${29+eyeOffset} 31 Q ${33+eyeOffset} 29 ${37+eyeOffset} 31`} stroke="#1D1D1F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d={`M ${43+eyeOffset} 31 Q ${47+eyeOffset} 29 ${51+eyeOffset} 31`} stroke="#1D1D1F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M 40 39 Q 38 44 36 45 Q 40 46.5 44 45 Q 42 44 40 39" fill="none" stroke={skin === "#f5dce4" ? "#e8b8c8" : "#a06040"} strokeWidth="1.2" strokeLinecap="round"/>
      <path d={seed % 2 === 0 ? "M 34 50 Q 40 55 46 50" : "M 33 50 Q 40 56 47 50"} stroke="#1D1D1F" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

const SECTIONS = [
  {
    num: "01", tag: "History", title: "EMG in prosthetics: a 60-year head start",
    body: "Myoelectric prosthetics — artificial limbs controlled by muscle signals — have existed since the 1960s. The core principle hasn't changed much: electrodes on the residual limb pick up EMG signals, which are amplified and used to open or close a prosthetic hand. For decades this technology was confined to specialised clinics and cost tens of thousands of dollars. The hardware was bulky, the software proprietary, and the training required months of occupational therapy. EMG worked — it just wasn't accessible.",
    callout: null,
  },
  {
    num: "02", tag: "The shift", title: "What open-source changes",
    body: "The open-source movement has quietly transformed EMG research. Public datasets like Ninapro (now containing data from hundreds of subjects performing dozens of gestures), affordable sensor hardware like the MyoWare 2.0, and accessible machine learning libraries like scikit-learn have collectively lowered the barrier to entry from a PhD and a grant to an afternoon and a GitHub account. Researchers can now reproduce, extend, and challenge each other's work. Students can build working classifiers in a weekend. Independent developers can ship real products without institutional backing.",
    callout: "The Ninapro database — used to train myojam's classifier — is freely available at ninapro.hevs.ch. It contains EMG recordings from 67 intact and amputee subjects performing up to 52 hand movements. This kind of open benchmark was unthinkable in the 1990s.",
  },
  {
    num: "03", tag: "The gap", title: "Why consumer EMG is still hard",
    body: "Despite the progress, consumer EMG faces real engineering challenges that clinical systems solved with money. Electrode placement reproducibility is the biggest: every time you reattach electrodes, the signal changes slightly — enough to confuse a classifier trained on a previous session. Clinical systems solve this with precise electrode positioning rigs and per-session calibration routines. Consumer hardware typically doesn't. Signal quality is another issue: consumer sensors amplify noise alongside signal, and cheap electrodes have higher contact impedance. Cross-talk — picking up signals from neighbouring muscles — blurs the distinction between fine finger movements.",
    callout: null,
  },
  {
    num: "04", tag: "Solutions", title: "How researchers are closing the gap",
    body: "Three approaches are gaining traction. Transfer learning adapts a model trained on many subjects to a new individual with just a few minutes of calibration data — dramatically reducing setup time. High-density electrode arrays (8×8 or larger grids instead of a handful of bipolar pairs) provide a richer spatial picture of muscle activity, improving finger-level resolution. And domain adaptation techniques make classifiers more robust to the inevitable shift in signal characteristics between sessions and placements. None of these require fundamentally new hardware — they're software and methodology advances that can be layered onto existing consumer sensors.",
    callout: "myojam's cross-subject approach — train on 10 people, test on new people — is a step toward this goal. 84.85% accuracy without any individual calibration is a reasonable baseline. With even a short calibration session per user, that number climbs substantially.",
  },
  {
    num: "05", tag: "Accessibility", title: "Who actually benefits",
    body: "The assistive technology case for EMG is compelling precisely because it serves people who have the most to gain and the least access to expensive alternatives. Someone with ALS losing fine motor control, a child with cerebral palsy who can't operate a standard keyboard, a stroke survivor relearning computer use — for these users, a $50 sensor and an open-source classifier could be genuinely life-changing. The barrier isn't the technology itself; it's the ecosystem around it: setup complexity, lack of mainstream software support, and the absence of a community maintaining and improving the tools over time.",
    callout: null,
  },
  {
    num: "06", tag: "myojam's role", title: "A working proof of concept",
    body: "myojam doesn't claim to be a clinical device or a finished product. What it demonstrates is that the full pipeline — from electrode to computer action — can be built openly, cheaply, and reproducibly. Every design decision is documented. Every line of code is public. Every dataset used is freely available. The goal is to give future developers, researchers, and tinkerers a working starting point rather than a blank page. If someone improves on the classifier, adds a new gesture, or adapts the system for a different use case, that's exactly the point.",
    callout: null,
  },
]

export default function OpenSourceEMG() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* Hero banner */}
      <div style={{
        background: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 70%)",
        borderBottom: "1px solid var(--border)",
        padding: "100px 32px 56px",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <span onClick={() => navigate("/education")} style={{ fontSize: 13, color: "var(--accent)", cursor: "pointer", fontWeight: 400 }}>Education</span>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>→</span>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 300 }}>Open-source EMG</span>
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--accent-soft)", border: "1px solid rgba(255,45,120,0.15)",
            borderRadius: 100, padding: "5px 16px",
            fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 24
          }}>
            Accessibility · 6 min read
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 600,
            letterSpacing: "-1.5px", color: "var(--text)", lineHeight: 1.08, marginBottom: 24
          }}>
            From lab to laptop:<br />
            <span style={{ color: "var(--accent)" }}>democratising EMG.</span>
          </h1>

          <p style={{
            fontSize: 17, color: "var(--text-secondary)", fontWeight: 300,
            lineHeight: 1.75, marginBottom: 36, maxWidth: 580
          }}>
            EMG-based prosthetics have existed for 60 years. So why isn't muscle-computer control mainstream?
            How open-source tools, public datasets, and affordable hardware are changing that — and where myojam fits in.
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <FaceAvatar seed={1} size={40} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Jaden W.</div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300 }}>Founder & Lead Engineer · March 28, 2026</div>
            </div>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 32px 80px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {SECTIONS.map((s, i) => (
            <div key={s.num} style={{
              padding: "48px 0",
              borderBottom: i < SECTIONS.length - 1 ? "1px solid var(--border)" : "none"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "var(--accent-soft)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 600, color: "var(--accent)", flexShrink: 0
                }}>{s.num}</div>
                <span style={{ fontSize: 11, fontWeight: 500, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.tag}</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: "var(--text)", letterSpacing: "-0.4px", marginBottom: 16 }}>{s.title}</h2>
              <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.8, fontWeight: 300, marginBottom: s.callout ? 24 : 0 }}>{s.body}</p>
              {s.callout && (
                <div style={{
                  background: "var(--accent-soft)", border: "1px solid rgba(255,45,120,0.15)",
                  borderLeft: "3px solid var(--accent)",
                  borderRadius: "0 var(--radius-sm) var(--radius-sm) 0", padding: "16px 20px"
                }}>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, fontWeight: 400, margin: 0 }}>{s.callout}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Conclusion */}
        <div style={{
          marginTop: 56, background: "var(--bg-secondary)",
          borderRadius: "var(--radius)", padding: "40px",
          border: "1px solid var(--border)"
        }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>Conclusion</div>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.8, fontWeight: 300, margin: 0 }}>
            The technology to build EMG-based assistive interfaces has existed for decades.
            What's changed is who can build them. Open datasets, affordable sensors, and accessible
            software have moved this from the domain of well-funded labs to anyone with curiosity and a weekend.
            That shift matters — not just for research, but for the people who stand to benefit most
            from technology that meets them where they are, rather than requiring them to adapt to what's convenient.
          </p>
        </div>

        <ArticleBar
          url="https://myojam.com/education/open-source-emg"
          title="From lab to laptop: democratising EMG — myojam"
          citation={{
            apa: `W., J. (2026, March 28). From lab to laptop: Democratising EMG. myojam. https://myojam.com/education/open-source-emg`
          }}
          presetLikes={31}
          storageKey="like_open_source_emg"
        />

        <div style={{ marginTop: 32, display: "flex", justifyContent: "center" }}>
          <button onClick={() => navigate("/education")} style={{
            background: "transparent", color: "var(--text-secondary)",
            border: "1px solid var(--border-mid)", borderRadius: 100,
            padding: "10px 24px", fontSize: 13,
            fontFamily: "var(--font)", fontWeight: 400, cursor: "pointer"
          }}>← Back to Education</button>
        </div>
      </div>

      <Footer />
    </div>
  )
}