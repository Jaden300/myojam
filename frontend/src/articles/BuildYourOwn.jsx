import { useState, useRef, useEffect } from "react"
import Navbar from "../Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "../Footer"
import UpNext from "../UpNext"
import ArticleBar from "../ArticleUtils"
import NeuralNoise from "../components/NeuralNoise"

const GREEN="#10B981", BLUE="#3B82F6", AMBER="#F59E0B", PINK="#FF2D78", PURPLE="#8B5CF6", RED="#EF4444"

function FaceAvatar({ seed, size = 48 }) {
  const skinTones = ["#f5dce4","#e8c9a0","#c8956c","#8d5524","#f5dce4"]
  const hairColors = ["#1a1a1a","#4a2c0a","#8B4513","#FF2D78","#2c2c2c"]
  const skin = skinTones[seed % skinTones.length]
  const hair = hairColors[(seed * 3) % hairColors.length]
  const eo = (seed % 3) - 1
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="38" fill="#FFF0F5" stroke="#FFD6E7" strokeWidth="1.5"/>
      <rect x="33" y="54" width="14" height="12" rx="4" fill={skin}/>
      <ellipse cx="40" cy="38" rx="20" ry="22" fill={skin}/>
      {seed%3===0&&(<><ellipse cx="40" cy="20" rx="20" ry="10" fill={hair}/><rect x="20" y="18" width="40" height="10" fill={hair}/></>)}
      {seed%3===1&&(<><ellipse cx="40" cy="20" rx="20" ry="10" fill={hair}/><rect x="20" y="18" width="6" height="22" rx="3" fill={hair}/><rect x="54" y="18" width="6" height="22" rx="3" fill={hair}/><rect x="20" y="18" width="40" height="8" fill={hair}/></>)}
      {seed%3===2&&([...Array(8)].map((_,i)=><circle key={i} cx={22+i*5.5} cy={18+Math.sin(i)*3} r="7" fill={hair}/>))}
      <ellipse cx={33+eo} cy="37" rx="3.5" ry="4" fill="white"/><ellipse cx={47+eo} cy="37" rx="3.5" ry="4" fill="white"/>
      <circle cx={33+eo} cy="37.5" r="2.2" fill="#1D1D1F"/><circle cx={47+eo} cy="37.5" r="2.2" fill="#1D1D1F"/>
      <circle cx={34+eo} cy="36.5" r="0.7" fill="white"/><circle cx={48+eo} cy="36.5" r="0.7" fill="white"/>
      <path d={`M ${29+eo} 31 Q ${33+eo} 29 ${37+eo} 31`} stroke="#1D1D1F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d={`M ${43+eo} 31 Q ${47+eo} 29 ${51+eo} 31`} stroke="#1D1D1F" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M 40 39 Q 38 44 36 45 Q 40 46.5 44 45 Q 42 44 40 39" fill="none" stroke={skin==="#f5dce4"?"#e8b8c8":"#a06040"} strokeWidth="1.2" strokeLinecap="round"/>
      <path d={seed%2===0?"M 34 50 Q 40 55 46 50":"M 33 50 Q 40 56 47 50"} stroke="#1D1D1F" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

const ABSTRACT = "Consumer EMG hardware has reached a price point where a working single-channel surface EMG acquisition system can be assembled for $68 using off-the-shelf components. This article provides a complete, reproducible guide to building and validating such a system — covering component selection with costs, electrode placement, wiring, Arduino firmware, signal quality validation, and the path from raw waveform to gesture classifier."

// ── Wiring diagram SVG ───────────────────────────────────────────────────────
function WiringDiagram() {
  const W = 560, H = 260
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:"block", background:"var(--bg)", borderRadius:12 }}>
      <defs>
        <marker id="arrowG" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 Z" fill={GREEN}/>
        </marker>
        <marker id="arrowR" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 Z" fill={RED}/>
        </marker>
        <marker id="arrowB" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 Z" fill={BLUE}/>
        </marker>
      </defs>

      {/* MyoWare 2.0 box */}
      <rect x={28} y={60} width={130} height={140} rx={10} fill={`${PINK}10`} stroke={PINK} strokeWidth={1.5}/>
      <text x={93} y={82} fontSize={11} fontWeight={700} fill={PINK} textAnchor="middle">MyoWare 2.0</text>
      <text x={93} y={96} fontSize={9.5} fill="var(--text-tertiary)" textAnchor="middle">Muscle Sensor</text>
      {[
        { label:"SIG",  y:115, color:GREEN,  note:"signal out" },
        { label:"3.3V", y:138, color:RED,    note:"power in" },
        { label:"GND",  y:161, color:"#888", note:"ground" },
        { label:"EN",   y:184, color:AMBER,  note:"enable (opt)" },
      ].map(p => (
        <g key={p.label}>
          <circle cx={158} cy={p.y} r={5} fill={p.color} stroke="var(--bg)" strokeWidth={1.5}/>
          <text x={148} y={p.y+4} fontSize={9} fill={p.color} textAnchor="end" fontFamily="monospace" fontWeight={600}>{p.label}</text>
        </g>
      ))}

      {/* Electrode symbols */}
      <g>
        <ellipse cx={68} cy={200} rx={18} ry={10} fill={`${PURPLE}18`} stroke={PURPLE} strokeWidth={1.2}/>
        <text x={68} y={203} fontSize={8} fill={PURPLE} textAnchor="middle">E+</text>
        <ellipse cx={105} cy={200} rx={18} ry={10} fill={`${PURPLE}18`} stroke={PURPLE} strokeWidth={1.2}/>
        <text x={105} y={203} fontSize={8} fill={PURPLE} textAnchor="middle">E−</text>
        <ellipse cx={142} cy={200} rx={18} ry={10} fill="rgba(120,120,120,0.18)" stroke="#888" strokeWidth={1.2}/>
        <text x={142} y={203} fontSize={8} fill="#888" textAnchor="middle">REF</text>
        <text x={105} y={218} fontSize={9} fill="var(--text-tertiary)" textAnchor="middle">Ag/AgCl electrodes</text>
      </g>

      {/* Lines: electrodes to MyoWare body */}
      <line x1={68} y1={190} x2={68} y2={170} stroke={PURPLE} strokeWidth={1} strokeDasharray="3,2"/>
      <line x1={105} y1={190} x2={105} y2={170} stroke={PURPLE} strokeWidth={1} strokeDasharray="3,2"/>
      <line x1={142} y1={190} x2={142} y2={170} stroke="#888" strokeWidth={1} strokeDasharray="3,2"/>

      {/* Arduino box */}
      <rect x={380} y={60} width={150} height={140} rx={10} fill={`${BLUE}10`} stroke={BLUE} strokeWidth={1.5}/>
      <text x={455} y={82} fontSize={11} fontWeight={700} fill={BLUE} textAnchor="middle">Arduino Uno R3</text>
      <text x={455} y={96} fontSize={9.5} fill="var(--text-tertiary)" textAnchor="middle">ATmega328P · 10-bit ADC</text>
      {[
        { label:"A0",   y:115, color:GREEN,  note:"analog in" },
        { label:"3.3V", y:138, color:RED,    note:"power out" },
        { label:"GND",  y:161, color:"#888", note:"ground" },
        { label:"USB",  y:184, color:BLUE,   note:"serial out" },
      ].map(p => (
        <g key={p.label}>
          <circle cx={380} cy={p.y} r={5} fill={p.color} stroke="var(--bg)" strokeWidth={1.5}/>
          <text x={392} y={p.y+4} fontSize={9} fill={p.color} fontFamily="monospace" fontWeight={600}>{p.label}</text>
        </g>
      ))}

      {/* Wires */}
      <path d="M 163,115 L 375,115" stroke={GREEN} strokeWidth={2} fill="none" markerEnd="url(#arrowG)"/>
      <path d="M 375,138 L 163,138" stroke={RED}   strokeWidth={2} fill="none" markerEnd="url(#arrowR)"/>
      <path d="M 163,161 L 375,161" stroke="#888"  strokeWidth={1.5} fill="none" strokeDasharray="5,3"/>

      {/* Wire labels */}
      <text x={269} y={110} fontSize={9} fill={GREEN} textAnchor="middle" fontFamily="monospace">SIG → A0</text>
      <text x={269} y={133} fontSize={9} fill={RED}   textAnchor="middle" fontFamily="monospace">3.3V ← 3.3V</text>
      <text x={269} y={156} fontSize={9} fill="#888"  textAnchor="middle" fontFamily="monospace">GND ←→ GND</text>

      {/* PC box */}
      <rect x={420} y={218} width={80} height={28} rx={6} fill={`${BLUE}10`} stroke={BLUE} strokeWidth={1}/>
      <text x={460} y={236} fontSize={9} fill={BLUE} textAnchor="middle" fontFamily="monospace">USB → PC</text>
      <line x1={460} y1={200} x2={460} y2={218} stroke={BLUE} strokeWidth={1.5} markerEnd="url(#arrowB)"/>
      <text x={466} y={212} fontSize={8.5} fill={BLUE} fontFamily="monospace">serial</text>

      {/* Electrode placement note */}
      <rect x={28} y={228} width={200} height={24} rx={6} fill={`${PURPLE}10`} stroke={`${PURPLE}30`} strokeWidth={1}/>
      <text x={128} y={244} fontSize={9.5} fill={PURPLE} textAnchor="middle">E+/E− on muscle belly · REF on bony landmark</text>
    </svg>
  )
}

// ── Cost comparison data ─────────────────────────────────────────────────────
const COST_SYSTEMS = [
  { name:"MyoWare 2.0 + Arduino (this build)", cost:68,    color:GREEN,  note:"Single channel · Open hardware · DIY assembly" },
  { name:"Delsys Trigno Avanti (research)",    cost:15000, color:PURPLE, note:"16 channels · Wireless · Lab-grade SNR" },
  { name:"OTBioelettronica Quattrocento",      cost:22000, color:BLUE,   note:"64 channels · Clinical research standard" },
  { name:"Otto Bock Sensor (clinical prosth)", cost:3800,  color:AMBER,  note:"2 channels · Medical device · CE certified" },
  { name:"Myo armband (discontinued)",         cost:200,   color:PINK,   note:"8 channels · Consumer · Ninapro DB5 used this" },
]
const MAX_COST = 22000

function CostComparisonChart() {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  const logMax = Math.log10(MAX_COST + 1)
  return (
    <div ref={ref} style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {COST_SYSTEMS.map((s, i) => {
        const logPct = Math.log10(s.cost + 1) / logMax * 100
        return (
          <div key={s.name}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:4 }}>
              <span style={{ fontSize:11.5, color:"var(--text)", fontWeight:500 }}>{s.name}</span>
              <span style={{ fontSize:12, fontWeight:700, color:s.color, fontFamily:"monospace" }}>
                {s.cost < 1000 ? `$${s.cost}` : `$${(s.cost/1000).toFixed(0)}k`}
              </span>
            </div>
            <div style={{ height:10, background:"var(--border)", borderRadius:100, overflow:"hidden" }}>
              <div style={{ height:"100%", width: vis ? `${logPct}%` : "0%", background:s.color, borderRadius:100, transition:`width 0.8s ease ${i * 0.12}s` }}/>
            </div>
            <div style={{ fontSize:10.5, color:"var(--text-tertiary)", fontWeight:300, marginTop:3 }}>{s.note}</div>
          </div>
        )
      })}
      <div style={{ marginTop:4, fontSize:10, color:"var(--text-tertiary)", fontWeight:300, textAlign:"center" }}>
        Log scale · Green bar = this build · Research-grade hardware costs 200–320× more
      </div>
    </div>
  )
}

// ── Accuracy expectation data ─────────────────────────────────────────────────
const ACC_SCENARIOS = [
  { label:"Personal classifier, within-session",   pct:93, color:GREEN,  sub:"Your data → your model, same day" },
  { label:"Personal classifier, cross-session",    pct:80, color:BLUE,   sub:"Electrodes removed and reapplied" },
  { label:"myojam cross-subject (16 ch Myo)",      pct:84.85, color:PINK, sub:"10 subjects, LOSO, Ninapro DB5" },
  { label:"Random baseline (6 gestures)",          pct:16.7, color:"var(--text-tertiary)", sub:"Pure chance" },
]

function AccuracyChart() {
  const [vis, setVis] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ display:"flex", flexDirection:"column", gap:10 }}>
      {ACC_SCENARIOS.map((s, i) => (
        <div key={s.label} style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:240, fontSize:11, color:"var(--text-secondary)", fontWeight:300, textAlign:"right", flexShrink:0, lineHeight:1.3 }}>
            {s.label}
            <div style={{ fontSize:10, color:"var(--text-tertiary)" }}>{s.sub}</div>
          </div>
          <div style={{ flex:1, height:11, background:"var(--border)", borderRadius:100, overflow:"hidden" }}>
            <div style={{ height:"100%", width: vis ? `${s.pct}%` : "0%", background:s.color, borderRadius:100, transition:`width 0.8s ease ${i * 0.15}s` }}/>
          </div>
          <div style={{ width:40, fontSize:12, fontWeight:700, color:s.color, flexShrink:0, textAlign:"right" }}>{s.pct}%</div>
        </div>
      ))}
      <div style={{ marginTop:4, fontSize:10, color:"var(--text-tertiary)", fontWeight:300, textAlign:"center" }}>
        Personal classifiers trained on your own data outperform cross-subject generalisation benchmarks
      </div>
    </div>
  )
}

// ── Signal quality checklist ─────────────────────────────────────────────────
const QUALITY_CHECKS = [
  {
    check: "Baseline at rest",
    good: "Low amplitude, near-zero centred signal",
    bad: "High DC offset or drifting baseline",
    fix: "Clean skin with alcohol wipe; ensure REF is on bone, not muscle",
    indicator: GREEN,
  },
  {
    check: "Contraction burst",
    good: "Clear amplitude spike on flex, rapid return on release",
    bad: "No change on contraction, or constant activation",
    fix: "Reposition E+/E− over muscle belly centre; try a stronger gesture",
    indicator: GREEN,
  },
  {
    check: "Noise floor",
    good: "< 5% of contraction amplitude at rest",
    bad: "Noisy baseline that looks like random activity",
    fix: "Move away from mains-powered devices; check electrode-skin contact",
    indicator: AMBER,
  },
  {
    check: "Signal saturation",
    good: "Signal stays within 0–1023 ADC range with headroom",
    bad: "Signal clips at 0 or 1023 on contraction",
    fix: "Reposition electrodes further apart; choose a less dense muscle area",
    indicator: AMBER,
  },
  {
    check: "Flatline",
    good: "Any variation at all",
    bad: "Constant value (usually 0 or 512) regardless of gesture",
    fix: "Check SIG → A0 wire; verify VCC and GND; confirm 3.3V output from Arduino",
    indicator: RED,
  },
]

export default function BuildYourOwn() {
  const navigate = useNavigate()
  const [copiedFirmware, setCopiedFirmware] = useState(false)
  const [copiedPython, setCopiedPython] = useState(false)

  const FIRMWARE = `// myojam single-channel EMG — Arduino firmware
// Sample at ~200 Hz over serial (9600 baud)

const int EMG_PIN = A0;
const unsigned long INTERVAL_US = 5000; // 200 Hz = 5000 µs

unsigned long lastSample = 0;

void setup() {
  Serial.begin(9600);
  analogReference(INTERNAL); // use 1.1V ref for better ADC resolution
}

void loop() {
  unsigned long now = micros();
  if (now - lastSample >= INTERVAL_US) {
    lastSample = now;
    int val = analogRead(EMG_PIN); // 0–1023
    Serial.println(val);
  }
}`

  const PYTHON_READER = `import serial
import numpy as np

# Open serial port (replace 'COM3' with your port on Windows,
# or '/dev/ttyACM0' on Linux/macOS)
ser = serial.Serial('COM3', 9600, timeout=1)
WINDOW = 200   # 1 second at 200 Hz

buffer = []
while True:
    line = ser.readline().decode('utf-8').strip()
    if line:
        buffer.append(int(line))
        if len(buffer) >= WINDOW:
            window = np.array(buffer[-WINDOW:])
            mav = np.mean(np.abs(window))
            rms = np.sqrt(np.mean(window**2))
            print(f"MAV: {mav:.1f}  RMS: {rms:.1f}")
            # Feed window to classifier here`

  function copyFirmware() {
    navigator.clipboard.writeText(FIRMWARE).then(() => { setCopiedFirmware(true); setTimeout(() => setCopiedFirmware(false), 2000) })
  }
  function copyPython() {
    navigator.clipboard.writeText(PYTHON_READER).then(() => { setCopiedPython(true); setTimeout(() => setCopiedPython(false), 2000) })
  }

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />

      <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid var(--border)", padding:"100px 32px 56px" }}>
        <NeuralNoise color={[0.05, 0.70, 0.40]} opacity={0.85} speed={0.0006} />
        <div style={{ position:"absolute", inset:0, background:"rgba(3,0,18,0.65)", zIndex:1 }} />
        <div style={{ maxWidth:720, margin:"0 auto", position:"relative", zIndex:2 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28 }}>
            <span onClick={()=>navigate("/education")} style={{ fontSize:13, color:"var(--accent)", cursor:"pointer" }}>Education</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>→</span>
            <span style={{ fontSize:13, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Build your own EMG rig</span>
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.08)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,45,120,0.3)", borderRadius:100, padding:"5px 16px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:24 }}>
            Hardware · 10 min read
          </div>
          <h1 style={{ fontSize:"clamp(28px, 5vw, 52px)", fontWeight:600, letterSpacing:"-1.5px", color:"#fff", lineHeight:1.08, marginBottom:24 }}>
            Build a working EMG rig for $68.<br/>
            <span style={{ color:"var(--accent)" }}>Complete guide — parts, wiring, firmware.</span>
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,0.72)", fontWeight:300, lineHeight:1.75, marginBottom:36, maxWidth:580 }}>
            MyoWare 2.0 + Arduino Uno R3 + three Ag/AgCl electrodes. That's the full bill of materials. Here's how to wire it, validate the signal, and feed it into a classifier.
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <FaceAvatar seed={3} size={40} />
            <div>
              <div style={{ fontSize:14, fontWeight:500, color:"#fff" }}>myojam team</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", fontWeight:300 }}>Founder & Lead Engineer · April 5, 2026</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"64px 32px 80px" }}>

        {/* Abstract */}
        <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", borderLeft:`3px solid ${GREEN}`, padding:"24px 28px", marginBottom:44 }}>
          <div style={{ fontSize:11, fontWeight:500, color:GREEN, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Abstract</div>
          <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:0, fontStyle:"italic" }}>{ABSTRACT}</p>
        </div>

        {/* Stats strip */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0, border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:48 }}>
          {[
            { val:"$68",    label:"Total cost",      sub:"USD, street price 2025",   color:GREEN },
            { val:"200 Hz", label:"Sample rate",     sub:"10-bit ADC, 5 µs interval", color:BLUE },
            { val:"<3 ms",  label:"Acquisition lag", sub:"USB serial buffer",         color:AMBER },
            { val:"1",      label:"EMG channel",     sub:"MyoWare 2.0 output",        color:PINK },
          ].map(({ val, label, sub, color }, i) => (
            <div key={label} style={{ padding:"20px 14px", background:i%2===0?"var(--bg)":"var(--bg-secondary)", borderRight:i<3?"1px solid var(--border)":"none", textAlign:"center" }}>
              <div style={{ fontSize:20, fontWeight:700, color, letterSpacing:"-0.5px", marginBottom:4 }}>{val}</div>
              <div style={{ fontSize:11, fontWeight:600, color:"var(--text)", marginBottom:3 }}>{label}</div>
              <div style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Cost comparison */}
        <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:48 }}>
          <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Cost vs research & clinical alternatives</span>
          </div>
          <div style={{ padding:"24px 20px" }}>
            <CostComparisonChart />
          </div>
          <div style={{ padding:"12px 20px", fontSize:11, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.6, borderTop:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
            Log scale used — costs span three orders of magnitude. Clinical-grade and research-grade systems include wireless transmission, higher channel counts, medical certification, and vendor support.
          </div>
        </div>

        {/* Parts list */}
        <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:48 }}>
          <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Complete bill of materials</span>
            <span style={{ fontSize:12, fontWeight:700, color:GREEN }}>Total: ~$68</span>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
                  {["Component","Part","Qty","Unit cost","Notes"].map(h => (
                    <th key={h} style={{ padding:"9px 16px", textAlign:"left", fontSize:10.5, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.05em", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { cat:"Sensor",      part:"MyoWare 2.0 Muscle Sensor",   qty:1, cost:"$39.95", notes:"Integrated amplifier + filter. Open hardware.", color:PINK },
                  { cat:"MCU",         part:"Arduino Uno R3 (or clone)",    qty:1, cost:"$27.60", notes:"10-bit ADC on A0. USB-serial built in.", color:BLUE },
                  { cat:"Electrodes",  part:"Ag/AgCl snap electrodes",      qty:"×10", cost:"$0.25 ea", notes:"Disposable adhesive patch type. ECG-grade.", color:PURPLE },
                  { cat:"Cables",      part:"MyoWare electrode snap cables", qty:3, cost:"Incl.",  notes:"Included with MyoWare 2.0 kit.", color:PURPLE },
                  { cat:"Wiring",      part:"Jumper wires (M-M 20cm)",      qty:"×5", cost:"~$2", notes:"SIG, VCC (3.3V), GND. 22 AWG or finer.", color:AMBER },
                  { cat:"Optional",   part:"Small breadboard",              qty:1, cost:"~$3",  notes:"For prototyping. Skip once wiring is confirmed.", color:"var(--text-tertiary)" },
                ].map(({ cat, part, qty, cost, notes, color }, i) => (
                  <tr key={cat} style={{ borderBottom:"1px solid var(--border)", background:i%2===0?"var(--bg)":"var(--bg-secondary)" }}>
                    <td style={{ padding:"11px 16px", fontSize:11, fontWeight:700, color, textTransform:"uppercase", letterSpacing:"0.05em" }}>{cat}</td>
                    <td style={{ padding:"11px 16px", fontSize:12.5, fontWeight:500, color:"var(--text)" }}>{part}</td>
                    <td style={{ padding:"11px 16px", fontSize:12, color:"var(--text-secondary)", fontFamily:"monospace" }}>{qty}</td>
                    <td style={{ padding:"11px 16px", fontSize:12, fontWeight:700, color:GREEN, fontFamily:"monospace" }}>{cost}</td>
                    <td style={{ padding:"11px 16px", fontSize:11.5, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.5 }}>{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding:"12px 20px", fontSize:11, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.6, borderTop:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
            Prices are approximate street prices (2025). Arduino clones are available for ~$8 but require driver installation on Windows. Use genuine boards if you're troubleshooting.
          </div>
        </div>

        {/* Wiring diagram */}
        <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:48 }}>
          <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Wiring diagram</span>
            <div style={{ display:"flex", gap:14 }}>
              {[{c:GREEN,l:"SIG signal"},{c:RED,l:"3.3V power"},{c:"#888",l:"GND"}].map(({c,l})=>(
                <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:18, height:3, background:c, borderRadius:2 }}/>
                  <span style={{ fontSize:10, color:"var(--text-tertiary)" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding:"20px" }}>
            <WiringDiagram />
          </div>
          <div style={{ padding:"12px 20px", fontSize:11, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.7, borderTop:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
            Use Arduino's 3.3V rail (not 5V) to power MyoWare 2.0. The sensor's signal output is ratiometric to supply voltage — at 3.3V, rest state centres near 1.65V, mapped to ADC value ~512.
          </div>
        </div>

        {/* Electrode placement */}
        <div style={{ border:`1px solid ${PURPLE}22`, borderRadius:14, padding:"28px", background:`${PURPLE}06`, marginBottom:48 }}>
          <div style={{ fontSize:11, fontWeight:700, color:PURPLE, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>Electrode placement — step by step</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {[
              {
                step:"01", color:PURPLE,
                title:"Locate the muscle",
                body:"Make a fist. With your other hand, feel the anterior forearm — the large muscle that bulges below your elbow crease is flexor digitorum superficialis (FDS). This is your target.",
              },
              {
                step:"02", color:BLUE,
                title:"Prepare the skin",
                body:"Wipe with an alcohol pad and let dry fully (30 s). Optional: light abrasion with a prep pad drops impedance from ~500 kΩ to <50 kΩ and significantly reduces baseline noise.",
              },
              {
                step:"03", color:PINK,
                title:"Place E+ and E−",
                body:"Place both electrodes 2 cm apart along the muscle belly, parallel to the muscle fibre direction (running forearm length-wise). Avoid the muscle-tendon junction.",
              },
              {
                step:"04", color:AMBER,
                title:"Place the reference",
                body:"Clip the reference (REF) electrode to the lateral epicondyle — the bony prominence on the outside of your elbow. This is electrically quiet and gives the differential amplifier a stable reference.",
              },
            ].map((s) => (
              <div key={s.step} style={{ display:"flex", gap:12 }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:`${s.color}20`, border:`1px solid ${s.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:s.color, flexShrink:0 }}>{s.step}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--text)", marginBottom:5 }}>{s.title}</div>
                  <p style={{ fontSize:12.5, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, margin:0 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Arduino firmware */}
        <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:48 }}>
          <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Arduino firmware</span>
              <span style={{ fontSize:11, color:AMBER, background:`${AMBER}15`, border:`1px solid ${AMBER}30`, borderRadius:100, padding:"2px 8px", fontWeight:500 }}>C++</span>
            </div>
            <button onClick={copyFirmware} style={{ background:"none", border:`1px solid var(--border)`, borderRadius:6, padding:"4px 12px", fontSize:11, color:"var(--text-secondary)", cursor:"pointer", fontFamily:"var(--font)", transition:"all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
              {copiedFirmware ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <pre style={{ margin:0, padding:"20px 24px", fontSize:12, lineHeight:1.8, color:"rgba(255,255,255,0.78)", fontFamily:"monospace", overflowX:"auto", background:"var(--bg)" }}>
{FIRMWARE}
          </pre>
          <div style={{ padding:"12px 20px", fontSize:11, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.6, borderTop:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
            Flash via Arduino IDE. Use Serial Monitor (9600 baud) to verify output before connecting to Python. Each line is one 10-bit ADC sample (0–1023).
          </div>
        </div>

        {/* Python reader */}
        <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:48 }}>
          <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Python serial reader + feature extraction</span>
              <span style={{ fontSize:11, color:BLUE, background:`${BLUE}15`, border:`1px solid ${BLUE}30`, borderRadius:100, padding:"2px 8px", fontWeight:500 }}>Python</span>
            </div>
            <button onClick={copyPython} style={{ background:"none", border:`1px solid var(--border)`, borderRadius:6, padding:"4px 12px", fontSize:11, color:"var(--text-secondary)", cursor:"pointer", fontFamily:"var(--font)", transition:"all 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
              {copiedPython ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <pre style={{ margin:0, padding:"20px 24px", fontSize:12, lineHeight:1.8, color:"rgba(255,255,255,0.78)", fontFamily:"monospace", overflowX:"auto", background:"var(--bg)" }}>
{PYTHON_READER}
          </pre>
          <div style={{ padding:"12px 20px", fontSize:11, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.6, borderTop:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
            Install: <span style={{ fontFamily:"monospace", color:"var(--text-secondary)" }}>pip install pyserial numpy</span>. On macOS/Linux, the port is typically <span style={{ fontFamily:"monospace", color:"var(--text-secondary)" }}>/dev/ttyACM0</span> or <span style={{ fontFamily:"monospace", color:"var(--text-secondary)" }}>/dev/ttyUSB0</span>.
          </div>
        </div>

        {/* Signal quality checklist */}
        <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:48 }}>
          <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>Signal quality checklist</span>
          </div>
          <div style={{ display:"grid", gap:0 }}>
            {QUALITY_CHECKS.map((q, i) => (
              <div key={q.check} style={{ borderBottom:i<QUALITY_CHECKS.length-1?"1px solid var(--border)":"none", padding:"16px 20px", display:"grid", gridTemplateColumns:"auto 1fr 1fr", gap:"0 18px", alignItems:"start" }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:q.indicator, marginTop:3, flexShrink:0 }}/>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:3 }}>{q.check}</div>
                  <div style={{ fontSize:11.5, color:GREEN, fontWeight:300, marginBottom:2 }}>✓ {q.good}</div>
                  <div style={{ fontSize:11.5, color:RED, fontWeight:300 }}>✗ {q.bad}</div>
                </div>
                <div style={{ fontSize:11.5, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.6, borderLeft:"1px solid var(--border)", paddingLeft:18 }}>
                  <span style={{ fontWeight:600, color:"var(--text-secondary)" }}>Fix: </span>{q.fix}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accuracy expectations */}
        <div style={{ border:"1px solid var(--border)", borderRadius:14, overflow:"hidden", marginBottom:48 }}>
          <div style={{ padding:"14px 20px", background:"var(--bg-secondary)", borderBottom:"1px solid var(--border)" }}>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text)", textTransform:"uppercase", letterSpacing:"0.06em" }}>What accuracy to expect</span>
          </div>
          <div style={{ padding:"24px 20px" }}>
            <AccuracyChart />
          </div>
          <div style={{ padding:"12px 20px", fontSize:11, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.6, borderTop:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
            Within-session accuracy benefits from consistent electrode placement and fresh electrode gel. Cross-session drop is driven by electrode repositioning variance — the single biggest source of degradation in consumer EMG systems.
          </div>
        </div>

        {/* Next steps */}
        <div style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", padding:"40px", border:"1px solid var(--border)", marginBottom:48 }}>
          <div style={{ fontSize:11, fontWeight:500, color:GREEN, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:14 }}>From waveform to classifier</div>
          <p style={{ fontSize:15, color:"var(--text-secondary)", lineHeight:1.8, fontWeight:300, margin:"0 0 20px" }}>
            Once you have a clean, burst-on-contraction signal, you're ready to build a personal gesture classifier. The path from here to a working multi-gesture system is:
          </p>
          <div style={{ display:"grid", gap:10 }}>
            {[
              { step:"1", text:"Collect 6 repetitions of each target gesture at 200 Hz — about 2 minutes of recording per gesture.", color:PINK },
              { step:"2", text:"Segment into 200-sample (1 s) windows with 75% overlap. Extract 4 features per window: MAV, RMS, WL, ZCR.", color:BLUE },
              { step:"3", text:"Train a Random Forest on labelled feature vectors. Cross-validate with leave-one-session-out.", color:GREEN },
              { step:"4", text:"Deploy: stream live windows from Arduino, extract features, pass to classifier, read prediction.", color:AMBER },
            ].map((s) => (
              <div key={s.step} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:`${s.color}20`, border:`1px solid ${s.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:s.color, flexShrink:0 }}>{s.step}</div>
                <p style={{ fontSize:13.5, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, margin:0 }}>{s.text}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop:20, padding:"14px 18px", background:`${GREEN}08`, border:`1px solid ${GREEN}20`, borderRadius:10 }}>
            <p style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, margin:0 }}>
              <span style={{ fontWeight:600, color:GREEN }}>Realistic expectation:</span> A personal classifier trained on your own data will typically achieve 90–95% within-session accuracy. Cross-session accuracy without re-calibration will be 75–85%, depending on electrode repositioning consistency.
            </p>
          </div>
        </div>

        <ArticleBar
          url="https://myojam.com/education/build-your-own-emg"
          title="Build a working EMG rig for $68 — complete guide"
          citation={{ apa:`Wong, J. (2026, April 5). Build a working EMG rig for $68. myojam. https://myojam.com/education/build-your-own-emg` }}
          presetLikes={61}
          storageKey="like_build_your_own"
        />

        <div style={{ marginTop:32, display:"flex", justifyContent:"center" }}>
          <button onClick={()=>navigate("/education")} style={{ background:"transparent", color:"var(--text-secondary)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:13, cursor:"pointer", fontFamily:"var(--font)" }}>
            ← Back to Education
          </button>
        </div>
      </div>

      <UpNext current="/education/build-your-own-emg" />
      <Footer />
    </div>
  )
}
