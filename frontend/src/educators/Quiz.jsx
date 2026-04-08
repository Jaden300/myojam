import { useState } from "react"

const RESULTS = [
  { min:0,  max:49,  label:"Keep exploring",  color:"#EF4444", msg:"Review the lesson material and try again — the concepts will click with another pass." },
  { min:50, max:74,  label:"Getting there",   color:"#F59E0B", msg:"Good foundation. A few concepts need consolidating — review the sections you missed." },
  { min:75, max:89,  label:"Solid",           color:"#3B82F6", msg:"Strong understanding. You've got the core concepts — push further with the extension activities." },
  { min:90, max:100, label:"Excellent",        color:"#10B981", msg:"Outstanding. You're ready to teach this material yourself." },
]

function getResult(pct) {
  return RESULTS.find(r => pct >= r.min && pct <= r.max) || RESULTS[0]
}

export default function Quiz({ title, questions, accentColor = "#FF2D78" }) {
  const [phase, setPhase]       = useState("intro")    // intro | quiz | result
  const [current, setCurrent]   = useState(0)
  const [selected, setSelected] = useState(null)       // index of chosen answer
  const [confirmed, setConfirmed] = useState(false)    // whether user has clicked Check
  const [answers, setAnswers]   = useState([])         // array of booleans
  const [showExp, setShowExp]   = useState(false)

  function start() { setPhase("quiz"); setCurrent(0); setSelected(null); setConfirmed(false); setAnswers([]) }

  function check() {
    if (selected === null) return
    setConfirmed(true)
    setShowExp(true)
  }

  function next() {
    const correct = selected === questions[current].correct
    const nextAnswers = [...answers, correct]
    setAnswers(nextAnswers)
    if (current + 1 >= questions.length) {
      setPhase("result")
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setConfirmed(false)
      setShowExp(false)
    }
  }

  function restart() {
    setPhase("intro")
    setCurrent(0); setSelected(null); setConfirmed(false); setAnswers([]); setShowExp(false)
  }

  const q   = questions[current]
  const pct = Math.round((answers.filter(Boolean).length / questions.length) * 100)
  const res = getResult(pct)

  // ── Intro
  if (phase === "intro") return (
    <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", overflow:"hidden", marginTop:48 }}>
      <div style={{ borderBottom:"1px solid var(--border)", padding:"24px 28px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:accentColor+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>📝</div>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:accentColor, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>Quick check</div>
          <div style={{ fontSize:16, fontWeight:600, color:"var(--text)" }}>{title}</div>
        </div>
        <div style={{ marginLeft:"auto", fontSize:13, color:"var(--text-tertiary)", fontWeight:300 }}>{questions.length} questions</div>
      </div>
      <div style={{ padding:"24px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:16 }}>
        <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, margin:0, maxWidth:460 }}>
          Test your understanding of the lesson material. Each question has one correct answer. You'll see an explanation after each one.
        </p>
        <button onClick={start} style={{ background:accentColor, color:"#fff", border:"none", borderRadius:100, padding:"11px 28px", fontFamily:"var(--font)", fontSize:14, fontWeight:500, cursor:"pointer", flexShrink:0, boxShadow:`0 4px 16px ${accentColor}35`, transition:"transform 0.15s, box-shadow 0.15s" }}
          onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow=`0 8px 24px ${accentColor}50`}}
          onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow=`0 4px 16px ${accentColor}35`}}
        >Start quiz →</button>
      </div>
    </div>
  )

  // ── Quiz
  if (phase === "quiz") return (
    <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", overflow:"hidden", marginTop:48 }}>
      {/* Header */}
      <div style={{ borderBottom:"1px solid var(--border)", padding:"16px 28px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ fontSize:13, fontWeight:500, color:"var(--text-secondary)" }}>
          Question {current+1} of {questions.length}
        </div>
        {/* Progress bar */}
        <div style={{ flex:1, height:4, background:"var(--border)", borderRadius:100, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${((current)/questions.length)*100}%`, background:accentColor, borderRadius:100, transition:"width 0.4s ease" }}/>
        </div>
        <div style={{ fontSize:13, color:accentColor, fontWeight:600 }}>
          {answers.filter(Boolean).length} / {current} ✓
        </div>
      </div>

      <div style={{ padding:"32px 28px" }}>
        {/* Question */}
        <div style={{ fontSize:17, fontWeight:600, color:"var(--text)", lineHeight:1.5, marginBottom:24, letterSpacing:"-0.2px" }}>
          {q.question}
        </div>

        {/* Options */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:24 }}>
          {q.options.map((opt, i) => {
            const isSelected  = selected === i
            const isCorrect   = i === q.correct
            const isWrong     = confirmed && isSelected && !isCorrect

            let bg      = "var(--bg)"
            let border  = "1px solid var(--border)"
            let color   = "var(--text-secondary)"
            let prefix  = String.fromCharCode(65+i) // A B C D

            if (isSelected && !confirmed) {
              bg = accentColor+"12"; border = `1px solid ${accentColor}50`; color = "var(--text)"
            }
            if (confirmed && isCorrect) {
              bg = "rgba(16,185,129,0.1)"; border = "2px solid #10B981"; color = "#10B981"
            }
            if (isWrong) {
              bg = "rgba(239,68,68,0.08)"; border = "2px solid #EF4444"; color = "#EF4444"
            }

            return (
              <div key={i} onClick={()=>{ if (!confirmed) setSelected(i) }} style={{
                background:bg, border, borderRadius:10, padding:"13px 16px",
                display:"flex", alignItems:"flex-start", gap:12,
                cursor: confirmed ? "default" : "pointer",
                transition:"all 0.15s",
                transform: isSelected && !confirmed ? "translateX(4px)" : "none"
              }}
                onMouseEnter={e=>{ if (!confirmed && selected !== i) { e.currentTarget.style.borderColor = accentColor+"40"; e.currentTarget.style.background = accentColor+"08" }}}
                onMouseLeave={e=>{ if (!confirmed && selected !== i) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg)" }}}
              >
                <div style={{ width:24, height:24, borderRadius:"50%", background: confirmed&&isCorrect ? "#10B981" : isWrong ? "#EF4444" : isSelected ? accentColor : "var(--bg-secondary)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color: (confirmed&&isCorrect)||isWrong||isSelected ? "#fff" : "var(--text-tertiary)", flexShrink:0, border: !isSelected&&!confirmed ? "1px solid var(--border)" : "none" }}>
                  {confirmed && isCorrect ? "✓" : isWrong ? "✕" : prefix}
                </div>
                <span style={{ fontSize:14, fontWeight: isSelected ? 500 : 300, color, lineHeight:1.6 }}>{opt}</span>
              </div>
            )
          })}
        </div>

        {/* Explanation */}
        {showExp && (
          <div style={{ background: selected===q.correct ? "rgba(16,185,129,0.07)" : "rgba(239,68,68,0.05)", border: `1px solid ${selected===q.correct ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.2)"}`, borderLeft:`3px solid ${selected===q.correct ? "#10B981" : "#EF4444"}`, borderRadius:"0 10px 10px 0", padding:"16px 20px", marginBottom:20, animation:"fadeIn 0.25s ease" }}>
            <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <div style={{ fontSize:11, fontWeight:600, color: selected===q.correct ? "#10B981" : "#EF4444", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>
              {selected===q.correct ? "Correct!" : `Incorrect — the answer is ${String.fromCharCode(65+q.correct)}`}
            </div>
            <p style={{ fontSize:13, color:"var(--text-secondary)", lineHeight:1.75, fontWeight:300, margin:0 }}>{q.explanation}</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:"flex", gap:10 }}>
          {!confirmed ? (
            <button onClick={check} disabled={selected===null} style={{ background: selected===null ? "var(--border)" : accentColor, color:"#fff", border:"none", borderRadius:100, padding:"11px 28px", fontFamily:"var(--font)", fontSize:14, fontWeight:500, cursor: selected===null ? "not-allowed" : "pointer", opacity: selected===null ? 0.5 : 1, transition:"all 0.15s" }}>
              Check answer
            </button>
          ) : (
            <button onClick={next} style={{ background:accentColor, color:"#fff", border:"none", borderRadius:100, padding:"11px 28px", fontFamily:"var(--font)", fontSize:14, fontWeight:500, cursor:"pointer", boxShadow:`0 4px 16px ${accentColor}35`, transition:"transform 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.04)"}
              onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
            >
              {current+1 >= questions.length ? "See results" : "Next question →"}
            </button>
          )}
          <button onClick={restart} style={{ background:"none", border:"1px solid var(--border)", borderRadius:100, padding:"11px 20px", fontFamily:"var(--font)", fontSize:13, color:"var(--text-tertiary)", cursor:"pointer" }}>Restart</button>
        </div>
      </div>
    </div>
  )

  // ── Result
  return (
    <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", overflow:"hidden", marginTop:48 }}>
      <div style={{ background:`linear-gradient(135deg, ${res.color}10 0%, transparent 100%)`, borderBottom:"1px solid var(--border)", padding:"32px 28px", textAlign:"center" }}>
        <div style={{ fontSize:56, fontWeight:700, color:res.color, letterSpacing:"-2px", marginBottom:4 }}>{pct}%</div>
        <div style={{ fontSize:18, fontWeight:600, color:"var(--text)", marginBottom:8 }}>{res.label}</div>
        <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, maxWidth:400, margin:"0 auto" }}>{res.msg}</p>
      </div>

      {/* Per-question review */}
      <div style={{ padding:"24px 28px" }}>
        <div style={{ fontSize:13, fontWeight:500, color:"var(--text)", marginBottom:16 }}>Question review</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
          {questions.map((q,i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 16px", background:"var(--bg)", borderRadius:10, border:"1px solid var(--border)" }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background: answers[i] ? "#10B981" : "#EF4444", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#fff", fontWeight:700, flexShrink:0, marginTop:1 }}>
                {answers[i] ? "✓" : "✕"}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:400, color:"var(--text)", marginBottom:2, lineHeight:1.5 }}>{q.question}</div>
                {!answers[i] && <div style={{ fontSize:12, color:"#10B981", fontWeight:300 }}>Correct: {q.options[q.correct]}</div>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={restart} style={{ background:accentColor, color:"#fff", border:"none", borderRadius:100, padding:"11px 28px", fontFamily:"var(--font)", fontSize:14, fontWeight:500, cursor:"pointer" }}>Try again</button>
        </div>
      </div>
    </div>
  )
}