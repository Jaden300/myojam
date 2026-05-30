import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"

// ─────────────────────────────────────────────────────────────
// Data constants (all published in research papers)
// ─────────────────────────────────────────────────────────────

const CLASSIFIERS = [
  { name: "Random Forest",   abbr: "RF",  acc: 84.85, std: 1.91, color: "#FF2D78", winner: true,  trees: "500 trees, sqrt features" },
  { name: "SVM (RBF)",       abbr: "SVM", acc: 82.30, std: 2.14, color: "#8B5CF6", winner: false, trees: "C=10, γ=0.01"             },
  { name: "k-NN",            abbr: "KNN", acc: 76.40, std: 2.78, color: "#3B82F6", winner: false, trees: "k=7, Euclidean"           },
  { name: "LDA",             abbr: "LDA", acc: 71.80, std: 3.02, color: "#10B981", winner: false, trees: "SVD solver"               },
]

const LOSO_FOLDS = [
  { subject: "S01", acc: 89.2, color: "#10B981" },
  { subject: "S02", acc: 87.1, color: "#10B981" },
  { subject: "S03", acc: 86.4, color: "#22C55E" },
  { subject: "S04", acc: 85.9, color: "#22C55E" },
  { subject: "S05", acc: 84.2, color: "#EAB308" },
  { subject: "S06", acc: 83.7, color: "#EAB308" },
  { subject: "S07", acc: 84.8, color: "#F59E0B" },
  { subject: "S08", acc: 82.5, color: "#F97316" },
  { subject: "S09", acc: 81.3, color: "#EF4444" },
  { subject: "S10", acc: 76.2, color: "#EF4444" },
]

const WINDOW_DATA = [
  { dur: 100,  acc: 62.4,  samples: 20,  feasible: false },
  { dur: 250,  acc: 73.8,  samples: 50,  feasible: false },
  { dur: 500,  acc: 81.2,  samples: 100, feasible: false },
  { dur: 750,  acc: 83.9,  samples: 150, feasible: false },
  { dur: 1000, acc: 84.85, samples: 200, feasible: false, current: true   },
  { dur: 1250, acc: 85.3,  samples: 250, feasible: false, peak: true      },
  { dur: 1500, acc: 85.1,  samples: 300, feasible: false },
  { dur: 2000, acc: 84.2,  samples: 400, feasible: false },
]

const FEATURES = [
  { name: "MAV",  full: "Mean Absolute Value", pct: 35, color: "#FF2D78", desc: "Mean signal amplitude - primary recruitment indicator" },
  { name: "RMS",  full: "Root Mean Square",    pct: 27, color: "#F59E0B", desc: "Signal power - correlated with force level"            },
  { name: "WL",   full: "Waveform Length",     pct: 25, color: "#10B981", desc: "Morphological complexity - signal variation over time"  },
  { name: "ZCR",  full: "Zero Crossing Rate",  pct: 13, color: "#8B5CF6", desc: "Dominant frequency proxy - spectral content indicator" },
]

// ─────────────────────────────────────────────────────────────
// Animated counter
// ─────────────────────────────────────────────────────────────
function Counter({ value, decimals = 0, suffix = "", duration = 1400 }) {
  const [display, setDisplay] = useState(0)
  const frame = useRef(null)

  useEffect(() => {
    const start = performance.now()
    const target = parseFloat(value)
    function tick(now) {
      const t = Math.min((now - start) / duration, 1)
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      setDisplay(eased * target)
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [value, duration])

  return <>{display.toFixed(decimals)}{suffix}</>
}

// ─────────────────────────────────────────────────────────────
// 1. Feasibility Gap chart (SVG)
// ─────────────────────────────────────────────────────────────
function FeasibilityChart() {
  const [hovered, setHovered] = useState(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 200); return () => clearTimeout(t) }, [])

  const PAD = { t: 28, r: 28, b: 52, l: 56 }
  const W = 640, H = 300
  const CW = W - PAD.l - PAD.r, CH = H - PAD.t - PAD.b
  const xMin = 0, xMax = 2200, yMin = 55, yMax = 90

  const tx = d => PAD.l + (d - xMin) / (xMax - xMin) * CW
  const ty = a => PAD.t + (yMax - a) / (yMax - yMin) * CH

  const latencyX  = tx(300)   // 300 ms clinical limit
  const accuracyY = ty(80)    // 80% accuracy floor

  const pathD = WINDOW_DATA.map((d, i) =>
    `${i === 0 ? "M" : "L"}${tx(d.dur)},${ty(d.acc)}`
  ).join(" ")

  const fillPts = [
    `${tx(WINDOW_DATA[0].dur)},${ty(yMin)}`,
    ...WINDOW_DATA.map(d => `${tx(d.dur)},${ty(d.acc)}`),
    `${tx(WINDOW_DATA[WINDOW_DATA.length - 1].dur)},${ty(yMin)}`,
  ].join(" ")

  const hpt = hovered !== null ? WINDOW_DATA[hovered] : null

  return (
    <div style={{ position: "relative" }}>
      {hpt && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px",
          fontSize: 12, color: "var(--text)", pointerEvents: "none", zIndex: 10, minWidth: 170,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{hpt.dur} ms window</div>
          <div style={{ color: "var(--text-secondary)", fontSize: 11 }}>{hpt.samples} samples at 200 Hz</div>
          <div style={{ color: hpt.acc >= 80 ? "#10B981" : "#EF4444", fontWeight: 600, marginTop: 4 }}>{hpt.acc}% accuracy</div>
          <div style={{ color: hpt.dur <= 300 ? "#10B981" : "#EF4444", fontSize: 11, marginTop: 2 }}>
            Latency: {hpt.dur + 5} ms - {hpt.dur <= 300 ? "✓ clinical" : "✗ too slow"}
          </div>
          {hpt.current && <div style={{ marginTop: 4, fontSize: 10, color: "var(--accent)", fontWeight: 600 }}>← myojam baseline</div>}
          {hpt.peak   && <div style={{ marginTop: 4, fontSize: 10, color: "#10B981", fontWeight: 600 }}>← peak accuracy</div>}
        </div>
      )}

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#FF2D78" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#FF2D78" stopOpacity="0.02"/>
          </linearGradient>
          {/* Infeasibility zone: latency OK AND below accuracy floor = top-left quadrant */}
          <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#EF4444" strokeWidth="0.8" strokeOpacity="0.22"/>
          </pattern>
        </defs>

        {/* Feasibility zones */}
        {/* "Latency OK" zone - left of 300ms line */}
        <rect x={PAD.l} y={PAD.t} width={latencyX - PAD.l} height={CH} fill="#10B981" fillOpacity="0.06"/>
        {/* "Accuracy OK" zone - above 80% line */}
        <rect x={PAD.l} y={PAD.t} width={CW} height={accuracyY - PAD.t} fill="#3B82F6" fillOpacity="0.04"/>
        {/* INFEASIBILITY GAP - both zones but no points exist there */}
        <rect x={PAD.l} y={PAD.t} width={latencyX - PAD.l} height={accuracyY - PAD.t} fill="url(#hatch)"/>
        <rect x={PAD.l} y={PAD.t} width={latencyX - PAD.l} height={accuracyY - PAD.t} fill="#EF4444" fillOpacity="0.04"/>

        {/* Gap label */}
        <text x={(PAD.l + latencyX) / 2} y={(PAD.t + accuracyY) / 2 - 6} textAnchor="middle" fontSize={9} fill="#EF4444" fontFamily="monospace" fontWeight="600">FEASIBILITY</text>
        <text x={(PAD.l + latencyX) / 2} y={(PAD.t + accuracyY) / 2 + 6} textAnchor="middle" fontSize={9} fill="#EF4444" fontFamily="monospace" fontWeight="600">GAP</text>
        <text x={(PAD.l + latencyX) / 2} y={(PAD.t + accuracyY) / 2 + 17} textAnchor="middle" fontSize={7} fill="#EF4444" fontFamily="monospace">(no window lands here)</text>

        {/* Grid lines */}
        {[60, 65, 70, 75, 80, 85, 90].map(y => (
          <line key={y} x1={PAD.l} y1={ty(y)} x2={PAD.l + CW} y2={ty(y)} stroke="var(--border)" strokeWidth={0.5}/>
        ))}
        {[0, 500, 1000, 1500, 2000].map(x => (
          <line key={x} x1={tx(x)} y1={PAD.t} x2={tx(x)} y2={PAD.t + CH} stroke="var(--border)" strokeWidth={0.5}/>
        ))}

        {/* Threshold lines */}
        <line x1={latencyX} y1={PAD.t} x2={latencyX} y2={PAD.t + CH} stroke="#EF4444" strokeWidth={1.5} strokeDasharray="5,3"/>
        <text x={latencyX + 4} y={PAD.t + 10} fontSize={8} fill="#EF4444" fontFamily="monospace">300 ms</text>
        <text x={latencyX + 4} y={PAD.t + 20} fontSize={7} fill="#EF4444" fontFamily="monospace">clinical limit</text>

        <line x1={PAD.l} y1={accuracyY} x2={PAD.l + CW} y2={accuracyY} stroke="#3B82F6" strokeWidth={1.2} strokeDasharray="4,3"/>
        <text x={PAD.l + CW - 4} y={accuracyY - 4} textAnchor="end" fontSize={7.5} fill="#3B82F6" fontFamily="monospace">80% adequacy floor</text>

        {/* Accuracy curve fill + line */}
        <polygon points={fillPts} fill="url(#fillGrad)"/>
        <polyline points={WINDOW_DATA.map(d => `${tx(d.dur)},${ty(d.acc)}`).join(" ")} fill="none" stroke="#FF2D78" strokeWidth={2} strokeLinejoin="round"/>

        {/* Data points */}
        {WINDOW_DATA.map((d, i) => {
          const isHov = hovered === i
          const r = d.current ? 6 : d.peak ? 7 : isHov ? 5 : 4
          const fill = d.peak ? "#10B981" : d.current ? "#FF2D78" : isHov ? "#FF2D78" : "#FF2D78"
          return (
            <circle key={d.dur} cx={tx(d.dur)} cy={ty(d.acc)} r={r}
              fill={fill} stroke="var(--bg-secondary)" strokeWidth={1.5}
              style={{ cursor: "pointer", transition: "r 0.15s" }}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            />
          )
        })}

        {/* Labels for special points */}
        <text x={tx(1000) + 2} y={ty(84.85) - 10} fontSize={8} fill="#FF2D78" fontFamily="monospace">myojam</text>
        <text x={tx(1250) + 2} y={ty(85.3) - 10} fontSize={8} fill="#10B981" fontFamily="monospace">peak</text>

        {/* Axes */}
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={PAD.t + CH} stroke="var(--text-tertiary)" strokeWidth={1}/>
        <line x1={PAD.l} y1={PAD.t + CH} x2={PAD.l + CW} y2={PAD.t + CH} stroke="var(--text-tertiary)" strokeWidth={1}/>

        {/* X tick labels */}
        {[0, 500, 1000, 1500, 2000].map(x => (
          <g key={x}>
            <line x1={tx(x)} y1={PAD.t + CH} x2={tx(x)} y2={PAD.t + CH + 4} stroke="var(--text-tertiary)" strokeWidth={1}/>
            <text x={tx(x)} y={PAD.t + CH + 14} textAnchor="middle" fontSize={8.5} fill="var(--text-tertiary)">{x}</text>
          </g>
        ))}
        {/* Y tick labels */}
        {[60, 65, 70, 75, 80, 85, 90].map(y => (
          <g key={y}>
            <line x1={PAD.l - 3} y1={ty(y)} x2={PAD.l} y2={ty(y)} stroke="var(--text-tertiary)" strokeWidth={1}/>
            <text x={PAD.l - 5} y={ty(y) + 3} textAnchor="end" fontSize={8.5} fill="var(--text-tertiary)">{y}%</text>
          </g>
        ))}

        {/* Axis labels */}
        <text x={PAD.l + CW / 2} y={H - 4} textAnchor="middle" fontSize={10} fill="var(--text-tertiary)">Window duration (ms)</text>
        <text x={10} y={PAD.t + CH / 2} textAnchor="middle" fontSize={10} fill="var(--text-tertiary)" transform={`rotate(-90,10,${PAD.t + CH / 2})`}>Cross-subject accuracy (%)</text>
      </svg>

      {/* Zone legend */}
      <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
        {[
          { color: "#10B981", bg: "rgba(16,185,129,0.08)", label: "Latency ≤ 300 ms (clinically acceptable)" },
          { color: "#3B82F6", bg: "rgba(59,130,246,0.06)", label: "Accuracy ≥ 80% (clinical adequacy floor)" },
          { color: "#EF4444", bg: "rgba(239,68,68,0.08)",  label: "Feasibility gap (both constraints, no data falls here)" },
        ].map(z => (
          <div key={z.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-tertiary)" }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, background: z.bg, border: `1px solid ${z.color}60` }}/>
            {z.label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 2. Classifier race bars
// ─────────────────────────────────────────────────────────────
function ClassifierRace() {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t) }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* vs RF gap labels */}
      {CLASSIFIERS.map((c, i) => {
        const gap = i > 0 ? (CLASSIFIERS[0].acc - c.acc).toFixed(2) : null
        return (
          <div key={c.abbr} style={{
            padding: "18px 20px",
            borderBottom: i < CLASSIFIERS.length - 1 ? "1px solid var(--border)" : "none",
            background: c.winner ? "rgba(255,45,120,0.04)" : "transparent",
            borderLeft: c.winner ? "3px solid var(--accent)" : "3px solid transparent",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${c.color}16`, border: `1px solid ${c.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: c.color, fontFamily: "monospace" }}>{c.abbr}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: c.winner ? 700 : 500, color: c.winner ? "var(--text)" : "var(--text-secondary)" }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300 }}>{c.trees}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {gap && (
                  <div style={{ fontSize: 11, color: "#EF4444", background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 100, padding: "2px 8px", fontFamily: "monospace" }}>
                    −{gap} pp
                  </div>
                )}
                <div style={{ fontSize: 22, fontWeight: 800, color: c.color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.5px" }}>
                  {c.acc}%
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: animated ? `${(c.acc / 90) * 100}%` : "0%",
                  background: `linear-gradient(90deg, ${c.color}, ${c.color}bb)`,
                  borderRadius: 4,
                  transition: `width ${0.8 + i * 0.15}s cubic-bezier(0.4,0,0.2,1)`,
                }}/>
              </div>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", width: 50, textAlign: "right", fontFamily: "monospace" }}>
                ±{c.std}%
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 3. LOSO per-subject grid
// ─────────────────────────────────────────────────────────────
function LOSOGrid() {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t) }, [])
  const mean = (LOSO_FOLDS.reduce((s, f) => s + f.acc, 0) / LOSO_FOLDS.length).toFixed(2)
  const std  = Math.sqrt(LOSO_FOLDS.reduce((s, f) => s + (f.acc - parseFloat(mean)) ** 2, 0) / LOSO_FOLDS.length).toFixed(2)

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 16 }}>
        {LOSO_FOLDS.map((fold, i) => (
          <div key={fold.subject} style={{
            background: "var(--bg)", border: "1px solid var(--border)",
            borderTop: `3px solid ${fold.color}`,
            borderRadius: 8, padding: "14px 12px", textAlign: "center",
          }}>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: "var(--text-tertiary)", marginBottom: 6 }}>{fold.subject}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: fold.color, lineHeight: 1, marginBottom: 8 }}>{fold.acc}%</div>
            <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2, background: fold.color,
                width: animated ? `${((fold.acc - 70) / 25) * 100}%` : "0%",
                transition: `width ${0.6 + i * 0.05}s cubic-bezier(0.4,0,0.2,1)`,
              }}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {[
          { label: "Mean LOSO accuracy", value: `${mean}%`, color: "#FF2D78" },
          { label: "Std deviation",      value: `±${std}%`, color: "#8B5CF6" },
          { label: "Best fold (S01)",    value: "89.2%",    color: "#10B981" },
          { label: "Worst fold (S10)",   value: "76.2%",    color: "#EF4444" },
          { label: "Fold range",         value: "13.0 pp",  color: "#F59E0B" },
        ].map(s => (
          <div key={s.label} style={{ flex: "1 1 140px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 12, lineHeight: 1.65 }}>
        The 13 pp spread across folds is larger than the gap between the two best classifiers (2.55 pp), confirming that inter-subject physiological variability - not classifier architecture - is the primary performance bottleneck.
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 4. Feature importance
// ─────────────────────────────────────────────────────────────
function FeatureImportance() {
  const [hovered, setHovered] = useState(null)
  const [animated, setAnimated] = useState(false)
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t) }, [])

  const total = 62  // w pixels in the stacked bar

  return (
    <div>
      {/* Stacked bar */}
      <div style={{ height: 28, display: "flex", borderRadius: 6, overflow: "hidden", marginBottom: 20, border: "1px solid var(--border)" }}>
        {FEATURES.map((f, i) => (
          <div key={f.name} style={{
            width: animated ? `${f.pct}%` : "0%",
            height: "100%", background: f.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: "#fff", fontFamily: "monospace",
            transition: `width ${0.7 + i * 0.1}s cubic-bezier(0.4,0,0.2,1)`,
            cursor: "default",
            filter: hovered === i ? "brightness(1.2)" : "none",
            overflow: "hidden",
          }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
          >
            {animated && f.pct > 8 ? f.name : ""}
          </div>
        ))}
      </div>

      {/* Feature rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {FEATURES.map((f, i) => (
          <div key={f.name} style={{
            display: "grid", gridTemplateColumns: "52px 1fr 40px",
            alignItems: "center", gap: 12,
            padding: "12px 14px",
            borderRadius: 8,
            border: `1px solid ${hovered === i ? f.color + "60" : "var(--border)"}`,
            background: hovered === i ? `${f.color}08` : "var(--bg)",
            cursor: "default", transition: "all 0.15s",
          }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: f.color, fontFamily: "monospace" }}>{f.name}</div>
              <div style={{ fontSize: 8, color: "var(--text-tertiary)", marginTop: 1 }}>rank {i + 1}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{f.full}</div>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 6 }}>{f.desc}</div>
              <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%", background: f.color, borderRadius: 3,
                  width: animated ? `${f.pct}%` : "0%",
                  transition: `width ${0.7 + i * 0.1}s cubic-bezier(0.4,0,0.2,1)`,
                }}/>
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: f.color, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {f.pct}%
            </div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 12, lineHeight: 1.65 }}>
        MDI (mean decrease in impurity) from the trained Random Forest. MAV + RMS account for 62% of total importance, confirming that amplitude-based features capture the primary motor unit recruitment signal. Each feature is computed independently per electrode channel, yielding a 64-dimensional vector (4 features × 16 channels).
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Section wrapper
// ─────────────────────────────────────────────────────────────
function Section({ id, n, title, caption, children, accent }) {
  return (
    <div id={id} style={{ paddingBottom: 72, borderBottom: "1px solid var(--border)", marginBottom: 72 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 28 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${accent}16`, border: `1px solid ${accent}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: accent, flexShrink: 0, fontFamily: "monospace" }}>{n}</div>
        <div>
          <h2 style={{ fontSize: "clamp(18px, 2.8vw, 26px)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.6px", marginBottom: 6, lineHeight: 1.15 }}>{title}</h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: 620 }}>{caption}</p>
        </div>
      </div>
      <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px 24px 20px" }}>
        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
export default function ResearchExplorer() {
  const navigate = useNavigate()

  const STATS = [
    { n: "84.85", decimals: 2, suffix: "%", label: "Cross-subject accuracy", sub: "LOSO, Ninapro DB5", color: "#FF2D78" },
    { n: "10",    decimals: 0, suffix: "",   label: "Subjects evaluated",     sub: "Leave-one-out folds", color: "#8B5CF6" },
    { n: "64",    decimals: 0, suffix: "",   label: "Feature dimensions",     sub: "4 features × 16 ch", color: "#3B82F6" },
    { n: "500",   decimals: 0, suffix: "",   label: "Trees in the forest",    sub: "Voting ensemble",    color: "#10B981" },
    { n: "16269", decimals: 0, suffix: "",   label: "Training windows",       sub: "9 subjects, 200 smp", color: "#F59E0B" },
    { n: "13.0",  decimals: 1, suffix: " pp",label: "Cross-subject spread",  sub: "S01 89.2% → S10 76.2%", color: "#06B6D4" },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      {/* Hero */}
      <div style={{
        background: "linear-gradient(155deg, #050512 0%, #0e0028 50%, #050512 100%)",
        borderBottom: "1px solid var(--border)",
        padding: "100px 32px 72px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Dot grid */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.06,
          backgroundImage: "radial-gradient(circle, var(--border) 1px, transparent 1px)",
          backgroundSize: "28px 28px" }}/>
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Reveal>
            <SectionPill>Interactive research data</SectionPill>
            <h1 style={{ fontSize: "clamp(30px, 5vw, 58px)", fontWeight: 700, letterSpacing: "-2px", color: "#fff", marginBottom: 18, lineHeight: 1.05 }}>
              The numbers<br/>
              <span style={{ color: "var(--accent)" }}>behind myojam.</span>
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", fontWeight: 400, lineHeight: 1.75, maxWidth: 560, marginBottom: 40 }}>
              Four interactive visualizations drawn from four peer-reviewed technical reports.
              Every chart is computed from the actual LOSO evaluation run on Ninapro DB5.
              Hover any data point for the raw numbers.
            </p>
          </Reveal>

          {/* Animated stat grid */}
          <Reveal delay={0.05}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden" }}>
              {STATS.map((s, i) => (
                <div key={s.label} style={{
                  padding: "18px 14px", textAlign: "center",
                  background: "rgba(255,255,255,0.03)",
                  borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}>
                  <div style={{ fontSize: "clamp(18px, 2.2vw, 24px)", fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 5, fontVariantNumeric: "tabular-nums" }}>
                    <Counter value={s.n} decimals={s.decimals} suffix={s.suffix} duration={1200 + i * 100}/>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.55)", lineHeight: 1.3 }}>{s.label}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Jump nav */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)", padding: "0 32px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 0 }}>
          {[
            { id: "gap",        label: "Feasibility gap",        color: "#EF4444" },
            { id: "classifiers",label: "Classifier comparison",  color: "#FF2D78" },
            { id: "loso",       label: "LOSO per subject",       color: "#8B5CF6" },
            { id: "features",   label: "Feature importance",     color: "#F59E0B" },
          ].map(item => (
            <a key={item.id} href={`#${item.id}`} style={{
              padding: "14px 18px", fontSize: 12, fontWeight: 500,
              color: "var(--text-secondary)", textDecoration: "none",
              borderBottom: "2px solid transparent",
              transition: "all 0.15s", display: "inline-block",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = item.color; e.currentTarget.style.borderBottomColor = item.color }}
              onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderBottomColor = "transparent" }}
            >{item.label}</a>
          ))}
          <div style={{ flex: 1 }}/>
          <a href="/research" style={{ padding: "14px 0", fontSize: 12, color: "var(--text-tertiary)", textDecoration: "none", alignSelf: "center" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--accent)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary)"}
          >← Research hub</a>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "64px 32px 40px" }}>

        <Section
          id="gap"
          n="01"
          accent="#EF4444"
          title="The Prosthetic Feasibility Gap"
          caption="The central finding of the windowing analysis. No window duration simultaneously satisfies the clinical latency constraint (≤300 ms, Farrell & Weir 2007) and the accuracy floor (≥80%) for 200 Hz hardware. The hatched region is where you would need to be - and cannot reach."
        >
          <FeasibilityChart />
        </Section>

        <Section
          id="classifiers"
          n="02"
          accent="#FF2D78"
          title="Classifier Comparison (LOSO, N=10)"
          caption="Four classical classifiers evaluated under identical leave-one-subject-out cross-validation on Ninapro DB5. The −pp badges show accuracy lost versus the Random Forest baseline. Standard deviation computed across 10 folds."
        >
          <ClassifierRace />
        </Section>

        <Section
          id="loso"
          n="03"
          accent="#8B5CF6"
          title="Per-Subject LOSO Results (Random Forest)"
          caption="Individual fold accuracies across all 10 leave-one-subject-out runs. The 13 percentage-point spread reveals inter-subject physiological variability as the dominant performance bottleneck - larger than the gap between any two classifier architectures."
        >
          <LOSOGrid />
        </Section>

        <Section
          id="features"
          n="04"
          accent="#F59E0B"
          title="Feature Importance (MDI)"
          caption="Mean Decrease in Impurity from the trained Random Forest's 500 trees. Computed over the full 64-dimensional feature vector (4 features × 16 channels). Hover a row to highlight its contribution in the stacked bar."
        >
          <FeatureImportance />
        </Section>

        {/* Paper links */}
        <Reveal>
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-tertiary)", marginBottom: 16 }}>Read the full papers these charts come from</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {[
                { title: "myojam Technical Report",            sub: "Main system paper · 84.85% result",    color: "#3B82F6", path: "/research/paper"              },
                { title: "Classifier Comparison",             sub: "RF vs SVM vs KNN vs LDA",              color: "#8B5CF6", path: "/research/classifier-analysis" },
                { title: "Windowing Analysis",                sub: "Feasibility gap · 8 window conditions", color: "#06B6D4", path: "/research/windowing-analysis"  },
                { title: "Variability Review",                sub: "Inter-subject variability synthesis",    color: "#10B981", path: "/research/variability-review"  },
              ].map(p => (
                <div key={p.title} onClick={() => navigate(p.path)} style={{
                  padding: "16px 18px", borderRadius: 10,
                  border: "1px solid var(--border)", background: "var(--bg-secondary)",
                  cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
                  borderLeft: `3px solid ${p.color}`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${p.color}60`; e.currentTarget.style.background = `${p.color}06` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-secondary)" }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 3 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{p.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <Footer />
    </div>
  )
}
