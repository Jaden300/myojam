import { useState, useRef, useEffect, useCallback } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"

// ── Constants
const STAGE_W = 360, STAGE_H = 260

const GESTURE_LIST = [
  { name: "index flex",  key: "1", color: "#FF2D78" },
  { name: "middle flex", key: "2", color: "#3B82F6" },
  { name: "ring flex",   key: "3", color: "#8B5CF6" },
  { name: "pinky flex",  key: "4", color: "#10B981" },
  { name: "thumb flex",  key: "5", color: "#F59E0B" },
  { name: "fist",        key: "6", color: "#EF4444" },
]

// Block definition format:
// parts: array of strings or {p:"paramKey"} for inline inputs
// params: array of {key, type:"select"|"num"|"text"|"color", options?, def}
// cat, color, isHat
const BLOCK_DEFS = {
  // Events
  when_start: {
    cat:"events", color:"#FF2D78", isHat:true,
    parts:["▶  When program starts"],
    params:[],
  },
  when_gesture: {
    cat:"events", color:"#FF2D78", isHat:true,
    parts:["💪  When", {p:"gesture"}, "detected"],
    params:[{ key:"gesture", type:"select", options:GESTURE_LIST.map(g=>g.name), def:"index flex" }],
  },
  // Control
  wait: {
    cat:"control", color:"#F97316",
    parts:["⏱  Wait", {p:"secs"}, "seconds"],
    params:[{ key:"secs", type:"num", def:1 }],
  },
  repeat: {
    cat:"control", color:"#F97316",
    parts:["🔁  Repeat next blocks", {p:"n"}, "times"],
    params:[{ key:"n", type:"num", def:5 }],
  },
  wait_for_any: {
    cat:"control", color:"#F97316",
    parts:["👂  Wait for any gesture"],
    params:[],
  },
  // Motion
  move: {
    cat:"motion", color:"#3B82F6",
    parts:["🖱  Move", {p:"dir"}, {p:"px"}, "px"],
    params:[
      { key:"dir", type:"select", options:["left","right","up","down"], def:"right" },
      { key:"px",  type:"num", def:30 },
    ],
  },
  go_center: {
    cat:"motion", color:"#3B82F6",
    parts:["📍  Go to center"],
    params:[],
  },
  go_random: {
    cat:"motion", color:"#3B82F6",
    parts:["🎲  Jump to random position"],
    params:[],
  },
  // Draw
  pen_down: {
    cat:"draw", color:"#8B5CF6",
    parts:["✏️  Pen down"],
    params:[],
  },
  pen_up: {
    cat:"draw", color:"#8B5CF6",
    parts:["✋  Pen up"],
    params:[],
  },
  set_color: {
    cat:"draw", color:"#8B5CF6",
    parts:["🎨  Set pen color", {p:"color"}],
    params:[{ key:"color", type:"color", def:"#FF2D78" }],
  },
  dot: {
    cat:"draw", color:"#8B5CF6",
    parts:["⚫  Stamp dot, size", {p:"size"}],
    params:[{ key:"size", type:"num", def:10 }],
  },
  clear: {
    cat:"draw", color:"#8B5CF6",
    parts:["🗑  Clear stage"],
    params:[],
  },
  // Looks
  say: {
    cat:"looks", color:"#10B981",
    parts:["💬  Say", {p:"text"}, "for", {p:"secs"}, "s"],
    params:[
      { key:"text", type:"text", def:"Hello!" },
      { key:"secs", type:"num",  def:2 },
    ],
  },
  beep: {
    cat:"looks", color:"#10B981",
    parts:["🔊  Play beep"],
    params:[],
  },
  set_bg: {
    cat:"looks", color:"#10B981",
    parts:["🖼  Set background", {p:"color"}],
    params:[{ key:"color", type:"color", def:"#F5F5F7" }],
  },
}

const CATEGORIES = [
  { key:"events",  label:"Events",  color:"#FF2D78" },
  { key:"control", label:"Control", color:"#F97316" },
  { key:"motion",  label:"Motion",  color:"#3B82F6" },
  { key:"draw",    label:"Draw",    color:"#8B5CF6" },
  { key:"looks",   label:"Looks",   color:"#10B981" },
]

// ── Preset example programs
const EXAMPLES = [
  {
    name: "Gesture painter",
    desc: "Each gesture draws in a different color",
    script: [
      { type:"when_start",  params:{} },
      { type:"pen_down",    params:{} },
      { type:"wait_for_any",params:{} },
      { type:"set_color",   params:{ color:"#FF2D78" } },
      { type:"move",        params:{ dir:"right", px:20 } },
      { type:"dot",         params:{ size:8 } },
      { type:"wait_for_any",params:{} },
      { type:"set_color",   params:{ color:"#3B82F6" } },
      { type:"move",        params:{ dir:"down", px:20 } },
      { type:"dot",         params:{ size:8 } },
    ],
  },
  {
    name: "Gesture hello",
    desc: "Greets when you flex, beeps when you fist",
    script: [
      { type:"when_start",   params:{} },
      { type:"say",          params:{ text:"Flex to greet!", secs:2 } },
      { type:"when_gesture", params:{ gesture:"index flex" } },
      { type:"say",          params:{ text:"Hello! 👋", secs:2 } },
      { type:"beep",         params:{} },
      { type:"when_gesture", params:{ gesture:"fist" } },
      { type:"say",          params:{ text:"💪", secs:1 } },
    ],
  },
  {
    name: "Spiral draw",
    desc: "Draws an expanding spiral",
    script: [
      { type:"when_start", params:{} },
      { type:"go_center",  params:{} },
      { type:"pen_down",   params:{} },
      { type:"set_color",  params:{ color:"#FF2D78" } },
      { type:"repeat",     params:{ n:8 } },
      { type:"move",       params:{ dir:"right", px:20 } },
      { type:"move",       params:{ dir:"down",  px:20 } },
      { type:"move",       params:{ dir:"left",  px:20 } },
      { type:"move",       params:{ dir:"up",    px:20 } },
    ],
  },
]

// ── Helpers
let _uid = 0
function uid() { return ++_uid }

function makeBlock(type, params) {
  const def = BLOCK_DEFS[type]
  const defaultParams = {}
  def.params.forEach(p => { defaultParams[p.key] = p.def })
  return { id: uid(), type, params: { ...defaultParams, ...(params || {}) } }
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException("aborted")); return }
    const t = setTimeout(resolve, ms)
    signal?.addEventListener("abort", () => { clearTimeout(t); reject(new DOMException("aborted")) }, { once:true })
  })
}

function waitForGesture(gestureName, signal) {
  const g = GESTURE_LIST.find(g => g.name === gestureName)
  if (!g) return Promise.resolve(null)
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException("aborted")); return }
    function onKey(e) { if (e.key === g.key) { cleanup(); resolve(g) } }
    function onAbort() { cleanup(); reject(new DOMException("aborted")) }
    function cleanup() { window.removeEventListener("keydown", onKey); signal?.removeEventListener("abort", onAbort) }
    window.addEventListener("keydown", onKey)
    signal?.addEventListener("abort", onAbort, { once:true })
  })
}

function waitForAnyGesture(signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException("aborted")); return }
    function onKey(e) {
      const g = GESTURE_LIST.find(g => g.key === e.key)
      if (g) { cleanup(); resolve(g) }
    }
    function onAbort() { cleanup(); reject(new DOMException("aborted")) }
    function cleanup() { window.removeEventListener("keydown", onKey); signal?.removeEventListener("abort", onAbort) }
    window.addEventListener("keydown", onKey)
    signal?.addEventListener("abort", onAbort, { once:true })
  })
}

function playBeep(freq = 523) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start(); osc.stop(ctx.currentTime + 0.3)
  } catch {}
}

// ── Block renderer (inline params)
function BlockLabel({ block, def, onUpdate }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", flex:1 }}>
      {def.parts.map((part, i) => {
        if (typeof part === "string") {
          return <span key={i} style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.95)" }}>{part}</span>
        }
        const param = def.params.find(p => p.key === part.p)
        if (!param) return null
        const val = block.params[param.key]
        if (param.type === "select") {
          return (
            <select key={i} value={val}
              onChange={e => onUpdate(block.id, param.key, e.target.value)}
              onClick={e => e.stopPropagation()}
              style={{ background:"rgba(255,255,255,0.22)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:6, padding:"2px 6px", fontSize:12, color:"white", fontFamily:"var(--font)", cursor:"pointer", outline:"none" }}
            >
              {param.options.map(o => <option key={o} value={o} style={{ color:"#1D1D1F", background:"white" }}>{o}</option>)}
            </select>
          )
        }
        if (param.type === "num") {
          return (
            <input key={i} type="number" value={val}
              onChange={e => onUpdate(block.id, param.key, e.target.value)}
              onClick={e => e.stopPropagation()}
              style={{ background:"rgba(255,255,255,0.22)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:6, padding:"2px 6px", fontSize:12, color:"white", fontFamily:"var(--font)", width:52, textAlign:"center", outline:"none" }}
            />
          )
        }
        if (param.type === "text") {
          return (
            <input key={i} type="text" value={val}
              onChange={e => onUpdate(block.id, param.key, e.target.value)}
              onClick={e => e.stopPropagation()}
              style={{ background:"rgba(255,255,255,0.22)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:6, padding:"2px 8px", fontSize:12, color:"white", fontFamily:"var(--font)", width:90, outline:"none" }}
            />
          )
        }
        if (param.type === "color") {
          return (
            <input key={i} type="color" value={val}
              onChange={e => onUpdate(block.id, param.key, e.target.value)}
              onClick={e => e.stopPropagation()}
              style={{ width:30, height:26, borderRadius:6, border:"2px solid rgba(255,255,255,0.4)", cursor:"pointer", padding:0, background:"none" }}
            />
          )
        }
        return null
      })}
    </div>
  )
}

// ── Main component
export default function MyoCode() {
  const [script, setScript]         = useState([])
  const [running, setRunning]       = useState(false)
  const [activeCat, setActiveCat]   = useState("events")
  const [activeId, setActiveId]     = useState(null)
  const [sayText, setSayText]       = useState(null)
  const [bgColor, setBgColor]       = useState("#FFFFFF")
  const [dragIdx, setDragIdx]       = useState(null)
  const [dropIdx, setDropIdx]       = useState(null)
  const [tick, setTick]             = useState(0) // force sprite re-render

  const canvasRef  = useRef(null)
  const abortRef   = useRef(null)
  const spriteRef  = useRef({ x: STAGE_W/2, y: STAGE_H/2 })
  const penRef     = useRef({ down: false, color: "#FF2D78", size: 3 })
  const sayTimer   = useRef(null)

  // Init canvas
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, STAGE_W, STAGE_H)
  }, [])

  function getCtx() { return canvasRef.current?.getContext("2d") }

  function clearCanvas(color = "#FFFFFF") {
    const ctx = getCtx(); if (!ctx) return
    ctx.fillStyle = color
    ctx.fillRect(0, 0, STAGE_W, STAGE_H)
  }

  function moveSprite(dx, dy) {
    const s = spriteRef.current
    const nx = Math.max(10, Math.min(STAGE_W-10, s.x + dx))
    const ny = Math.max(10, Math.min(STAGE_H-10, s.y + dy))
    if (penRef.current.down) {
      const ctx = getCtx(); if (ctx) {
        ctx.strokeStyle = penRef.current.color
        ctx.lineWidth   = penRef.current.size
        ctx.lineCap     = "round"
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(nx, ny); ctx.stroke()
      }
    }
    s.x = nx; s.y = ny
    setTick(t => t+1)
  }

  function stampDot(size) {
    const ctx = getCtx(); if (!ctx) return
    ctx.fillStyle = penRef.current.color
    ctx.beginPath(); ctx.arc(spriteRef.current.x, spriteRef.current.y, size/2, 0, Math.PI*2); ctx.fill()
  }

  // Execution engine
  async function executeBlock(block, signal) {
    if (signal.aborted) throw new DOMException("aborted")
    setActiveId(block.id)
    const p = block.params

    const STEP_MS = 30
    try {
      switch (block.type) {
        case "when_start":  break
        case "when_gesture": await waitForGesture(p.gesture, signal); break
        case "wait_for_any": await waitForAnyGesture(signal); break
        case "wait":  await sleep(Number(p.secs || 1) * 1000, signal); break
        case "repeat": break // handled by expansion below
        case "move": {
          const px = Number(p.px || 30)
          const dirs = { left:[-px,0], right:[px,0], up:[0,-px], down:[0,px] }
          const [dx,dy] = dirs[p.dir] || [0,0]
          moveSprite(dx, dy)
          await sleep(STEP_MS, signal)
          break
        }
        case "go_center":
          spriteRef.current.x = STAGE_W/2; spriteRef.current.y = STAGE_H/2
          setTick(t=>t+1); await sleep(STEP_MS, signal)
          break
        case "go_random":
          spriteRef.current.x = 20 + Math.random()*(STAGE_W-40)
          spriteRef.current.y = 20 + Math.random()*(STAGE_H-40)
          setTick(t=>t+1); await sleep(STEP_MS, signal)
          break
        case "pen_down":  penRef.current.down = true;  break
        case "pen_up":    penRef.current.down = false; break
        case "set_color": penRef.current.color = p.color || "#FF2D78"; break
        case "dot": stampDot(Number(p.size || 10)); await sleep(STEP_MS, signal); break
        case "clear": clearCanvas(); await sleep(STEP_MS, signal); break
        case "say":
          clearTimeout(sayTimer.current)
          setSayText(p.text || "Hello!")
          await sleep(Number(p.secs || 2) * 1000, signal)
          setSayText(null)
          break
        case "beep": playBeep(); await sleep(350, signal); break
        case "set_bg":
          setBgColor(p.color || "#FFFFFF")
          clearCanvas(p.color || "#FFFFFF")
          await sleep(STEP_MS, signal)
          break
        default: break
      }
    } catch (e) {
      if (e.name !== "AbortError" && e.message !== "aborted") throw e
      throw e // re-throw to stop execution
    }
  }

  // Expand repeat blocks: repeat N {everything after it} N times
  function expandScript(blocks) {
    const out = []
    let i = 0
    while (i < blocks.length) {
      const b = blocks[i]
      if (b.type === "repeat") {
        const n = Number(b.params.n || 1)
        const rest = expandScript(blocks.slice(i+1))
        for (let r = 0; r < n; r++) out.push(...rest)
        return out // rest consumed
      }
      out.push(b); i++
    }
    return out
  }

  async function run() {
    if (running) return
    setRunning(true)
    setActiveId(null)
    setSayText(null)

    // Reset stage
    clearCanvas()
    spriteRef.current = { x: STAGE_W/2, y: STAGE_H/2 }
    penRef.current    = { down: false, color: "#FF2D78", size: 3 }
    setBgColor("#FFFFFF")
    setTick(t=>t+1)

    const controller = new AbortController()
    abortRef.current = controller
    const { signal } = controller

    try {
      // Run hat blocks and their sequences
      // Find first when_start or just run all
      const expanded = expandScript(script)
      for (const block of expanded) {
        if (signal.aborted) break
        await executeBlock(block, signal)
      }
    } catch {}

    setRunning(false)
    setActiveId(null)
  }

  function stop() {
    abortRef.current?.abort()
    setRunning(false)
    setActiveId(null)
    setSayText(null)
  }

  // Script management
  function addBlock(type) {
    setScript(s => [...s, makeBlock(type)])
  }

  function removeBlock(id) {
    setScript(s => s.filter(b => b.id !== id))
  }

  function updateParam(id, key, value) {
    setScript(s => s.map(b => b.id === id ? { ...b, params:{ ...b.params, [key]:value } } : b))
  }

  function loadExample(ex) {
    stop()
    setScript(ex.script.map(b => makeBlock(b.type, b.params)))
  }

  // Drag reorder in script
  function onScriptDragStart(e, idx) {
    setDragIdx(idx)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("scriptIdx", String(idx))
  }

  function onScriptDragOver(e, idx) {
    e.preventDefault()
    if (dragIdx !== null) setDropIdx(idx)
  }

  function onScriptDrop(e, idx) {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) { setDragIdx(null); setDropIdx(null); return }
    const next = [...script]
    const [moved] = next.splice(dragIdx, 1)
    next.splice(idx > dragIdx ? idx-1 : idx, 0, moved)
    setScript(next)
    setDragIdx(null); setDropIdx(null)
  }

  // Trigger gesture from button
  function triggerGesture(g) {
    if (!running) return
    window.dispatchEvent(new KeyboardEvent("keydown", { key: g.key, bubbles: true }))
  }

  const catBlocks = Object.entries(BLOCK_DEFS).filter(([,d]) => d.cat === activeCat)
  const sprite    = spriteRef.current

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes blockGlow { 0%{box-shadow:0 0 0 2px rgba(255,255,255,0.9)} 100%{box-shadow:0 0 0 8px rgba(255,255,255,0)} }
        .myoblock-active { animation: blockGlow 0.6s ease-out; }
        select option { color:#1D1D1F; background:white; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
      `}</style>

      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#f5f0ff 0%,#ffffff 60%)", borderBottom:"1px solid var(--border)", padding:"100px 32px 40px" }}>
        <div style={{ maxWidth:1140, margin:"0 auto" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.15)", borderRadius:100, padding:"5px 16px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:20 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--accent)", display:"inline-block" }}/>
            Block coding · EMG powered
          </div>
          <h1 style={{ fontSize:"clamp(32px,5vw,56px)", fontWeight:600, letterSpacing:"-2px", color:"var(--text)", marginBottom:12, lineHeight:1.06 }}>
            myocode.
          </h1>
          <p style={{ fontSize:16, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, maxWidth:520 }}>
            A block-based coding environment where EMG gestures are first-class events. Snap blocks together, press Run, then trigger gestures with keys 1–6 to control the program.
          </p>
        </div>
      </div>

      <div style={{ maxWidth:1140, margin:"0 auto", padding:"24px 32px 64px" }}>

        {/* Toolbar */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <button onClick={running ? stop : run} style={{
            background: running ? "#FFF0F5" : "var(--accent)",
            color: running ? "var(--accent)" : "#fff",
            border: running ? "1px solid rgba(255,45,120,0.3)" : "none",
            borderRadius:100, padding:"11px 32px",
            fontFamily:"var(--font)", fontSize:14, fontWeight:600, cursor:"pointer",
            boxShadow: running ? "none" : "0 4px 16px rgba(255,45,120,0.35)",
            display:"flex", alignItems:"center", gap:8, transition:"all 0.15s"
          }}>
            {running ? "⏹ Stop" : "▶ Run"}
          </button>

          <button onClick={() => { stop(); setScript([]) }} style={{
            background:"none", border:"1px solid var(--border)", borderRadius:100,
            padding:"11px 20px", fontFamily:"var(--font)", fontSize:13,
            color:"var(--text-secondary)", cursor:"pointer", transition:"border-color 0.15s"
          }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,45,120,0.3)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}
          >Clear</button>

          {running && (
            <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:"var(--accent)", fontWeight:400, padding:"0 8px" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--accent)", animation:"pulse 1s infinite" }}/>
              Running — press 1–6 or tap gestures below
            </div>
          )}

          <div style={{ marginLeft:"auto", fontSize:12, color:"var(--text-tertiary)" }}>
            {script.length} block{script.length!==1?"s":""}
          </div>
        </div>

        {/* IDE grid */}
        <div style={{ display:"grid", gridTemplateColumns:"200px 1fr 380px", gap:12, alignItems:"start" }}>

          {/* ── PALETTE */}
          <div style={{ background:"var(--bg-secondary)", borderRadius:16, border:"1px solid var(--border)", overflow:"hidden", userSelect:"none" }}>
            {/* Category tabs */}
            {CATEGORIES.map(cat => (
              <button key={cat.key} onClick={()=>setActiveCat(cat.key)} style={{
                display:"flex", alignItems:"center", width:"100%", border:"none",
                borderBottom:"1px solid var(--border)", padding:"10px 14px",
                background: activeCat===cat.key ? cat.color+"18" : "transparent",
                color: activeCat===cat.key ? cat.color : "var(--text-secondary)",
                fontFamily:"var(--font)", fontSize:13,
                fontWeight: activeCat===cat.key ? 600 : 400,
                borderLeft: activeCat===cat.key ? `3px solid ${cat.color}` : "3px solid transparent",
                cursor:"pointer", transition:"all 0.12s"
              }}>{cat.label}</button>
            ))}

            {/* Blocks in category */}
            <div style={{ padding:"8px" }}>
              {catBlocks.map(([type, def]) => {
                const dummyBlock = { id:-1, type, params: Object.fromEntries(def.params.map(p=>[p.key,p.def])) }
                return (
                  <div key={type}
                    onClick={()=>addBlock(type)}
                    draggable
                    onDragStart={e=>{ e.dataTransfer.setData("paletteType", type) }}
                    style={{
                      background: def.color, borderRadius: def.isHat ? "14px 14px 8px 8px" : 10,
                      padding:"9px 12px", marginBottom:5, cursor:"pointer",
                      display:"flex", flexWrap:"wrap", gap:4, alignItems:"center",
                      boxShadow:"0 2px 8px rgba(0,0,0,0.12)",
                      transition:"transform 0.1s, box-shadow 0.1s"
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.03)";e.currentTarget.style.boxShadow=`0 6px 20px ${def.color}50`}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.12)"}}
                  >
                    {def.parts.map((part,i) => (
                      typeof part==="string"
                        ? <span key={i} style={{ fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.95)" }}>{part}</span>
                        : <span key={i} style={{ fontSize:11, background:"rgba(255,255,255,0.25)", borderRadius:4, padding:"1px 5px", color:"white", fontWeight:600 }}>
                            {String(dummyBlock.params[part.p] ?? "?")}
                          </span>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── SCRIPT AREA */}
          <div
            style={{ background:"#F8F4FF", borderRadius:16, border:"2px dashed rgba(139,92,246,0.3)", minHeight:520, padding:14, position:"relative" }}
            onDragOver={e=>{
              e.preventDefault()
              if (e.dataTransfer.types.includes("palettetype")) return
            }}
            onDrop={e=>{
              const type = e.dataTransfer.getData("paletteType")
              if (type && BLOCK_DEFS[type]) addBlock(type)
            }}
          >
            {script.length === 0 && (
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                <div style={{ fontSize:40, marginBottom:12, opacity:0.25 }}>🧩</div>
                <div style={{ fontSize:13, color:"var(--text-tertiary)", fontWeight:300, textAlign:"center", lineHeight:1.7 }}>
                  Click blocks in the palette<br/>to add them here,<br/>or try an example →
                </div>
              </div>
            )}

            {script.map((block, idx) => {
              const def = BLOCK_DEFS[block.type]
              if (!def) return null
              const isActive  = block.id === activeId
              const isDragSrc = dragIdx === idx

              return (
                <div key={block.id}>
                  {dropIdx === idx && dragIdx !== null && dragIdx !== idx && (
                    <div style={{ height:3, background:"var(--accent)", borderRadius:100, marginBottom:4, opacity:0.7 }}/>
                  )}
                  <div
                    draggable
                    onDragStart={e=>{e.stopPropagation(); onScriptDragStart(e, idx)}}
                    onDragOver={e=>onScriptDragOver(e, idx)}
                    onDrop={e=>onScriptDrop(e, idx)}
                    onDragEnd={()=>{setDragIdx(null);setDropIdx(null)}}
                    className={isActive ? "myoblock-active" : ""}
                    style={{
                      background: def.color,
                      borderRadius: def.isHat ? "16px 16px 8px 8px" : 10,
                      padding:"10px 12px", marginBottom:3,
                      display:"flex", alignItems:"center", gap:8, flexWrap:"wrap",
                      cursor:"grab", userSelect:"none",
                      opacity: isDragSrc ? 0.4 : 1,
                      boxShadow: isActive ? `0 0 0 3px rgba(255,255,255,0.9), 0 6px 20px ${def.color}60` : "0 2px 10px rgba(0,0,0,0.13)",
                      transition:"box-shadow 0.2s, opacity 0.15s",
                      marginLeft: def.isHat ? 0 : 8, // indent non-hat blocks slightly
                    }}
                  >
                    {/* Connector dot for non-hat blocks */}
                    {!def.isHat && (
                      <div style={{ width:6, height:6, borderRadius:"50%", background:"rgba(255,255,255,0.4)", flexShrink:0 }}/>
                    )}

                    <BlockLabel block={block} def={def} onUpdate={updateParam} />

                    <button onClick={e=>{e.stopPropagation(); removeBlock(block.id)}} style={{
                      background:"rgba(255,255,255,0.2)", border:"none", borderRadius:"50%",
                      width:20, height:20, flexShrink:0, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:11, color:"rgba(255,255,255,0.85)", lineHeight:1,
                      transition:"background 0.1s"
                    }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.35)"}
                      onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.2)"}
                    >✕</button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── STAGE + CONTROLS */}
          <div>
            {/* Stage */}
            <div style={{ fontSize:13, fontWeight:500, color:"var(--text)", marginBottom:8, display:"flex", justifyContent:"space-between" }}>
              <span>Stage</span>
              <span style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>
                sprite at ({Math.round(sprite.x)}, {Math.round(sprite.y)})
              </span>
            </div>
            <div style={{ position:"relative", borderRadius:12, overflow:"hidden", border:"2px solid var(--border)", boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>
              <canvas ref={canvasRef} width={STAGE_W} height={STAGE_H} style={{ display:"block", width:"100%" }}/>

              {/* Sprite */}
              <div style={{
                position:"absolute",
                left: (sprite.x/STAGE_W)*100 + "%",
                top:  (sprite.y/STAGE_H)*100 + "%",
                transform:"translate(-50%,-50%)",
                width:18, height:18, borderRadius:"50%",
                background:"var(--accent)", border:"2.5px solid white",
                boxShadow:"0 0 0 2px var(--accent), 0 4px 12px rgba(255,45,120,0.5)",
                pointerEvents:"none",
                transition:"left 0.04s linear, top 0.04s linear"
              }}/>

              {/* Speech bubble */}
              {sayText && (
                <div style={{
                  position:"absolute",
                  left: Math.min((sprite.x/STAGE_W)*100 + 5, 60) + "%",
                  top: Math.max((sprite.y/STAGE_H)*100 - 18, 2) + "%",
                  background:"white", borderRadius:10, padding:"6px 11px",
                  fontSize:13, color:"var(--text)",
                  boxShadow:"0 4px 16px rgba(0,0,0,0.12)", border:"1px solid var(--border)",
                  maxWidth:120, pointerEvents:"none", whiteSpace:"nowrap",
                  animation:"dropIn 0.15s ease"
                }}
                  style2={{ // just a note, I'll use a different animation
                  }}
                >
                  {sayText}
                  <div style={{ position:"absolute", bottom:-5, left:10, width:8, height:8, background:"white", border:"1px solid var(--border)", borderTop:"none", borderLeft:"none", transform:"rotate(45deg)" }}/>
                </div>
              )}
            </div>

            {/* Gesture trigger buttons */}
            <div style={{ marginTop:12 }}>
              <div style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300, marginBottom:8 }}>
                Trigger gestures (or press 1–6)
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:5 }}>
                {GESTURE_LIST.map(g => (
                  <button key={g.name} onClick={()=>triggerGesture(g)} style={{
                    background: g.color + "15", border:`1px solid ${g.color}35`,
                    borderRadius:8, padding:"7px 4px",
                    fontSize:11, color: g.color, fontWeight:500,
                    cursor: running ? "pointer" : "default",
                    opacity: running ? 1 : 0.35,
                    fontFamily:"var(--font)", transition:"all 0.12s",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:1
                  }}
                    onMouseEnter={e=>{if(running){e.currentTarget.style.background=g.color+"30";e.currentTarget.style.transform="scale(1.05)"}}}
                    onMouseLeave={e=>{e.currentTarget.style.background=g.color+"15";e.currentTarget.style.transform="scale(1)"}}
                  >
                    <span style={{ fontWeight:700 }}>[{g.key}]</span>
                    <span>{g.name.replace(" flex","")}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Examples */}
            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300, marginBottom:8 }}>Load example</div>
              {EXAMPLES.map(ex => (
                <div key={ex.name} onClick={()=>loadExample(ex)} style={{
                  background:"var(--bg-secondary)", border:"1px solid var(--border)",
                  borderRadius:10, padding:"10px 14px", marginBottom:6,
                  cursor:"pointer", transition:"border-color 0.15s, transform 0.15s"
                }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,45,120,0.3)";e.currentTarget.style.transform="translateX(2px)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="translateX(0)"}}
                >
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:2 }}>{ex.name}</div>
                  <div style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>{ex.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How it works cards */}
        <div style={{ marginTop:40, display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[
            { title:"1. Build",    body:"Click or drag blocks from the palette into the script area. Reorder by dragging. Delete with ✕." },
            { title:"2. Edit",     body:"Change values inline — type a number, pick from a dropdown, or click the color swatch." },
            { title:"3. Run",      body:"Press ▶ Run. Blocks highlight as they execute. The stage shows your program in action." },
            { title:"4. Gesture",  body:"When the program hits a 'When gesture detected' block, press the matching key 1–6 or the buttons above." },
          ].map(c=>(
            <div key={c.title} style={{ background:"var(--bg-secondary)", borderRadius:12, border:"1px solid var(--border)", padding:"18px 20px" }}>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:6 }}>{c.title}</div>
              <p style={{ fontSize:12, color:"var(--text-secondary)", lineHeight:1.65, fontWeight:300, margin:0 }}>{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}