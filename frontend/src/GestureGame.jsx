import { useState, useEffect, useRef, useCallback } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"

const GESTURES = [
  { id: 1, name: "index flex",  key: "1", symbol: "☝", color: "#FF2D78", action: "Cursor left" },
  { id: 2, name: "middle flex", key: "2", symbol: "✌", color: "#3B82F6", action: "Cursor right" },
  { id: 3, name: "ring flex",   key: "3", symbol: "💍", color: "#8B5CF6", action: "Cursor down" },
  { id: 4, name: "pinky flex",  key: "4", symbol: "🤙", color: "#10B981", action: "Cursor up" },
  { id: 5, name: "thumb flex",  key: "5", symbol: "👍", color: "#F59E0B", action: "Click" },
  { id: 6, name: "fist",        key: "6", symbol: "✊", color: "#EF4444", action: "Spacebar" },
]

const SYMBOLS = ["☝", "✌", "🖐", "👊", "👍", "🤙"]

const LEVELS = [
  { label: "Easy",   time: 3000, rounds: 8  },
  { label: "Medium", time: 1800, rounds: 10 },
  { label: "Hard",   time: 900,  rounds: 12 },
]

export default function GestureGame() {
  const [phase, setPhase] = useState("menu") // menu | countdown | playing | result
  const [levelIdx, setLevelIdx] = useState(0)
  const [countdown, setCountdown] = useState(3)
  const [round, setRound] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [target, setTarget] = useState(null)
  const [feedback, setFeedback] = useState(null) // "correct" | "wrong" | "timeout"
  const [timeLeft, setTimeLeft] = useState(1)
  const [history, setHistory] = useState([])
  const timerRef = useRef(null)
  const startRef = useRef(null)

  const level = LEVELS[levelIdx]

  function pickGesture() {
    return GESTURES[Math.floor(Math.random() * GESTURES.length)]
  }

  function startCountdown() {
    setPhase("countdown")
    setCountdown(3)
    setScore(0); setRound(0); setStreak(0); setBestStreak(0); setHistory([])
    let c = 3
    const t = setInterval(() => {
      c--
      if (c <= 0) { clearInterval(t); startRound() }
      else setCountdown(c)
    }, 900)
  }

  const endRound = useCallback((result, pressedKey) => {
    clearTimeout(timerRef.current)
    setFeedback(result)
    setHistory(h => [...h, { result, target }])

    if (result === "correct") {
      setScore(s => s + 1)
      setStreak(s => {
        const next = s + 1
        setBestStreak(b => Math.max(b, next))
        return next
      })
    } else {
      setStreak(0)
    }

    setTimeout(() => {
      setFeedback(null)
      setRound(r => {
        const next = r + 1
        if (next >= level.rounds) {
          setPhase("result")
        } else {
          startRound()
        }
        return next
      })
    }, 600)
  }, [target, level.rounds])

  function startRound() {
    const g = pickGesture()
    setTarget(g)
    setPhase("playing")
    startRef.current = Date.now()
    setTimeLeft(1)

    const tick = () => {
      const elapsed = Date.now() - startRef.current
      const frac = Math.max(0, 1 - elapsed / level.time)
      setTimeLeft(frac)
      if (frac > 0) {
        timerRef.current = setTimeout(tick, 16)
      } else {
        endRound("timeout", null)
      }
    }
    timerRef.current = setTimeout(tick, 16)
  }

  useEffect(() => {
    if (phase !== "playing") return
    function onKey(e) {
      const g = GESTURES.find(g => g.key === e.key)
      if (!g) return
      if (g.id === target?.id) endRound("correct", e.key)
      else endRound("wrong", e.key)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [phase, target, endRound])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const pct = Math.round((score / level.rounds) * 100)

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />

      <div style={{
        background: "linear-gradient(135deg, #fff5f0 0%, #ffffff 60%)",
        borderBottom: "1px solid var(--border)",
        padding: "100px 32px 48px"
      }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Mini-game · Keyboard</SectionPill>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 600, letterSpacing: "-1.5px", color: "var(--text)", marginBottom: 16, lineHeight: 1.1 }}>
              Gesture Reaction Game.
            </h1>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7, maxWidth: 480 }}>
              A target gesture flashes on screen. Press the matching key (1–6) before time runs out.
              How fast can your fingers react?
            </p>
          </Reveal>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 32px 80px" }}>

        {/* Gesture key */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 40, flexWrap: "wrap" }}>
          {GESTURES.map(g => (
            <div key={g.id} style={{
              background: "var(--bg-secondary)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "10px 14px", textAlign: "center", minWidth: 72
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: g.color, letterSpacing: "0.04em", marginBottom: 4 }}>[{g.key}]</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 300 }}>{g.name.replace(" flex", "")}</div>
            </div>
          ))}
        </div>

        {/* Menu */}
        {phase === "menu" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, marginBottom: 20 }}>Select difficulty</div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 40 }}>
              {LEVELS.map((l, i) => (
                <button key={l.label} onClick={() => setLevelIdx(i)} style={{
                  background: levelIdx === i ? "var(--accent)" : "var(--bg-secondary)",
                  color: levelIdx === i ? "#fff" : "var(--text-secondary)",
                  border: `1px solid ${levelIdx === i ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: 100, padding: "8px 20px",
                  fontFamily: "var(--font)", fontSize: 14, cursor: "pointer",
                  transition: "all 0.15s"
                }}>{l.label}</button>
              ))}
            </div>
            <button onClick={startCountdown} style={{
              background: "var(--accent)", color: "#fff", border: "none",
              borderRadius: 100, padding: "14px 48px", fontSize: 16,
              fontFamily: "var(--font)", fontWeight: 500, cursor: "pointer",
              boxShadow: "0 4px 24px rgba(255,45,120,0.3)",
              transition: "transform 0.15s, box-shadow 0.15s"
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,45,120,0.4)" }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(255,45,120,0.3)" }}
            >Start game</button>
          </div>
        )}

        {/* Countdown */}
        {phase === "countdown" && (
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: 96, fontWeight: 700, color: "var(--accent)",
              letterSpacing: "-4px", lineHeight: 1,
              animation: "pop 0.3s cubic-bezier(0.34,1.56,0.64,1)"
            }}>
              <style>{`@keyframes pop { from{transform:scale(0.6);opacity:0} to{transform:scale(1);opacity:1} }`}</style>
              {countdown}
            </div>
            <div style={{ fontSize: 16, color: "var(--text-tertiary)", fontWeight: 300, marginTop: 16 }}>Get ready…</div>
          </div>
        )}

        {/* Playing */}
        {phase === "playing" && target && (
          <div style={{ textAlign: "center" }}>
            {/* Progress */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, fontSize: 13, color: "var(--text-tertiary)" }}>
              <span>Round {round + 1} / {level.rounds}</span>
              <span>Score {score}</span>
              {streak > 1 && <span style={{ color: "var(--accent)" }}>🔥 {streak} streak</span>}
            </div>

            {/* Timer bar */}
            <div style={{ height: 4, background: "var(--border)", borderRadius: 100, marginBottom: 48, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 100,
                width: `${timeLeft * 100}%`,
                background: timeLeft > 0.4 ? "var(--accent)" : "#EF4444",
                transition: "background 0.3s"
              }}/>
            </div>

            {/* Target */}
            <div style={{
              fontSize: 14, fontWeight: 500, color: "var(--text-tertiary)",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16
            }}>Perform this gesture</div>

            <div style={{
              width: 200, height: 200, borderRadius: "50%",
              background: target.color + "15",
              border: `3px solid ${target.color}`,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: feedback === "correct" ? `0 0 0 12px ${target.color}25` :
                         feedback === "wrong"   ? "0 0 0 12px rgba(239,68,68,0.2)" : "none",
              transition: "box-shadow 0.2s",
              animation: "pop 0.25s cubic-bezier(0.34,1.56,0.64,1)"
            }}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>{SYMBOLS[target.id - 1]}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: target.color }}>{target.name}</div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300 }}>Press [{target.key}]</div>
            </div>

            {feedback && (
              <div style={{
                fontSize: 24, fontWeight: 700,
                color: feedback === "correct" ? "#10B981" : "#EF4444",
                animation: "pop 0.2s ease"
              }}>
                {feedback === "correct" ? "✓ Nice!" : feedback === "wrong" ? "✗ Wrong" : "✗ Too slow"}
              </div>
            )}
          </div>
        )}

        {/* Result */}
        {phase === "result" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
              Game over
            </div>
            <div style={{ fontSize: 72, fontWeight: 700, color: "var(--accent)", letterSpacing: "-3px", marginBottom: 8 }}>{pct}%</div>
            <div style={{ fontSize: 16, color: "var(--text-secondary)", fontWeight: 300, marginBottom: 8 }}>
              {score} / {level.rounds} correct
            </div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 48 }}>
              Best streak: {bestStreak}
            </div>

            {/* History dots */}
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 48, flexWrap: "wrap" }}>
              {history.map((h, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: h.result === "correct" ? "#10B981" : "#EF4444"
                }}/>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button onClick={startCountdown} style={{
                background: "var(--accent)", color: "#fff", border: "none",
                borderRadius: 100, padding: "12px 32px",
                fontFamily: "var(--font)", fontSize: 15, fontWeight: 500, cursor: "pointer"
              }}>Play again</button>
              <button onClick={() => setPhase("menu")} style={{
                background: "none", color: "var(--text-secondary)",
                border: "1px solid var(--border)", borderRadius: 100, padding: "12px 24px",
                fontFamily: "var(--font)", fontSize: 15, cursor: "pointer"
              }}>Change level</button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}