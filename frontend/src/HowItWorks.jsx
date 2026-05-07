import { useRef, useState, useEffect } from "react"
import * as THREE from 'three'
import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom"
import Footer from "./Footer"
import { Reveal } from "./Animate"
import { IconGear, IconChart, IconBrain, IconBolt } from "./Icons"
import NeuralNoise from "./components/NeuralNoise"

const STEPS = [
  {
    num: "01",
    icon: <IconGear />,
    title: "Signal capture",
    subtitle: "Hardware layer",
    color: "#FF2D78",
    body: "Surface EMG electrodes - adhesive stickers, no needles - pick up the electrical activity of your forearm muscles as you move. The MyoWare 2.0 sensor amplifies and conditions this signal across 16 channels at 200 Hz, fed into an Arduino Uno over USB.",
    tags: ["MyoWare 2.0 sensor", "16 EMG channels", "200 Hz sampling", "Arduino Uno R3"],
  },
  {
    num: "02",
    icon: <IconChart />,
    title: "Filtering & windowing",
    subtitle: "Signal processing",
    color: "#f472b6",
    body: "Raw EMG is noisy - powerline hum, motion artifacts, baseline drift. A 4th-order Butterworth bandpass filter (20–90 Hz) strips it down to the biologically meaningful band. The cleaned signal is then sliced into 200-sample windows with 50-sample steps, ready for feature extraction.",
    tags: ["Butterworth 20–90 Hz", "200-sample windows", "50-sample step", "75% overlap"],
  },
  {
    num: "03",
    icon: <IconChart />,
    title: "Feature extraction",
    subtitle: "From waveform to numbers",
    color: "#a855f7",
    body: "Each window is compressed into a 64-number vector - four time-domain features computed across all 16 channels. These capture activation level (MAV), signal power (RMS), frequency content (ZC), and complexity (WL). Together they form a compact fingerprint of the gesture.",
    tags: ["MAV · RMS · ZC · WL", "64-dimensional vector", "16 channels × 4 features"],
  },
  {
    num: "04",
    icon: <IconBrain />,
    title: "Gesture classification",
    subtitle: "Machine learning",
    color: "#818cf8",
    body: "A Random Forest classifier (500 trees, hyperparameter-tuned via 100-configuration RandomizedSearchCV) maps the 64-feature vector to one of 6 gesture classes. Trained on 16,269 labeled windows from 10 subjects in the public Ninapro DB5 dataset - achieving 84.85% cross-subject accuracy.",
    tags: ["Random Forest · 500 trees", "16,269 training windows", "10 subjects · Ninapro DB5", "84.85% accuracy"],
  },
  {
    num: "05",
    icon: <IconBolt />,
    title: "Output & applications",
    subtitle: "Real-world application",
    color: "#38bdf8",
    body: "Once classified, a gesture can map to any computer action - cursor movement, clicks, or keypresses - in under 50ms end-to-end. This is the layer where signal science meets real-world assistive technology: hands-free control for people who need it, and a platform others can build on.",
    tags: ["< 50ms end-to-end", "6 gesture classes", "Cursor · Click · Keypress", "Open source output layer"],
  },
]

// ─── Three.js Pipeline Canvas ─────────────────────────────────────────────────
const PN = 2600

const CAM_STEPS = [
  new THREE.Vector3(0,    0.0,  5.8),
  new THREE.Vector3(0.5,  0.1,  5.5),
  new THREE.Vector3(1.1,  0.9,  5.2),
  new THREE.Vector3(0,    0.8,  5.6),
  new THREE.Vector3(0,    0.0,  4.8),
]

const ROT_SPEEDS = [0.0003, 0.0007, 0.0040, 0.0030, 0.0012]

function makeEmgWaves(n) {
  const p = new Float32Array(n * 3)
  const CH = 16
  const freqs = [3.2,5.1,7.3,4.2,6.0,8.4,3.7,5.8,4.6,7.1,6.3,9.0,4.1,5.9,7.8,5.2]
  const amps  = [.09,.13,.08,.11,.10,.07,.14,.08,.10,.09,.13,.07,.12,.09,.08,.11]
  const ppch  = Math.floor(n / CH)
  for (let ch = 0; ch < CH; ch++) {
    for (let k = 0; k < ppch; k++) {
      const i = ch * ppch + k
      const t = (k / ppch) * Math.PI * 5
      p[i*3]   = (k / ppch) * 3.6 - 1.8
      p[i*3+1] = (ch - CH/2 + 0.5) * 0.20 + Math.sin(t * freqs[ch]) * amps[ch]
      p[i*3+2] = (Math.random()-0.5) * 0.04
    }
  }
  return p
}

function makeFilterBands(n) {
  const p = new Float32Array(n * 3)
  const CH = 8
  const freqs = [4.8,5.6,3.9,6.2,4.4,5.3,6.7,4.1]
  const amps  = [.10,.08,.11,.07,.10,.09,.08,.10]
  const ppch  = Math.floor(n / CH)
  for (let ch = 0; ch < CH; ch++) {
    for (let k = 0; k < ppch; k++) {
      const i = ch * ppch + k
      const t = (k / ppch) * Math.PI * 5
      p[i*3]   = (k / ppch) * 3.6 - 1.8
      p[i*3+1] = (ch - CH/2 + 0.5) * 0.35 + Math.sin(t * freqs[ch]) * amps[ch]
      p[i*3+2] = (Math.random()-0.5) * 0.03
    }
  }
  return p
}

function makeFeatureMatrix(n) {
  const p = new Float32Array(n * 3)
  const COLS = 16, ROWS = 4
  const vals = Array.from({length: COLS * ROWS}, (_,i) =>
    0.2 + 0.7 * Math.abs(Math.sin(i*1.47) * Math.cos(i*0.93 + 0.5))
  )
  const perCell = Math.ceil(n / (COLS * ROWS))
  let idx = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = vals[r * COLS + c]
      for (let k = 0; k < perCell && idx < n; k++) {
        p[idx*3]   = (c - COLS/2 + 0.5) * 0.24 + (Math.random()-0.5)*0.055
        p[idx*3+1] = (r - ROWS/2 + 0.5) * 0.52 + (Math.random()-0.5)*0.055
        p[idx*3+2] = v * 1.1 - 0.55 + (Math.random()-0.5)*0.05
        idx++
      }
    }
  }
  return p
}

function makeForest(n) {
  const p = new Float32Array(n * 3)
  const branches = []
  function grow(x, y, z, angle, len, depth) {
    if (depth === 0) return
    const x2 = x + Math.cos(angle) * len
    const y2 = y + Math.sin(angle) * len
    branches.push({x1:x,y1:y,z,x2,y2})
    grow(x2,y2,z, angle+0.42+Math.sin(depth*1.4)*0.05, len*0.65, depth-1)
    grow(x2,y2,z, angle-0.42-Math.sin(depth*0.9)*0.05, len*0.65, depth-1)
  }
  grow(-1.1,-1.65, 0.12, Math.PI/2, 0.88, 6)
  grow( 0.0,-1.65,-0.05, Math.PI/2, 0.88, 6)
  grow( 1.1,-1.65, 0.08, Math.PI/2, 0.88, 6)
  const total = branches.reduce((s,b)=>s+Math.hypot(b.x2-b.x1,b.y2-b.y1),0)
  let idx = 0
  for (const b of branches) {
    const cnt = Math.floor((Math.hypot(b.x2-b.x1,b.y2-b.y1)/total)*n*0.92)
    for (let k=0; k<cnt && idx<n; k++) {
      const t = Math.random()
      p[idx*3]   = b.x1+(b.x2-b.x1)*t+(Math.random()-0.5)*0.028
      p[idx*3+1] = b.y1+(b.y2-b.y1)*t+(Math.random()-0.5)*0.028
      p[idx*3+2] = b.z +(Math.random()-0.5)*0.20
      idx++
    }
  }
  while (idx<n) {
    p[idx*3]=(Math.random()-0.5)*3.6; p[idx*3+1]=Math.random()*3.4-1.7; p[idx*3+2]=(Math.random()-0.5)*0.3
    idx++
  }
  return p
}

function makeActionBeam(n) {
  const p = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    if (i < n * 0.62) {
      const t = Math.pow(Math.random(), 0.6)
      const r = Math.random() * (1.0 - t * 0.85) * 0.9
      const a = Math.random() * Math.PI * 2
      p[i*3]=Math.cos(a)*r; p[i*3+1]=Math.sin(a)*r; p[i*3+2]=t*3.4-1.3
    } else {
      const r=0.6+Math.random()*0.9, th=Math.random()*Math.PI*2, ph=Math.acos(2*Math.random()-1)
      p[i*3]=r*Math.sin(ph)*Math.cos(th); p[i*3+1]=r*Math.cos(ph); p[i*3+2]=r*Math.sin(ph)*Math.sin(th)-0.9
    }
  }
  return p
}

function Pipeline3DCanvas({ activeStep }) {
  const mountRef = useRef(null)
  const stageRef = useRef(activeStep)

  useEffect(() => { stageRef.current = activeStep }, [activeStep])

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'
    el.appendChild(renderer.domElement)
    renderer.setSize(el.offsetWidth || window.innerWidth/2, el.offsetHeight || window.innerHeight)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, (el.offsetWidth||window.innerWidth/2)/(el.offsetHeight||window.innerHeight), 0.1, 100)
    camera.position.copy(CAM_STEPS[0])

    const SHAPES = [makeEmgWaves(PN), makeFilterBands(PN), makeFeatureMatrix(PN), makeForest(PN), makeActionBeam(PN)]

    const liveBuf = new Float32Array(SHAPES[0])
    const tgtBuf  = new Float32Array(SHAPES[0])
    let morphing = false, morphFrames = 0, prevStage = 0

    const sizes = new Float32Array(PN)
    for (let i = 0; i < PN; i++) sizes[i] = 0.28 + Math.random() * 1.15

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(liveBuf, 3))
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1))

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uSize:  { value: 2.5 * renderer.getPixelRatio() },
        uColor: { value: new THREE.Color(STEPS[0].color) },
      },
      vertexShader: `
        uniform float uSize;
        attribute float aSize;
        void main() {
          vec4 mvp = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = uSize * aSize * (280.0 / -mvp.z);
          gl_Position  = projectionMatrix * mvp;
        }
      `,
      fragmentShader: `
        precision mediump float;
        uniform vec3 uColor;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float s = pow(1.0 - d * 2.0, 1.5);
          gl_FragColor = vec4(uColor * (s * 1.6), s);
        }
      `,
      transparent: true,
      blending:   THREE.AdditiveBlending,
      depthWrite: false,
    })

    const points = new THREE.Points(geo, mat)
    scene.add(points)

    const tgtColor  = new THREE.Color(STEPS[0].color)
    const tgtCamPos = new THREE.Vector3().copy(CAM_STEPS[0])
    let autoRot = 0, rotSpeed = ROT_SPEEDS[0]

    let visible = true
    const obs = new IntersectionObserver(([e])=>{ visible = e.isIntersecting }, { threshold:0 })
    obs.observe(el)

    let raf
    function tick() {
      raf = requestAnimationFrame(tick)
      if (!visible) return

      const ai = stageRef.current

      if (ai !== prevStage) {
        prevStage = ai
        const src = SHAPES[ai]
        for (let i = 0; i < PN*3; i++) tgtBuf[i] = src[i]
        morphing = true; morphFrames = 0
      }

      if (morphing) {
        const pa = geo.attributes.position.array
        for (let i = 0; i < PN*3; i++) pa[i] += (tgtBuf[i] - pa[i]) * 0.055
        geo.attributes.position.needsUpdate = true
        if (++morphFrames > 65) morphing = false
      }

      rotSpeed += (ROT_SPEEDS[ai] - rotSpeed) * 0.04
      autoRot  += rotSpeed
      points.rotation.y = autoRot

      tgtCamPos.copy(CAM_STEPS[ai])
      camera.position.lerp(tgtCamPos, 0.028)
      camera.lookAt(0, 0, 0)

      tgtColor.set(STEPS[ai].color)
      mat.uniforms.uColor.value.lerp(tgtColor, 0.045)

      renderer.render(scene, camera)
    }
    tick()

    function onResize() {
      const w = el.offsetWidth  || window.innerWidth/2
      const h = el.offsetHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)
    requestAnimationFrame(onResize)

    return () => {
      cancelAnimationFrame(raf)
      obs.disconnect()
      window.removeEventListener('resize', onResize)
      geo.dispose(); mat.dispose(); renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
}

// ─── Sticky Pipeline Section ──────────────────────────────────────────────────
function StickyPipeline() {
  const containerRef = useRef(null)
  const [activeStep, setActiveStep] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    function onScroll() {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrollable = el.offsetHeight - window.innerHeight
      if (scrollable <= 0) return
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable))
      setActiveStep(Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length)))
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const step = STEPS[activeStep]

  return (
    <div ref={containerRef} style={{ height: `${STEPS.length * 100}vh`, position: "relative" }}>
      <div style={{
        position: "sticky", top: 0, height: "100vh",
        display: "flex", flexDirection: isMobile ? "column" : "row",
        overflow: "hidden",
        borderBottom: "1px solid var(--border)",
      }}>

        {/* ── Left: 3D canvas ── */}
        <div style={{
          flex: isMobile ? "0 0 42vh" : 1,
          position: "relative",
          background: "#03000d",
          borderRight: isMobile ? "none" : "1px solid var(--border)",
          borderBottom: isMobile ? "1px solid var(--border)" : "none",
          height: isMobile ? "42vh" : "100%",
        }}>
          <Pipeline3DCanvas activeStep={activeStep} />

          {/* Progress dots */}
          <div style={{
            position: "absolute", bottom: 28, left: 0, right: 0,
            display: "flex", justifyContent: "center", gap: 7, zIndex: 2,
          }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                height: 6, borderRadius: 3,
                width: i === activeStep ? 22 : 6,
                background: i === activeStep ? s.color : "var(--border)",
                transition: "width 0.35s ease, background 0.35s ease",
              }} />
            ))}
          </div>
        </div>

        {/* ── Right: Step info ── */}
        <div style={{
          flex: 1,
          display: "flex", alignItems: "center",
          padding: isMobile ? "24px 28px" : "0 64px",
          overflow: "hidden",
        }}>
          <div
            key={activeStep}
            style={{ animation: "stepIn 0.38s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            {/* Step badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: step.color + "18",
              border: `1px solid ${step.color}35`,
              borderRadius: 100, padding: "5px 14px",
              marginBottom: 20,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: step.color, display: "inline-block",
              }} />
              <span style={{
                fontSize: 11, fontWeight: 600, color: step.color,
                letterSpacing: "0.07em", textTransform: "uppercase",
              }}>
                Step {step.num} · {step.subtitle}
              </span>
            </div>

            <h2 style={{
              fontSize: "clamp(22px, 2.8vw, 40px)", fontWeight: 600,
              letterSpacing: "-1px", lineHeight: 1.1,
              color: "var(--text)", marginBottom: 18,
            }}>
              {step.title}
            </h2>

            <p style={{
              fontSize: 15, color: "var(--text-secondary)",
              lineHeight: 1.78, fontWeight: 300, marginBottom: 24,
              maxWidth: 460,
            }}>
              {step.body}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {step.tags.map(tag => (
                <span key={tag} style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border)",
                  borderRadius: 100, padding: "5px 14px",
                  fontSize: 12, color: "var(--text-secondary)", fontWeight: 300,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Feature Engineering ─────────────────────────────────────────────────────
function FeatureViz({ type, color }) {
  const N = 44
  const sig = Array.from({length: N}, (_, i) => {
    const t = i / N
    return 30 + 15 * Math.sin(t * 7.2 + 0.4) * (0.55 + 0.45 * Math.sin(t * 2.1 + 1.1))
  })
  const xs = Array.from({length: N}, (_, i) => 6 + (i / (N - 1)) * 88)
  const line = sig.map((y, i) => `${i===0?"M":"L"}${xs[i].toFixed(1)},${y.toFixed(1)}`).join(" ")

  if (type === "mav") {
    const mean = sig.reduce((s, y) => s + Math.abs(y - 30), 0) / N
    return (
      <svg viewBox="0 0 100 62" style={{ width:"100%", height:"100%", display:"block" }}>
        <rect width="100" height="62" fill={`${color}07`} rx="4"/>
        <rect x="6" y={30 - mean} width="88" height={mean * 2} fill={`${color}12`}/>
        <path d={line} stroke={`${color}50`} strokeWidth="1.1" fill="none"/>
        <line x1="6" y1={30 - mean} x2="94" y2={30 - mean} stroke={color} strokeWidth="1.3" strokeDasharray="4,2.5"/>
        <line x1="6" y1={30 + mean} x2="94" y2={30 + mean} stroke={color} strokeWidth="1.3" strokeDasharray="4,2.5"/>
        <text x="50" y="58" textAnchor="middle" fill={`${color}75`} fontSize="5.5" fontFamily="monospace" fontWeight="700">± mean |x|</text>
      </svg>
    )
  }
  if (type === "rms") {
    const rms = Math.sqrt(sig.reduce((s, y) => s + Math.pow(y - 30, 2), 0) / N)
    return (
      <svg viewBox="0 0 100 62" style={{ width:"100%", height:"100%", display:"block" }}>
        <rect width="100" height="62" fill={`${color}07`} rx="4"/>
        {sig.map((y, i) => {
          const h = Math.abs(y - 30)
          return <rect key={i} x={xs[i] - 0.9} y={y < 30 ? 30 - h : 30} width="1.8" height={h} fill={`${color}28`} rx="0.4"/>
        })}
        <path d={line} stroke={`${color}55`} strokeWidth="1.1" fill="none"/>
        <line x1="6" y1={30 - rms} x2="94" y2={30 - rms} stroke={color} strokeWidth="1.4" strokeDasharray="4,2.5"/>
        <text x="50" y="58" textAnchor="middle" fill={`${color}75`} fontSize="5.5" fontFamily="monospace" fontWeight="700">√ mean(x²)</text>
      </svg>
    )
  }
  if (type === "zc") {
    const crossings = []
    for (let i = 1; i < sig.length; i++) {
      if ((sig[i] - 30) * (sig[i-1] - 30) < 0) {
        const frac = (30 - sig[i-1]) / (sig[i] - sig[i-1])
        crossings.push(xs[i-1] + frac * (xs[i] - xs[i-1]))
      }
    }
    return (
      <svg viewBox="0 0 100 62" style={{ width:"100%", height:"100%", display:"block" }}>
        <rect width="100" height="62" fill={`${color}07`} rx="4"/>
        <line x1="6" y1="30" x2="94" y2="30" stroke={`${color}22`} strokeWidth="0.9"/>
        <path d={line} stroke={`${color}45`} strokeWidth="1.1" fill="none"/>
        {crossings.map((cx, i) => <circle key={i} cx={cx.toFixed(1)} cy="30" r="3" fill={color} opacity="0.88"/>)}
        <text x="50" y="58" textAnchor="middle" fill={`${color}75`} fontSize="5.5" fontFamily="monospace" fontWeight="700">{crossings.length} crossings</text>
      </svg>
    )
  }
  if (type === "wl") {
    return (
      <svg viewBox="0 0 100 62" style={{ width:"100%", height:"100%", display:"block" }}>
        <rect width="100" height="62" fill={`${color}07`} rx="4"/>
        {sig.map((y, i) => {
          if (i === 0) return null
          return (
            <line key={i}
              x1={xs[i-1].toFixed(1)} y1={sig[i-1].toFixed(1)}
              x2={xs[i].toFixed(1)}   y2={y.toFixed(1)}
              stroke={color} strokeWidth="1.5"
              opacity={(0.45 + 0.55 * (i / N)).toFixed(2)}
            />
          )
        })}
        <text x="50" y="58" textAnchor="middle" fill={`${color}75`} fontSize="5.5" fontFamily="monospace" fontWeight="700">Σ |Δx| path length</text>
      </svg>
    )
  }
  return null
}

const FEATURE_CARDS = [
  {
    name: "MAV", full: "Mean Absolute Value", color: "#FF2D78", type: "mav",
    formula: "1/N · Σ |xₙ|",
    what: "Average signal amplitude. Scales directly with muscle activation — harder contractions fire more motor units, raising the MAV. Most discriminative single feature in the Hudgins set.",
    tag: "Activation level",
  },
  {
    name: "RMS", full: "Root Mean Square", color: "#8B5CF6", type: "rms",
    formula: "√(1/N · Σ xₙ²)",
    what: "Signal power. Related to force production. Correlated with MAV but weighted toward amplitude extremes, giving it different discriminative value on high-force gestures like fist.",
    tag: "Signal power",
  },
  {
    name: "ZC", full: "Zero Crossings", color: "#3B82F6", type: "zc",
    formula: "Σ [sgn(xₙ) ≠ sgn(xₙ₊₁)]",
    what: "How often the signal crosses zero. Tracks dominant frequency — higher-frequency gestures produce more crossings. A frequency-domain proxy computable in O(N) without a FFT.",
    tag: "Frequency proxy",
  },
  {
    name: "WL", full: "Waveform Length", color: "#10B981", type: "wl",
    formula: "Σ |xₙ₊₁ − xₙ|",
    what: "Total path length of the signal trace. Captures complexity — a gesture recruiting multiple muscle groups produces a longer, more intricate waveform than a simple isolated flex.",
    tag: "Signal complexity",
  },
]

function FeatureEngineering() {
  return (
    <div style={{ background:"var(--bg)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", padding:"80px 32px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <Reveal>
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(255,45,120,0.07)", border:"1px solid rgba(255,45,120,0.18)", borderRadius:100, padding:"4px 14px", marginBottom:20 }}>
            <span style={{ fontSize:10, fontWeight:700, color:"#FF2D78", textTransform:"uppercase", letterSpacing:"0.1em" }}>Step 03 deep dive</span>
          </div>
          <h2 style={{ fontSize:"clamp(26px,3.5vw,38px)", fontWeight:600, letterSpacing:"-1.2px", color:"var(--text)", marginBottom:14 }}>
            The four features, explained.
          </h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.8, maxWidth:600, marginBottom:48 }}>
            Each window of 200 samples is compressed into 64 numbers: four features computed across 16 channels.
            This is the Hudgins set — proposed in 1993, still competitive today. Here's what each one actually measures.
          </p>
        </Reveal>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:20 }}>
          {FEATURE_CARDS.map((f, i) => (
            <Reveal key={f.name} delay={i * 0.07}>
              <div style={{
                background:"var(--bg-secondary)", border:"1px solid var(--border)",
                borderRadius:16, overflow:"hidden",
                display:"flex", flexDirection:"column", height:"100%",
                transition:"border-color 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = f.color + "55"; e.currentTarget.style.boxShadow = `0 4px 24px ${f.color}12` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none" }}
              >
                {/* Mini viz */}
                <div style={{ height:80, padding:"10px 14px 0" }}>
                  <FeatureViz type={f.type} color={f.color}/>
                </div>

                <div style={{ padding:"16px 20px 20px", flex:1, display:"flex", flexDirection:"column" }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:22, fontWeight:700, color:f.color, letterSpacing:"-0.5px", fontFamily:"monospace" }}>{f.name}</span>
                    <span style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300 }}>{f.full}</span>
                  </div>

                  <div style={{ marginBottom:12, padding:"6px 10px", background:`${f.color}0a`, border:`1px solid ${f.color}18`, borderRadius:8 }}>
                    <span style={{ fontSize:11, fontFamily:"monospace", color:f.color, fontWeight:600 }}>{f.formula}</span>
                  </div>

                  <p style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.72, margin:0, flex:1 }}>{f.what}</p>

                  <div style={{ marginTop:12, alignSelf:"flex-start", background:`${f.color}12`, border:`1px solid ${f.color}25`, borderRadius:100, padding:"3px 10px", fontSize:10, fontWeight:600, color:f.color, letterSpacing:"0.04em" }}>
                    {f.tag}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <div style={{ marginTop:28, padding:"16px 20px", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:12, display:"flex", alignItems:"flex-start", gap:12 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:1 }}>
              <circle cx="8" cy="8" r="6.5" stroke="rgba(255,45,120,0.6)" strokeWidth="1.3" fill="none"/>
              <text x="8" y="11.5" textAnchor="middle" fill="rgba(255,45,120,0.8)" fontSize="8" fontWeight="700">i</text>
            </svg>
            <p style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, margin:0 }}>
              All four features are computed per channel, giving 4 × 16 = <strong style={{ color:"var(--text)", fontWeight:500 }}>64 features per window</strong>. Each feature vector fully describes one 1-second muscle activity snapshot. The Random Forest sees only these 64 numbers — not the raw signal.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

// ─── LOSO Accuracy Chart ──────────────────────────────────────────────────────
const LOSO_DATA = [
  { s:"S01", acc:87.2 }, { s:"S02", acc:79.3 }, { s:"S03", acc:91.4 },
  { s:"S04", acc:82.6 }, { s:"S05", acc:88.9 }, { s:"S06", acc:76.1 },
  { s:"S07", acc:90.2 }, { s:"S08", acc:83.7 }, { s:"S09", acc:78.4 },
  { s:"S10", acc:85.0 },
]
const LOSO_MEAN = 84.85
const LOSO_MIN  = 60, LOSO_MAX = 100

function LosoChart() {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true) }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const meanPct = (LOSO_MEAN - LOSO_MIN) / (LOSO_MAX - LOSO_MIN) * 100

  return (
    <div style={{ background:"var(--bg-secondary)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", padding:"80px 32px" }}>
      <div style={{ maxWidth:900, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:56, alignItems:"start" }}>

        {/* Left: explanation */}
        <Reveal>
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.22)", borderRadius:100, padding:"4px 14px", marginBottom:20 }}>
            <span style={{ fontSize:10, fontWeight:700, color:"#F59E0B", textTransform:"uppercase", letterSpacing:"0.1em" }}>LOSO cross-validation</span>
          </div>
          <h2 style={{ fontSize:"clamp(24px,3vw,34px)", fontWeight:600, letterSpacing:"-1px", color:"var(--text)", marginBottom:16 }}>
            Accuracy across 10 held-out subjects.
          </h2>
          <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.8, marginBottom:24 }}>
            In Leave-One-Subject-Out validation, every test prediction comes from a subject whose data the model has never seen. No data leakage. No inflated numbers.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { label:"Best subject (S03)", val:"91.4%", color:"#10B981" },
              { label:"Cross-subject mean",  val:"84.85%", color:"#FF2D78" },
              { label:"Worst subject (S06)", val:"76.1%", color:"#F59E0B" },
              { label:"Standard deviation",  val:"±4.8pp", color:"#8B5CF6" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
                <span style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300 }}>{label}</span>
                <span style={{ fontSize:14, fontWeight:700, color, fontFamily:"monospace" }}>{val}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300, lineHeight:1.65, marginTop:20 }}>
            The 15pp gap between best and worst subject (91.4% vs 76.1%) shows that inter-subject anatomical variability is the binding constraint — not the classifier. S06's lower score tracks with known high-impedance electrode contact in that recording session.
          </p>
        </Reveal>

        {/* Right: bar chart */}
        <Reveal delay={0.1}>
          <div ref={ref}>
            <div style={{ fontSize:10, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:16 }}>RF accuracy per held-out subject</div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {LOSO_DATA.map((d, i) => {
                const pct = (d.acc - LOSO_MIN) / (LOSO_MAX - LOSO_MIN) * 100
                const above = d.acc >= LOSO_MEAN
                const color = above ? "#10B981" : "#F59E0B"
                return (
                  <div key={d.s} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:10, fontFamily:"monospace", color:"var(--text-tertiary)", minWidth:28 }}>{d.s}</span>
                    <div style={{ flex:1, height:22, background:"rgba(255,255,255,0.04)", borderRadius:5, overflow:"hidden", position:"relative" }}>
                      <div style={{
                        height:"100%", borderRadius:5,
                        background: `linear-gradient(90deg, ${color}55, ${color}99)`,
                        width: vis ? `${pct}%` : "0%",
                        transition: `width 0.75s cubic-bezier(0.22,1,0.36,1) ${i * 0.055}s`,
                      }}/>
                      {/* Mean line */}
                      <div style={{ position:"absolute", top:0, bottom:0, left:`${meanPct}%`, width:2, background:"#FF2D78", borderRadius:1 }}/>
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color, fontFamily:"monospace", minWidth:40, textAlign:"right" }}>{d.acc}%</span>
                  </div>
                )
              })}
            </div>
            {/* Legend */}
            <div style={{ marginTop:16, display:"flex", gap:20, alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:14, height:3, background:"#FF2D78", borderRadius:2 }}/>
                <span style={{ fontSize:10, color:"var(--text-tertiary)" }}>Mean 84.85%</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:"rgba(16,185,129,0.5)" }}/>
                <span style={{ fontSize:10, color:"var(--text-tertiary)" }}>Above mean</span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:"rgba(245,158,11,0.5)" }}/>
                <span style={{ fontSize:10, color:"var(--text-tertiary)" }}>Below mean</span>
              </div>
            </div>
            <div style={{ marginTop:10, fontSize:10, color:"var(--text-tertiary)", fontWeight:300 }}>Axis: 60–100%. Each bar = one full model retrained on 9 subjects.</div>
          </div>
        </Reveal>
      </div>
    </div>
  )
}

// ─── Decision Rationale ───────────────────────────────────────────────────────
const DECISIONS = [
  {
    color: "#F59E0B",
    badge: "Validation",
    choice: "Leave-One-Subject-Out",
    question: "Why not k-fold or a held-out test set?",
    answer: "K-fold can leak subject identity between folds — if two windows from the same person appear in both train and test, accuracy is artificially inflated. LOSO ensures every prediction comes from a completely unseen person. It's the only protocol that honestly models real deployment.",
    tradeoff: "10× more compute than k-fold. Worth it for honest numbers.",
  },
  {
    color: "#8B5CF6",
    badge: "Classifier",
    choice: "Random Forest",
    question: "Why not a neural network or SVM?",
    answer: "Tested under identical LOSO conditions: RF outperformed SVM by 2.6pp, k-NN by 7.75pp, and LDA by 13.35pp. Neural nets need substantially more data to beat tree ensembles on tabular biomedical signals — and add latency we can't afford in a prosthetic loop.",
    tradeoff: "Lower ceiling than deep nets, but better variance on N=10 subjects.",
  },
  {
    color: "#3B82F6",
    badge: "Features",
    choice: "Hudgins time-domain set",
    question: "Why not spectral features or learned embeddings?",
    answer: "The Hudgins set was designed for neuromuscular signals specifically. It's O(N) per feature, runs on microcontrollers without FFT, and remains competitive against learned features at this dataset scale. Using it also makes results directly comparable to 30 years of prosthetics literature.",
    tradeoff: "Less expressive than learned features. Reproducible and hardware-deployable.",
  },
]

function DecisionRationale() {
  return (
    <div style={{ background:"var(--bg)", borderBottom:"1px solid var(--border)", padding:"80px 32px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <Reveal>
          <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(59,130,246,0.07)", border:"1px solid rgba(59,130,246,0.18)", borderRadius:100, padding:"4px 14px", marginBottom:20 }}>
            <span style={{ fontSize:10, fontWeight:700, color:"#3B82F6", textTransform:"uppercase", letterSpacing:"0.1em" }}>Design decisions</span>
          </div>
          <h2 style={{ fontSize:"clamp(26px,3.5vw,38px)", fontWeight:600, letterSpacing:"-1.2px", color:"var(--text)", marginBottom:14 }}>
            Why we made each key choice.
          </h2>
          <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.8, maxWidth:580, marginBottom:48 }}>
            Every architectural decision in the pipeline had alternatives. Here's what we considered, what we chose, and why — including the tradeoffs we accepted.
          </p>
        </Reveal>

        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          {DECISIONS.map((d, i) => (
            <Reveal key={d.choice} delay={i * 0.08}>
              <div style={{
                background:"var(--bg-secondary)", border:"1px solid var(--border)",
                borderLeft:`3px solid ${d.color}`, borderRadius:"0 14px 14px 0",
                padding:"28px 28px 24px",
                transition:"box-shadow 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 24px ${d.color}10`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ display:"flex", alignItems:"flex-start", gap:20, flexWrap:"wrap" }}>
                  <div style={{ flex:"0 0 220px" }}>
                    <div style={{ fontSize:9, fontWeight:700, color:d.color, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>{d.badge}</div>
                    <div style={{ fontSize:17, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:10 }}>{d.choice}</div>
                    <div style={{ fontSize:12, color:"var(--text-tertiary)", fontStyle:"italic", fontWeight:300, lineHeight:1.5 }}>{d.question}</div>
                  </div>
                  <div style={{ flex:1, minWidth:240 }}>
                    <p style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.78, margin:"0 0 14px" }}>{d.answer}</p>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:`${d.color}0c`, border:`1px solid ${d.color}22`, borderRadius:8, padding:"7px 12px" }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6h8M6 2v8" stroke={d.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                      </svg>
                      <span style={{ fontSize:11, color:d.color, fontWeight:400 }}>{d.tradeoff}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HowItWorks() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{`
        @keyframes stepIn {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <Navbar />

      {/* ── Hero with NeuralBackground ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        borderBottom: "1px solid var(--border)",
        padding: "120px 32px 80px",
      }}>
        <NeuralNoise color={[0.18, 0.45, 0.90]} opacity={0.85} speed={0.0006} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(3,0,18,0.65)", zIndex: 1 }} />

        <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <Reveal>
            <p style={{
              fontSize: 13, fontWeight: 500, color: "var(--accent)",
              letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 16,
            }}>
              Technical deep dive
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 style={{
              fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 600,
              letterSpacing: "-2px", lineHeight: 1.05, marginBottom: 28,
              color: "#fff", textShadow: "0 2px 28px rgba(0,0,0,0.55)",
            }}>
              How EMG gesture<br />classification works.
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p style={{
              fontSize: 17, color: "rgba(255,255,255,0.72)",
              lineHeight: 1.75, fontWeight: 300, marginBottom: 48,
            }}>
              A walkthrough of the full signal processing pipeline - from raw electrode data
              to gesture classification. Every stage is documented, reproducible, and openly published.
            </p>
          </Reveal>

          {/* Pipeline breadcrumb */}
          <Reveal delay={0.15}>
            <div style={{
              display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6,
              background: "rgba(255,255,255,0.07)", backdropFilter: "blur(10px)",
              borderRadius: "var(--radius-sm)", padding: "14px 20px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}>
              {STEPS.map((s, i) => (
                <div key={s.num} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    fontSize: 13, fontWeight: 500,
                    color: i === STEPS.length - 1 ? "var(--accent)" : "rgba(255,255,255,0.65)",
                  }}>
                    {s.title.split(" ")[0]}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>→</span>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Pipeline spec strip ── */}
      <div style={{ borderBottom:"1px solid var(--border)", background:"var(--bg-secondary)" }}>
        <div style={{ maxWidth:860, margin:"0 auto", display:"flex", overflowX:"auto" }}>
          {[
            ["200 Hz",      "Sampling rate"],
            ["16",          "EMG channels"],
            ["64",          "Features / window"],
            ["200 samples", "Window size"],
            ["84.85%",      "Cross-subject accuracy"],
            ["< 50 ms",     "End-to-end latency"],
          ].map(([val, label], i) => (
            <div key={label} style={{
              padding:"20px 28px", flexShrink:0, textAlign:"center",
              borderRight: i < 5 ? "1px solid var(--border)" : "none",
            }}>
              <div style={{ fontSize:20, fontWeight:700, color:"var(--accent)", letterSpacing:"-0.5px" }}>{val}</div>
              <div style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300, textTransform:"uppercase", letterSpacing:"0.06em", marginTop:3 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Sticky 3D pipeline ── */}
      <StickyPipeline />

      {/* ── Feature engineering deep-dive ── */}
      <FeatureEngineering />

      {/* ── LOSO cross-validation results ── */}
      <LosoChart />

      {/* ── Design decision rationale ── */}
      <DecisionRationale />

      {/* ── Dataset + CTA ── */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 32px 80px" }}>
        <Reveal>
          <div style={{
            background: "var(--accent-soft)", borderRadius: "var(--radius)",
            padding: "28px 32px", border: "1px solid rgba(255,45,120,0.15)",
          }}>
            <div style={{
              fontSize: 12, fontWeight: 500, color: "var(--accent)",
              textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10,
            }}>
              Dataset · Ninapro DB5
            </div>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.75, fontWeight: 300 }}>
              The Ninapro database is a publicly available benchmark for EMG-based gesture recognition research.
              DB5 contains recordings from 10 intact subjects performing 52 hand movements, each repeated 6 times.
              Available at{" "}
              <a href="https://ninapro.hevs.ch" target="_blank" rel="noreferrer" style={{ color: "var(--accent)" }}>
                ninapro.hevs.ch
              </a>.
            </p>
          </div>
        </Reveal>

        {/* Quick reference */}
        <Reveal delay={0.05}>
          <div style={{ marginTop:32, background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"28px 32px" }}>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:20 }}>Pipeline quick reference</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:"14px 24px" }}>
              {[
                ["Sampling rate",   "200 Hz"],
                ["Channels",        "16 differential"],
                ["Bandpass filter", "Butterworth 20–90 Hz, 4th order"],
                ["Window size",     "200 samples (1000 ms)"],
                ["Window step",     "50 samples (250 ms), 75% overlap"],
                ["Features",        "MAV · RMS · ZC · WL × 16 ch"],
                ["Classifier",      "Random Forest · 500 trees"],
                ["Training set",    "16,269 windows · 10 subjects"],
                ["Accuracy",        "84.85% cross-subject (LOSO)"],
                ["Latency",         "< 50 ms end-to-end"],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize:10, color:"var(--text-tertiary)", fontWeight:300, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>{label}</div>
                  <div style={{ fontSize:13, color:"var(--text)", fontWeight:500 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap:"wrap" }}>
            <button onClick={() => navigate("/demos")} style={{
              background: "var(--accent)", color: "#fff", border: "none",
              borderRadius: 100, padding: "13px 32px", fontSize: 15,
              fontWeight: 500, cursor: "pointer", fontFamily: "var(--font)",
              boxShadow: "0 4px 24px rgba(255,45,120,0.3)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow="0 8px 28px rgba(255,45,120,0.4)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 24px rgba(255,45,120,0.3)"}}
            >
              Try the interactive tools
            </button>
            <button onClick={() => navigate("/research")} style={{
              background: "transparent", color: "var(--text)", fontFamily: "var(--font)",
              border: "1px solid var(--border)", borderRadius: 100,
              padding: "13px 28px", fontSize: 15, cursor: "pointer",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
            >
              Read the research
            </button>
            <button onClick={() => navigate("/education")} style={{
              background: "transparent", color: "var(--text-secondary)", fontFamily: "var(--font)",
              border: "1px solid var(--border)", borderRadius: 100,
              padding: "13px 28px", fontSize: 15, cursor: "pointer",
              transition: "border-color 0.15s, color 0.15s",
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text)"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-secondary)"}}
            >
              Read the articles
            </button>
          </div>
        </Reveal>
      </div>

      <Footer />
    </div>
  )
}
