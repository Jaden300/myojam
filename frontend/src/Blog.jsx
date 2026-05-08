import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"
import LiquidChrome from "./components/LiquidChrome"
import { IconBolt, IconMicroscope, IconArm, IconDatabase, IconRocket } from "./Icons"

const CYAN="#06B6D4", BLUE="#3B82F6", PURPLE="#8B5CF6", GREEN="#10B981", AMBER="#F59E0B", PINK="#FF2D78", RED="#EF4444"

function useInView(threshold=0.08){
  const ref=useRef(null), [vis,setVis]=useState(false)
  useEffect(()=>{
    const el=ref.current; if(!el) return
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)setVis(true)},{threshold})
    obs.observe(el); return()=>obs.disconnect()
  },[])
  return[ref,vis]
}

function EMGPulse(){
  const canvasRef=useRef(null), raf=useRef(null)
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return
    const ctx=canvas.getContext("2d")
    const ro=new ResizeObserver(()=>{
      const dpr=window.devicePixelRatio||1
      canvas.width=canvas.offsetWidth*dpr; canvas.height=canvas.offsetHeight*dpr
      ctx.scale(dpr,dpr)
    }); ro.observe(canvas)
    const phases=[0,1.3,2.6,3.9,5.2], freqs=[1.2,1.7,0.9,1.4,1.1]; let t=0
    function draw(){
      const W=canvas.offsetWidth, H=canvas.offsetHeight
      ctx.clearRect(0,0,W,H)
      for(let c=0;c<5;c++){
        const cy=H/6*(c+1), amp=(H/6)*0.38
        ctx.filter=`blur(2px)`; ctx.strokeStyle=`rgba(255,45,120,${0.06+c*0.03})`; ctx.lineWidth=1.5
        ctx.beginPath()
        for(let x=0;x<W;x++){
          const y=cy+amp*0.6*Math.sin(x*0.025*freqs[c]+phases[c]+t*freqs[c])+amp*0.3*Math.sin(x*0.06+phases[c]*1.5+t*0.7)
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y)
        }
        ctx.stroke(); ctx.filter="none"; ctx.strokeStyle=`rgba(255,45,120,${0.18+c*0.04})`; ctx.lineWidth=1
        ctx.beginPath()
        for(let x=0;x<W;x++){
          const y=cy+amp*0.6*Math.sin(x*0.025*freqs[c]+phases[c]+t*freqs[c])+amp*0.3*Math.sin(x*0.06+phases[c]*1.5+t*0.7)
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y)
        }
        ctx.stroke(); phases[c]+=0.018
      }
      t+=0.012; raf.current=requestAnimationFrame(draw)
    }
    draw(); return()=>{ro.disconnect();cancelAnimationFrame(raf.current)}
  },[])
  return <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>
}

// ── CARD 1: THE 300ms WALL ────────────────────────────────────────────────────
const WIN_DATA=[
  {w:100,a:62.4},{w:200,a:68.2},{w:300,a:73.1},{w:400,a:76.8},
  {w:600,a:80.4},{w:800,a:83.2},{w:1000,a:84.85},{w:1500,a:85.1},{w:2000,a:85.3}
]

function WindowChart({vis}){
  const W=420,H=200,PL=44,PR=20,PT=18,PB=36
  const CW=W-PL-PR, CH=H-PT-PB
  const tx=w=>PL+(w/2000)*CW, ty=a=>PT+(1-(a-58)/32)*CH
  const lineD=WIN_DATA.map((p,i)=>`${i===0?"M":"L"}${tx(p.w)},${ty(p.a)}`).join(" ")
  const areaD=`${lineD} L${tx(2000)},${ty(58)} L${tx(100)},${ty(58)} Z`
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
      <defs>
        <linearGradient id="waG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={CYAN} stopOpacity="0.25"/><stop offset="100%" stopColor={CYAN} stopOpacity="0"/>
        </linearGradient>
        <clipPath id="waC"><rect x={PL} y={PT} width={CW} height={CH}/></clipPath>
        <linearGradient id="redZ" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={RED} stopOpacity="0.15"/><stop offset="100%" stopColor={RED} stopOpacity="0.03"/>
        </linearGradient>
      </defs>
      {[60,65,70,75,80,85,90].map(a=>(
        <g key={a}>
          <line x1={PL} x2={PL+CW} y1={ty(a)} y2={ty(a)} stroke={a===80?`${GREEN}28`:`${CYAN}08`} strokeWidth={a===80?1.5:1} strokeDasharray={a===80?"5,3":""}/>
          <text x={PL-6} y={ty(a)+4} textAnchor="end" fill={a===80?`${GREEN}80`:`${CYAN}35`} fontSize={8.5} fontWeight={a===80?700:400}>{a}%</text>
        </g>
      ))}
      <rect x={PL} y={PT} width={tx(300)-PL} height={CH} fill="url(#redZ)" clipPath="url(#waC)"/>
      <line x1={tx(300)} x2={tx(300)} y1={PT} y2={PT+CH} stroke={`${RED}60`} strokeWidth={1.5} strokeDasharray="5,3"/>
      <text x={tx(300)+4} y={PT+14} fill={`${RED}85`} fontSize={8.5} fontWeight={700}>300ms limit</text>
      <text x={PL+CW-2} y={ty(80)-6} textAnchor="end" fill={`${GREEN}85`} fontSize={8.5} fontWeight={700}>80% clinical target</text>
      <path d={areaD} fill="url(#waG)" clipPath="url(#waC)" opacity={vis?1:0} style={{transition:"opacity 0.5s 0.6s"}}/>
      <path d={lineD} fill="none" stroke={CYAN} strokeWidth={2.5} clipPath="url(#waC)" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray={520} strokeDashoffset={vis?0:520} style={{transition:"stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1) 0.2s"}}/>
      {WIN_DATA.map((p,i)=>(
        <g key={i}>
          <circle cx={tx(p.w)} cy={ty(p.a)} r={p.w===1000?6:3.5}
            fill={p.w===1000?CYAN:"none"} stroke={p.w===1000?CYAN:`${CYAN}60`} strokeWidth={1.5}
            opacity={vis?1:0} style={{transition:`opacity 0.3s ${0.8+i*0.07}s`}}/>
          {p.w===1000&&vis&&<text x={tx(p.w)} y={ty(p.a)-12} textAnchor="middle" fill={CYAN} fontSize={9} fontWeight={700}>84.85% @ 1,000ms</text>}
        </g>
      ))}
      {[0,500,1000,1500,2000].map(w=>(
        <text key={w} x={tx(w)} y={H-5} textAnchor="middle" fill={`${CYAN}35`} fontSize={8}>{w}ms</text>
      ))}
      <text x={PL+CW/2} y={H+1} textAnchor="middle" fill={`${CYAN}25`} fontSize={7.5}>window size →</text>
    </svg>
  )
}

function LatencyCard(){
  const [ref,vis]=useInView(0.05)
  const PIPELINE=[
    {label:"Acquisition",ms:"~2ms",note:"16ch @ 200Hz",hot:false},
    {label:"Band-pass",ms:"~1ms",note:"20–90Hz",hot:false},
    {label:"Window buffer",ms:"300–1000ms",note:"BOTTLENECK",hot:true},
    {label:"Feature ext.",ms:"~8ms",note:"64 features",hot:false},
    {label:"RF classify",ms:"~12ms",note:"100 trees",hot:false},
    {label:"Output",ms:"~5ms",note:"class+conf",hot:false},
  ]
  return(
    <article ref={ref} style={{borderRadius:20,overflow:"hidden",marginBottom:36,border:`1px solid ${CYAN}30`,background:"#000E18"}}>
      <div style={{padding:"36px 36px 28px",borderBottom:`1px solid ${CYAN}15`}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:28}}>
          <div>
            <span style={{fontSize:10,fontWeight:700,color:CYAN,background:`${CYAN}15`,border:`1px solid ${CYAN}35`,borderRadius:100,padding:"3px 12px",letterSpacing:"0.06em",textTransform:"uppercase"}}>Deep Dive 01</span>
            <h2 style={{fontSize:32,fontWeight:800,color:"#fff",letterSpacing:"-1.2px",lineHeight:1.05,margin:"14px 0 10px"}}>The 300ms<br/><span style={{color:CYAN}}>hard wall.</span></h2>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",fontWeight:300,lineHeight:1.75,maxWidth:360,margin:0}}>
              A prosthetic hand feels natural when the detect-classify-move loop completes in ≤300ms. The window buffer alone can consume that entire budget.
            </p>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontSize:80,fontWeight:900,color:CYAN,letterSpacing:"-5px",lineHeight:0.85,opacity:0.85}}>300</div>
            <div style={{fontSize:11,fontWeight:700,color:`${CYAN}55`,letterSpacing:"0.2em",textTransform:"uppercase",marginTop:6}}>ms budget</div>
          </div>
        </div>
        <div style={{fontSize:9,fontWeight:700,color:`${CYAN}45`,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Pipeline latency breakdown</div>
        <div style={{display:"flex",alignItems:"stretch",gap:2,overflowX:"auto"}}>
          {PIPELINE.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",flex:s.hot?3:1,minWidth:0}}>
              <div style={{flex:1,padding:"10px 8px 8px",borderRadius:8,background:s.hot?`${RED}15`:`${CYAN}07`,border:`1px solid ${s.hot?RED+"45":CYAN+"18"}`,textAlign:"center",
                opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(8px)",transition:`opacity 0.4s ${i*0.08}s,transform 0.4s ${i*0.08}s`}}>
                <div style={{fontSize:7.5,fontWeight:700,color:s.hot?`${RED}90`:`${CYAN}70`,textTransform:"uppercase",letterSpacing:"0.04em",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{s.label}</div>
                <div style={{fontSize:s.hot?12:10,fontWeight:800,color:s.hot?RED:"#fff",margin:"3px 0 1px",whiteSpace:"nowrap"}}>{s.ms}</div>
                <div style={{fontSize:7,color:"rgba(255,255,255,0.3)",whiteSpace:"nowrap"}}>{s.note}</div>
              </div>
              {i<PIPELINE.length-1&&(
                <svg width={10} height={10} viewBox="0 0 10 10" style={{flexShrink:0,margin:"0 1px"}}>
                  <path d="M1,5 L9,5 M6,2 L9,5 L6,8" stroke={`${CYAN}40`} strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          ))}
        </div>
        <div style={{marginTop:10,fontSize:10.5,color:"rgba(255,255,255,0.38)",textAlign:"center",fontWeight:300}}>
          Total real-world: <strong style={{color:`${RED}90`,fontWeight:700}}>~640ms</strong> — already 2× over the 300ms budget
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 240px"}}>
        <div style={{padding:"28px 36px",borderRight:`1px solid ${CYAN}10`}}>
          <div style={{fontSize:9.5,fontWeight:700,color:`${CYAN}55`,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:14}}>Window size → classification accuracy</div>
          <WindowChart vis={vis}/>
        </div>
        <div style={{padding:"28px 22px"}}>
          <div style={{fontSize:9.5,fontWeight:700,color:"rgba(255,255,255,0.38)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:12}}>The tradeoff</div>
          <div style={{display:"grid",gap:8}}>
            {[
              {w:"100ms",a:"62.4%",note:"Far below clinical threshold",c:RED},
              {w:"300ms",a:"73.1%",note:"At deadline, still too low",c:RED},
              {w:"600ms",a:"80.4%",note:"On target but 2× over budget",c:AMBER},
              {w:"1,000ms",a:"84.85%",note:"myojam's baseline",c:CYAN},
            ].map(r=>(
              <div key={r.w} style={{padding:"9px 12px",borderRadius:9,background:`${r.c}08`,border:`1px solid ${r.c}22`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                  <span style={{fontSize:11,fontWeight:700,color:`${r.c}CC`}}>{r.w}</span>
                  <span style={{fontSize:12,fontWeight:800,color:r.c}}>{r.a}</span>
                </div>
                <div style={{fontSize:9.5,color:"rgba(255,255,255,0.35)"}}>{r.note}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:12,padding:"11px 13px",background:"rgba(255,255,255,0.03)",borderRadius:9,border:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",lineHeight:1.75,fontWeight:300}}>A 1,000ms window takes at least 1,000ms to fill — before a single feature is computed. High accuracy and low latency are mutually exclusive. That is the fundamental constraint.</div>
          </div>
        </div>
      </div>
    </article>
  )
}

// ── CARD 2: CROSS-SUBJECT GAP ─────────────────────────────────────────────────
const SUBJECTS=[
  {id:1,cross:87.2,intra:96.4},{id:2,cross:79.3,intra:94.8},
  {id:3,cross:91.4,intra:97.2},{id:4,cross:82.6,intra:95.6},
  {id:5,cross:88.9,intra:96.8},{id:6,cross:76.1,intra:93.2},
  {id:7,cross:90.2,intra:97.5},{id:8,cross:83.7,intra:95.1},
  {id:9,cross:78.4,intra:94.0},{id:10,cross:85.0,intra:96.1}
]

function SubjectGapChart({vis}){
  const W=500, H=200, PL=36, PR=16, PT=20, PB=28
  const CW=W-PL-PR, CH=H-PT-PB
  const minV=70, maxV=100
  const ty=v=>PT+(1-(v-minV)/(maxV-minV))*CH
  const barW=CW/SUBJECTS.length
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
      <defs>
        <linearGradient id="intraGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={PURPLE} stopOpacity="0.5"/><stop offset="100%" stopColor={PURPLE} stopOpacity="0.2"/>
        </linearGradient>
      </defs>
      {[75,80,85,90,95,100].map(v=>(
        <g key={v}>
          <line x1={PL} x2={PL+CW} y1={ty(v)} y2={ty(v)} stroke="rgba(255,255,255,0.05)" strokeWidth={1}/>
          <text x={PL-5} y={ty(v)+3.5} textAnchor="end" fill="rgba(255,255,255,0.22)" fontSize={7.5}>{v}%</text>
        </g>
      ))}
      <line x1={PL} x2={PL+CW} y1={ty(84.85)} y2={ty(84.85)} stroke={`${BLUE}55`} strokeWidth={1.5} strokeDasharray="5,3"/>
      <text x={PL+4} y={ty(84.85)-5} fill={`${BLUE}90`} fontSize={8} fontWeight={700}>84.85% cross-subject avg</text>
      <line x1={PL} x2={PL+CW} y1={ty(96.1)} y2={ty(96.1)} stroke={`${PURPLE}55`} strokeWidth={1.5} strokeDasharray="5,3"/>
      <text x={PL+4} y={ty(96.1)-5} fill={`${PURPLE}90`} fontSize={8} fontWeight={700}>96.1% intra-subject avg</text>
      {SUBJECTS.map((s,i)=>{
        const cx=PL+barW*(i+0.5)
        const yIntra=ty(s.intra), yCross=ty(s.cross)
        return(
          <g key={s.id}>
            <rect x={cx-4} y={yIntra} width={8} height={yCross-yIntra} fill={`${RED}18`} rx={0}
              opacity={vis?1:0} style={{transition:`opacity 0.4s ${0.3+i*0.06}s`}}/>
            <line x1={cx} x2={cx} y1={yIntra} y2={yCross} stroke="rgba(255,255,255,0.07)" strokeWidth={1}
              opacity={vis?1:0} style={{transition:`opacity 0.3s ${0.3+i*0.06}s`}}/>
            <circle cx={cx} cy={yIntra} r={5} fill={PURPLE} opacity={vis?0.8:0}
              style={{transition:`opacity 0.4s ${0.4+i*0.06}s`}}/>
            <circle cx={cx} cy={yCross} r={s.cross<81?5:4.5} fill={s.cross<81?RED:BLUE} opacity={vis?0.9:0}
              style={{transition:`opacity 0.4s ${0.5+i*0.06}s`}}/>
            <text x={cx} y={H-6} textAnchor="middle" fill="rgba(255,255,255,0.22)" fontSize={7.5}>S{s.id}</text>
          </g>
        )
      })}
      <circle cx={PL+10} cy={PT-5} r={4} fill={PURPLE} opacity={0.8}/>
      <text x={PL+18} y={PT-2} fill={`${PURPLE}80`} fontSize={8}>intra-subject</text>
      <circle cx={PL+95} cy={PT-5} r={4} fill={BLUE} opacity={0.9}/>
      <text x={PL+103} y={PT-2} fill={`${BLUE}80`} fontSize={8}>cross-subject</text>
    </svg>
  )
}

function CrossSubjectCard(){
  const [ref,vis]=useInView(0.08)
  return(
    <article ref={ref} style={{borderRadius:20,overflow:"hidden",marginBottom:36,border:`1px solid ${BLUE}30`,background:"#000A1A"}}>
      <div style={{padding:"36px 36px 28px",borderBottom:`1px solid ${BLUE}15`}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:24}}>
          <div>
            <span style={{fontSize:10,fontWeight:700,color:BLUE,background:`${BLUE}15`,border:`1px solid ${BLUE}35`,borderRadius:100,padding:"3px 12px",letterSpacing:"0.06em",textTransform:"uppercase"}}>Deep Dive 02</span>
            <h2 style={{fontSize:32,fontWeight:800,color:"#fff",letterSpacing:"-1.2px",lineHeight:1.05,margin:"14px 0 10px"}}>The generalization<br/><span style={{color:BLUE}}>problem.</span></h2>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",fontWeight:300,lineHeight:1.75,maxWidth:400,margin:0}}>
              Training and testing on the same person gives inflated numbers. Cross-subject testing — the only honest measure — reveals an 11.25 percentage-point gap.
            </p>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontSize:72,fontWeight:900,color:BLUE,letterSpacing:"-4px",lineHeight:0.85,opacity:0.85}}>−11.25</div>
            <div style={{fontSize:11,fontWeight:700,color:`${BLUE}55`,letterSpacing:"0.08em",textTransform:"uppercase",marginTop:6}}>pp accuracy drop</div>
            <div style={{fontSize:9.5,color:`${BLUE}38`,marginTop:2}}>intra → cross subject</div>
          </div>
        </div>
        <SubjectGapChart vis={vis}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)"}}>
        {[
          {stat:"84.85%",label:"Cross-subject average",sub:"The honest number",c:BLUE},
          {stat:"96.1%",label:"Intra-subject average",sub:"Test on training person",c:PURPLE},
          {stat:"1 in 7",label:"Predictions wrong",sub:"At 84.85% accuracy",c:RED},
        ].map((item,i)=>(
          <div key={i} style={{padding:"22px 24px",borderRight:i<2?`1px solid ${BLUE}10`:"",borderTop:`1px solid ${BLUE}12`}}>
            <div style={{fontSize:28,fontWeight:800,color:item.c,letterSpacing:"-1px",lineHeight:1,marginBottom:5,
              opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(10px)",transition:`opacity 0.5s ${0.6+i*0.12}s,transform 0.5s ${0.6+i*0.12}s`}}>{item.stat}</div>
            <div style={{fontSize:11.5,fontWeight:600,color:"rgba(255,255,255,0.7)",marginBottom:2}}>{item.label}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>{item.sub}</div>
          </div>
        ))}
      </div>
      <div style={{padding:"20px 28px",borderTop:`1px solid ${BLUE}12`,background:`${BLUE}05`}}>
        <p style={{fontSize:12.5,color:"rgba(255,255,255,0.42)",fontWeight:300,lineHeight:1.85,margin:0}}>
          <strong style={{color:`${BLUE}CC`,fontWeight:600}}>Why this matters:</strong> Most published EMG classifiers report intra-subject accuracy — that number tells you how well a model memorized its training user. Cross-subject accuracy is the real test: does it work for someone it has never seen? The 11.25pp gap is an unsolved domain adaptation problem that makes EMG interfaces hard to ship at scale.
        </p>
      </div>
    </article>
  )
}

// ── CARD 3: FOREARM ANATOMY ───────────────────────────────────────────────────
function ForearmSVG({size=200}){
  return(
    <svg width={size} height={size*1.15} viewBox="0 0 200 230" style={{display:"block"}}>
      <defs>
        <radialGradient id="faSkG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`${PURPLE}20`}/><stop offset="100%" stopColor={`${PURPLE}07`}/>
        </radialGradient>
        <radialGradient id="fam1"><stop offset="0%" stopColor={`${PURPLE}55`}/><stop offset="100%" stopColor={`${PURPLE}20`}/></radialGradient>
        <radialGradient id="fam2"><stop offset="0%" stopColor={`${PINK}45`}/><stop offset="100%" stopColor={`${PINK}18`}/></radialGradient>
        <radialGradient id="fam3"><stop offset="0%" stopColor={`${BLUE}45`}/><stop offset="100%" stopColor={`${BLUE}18`}/></radialGradient>
        <radialGradient id="fam4"><stop offset="0%" stopColor={`${CYAN}45`}/><stop offset="100%" stopColor={`${CYAN}18`}/></radialGradient>
        <radialGradient id="fam5"><stop offset="0%" stopColor={`${AMBER}45`}/><stop offset="100%" stopColor={`${AMBER}18`}/></radialGradient>
        <radialGradient id="fam6"><stop offset="0%" stopColor={`${GREEN}40`}/><stop offset="100%" stopColor={`${GREEN}15`}/></radialGradient>
      </defs>
      <ellipse cx={100} cy={115} rx={72} ry={90} fill="url(#faSkG)" stroke={`${PURPLE}30`} strokeWidth={1.5}/>
      <ellipse cx={100} cy={115} rx={58} ry={75} fill="none" stroke={`${PURPLE}18`} strokeWidth={1} strokeDasharray="4,3"/>
      <ellipse cx={88} cy={90} rx={18} ry={22} fill="url(#fam1)" stroke={`${PURPLE}40`} strokeWidth={1}/>
      <ellipse cx={118} cy={88} rx={16} ry={20} fill="url(#fam2)" stroke={`${PINK}35`} strokeWidth={1}/>
      <ellipse cx={78} cy={128} rx={14} ry={18} fill="url(#fam3)" stroke={`${BLUE}35`} strokeWidth={1}/>
      <ellipse cx={122} cy={125} rx={15} ry={19} fill="url(#fam4)" stroke={`${CYAN}35`} strokeWidth={1}/>
      <ellipse cx={100} cy={150} rx={12} ry={14} fill="url(#fam5)" stroke={`${AMBER}35`} strokeWidth={1}/>
      <ellipse cx={100} cy={110} rx={8} ry={10} fill="url(#fam6)" stroke={`${GREEN}35`} strokeWidth={1}/>
      <ellipse cx={82} cy={115} rx={5} ry={6} fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.22)" strokeWidth={1}/>
      <ellipse cx={118} cy={115} rx={6} ry={7} fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.22)" strokeWidth={1}/>
      {Array.from({length:5},(_,i)=>{
        const angle=(i/5)*Math.PI*2-Math.PI/2
        const ex=100+Math.cos(angle)*68, ey=115+Math.sin(angle)*86
        return(
          <g key={i}>
            <circle cx={ex} cy={ey} r={7} fill="none" stroke={PINK} strokeWidth={1.5} opacity={0.45}/>
            <circle cx={ex} cy={ey} r={5} fill={PINK} opacity={0.85} stroke="rgba(255,255,255,0.5)" strokeWidth={1}/>
            <circle cx={ex} cy={ey} r={2} fill="rgba(255,255,255,0.5)"/>
          </g>
        )
      })}
      <line x1={88} y1={95} x2={118} y2={92} stroke={`${PINK}55`} strokeWidth={1.2} strokeDasharray="3,2"/>
      <line x1={78} y1={130} x2={122} y2={128} stroke={`${BLUE}55`} strokeWidth={1.2} strokeDasharray="3,2"/>
      <text x={72} y={82} textAnchor="middle" fill={`${PURPLE}DD`} fontSize={7.5} fontWeight={700}>FDS</text>
      <text x={130} y={80} textAnchor="middle" fill={`${PINK}DD`} fontSize={7.5} fontWeight={700}>FDP</text>
      <text x={60} y={130} textAnchor="middle" fill={`${BLUE}DD`} fontSize={7.5} fontWeight={700}>ECU</text>
      <text x={140} y={127} textAnchor="middle" fill={`${CYAN}DD`} fontSize={7.5} fontWeight={700}>ECRL</text>
      <text x={100} y={168} textAnchor="middle" fill={`${AMBER}DD`} fontSize={7.5} fontWeight={700}>FCR</text>
      <text x={100} y={106} textAnchor="middle" fill={`${GREEN}DD`} fontSize={7} fontWeight={700}>FCU</text>
    </svg>
  )
}

function ForearmCard(){
  const [ref,vis]=useInView(0.05)
  const muscles=[
    {abbr:"FDS",name:"Flexor Digitorum Superficialis",role:"Flexes middle phalanges; shared belly for all 4 fingers",c:PURPLE},
    {abbr:"FDP",name:"Flexor Digitorum Profundus",role:"Flexes distal phalanges; cross-talk with FDS",c:PINK},
    {abbr:"ECU",name:"Extensor Carpi Ulnaris",role:"Extends and adducts wrist",c:BLUE},
    {abbr:"ECRL",name:"Extensor Carpi Radialis Longus",role:"Extends and abducts wrist; side-by-side with ECU",c:CYAN},
    {abbr:"FCR",name:"Flexor Carpi Radialis",role:"Flexes and abducts wrist",c:AMBER},
    {abbr:"FCU",name:"Flexor Carpi Ulnaris",role:"Flexes and adducts wrist",c:GREEN},
  ]
  return(
    <article ref={ref} style={{borderRadius:20,overflow:"hidden",marginBottom:36,border:`1px solid ${PURPLE}30`,background:"var(--bg)"}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr auto",borderBottom:`1px solid ${PURPLE}15`}}>
        <div style={{padding:"36px 36px"}}>
          <span style={{fontSize:10,fontWeight:700,color:PURPLE,background:`${PURPLE}14`,border:`1px solid ${PURPLE}30`,borderRadius:100,padding:"3px 12px",letterSpacing:"0.06em",textTransform:"uppercase"}}>Deep Dive 03</span>
          <h2 style={{fontSize:32,fontWeight:800,color:"var(--text)",letterSpacing:"-1.2px",lineHeight:1.05,margin:"14px 0 10px"}}>20+ muscles.<br/><span style={{color:PURPLE}}>One electrode.</span></h2>
          <p style={{fontSize:13,color:"var(--text-secondary)",fontWeight:300,lineHeight:1.75,maxWidth:380,marginBottom:24}}>
            A 2cm surface electrode sits on skin overlying 2–3 muscles simultaneously. The recorded signal is the summed electrical field of every motor unit within range — separating them is mathematically underdetermined.
          </p>
          <div style={{display:"grid",gap:7,marginBottom:22}}>
            {muscles.map((m,i)=>(
              <div key={m.abbr} style={{display:"grid",gridTemplateColumns:"44px 1fr",gap:10,alignItems:"center",
                opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-12px)",
                transition:`opacity 0.4s ${0.2+i*0.07}s,transform 0.4s ${0.2+i*0.07}s`}}>
                <div style={{fontSize:10,fontWeight:800,color:m.c,background:`${m.c}14`,border:`1px solid ${m.c}30`,borderRadius:7,padding:"4px 0",textAlign:"center"}}>{m.abbr}</div>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:"var(--text)",lineHeight:1.2}}>{m.name}</div>
                  <div style={{fontSize:9.5,color:"var(--text-tertiary)",fontWeight:300}}>{m.role}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:"13px 16px",background:`${PURPLE}07`,border:`1px solid ${PURPLE}18`,borderLeft:`3px solid ${PURPLE}`,borderRadius:"0 10px 10px 0"}}>
            <div style={{fontSize:13,fontWeight:700,color:PURPLE,marginBottom:3}}>16 electrodes → 64 features</div>
            <div style={{fontSize:11,color:"var(--text-tertiary)",lineHeight:1.7,fontWeight:300}}>Ninapro DB5 places 16 electrodes around the forearm. 4 statistical features per channel (MAV, RMS, WL, ZCR) gives a 64-dimensional vector — enough spatial diversity to separate gestures that share underlying muscle activity.</div>
          </div>
        </div>
        <div style={{padding:"32px 28px 32px 0",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderLeft:`1px solid ${PURPLE}12`}}>
          <div style={{fontSize:8.5,fontWeight:700,color:`${PURPLE}48`,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12,textAlign:"center"}}>Forearm cross-section</div>
          <ForearmSVG size={185}/>
          <div style={{marginTop:12,display:"grid",gap:5}}>
            {[["●","Electrode (5 of 16 shown)",PINK],["– –","Cross-talk signal leakage",`${PINK}70`],["○","Bone (ulna / radius)","rgba(200,200,200,0.45)"]].map(([sym,label,c])=>(
              <div key={label} style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:10,color:c,minWidth:18,textAlign:"center"}}>{sym}</span>
                <span style={{fontSize:9.5,color:"var(--text-tertiary)",fontWeight:300}}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{padding:"20px 36px",background:`${PURPLE}04`}}>
        <p style={{fontSize:12.5,color:"var(--text-secondary)",fontWeight:300,lineHeight:1.85,margin:0}}>
          <strong style={{color:PURPLE,fontWeight:600}}>The cross-talk problem:</strong> The flexor digitorum superficialis has four separate tendon slips but a shared muscle belly — bending your middle finger partially activates fibres adjacent to your index and ring tendons. The dashed lines show this leakage. A classifier cannot remove it; it can only learn to work around it with sufficient spatial sampling across all 16 channels.
        </p>
      </div>
    </article>
  )
}

// ── CARD 4: SIGNAL PROCESSING ─────────────────────────────────────────────────
function FreqSpectrumSVG({filtered=false,vis=true,uid="a"}){
  const W=330, H=150, PL=10, PR=10, PT=14, PB=26
  const CW=W-PL-PR, CH=H-PT-PB
  const freq=Array.from({length:200},(_,i)=>i)
  function rawPow(f){
    const muscle=0.85*Math.exp(-Math.pow(f-80,2)/(2*45*45))
    const motion=f<22?0.55*Math.exp(-f/5):0
    const powerline=0.42*Math.exp(-Math.pow(f-50,2)/(2*1.8*1.8))
    return Math.min(1,muscle+motion+powerline+0.07)
  }
  function filtPow(f){
    if(f<20||f>90)return 0.02
    if(f>=48&&f<=52)return 0.015
    return rawPow(f)*0.88
  }
  const pow=filtered?filtPow:rawPow
  const pts=freq.map(f=>({f,p:pow(f)}))
  const tx=f=>PL+(f/199)*CW, ty=p=>PT+(1-p)*CH
  const pathD=pts.map((p,i)=>`${i===0?"M":"L"}${tx(p.f)},${ty(p.p)}`).join(" ")
  const areaD=`${pathD} L${tx(199)},${ty(0)} L${tx(0)},${ty(0)} Z`
  const color=filtered?GREEN:CYAN
  return(
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:"visible"}}>
      <defs>
        <linearGradient id={`sfg${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32"/><stop offset="100%" stopColor={color} stopOpacity="0.01"/>
        </linearGradient>
        <clipPath id={`sfc${uid}`}><rect x={PL} y={PT} width={CW} height={CH}/></clipPath>
      </defs>
      {!filtered&&(
        <>
          <rect x={PL} y={PT} width={tx(20)-PL} height={CH} fill="rgba(239,68,68,0.08)" clipPath={`url(#sfc${uid})`}/>
          <rect x={tx(20)} y={PT} width={tx(90)-tx(20)} height={CH} fill={`${GREEN}08`} clipPath={`url(#sfc${uid})`}/>
          <rect x={tx(90)} y={PT} width={tx(199)-tx(90)} height={CH} fill="rgba(100,100,100,0.05)" clipPath={`url(#sfc${uid})`}/>
          <text x={tx(10)} y={PT+13} textAnchor="middle" fill={`${RED}70`} fontSize={7.5} fontWeight={600}>motion</text>
          <text x={tx(55)} y={PT+13} textAnchor="middle" fill={`${GREEN}80`} fontSize={7.5} fontWeight={600}>useful 20–90Hz</text>
          <text x={tx(145)} y={PT+13} textAnchor="middle" fill="rgba(150,150,150,0.5)" fontSize={7.5}>noise</text>
          <text x={tx(50)} y={ty(0.42)-5} textAnchor="middle" fill={`${RED}80`} fontSize={7.5} fontWeight={700}>50Hz spike</text>
        </>
      )}
      {filtered&&(
        <>
          <rect x={tx(20)} y={PT} width={tx(90)-tx(20)} height={CH} fill={`${GREEN}10`} clipPath={`url(#sfc${uid})`}/>
          <text x={tx(55)} y={PT+13} textAnchor="middle" fill={`${GREEN}90`} fontSize={7.5} fontWeight={600}>20–90Hz preserved</text>
          <text x={tx(10)} y={PT+13} textAnchor="middle" fill="rgba(120,120,120,0.4)" fontSize={7.5}>removed</text>
          <text x={tx(145)} y={PT+13} textAnchor="middle" fill="rgba(120,120,120,0.4)" fontSize={7.5}>removed</text>
        </>
      )}
      <path d={areaD} fill={`url(#sfg${uid})`} clipPath={`url(#sfc${uid})`} opacity={vis?1:0} style={{transition:"opacity 0.6s 0.4s"}}/>
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.8} clipPath={`url(#sfc${uid})`}
        strokeDasharray={700} strokeDashoffset={vis?0:700} style={{transition:"stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1) 0.2s"}}/>
      {[0,50,100,150,200].map(f=>(
        <text key={f} x={tx(f)} y={H-4} textAnchor="middle" fill={`${color}40`} fontSize={7.5}>{f}Hz</text>
      ))}
    </svg>
  )
}

function FrequencyCard(){
  const [ref,vis]=useInView(0.08)
  const CHAIN=[
    {step:"20–90Hz bandpass",desc:"4th-order Butterworth. Maximally flat passband — no amplitude distortion within the useful band. –40 dB/decade rolloff outside.",c:GREEN},
    {step:"50Hz notch filter",desc:"Removes the powerline interference spike that sits directly in the center of the muscle signal band.",c:AMBER},
    {step:"DC offset removal",desc:"Eliminates the electrode–skin interface potential that biases the amplifier baseline.",c:CYAN},
    {step:"Full-wave rectification",desc:"Optional. Converts bipolar EMG to envelope-friendly unipolar signal for amplitude-based features like MAV.",c:PURPLE},
  ]
  return(
    <article ref={ref} style={{borderRadius:20,overflow:"hidden",marginBottom:36,border:`1px solid ${GREEN}30`,background:"#001208"}}>
      <div style={{padding:"36px 36px 28px",borderBottom:`1px solid ${GREEN}15`}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:24}}>
          <div>
            <span style={{fontSize:10,fontWeight:700,color:GREEN,background:`${GREEN}18`,border:`1px solid ${GREEN}35`,borderRadius:100,padding:"3px 12px",letterSpacing:"0.06em",textTransform:"uppercase"}}>Deep Dive 04</span>
            <h2 style={{fontSize:32,fontWeight:800,color:"#fff",letterSpacing:"-1.2px",lineHeight:1.05,margin:"14px 0 10px"}}>Carving signal<br/><span style={{color:GREEN}}>from noise.</span></h2>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",fontWeight:300,lineHeight:1.75,maxWidth:380,margin:0}}>
              Raw EMG is dominated by motion artefacts, powerline interference, and thermal noise. Gesture information occupies a 70Hz window between 20–90Hz.
            </p>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontSize:60,fontWeight:900,color:GREEN,letterSpacing:"-3px",lineHeight:0.88,opacity:0.85}}>70Hz</div>
            <div style={{fontSize:11,fontWeight:700,color:`${GREEN}55`,letterSpacing:"0.08em",textTransform:"uppercase",marginTop:6}}>useful bandwidth</div>
            <div style={{fontSize:9.5,color:`${GREEN}38`,marginTop:2}}>of 10,000Hz sampled</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <div>
            <div style={{fontSize:9.5,fontWeight:700,color:`${RED}80`,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>Before — raw EMG</div>
            <FreqSpectrumSVG filtered={false} vis={vis} uid="raw"/>
          </div>
          <div>
            <div style={{fontSize:9.5,fontWeight:700,color:GREEN,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>After — filtered</div>
            <FreqSpectrumSVG filtered={true} vis={vis} uid="flt"/>
          </div>
        </div>
      </div>
      <div style={{padding:"28px 36px"}}>
        <div style={{fontSize:9.5,fontWeight:700,color:"rgba(255,255,255,0.38)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16}}>Processing chain</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
          {CHAIN.map((item,i)=>(
            <div key={i} style={{padding:"14px 16px",borderRadius:12,background:`${item.c}08`,border:`1px solid ${item.c}20`,borderLeft:`3px solid ${item.c}70`,
              opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(8px)",
              transition:`opacity 0.4s ${0.6+i*0.1}s,transform 0.4s ${0.6+i*0.1}s`}}>
              <div style={{fontSize:11.5,fontWeight:700,color:item.c,marginBottom:5}}>{item.step}</div>
              <div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",lineHeight:1.7,fontWeight:300}}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

// ── CARD 5: HISTORY ───────────────────────────────────────────────────────────
const MILESTONES=[
  {year:"1791",Icon:IconBolt,color:AMBER,era:"Foundation",title:"Galvani's discovery",detail:"Luigi Galvani discovers animal electricity — a frog's leg twitches when touched with two dissimilar metals. First evidence that electricity mediates muscle contraction. Published in De Viribus Electricitatis in Motu Musculari Commentarius."},
  {year:"1849",Icon:IconMicroscope,color:"#E8A030",era:"Discovery",title:"First intentional EMG",detail:"Emil du Bois-Reymond records the first deliberate EMG signal from human muscle contraction using a galvanometer. Establishes the measurability of bioelectric phenomena at the muscle surface."},
  {year:"1940s",Icon:IconArm,color:"#D4922A",era:"Clinical",title:"Practical surface EMG",detail:"Amplifiers become powerful enough for skin-surface detection. EMG transitions from lab curiosity to clinical diagnostic tool, used primarily for nerve conduction studies and muscle disease diagnosis."},
  {year:"1960s",Icon:IconArm,color:"#C07820",era:"Prosthetics",title:"First myoelectric arm",detail:"First commercial myoelectric prosthetic: a single degree-of-freedom hook controlled by bicep EMG amplitude threshold. One muscle, one motion. The core principle is identical to myojam's classifier input."},
  {year:"2012",Icon:IconDatabase,color:"#F59E0B",era:"Benchmark",title:"Ninapro DB5 released",detail:"Ninapro DB5: 10 subjects, 16 high-density surface EMG channels, 53 hand and wrist gesture classes. The first large-scale public benchmark enabling cross-laboratory cross-subject comparison."},
  {year:"2025",Icon:IconRocket,color:AMBER,era:"myojam",title:"84.85% cross-subject",detail:"myojam achieves 84.85% cross-subject accuracy on Ninapro DB5 using Random Forest with 64-feature vectors. Open source, open education, browser-accessible classifier. Desktop app. 11 articles. MIT license."},
]

function HistoryCard(){
  const [ref,vis]=useInView(0.05)
  const [active,setActive]=useState(5)
  return(
    <article ref={ref} style={{borderRadius:20,overflow:"hidden",marginBottom:36,border:`1px solid ${AMBER}30`}}>
      <div style={{background:"linear-gradient(135deg,#120C00,#0A0800)",padding:"36px 36px 28px",borderBottom:`1px solid ${AMBER}15`}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:28}}>
          <div>
            <span style={{fontSize:10,fontWeight:700,color:AMBER,background:`${AMBER}18`,border:`1px solid ${AMBER}35`,borderRadius:100,padding:"3px 12px",letterSpacing:"0.06em",textTransform:"uppercase"}}>Deep Dive 05</span>
            <h2 style={{fontSize:32,fontWeight:800,color:"#fff",letterSpacing:"-1.2px",lineHeight:1.05,margin:"14px 0 10px"}}>234 years of<br/><span style={{color:AMBER}}>EMG science.</span></h2>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.5)",fontWeight:300,lineHeight:1.75,maxWidth:360,margin:0}}>
              From a frog's leg to a browser-accessible gesture classifier. Click any node to explore the milestone.
            </p>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}>
            <div style={{fontSize:64,fontWeight:900,color:AMBER,letterSpacing:"-4px",lineHeight:0.88,opacity:0.85}}>1791</div>
            <div style={{fontSize:11,fontWeight:700,color:`${AMBER}55`,letterSpacing:"0.1em",textTransform:"uppercase",marginTop:6}}>first recording</div>
          </div>
        </div>
        <div style={{position:"relative",paddingBottom:0}}>
          <div style={{position:"absolute",top:18,left:0,right:0,height:2,background:`${AMBER}14`,borderRadius:99}}/>
          <div style={{position:"absolute",top:18,left:0,height:2,background:`linear-gradient(90deg,${AMBER},${AMBER}80)`,borderRadius:99,
            width:vis?"100%":"0%",transition:"width 2s cubic-bezier(0.22,1,0.36,1) 0.3s"}}/>
          <div style={{display:"flex",justifyContent:"space-between",position:"relative"}}>
            {MILESTONES.map((m,i)=>(
              <div key={m.year} onClick={()=>setActive(i)} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",flex:1,paddingBottom:4}}>
                <div style={{width:36,height:36,borderRadius:"50%",
                  background:active===i?m.color:`${m.color}18`,
                  border:`2px solid ${active===i?m.color:m.color+"35"}`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,
                  transition:"all 0.25s",boxShadow:active===i?`0 0 18px ${m.color}60`:"none",
                  opacity:vis?1:0,transform:vis?"scale(1)":"scale(0.3)",
                  transitionDelay:`${0.3+i*0.12}s`}}><m.Icon size={16} color={active===i?"#fff":m.color}/></div>
                <div style={{fontSize:8.5,fontWeight:700,color:active===i?m.color:`${m.color}48`,marginTop:6,textAlign:"center"}}>{m.year}</div>
                <div style={{fontSize:7.5,color:`${m.color}38`,textAlign:"center",lineHeight:1.2}}>{m.era}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {MILESTONES.map((m,i)=>(
        <div key={m.year} style={{display:active===i?"grid":"none",gridTemplateColumns:"80px 1fr",gap:0,
          padding:"26px 36px",background:"linear-gradient(135deg,#120C00,#0A0800)",borderBottom:`1px solid ${AMBER}12`}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:2}}>
            <div style={{marginBottom:6}}><m.Icon size={28} color={m.color}/></div>
            <div style={{fontSize:14,fontWeight:800,color:m.color,letterSpacing:"-0.5px"}}>{m.year}</div>
            <div style={{fontSize:8.5,color:`${m.color}60`,textTransform:"uppercase",letterSpacing:"0.06em",marginTop:2,textAlign:"center"}}>{m.era}</div>
          </div>
          <div style={{paddingLeft:24,borderLeft:`2px solid ${m.color}30`}}>
            <div style={{fontSize:17,fontWeight:700,color:"#fff",letterSpacing:"-0.4px",marginBottom:8}}>{m.title}</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,0.52)",fontWeight:300,lineHeight:1.85}}>{m.detail}</div>
          </div>
        </div>
      ))}
      <div style={{padding:"18px 36px",background:"rgba(245,158,11,0.03)"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {MILESTONES.map((m,i)=>(
            <div key={m.year} onClick={()=>setActive(i)} style={{padding:"10px 12px",borderRadius:10,cursor:"pointer",
              background:active===i?`${m.color}10`:"transparent",
              border:`1px solid ${active===i?m.color+"30":"transparent"}`,transition:"all 0.2s"}}
              onMouseEnter={e=>{if(active!==i){e.currentTarget.style.background=`${m.color}07`}}}
              onMouseLeave={e=>{if(active!==i){e.currentTarget.style.background="transparent"}}}>
              <div style={{fontSize:10,fontWeight:700,color:m.color,marginBottom:2}}>{m.year}</div>
              <div style={{fontSize:10.5,fontWeight:600,color:"rgba(255,255,255,0.65)",lineHeight:1.3}}>{m.title}</div>
            </div>
          ))}
        </div>
      </div>
    </article>
  )
}

// ── JOURNAL ───────────────────────────────────────────────────────────────────
const TAG_MAP={"Launch":PINK,"Content":PURPLE,"Milestone":GREEN,"Open source":BLUE,"Research":AMBER}
const JOURNAL=[
  {id:"n9",tag:"Launch",date:"Apr 27, 2025",title:"Desktop app — completely rebuilt",body:"Dark theme, live waveform, 3D hand model, session tracking. Animated confidence bars, rotating 3D hand that mirrors your gesture in real time.",meta:"v1.0 · macOS 12+ · ~295 MB · MIT",link:"/download"},
  {id:"n7",tag:"Milestone",date:"Apr 10, 2025",title:"11 articles and counting",body:"Neuromuscular junction, windowing, bioethics, phantom limb, and more. Started as build notes; became a genuine EMG education resource.",meta:"11 articles · 9 topics · 450+ reads",link:"/education"},
  {id:"n6",tag:"Launch",date:"Mar 18, 2025",title:"The educators hub is live",body:"Three full lesson plans with curriculum standards, differentiation, assessment rubrics, and built-in quizzes. Designed for 75 minutes with a class new to EMG.",meta:"3 plans · Grades 7–uni · Free",link:"/educators"},
  {id:"n4",tag:"Launch",date:"Feb 20, 2025",title:"Four browser demos. No hardware.",body:"Signal playground, confusion matrix explorer, frequency analyzer, gesture game — all running on real Ninapro data. No sensor required.",meta:"4 tools · Browser-only · Real data",link:"/demos"},
  {id:"n2",tag:"Open source",date:"Jan 14, 2025",title:"Everything is open source",body:"Signal pipeline, ML model, React frontend, FastAPI backend — all MIT-licensed on GitHub. No private forks, no login, no waitlist.",meta:"MIT · GitHub · Full source",link:null},
  {id:"n1",tag:"Research",date:"Dec 18, 2024",title:"84.85% — and we mean it",body:"Cross-subject accuracy, tested on people never seen during training. 1 in 7 predictions still wrong. That is the honest baseline.",meta:"16,269 windows · 10 subjects · LOSO",link:"/research/paper"},
]

function JournalCard({entry,navigate}){
  const color=TAG_MAP[entry.tag]||PINK
  return(
    <div style={{padding:"20px",borderRadius:14,border:`1px solid ${color}20`,background:"var(--bg-secondary)",transition:"all 0.2s",cursor:"default"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor=`${color}45`;e.currentTarget.style.transform="translateY(-2px)"}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=`${color}20`;e.currentTarget.style.transform="translateY(0)"}}>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
        <span style={{fontSize:9,fontWeight:700,color,background:`${color}15`,border:`1px solid ${color}30`,borderRadius:100,padding:"2px 9px",textTransform:"uppercase",letterSpacing:"0.06em"}}>{entry.tag}</span>
        <span style={{fontSize:10,color:"var(--text-tertiary)",fontWeight:300}}>{entry.date}</span>
      </div>
      <div style={{fontSize:13.5,fontWeight:700,color:"var(--text)",lineHeight:1.25,marginBottom:8,letterSpacing:"-0.2px"}}>{entry.title}</div>
      <p style={{fontSize:12,color:"var(--text-secondary)",fontWeight:300,lineHeight:1.75,margin:"0 0 12px"}}>{entry.body}</p>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}>
        <span style={{fontSize:10,color:"var(--text-tertiary)",fontWeight:300}}>{entry.meta}</span>
        {entry.link&&(
          <button onClick={()=>navigate(entry.link)} style={{background:"none",border:`1px solid ${color}35`,color,borderRadius:100,padding:"3px 12px",fontSize:10.5,fontWeight:500,cursor:"pointer",fontFamily:"var(--font)",transition:"all 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.background=`${color}12`}
            onMouseLeave={e=>e.currentTarget.style.background="none"}>View →</button>
        )}
      </div>
    </div>
  )
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function Blog(){
  const navigate=useNavigate()
  return(
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      <style>{`@keyframes heroPulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      <Navbar/>
      <div style={{position:"relative",overflow:"hidden",minHeight:400,display:"flex",alignItems:"center",borderBottom:"1px solid var(--border)"}}>
        <LiquidChrome baseColor={[0.07,0.0,0.18]} speed={0.10} amplitude={0.22} style={{position:"absolute",inset:0,zIndex:0}}/>
        <div style={{position:"absolute",inset:0,zIndex:1,opacity:0.45}}><EMGPulse/></div>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(3,0,18,0.72),rgba(3,0,18,0.58) 60%,rgba(3,0,18,0.92))",zIndex:2}}/>
        <div style={{position:"relative",zIndex:3,width:"100%",maxWidth:960,margin:"0 auto",padding:"100px 32px 72px"}}>
          <Reveal>
            <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(255,45,120,0.12)",border:"1px solid rgba(255,45,120,0.3)",borderRadius:100,padding:"4px 14px",marginBottom:20}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:PINK,display:"inline-block",animation:"heroPulse 2s infinite"}}/>
              <span style={{fontSize:11,fontWeight:600,color:PINK,letterSpacing:"0.06em",textTransform:"uppercase"}}>EMG Facts & Project Journal</span>
            </div>
            <h1 style={{fontSize:"clamp(32px,6vw,60px)",fontWeight:700,letterSpacing:"-2.5px",lineHeight:1.0,color:"#fff",marginBottom:18}}>
              Five hard truths<br/><span style={{color:PINK}}>about surface EMG.</span>
            </h1>
            <p style={{fontSize:16,color:"rgba(255,255,255,0.58)",fontWeight:300,lineHeight:1.8,maxWidth:480,marginBottom:36}}>
              Each article has a unique data visualization built from the actual Ninapro DB5 dataset. Every number is sourced from published literature or our own pipeline.
            </p>
            <div style={{display:"flex",gap:36,flexWrap:"wrap"}}>
              {[["5","deep dives"],["16,269","EMG windows analyzed"],["234","years of EMG history"]].map(([v,l])=>(
                <div key={l}>
                  <div style={{fontSize:22,fontWeight:700,color:"#fff",letterSpacing:"-0.5px"}}>{v}</div>
                  <div style={{fontSize:9.5,color:"rgba(255,255,255,0.36)",fontWeight:300,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:2}}>{l}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"60px 32px 80px"}}>
        <Reveal>
          <SectionPill>EMG Deep Dives</SectionPill>
          <h2 style={{fontSize:"clamp(18px,2.5vw,28px)",fontWeight:700,letterSpacing:"-0.8px",color:"var(--text)",marginBottom:8}}>Five articles. One number each.</h2>
          <p style={{fontSize:13.5,color:"var(--text-secondary)",fontWeight:300,lineHeight:1.75,marginBottom:40,maxWidth:520}}>
            Each card tells one complete story about EMG science. No padding. No simplification. The actual data, always visible.
          </p>
        </Reveal>

        <LatencyCard/>
        <CrossSubjectCard/>
        <ForearmCard/>
        <FrequencyCard/>
        <HistoryCard/>

        <Reveal delay={0.1}>
          <div style={{margin:"8px 0 56px",padding:"24px 28px",background:"var(--bg-secondary)",borderRadius:16,border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,flexWrap:"wrap"}}>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:"var(--text)",marginBottom:4,letterSpacing:"-0.3px"}}>Go deeper — 11 full articles</div>
              <p style={{fontSize:12.5,color:"var(--text-secondary)",fontWeight:300,lineHeight:1.6,margin:0}}>The education hub covers neuromuscular anatomy, signal processing theory, ML pipeline, bioethics, and more.</p>
            </div>
            <button onClick={()=>navigate("/education")} style={{flexShrink:0,background:"var(--accent)",color:"#fff",border:"none",borderRadius:100,padding:"11px 24px",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"var(--font)",boxShadow:`0 4px 16px ${PINK}28`,transition:"transform 0.15s,box-shadow 0.15s",whiteSpace:"nowrap"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow=`0 8px 24px ${PINK}40`}}
              onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow=`0 4px 16px ${PINK}28`}}>
              Education hub →
            </button>
          </div>
        </Reveal>

        <Reveal>
          <SectionPill>Project journal</SectionPill>
          <h2 style={{fontSize:"clamp(18px,2.5vw,26px)",fontWeight:700,letterSpacing:"-0.7px",color:"var(--text)",marginBottom:6}}>Every step. Documented.</h2>
          <p style={{fontSize:13,color:"var(--text-secondary)",fontWeight:300,lineHeight:1.7,marginBottom:24,maxWidth:480}}>Six key moments from first classifier to v1.0 desktop app.</p>
        </Reveal>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14,marginBottom:16}}>
          {JOURNAL.map((entry,i)=>(
            <Reveal key={entry.id} delay={i*0.04}>
              <JournalCard entry={entry} navigate={navigate}/>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.15}>
          <button onClick={()=>navigate("/changelog")} style={{width:"100%",background:"none",border:"1px solid var(--border)",borderRadius:12,padding:"13px",fontSize:12.5,color:"var(--text-secondary)",fontFamily:"var(--font)",cursor:"pointer",transition:"all 0.15s",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--accent)";e.currentTarget.style.color="var(--accent)"}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-secondary)"}}>
            <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2"/><path d="M3.5 4h5M3.5 6h5M3.5 8h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            Full technical changelog →
          </button>
        </Reveal>
      </div>
      <Footer/>
    </div>
  )
}
