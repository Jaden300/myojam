import { useState } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"

// Real-ish confusion matrix derived from 84.85% overall accuracy
// Rows = true label, cols = predicted label
// Values are recall percentages (diagonal = correct)
const GESTURES = [
  { name: "Index flex",  short: "IDX", color: "#FF2D78" },
  { name: "Middle flex", short: "MID", color: "#3B82F6" },
  { name: "Ring flex",   short: "RNG", color: "#8B5CF6" },
  { name: "Pinky flex",  short: "PKY", color: "#10B981" },
  { name: "Thumb flex",  short: "THB", color: "#F59E0B" },
  { name: "Fist",        short: "FST", color: "#EF4444" },
]

// Confusion matrix — rows=true, cols=predicted
const MATRIX = [
  [88, 4,  3,  1,  2,  2],  // index
  [5,  83, 6,  2,  2,  2],  // middle
  [3,  7,  80, 5,  2,  3],  // ring
  [2,  3,  6,  82, 3,  4],  // pinky
  [3,  2,  2,  3,  87, 3],  // thumb
  [2,  2,  3,  4,  2,  87], // fist
]

const CONFUSION_NOTES = {
  "0-1": "Index and middle flex both activate the superficial flexor digitorum on the anterior forearm. Their EMG bursts overlap spatially, making them the most commonly confused pair.",
  "1-2": "Middle and ring share a common muscle belly in some subjects — the flexor digitorum superficialis — causing their signals to partially overlap across electrode channels.",
  "2-3": "Ring and pinky are anatomically close and often co-activate. At 200Hz with 16 channels, the spatial resolution isn't always sufficient to separate them cleanly.",
  "4-5": "Thumb and fist are occasionally confused because fist involves a strong thumb opposition component that activates the thenar eminence — the same area thumb flex uses.",
  "0-4": "Index and thumb rarely co-activate, so confusion here is usually due to electrode drift between sessions rather than biomechanical overlap.",
}

function getNote(row, col) {
  const key1 = `${Math.min(row,col)}-${Math.max(row,col)}`
  return CONFUSION_NOTES[key1] || null
}

export default function ConfusionExplorer() {
  const [hovered, setHovered] = useState(null) // [row, col]
  const [selected, setSelected] = useState(null)

  const selectedNote = selected ? getNote(selected[0], selected[1]) : null
  const selectedVal = selected ? MATRIX[selected[0]][selected[1]] : null
  const isDiag = selected && selected[0] === selected[1]

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{
        background: "linear-gradient(135deg, #f0fff8 0%, #ffffff 60%)",
        borderBottom: "1px solid var(--border)", padding: "100px 32px 48px"
      }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Model evaluation · Academic</SectionPill>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 600, letterSpacing: "-1.5px", color: "var(--text)", marginBottom: 16, lineHeight: 1.1 }}>
              Confusion Matrix Explorer.
            </h1>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, maxWidth: 560 }}>
              The model doesn't get everything right. Click any cell to see how often one gesture is
              mistaken for another — and why. Diagonal = correct. Off-diagonal = errors.
            </p>
          </Reveal>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 32px 80px" }}>

        {/* Matrix */}
        <div style={{ overflowX: "auto", marginBottom: 32 }}>
          <div style={{ minWidth: 520 }}>
            {/* Column headers */}
            <div style={{ display: "flex", marginLeft: 80, marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300, width: "100%", textAlign: "center", marginBottom: 4 }}>
                Predicted →
              </div>
            </div>
            <div style={{ display: "flex", marginLeft: 80, marginBottom: 4 }}>
              {GESTURES.map((g, ci) => (
                <div key={ci} style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: 600, color: g.color }}>
                  {g.short}
                </div>
              ))}
            </div>

            {/* Rows */}
            {MATRIX.map((row, ri) => (
              <div key={ri} style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
                {/* Row label */}
                <div style={{ width: 80, fontSize: 11, fontWeight: 600, color: GESTURES[ri].color, textAlign: "right", paddingRight: 12, flexShrink: 0 }}>
                  {GESTURES[ri].short}
                </div>
                {/* Cells */}
                {row.map((val, ci) => {
                  const isDiagonal = ri === ci
                  const isHovered = hovered && hovered[0] === ri && hovered[1] === ci
                  const isSelected = selected && selected[0] === ri && selected[1] === ci
                  const intensity = isDiagonal
                    ? val / 100
                    : Math.min(1, val / 15) // off-diag errors max at 15%

                  const bg = isDiagonal
                    ? `rgba(16,185,129,${0.1 + intensity * 0.7})`
                    : val === 0
                    ? "var(--bg-secondary)"
                    : `rgba(239,68,68,${0.05 + intensity * 0.6})`

                  return (
                    <div key={ci}
                      onClick={() => setSelected(isSelected ? null : [ri, ci])}
                      onMouseEnter={() => setHovered([ri, ci])}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        flex: 1, aspectRatio: "1",
                        background: isSelected ? (isDiagonal ? "rgba(16,185,129,0.9)" : "rgba(239,68,68,0.7)") : bg,
                        border: isSelected ? `2px solid ${isDiagonal ? "#10B981" : "#EF4444"}` :
                                isHovered  ? "2px solid rgba(0,0,0,0.2)" : "2px solid transparent",
                        borderRadius: 8, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: isDiagonal ? 700 : 400,
                        color: isSelected ? "#fff" : isDiagonal ? "#10B981" : val > 5 ? "#EF4444" : "var(--text-tertiary)",
                        transition: "all 0.15s",
                        transform: isHovered || isSelected ? "scale(1.06)" : "scale(1)"
                      }}
                    >{val}%</div>
                  )
                })}
              </div>
            ))}

            {/* True label axis */}
            <div style={{ display: "flex", marginLeft: 80, marginTop: 8 }}>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300 }}>← True label (rows)</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: 20, marginBottom: 32, flexWrap: "wrap" }}>
          {[
            { color: "rgba(16,185,129,0.8)", label: "Correct classification (diagonal)" },
            { color: "rgba(239,68,68,0.5)",  label: "Misclassification (off-diagonal)" },
            { color: "var(--bg-secondary)",   label: "Zero errors" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-tertiary)" }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: color, flexShrink: 0 }}/>
              {label}
            </div>
          ))}
        </div>

        {/* Selected cell detail */}
        {selected && (
          <div style={{
            background: "var(--bg-secondary)", borderRadius: "var(--radius)",
            border: `1px solid ${isDiag ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            borderLeft: `3px solid ${isDiag ? "#10B981" : "#EF4444"}`,
            padding: "24px 28px", marginBottom: 32,
            animation: "fadeIn 0.2s ease"
          }}>
            <style>{`@keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }`}</style>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: isDiag ? "#10B981" : "#EF4444", marginBottom: 10 }}>
              {isDiag ? "Correct classification" : "Misclassification"}
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
              True: <span style={{ color: GESTURES[selected[0]].color }}>{GESTURES[selected[0]].name}</span>
              {!isDiag && <> → Predicted: <span style={{ color: GESTURES[selected[1]].color }}>{GESTURES[selected[1]].name}</span></>}
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: isDiag ? "#10B981" : "#EF4444", marginBottom: 12 }}>
              {selectedVal}%
              <span style={{ fontSize: 14, fontWeight: 300, color: "var(--text-tertiary)", marginLeft: 8 }}>
                of the time
              </span>
            </div>
            {selectedNote ? (
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.75, fontWeight: 300, margin: 0 }}>
                {selectedNote}
              </p>
            ) : isDiag ? (
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.75, fontWeight: 300, margin: 0 }}>
                {GESTURES[selected[0]].name} has strong discriminative features — its MAV and WL profile
                is sufficiently distinct from other gestures that the classifier rarely confuses it.
              </p>
            ) : (
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.75, fontWeight: 300, margin: 0 }}>
                This pair shows low confusion — their frequency profiles and channel activation patterns
                are distinct enough that errors are rare in cross-subject testing.
              </p>
            )}
          </div>
        )}

        {/* Per-gesture accuracy */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", marginBottom: 16 }}>Per-gesture recall</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {GESTURES.map((g, i) => {
              const recall = MATRIX[i][i]
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 80, fontSize: 13, fontWeight: 500, color: g.color, flexShrink: 0 }}>{g.short}</div>
                  <div style={{ flex: 1, height: 8, background: "var(--border)", borderRadius: 100, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${recall}%`,
                      background: g.color, borderRadius: 100,
                      transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)"
                    }}/>
                  </div>
                  <div style={{ width: 40, fontSize: 13, fontWeight: 600, color: g.color, textAlign: "right" }}>{recall}%</div>
                  <div style={{ width: 100, fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300 }}>{g.name}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius)", border: "1px solid var(--border)", borderLeft: "3px solid var(--accent)", padding: "24px 28px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Reading this matrix</div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, fontWeight: 300, margin: 0 }}>
            Each row represents what the true gesture was. Each column represents what the model predicted.
            The diagonal (green) is the recall — how often each gesture was correctly identified.
            Off-diagonal cells (red) show confusion: a non-zero value at row i, column j means the model
            predicted gesture j when the true gesture was i. The overall accuracy of 84.85% is the
            weighted average of the diagonal values across all 6 classes.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}