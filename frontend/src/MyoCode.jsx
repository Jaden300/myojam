import { useState, useRef, useEffect } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import NeuralNoise from "./components/NeuralNoise"
import { Reveal } from "./Animate"
import { IconGestureIndex, IconGestureMiddle, IconGestureRing, IconGesturePinky, IconGestureThumb, IconGestureFist } from "./Icons"

// ── Stage
const STAGE_W = 480, STAGE_H = 310

// ── Gesture registry
const GESTURES = [
  { name:"index flex",  key:"1", color:"#FF2D78", Icon:IconGestureIndex  },
  { name:"middle flex", key:"2", color:"#3B82F6", Icon:IconGestureMiddle },
  { name:"ring flex",   key:"3", color:"#8B5CF6", Icon:IconGestureRing   },
  { name:"pinky flex",  key:"4", color:"#10B981", Icon:IconGesturePinky  },
  { name:"thumb flex",  key:"5", color:"#F59E0B", Icon:IconGestureThumb  },
  { name:"fist",        key:"6", color:"#EF4444", Icon:IconGestureFist   },
]
const GESTURE_NAMES = GESTURES.map(g => g.name)

// ── Block definitions
const BLOCK_DEFS = {
  when_start: {
    cat:"events", color:"#FF2D78", isHat:true,
    parts:["▶  When program starts"], params:[],
  },
  when_gesture: {
    cat:"events", color:"#FF2D78", isHat:true,
    parts:["When", {p:"gesture"}, "detected"],
    params:[{ key:"gesture", type:"select", options:GESTURE_NAMES, def:"index flex" }],
  },
  wait_for_any: {
    cat:"events", color:"#FF2D78",
    parts:["Wait for any gesture"], params:[],
  },
  wait: {
    cat:"control", color:"#F97316",
    parts:["Wait", {p:"secs"}, "seconds"],
    params:[{ key:"secs", type:"num", def:1 }],
  },
  repeat: {
    cat:"control", color:"#F97316",
    parts:["Repeat", {p:"n"}, "times"],
    params:[{ key:"n", type:"num", def:4 }],
  },
  stop_all: {
    cat:"control", color:"#F97316",
    parts:["Stop program"], params:[],
  },
  set_var: {
    cat:"variables", color:"#EA580C",
    parts:["Set", {p:"name"}, "to", {p:"value"}],
    params:[
      { key:"name",  type:"varname", def:"score" },
      { key:"value", type:"num",     def:0 },
    ],
  },
  change_var: {
    cat:"variables", color:"#EA580C",
    parts:["Change", {p:"name"}, "by", {p:"amount"}],
    params:[
      { key:"name",   type:"varname", def:"score" },
      { key:"amount", type:"num",     def:1 },
    ],
  },
  show_var: {
    cat:"variables", color:"#EA580C",
    parts:["Show", {p:"name"}],
    params:[{ key:"name", type:"varname", def:"score" }],
  },
  move: {
    cat:"motion", color:"#3B82F6",
    parts:["Move", {p:"dir"}, {p:"px"}, "px"],
    params:[
      { key:"dir", type:"select", options:["left","right","up","down"], def:"right" },
      { key:"px",  type:"num", def:40 },
    ],
  },
  go_center: {
    cat:"motion", color:"#3B82F6",
    parts:["Go to center"], params:[],
  },
  go_random: {
    cat:"motion", color:"#3B82F6",
    parts:["Jump to random position"], params:[],
  },
  pen_down: {
    cat:"draw", color:"#8B5CF6",
    parts:["Pen down"], params:[],
  },
  pen_up: {
    cat:"draw", color:"#8B5CF6",
    parts:["Pen up"], params:[],
  },
  set_color: {
    cat:"draw", color:"#8B5CF6",
    parts:["Set pen color", {p:"color"}],
    params:[{ key:"color", type:"color", def:"#FF2D78" }],
  },
  dot: {
    cat:"draw", color:"#8B5CF6",
    parts:["Stamp dot, size", {p:"size"}],
    params:[{ key:"size", type:"num", def:10 }],
  },
  clear: {
    cat:"draw", color:"#8B5CF6",
    parts:["Clear stage"], params:[],
  },
  say: {
    cat:"looks", color:"#10B981",
    parts:["Say", {p:"text"}, "for", {p:"secs"}, "s"],
    params:[
      { key:"text", type:"text", def:"Hello!" },
      { key:"secs", type:"num",  def:2 },
    ],
  },
  beep: {
    cat:"looks", color:"#10B981",
    parts:["Play beep"], params:[],
  },
  set_bg: {
    cat:"looks", color:"#10B981",
    parts:["Set background", {p:"color"}],
    params:[{ key:"color", type:"color", def:"#0D0D1A" }],
  },
}

const CATEGORIES = [
  { key:"events",    label:"Events",    color:"#FF2D78" },
  { key:"control",   label:"Control",   color:"#F97316" },
  { key:"variables", label:"Variables", color:"#EA580C" },
  { key:"motion",    label:"Motion",    color:"#3B82F6" },
  { key:"draw",      label:"Draw",      color:"#8B5CF6" },
  { key:"looks",     label:"Looks",     color:"#10B981" },
]

// ── Challenges
const CHALLENGES = [
  {
    level:"Starter", color:"#10B981",
    title:"Gesture Painter",
    desc:"Each finger draws in a different color. Learn how gestures drive events.",
    goal:"Complete a drawing using at least 3 gestures.",
    script:[
      { type:"when_start",   params:{} },
      { type:"go_center",    params:{} },
      { type:"pen_down",     params:{} },
      { type:"when_gesture", params:{ gesture:"index flex" } },
      { type:"set_color",    params:{ color:"#FF2D78" } },
      { type:"move",         params:{ dir:"right", px:40 } },
      { type:"when_gesture", params:{ gesture:"middle flex" } },
      { type:"set_color",    params:{ color:"#3B82F6" } },
      { type:"move",         params:{ dir:"down", px:40 } },
      { type:"when_gesture", params:{ gesture:"ring flex" } },
      { type:"set_color",    params:{ color:"#8B5CF6" } },
      { type:"move",         params:{ dir:"left", px:40 } },
    ],
  },
  {
    level:"Intermediate", color:"#F59E0B",
    title:"Score Counter",
    desc:"Variables let programs remember state. Track a score across gestures.",
    goal:"Build a score that increments with each gesture you make.",
    script:[
      { type:"when_start",   params:{} },
      { type:"set_var",      params:{ name:"score", value:0 } },
      { type:"say",          params:{ text:"Gesture to score!", secs:2 } },
      { type:"wait_for_any", params:{} },
      { type:"change_var",   params:{ name:"score", amount:10 } },
      { type:"show_var",     params:{ name:"score" } },
      { type:"beep",         params:{} },
      { type:"wait_for_any", params:{} },
      { type:"change_var",   params:{ name:"score", amount:10 } },
      { type:"show_var",     params:{ name:"score" } },
    ],
  },
  {
    level:"Advanced", color:"#EF4444",
    title:"Square with Loops",
    desc:"The same 4 moves, repeated. Loops are the engine of efficient programs.",
    goal:"Draw a closed square using only the repeat block and 4 directions.",
    script:[
      { type:"when_start", params:{} },
      { type:"set_bg",     params:{ color:"#0D0D1A" } },
      { type:"go_center",  params:{} },
      { type:"pen_down",   params:{} },
      { type:"set_color",  params:{ color:"#FF2D78" } },
      { type:"repeat",     params:{ n:1 } },
      { type:"move",       params:{ dir:"right", px:80 } },
      { type:"move",       params:{ dir:"down",  px:80 } },
      { type:"move",       params:{ dir:"left",  px:80 } },
      { type:"move",       params:{ dir:"up",    px:80 } },
    ],
  },
]

// ── Preset quick-loads (toolbar)
const EXAMPLES = [
  {
    name:"Spiral",
    script:[
      { type:"when_start", params:{} },
      { type:"set_bg",     params:{ color:"#0D0D1A" } },
      { type:"go_center",  params:{} },
      { type:"pen_down",   params:{} },
      { type:"set_color",  params:{ color:"#FF2D78" } },
      { type:"repeat",     params:{ n:10 } },
      { type:"move",       params:{ dir:"right", px:20 } },
      { type:"dot",        params:{ size:5 } },
      { type:"move",       params:{ dir:"down",  px:20 } },
      { type:"dot",        params:{ size:5 } },
      { type:"move",       params:{ dir:"left",  px:20 } },
      { type:"dot",        params:{ size:5 } },
    ],
  },
  {
    name:"Greeter",
    script:[
      { type:"when_start",   params:{} },
      { type:"say",          params:{ text:"Make a gesture!", secs:2 } },
      { type:"wait_for_any", params:{} },
      { type:"say",          params:{ text:"Nice work!", secs:2 } },
      { type:"beep",         params:{} },
      { type:"when_gesture", params:{ gesture:"fist" } },
      { type:"say",          params:{ text:"Power fist!", secs:2 } },
    ],
  },
  {
    name:"Score tracker",
    script:[
      { type:"when_start",   params:{} },
      { type:"set_var",      params:{ name:"score", value:0 } },
      { type:"wait_for_any", params:{} },
      { type:"change_var",   params:{ name:"score", amount:10 } },
      { type:"show_var",     params:{ name:"score" } },
      { type:"beep",         params:{} },
      { type:"wait_for_any", params:{} },
      { type:"change_var",   params:{ name:"score", amount:10 } },
      { type:"show_var",     params:{ name:"score" } },
    ],
  },
]

// ── CS concept map
const LEARNING_MAP = [
  {
    block:"When gesture detected",
    concept:"Event-driven programming",
    color:"#FF2D78",
    body:"Real software — GUIs, games, IoT devices — responds to events rather than running top-to-bottom forever. In MyoCode your EMG signal is the event. This is the exact model used in every modern user interface.",
  },
  {
    block:"Repeat N times",
    concept:"Iteration & loops",
    color:"#F97316",
    body:"Instead of writing 'move right' 100 times, write it once inside a loop. Loops are one of the most powerful ideas in computing — they turn repetition into abstraction.",
  },
  {
    block:"Set / Change variable",
    concept:"State & memory",
    color:"#EA580C",
    body:"Variables let your program remember things — a score, a position, a count. State is what separates a static instruction list from a living program that evolves as it runs.",
  },
  {
    block:"Pen down + Move",
    concept:"Algorithms & geometry",
    color:"#8B5CF6",
    body:"The path your sprite draws is an algorithm — a sequence of precise instructions that produces a predictable, reproducible result. Change one step and the whole shape changes.",
  },
]

// ── Helpers
let _uid = 0
function uid() { return ++_uid }

function makeBlock(type, params) {
  const def = BLOCK_DEFS[type]
  const defaults = {}
  def.params.forEach(p => { defaults[p.key] = p.def })
  return { id:uid(), type, params:{ ...defaults, ...(params||{}) } }
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException("aborted")); return }
    const t = setTimeout(resolve, ms)
    signal?.addEventListener("abort", () => { clearTimeout(t); reject(new DOMException("aborted")) }, { once:true })
  })
}

function waitForGesture(name, signal) {
  const g = GESTURES.find(g => g.name === name)
  if (!g) return Promise.resolve(null)
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException("aborted")); return }
    const onKey = e => { if (e.key === g.key) { cleanup(); resolve(g) } }
    const onAbort = () => { cleanup(); reject(new DOMException("aborted")) }
    function cleanup() { window.removeEventListener("keydown", onKey); signal?.removeEventListener("abort", onAbort) }
    window.addEventListener("keydown", onKey)
    signal?.addEventListener("abort", onAbort, { once:true })
  })
}

function waitForAnyGesture(signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(new DOMException("aborted")); return }
    const onKey = e => { const g = GESTURES.find(g => g.key === e.key); if (g) { cleanup(); resolve(g) } }
    const onAbort = () => { cleanup(); reject(new DOMException("aborted")) }
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

// ── Block inline param editor
function BlockLabel({ block, def, onUpdate }) {
  const base = {
    background:"rgba(255,255,255,0.18)", border:"1px solid rgba(255,255,255,0.28)",
    borderRadius:6, padding:"2px 6px", fontSize:12, color:"white",
    fontFamily:"var(--font)", outline:"none",
  }
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", flex:1 }}>
      {def.parts.map((part, i) => {
        if (typeof part === "string") return <span key={i} style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.95)" }}>{part}</span>
        const param = def.params.find(p => p.key === part.p)
        if (!param) return null
        const val = block.params[param.key]
        if (param.type === "select") return (
          <select key={i} value={val} onChange={e=>onUpdate(block.id,param.key,e.target.value)} onClick={e=>e.stopPropagation()} style={{ ...base, cursor:"pointer" }}>
            {param.options.map(o=><option key={o} value={o} style={{ color:"#1D1D1F",background:"white" }}>{o}</option>)}
          </select>
        )
        if (param.type === "num") return (
          <input key={i} type="number" value={val} onChange={e=>onUpdate(block.id,param.key,e.target.value)} onClick={e=>e.stopPropagation()} style={{ ...base, width:50, textAlign:"center" }}/>
        )
        if (param.type === "text") return (
          <input key={i} type="text" value={val} onChange={e=>onUpdate(block.id,param.key,e.target.value)} onClick={e=>e.stopPropagation()} style={{ ...base, width:88 }}/>
        )
        if (param.type === "varname") return (
          <input key={i} type="text" value={val} onChange={e=>onUpdate(block.id,param.key,e.target.value)} onClick={e=>e.stopPropagation()} style={{ ...base, width:60, fontStyle:"italic" }}/>
        )
        if (param.type === "color") return (
          <input key={i} type="color" value={val} onChange={e=>onUpdate(block.id,param.key,e.target.value)} onClick={e=>e.stopPropagation()} style={{ width:28, height:24, borderRadius:6, border:"2px solid rgba(255,255,255,0.4)", cursor:"pointer", padding:0, background:"none" }}/>
        )
        return null
      })}
    </div>
  )
}

// ── Main
export default function MyoCode() {
  const [script, setScript]         = useState([])
  const [running, setRunning]       = useState(false)
  const [activeCat, setActiveCat]   = useState("events")
  const [activeId, setActiveId]     = useState(null)
  const [sayText, setSayText]       = useState(null)
  const [dragIdx, setDragIdx]       = useState(null)
  const [dropIdx, setDropIdx]       = useState(null)
  const [tick, setTick]             = useState(0)
  const [log, setLog]               = useState([])
  const [flashGesture, setFlashGesture] = useState(null)
  const [varDisplays, setVarDisplays]   = useState({})

  const canvasRef = useRef(null)
  const abortRef  = useRef(null)
  const spriteRef = useRef({ x:STAGE_W/2, y:STAGE_H/2 })
  const penRef    = useRef({ down:false, color:"#FF2D78", size:3 })
  const varRef    = useRef({})
  const logBox    = useRef(null)

  useEffect(() => { initCanvas() }, [])

  function getCtx() { return canvasRef.current?.getContext("2d") }

  function drawGrid(ctx) {
    ctx.strokeStyle = "rgba(255,255,255,0.04)"
    ctx.lineWidth = 1
    for (let x = 0; x <= STAGE_W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,STAGE_H); ctx.stroke() }
    for (let y = 0; y <= STAGE_H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(STAGE_W,y); ctx.stroke() }
  }

  function initCanvas(color="#0D0D1A") {
    const ctx = getCtx(); if (!ctx) return
    ctx.fillStyle = color
    ctx.fillRect(0, 0, STAGE_W, STAGE_H)
    drawGrid(ctx)
  }

  function clearCanvas(color="#0D0D1A") { initCanvas(color) }

  function moveSprite(dx, dy) {
    const s = spriteRef.current
    const nx = Math.max(10, Math.min(STAGE_W-10, s.x+dx))
    const ny = Math.max(10, Math.min(STAGE_H-10, s.y+dy))
    if (penRef.current.down) {
      const ctx = getCtx()
      if (ctx) {
        ctx.strokeStyle = penRef.current.color
        ctx.lineWidth   = penRef.current.size
        ctx.lineCap     = "round"
        ctx.beginPath(); ctx.moveTo(s.x,s.y); ctx.lineTo(nx,ny); ctx.stroke()
      }
    }
    s.x = nx; s.y = ny
    setTick(t=>t+1)
  }

  function stampDot(size) {
    const ctx = getCtx(); if (!ctx) return
    ctx.fillStyle = penRef.current.color
    ctx.beginPath(); ctx.arc(spriteRef.current.x, spriteRef.current.y, size/2, 0, Math.PI*2); ctx.fill()
  }

  function addLog(entry) {
    setLog(prev => [...prev.slice(-24), entry])
    setTimeout(() => { if (logBox.current) logBox.current.scrollTop = logBox.current.scrollHeight }, 20)
  }

  async function executeBlock(block, signal) {
    if (signal.aborted) throw new DOMException("aborted")
    setActiveId(block.id)
    const p = block.params
    const STEP = 30

    switch (block.type) {
      case "when_start":   break
      case "stop_all":     throw new DOMException("aborted")
      case "when_gesture": {
        addLog({ kind:"wait", text:`Waiting for "${p.gesture}"…` })
        const g = await waitForGesture(p.gesture, signal)
        addLog({ kind:"gesture", text:`▸ ${g.name}`, color:g.color })
        setFlashGesture(g); setTimeout(()=>setFlashGesture(null), 550)
        break
      }
      case "wait_for_any": {
        addLog({ kind:"wait", text:"Waiting for any gesture…" })
        const g = await waitForAnyGesture(signal)
        addLog({ kind:"gesture", text:`▸ ${g.name}`, color:g.color, Icon:g.Icon })
        setFlashGesture(g); setTimeout(()=>setFlashGesture(null), 550)
        break
      }
      case "wait":    await sleep(Number(p.secs||1)*1000, signal); break
      case "repeat":  break
      case "move": {
        const px = Number(p.px||40)
        const dirs = { left:[-px,0], right:[px,0], up:[0,-px], down:[0,px] }
        const [dx,dy] = dirs[p.dir]||[0,0]
        moveSprite(dx,dy); await sleep(STEP,signal); break
      }
      case "go_center":
        spriteRef.current.x = STAGE_W/2; spriteRef.current.y = STAGE_H/2
        setTick(t=>t+1); await sleep(STEP,signal); break
      case "go_random":
        spriteRef.current.x = 20+Math.random()*(STAGE_W-40)
        spriteRef.current.y = 20+Math.random()*(STAGE_H-40)
        setTick(t=>t+1); await sleep(STEP,signal); break
      case "pen_down":  penRef.current.down=true;  break
      case "pen_up":    penRef.current.down=false; break
      case "set_color": penRef.current.color=p.color||"#FF2D78"; break
      case "dot":   stampDot(Number(p.size||10)); await sleep(STEP,signal); break
      case "clear": clearCanvas(); await sleep(STEP,signal); break
      case "say":
        setSayText(p.text||"Hello!")
        addLog({ kind:"say", text:`"${p.text||"Hello!"}"` })
        await sleep(Number(p.secs||2)*1000, signal)
        setSayText(null); break
      case "beep": playBeep(); await sleep(350,signal); break
      case "set_bg":
        clearCanvas(p.color||"#0D0D1A"); await sleep(STEP,signal); break
      case "set_var": {
        const v = Number(p.value??0)
        varRef.current[p.name||"x"] = v
        setVarDisplays(d=>({...d,[p.name||"x"]:v}))
        addLog({ kind:"var", text:`${p.name||"x"} = ${v}` })
        break
      }
      case "change_var": {
        const name = p.name||"x"
        const next = (varRef.current[name]||0) + Number(p.amount??1)
        varRef.current[name] = next
        setVarDisplays(d=>({...d,[name]:next}))
        addLog({ kind:"var", text:`${name} = ${next}` })
        break
      }
      case "show_var": {
        const name = p.name||"x"
        const val  = varRef.current[name]??0
        setSayText(`${name}: ${val}`)
        addLog({ kind:"var", text:`${name} → ${val}` })
        await sleep(1200,signal); setSayText(null); break
      }
      default: break
    }
  }

  function expandScript(blocks) {
    const out = []
    let i = 0
    while (i < blocks.length) {
      const b = blocks[i]
      if (b.type === "repeat") {
        const n = Number(b.params.n||1)
        const rest = expandScript(blocks.slice(i+1))
        for (let r=0; r<n; r++) out.push(...rest)
        return out
      }
      out.push(b); i++
    }
    return out
  }

  async function run() {
    if (running) return
    setRunning(true); setActiveId(null); setSayText(null)
    setLog([]); setVarDisplays({})
    clearCanvas()
    spriteRef.current = { x:STAGE_W/2, y:STAGE_H/2 }
    penRef.current    = { down:false, color:"#FF2D78", size:3 }
    varRef.current    = {}
    setTick(t=>t+1)

    const ctrl = new AbortController()
    abortRef.current = ctrl
    addLog({ kind:"system", text:"▶ started" })

    try {
      const expanded = expandScript(script)
      for (const block of expanded) {
        if (ctrl.signal.aborted) break
        await executeBlock(block, ctrl.signal)
      }
      addLog({ kind:"system", text:"■ finished" })
    } catch {}

    setRunning(false); setActiveId(null)
  }

  function stop() {
    abortRef.current?.abort()
    setRunning(false); setActiveId(null); setSayText(null)
    addLog({ kind:"system", text:"■ stopped" })
  }

  function addBlock(type)             { setScript(s=>[...s, makeBlock(type)]) }
  function removeBlock(id)            { setScript(s=>s.filter(b=>b.id!==id)) }
  function updateParam(id, key, val)  { setScript(s=>s.map(b=>b.id===id?{...b,params:{...b.params,[key]:val}}:b)) }
  function loadExample(ex) {
    stop()
    setScript(ex.script.map(b=>makeBlock(b.type,b.params)))
    setLog([])
  }

  function onScriptDragStart(e, idx) { setDragIdx(idx); e.dataTransfer.effectAllowed="move"; e.dataTransfer.setData("scriptIdx",String(idx)) }
  function onScriptDragOver(e, idx)  { e.preventDefault(); if (dragIdx!==null) setDropIdx(idx) }
  function onScriptDrop(e, idx) {
    e.preventDefault()
    if (dragIdx===null||dragIdx===idx) { setDragIdx(null); setDropIdx(null); return }
    const next=[...script]; const [moved]=next.splice(dragIdx,1)
    next.splice(idx>dragIdx?idx-1:idx,0,moved)
    setScript(next); setDragIdx(null); setDropIdx(null)
  }

  function triggerGesture(g) {
    if (!running) return
    window.dispatchEvent(new KeyboardEvent("keydown",{key:g.key,bubbles:true}))
  }

  const catBlocks = Object.entries(BLOCK_DEFS).filter(([,d])=>d.cat===activeCat)
  const sprite    = spriteRef.current

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />

      <style>{`
        @keyframes pulse     { 0%,100%{opacity:1}      50%{opacity:0.3} }
        @keyframes blockGlow { 0%{box-shadow:0 0 0 2px rgba(255,255,255,0.9)} 100%{box-shadow:0 0 0 12px rgba(255,255,255,0)} }
        @keyframes fadeFlash { 0%{opacity:1} 100%{opacity:0} }
        @keyframes slideUp   { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .myo-active { animation:blockGlow 0.7s ease-out; }
        select option { color:#1D1D1F; background:white; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid var(--border)", padding:"110px 32px 64px" }}>
        <NeuralNoise color={[0.30, 0.20, 0.85]} opacity={0.85} speed={0.0006} />
        <div style={{ position:"absolute", inset:0, background:"rgba(3,0,18,0.72)", zIndex:1 }}/>
        <div style={{ maxWidth:1200, margin:"0 auto", position:"relative", zIndex:2 }}>

          <div style={{ display:"flex", gap:8, marginBottom:22 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.07)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,45,120,0.35)", borderRadius:100, padding:"5px 14px", fontSize:12, color:"var(--accent)", fontWeight:500 }}>
              <span style={{ width:6,height:6,borderRadius:"50%",background:"var(--accent)",display:"inline-block",animation:"pulse 2s infinite" }}/>
              Block coding
            </div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.07)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:100, padding:"5px 14px", fontSize:12, color:"rgba(255,255,255,0.55)", fontWeight:400 }}>
              EMG-native events
            </div>
          </div>

          <h1 style={{ fontSize:"clamp(36px,5.5vw,68px)", fontWeight:700, letterSpacing:"-2.5px", color:"#fff", marginBottom:18, lineHeight:1.03 }}>
            Your forearm<br/>is the controller.
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.66)", fontWeight:300, lineHeight:1.78, maxWidth:520, marginBottom:40 }}>
            MyoCode is the first programming environment where EMG gestures are first-class events — not keybindings, not macros. You write programs. Your muscles run them.
          </p>

          <div style={{ display:"flex", gap:40 }}>
            {[["6","gesture event types"],["6","block categories"],["0","install required"]].map(([n,l])=>(
              <div key={l}>
                <div style={{ fontSize:30, fontWeight:700, color:"#fff", letterSpacing:"-1px", lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", fontWeight:300, marginTop:4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── IDE ──────────────────────────────────────────── */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 20px 0" }}>

        {/* Toolbar */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
          <button onClick={running?stop:run} style={{
            background:running?"rgba(255,45,120,0.1)":"var(--accent)",
            color:running?"var(--accent)":"#fff",
            border:running?"1px solid rgba(255,45,120,0.3)":"none",
            borderRadius:100, padding:"10px 28px",
            fontFamily:"var(--font)", fontSize:14, fontWeight:600, cursor:"pointer",
            boxShadow:running?"none":"0 4px 20px rgba(255,45,120,0.35)",
            display:"flex", alignItems:"center", gap:8, transition:"all 0.15s"
          }}>
            {running
              ? <><span style={{width:8,height:8,borderRadius:2,background:"var(--accent)",display:"inline-block"}}/> Stop</>
              : <><span style={{fontSize:10}}>▶</span> Run</>
            }
          </button>

          <button onClick={()=>{stop();setScript([]);setLog([])}} style={{
            background:"none", border:"1px solid var(--border)", borderRadius:100,
            padding:"10px 18px", fontFamily:"var(--font)", fontSize:13,
            color:"var(--text-secondary)", cursor:"pointer", transition:"border-color 0.15s"
          }}
            onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,45,120,0.3)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}
          >Clear</button>

          {running && (
            <div style={{ display:"flex", alignItems:"center", gap:7, fontSize:13, color:"var(--accent)" }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:"var(--accent)",animation:"pulse 1s infinite" }}/>
              Running — press 1–6
            </div>
          )}

          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, color:"var(--text-tertiary)" }}>Quick-load:</span>
            {EXAMPLES.map(ex=>(
              <button key={ex.name} onClick={()=>loadExample(ex)} style={{
                background:"var(--bg-secondary)", border:"1px solid var(--border)",
                borderRadius:100, padding:"6px 14px",
                fontFamily:"var(--font)", fontSize:12, color:"var(--text-secondary)",
                cursor:"pointer", transition:"all 0.12s"
              }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,45,120,0.3)";e.currentTarget.style.color="var(--accent)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-secondary)"}}
              >{ex.name}</button>
            ))}
          </div>
        </div>

        {/* Main 3-column grid */}
        <div style={{ display:"grid", gridTemplateColumns:"186px 1fr 500px", gap:12, alignItems:"start" }}>

          {/* ── PALETTE */}
          <div style={{ background:"var(--bg-secondary)", borderRadius:16, border:"1px solid var(--border)", overflow:"hidden" }}>
            {CATEGORIES.map(cat=>(
              <button key={cat.key} onClick={()=>setActiveCat(cat.key)} style={{
                display:"flex", alignItems:"center", gap:8, width:"100%", border:"none",
                borderBottom:"1px solid var(--border)", padding:"9px 13px",
                background:activeCat===cat.key?cat.color+"14":"transparent",
                color:activeCat===cat.key?cat.color:"var(--text-secondary)",
                fontFamily:"var(--font)", fontSize:13,
                fontWeight:activeCat===cat.key?600:400,
                borderLeft:activeCat===cat.key?`3px solid ${cat.color}`:"3px solid transparent",
                cursor:"pointer", transition:"all 0.12s"
              }}>
                <span style={{ width:7,height:7,borderRadius:"50%",flexShrink:0,transition:"background 0.12s",
                  background:activeCat===cat.key?cat.color:"var(--text-tertiary)"
                }}/>
                {cat.label}
              </button>
            ))}
            <div style={{ padding:"8px" }}>
              {catBlocks.map(([type,def])=>{
                const dummy={ id:-1, type, params:Object.fromEntries(def.params.map(p=>[p.key,p.def])) }
                return (
                  <div key={type}
                    onClick={()=>addBlock(type)}
                    draggable
                    onDragStart={e=>e.dataTransfer.setData("paletteType",type)}
                    style={{
                      background:def.color, borderRadius:def.isHat?"12px 12px 7px 7px":9,
                      padding:"8px 11px", marginBottom:4, cursor:"pointer",
                      display:"flex", flexWrap:"wrap", gap:4, alignItems:"center",
                      boxShadow:"0 2px 8px rgba(0,0,0,0.12)", transition:"transform 0.1s, box-shadow 0.1s"
                    }}
                    onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.03)";e.currentTarget.style.boxShadow=`0 4px 16px ${def.color}55`}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.12)"}}
                  >
                    {def.parts.map((part,i)=>(
                      typeof part==="string"
                        ? <span key={i} style={{ fontSize:12, fontWeight:500, color:"rgba(255,255,255,0.95)" }}>{part}</span>
                        : <span key={i} style={{ fontSize:11, background:"rgba(255,255,255,0.22)", borderRadius:4, padding:"1px 5px", color:"white" }}>
                            {String(dummy.params[part.p]??"")}
                          </span>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── SCRIPT */}
          <div
            style={{ background:"#F0EEFF", borderRadius:16, border:"2px dashed rgba(139,92,246,0.28)", minHeight:540, padding:12, position:"relative", userSelect:"none" }}
            onDragOver={e=>e.preventDefault()}
            onDrop={e=>{ const t=e.dataTransfer.getData("paletteType"); if(t&&BLOCK_DEFS[t]) addBlock(t) }}
          >
            <div style={{ fontSize:10, fontWeight:600, color:"rgba(139,92,246,0.5)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8, paddingLeft:4 }}>
              Script — {script.length} block{script.length!==1?"s":""}
            </div>

            {script.length===0 && (
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none", gap:10 }}>
                <svg width={36} height={36} viewBox="0 0 24 24" fill="none">
                  <rect x={3} y={3} width={18} height={18} rx={3} stroke="#8B5CF6" strokeWidth={1.5} opacity={.25}/>
                  <path d="M9 9h6M9 12h6M9 15h4" stroke="#8B5CF6" strokeWidth={1.5} strokeLinecap="round" opacity={.25}/>
                </svg>
                <div style={{ fontSize:13, color:"var(--text-tertiary)", fontWeight:300, textAlign:"center", lineHeight:1.8 }}>
                  Click blocks from the palette<br/>or load a quick-start above
                </div>
              </div>
            )}

            {script.map((block,idx)=>{
              const def=BLOCK_DEFS[block.type]; if (!def) return null
              const isActive=block.id===activeId, isDragSrc=dragIdx===idx
              return (
                <div key={block.id}>
                  {dropIdx===idx&&dragIdx!==null&&dragIdx!==idx&&(
                    <div style={{ height:3,background:"#8B5CF6",borderRadius:100,marginBottom:4,opacity:0.7 }}/>
                  )}
                  <div
                    draggable
                    onDragStart={e=>{e.stopPropagation();onScriptDragStart(e,idx)}}
                    onDragOver={e=>onScriptDragOver(e,idx)}
                    onDrop={e=>onScriptDrop(e,idx)}
                    onDragEnd={()=>{setDragIdx(null);setDropIdx(null)}}
                    className={isActive?"myo-active":""}
                    style={{
                      background:def.color,
                      borderRadius:def.isHat?"14px 14px 7px 7px":9,
                      padding:"9px 11px", marginBottom:3,
                      display:"flex", alignItems:"center", gap:8, flexWrap:"wrap",
                      cursor:"grab", userSelect:"none",
                      opacity:isDragSrc?0.4:1,
                      boxShadow:isActive?`0 0 0 3px rgba(255,255,255,0.9),0 6px 24px ${def.color}60`:"0 2px 10px rgba(0,0,0,0.13)",
                      transition:"box-shadow 0.2s, opacity 0.15s",
                      marginLeft:def.isHat?0:10,
                    }}
                  >
                    {!def.isHat&&<div style={{ width:5,height:5,borderRadius:"50%",background:"rgba(255,255,255,0.38)",flexShrink:0 }}/>}
                    <BlockLabel block={block} def={def} onUpdate={updateParam}/>
                    <button onClick={e=>{e.stopPropagation();removeBlock(block.id)}} style={{
                      background:"rgba(255,255,255,0.18)", border:"none", borderRadius:"50%",
                      width:20, height:20, flexShrink:0, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:11, color:"rgba(255,255,255,0.85)", transition:"background 0.1s"
                    }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.35)"}
                      onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.18)"}
                    >✕</button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── STAGE + LOG */}
          <div>
            <div style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300, marginBottom:6, display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, fontWeight:500, color:"var(--text)" }}>Stage</span>
              <span>({Math.round(sprite.x)}, {Math.round(sprite.y)})</span>
            </div>

            {/* Canvas */}
            <div style={{ position:"relative", borderRadius:12, overflow:"hidden", border:"1px solid rgba(255,255,255,0.07)", boxShadow:"0 8px 40px rgba(0,0,0,0.4)" }}>
              <canvas ref={canvasRef} width={STAGE_W} height={STAGE_H} style={{ display:"block", width:"100%" }}/>

              {/* Sprite: crosshair ring */}
              <div style={{ position:"absolute", left:(sprite.x/STAGE_W)*100+"%", top:(sprite.y/STAGE_H)*100+"%", width:0, height:0, pointerEvents:"none" }}>
                <div style={{ width:18, height:18, borderRadius:"50%", border:"2px solid #FF2D78", boxShadow:"0 0 10px rgba(255,45,120,0.7)", position:"absolute", top:0, left:0, transform:"translate(-50%,-50%)", transition:"left 0.05s,top 0.05s" }}/>
                <div style={{ width:5, height:5, borderRadius:"50%", background:"#FF2D78", position:"absolute", top:0, left:0, transform:"translate(-50%,-50%)" }}/>
              </div>

              {/* Gesture flash border */}
              {flashGesture&&(
                <div style={{
                  position:"absolute", inset:0, pointerEvents:"none",
                  border:`2px solid ${flashGesture.color}`,
                  borderRadius:12,
                  background:`${flashGesture.color}18`,
                  animation:"fadeFlash 0.55s ease-out forwards"
                }}/>
              )}

              {/* Speech bubble */}
              {sayText&&(
                <div style={{
                  position:"absolute",
                  left:Math.min((sprite.x/STAGE_W)*100+4, 56)+"%",
                  top:Math.max((sprite.y/STAGE_H)*100-22, 2)+"%",
                  background:"rgba(255,255,255,0.96)", backdropFilter:"blur(12px)",
                  borderRadius:10, padding:"7px 13px",
                  fontSize:13, color:"#1D1D1F",
                  boxShadow:"0 4px 20px rgba(0,0,0,0.3)",
                  border:"1px solid rgba(255,255,255,0.4)",
                  maxWidth:150, pointerEvents:"none", whiteSpace:"nowrap",
                  animation:"slideUp 0.15s ease"
                }}>
                  {sayText}
                  <div style={{ position:"absolute", bottom:-5, left:12, width:8, height:8, background:"rgba(255,255,255,0.96)", border:"1px solid rgba(180,180,180,0.4)", borderTop:"none", borderLeft:"none", transform:"rotate(45deg)" }}/>
                </div>
              )}

              {/* Variable badges */}
              {Object.entries(varDisplays).map(([name,val],i)=>(
                <div key={name} style={{
                  position:"absolute", top:8+i*28, left:8,
                  background:"rgba(234,88,12,0.88)", borderRadius:6, padding:"3px 10px",
                  fontSize:11, color:"white", fontWeight:600,
                  boxShadow:"0 2px 8px rgba(0,0,0,0.3)"
                }}>
                  {name}: {val}
                </div>
              ))}
            </div>

            {/* Gesture pad */}
            <div style={{ marginTop:8, background:"var(--bg-secondary)", borderRadius:12, border:"1px solid var(--border)", padding:"11px 12px" }}>
              <div style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>
                Gesture pad {running?"— active":"— start program first"}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:5 }}>
                {GESTURES.map(g=>(
                  <button key={g.name} onClick={()=>triggerGesture(g)} style={{
                    background:g.color+(running?"1A":"0A"),
                    border:`1px solid ${g.color}${running?"55":"20"}`,
                    borderRadius:8, padding:"8px 4px",
                    fontSize:10, color:g.color, fontWeight:600,
                    cursor:running?"pointer":"default",
                    opacity:running?1:0.38,
                    fontFamily:"var(--font)", transition:"all 0.12s",
                    display:"flex", flexDirection:"column", alignItems:"center", gap:2
                  }}
                    onMouseEnter={e=>{if(running){e.currentTarget.style.background=g.color+"30";e.currentTarget.style.transform="scale(1.04)"}}}
                    onMouseLeave={e=>{e.currentTarget.style.background=g.color+(running?"1A":"0A");e.currentTarget.style.transform="scale(1)"}}
                  >
                    <g.Icon size={15} color={g.color}/>
                    <span style={{ opacity:0.75 }}>[{g.key}] {g.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Execution log */}
            <div ref={logBox} style={{ marginTop:8, background:"#080814", borderRadius:12, border:"1px solid rgba(255,255,255,0.05)", padding:"10px 12px", height:108, overflowY:"auto" }}>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>Execution log</div>
              {log.length===0&&(
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.18)", fontWeight:300 }}>Run a program to see output.</div>
              )}
              {log.map((entry,i)=>(
                <div key={i} style={{
                  fontSize:11, fontFamily:"monospace", marginBottom:2,
                  animation:"slideUp 0.12s ease",
                  color: entry.kind==="gesture"  ? (entry.color||"#FF2D78")
                       : entry.kind==="var"      ? "#F59E0B"
                       : entry.kind==="say"      ? "#10B981"
                       : entry.kind==="system"   ? "rgba(255,255,255,0.25)"
                       : "rgba(255,255,255,0.4)"
                }}>
                  {entry.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Challenges ────────────────────────────────────── */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"64px 20px 0" }}>
        <Reveal>
          <div style={{ marginBottom:6 }}>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.07em" }}>Challenges</span>
          </div>
          <h2 style={{ fontSize:28, fontWeight:600, color:"var(--text)", letterSpacing:"-0.9px", margin:"0 0 8px" }}>Start here.</h2>
          <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, marginBottom:28, maxWidth:520 }}>
            Three starter programs, increasing in complexity. Each one loads a partial script — your job is to run it, understand it, and take it further.
          </p>
        </Reveal>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          {CHALLENGES.map(ch=>(
            <Reveal key={ch.title}>
              <div
                onClick={()=>loadExample(ch)}
                style={{
                  background:"var(--bg-secondary)", borderRadius:16,
                  border:"1px solid var(--border)", padding:"24px",
                  cursor:"pointer", transition:"all 0.18s",
                  position:"relative", overflow:"hidden",
                }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=ch.color+"55";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 32px ${ch.color}18`}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="none"}}
              >
                <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:ch.color, borderRadius:"16px 16px 0 0" }}/>
                <div style={{ fontSize:10, fontWeight:700, color:ch.color, textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:10 }}>{ch.level}</div>
                <div style={{ fontSize:17, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:8 }}>{ch.title}</div>
                <p style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.68, margin:"0 0 16px" }}>{ch.desc}</p>
                <div style={{ background:ch.color+"10", border:`1px solid ${ch.color}28`, borderRadius:8, padding:"8px 12px", fontSize:12, color:ch.color, lineHeight:1.5 }}>
                  Goal: {ch.goal}
                </div>
                <div style={{ marginTop:14, fontSize:11, color:"var(--text-tertiary)", display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ fontSize:9 }}>▶</span> Click to load starter
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── What you're learning ─────────────────────────── */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"64px 20px 0" }}>
        <Reveal>
          <span style={{ fontSize:12, fontWeight:600, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.07em" }}>Computer science, embodied</span>
          <h2 style={{ fontSize:28, fontWeight:600, color:"var(--text)", letterSpacing:"-0.9px", margin:"6px 0 8px" }}>What you're actually learning.</h2>
          <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, marginBottom:28, maxWidth:520 }}>
            Every block in MyoCode maps directly to a concept taught in introductory computer science. This is not a toy — it is a teaching environment for a new kind of computing.
          </p>
        </Reveal>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
          {LEARNING_MAP.map(item=>(
            <Reveal key={item.concept}>
              <div style={{ display:"flex", gap:16, background:"var(--bg-secondary)", borderRadius:14, border:"1px solid var(--border)", padding:"20px 22px" }}>
                <div style={{ width:4, flexShrink:0, alignSelf:"stretch", background:item.color, borderRadius:100 }}/>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:item.color, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 }}>{item.block}</div>
                  <div style={{ fontSize:15, fontWeight:600, color:"var(--text)", letterSpacing:"-0.3px", marginBottom:8 }}>{item.concept}</div>
                  <p style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.72, margin:0 }}>{item.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── Mission strip ─────────────────────────────────── */}
      <div style={{ borderTop:"1px solid var(--border)", marginTop:72, background:"var(--bg-secondary)", padding:"52px 32px" }}>
        <div style={{ maxWidth:680, margin:"0 auto", textAlign:"center" }}>
          <Reveal>
            <div style={{ fontSize:12, fontWeight:600, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:16 }}>The idea</div>
            <p style={{ fontSize:19, color:"var(--text)", fontWeight:400, lineHeight:1.8, letterSpacing:"-0.3px", margin:"0 0 18px" }}>
              "Programming has always assumed fingers on a keyboard. We think the next interface is your body. MyoCode is where that idea becomes a learning environment — not a demo, a tool."
            </p>
            <p style={{ fontSize:13, color:"var(--text-tertiary)", fontWeight:300 }}>
              Built on Ninapro DB5 · 84.85% cross-subject accuracy · MIT License · Open source
            </p>
          </Reveal>
        </div>
      </div>

      <Footer />
    </div>
  )
}
