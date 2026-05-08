import { useNavigate, useLocation } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import Logo from "./Logo"
import { t } from "./i18n"
import { IconBook, IconGraduate, IconBulb, IconPeople, IconRocket, IconBuilding, IconCode, IconShield, IconPencil, IconBolt, IconMicroscope, IconNote, IconLink } from "./Icons"
import SearchModal from "./components/SearchModal"

function Dropdown({ label, items, pathname }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useRef(null)
  const active = items.some(([, path]) => pathname === path)
  const timerRef = useRef(null)

  function handleMouseEnter() {
    clearTimeout(timerRef.current)
    setOpen(true)
  }

  function handleMouseLeave() {
    timerRef.current = setTimeout(() => setOpen(false), 120)
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div ref={ref} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} style={{ position:"relative" }}>
      <button style={{
        background:"none", border:"none", cursor:"pointer",
        fontFamily:"var(--font)", fontSize:14, fontWeight:400, padding:0,
        color: active||open ? "var(--accent)" : "var(--text-secondary)",
        display:"flex", alignItems:"center", gap:4, transition:"color 0.15s"
      }}>
        {label}
        <span style={{
          fontSize:9,
          opacity:0.5,
          transform:open?"rotate(180deg)":"rotate(0deg)",
          transition:"transform 0.2s"
        }}>▾</span>
      </button>

      <div style={{
        position:"absolute",
        top:"calc(100% + 10px)",
        left:"50%",
        background:"rgba(255,255,255,0.97)",
        backdropFilter:"blur(20px)",
        border:"1px solid var(--border)",
        borderRadius:14,
        boxShadow:"0 8px 32px rgba(0,0,0,0.09)",
        minWidth:210,
        padding:"6px",
        zIndex:200,
        pointerEvents: open?"auto":"none",
        opacity: open?1:0,
        transform: open
          ? "translateX(-50%) translateY(0) scale(1)"
          : "translateX(-50%) translateY(-6px) scale(0.97)",
        transition:"opacity 0.15s ease, transform 0.15s ease",
      }}>
        {items.map(([label, path, Icon]) => (
          <button
            key={path}
            onClick={() => { navigate(path); setOpen(false) }}
            style={{
              display:"flex", alignItems:"center", gap:10,
              width:"100%", textAlign:"left",
              background: pathname===path ? "var(--accent-soft)" : "none",
              border:"none", borderRadius:10, padding:"9px 14px",
              cursor:"pointer", fontFamily:"var(--font)", fontSize:14,
              color: pathname===path ? "var(--accent)" : "var(--text-secondary)",
              transition:"background 0.12s, color 0.12s"
            }}
            onMouseEnter={e=>{
              if(pathname!==path){
                e.currentTarget.style.background="var(--bg-secondary)"
                e.currentTarget.style.color="var(--text)"
              }
            }}
            onMouseLeave={e=>{
              if(pathname!==path){
                e.currentTarget.style.background="none"
                e.currentTarget.style.color="var(--text-secondary)"
              }
            }}
          >
            <Icon size={15} color={pathname===path?"var(--accent)":"#AEAEB2"} />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

function NavLink({ label, path, pathname, accent }) {
  const navigate = useNavigate()

  return (
    <span
      onClick={()=>navigate(path)}
      style={{
        fontSize:14,
        fontWeight: accent?600:400,
        cursor:"pointer",
        color: accent ? "var(--accent)" : pathname===path ? "var(--accent)" : "var(--text-secondary)",
        transition:"color 0.15s, opacity 0.15s"
      }}
      onMouseEnter={e=>e.currentTarget.style.opacity="0.7"}
      onMouseLeave={e=>e.currentTarget.style.opacity="1"}
    >
      {label}{accent ? <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:"var(--accent)", marginLeft:5, verticalAlign:"middle" }}/> : null}
    </span>
  )
}

const ARTICLE_PATHS = ["/education/", "/research/paper", "/research/classifier-analysis", "/research/variability-review", "/research/windowing-analysis"]

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [progress, setProgress] = useState(0)

  const isArticle = ARTICLE_PATHS.some(p => pathname.startsWith(p)) && pathname !== "/education"
  const isDark = pathname === "/download" || pathname === "/signal"

  useEffect(() => {
    if (!isArticle) { setProgress(0); return }
    function onScroll() {
      const el = document.documentElement
      const total = el.scrollHeight - el.clientHeight
      setProgress(total > 0 ? el.scrollTop / total : 0)
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [isArticle, pathname])

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true) }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
    {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background: isDark ? "rgba(7,7,26,0.92)" : "rgba(255,255,255,0.88)",
      backdropFilter:"blur(20px)",
      borderBottom:"1px solid var(--border)",
      height:52, padding:"0 32px",
      display:"flex", alignItems:"center", justifyContent:"space-between"
    }}>
      <div onClick={()=>navigate("/")} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:8 }}>
        <Logo size={26}/>
        <span style={{ fontWeight:600, fontSize:17, color:"var(--text)" }}>myojam</span>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:24 }}>
        <Dropdown label={t("nav_learn")} pathname={pathname} items={[
          ["Get started",        "/get-started",     IconRocket],
          [t("nav_education"),   "/education",       IconBook],
          [t("nav_educators"),   "/educators",       IconGraduate],
          [t("nav_howItWorks"),  "/how-it-works",    IconMicroscope],
          ["Interactive tools",  "/demos",           IconBolt],
          ["Live Signal",        "/signal",          IconBolt],
          ["MyoCode",            "/myocode",         IconCode],
          ["Resources",          "/resources",       IconLink],
          ["Submit an article",  "/submit-article",  IconPencil],
        ]}/>

        <Dropdown label={t("nav_company")} pathname={pathname} items={[
          [t("nav_about"),        "/about",             IconBulb],
          ["Mission",             "/mission",           IconRocket],
          [t("nav_team"),         "/team",              IconPeople],
          [t("nav_careers"),      "/careers",           IconRocket],
          [t("nav_corporations"), "/corporations",      IconBuilding],
          ["Workplace policy",    "/workplace-policy",  IconShield],
          ["Blog",                "/blog",              IconNote],
          [t("nav_changelog"),    "/changelog",         IconCode],
          ["Research",            "/research",          IconMicroscope],
        ]}/>

        <NavLink label={t("nav_contact")} path="/contact" pathname={pathname}/>

        <span
          onClick={() => navigate("/get-started")}
          style={{ background:"none", color:"var(--accent)", border:"1.5px solid var(--accent)", borderRadius:100, padding:"6px 16px", fontSize:13, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"background 0.15s, color 0.15s, transform 0.15s", flexShrink:0 }}
          onMouseEnter={e => { e.currentTarget.style.background="var(--accent)"; e.currentTarget.style.color="#fff"; e.currentTarget.style.transform="scale(1.03)" }}
          onMouseLeave={e => { e.currentTarget.style.background="none"; e.currentTarget.style.color="var(--accent)"; e.currentTarget.style.transform="scale(1)" }}
        >
          Get started
        </span>

        <span
          onClick={() => navigate("/download")}
          style={{ background:"var(--accent)", color:"#fff", border:"none", borderRadius:100, padding:"7px 16px", fontSize:13, fontWeight:500, cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"opacity 0.15s, transform 0.15s", flexShrink:0 }}
          onMouseEnter={e => { e.currentTarget.style.opacity="0.88"; e.currentTarget.style.transform="scale(1.03)" }}
          onMouseLeave={e => { e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="scale(1)" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t("nav_download")}
        </span>

        <button
          onClick={() => setSearchOpen(true)}
          title="Search (⌘K)"
          style={{ background:"none", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer", padding:"5px 10px", display:"flex", alignItems:"center", gap:7, color:"var(--text-tertiary)", transition:"border-color 0.15s, color 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)" }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-tertiary)" }}
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <kbd style={{ fontSize:10, fontFamily:"monospace", opacity:0.6 }}>⌘K</kbd>
        </button>
      </div>

      {isArticle && (
        <div style={{ position:"absolute", bottom:0, left:0, height:2, background:"var(--accent)", width:`${progress * 100}%`, transition:"width 0.1s linear", zIndex:1 }}/>
      )}
    </nav>
    </>
  )
}
