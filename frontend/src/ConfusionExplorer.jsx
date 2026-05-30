import { useState } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"
import NeuralNoise from "./components/NeuralNoise"

const GESTURES = [
  { name: "Index flex",  short: "IDX", color: "#FF2D78" },
  { name: "Middle flex", short: "MID", color: "#3B82F6" },
  { name: "Ring flex",   short: "RNG", color: "#8B5CF6" },
  { name: "Pinky flex",  short: "PKY", color: "#10B981" },
  { name: "Thumb flex",  short: "THB", color: "#F59E0B" },
  { name: "Fist",        short: "FST", color: "#EF4444" },
]

// rows=true label, cols=predicted label, values=recall %
const MATRIX = [
  [88, 4,  3,  1,  2,  2],
  [5,  83, 6,  2,  2,  2],
  [3,  7,  80, 5,  2,  3],
  [2,  3,  6,  82, 3,  4],
  [3,  2,  2,  3,  87, 3],
  [2,  2,  3,  4,  2,  87],
]

// All 15 unique off-diagonal gesture pairs
const ALL_PAIR_NOTES = {
  "0-1": { rate: 4+5, note: "Index and middle both drive the flexor digitorum superficialis (FDS). The FDS muscle belly spans all four fingers - when index or middle flex, the same electrode channels see overlapping FDS activation, making spatial separation difficult at 200 Hz." },
  "1-2": { rate: 6+7, note: "The highest single confusion pair. Middle and ring fingers share a common FDS tendon in ~80% of the population (the FDS middle head is fused with the ring head). The resulting co-activation produces near-identical 16-channel feature vectors - the classifier can only distinguish them by subtle amplitude asymmetries." },
  "2-3": { rate: 5+6, note: "Ring and pinky share the FDS (ring head) and the flexor digiti minimi. Both muscles lie on the ulnar aspect of the forearm - the same electrode zone. Spatial resolution at the sensor level is insufficient to cleanly separate their activation envelopes." },
  "0-2": { rate: 3+3, note: "Index and ring are separated by the middle finger in the FDS arrangement, providing a natural anatomical gap. Confusion is mainly biomechanical spillover - strong index contractions sometimes co-activate ring through FDS coupling." },
  "0-3": { rate: 1+2, note: "Index and pinky are anatomically distant - index activates the radial FDS head while pinky activates flexor digiti minimi. Low confusion rate reflects this separation. Remaining errors are likely electrode placement near-field artifacts." },
  "1-3": { rate: 2+3, note: "Middle and pinky occupy opposite ends of the FDS and rarely co-activate. The low confusion rate confirms that the 16-channel array has adequate spatial coverage to resolve this pair in most subjects." },
  "0-4": { rate: 2+3, note: "Index and thumb operate on distinct muscle groups (FDS vs. thenar eminence), so confusion is unlikely from biomechanical spillover. Observed errors are likely caused by inter-session electrode placement drift shifting the detection volume toward the thenar." },
  "1-4": { rate: 2+2, note: "Middle finger and thumb recruit completely separate muscle groups. The low confusion confirms that the thenar eminence (thumb) and FDS (middle) are reliably separable with 16-channel coverage. Residual errors reflect classification uncertainty near gesture onset." },
  "2-4": { rate: 2+2, note: "Ring and thumb rarely co-activate. Confusion at this rate (2%) may reflect borderline subjects where the Myo armband sits slightly distally, bringing the thenar detection volume partially into the FDS ring-channel zone." },
  "3-4": { rate: 3+3, note: "Pinky and thumb both have dedicated small muscles (flexor digiti minimi vs. opponens pollicis) with well-separated anatomical locations. The 3% confusion likely reflects borderline cases where thumb flexion involves partial co-contraction of the hypothenar region." },
  "0-5": { rate: 2+2, note: "Fist recruits all finger flexors simultaneously, so its MAV and WL values are substantially higher than any single-finger gesture. Index flex produces a subset of fist's activation. Low confusion is expected - fist is one of the most reliably classified gestures overall." },
  "1-5": { rate: 2+2, note: "Middle and fist are reliably distinguished by amplitude: fist produces roughly 4–5× the MAV of single-finger flex. Confusion at 2% likely reflects partial-effort fist contractions or high-effort middle flexions that push amplitude toward fist territory." },
  "2-5": { rate: 3+3, note: "Ring and fist confusion is slightly higher than index/fist, possibly because ring is the second-weakest isolated gesture (after pinky) - its amplitude profile overlaps more with partial fist closures than index or thumb do." },
  "3-5": { rate: 4+4, note: "Pinky and fist is the highest single-finger vs. fist confusion pair. Pinky flex is the weakest isolated gesture (lowest MAV), and its feature vector can resemble a partial fist contraction where not all fingers are fully extended. The 4% rate reflects this inherent ambiguity." },
  "4-5": { rate: 3+2, note: "Fist always involves strong thumb opposition (opponens pollicis), activating the same thenar eminence that thumb flex uses. The classifier must rely on the broader co-activation pattern of full fist to distinguish the two - achievable but produces the most frequent single-vs-fist confusion." },
}

function getNote(row, col) {
  const key = `${Math.min(row,col)}-${Math.max(row,col)}`
  return ALL_PAIR_NOTES[key] || null
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
      <div style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid var(--border)", padding: "100px 32px 48px" }}>
        <NeuralNoise color={[0.10, 0.65, 0.45]} opacity={0.85} speed={0.0006} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(3,0,18,0.65)", zIndex: 1 }} />
        <div style={{ maxWidth: 820, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Reveal>
            <SectionPill>Model evaluation · Academic</SectionPill>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 600, letterSpacing: "-1.5px", color: "#fff", marginBottom: 16, lineHeight: 1.1 }}>
              Confusion Matrix Explorer.
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.72)", fontWeight: 300, lineHeight: 1.7, maxWidth: 560 }}>
              The model doesn't get everything right. Click any cell to see how often one gesture is
              mistaken for another - and why. Diagonal = correct. Off-diagonal = errors.
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
                {GESTURES[selected[0]].name} has strong discriminative features - its MAV and WL profile
                is sufficiently distinct from other gestures that the classifier rarely confuses it.
              </p>
            ) : (
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.75, fontWeight: 300, margin: 0 }}>
                This pair shows low confusion - their frequency profiles and channel activation patterns
                are distinct enough that errors are rare in cross-subject testing.
              </p>
            )}
          </div>
        )}

        {/* Per-class metrics: Recall, Precision, F1 */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Per-class metrics</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300, marginBottom: 20 }}>Recall = rows · Precision = columns · F1 = harmonic mean</div>
          <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
                  {["Gesture", "Recall", "Precision", "F1 score", "Support (windows)"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GESTURES.map((g, i) => {
                  const recall = MATRIX[i][i]
                  // Precision = TP / (TP + FP) - sum of column i, diagonal is TP
                  const colSum = MATRIX.reduce((s, row) => s + row[i], 0)
                  const precision = Math.round((recall / (colSum / MATRIX[i].reduce((s,v)=>s+v,0) * 100 + recall - recall)) * 100) || recall
                  // Simplified: compute from matrix percentages
                  const tp = MATRIX[i][i]
                  const fp = MATRIX.reduce((s, row, ri) => ri !== i ? s + row[i] : s, 0)
                  const fn = MATRIX[i].reduce((s, v, ci) => ci !== i ? s + v : s, 0)
                  const prec = Math.round(tp / (tp + fp) * 100)
                  const f1 = Math.round(2 * prec * recall / (prec + recall))
                  const support = [2811, 2741, 2698, 2634, 2714, 2671][i]
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "var(--bg)" : "var(--bg-secondary)" }}>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: g.color }}>{g.short}</span>
                        <span style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300, marginLeft: 8 }}>{g.name}</span>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 50, height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${recall}%`, background: g.color, borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: g.color }}>{recall}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 50, height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${prec}%`, background: "#8B5CF6", borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{prec}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: f1 >= 85 ? "#10B981" : f1 >= 80 ? "var(--text)" : "#F59E0B" }}>{f1}%</span>
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--text-tertiary)", fontFamily: "monospace" }}>{support.toLocaleString()}</td>
                    </tr>
                  )
                })}
                <tr style={{ borderTop: "2px solid var(--border)", background: "rgba(255,45,120,0.04)" }}>
                  <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, color: "var(--text)" }}>Macro avg</td>
                  <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>84.5%</td>
                  <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>84.8%</td>
                  <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700, color: "var(--accent)" }}>84.6%</td>
                  <td style={{ padding: "10px 16px", fontSize: 12, color: "var(--text-tertiary)", fontFamily: "monospace" }}>16,269</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Ranked error pairs */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>All 15 gesture pairs - ranked by confusion rate</div>
          <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300, marginBottom: 20 }}>Confusion rate = sum of off-diagonal errors for that pair (both directions)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {Object.entries(ALL_PAIR_NOTES)
              .sort((a, b) => b[1].rate - a[1].rate)
              .map(([key, { rate, note }]) => {
                const [a, b] = key.split("-").map(Number)
                const maxRate = 13
                return (
                  <div key={key} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "14px 18px", background: "var(--bg-secondary)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: GESTURES[a].color, background: `${GESTURES[a].color}15`, border: `1px solid ${GESTURES[a].color}30`, borderRadius: 100, padding: "2px 9px" }}>{GESTURES[a].short}</span>
                        <span style={{ fontSize: 11, color: "var(--text-tertiary)", alignSelf: "center" }}>↔</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: GESTURES[b].color, background: `${GESTURES[b].color}15`, border: `1px solid ${GESTURES[b].color}30`, borderRadius: 100, padding: "2px 9px" }}>{GESTURES[b].short}</span>
                      </div>
                      <div style={{ flex: 1, height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(rate / maxRate) * 100}%`, background: rate >= 10 ? "#EF4444" : rate >= 5 ? "#F59E0B" : "#10B981", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: rate >= 10 ? "#EF4444" : rate >= 5 ? "#F59E0B" : "#10B981", flexShrink: 0 }}>{rate}% total</span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.65, margin: 0 }}>{note}</p>
                  </div>
                )
              })}
          </div>
        </div>

        <div style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius)", border: "1px solid var(--border)", borderLeft: "3px solid var(--accent)", padding: "24px 28px" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Reading this matrix</div>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8, fontWeight: 300, margin: 0 }}>
            Each row represents what the true gesture was. Each column represents what the model predicted.
            The diagonal (green) is the recall - how often each gesture was correctly identified.
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