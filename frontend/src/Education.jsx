import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import Footer from "./Footer"

const ARTICLES = [
  {
    slug: "/education/emg-explainer",
    tag: "Foundations",
    title: "The science of muscle-computer interfaces",
    summary: "What is EMG, how does surface signal acquisition work, and how does myojam turn a forearm twitch into a computer action? A full explainer from the biology up.",
    readTime: "8 min read",
    author: "Jaden Wong",
    date: "2026-04-06",
    dateLabel: "April 6, 2026",
    likes: 47,
    helpfulness: 1,
  },
  {
    slug: "/education/random-forest-emg",
    tag: "Machine Learning",
    title: "Why Random Forest? The classifier behind myojam",
    summary: "Why not a neural network? How ensemble tree methods handle noisy biomedical signals, and what the 84.85% cross-subject accuracy figure actually means in practice.",
    readTime: "7 min read",
    author: "Jaden Wong",
    date: "2026-03-15",
    dateLabel: "March 15, 2026",
    likes: 38,
    helpfulness: 2,
  },
  {
    slug: "/education/open-source-emg",
    tag: "Accessibility",
    title: "From lab to laptop: democratising EMG",
    summary: "EMG-based prosthetics have existed for 60 years. How open datasets, affordable hardware, and open-source tools are finally making muscle-computer control accessible.",
    readTime: "6 min read",
    author: "Jaden Wong",
    date: "2026-03-28",
    dateLabel: "March 28, 2026",
    likes: 31,
    helpfulness: 3,
  },
  {
    slug: "/education/ninapro-db5",
    tag: "Dataset",
    title: "Inside Ninapro DB5: the dataset that trains myojam",
    summary: "Where does the training data come from? What is Ninapro, what does DB5 contain, and what decisions went into turning 52 hand movements into a 6-class classifier?",
    readTime: "6 min read",
    author: "Jaden Wong",
    date: "2026-02-20",
    dateLabel: "February 20, 2026",
    likes: 24,
    helpfulness: 4,
  },
]

const SORT_OPTIONS = [
  { key: "latest",     label: "Latest" },
  { key: "popular",    label: "Most popular" },
  { key: "helpful",    label: "Most helpful" },
]

function sorted(articles, key) {
  const a = [...articles]
  if (key === "latest")  return a.sort((x, y) => y.date.localeCompare(x.date))
  if (key === "popular") return a.sort((x, y) => y.likes - x.likes)
  if (key === "helpful") return a.sort((x, y) => x.helpfulness - y.helpfulness)
  return a
}

export default function Education() {
  const navigate = useNavigate()
  const [sortKey, setSortKey] = useState("latest")

  const displayed = sorted(ARTICLES, sortKey)

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* Banner */}
      <div style={{
        background: "linear-gradient(135deg, #fff0f5 0%, #ffffff 60%)",
        borderBottom: "1px solid var(--border)",
        padding: "100px 32px 64px",
      }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "var(--accent-soft)", border: "1px solid rgba(255,45,120,0.15)",
            borderRadius: 100, padding: "5px 16px",
            fontSize: 13, color: "var(--accent)", fontWeight: 500, marginBottom: 28
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }}/>
            Educational hub
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 56px)", fontWeight: 600,
            letterSpacing: "-1.5px", color: "var(--text)", marginBottom: 20, lineHeight: 1.08
          }}>
            Learn about EMG<br />
            <span style={{ color: "var(--accent)" }}>& assistive technology.</span>
          </h1>
          <p style={{
            fontSize: 17, color: "var(--text-secondary)", fontWeight: 300,
            lineHeight: 1.7, maxWidth: 560
          }}>
            In-depth articles on the science behind myojam — from how muscles generate electrical signals
            to how machine learning classifies them into computer actions.
          </p>
        </div>
      </div>

      {/* Articles */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 32px 80px" }}>

        {/* Sort bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 300, marginRight: 4 }}>Sort by</span>
          {SORT_OPTIONS.map(opt => (
            <button key={opt.key} onClick={() => setSortKey(opt.key)} style={{
              background: sortKey === opt.key ? "var(--accent-soft)" : "var(--bg-secondary)",
              border: `1px solid ${sortKey === opt.key ? "rgba(255,45,120,0.2)" : "var(--border)"}`,
              borderRadius: 100, padding: "6px 14px",
              fontSize: 12, fontWeight: sortKey === opt.key ? 500 : 400,
              color: sortKey === opt.key ? "var(--accent)" : "var(--text-secondary)",
              cursor: "pointer", fontFamily: "var(--font)", transition: "all 0.15s"
            }}>{opt.label}</button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {displayed.map(a => (
            <div
              key={a.slug}
              onClick={() => navigate(a.slug)}
              style={{
                background: "var(--bg-secondary)", border: "1px solid var(--border)",
                borderRadius: "var(--radius)", padding: "32px",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-3px)"
                e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,45,120,0.09)"
                e.currentTarget.style.borderColor = "rgba(255,45,120,0.2)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "none"
                e.currentTarget.style.borderColor = "var(--border)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 500, color: "var(--accent)",
                      background: "var(--accent-soft)", border: "1px solid rgba(255,45,120,0.15)",
                      borderRadius: 100, padding: "3px 10px"
                    }}>{a.tag}</span>
                    <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300 }}>{a.readTime}</span>
                    <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300 }}>♥ {a.likes}</span>
                  </div>
                  <h2 style={{
                    fontSize: 20, fontWeight: 600, color: "var(--text)",
                    letterSpacing: "-0.3px", marginBottom: 10, lineHeight: 1.3
                  }}>{a.title}</h2>
                  <p style={{
                    fontSize: 14, color: "var(--text-secondary)",
                    lineHeight: 1.7, fontWeight: 300, marginBottom: 16
                  }}>{a.summary}</p>
                  <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 300 }}>
                    By {a.author} · {a.dateLabel}
                  </span>
                </div>
                <span style={{ fontSize: 20, color: "var(--text-tertiary)", flexShrink: 0, marginTop: 4 }}>→</span>
              </div>
            </div>
          ))}
        </div>


        <p style={{
          marginTop: 48, fontSize: 13, color: "var(--text-tertiary)",
          fontWeight: 300, textAlign: "center", lineHeight: 1.7
        }}>
          More articles coming soon — covering signal processing, machine learning for biosignals,
          and the future of assistive input devices.
        </p>
      </div>

      {/* Submit article embed */}
        <div style={{ marginTop: 64, maxWidth: 820, margin: "64px auto 0" }}>
          <div style={{ marginBottom: 24 }}>
            <h2 style={{
              fontSize: 24, fontWeight: 600, color: "var(--text)",
              letterSpacing: "-0.5px", marginBottom: 10
            }}>Submit your own article</h2>
            <p style={{
              fontSize: 15, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7
            }}>
              Written something about EMG, assistive technology, or myojam?
              Submit it for review — accepted articles are published here with full author credit.
            </p>
          </div>
          <div style={{
            background: "var(--bg-secondary)", borderRadius: "var(--radius)",
            border: "1px solid var(--border)", overflow: "hidden",
            padding: "0 24px"
          }}>
            <iframe
              src="https://tally.so/embed/SUBMIT_ID?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
              width="100%"
              height="600"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
              title="Article submission"
              style={{ display: "block" }}
            />
          </div>
        </div>

      <Footer />
    </div>
  )
}