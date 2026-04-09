import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"

const DEADLINE = new Date("2026-04-30T23:59:59")

const TRACKS = [
  {
    num:"I",
    color:"#FF2D78",
    title:"Engineering & Innovation",
    desc:"Build a novel EMG-based application, device, or interface. Judged on technical execution, originality, and demonstrated real-world impact. Hardware optional.",
    deliverables:["Working prototype or simulation","Technical documentation (min. 1,500 words)","5-minute demonstration video"],
  },
  {
    num:"II",
    color:"#8B5CF6",
    title:"Research & Science",
    desc:"Original research on EMG signal processing, gesture classification, neural interfaces, or adjacent biomedical topics. Academic rigour, reproducibility, and clarity required.",
    deliverables:["Research paper (2,000–5,000 words)","Dataset or source code (where applicable)","Structured abstract (250 words max)"],
  },
  {
    num:"III",
    color:"#3B82F6",
    title:"Design & Accessibility",
    desc:"Design a system, service, or experience using EMG technology to improve accessibility for individuals with motor impairments. Judged on empathy, feasibility, and clarity of vision.",
    deliverables:["Design prototype, mockup, or specification","User research or stakeholder analysis","Impact statement (500 words max)"],
  },
  {
    num:"IV",
    color:"#10B981",
    title:"Education & Outreach",
    desc:"Create an educational resource, curriculum unit, or science communication project teaching EMG concepts to a defined audience. For educators, students, and science communicators.",
    deliverables:["Complete educational materials","Target audience analysis and pilot evidence","5-minute walkthrough or demonstration"],
  },
]

const PRIZES = [
  {
    tier:"Grand Prix",
    subtitle:"Best submission across all tracks",
    color:"#F59E0B",
    dark:"#92400e",
    icon:"🏆",
    awards:[
      "Permanent recognition on myojam.com — featured indefinitely on the ELEVATE honours page",
      "ELEVATE Grand Prix Digital Certificate, co-signed by the myojam founding team",
      "Dedicated case study published in the myojam education hub with full author attribution",
      "Direct mentorship session with the myojam founding team — 60 minutes, agenda set by the winner",
      "Listed as a myojam Grand Prix Laureate in all future communications and publications",
    ],
  },
  {
    tier:"Track Gold",
    subtitle:"First place in each of the four tracks",
    color:"#AEAEB2",
    dark:"#374151",
    icon:"🥇",
    awards:[
      "International recognition and permanent listing on the ELEVATE honours page",
      "ELEVATE Track Gold Digital Certificate with track designation",
      "Featured write-up on myojam.com and across all myojam channels",
      "Open-source contribution credit in the myojam project repository",
    ],
  },
  {
    tier:"Track Silver",
    subtitle:"Second place in each track",
    color:"#9CA3AF",
    dark:"#374151",
    icon:"🥈",
    awards:[
      "International recognition on the ELEVATE honours page",
      "ELEVATE Track Silver Digital Certificate",
      "Honourable mention in myojam's annual impact summary",
    ],
  },
  {
    tier:"Track Bronze",
    subtitle:"Third place in each track",
    color:"#CD7F32",
    dark:"#374151",
    icon:"🥉",
    awards:[
      "Recognition on the ELEVATE honours page",
      "ELEVATE Track Bronze Digital Certificate",
    ],
  },
]

const CRITERIA = [
  { label:"Impact",         weight:30, desc:"Does this work make a meaningful difference — to a user, a field, or a classroom? Evidence of real-world relevance is weighted heavily." },
  { label:"Originality",    weight:25, desc:"Is this a genuinely new idea, approach, or application? The panel looks for work that advances the field rather than replicates the obvious." },
  { label:"Execution",      weight:25, desc:"Is the submission well-built, well-argued, or well-designed? Does it demonstrably work or make a coherent, defensible case?" },
  { label:"Communication",  weight:20, desc:"Is the submission clear, rigorous, and accessible to a non-specialist judge? Scientific writing, visual design, and presentation are all considered." },
]

const TIMELINE = [
  { date:"April 2026",      label:"Registration & submission window opens",    done:true  },
  { date:"April 30, 2026",  label:"Submission deadline — 11:59 PM Eastern Time", done:false },
  { date:"May 1–7, 2026",   label:"Confidential judging period",               done:false },
  { date:"May 15, 2026",    label:"Winners announced — ELEVATE Honours published", done:false },
  { date:"Ongoing",         label:"Laureate recognition & mentorship sessions", done:false },
]

const FAQS = [
  { q:"Who is eligible to enter?",         a:"ELEVATE is open to any individual or team worldwide. Students, researchers, independent developers, educators, and professionals are all welcome. There are no age restrictions, institutional requirements, or geographic limitations." },
  { q:"Is there an entry fee?",             a:"No. ELEVATE is completely free to enter. The competition exists to recognise outstanding work, not to generate revenue." },
  { q:"What team size is permitted?",       a:"Individual entries and teams of up to four members are both accepted. All team members will be recognised equally in any awards or certifications." },
  { q:"Must my submission use hardware?",   a:"No. Software-only submissions, simulations, research papers, design specifications, and educational materials are all valid. The Engineering track benefits from hardware demonstration but does not require it." },
  { q:"Can I submit to multiple tracks?",   a:"Yes. Each track submission is evaluated independently by a separate panel. You may submit different work to multiple tracks; the same submission entered in more than one track will be disqualified." },
  { q:"How are submissions evaluated?",     a:"A panel of judges scores all submissions against the four published criteria using a standardised rubric. All entrants receive written feedback regardless of outcome. Judges' decisions are final and not subject to appeal." },
  { q:"When will I receive feedback?",      a:"All submitters receive written feedback no later than May 15, 2026 — the same date winners are announced. Feedback is provided whether or not you advance." },
  { q:"What format are submissions?",       a:"All submissions are accepted via the registration form below. You will be asked to provide links to hosted materials — GitHub repositories, Google Drive folders, YouTube videos, or published documents. Large files should not be attached directly." },
]

function Countdown() {
  const [time, setTime] = useState({ days:0, hours:0, mins:0, secs:0 })
  useEffect(() => {
    function tick() {
      const diff = DEADLINE - new Date()
      if (diff <= 0) { setTime({ days:0, hours:0, mins:0, secs:0 }); return }
      setTime({ days:Math.floor(diff/86400000), hours:Math.floor((diff%86400000)/3600000), mins:Math.floor((diff%3600000)/60000), secs:Math.floor((diff%60000)/1000) })
    }
    tick(); const t = setInterval(tick,1000); return ()=>clearInterval(t)
  },[])
  return (
    <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
      {[["days",time.days],["hours",time.hours],["minutes",time.mins],["seconds",time.secs]].map(([label,val])=>(
        <div key={label} style={{ textAlign:"center" }}>
          <div style={{ fontSize:52, fontWeight:800, color:"#F59E0B", letterSpacing:"-3px", lineHeight:1, fontVariantNumeric:"tabular-nums", textShadow:"0 0 40px rgba(245,158,11,0.4)" }}>
            {String(val).padStart(2,"0")}
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.15em", fontWeight:400, marginTop:6 }}>{label}</div>
        </div>
      ))}
    </div>
  )
}

// Embossed seal SVG
function Seal({ size=120 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120">
      <defs>
        <radialGradient id="sg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#F59E0B"/>
          <stop offset="100%" stopColor="#92400e"/>
        </radialGradient>
      </defs>
      {/* Outer ring with notches */}
      {Array.from({length:36}).map((_,i)=>(
        <rect key={i} x="57" y="4" width="6" height="12" rx="2" fill="rgba(245,158,11,0.5)"
          transform={`rotate(${i*10} 60 60)`}/>
      ))}
      <circle cx="60" cy="60" r="46" fill="none" stroke="#F59E0B" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="60" cy="60" r="40" fill="url(#sg)" opacity="0.15"/>
      <circle cx="60" cy="60" r="40" fill="none" stroke="#F59E0B" strokeWidth="1" opacity="0.8"/>
      <circle cx="60" cy="60" r="34" fill="none" stroke="rgba(245,158,11,0.4)" strokeWidth="0.5"/>
      {/* E letter */}
      <text x="60" y="68" textAnchor="middle" fill="#F59E0B" fontSize="28" fontWeight="800" fontFamily="Georgia, serif" opacity="0.9">E</text>
      {/* Text around ring */}
      <path id="arc-top" d="M 20 60 A 40 40 0 0 1 100 60" fill="none"/>
      <path id="arc-bot" d="M 20 60 A 40 40 0 0 0 100 60" fill="none"/>
      <text fontSize="6" fill="rgba(245,158,11,0.7)" letterSpacing="2" fontFamily="Georgia, serif">
        <textPath href="#arc-top" startOffset="10%">ELEVATE · MYOJAM · 2026</textPath>
      </text>
      <text fontSize="5.5" fill="rgba(245,158,11,0.5)" letterSpacing="1.5" fontFamily="Georgia, serif">
        <textPath href="#arc-bot" startOffset="8%">INTERNATIONAL COMPETITION</textPath>
      </text>
    </svg>
  )
}

export default function Elevate() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div style={{ minHeight:"100vh", background:"#050008", color:"white", overflow:"hidden" }}>
      <style>{`
        @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orbFloat { from{transform:translateY(0) scale(1)} to{transform:translateY(-30px) scale(1.05)} }
        @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes goldShimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes rotateSeal { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes faqOpen  { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        .gold-text {
          background: linear-gradient(135deg, #F59E0B 0%, #FDE68A 40%, #F59E0B 60%, #92400e 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: goldShimmer 4s linear infinite;
        }
        .elevate-section { background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .faq-item { border-bottom: 1px solid rgba(255,255,255,0.08); }
        .faq-item:last-child { border-bottom: none; }
      `}</style>

      <Navbar />

      {/* ── HERO */}
      <section style={{ position:"relative", minHeight:"100vh", display:"flex", alignItems:"center", overflow:"hidden" }}>
        {/* Atmospheric orbs */}
        {[
          ["600px","-150px","-100px",0,"rgba(245,158,11,0.12)"],
          ["450px","65%","100px",3,"rgba(255,45,120,0.1)"],
          ["350px","80%","350px",6,"rgba(139,92,246,0.1)"],
          ["300px","5%","50%",9,"rgba(245,158,11,0.06)"],
        ].map(([size,x,y,delay,color],i)=>(
          <div key={i} style={{ position:"absolute",width:size,height:size,borderRadius:"50%",background:color,left:x,top:y,filter:"blur(100px)",pointerEvents:"none",animation:`orbFloat 12s ${delay}s ease-in-out infinite alternate` }}/>
        ))}

        {/* Top fine line */}
        <div style={{ position:"absolute", top:80, left:"50%", transform:"translateX(-50%)", width:1, height:60, background:"linear-gradient(to bottom, transparent, rgba(245,158,11,0.5))" }}/>

        <div style={{ maxWidth:900, margin:"0 auto", padding:"160px 32px 120px", position:"relative", zIndex:1, width:"100%", textAlign:"center" }}>

          {/* Edition badge */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:100, padding:"8px 20px", fontSize:11, color:"rgba(245,158,11,0.85)", fontWeight:500, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:48, animation:"fadeUp 0.8s ease" }}>
            <span style={{ width:5,height:5,borderRadius:"50%",background:"#F59E0B",display:"inline-block",animation:"pulse 2s infinite" }}/>
            Inaugural Edition · 2026 · Presented by myojam
          </div>

          {/* Seal */}
          <div style={{ display:"flex", justifyContent:"center", marginBottom:32, animation:"fadeUp 0.8s 0.1s ease both" }}>
            <Seal size={100}/>
          </div>

          {/* Main title */}
          <div style={{ animation:"fadeUp 0.8s 0.15s ease both" }}>
            <div style={{ fontSize:"clamp(11px,1.5vw,13px)", fontWeight:400, color:"rgba(255,255,255,0.35)", letterSpacing:"0.4em", textTransform:"uppercase", marginBottom:16, fontFamily:"Georgia, serif" }}>
              The
            </div>
            <h1 className="gold-text" style={{ fontSize:"clamp(72px,14vw,148px)", fontWeight:900, letterSpacing:"-5px", lineHeight:0.9, marginBottom:8, fontFamily:"Georgia, serif" }}>
              ELEVATE
            </h1>
            <div style={{ fontSize:"clamp(10px,1.5vw,12px)", fontWeight:400, color:"rgba(255,255,255,0.3)", letterSpacing:"0.45em", textTransform:"uppercase", marginBottom:8, fontFamily:"Georgia, serif" }}>
              Award
            </div>
            <div style={{ width:200, height:1, background:"linear-gradient(to right, transparent, rgba(245,158,11,0.5), transparent)", margin:"20px auto" }}/>
            <div style={{ fontSize:"clamp(12px,1.8vw,15px)", color:"rgba(255,255,255,0.4)", letterSpacing:"0.25em", textTransform:"uppercase", fontWeight:300, fontFamily:"Georgia, serif" }}>
              Emerging Leaders in EMG · Ventures · Assistive Technology · Engineering
            </div>
          </div>

          {/* Tagline */}
          <p style={{ fontSize:"clamp(16px,2.5vw,20px)", color:"rgba(255,255,255,0.55)", fontWeight:300, lineHeight:1.75, maxWidth:620, margin:"48px auto 0", animation:"fadeUp 0.8s 0.25s ease both" }}>
            An international competition honouring outstanding contributions to EMG science, engineering, design, and education. Open to the world. Free to enter. Judged to the highest standard.
          </p>

          {/* Countdown */}
          <div style={{ marginTop:56, animation:"fadeUp 0.8s 0.3s ease both" }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:20, fontFamily:"Georgia, serif" }}>
              Submission deadline
            </div>
            <div style={{ display:"flex", justifyContent:"center" }}>
              <Countdown />
            </div>
            <div style={{ fontSize:13, color:"rgba(245,158,11,0.6)", fontWeight:300, marginTop:12 }}>
              April 30, 2026 · 11:59 PM Eastern Time
            </div>
          </div>

          {/* CTAs */}
          <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", marginTop:52, animation:"fadeUp 0.8s 0.35s ease both" }}>
            <a href="#register" style={{ background:"linear-gradient(135deg, #F59E0B 0%, #92400e 100%)", color:"#1a0a00", borderRadius:100, padding:"16px 44px", fontSize:15, fontWeight:700, textDecoration:"none", boxShadow:"0 8px 40px rgba(245,158,11,0.4), 0 0 0 1px rgba(245,158,11,0.3)", letterSpacing:"0.02em", transition:"transform 0.2s, box-shadow 0.2s", fontFamily:"Georgia, serif" }}
              onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.05)";e.currentTarget.style.boxShadow="0 12px 56px rgba(245,158,11,0.6), 0 0 0 1px rgba(245,158,11,0.5)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 8px 40px rgba(245,158,11,0.4), 0 0 0 1px rgba(245,158,11,0.3)"}}
            >Register — free to enter</a>
            <a href="#tracks" style={{ background:"rgba(255,255,255,0.04)", backdropFilter:"blur(12px)", color:"rgba(255,255,255,0.7)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:100, padding:"16px 36px", fontSize:15, fontWeight:300, textDecoration:"none", letterSpacing:"0.02em", transition:"border-color 0.2s, color 0.2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(245,158,11,0.3)";e.currentTarget.style.color="rgba(245,158,11,0.9)"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.12)";e.currentTarget.style.color="rgba(255,255,255,0.7)"}}
            >View tracks & prizes ↓</a>
          </div>

          {/* Bottom line */}
          <div style={{ marginTop:80, display:"flex", gap:0, justifyContent:"center" }}>
            {["4 Tracks","Open Internationally","Zero Entry Fee","Written Feedback for All"].map((item,i,arr)=>(
              <div key={item} style={{ padding:"0 24px", borderRight: i<arr.length-1?"1px solid rgba(255,255,255,0.1)":"none", fontSize:12, color:"rgba(255,255,255,0.3)", fontWeight:300, letterSpacing:"0.08em" }}>{item}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT */}
      <section style={{ padding:"100px 32px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth:840, margin:"0 auto" }}>
          <Reveal>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"center" }}>
              <div>
                <div style={{ fontSize:10, color:"rgba(245,158,11,0.6)", textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:24, fontFamily:"Georgia, serif" }}>About the competition</div>
                <h2 style={{ fontSize:"clamp(28px,4vw,42px)", fontWeight:600, letterSpacing:"-1px", color:"white", lineHeight:1.15, marginBottom:24 }}>
                  A global stage for the next generation.
                </h2>
                <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", fontWeight:300, lineHeight:1.85, marginBottom:16 }}>
                  ELEVATE exists on a simple premise: the most important advances in EMG-based assistive technology and education won't come only from well-funded institutions. They will come from curious, rigorous individuals — wherever they are — working on problems that matter.
                </p>
                <p style={{ fontSize:15, color:"rgba(255,255,255,0.5)", fontWeight:300, lineHeight:1.85 }}>
                  This competition exists to find that work, honour it formally, and give it an international platform it might not otherwise have.
                </p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:1, background:"rgba(255,255,255,0.06)", borderRadius:16, overflow:"hidden" }}>
                {[
                  ["Inaugural","First edition, 2026"],
                  ["4 tracks","Engineering, Research, Design, Education"],
                  ["Global","No geographic restrictions"],
                  ["Free","Zero cost to participate"],
                ].map(([val,label])=>(
                  <div key={val} style={{ padding:"28px 24px", background:"rgba(255,255,255,0.02)" }}>
                    <div style={{ fontSize:22, fontWeight:700, color:"#F59E0B", letterSpacing:"-0.5px", marginBottom:6 }}>{val}</div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.35)", fontWeight:300, lineHeight:1.5 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TRACKS */}
      <section id="tracks" style={{ padding:"100px 32px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:64 }}>
              <div style={{ fontSize:10, color:"rgba(245,158,11,0.6)", textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:16, fontFamily:"Georgia, serif" }}>Competition tracks</div>
              <h2 style={{ fontSize:"clamp(32px,5vw,52px)", fontWeight:700, color:"white", letterSpacing:"-1.5px", marginBottom:16, fontFamily:"Georgia, serif" }}>
                Four ways to compete.
              </h2>
              <p style={{ fontSize:15, color:"rgba(255,255,255,0.4)", fontWeight:300, maxWidth:480, margin:"0 auto" }}>
                Choose the track that best reflects your work. You may submit independently to multiple tracks.
              </p>
            </div>
          </Reveal>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2, background:"rgba(255,255,255,0.04)", borderRadius:20, overflow:"hidden" }}>
            {TRACKS.map((track,i)=>(
              <div key={track.num} style={{ padding:"40px 36px", background:"rgba(0,0,0,0.4)", borderBottom: i<2?"2px solid rgba(255,255,255,0.04)":"none", borderRight: i%2===0?"2px solid rgba(255,255,255,0.04)":"none", transition:"background 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.background=`rgba(${track.color==="#FF2D78"?"255,45,120":track.color==="#8B5CF6"?"139,92,246":track.color==="#3B82F6"?"59,130,246":"16,185,129"},0.06)`}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(0,0,0,0.4)"}
              >
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
                  <div style={{ width:40, height:40, borderRadius:"50%", border:`1px solid ${track.color}40`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700, color:track.color, fontFamily:"Georgia, serif" }}>{track.num}</div>
                  <div style={{ fontSize:10, fontWeight:500, color:track.color, textTransform:"uppercase", letterSpacing:"0.15em" }}>Track {track.num}</div>
                </div>
                <h3 style={{ fontSize:20, fontWeight:600, color:"white", letterSpacing:"-0.3px", marginBottom:12, lineHeight:1.3 }}>{track.title}</h3>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", fontWeight:300, lineHeight:1.8, marginBottom:24 }}>{track.desc}</p>
                <div style={{ borderTop:`1px solid ${track.color}20`, paddingTop:20 }}>
                  <div style={{ fontSize:9, fontWeight:600, color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"0.15em", marginBottom:12 }}>Required deliverables</div>
                  {track.deliverables.map(d=>(
                    <div key={d} style={{ display:"flex", gap:10, marginBottom:8, fontSize:12, color:"rgba(255,255,255,0.4)", fontWeight:300, lineHeight:1.6 }}>
                      <span style={{ color:track.color, fontWeight:600, flexShrink:0 }}>—</span>{d}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIZES */}
      <section style={{ padding:"100px 32px", borderTop:"1px solid rgba(255,255,255,0.06)", background:"linear-gradient(160deg, rgba(245,158,11,0.03) 0%, transparent 60%)" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:64 }}>
              <div style={{ fontSize:10, color:"rgba(245,158,11,0.6)", textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:16, fontFamily:"Georgia, serif" }}>Honours & recognition</div>
              <h2 style={{ fontSize:"clamp(32px,5vw,52px)", fontWeight:700, color:"white", letterSpacing:"-1.5px", fontFamily:"Georgia, serif" }}>
                What laureates receive.
              </h2>
            </div>
          </Reveal>

          {/* Grand Prix — full width, elevated */}
          <div style={{ background:"linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.03) 100%)", border:"1px solid rgba(245,158,11,0.25)", borderRadius:20, padding:"48px", marginBottom:24, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-40, right:-40, opacity:0.05 }}>
              <Seal size={240}/>
            </div>
            <div style={{ display:"flex", alignItems:"flex-start", gap:28, flexWrap:"wrap" }}>
              <div style={{ fontSize:48 }}>🏆</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:"rgba(245,158,11,0.6)", textTransform:"uppercase", letterSpacing:"0.2em", marginBottom:8, fontFamily:"Georgia, serif" }}>Grand Prix · Best overall submission</div>
                <div className="gold-text" style={{ fontSize:28, fontWeight:800, marginBottom:20, fontFamily:"Georgia, serif" }}>The ELEVATE Grand Prix Laureate</div>
                {PRIZES[0].awards.map(a=>(
                  <div key={a} style={{ display:"flex", gap:12, marginBottom:10, fontSize:14, color:"rgba(255,255,255,0.55)", fontWeight:300, lineHeight:1.65 }}>
                    <span style={{ color:"#F59E0B", flexShrink:0, marginTop:2 }}>→</span>{a}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Track prizes */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {PRIZES.slice(1).map(prize=>(
              <div key={prize.tier} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderTop:`2px solid ${prize.color}`, borderRadius:16, padding:"28px" }}>
                <div style={{ fontSize:28, marginBottom:12 }}>{prize.icon}</div>
                <div style={{ fontSize:14, fontWeight:600, color:prize.color, marginBottom:4 }}>{prize.tier}</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", fontWeight:300, marginBottom:20 }}>{prize.subtitle}</div>
                {prize.awards.map(a=>(
                  <div key={a} style={{ display:"flex", gap:8, marginBottom:8, fontSize:12, color:"rgba(255,255,255,0.4)", fontWeight:300, lineHeight:1.6 }}>
                    <span style={{ color:prize.color, flexShrink:0 }}>→</span>{a}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ marginTop:24, textAlign:"center", fontSize:12, color:"rgba(255,255,255,0.2)", fontWeight:300, fontStyle:"italic", fontFamily:"Georgia, serif" }}>
            Prizes are awarded per-track. One Grand Prix is awarded across all submissions. All prize recipients receive permanent recognition on the ELEVATE honours page.
          </div>
        </div>
      </section>

      {/* ── JUDGING */}
      <section style={{ padding:"100px 32px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <Reveal>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr", gap:64 }}>
              <div>
                <div style={{ fontSize:10, color:"rgba(245,158,11,0.6)", textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:16, fontFamily:"Georgia, serif" }}>Evaluation</div>
                <h2 style={{ fontSize:"clamp(24px,3.5vw,38px)", fontWeight:700, color:"white", letterSpacing:"-1px", lineHeight:1.2, marginBottom:20, fontFamily:"Georgia, serif" }}>
                  Judging criteria.
                </h2>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)", fontWeight:300, lineHeight:1.8 }}>
                  All submissions are evaluated by a panel using a standardised rubric. Each criterion is scored independently. Judges' decisions are final. All submitters receive written feedback.
                </p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                {CRITERIA.map(c=>(
                  <div key={c.label} style={{ display:"flex", gap:24, padding:"24px 28px", background:"rgba(255,255,255,0.02)", borderRadius:12, border:"1px solid rgba(255,255,255,0.06)", alignItems:"flex-start" }}>
                    <div style={{ textAlign:"center", flexShrink:0 }}>
                      <div className="gold-text" style={{ fontSize:22, fontWeight:800, fontFamily:"Georgia, serif" }}>{c.weight}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize:15, fontWeight:600, color:"white", marginBottom:6 }}>{c.label}</div>
                      <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", fontWeight:300, lineHeight:1.7, margin:0 }}>{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TIMELINE */}
      <section style={{ padding:"100px 32px", borderTop:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.01)" }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:64 }}>
              <div style={{ fontSize:10, color:"rgba(245,158,11,0.6)", textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:16, fontFamily:"Georgia, serif" }}>Key dates</div>
              <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:700, color:"white", letterSpacing:"-1.5px", fontFamily:"Georgia, serif" }}>Official timeline.</h2>
            </div>
          </Reveal>
          <div style={{ position:"relative" }}>
            <div style={{ position:"absolute", left:20, top:0, bottom:0, width:1, background:"linear-gradient(to bottom, #F59E0B, rgba(255,255,255,0.05))" }}/>
            {TIMELINE.map((item,i)=>(
              <div key={i} style={{ paddingLeft:56, paddingBottom:i<TIMELINE.length-1?36:0, position:"relative" }}>
                <div style={{ position:"absolute", left:10, top:2, width:20, height:20, borderRadius:"50%", background: item.done ? "#F59E0B" : "rgba(255,255,255,0.05)", border:`1px solid ${item.done ? "#F59E0B" : "rgba(255,255,255,0.15)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, color: item.done ? "#1a0a00" : "rgba(255,255,255,0.3)", fontWeight:700 }}>
                  {item.done ? "✓" : i+1}
                </div>
                <div style={{ fontSize:11, color: item.done ? "#F59E0B" : "rgba(255,255,255,0.3)", fontWeight:500, marginBottom:4, textTransform:"uppercase", letterSpacing:"0.08em" }}>{item.date}</div>
                <div style={{ fontSize:15, color: item.done ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.35)", fontWeight: item.done ? 500 : 300 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ */}
      <section style={{ padding:"100px 32px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <Reveal>
            <div style={{ textAlign:"center", marginBottom:64 }}>
              <div style={{ fontSize:10, color:"rgba(245,158,11,0.6)", textTransform:"uppercase", letterSpacing:"0.25em", marginBottom:16, fontFamily:"Georgia, serif" }}>Rules & eligibility</div>
              <h2 style={{ fontSize:"clamp(28px,4vw,44px)", fontWeight:700, color:"white", letterSpacing:"-1.5px", fontFamily:"Georgia, serif" }}>Frequently asked questions.</h2>
            </div>
          </Reveal>
          <div style={{ border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, overflow:"hidden" }}>
            {FAQS.map((faq,i)=>(
              <div key={i} className="faq-item">
                <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"22px 28px", background:"none", border:"none", cursor:"pointer", fontFamily:"var(--font)", textAlign:"left", gap:16 }}>
                  <span style={{ fontSize:14, fontWeight:400, color:"rgba(255,255,255,0.65)", lineHeight:1.5 }}>{faq.q}</span>
                  <span style={{ fontSize:20, color:"#F59E0B", fontWeight:300, flexShrink:0, transform:openFaq===i?"rotate(45deg)":"rotate(0)", transition:"transform 0.2s" }}>+</span>
                </button>
                {openFaq===i&&(
                  <div style={{ padding:"0 28px 22px", animation:"faqOpen 0.2s ease" }}>
                    <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", fontWeight:300, lineHeight:1.85, margin:0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REGISTRATION */}
      <section id="register" style={{ padding:"100px 32px", borderTop:"1px solid rgba(255,255,255,0.06)", background:"linear-gradient(160deg, rgba(245,158,11,0.04) 0%, transparent 50%)", position:"relative", overflow:"hidden" }}>
        {[["400px","-60px","-40px","rgba(245,158,11,0.12)"],["300px","70%","30px","rgba(255,45,120,0.08)"]].map(([size,x,y,color],i)=>(
          <div key={i} style={{ position:"absolute",width:size,height:size,borderRadius:"50%",background:color,left:x,top:y,filter:"blur(80px)",pointerEvents:"none" }}/>
        ))}
        <div style={{ maxWidth:680, margin:"0 auto", position:"relative", zIndex:1 }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <Seal size={72}/>
            <div style={{ fontSize:10, color:"rgba(245,158,11,0.5)", textTransform:"uppercase", letterSpacing:"0.25em", marginTop:20, marginBottom:16, fontFamily:"Georgia, serif" }}>Official registration</div>
            <h2 style={{ fontSize:"clamp(28px,5vw,48px)", fontWeight:700, color:"white", letterSpacing:"-1.5px", marginBottom:16, fontFamily:"Georgia, serif" }}>
              Enter ELEVATE 2026.
            </h2>
            <p style={{ fontSize:15, color:"rgba(255,255,255,0.4)", fontWeight:300, lineHeight:1.75, maxWidth:440, margin:"0 auto" }}>
              Registration is free and takes under five minutes. Submissions open April 15. Deadline April 30, 2026.
            </p>
          </div>

          <div style={{ background:"rgba(255,255,255,0.03)", backdropFilter:"blur(20px)", borderRadius:20, border:"1px solid rgba(245,158,11,0.15)", overflow:"hidden", padding:"0 24px" }}>
            <iframe
              src="https://tally.so/embed/ELEVATE_FORM_ID?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
              width="100%" height="520" frameBorder="0"
              title="ELEVATE registration"
              style={{ display:"block" }}
            />
          </div>

          <p style={{ fontSize:11, color:"rgba(255,255,255,0.2)", textAlign:"center", marginTop:20, fontWeight:300, fontFamily:"Georgia, serif", fontStyle:"italic" }}>
            By registering you agree to myojam's Terms of Service and the official ELEVATE competition rules. Personal information is used solely to administer this competition and will not be shared with third parties.
          </p>
        </div>
      </section>

      <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", background:"#050008" }}>
        <Footer />
      </div>
    </div>
  )
}