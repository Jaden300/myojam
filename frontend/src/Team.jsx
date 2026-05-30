import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"
import NeuralNoise from "./components/NeuralNoise"
import { IconMapleLeaf, IconMicroscope, IconBook, IconHandshake, IconGlobe, IconBrain, IconCode, IconGraduate, IconPeople, IconRocket } from "./Icons"

// ── Timeline
const MILESTONES = [
  {
    date: "Early 2024",
    color: "#FF2D78",
    title: "The question.",
    body: "Why does EMG gesture recognition work in a lab and fall apart on a real person's arm? Cross-subject generalization isn't a minor gap - it's the entire problem. We decided to build around it instead of ignoring it.",
  },
  {
    date: "Mid 2024",
    color: "#8B5CF6",
    title: "Hardware meets data.",
    body: "MyoWare 2.0 sensors, Arduino Uno, 200 Hz sampling. 16 channels of surface EMG. Then the Ninapro DB5 - 10 real subjects, 6 gesture classes, publicly available. Finally: a dataset honest enough to train on.",
  },
  {
    date: "Late 2024",
    color: "#3B82F6",
    title: "84.85%.",
    body: "Leave-one-subject-out cross-validation. Random Forest, 500 trees, Hudgins feature set. Not perfect - but real. The model had never seen the test subject. That's the only number we trust.",
  },
  {
    date: "2025",
    color: "#10B981",
    title: "Open source everything.",
    body: "MIT license. Model weights, training code, web app, education layer - all public. If the mission is accessibility, locking the tools behind a paywall defeats the mission. Simple as that.",
  },
]

// ── Values
const VALUES = [
  {
    color: "#FF2D78",
    icon: IconHandshake,
    title: "Accessibility is the product.",
    body: "Not a feature, not a polish pass, not a checkbox. Every design decision starts with: does this work for someone who genuinely needs it? That's not a constraint on what we build - it's the reason we build at all.",
  },
  {
    color: "#3B82F6",
    icon: IconGlobe,
    title: "Open, or it didn't happen.",
    body: "The model weights, the training pipeline, the web app, the lesson plans - all of it is public. Research that can't be replicated isn't research. Tools that help people shouldn't be walled off from the people they're meant to help.",
  },
  {
    color: "#8B5CF6",
    icon: IconBrain,
    title: "Honesty about what works.",
    body: "We report LOSO accuracy, not cherry-picked single-subject results. We publish the subjects where the model underperforms (S06: 76.1%) alongside the ones where it excels. The bar is the truth, not the headline.",
  },
]

// ── Collaboration areas
const COLLABORATE = [
  { icon: IconCode,      color: "#FF2D78", area: "Hardware & firmware",   detail: "Better sensors, lower cost, wireless EMG. Democratization is a hardware problem as much as a software one." },
  { icon: IconMicroscope,color: "#8B5CF6", area: "ML research",           detail: "Cross-subject generalization, adaptive calibration, real-time domain adaptation. The hardest problems are still open." },
  { icon: IconGraduate,  color: "#3B82F6", area: "Education & curriculum",detail: "Lesson plans, classroom tools, curriculum integration. MyoCode needs teachers to stress-test it." },
  { icon: IconPeople,    color: "#10B981", area: "Clinical partnerships",  detail: "Rehabilitation clinics, occupational therapists, assistive technology specialists. The people closest to the need." },
]

export default function Team() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", overflowX:"clip" }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
      `}</style>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────── */}
      <div style={{ position:"relative", overflow:"hidden", borderBottom:"1px solid var(--border)", padding:"120px 32px 90px", textAlign:"center" }}>
        <NeuralNoise color={[0.49, 0.23, 0.93]} opacity={0.85} speed={0.0006} />
        <div style={{ position:"absolute", inset:0, background:"rgba(3,0,18,0.68)", zIndex:1 }}/>
        <div style={{ position:"relative", zIndex:2, maxWidth:680, margin:"0 auto" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.07)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,45,120,0.3)", borderRadius:100, padding:"5px 16px", fontSize:12, color:"rgba(255,255,255,0.8)", fontWeight:500, marginBottom:28, animation:"fadeUp 0.5s ease both" }}>
            <IconMapleLeaf size={13} color="var(--accent)" />
            Toronto, Canada
          </div>
          <h1 style={{ fontSize:"clamp(40px,6vw,68px)", fontWeight:700, letterSpacing:"-2.5px", lineHeight:1.04, color:"#fff", marginBottom:22, animation:"fadeUp 0.55s 0.07s ease both" }}>
            One stubborn idea.
          </h1>
          <p style={{ fontSize:18, color:"rgba(255,255,255,0.66)", fontWeight:300, lineHeight:1.78, margin:"0 0 40px", animation:"fadeUp 0.55s 0.14s ease both" }}>
            A small team building open-source assistive technology - because gesture-based computing should belong to everyone, not just people with lab access.
          </p>

          {/* Stats */}
          <div style={{ display:"flex", justifyContent:"center", gap:48, animation:"fadeUp 0.55s 0.2s ease both" }}>
            {[
              ["2024", "founded"],
              ["MIT", "license"],
              ["100%", "open source"],
            ].map(([n,l])=>(
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontSize:26, fontWeight:700, color:"#fff", letterSpacing:"-1px", lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.38)", fontWeight:300, marginTop:5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Origin story ──────────────────────────────── */}
      <section style={{ padding:"96px 32px" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:72, alignItems:"start" }}>

            <Reveal>
              <SectionPill>Why we exist</SectionPill>
              <h2 style={{ fontSize:"clamp(26px,3.5vw,38px)", fontWeight:600, letterSpacing:"-1.2px", color:"var(--text)", lineHeight:1.15, marginBottom:28 }}>
                The lab problem nobody talks about.
              </h2>
              <p style={{ fontSize:16, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.88, marginBottom:18 }}>
                Most EMG gesture recognition research reports accuracy on data from the same subjects used to train the model. That's a controlled environment number, not a real-world number. The moment a new person puts on the electrodes - different skin, different muscle geometry, different fatigue state - the model often falls apart.
              </p>
              <p style={{ fontSize:16, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.88, marginBottom:18 }}>
                myojam started as a direct answer to that problem. We used leave-one-subject-out validation from the start, trained on Ninapro DB5 because it has real subjects and real variability, and published the number we actually got - 84.85% - not the number we got by picking the best subject as the test set.
              </p>
              <p style={{ fontSize:16, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.88, margin:0 }}>
                The MIT license came later, but the logic was the same: if the goal is accessibility, the tools need to be accessible. Anyone can download the model, fork the repo, and build on it today. That's not generosity - that's the design.
              </p>
            </Reveal>

            <Reveal>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {[
                  { icon:IconMapleLeaf, label:"Based in",      value:"Toronto, Ontario" },
                  { icon:IconMicroscope,label:"Hardware",      value:"MyoWare 2.0 · Arduino Uno R3" },
                  { icon:IconBook,      label:"Dataset",       value:"Ninapro DB5 · 10 subjects" },
                  { icon:IconBrain,     label:"Classifier",    value:"Random Forest · 500 trees" },
                  { icon:IconRocket,    label:"Accuracy",      value:"84.85% LOSO cross-subject" },
                  { icon:IconCode,      label:"Stack",         value:"Python · PyQt6 · scikit-learn" },
                ].map(({ icon:Icon, label, value })=>(
                  <div key={label} style={{ display:"flex", alignItems:"center", gap:16, background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 18px" }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:"var(--accent-soft)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Icon size={16} color="var(--accent)"/>
                    </div>
                    <div>
                      <div style={{ fontSize:10, fontWeight:600, color:"var(--text-tertiary)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:2 }}>{label}</div>
                      <div style={{ fontSize:14, fontWeight:500, color:"var(--text)" }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ── Timeline ──────────────────────────────────── */}
      <section style={{ background:"var(--bg-secondary)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", padding:"96px 32px" }}>
        <div style={{ maxWidth:820, margin:"0 auto" }}>
          <Reveal>
            <SectionPill>The journey</SectionPill>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,38px)", fontWeight:600, letterSpacing:"-1.2px", color:"var(--text)", marginBottom:56 }}>
              How we got here.
            </h2>
          </Reveal>

          <div style={{ position:"relative" }}>
            {/* Vertical line */}
            <div style={{ position:"absolute", left:19, top:12, bottom:12, width:2, background:"var(--border)", borderRadius:100 }}/>

            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {MILESTONES.map((m, i) => (
                <Reveal key={m.date}>
                  <div style={{ display:"flex", gap:28, paddingBottom: i < MILESTONES.length-1 ? 44 : 0 }}>
                    {/* Dot */}
                    <div style={{ flexShrink:0, width:40, display:"flex", flexDirection:"column", alignItems:"center" }}>
                      <div style={{ width:16, height:16, borderRadius:"50%", background:m.color, border:"3px solid var(--bg-secondary)", boxShadow:`0 0 0 2px ${m.color}40`, marginTop:4, flexShrink:0, zIndex:1 }}/>
                    </div>
                    {/* Content */}
                    <div style={{ paddingTop:0 }}>
                      <div style={{ fontSize:11, fontWeight:700, color:m.color, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>{m.date}</div>
                      <div style={{ fontSize:18, fontWeight:600, color:"var(--text)", letterSpacing:"-0.4px", marginBottom:10 }}>{m.title}</div>
                      <p style={{ fontSize:14, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.78, margin:0 }}>{m.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────── */}
      <section style={{ padding:"96px 32px" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <Reveal>
            <SectionPill>What we believe</SectionPill>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,38px)", fontWeight:600, letterSpacing:"-1.2px", color:"var(--text)", marginBottom:10 }}>
              Not slogans. Decisions we've already made.
            </h2>
            <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.75, maxWidth:520, marginBottom:44 }}>
              Every value on this page has a concrete consequence - something we built or didn't build, shipped or didn't ship, because of it.
            </p>
          </Reveal>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
            {VALUES.map(v=>(
              <Reveal key={v.title}>
                <div style={{ background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:16, padding:"28px 24px", height:"100%", display:"flex", flexDirection:"column" }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:v.color+"18", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:18, flexShrink:0 }}>
                    <v.icon size={19} color={v.color}/>
                  </div>
                  <div style={{ fontSize:15, fontWeight:600, color:"var(--text)", letterSpacing:"-0.3px", marginBottom:12, lineHeight:1.3 }}>{v.title}</div>
                  <p style={{ fontSize:13, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.78, margin:0, flex:1 }}>{v.body}</p>
                  <div style={{ width:28, height:3, background:v.color, borderRadius:100, marginTop:20, opacity:0.7 }}/>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Collaborate ───────────────────────────────── */}
      <section style={{ background:"var(--bg-secondary)", borderTop:"1px solid var(--border)", borderBottom:"1px solid var(--border)", padding:"96px 32px" }}>
        <div style={{ maxWidth:920, margin:"0 auto" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:64, alignItems:"start" }}>

            <Reveal>
              <SectionPill>Get involved</SectionPill>
              <h2 style={{ fontSize:"clamp(26px,3.5vw,38px)", fontWeight:600, letterSpacing:"-1.2px", color:"var(--text)", lineHeight:1.15, marginBottom:20 }}>
                We don't have job listings. We have GitHub issues.
              </h2>
              <p style={{ fontSize:15, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.8, marginBottom:28 }}>
                myojam is MIT-licensed and genuinely open to contribution. Whether you're a researcher, teacher, hardware hacker, or someone who just uses assistive technology and has opinions - there's a place for you here.
              </p>
              <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                <a
                  href="https://github.com"
                  target="_blank" rel="noopener noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:8, background:"var(--accent)", color:"#fff", borderRadius:100, padding:"11px 24px", fontSize:14, fontWeight:500, textDecoration:"none", boxShadow:"0 4px 16px rgba(255,45,120,0.3)", transition:"transform 0.15s, box-shadow 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.03)";e.currentTarget.style.boxShadow="0 8px 24px rgba(255,45,120,0.4)"}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 16px rgba(255,45,120,0.3)"}}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
                  View on GitHub
                </a>
                <span
                  onClick={()=>navigate("/contact")}
                  style={{ display:"inline-flex", alignItems:"center", gap:8, background:"none", color:"var(--text-secondary)", borderRadius:100, padding:"11px 24px", fontSize:14, fontWeight:500, cursor:"pointer", border:"1px solid var(--border)", transition:"border-color 0.15s, color 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(255,45,120,0.3)";e.currentTarget.style.color="var(--accent)"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.color="var(--text-secondary)"}}
                >
                  Get in touch
                </span>
              </div>
            </Reveal>

            <Reveal>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {COLLABORATE.map(c=>(
                  <div key={c.area} style={{ display:"flex", gap:16, background:"var(--bg)", border:"1px solid var(--border)", borderRadius:12, padding:"18px 20px", alignItems:"flex-start" }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:c.color+"16", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                      <c.icon size={15} color={c.color}/>
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:4 }}>{c.area}</div>
                      <p style={{ fontSize:12, color:"var(--text-secondary)", fontWeight:300, lineHeight:1.65, margin:0 }}>{c.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ── Closing quote ─────────────────────────────── */}
      <section style={{ padding:"96px 32px" }}>
        <div style={{ maxWidth:640, margin:"0 auto", textAlign:"center" }}>
          <Reveal>
            <div style={{ fontSize:13, fontWeight:600, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:20 }}>Our north star</div>
            <blockquote style={{ fontSize:"clamp(18px,2.5vw,24px)", fontWeight:400, color:"var(--text)", lineHeight:1.78, letterSpacing:"-0.4px", margin:"0 0 24px", fontStyle:"normal" }}>
              "The next person who needs gesture control shouldn't have to be a researcher to use it. And the next researcher who needs a baseline shouldn't have to build one from scratch."
            </blockquote>
            <p style={{ fontSize:13, color:"var(--text-tertiary)", fontWeight:300 }}>
              Toronto · MIT License · Ninapro DB5 · Open source
            </p>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}
