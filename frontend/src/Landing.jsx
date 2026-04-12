import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, StaggerList, HoverCard, SectionPill } from "./Animate"

const STATS = [
  { val:"84.85%", label:"Cross-subject accuracy",  sub:"Tested on unseen individuals" },
  { val:"11",     label:"Published articles",       sub:"From neuroscience to hardware" },
  { val:"5",      label:"Interactive demos",        sub:"No hardware required" },
  { val:"MIT",    label:"Open source license",      sub:"Free to use, fork, and build on" },
]

const PILLARS = [
  {
    slug:"/demos",
    icon:"⚡",
    color:"#FF2D78",
    title:"Live demos",
    sub:"Try it in your browser",
    desc:"Five interactive tools  -  from a live gesture classifier to a block coding environment powered by simulated EMG.",
  },
  {
    slug:"/education",
    icon:"📚",
    color:"#3B82F6",
    title:"Education hub",
    sub:"11 in-depth articles",
    desc:"From the biology of muscle contraction to the ethics of biometric data  -  rigorously written, openly published.",
  },
  {
    slug:"/educators",
    icon:"🎓",
    color:"#8B5CF6",
    title:"For educators",
    sub:"Ready-to-teach lesson plans",
    desc:"Full lesson plans with activities, rubrics, and curriculum alignment. From middle school to university.",
  },
  {
    slug:"/myocode",
    icon:"🧩",
    color:"#10B981",
    title:"myocode",
    sub:"Block coding with EMG",
    desc:"A Scratch-like environment where gestures are first-class events. Build programs that respond to muscle signals.",
  },
]

const ARTICLES = [
  { slug:"/education/emg-explainer",    tag:"Foundations",   title:"The science of muscle-computer interfaces",     time:"8 min" },
  { slug:"/education/why-emg-is-hard",  tag:"Signal proc.",  title:"Why EMG is harder than it looks",               time:"7 min" },
  { slug:"/education/future-of-bci",    tag:"Future",        title:"After EMG: what comes next",                    time:"6 min" },
  { slug:"/education/build-your-own",   tag:"Hardware",      title:"Build your own EMG sensor for under $60",       time:"8 min" },
]

function AnimatedEMGLine() {
  const canvasRef = useRef(null)
  const frameRef  = useRef(0)
  const phaseRef  = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    let raf

    function draw() {
      const W = canvas.width, H = canvas.height
      ctx.clearRect(0, 0, W, H)
      phaseRef.current += 0.03

      const pts = []
      for (let x = 0; x < W; x++) {
        const t = x / W
        const burst = Math.exp(-Math.pow((t - 0.5) * 4, 2)) * 0.85
        const base  = Math.sin(t * 40 + phaseRef.current) * 0.08
        const noise = (Math.random() - 0.5) * 0.04
        const y = H/2 - (burst * Math.sin(t * 120 + phaseRef.current * 3) + base + noise) * H * 0.38
        pts.push({ x, y })
      }

      // Fill
      const grad = ctx.createLinearGradient(0, 0, 0, H)
      grad.addColorStop(0, "rgba(255,45,120,0.15)")
      grad.addColorStop(1, "rgba(255,45,120,0)")
      ctx.beginPath()
      ctx.moveTo(0, H)
      pts.forEach(p => ctx.lineTo(p.x, p.y))
      ctx.lineTo(W, H)
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()

      // Line
      ctx.beginPath()
      pts.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y))
      ctx.strokeStyle = "rgba(255,45,120,0.7)"
      ctx.lineWidth = 1.5
      ctx.stroke()

      raf = requestAnimationFrame(draw)
    }

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resize()
    draw()
    window.addEventListener("resize", resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize) }
  }, [])

  return (
    <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}/>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", onScroll, { passive:true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orbFloat { from{transform:translateY(0) scale(1)} to{transform:translateY(-40px) scale(1.06)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes shimmer  { 0%{background-position:200% center} 100%{background-position:-200% center} }
      `}</style>
      <Navbar />

      {/* ── HERO */}
      <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden", background:"linear-gradient(160deg, #ffffff 0%, #fff0f5 50%, #f5f0ff 100%)" }}>
        {/* Orbs */}
        {[
          ["500px","-100px","-100px",0,"rgba(255,45,120,0.12)"],
          ["380px","60%","80px",2,"rgba(139,92,246,0.1)"],
          ["300px","80%","300px",4,"rgba(59,130,246,0.08)"],
          ["250px","10%","60%",6,"rgba(255,45,120,0.07)"],
        ].map(([size,x,y,delay,color],i)=>(
          <div key={i} style={{ position:"absolute",width:size,height:size,borderRadius:"50%",background:color,left:x,top:y,filter:"blur(80px)",pointerEvents:"none",animation:`orbFloat 10s ${delay}s ease-in-out infinite alternate` }}/>
        ))}

        {/* Animated EMG canvas  -  bottom */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:140, opacity: Math.max(0, 1 - scrollY/300) }}>
          <AnimatedEMGLine />
        </div>

        <div style={{ maxWidth:920, margin:"0 auto", padding:"140px 32px 120px", position:"relative", zIndex:1, width:"100%" }}>
          {/* Badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.85)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,45,120,0.2)", borderRadius:100, padding:"6px 18px", fontSize:13, color:"var(--accent)", fontWeight:500, marginBottom:36, animation:"fadeUp 0.6s ease", boxShadow:"0 2px 12px rgba(255,45,120,0.1)" }}>
            <span style={{ width:7,height:7,borderRadius:"50%",background:"var(--accent)",display:"inline-block",animation:"pulse 2s infinite" }}/>
            Open source · Assistive technology · Education platform
          </div>

          <h1 style={{ fontSize:"clamp(48px,8vw,96px)", fontWeight:700, letterSpacing:"-3.5px", lineHeight:1.0, color:"var(--text)", marginBottom:28, animation:"fadeUp 0.6s 0.1s ease both" }}>
            Control your computer<br/>
            <span style={{ background:"linear-gradient(135deg, #FF2D78 0%, #c026d3 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
              with your muscles.
            </span>
          </h1>

          <p style={{ fontSize:"clamp(17px,2.5vw,21px)", color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, maxWidth:600, marginBottom:48, animation:"fadeUp 0.6s 0.2s ease both" }}>
            myojam reads surface EMG signals from your forearm and classifies hand gestures in real time. An open-source platform for assistive technology, machine learning education, and human-computer interaction research.
          </p>

          <div style={{ display:"flex", gap:12, flexWrap:"wrap", animation:"fadeUp 0.6s 0.3s ease both" }}>
            <button onClick={()=>navigate("/demos")} style={{ background:"var(--accent)", color:"#fff", border:"none", borderRadius:100, padding:"15px 40px", fontSize:16, fontFamily:"var(--font)", fontWeight:600, cursor:"pointer", boxShadow:"0 4px 24px rgba(255,45,120,0.35)", transition:"transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow="0 8px 32px rgba(255,45,120,0.5)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 24px rgba(255,45,120,0.35)"}}
            >Try the demos</button>
            <button onClick={()=>navigate("/education")} style={{ background:"rgba(255,255,255,0.85)", backdropFilter:"blur(8px)", color:"var(--text)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"15px 32px", fontSize:16, fontFamily:"var(--font)", fontWeight:400, cursor:"pointer", transition:"border-color 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,45,120,0.3)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border-mid)"}
            >Read the science →</button>
            <button onClick={()=>navigate("/elevate")} style={{ background:"linear-gradient(135deg, rgba(255,45,120,0.1) 0%, rgba(192,38,211,0.1) 100%)", color:"var(--accent)", border:"1px solid rgba(255,45,120,0.25)", borderRadius:100, padding:"15px 28px", fontSize:16, fontFamily:"var(--font)", fontWeight:500, cursor:"pointer", transition:"all 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="linear-gradient(135deg, rgba(255,45,120,0.18) 0%, rgba(192,38,211,0.18) 100%)";e.currentTarget.style.borderColor="var(--accent)"}}
              onMouseLeave={e=>{e.currentTarget.style.background="linear-gradient(135deg, rgba(255,45,120,0.1) 0%, rgba(192,38,211,0.1) 100%)";e.currentTarget.style.borderColor="rgba(255,45,120,0.25)"}}
            >ELEVATE competition ✦</button>
          </div>
        </div>
      </section>

      {/* ── STATS */}
      <section style={{ background:"var(--bg-secondary)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <StaggerList items={STATS} columns={4} gap={0} renderItem={(s,i)=>(
            <div style={{ padding:"32px 24px", textAlign:"center", borderRight: i<3?"1px solid var(--border)":"none" }}>
              <div style={{ fontSize:32, fontWeight:700, color:"var(--accent)", letterSpacing:"-1.5px", marginBottom:6 }}>{s.val}</div>
              <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:12, color:"var(--text-tertiary)", fontWeight:300 }}>{s.sub}</div>
            </div>
          )}/>
        </div>
      </section>

      {/* ── ELEVATE FEATURE */}
      <section style={{ padding:"80px 32px", background:"linear-gradient(160deg, #0a0010 0%, #1a0030 100%)", position:"relative", overflow:"hidden" }}>
        {[["500px","-80px","-60px","rgba(255,45,120,0.3)"],["350px","70%","40px","rgba(139,92,246,0.2)"],].map(([size,x,y,color],i)=>(
          <div key={i} style={{ position:"absolute",width:size,height:size,borderRadius:"50%",background:color,left:x,top:y,filter:"blur(80px)",pointerEvents:"none" }}/>
        ))}
        <div style={{ maxWidth:920, margin:"0 auto", position:"relative", zIndex:1 }}>
          <Reveal>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:40, flexWrap:"wrap" }}>
              <div style={{ flex:1, minWidth:300 }}>
                <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,45,120,0.15)", border:"1px solid rgba(255,45,120,0.3)", borderRadius:100, padding:"5px 14px", fontSize:12, color:"rgba(255,180,200,0.9)", fontWeight:500, marginBottom:24 }}>
                  <span style={{ width:6,height:6,borderRadius:"50%",background:"#FF2D78",display:"inline-block",animation:"pulse 1.5s infinite" }}/>
                  Registrations open · Deadline April 30
                </div>
                <h2 style={{ fontSize:"clamp(36px,6vw,64px)", fontWeight:800, letterSpacing:"-2.5px", lineHeight:1.0, marginBottom:16, background:"linear-gradient(135deg, #ffffff 0%, #ff9ec4 50%, #c084fc 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                  ELEVATE
                </h2>
                <p style={{ fontSize:16, color:"rgba(255,255,255,0.6)", fontWeight:300, lineHeight:1.75, maxWidth:480, marginBottom:32 }}>
                  myojam's international competition for students, researchers, and innovators building the future of EMG-based human-computer interaction. Four tracks, open to the world, free to enter.
                </p>
                <button onClick={()=>navigate("/elevate")} style={{ background:"linear-gradient(135deg, #FF2D78 0%, #c026d3 100%)", color:"#fff", border:"none", borderRadius:100, padding:"14px 36px", fontSize:15, fontFamily:"var(--font)", fontWeight:600, cursor:"pointer", boxShadow:"0 8px 32px rgba(255,45,120,0.45)", transition:"transform 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.05)";e.currentTarget.style.boxShadow="0 12px 40px rgba(255,45,120,0.6)"}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 8px 32px rgba(255,45,120,0.45)"}}
                >Learn more & register →</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, minWidth:280 }}>
                {[
                  ["4 tracks","Engineering, Research, Design, Education"],
                  ["∞ countries","International  -  open to everyone"],
                  ["Apr 30","Submission deadline"],
                  ["Free","Zero entry fee"],
                ].map(([val,label])=>(
                  <div key={val} style={{ background:"rgba(255,255,255,0.06)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, padding:"18px 16px", textAlign:"center" }}>
                    <div style={{ fontSize:20, fontWeight:700, color:"#FF2D78", letterSpacing:"-0.5px", marginBottom:4 }}>{val}</div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", fontWeight:300, lineHeight:1.5 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── PILLARS */}
      <section style={{ padding:"80px 32px" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <Reveal>
            <SectionPill>What myojam is</SectionPill>
            <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", marginBottom:12 }}>
              Four things in one platform.
            </h2>
            <p style={{ fontSize:16, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, maxWidth:520, marginBottom:48 }}>
              myojam started as a gesture classifier. It's grown into an education and research platform  -  with demos, articles, lesson plans, and an international competition.
            </p>
          </Reveal>
          <StaggerList items={PILLARS} columns={2} gap={16} renderItem={p=>(
            <HoverCard color={p.color+"20"} onClick={()=>navigate(p.slug)} style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", overflow:"hidden", cursor:"pointer" }}>
              <div style={{ background:`linear-gradient(135deg, ${p.color}10 0%, transparent 100%)`, borderBottom:"1px solid var(--border)", padding:"28px 28px 24px" }}>
                <div style={{ width:52, height:52, borderRadius:14, background:p.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:16 }}>{p.icon}</div>
                <div style={{ fontSize:11, fontWeight:500, color:p.color, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>{p.sub}</div>
                <h3 style={{ fontSize:20, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:10 }}>{p.title}</h3>
                <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.7, margin:0 }}>{p.desc}</p>
              </div>
              <div style={{ padding:"16px 28px", display:"flex", justifyContent:"flex-end" }}>
                <span style={{ fontSize:14, fontWeight:500, color:p.color }}>Explore →</span>
              </div>
            </HoverCard>
          )}/>
        </div>
      </section>

      {/* ── RECENT ARTICLES */}
      <section style={{ background:"var(--bg-secondary)", borderTop:"1px solid var(--border)", padding:"80px 32px" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <Reveal>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:40, gap:16, flexWrap:"wrap" }}>
              <div>
                <SectionPill>Education hub</SectionPill>
                <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", marginBottom:0 }}>
                  Recent articles.
                </h2>
              </div>
              <button onClick={()=>navigate("/education")} style={{ background:"none", border:"1px solid var(--border-mid)", borderRadius:100, padding:"10px 24px", fontSize:14, color:"var(--text-secondary)", fontFamily:"var(--font)", cursor:"pointer", transition:"border-color 0.15s, color 0.15s", flexShrink:0 }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.color="var(--accent)"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border-mid)";e.currentTarget.style.color="var(--text-secondary)"}}
              >All articles →</button>
            </div>
          </Reveal>
          <StaggerList items={ARTICLES} columns={2} gap={12} renderItem={a=>(
            <HoverCard onClick={()=>navigate(a.slug)} style={{ background:"var(--bg)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"24px 28px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                  <span style={{ fontSize:11, fontWeight:500, color:"var(--accent)", background:"var(--accent-soft)", border:"1px solid rgba(255,45,120,0.15)", borderRadius:100, padding:"3px 10px" }}>{a.tag}</span>
                  <span style={{ fontSize:11, color:"var(--text-tertiary)", fontWeight:300, alignSelf:"center" }}>{a.time}</span>
                </div>
                <div style={{ fontSize:15, fontWeight:600, color:"var(--text)", lineHeight:1.4 }}>{a.title}</div>
              </div>
              <span style={{ fontSize:16, color:"var(--text-tertiary)", flexShrink:0, marginTop:4 }}>→</span>
            </HoverCard>
          )}/>
        </div>
      </section>

      {/* ── HOW IT WORKS */}
      <section style={{ padding:"80px 32px" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <Reveal>
            <SectionPill>How it works</SectionPill>
            <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", marginBottom:48 }}>
              From muscle to action in under 5ms.
            </h2>
          </Reveal>
          <StaggerList items={[
            ["Signal capture","Surface EMG electrodes on the forearm read electrical activity at 200 Hz across 16 channels. No needles  -  adhesive stickers on skin."],
            ["Feature extraction","Each 200-sample window is compressed into 64 features  -  MAV, RMS, ZC, WL per channel  -  capturing muscle activation patterns."],
            ["Classification","A Random Forest trained on 16,269 windows from 10 Ninapro subjects classifies the gesture in under 5ms with 84.85% cross-subject accuracy."],
            ["Assistive output","Detected gestures map to computer actions  -  cursor movement, clicks, keypresses  -  hands-free, in real time."],
          ]} columns={2} gap={16} renderItem={([title,body],i)=>(
            <HoverCard style={{ background:"var(--bg-secondary)", borderRadius:"var(--radius)", border:"1px solid var(--border)", padding:"28px 32px" }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:"var(--accent-soft)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:"var(--accent)", marginBottom:16 }}>
                {String(i+1).padStart(2,"0")}
              </div>
              <div style={{ fontSize:16, fontWeight:600, color:"var(--text)", marginBottom:10 }}>{title}</div>
              <p style={{ fontSize:14, color:"var(--text-secondary)", lineHeight:1.75, fontWeight:300, margin:0 }}>{body}</p>
            </HoverCard>
          )}/>
        </div>
      </section>

      {/* ── SOCIAL */}
      <section style={{ padding:"0 32px 0", marginBottom:0 }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <Reveal>
            <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"32px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:24, flexWrap:"wrap" }}>
              <div>
                <div style={{ fontSize:10, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:6 }}>Follow the project</div>
                <div style={{ fontSize:16, fontWeight:600, color:"var(--text)", letterSpacing:"-0.3px" }}>Stay connected as myojam grows.</div>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                {[
                  { icon:"fab fa-github",      href:"https://github.com/Jaden300/myojam",          label:"GitHub"    },
                  { icon:"fab fa-linkedin-in",  href:"https://linkedin.com/in/jaden-wong09",        label:"LinkedIn"  },
                  { icon:"fab fa-instagram",    href:"https://instagram.com/YOUR_HANDLE",           label:"Instagram" },
                  { icon:"fab fa-x-twitter",    href:"https://x.com/YOUR_HANDLE",                  label:"X"         },
                  { icon:"fab fa-youtube",      href:"https://youtube.com/YOUR_CHANNEL",            label:"YouTube"   },
                  { icon:"fab fa-tiktok",       href:"https://tiktok.com/@YOUR_HANDLE",            label:"TikTok"    },
                ].map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label} style={{
                    width:44, height:44, borderRadius:"50%",
                    border:"1px solid var(--border)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    color:"var(--text-secondary)", fontSize:16,
                    background:"var(--bg)", transition:"all 0.2s"
                  }}
                    onMouseEnter={e=>{ e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.color="var(--accent)"; e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 8px 20px rgba(255,45,120,0.2)" }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.color="var(--text-secondary)"; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none" }}
                  ><i className={s.icon}/></a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FINAL CTA */}
      <section style={{ padding:"0 32px 80px" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <Reveal>
            <div style={{ background:"linear-gradient(135deg, rgba(255,45,120,0.06) 0%, rgba(139,92,246,0.06) 100%)", border:"1px solid rgba(255,45,120,0.15)", borderRadius:"var(--radius)", padding:"56px 48px", textAlign:"center" }}>
              <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:600, letterSpacing:"-1.5px", color:"var(--text)", marginBottom:16 }}>
                Start exploring.
              </h2>
              <p style={{ fontSize:16, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, maxWidth:480, margin:"0 auto 36px" }}>
                No hardware required for any of the demos, articles, or tools. Everything runs in your browser.
              </p>
              <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                <button onClick={()=>navigate("/demos")} style={{ background:"var(--accent)", color:"#fff", border:"none", borderRadius:100, padding:"14px 36px", fontSize:15, fontFamily:"var(--font)", fontWeight:600, cursor:"pointer", boxShadow:"0 4px 24px rgba(255,45,120,0.3)", transition:"transform 0.15s, box-shadow 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow="0 8px 32px rgba(255,45,120,0.45)"}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 24px rgba(255,45,120,0.3)"}}
                >Try the demos</button>
                <button onClick={()=>navigate("/education")} style={{ background:"none", color:"var(--text)", border:"1px solid var(--border-mid)", borderRadius:100, padding:"14px 28px", fontSize:15, fontFamily:"var(--font)", fontWeight:400, cursor:"pointer", transition:"border-color 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(255,45,120,0.3)"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border-mid)"}
                >Browse articles</button>
                <button onClick={()=>navigate("/myocode")} style={{ background:"none", color:"#8B5CF6", border:"1px solid rgba(139,92,246,0.3)", borderRadius:100, padding:"14px 28px", fontSize:15, fontFamily:"var(--font)", fontWeight:400, cursor:"pointer", transition:"border-color 0.15s" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#8B5CF6"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(139,92,246,0.3)"}
                >Try myocode</button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}