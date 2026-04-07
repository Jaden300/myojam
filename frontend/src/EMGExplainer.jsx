import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "./Footer"

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
    num: "01", tag: "The basics", title: "What is EMG?",
    body: "Electromyography (EMG) is the measurement of electrical activity produced by skeletal muscles. When your brain tells a muscle to contract, it sends an electrical signal down a motor neuron. That signal causes muscle fibres to depolarise — producing a tiny voltage change detectable right through your skin. Surface EMG (sEMG) captures this using adhesive electrodes placed on the skin surface. No needles, no punctures — just electrodes picking up the electrical chatter of your muscles as you move.",
    callout: null,
  },
  {
    num: "02", tag: "The signal", title: "What does an EMG signal look like?",
    body: "At rest, an EMG signal is mostly noise — a faint, random flutter around zero. When you flex a finger, a burst of activity erupts: rapid oscillations between roughly −1mV and +1mV, lasting as long as the contraction. The more forcefully you contract, the more motor units fire simultaneously, and the larger and more complex the burst becomes. The signal is also contaminated by powerline interference (50/60Hz hum), motion artefacts from electrode movement, and cross-talk from neighbouring muscles — which is why filtering is essential before any analysis.",
    callout: "The human EMG frequency band of interest sits between 20Hz and 500Hz. myojam uses a 20–90Hz bandpass filter to isolate the most gesture-discriminative content while rejecting noise.",
  },
  {
    num: "03", tag: "Our hardware", title: "How MyoWare 2.0 fits in",
    body: "Medical-grade EMG systems cost thousands of dollars and require trained clinicians to operate. The MyoWare 2.0 is a consumer-grade muscle sensor that makes surface EMG accessible for hobbyists, students, and researchers on a budget. It amplifies and rectifies the raw differential EMG signal from bipolar electrodes into a single analogue output voltage — simple enough for an Arduino to read over a standard analogue pin. myojam uses it to showcase what EMG-based assistive technology looks like in practice, and to demonstrate that the barrier to entry for this kind of research has never been lower.",
    callout: "Important caveat: MyoWare 2.0 is not a medical device and is not intended for clinical use. myojam uses it to demonstrate and explore EMG-based assistive technology concepts — not for diagnosis or treatment.",
  },
  {
    num: "04", tag: "Signal processing", title: "From raw signal to clean data",
    body: "The raw signal from the Arduino arrives at 200 samples per second (200Hz). Before classification, it goes through two processing steps. First, a 4th-order Butterworth bandpass filter removes frequencies below 20Hz (DC drift, motion artefacts) and above 90Hz (high-frequency noise). Second, the cleaned signal is cut into overlapping 200-sample windows — each representing one second of muscle activity — with 50-sample steps between windows. This sliding window approach gives the classifier a fresh snapshot of the forearm roughly every 250ms.",
    callout: null,
  },
  {
    num: "05", tag: "Machine learning", title: "Teaching a computer to read gestures",
    body: "Raw waveforms are hard to classify directly — they vary too much between people, sessions, and electrode placements. Instead, myojam extracts four time-domain features from each of the 16 electrode channels per window: Mean Absolute Value (average signal energy), Root Mean Square (signal power), Zero Crossing rate (frequency content proxy), and Waveform Length (signal complexity). This compresses each window into a 64-number vector that captures the essential character of the muscle activation pattern. A Random Forest classifier — an ensemble of 500 decision trees — maps that vector to one of 6 gesture classes. Trained on 16,269 labelled windows from 10 subjects in the public Ninapro DB5 dataset, it achieves 84.85% cross-subject accuracy.",
    callout: "Cross-subject accuracy matters because it tests whether the model works on people it has never seen before — a much harder and more realistic challenge than testing on the same people it trained on.",
  },
  {
    num: "06", tag: "The bigger picture", title: "EMG as assistive technology",
    body: "For people with limited hand or arm mobility — from spinal cord injuries to ALS to stroke — traditional input devices like keyboards and mice can be inaccessible or impossible to use. EMG-based interfaces offer an alternative: control a computer through subtle muscle contractions that don't require fine motor control or physical contact with a device. Commercial prosthetic hands have used EMG control for decades. What myojam explores is whether the same principle — read muscles, infer intent, execute action — can be made accessible, affordable, and open-source for broader assistive technology applications.",
    callout: null,
  },
  {
    num: "07", tag: "The future", title: "Where this technology is going",
    body: "Consumer EMG is still early. Current limitations include electrode placement variability (signals differ every time you put them on), cross-talk between muscles, and the need for per-user calibration. Research directions include deep learning models that adapt to individual users in real time, higher-density electrode arrays that resolve finer finger movements, and dry electrodes that don't require conductive gel. As hardware improves and machine learning matures, EMG interfaces have the potential to become a mainstream assistive modality — and possibly a general-purpose input method for everyone.",
    callout: null,
  },
]

export default function EMGExplainer() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* Hero banner */}
      <div style={{
        background: "linear-gradient(135deg, #fff0f5 0%, #fafafa 70%)",
        borderBottom: "1px solid var(--border)",
        padding: "100px 32px 56px",
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <span
              onClick={() => navigate("/education")}
              style={{ fontSize: 13, color: "var(--accent)", cursor: "pointer", fontWeight: 400 }}
            >Education</span>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>→</span>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 300 }}>EMG explainer</span>
          </div>

          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--accent-soft)", border: "1px solid rgba(255,45,120,0.15)",
            borderRadius: 100, padding: "5px 16px",
            fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 24
          }}>
            Foundations · 8 min read
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 600,
            letterSpacing: "-1.5px", color: "var(--text)", lineHeight: 1.08, marginBottom: 24
          }}>
            The science of<br />muscle-computer interfaces.
          </h1>

          <p style={{
            fontSize: 17, color: "var(--text-secondary)", fontWeight: 300,
            lineHeight: 1.75, marginBottom: 36, maxWidth: 580
          }}>
            What is EMG, how does surface signal acquisition work, and how does myojam
            turn a forearm twitch into a computer action? A full explainer from the biology up.
          </p>

          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <FaceAvatar seed={1} size={40} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>Jaden W.</div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300 }}>
                Founder & Lead Engineer · April 2026
              </div>
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
                <span style={{
                  fontSize: 11, fontWeight: 500, color: "var(--accent)",
                  textTransform: "uppercase", letterSpacing: "0.06em"
                }}>{s.tag}</span>
              </div>
              <h2 style={{
                fontSize: 22, fontWeight: 600, color: "var(--text)",
                letterSpacing: "-0.4px", marginBottom: 16
              }}>{s.title}</h2>
              <p style={{
                fontSize: 15, color: "var(--text-secondary)",
                lineHeight: 1.8, fontWeight: 300, marginBottom: s.callout ? 24 : 0
              }}>{s.body}</p>
              {s.callout && (
                <div style={{
                  background: "var(--accent-soft)",
                  border: "1px solid rgba(255,45,120,0.15)",
                  borderLeft: "3px solid var(--accent)",
                  borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                  padding: "16px 20px"
                }}>
                  <p style={{
                    fontSize: 13, color: "var(--text-secondary)",
                    lineHeight: 1.7, fontWeight: 400, margin: 0
                  }}>{s.callout}</p>
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
          <div style={{
            fontSize: 11, fontWeight: 500, color: "var(--accent)",
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14
          }}>Conclusion</div>
          <p style={{
            fontSize: 15, color: "var(--text-secondary)",
            lineHeight: 1.8, fontWeight: 300, margin: 0
          }}>
            Surface EMG is a window into the body's intent. With the right hardware, signal processing,
            and machine learning, it becomes a practical interface between human movement and digital action.
            myojam demonstrates that this technology doesn't have to be expensive, proprietary, or inaccessible —
            it can be open-source, reproducible, and built with $50 of consumer hardware and public research data.
            The gap between lab and living room is closing.
          </p>
        </div>

        {/* Back link */}
        <div style={{ marginTop: 48, display: "flex", justifyContent: "center" }}>
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