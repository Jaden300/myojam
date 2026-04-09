import { useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import Logo from "./Logo"
import { t, getLang, setLang } from "./i18n"
import { IconGear, IconBook, IconBulb, IconPeople, IconRocket, IconBuilding, IconCode } from "./Icons"
import { getTheme, setTheme } from "./theme"

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
      {label}{accent?" ✦":""}
    </span>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const [lang, setLangState] = useState(getLang())
  const [theme, setThemeState] = useState(getTheme())

  useEffect(() => {
    const handler = () => setLangState(getLang())
    window.addEventListener("langchange", handler)
    return () => window.removeEventListener("langchange", handler)
  }, [])

  useEffect(() => {
    const handler = () => setThemeState(getTheme())
    window.addEventListener("themechange", handler)
    return () => window.removeEventListener("themechange", handler)
  }, [])

  function switchLang(l) {
    setLang(l)
    setLangState(l)
  }

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light"
    setTheme(next)
    setThemeState(next)
  }

  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background:"rgba(255,255,255,0.88)",
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
        <NavLink label="Demos" path="/demos" pathname={pathname}/>

        <Dropdown label="Learn" pathname={pathname} items={[
          ["How it works", "/how-it-works", IconGear],
          ["Education hub", "/education", IconBook],
          ["For educators", "/educators", IconPeople],
        ]}/>

        <Dropdown label="Company" pathname={pathname} items={[
          ["About", "/about", IconBulb],
          ["Team", "/team", IconPeople],
          ["Careers", "/careers", IconRocket],
          ["For corporations", "/corporations", IconBuilding],
          ["Changelog", "/changelog", IconCode],
          ["Research paper", "/research", IconBook],
        ]}/>

        <NavLink label="Contact" path="/contact" pathname={pathname}/>
        <NavLink label="ELEVATE" path="/elevate" pathname={pathname} accent={true}/>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background:"none",
            border:"1px solid var(--border)",
            borderRadius:"50%",
            width:32,
            height:32,
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            cursor:"pointer",
            fontSize:15,
            color:"var(--text-secondary)",
            transition:"border-color 0.15s, transform 0.2s"
          }}
          onMouseEnter={e=>{
            e.currentTarget.style.borderColor="var(--accent)"
            e.currentTarget.style.transform="rotate(20deg)"
          }}
          onMouseLeave={e=>{
            e.currentTarget.style.borderColor="var(--border)"
            e.currentTarget.style.transform="rotate(0deg)"
          }}
          title={theme==="light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? "◐" : "◑"}
        </button>

        {/* Language toggle */}
        <div style={{
          display:"flex",
          background:"var(--bg-secondary)",
          border:"1px solid var(--border)",
          borderRadius:100,
          padding:2
        }}>
          {["en","fr"].map(l=>(
            <button
              key={l}
              onClick={()=>switchLang(l)}
              style={{
                background: lang===l?"#fff":"transparent",
                border:"none",
                borderRadius:100,
                padding:"3px 10px",
                fontSize:12,
                fontWeight:lang===l?600:400,
                color: lang===l?"var(--text)":"var(--text-tertiary)",
                cursor:"pointer",
                boxShadow: lang===l?"0 1px 4px rgba(0,0,0,0.08)":"none"
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}