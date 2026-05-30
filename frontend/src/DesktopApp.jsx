import { useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { Reveal, SectionPill } from "./Animate"
import { LiquidChrome } from "./components/LiquidChrome"

const MAC_URL = "https://github.com/Jaden300/myojam/releases/download/v1.0.0-macos/myojam-mac.zip"
const WIN_URL   = "https://github.com/Jaden300/myojam/releases/download/v1.0.0-windows/myojam-windows.zip"
const LINUX_URL = "https://github.com/Jaden300/myojam/releases/download/v1.0.0-linux/myojam-linux.tar.gz"

// Stable references - defined at module level so LiquidChrome's useEffect dep
// comparison never sees a "new" array and won't tear down/rebuild the canvas.
const HERO_CHROME   = { baseColor: [0.07, 0.0, 0.18], speed: 0.12, amplitude: 0.28, frequencyX: 2.8, frequencyY: 2.8 }
const FOOTER_CHROME = { baseColor: [0.07, 0.0, 0.18], speed: 0.08, amplitude: 0.22, frequencyX: 2.5, frequencyY: 2.5 }

// Pre-computed waveform path for Mac banner - 1600 wide (double for seamless loop)
// Uses harmonics 3, 8, 21 of period=800 so the signal repeats exactly at x=800
function buildWave(W, centerY, amp, phase = 0) {
  const pts = []
  for (let x = 0; x <= W; x += 3) {
    const y = centerY
      + amp * 0.55 * Math.sin(x * 6 * Math.PI / 800 + phase)
      + amp * 0.30 * Math.sin(x * 16 * Math.PI / 800 + phase * 1.3 + 0.8)
      + amp * 0.15 * Math.sin(x * 42 * Math.PI / 800 + phase * 0.7 + 1.5)
    pts.push(`${x},${y.toFixed(1)}`)
  }
  return "M " + pts.join(" L ")
}
const W = 1600
const MAC_WAVE_1 = buildWave(W, 110, 46, 0)
const MAC_WAVE_2 = buildWave(W, 110, 30, 1.1)
const MAC_WAVE_3 = buildWave(W, 110, 18, 2.4)
const WIN_WAVE_1 = buildWave(W, 110, 42, 0.6)
const WIN_WAVE_2 = buildWave(W, 110, 27, 1.7)
const WIN_WAVE_3 = buildWave(W, 110, 16, 3.0)
const LIN_WAVE_1 = buildWave(W, 110, 38, 1.4)
const LIN_WAVE_2 = buildWave(W, 110, 24, 2.5)
const LIN_WAVE_3 = buildWave(W, 110, 14, 0.2)

function buildMiniWave(cy, amp, phase) {
  const pts = []
  for (let x = 0; x <= 300; x += 4) {
    const n = x / 300
    const y = cy
      + amp * 0.55 * Math.sin(n * 8 * Math.PI + phase)
      + amp * 0.30 * Math.sin(n * 20 * Math.PI + phase * 1.3 + 0.8)
      + amp * 0.15 * Math.sin(n * 48 * Math.PI + phase * 0.7 + 1.5)
    pts.push(`${x},${y.toFixed(1)}`)
  }
  return "M " + pts.join(" L ")
}
const MINI_CH1 = buildMiniWave(12, 8, 0.0)
const MINI_CH2 = buildMiniWave(12, 6, 1.3)
const MINI_CH3 = buildMiniWave(12, 4.5, 2.6)
const MINI_CH4 = buildMiniWave(12, 7, 0.7)
const MINI_CH5 = buildMiniWave(12, 5, 3.9)

const PLATFORM_ACCENT = { mac: "#FF2D78", windows: "#3BAAFF", linux: "#10B981" }
const PLATFORM_RGBA   = {
  mac:     (a) => `rgba(255,45,120,${a})`,
  windows: (a) => `rgba(0,120,215,${a})`,
  linux:   (a) => `rgba(16,185,129,${a})`,
}

// Apple logo path (simplified trefoil shape)
const APPLE_PATH = "M12.5 2.5C12.5 2.5 10 2 9 5.5C8 3 5.5 2.5 5.5 2.5C5.5 2.5 3 2.5 3 6C3 9.5 7.5 13.5 9 14C10.5 13.5 15 9.5 15 6C15 2.5 12.5 2.5 12.5 2.5Z"

function MacBanner({ hovered }) {
  return (
    <div style={{
      position: "relative", width: "100%", height: 220, overflow: "hidden",
      borderRadius: "20px 20px 0 0",
      background: "linear-gradient(160deg, #0a001a 0%, #130828 50%, #0a001a 100%)",
    }}>
      <style>{`
        @keyframes macWaveBg { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes macGlow   { 0%,100%{opacity:0.35} 50%{opacity:0.58} }
        @keyframes macScan   { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
      `}</style>

      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 80% at 50% 60%, rgba(255,45,120,0.14) 0%, transparent 70%)",
        animation: "macGlow 3.5s ease-in-out infinite",
      }}/>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 70% at 50% 55%, rgba(255,45,120,0.12) 0%, transparent 65%)",
        opacity: hovered ? 1 : 0, transition: "opacity 0.4s",
      }}/>
      <svg viewBox={`0 0 ${W} 220`} preserveAspectRatio="none" style={{
        position: "absolute", top: 0, left: 0, width: "200%", height: "100%",
        opacity: 0.14, animation: "macWaveBg 8s linear infinite", willChange: "transform",
      }}>
        <path d={MAC_WAVE_1} stroke="rgba(255,45,120,1)" strokeWidth="1.5" fill="none"/>
      </svg>

      {/* macOS window mockup */}
      <div style={{
        position: "absolute", top: 18, left: 18, right: 18,
        background: "rgba(10,3,24,0.9)",
        border: "1px solid rgba(255,45,120,0.2)",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
      }}>
        {/* Title bar */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: "0 12px", height: 30,
          background: "rgba(255,255,255,0.025)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", gap: 5.5, marginRight: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }}/>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }}/>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28CA42" }}/>
          </div>
          <div style={{ flex: 1, textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
            myojam - Live Signal
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,45,120,0.18)", border: "1px solid rgba(255,45,120,0.3)", borderRadius: 100, padding: "2px 7px" }}>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#FF2D78" }}/>
            <span style={{ fontSize: 8, color: "#FF2D78", fontWeight: 700, letterSpacing: "0.05em" }}>LIVE</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "10px 14px" }}>
          {/* Status row */}
          <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
            {[
              { label: "Gesture", val: "FIST", color: "#FF2D78" },
              { label: "Confidence", val: "94.2%", color: "rgba(255,255,255,0.9)" },
              { label: "Latency", val: "<5ms", color: "#22D3EE" },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color, letterSpacing: "-0.3px" }}>{val}</div>
              </div>
            ))}
          </div>
          {/* EMG channels */}
          {[
            { ch: "CH1", wave: MINI_CH1, color: "rgba(255,45,120,0.85)",  glow: "rgba(255,45,120,0.5)"  },
            { ch: "CH2", wave: MINI_CH2, color: "rgba(167,139,250,0.8)",  glow: "rgba(167,139,250,0.4)" },
            { ch: "CH3", wave: MINI_CH3, color: "rgba(34,211,238,0.75)",  glow: "rgba(34,211,238,0.4)"  },
            { ch: "CH4", wave: MINI_CH4, color: "rgba(16,185,129,0.75)",  glow: "rgba(16,185,129,0.35)" },
            { ch: "CH5", wave: MINI_CH5, color: "rgba(249,115,22,0.70)",  glow: "rgba(249,115,22,0.35)" },
          ].map(({ ch, wave, color, glow }, i) => (
            <div key={ch} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < 4 ? 5 : 0 }}>
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.28)", fontFamily: "monospace", minWidth: 18 }}>{ch}</span>
              <div style={{ flex: 1, height: 22, background: "rgba(255,255,255,0.02)", borderRadius: 3, overflow: "hidden" }}>
                <svg viewBox="0 0 300 24" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                  <path d={wave} stroke={color} strokeWidth="1.4" fill="none" style={{ filter: `drop-shadow(0 0 3px ${glow})` }}/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hovered && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, width: "30%", background: "linear-gradient(90deg, transparent, rgba(255,45,120,0.04), transparent)", animation: "macScan 1.4s ease-in-out infinite" }}/>
        </div>
      )}
    </div>
  )
}

function WindowsBanner({ hovered }) {
  return (
    <div style={{
      position: "relative", width: "100%", height: 220, overflow: "hidden",
      borderRadius: "20px 20px 0 0",
      background: "linear-gradient(160deg, #020c1e 0%, #061525 50%, #020c1e 100%)",
    }}>
      <style>{`
        @keyframes winWaveBg { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes winGlow   { 0%,100%{opacity:0.40} 50%{opacity:0.60} }
        @keyframes winScan   { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
      `}</style>

      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 80% at 50% 60%, rgba(0,120,215,0.18) 0%, transparent 70%)",
        animation: "winGlow 3.8s ease-in-out infinite",
      }}/>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 70% at 50% 55%, rgba(0,140,255,0.14) 0%, transparent 65%)",
        opacity: hovered ? 1 : 0, transition: "opacity 0.4s",
      }}/>
      <svg viewBox={`0 0 ${W} 220`} preserveAspectRatio="none" style={{
        position: "absolute", top: 0, left: 0, width: "200%", height: "100%",
        opacity: 0.14, animation: "winWaveBg 9s linear infinite", willChange: "transform",
      }}>
        <path d={WIN_WAVE_1} stroke="rgba(0,120,215,1)" strokeWidth="1.5" fill="none"/>
      </svg>

      {/* Windows app window mockup */}
      <div style={{
        position: "absolute", top: 18, left: 18, right: 18,
        background: "rgba(2,8,20,0.92)",
        border: "1px solid rgba(0,120,215,0.22)",
        borderRadius: 6,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
      }}>
        {/* Windows title bar */}
        <div style={{
          display: "flex", alignItems: "center",
          padding: "0 0 0 10px", height: 30,
          background: "rgba(0,40,80,0.4)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ marginRight: 7 }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="0" y="0" width="7" height="7" rx="1" fill="rgba(0,180,255,0.85)"/>
              <rect x="9" y="0" width="7" height="7" rx="1" fill="rgba(0,180,255,0.65)"/>
              <rect x="0" y="9" width="7" height="7" rx="1" fill="rgba(0,180,255,0.65)"/>
              <rect x="9" y="9" width="7" height="7" rx="1" fill="rgba(0,180,255,0.45)"/>
            </svg>
          </div>
          <span style={{ flex: 1, fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>myojam - EMG Classifier</span>
          {["─", "□", "✕"].map((sym, i) => (
            <div key={sym} style={{
              width: 36, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: i === 2 ? 10 : 11, color: i === 2 ? "rgba(255,100,100,0.8)" : "rgba(255,255,255,0.35)",
            }}>{sym}</div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
          {[{ label: "Signal", active: true }, { label: "Training", active: false }, { label: "Settings", active: false }].map(({ label, active }) => (
            <div key={label} style={{
              padding: "5px 14px", fontSize: 9, fontWeight: active ? 600 : 400,
              color: active ? "#3BAAFF" : "rgba(255,255,255,0.3)",
              borderBottom: active ? "1.5px solid #3BAAFF" : "1.5px solid transparent",
            }}>{label}</div>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: "10px 12px" }}>
          {/* Prediction row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ background: "rgba(0,120,215,0.15)", border: "1px solid rgba(0,120,215,0.3)", borderRadius: 4, padding: "3px 10px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#3BAAFF", letterSpacing: "0.04em" }}>OPEN HAND</span>
            </div>
            <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 100, overflow: "hidden" }}>
              <div style={{ width: "89%", height: "100%", background: "linear-gradient(90deg, #0078D7, #3BAAFF)", borderRadius: 100 }}/>
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>89%</span>
            <span style={{ fontSize: 10, color: "#22D3EE", fontWeight: 600 }}>&lt;5ms</span>
          </div>
          {/* Channels */}
          {[
            { ch: "CH1", wave: MINI_CH1, color: "rgba(0,180,255,0.85)",  glow: "rgba(0,120,215,0.5)"  },
            { ch: "CH2", wave: MINI_CH2, color: "rgba(59,170,255,0.75)", glow: "rgba(0,140,255,0.4)"  },
            { ch: "CH3", wave: MINI_CH3, color: "rgba(34,211,238,0.70)", glow: "rgba(34,211,238,0.35)" },
            { ch: "CH4", wave: MINI_CH4, color: "rgba(139,92,246,0.70)", glow: "rgba(139,92,246,0.35)" },
          ].map(({ ch, wave, color, glow }, i) => (
            <div key={ch} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < 3 ? 5 : 0 }}>
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.28)", fontFamily: "monospace", minWidth: 18 }}>{ch}</span>
              <div style={{ flex: 1, height: 22, background: "rgba(255,255,255,0.02)", borderRadius: 2, overflow: "hidden" }}>
                <svg viewBox="0 0 300 24" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
                  <path d={wave} stroke={color} strokeWidth="1.4" fill="none" style={{ filter: `drop-shadow(0 0 3px ${glow})` }}/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hovered && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, width: "30%", background: "linear-gradient(90deg, transparent, rgba(0,120,215,0.05), transparent)", animation: "winScan 1.6s ease-in-out infinite" }}/>
        </div>
      )}
    </div>
  )
}

function LinuxBanner({ hovered }) {
  return (
    <div style={{
      position: "relative", width: "100%", height: 220, overflow: "hidden",
      borderRadius: "20px 20px 0 0",
      background: "linear-gradient(160deg, #020f08 0%, #061a0e 50%, #020f08 100%)",
    }}>
      <style>{`
        @keyframes linWaveBg { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes linGlow   { 0%,100%{opacity:0.35} 50%{opacity:0.55} }
        @keyframes linScan   { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
        @keyframes linCursor { 0%,49%{opacity:1} 50%,100%{opacity:0} }
      `}</style>

      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 80% at 50% 60%, rgba(16,185,129,0.14) 0%, transparent 70%)",
        animation: "linGlow 4s ease-in-out infinite",
      }}/>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 70% at 50% 55%, rgba(16,185,129,0.10) 0%, transparent 65%)",
        opacity: hovered ? 1 : 0, transition: "opacity 0.4s",
      }}/>
      <svg viewBox={`0 0 ${W} 220`} preserveAspectRatio="none" style={{
        position: "absolute", top: 0, left: 0, width: "200%", height: "100%",
        opacity: 0.12, animation: "linWaveBg 10s linear infinite", willChange: "transform",
      }}>
        <path d={LIN_WAVE_1} stroke="rgba(16,185,129,1)" strokeWidth="1.5" fill="none"/>
      </svg>

      {/* Terminal window mockup */}
      <div style={{
        position: "absolute", top: 18, left: 18, right: 18,
        background: "rgba(2,10,5,0.93)",
        border: "1px solid rgba(16,185,129,0.22)",
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
      }}>
        {/* Terminal title bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5.5,
          padding: "0 12px", height: 28,
          background: "rgba(255,255,255,0.025)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FF5F57" }}/>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FFBD2E" }}/>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28CA42" }}/>
          <div style={{ flex: 1, textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>bash - myojam</div>
        </div>

        {/* Terminal content */}
        <div style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 10, lineHeight: 1.85 }}>
          <div>
            <span style={{ color: "rgba(52,211,153,0.7)" }}>user@host</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>:</span>
            <span style={{ color: "rgba(99,179,237,0.8)" }}>~/myojam</span>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>$ </span>
            <span style={{ color: "rgba(255,255,255,0.85)" }}>python3 -m myojam --port /dev/ttyUSB0</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.38)" }}>
            [myojam] Serial connected → <span style={{ color: "rgba(52,211,153,0.75)" }}>/dev/ttyUSB0</span> @ 115200 baud
          </div>
          <div style={{ color: "rgba(255,255,255,0.38)" }}>
            [myojam] RF model loaded · <span style={{ color: "rgba(52,211,153,0.75)" }}>6 gestures</span> · 500 trees · 64 features
          </div>
          <div style={{ color: "rgba(255,255,255,0.38)" }}>──────────────────────────────────────────</div>
          <div>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>gesture: </span>
            <span style={{ color: "#34D399", fontWeight: 700 }}>FIST</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>{"  "}conf: </span>
            <span style={{ color: "#34D399" }}>0.942</span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>{"  "}lat: </span>
            <span style={{ color: "#22D3EE" }}>3ms</span>
          </div>
          <div>
            <span style={{ color: "rgba(52,211,153,0.55)" }}>{">"} </span>
            <span style={{ animation: "linCursor 1s step-end infinite", color: "rgba(52,211,153,0.9)" }}>▌</span>
          </div>
        </div>
      </div>

      {hovered && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, width: "30%", background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.04), transparent)", animation: "linScan 1.7s ease-in-out infinite" }}/>
        </div>
      )}
    </div>
  )
}

const PLATFORM_NAMES = { mac: "macOS",   windows: "Windows", linux: "Linux"       }
const PLATFORM_ARCH  = { mac: "Apple Silicon · Intel", windows: "x64 · ARM64", linux: "x86_64 · ARM64" }
const PLATFORM_SPECS = {
  mac:     [["Requires","macOS 12 Monterey+"],          ["Size","~295 MB"],  ["License","MIT · Free"],  ["Arch","Apple Silicon + Intel"]],
  windows: [["Requires","Windows 10+"],                  ["Size","~280 MB"],  ["License","MIT · Free"],  ["Arch","x64 · ARM64"]],
  linux:   [["Requires","Ubuntu 20.04+ / Debian 11+"],   ["Size","~260 MB"],  ["License","MIT · Free"],  ["Arch","x86_64 · ARM64"]],
}

function PlatformCard({ platform, hovered, setHovered }) {
  const accent = PLATFORM_ACCENT[platform]
  const ra     = PLATFORM_RGBA[platform]

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20,
        border: `1px solid ${hovered ? ra(0.45) : "rgba(255,255,255,0.10)"}`,
        background: "rgba(8,8,26,0.92)",
        overflow: "hidden",
        transform: hovered ? "translateY(-6px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
        boxShadow: hovered
          ? `0 32px 80px ${ra(0.20)}, 0 0 0 1px ${ra(0.12)}`
          : "0 8px 32px rgba(0,0,0,0.4)",
        flex: 1, minWidth: 0,
      }}
    >
      {platform === "mac"
        ? <MacBanner hovered={hovered}/>
        : platform === "windows"
          ? <WindowsBanner hovered={hovered}/>
          : <LinuxBanner hovered={hovered}/>
      }

      <div style={{ padding: "24px 24px 28px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.4px", color: "#fff", marginBottom: 2 }}>
              {PLATFORM_NAMES[platform]}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", fontWeight: 300 }}>
              {PLATFORM_ARCH[platform]}
            </div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: accent, background: ra(0.12), border: `1px solid ${ra(0.28)}`, borderRadius: 100, padding: "4px 11px" }}>
            v1.0.0
          </div>
        </div>

        {/* Specs */}
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 22 }}>
          {PLATFORM_SPECS[platform].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.32)", fontWeight: 300, flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.72)", fontWeight: 400, textAlign: "right" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {platform === "mac"
          ? <MacDownloadButton hovered={hovered}/>
          : platform === "windows"
            ? <WindowsDownloadButton hovered={hovered}/>
            : <LinuxDownloadButton hovered={hovered}/>
        }
      </div>
    </div>
  )
}

function MacDownloadButton({ hovered }) {
  const [btnHovered, setBtnHovered] = useState(false)
  const active = hovered || btnHovered
  return (
    <a
      href={MAC_URL}
      onMouseEnter={() => setBtnHovered(true)}
      onMouseLeave={() => setBtnHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
        width: "100%", padding: "14px 0", borderRadius: 12,
        background: active
          ? "linear-gradient(135deg, #ff1a6d, #e0256a)"
          : "linear-gradient(135deg, #FF2D78, #d41f5f)",
        color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 600,
        boxShadow: active ? "0 8px 28px rgba(255,45,120,0.50)" : "0 4px 16px rgba(255,45,120,0.35)",
        transform: active ? "scale(1.02)" : "scale(1)",
        transition: "all 0.2s ease",
        letterSpacing: "0.01em",
      }}
    >
      <svg width="15" height="15" viewBox="0 0 12 12" fill="none">
        <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Download for macOS - Free
    </a>
  )
}

function WindowsDownloadButton({ hovered }) {
  const [btnHovered, setBtnHovered] = useState(false)
  const active = hovered || btnHovered
  return (
    <a
      href={WIN_URL}
      onMouseEnter={() => setBtnHovered(true)}
      onMouseLeave={() => setBtnHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
        width: "100%", padding: "14px 0", borderRadius: 12,
        background: active
          ? "linear-gradient(135deg, #1a9fff, #0070c0)"
          : "linear-gradient(135deg, #0078D7, #0060b0)",
        color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 600,
        boxShadow: active ? "0 8px 28px rgba(0,120,215,0.55)" : "0 4px 16px rgba(0,120,215,0.35)",
        transform: active ? "scale(1.02)" : "scale(1)",
        transition: "all 0.2s ease",
        letterSpacing: "0.01em",
      }}
    >
      <svg width="15" height="15" viewBox="0 0 12 12" fill="none">
        <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Download for Windows - Free
    </a>
  )
}

function LinuxDownloadButton({ hovered }) {
  const [btnHovered, setBtnHovered] = useState(false)
  const active = hovered || btnHovered
  return (
    <a
      href={LINUX_URL}
      onMouseEnter={() => setBtnHovered(true)}
      onMouseLeave={() => setBtnHovered(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
        width: "100%", padding: "14px 0", borderRadius: 12,
        background: active
          ? "linear-gradient(135deg, #14d08a, #0c9e68)"
          : "linear-gradient(135deg, #10B981, #0a8a5a)",
        color: "#fff", textDecoration: "none", fontSize: 15, fontWeight: 600,
        boxShadow: active ? "0 8px 28px rgba(16,185,129,0.50)" : "0 4px 16px rgba(16,185,129,0.32)",
        transform: active ? "scale(1.02)" : "scale(1)",
        transition: "all 0.2s ease",
        letterSpacing: "0.01em",
      }}
    >
      <svg width="15" height="15" viewBox="0 0 12 12" fill="none">
        <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      Download for Linux - Free
    </a>
  )
}

const FEATURES = [
  {
    accent: "#FF2D78",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <polyline points="2,20 6,12 10,16 14,8 18,14 22,6 26,10" stroke="#FF2D78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M2,20 26,20" stroke="rgba(255,45,120,0.25)" strokeWidth="1"/>
      </svg>
    ),
    title: "Live EMG waveform",
    body: "Watch your forearm's electrical signal render in real time - every contraction, every twitch. A glowing waveform built for the dark, with a 3-layer glow effect that makes the signal feel alive.",
  },
  {
    accent: "#A78BFA",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="10" width="20" height="14" rx="3" stroke="#A78BFA" strokeWidth="1.8" fill="none"/>
        <path d="M9 10V7a5 5 0 0110 0v3" stroke="#A78BFA" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        <circle cx="14" cy="17" r="2.5" fill="#A78BFA" opacity="0.7"/>
      </svg>
    ),
    title: "Gesture classification",
    body: "Six gesture classes - index flex, middle flex, ring flex, pinky flex, thumb flex, and fist - classified in real time using the same 84.85%-accurate Random Forest that powers the research.",
  },
  {
    accent: "#22D3EE",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 6 C14 6 8 8 8 14 C8 20 14 23 14 23 C14 23 20 20 20 14 C20 8 14 6 14 6 Z" stroke="#22D3EE" strokeWidth="1.8" fill="none"/>
        <line x1="14" y1="6" x2="14" y2="23" stroke="#22D3EE" strokeWidth="1.2" opacity="0.4"/>
        <line x1="8" y1="14" x2="20" y2="14" stroke="#22D3EE" strokeWidth="1.2" opacity="0.4"/>
      </svg>
    ),
    title: "3D hand model",
    body: "A rotating Three.js hand model animates each finger to match your detected gesture - curling in real time as the classifier updates. Visual confirmation that the system sees what you're doing.",
  },
  {
    accent: "#10B981",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="#10B981" strokeWidth="1.8" fill="none"/>
        <path d="M14 9v5l3 3" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: "Session tracking",
    body: "Every session is tracked: total gestures performed, average confidence, and a live timer. See how your accuracy evolves in a single session as your forearm warms up.",
  },
]

const STEPS = [
  {
    num: "01",
    title: "Connect your sensor",
    body: "Plug a MyoWare 2.0 sensor into an Arduino and connect it to your computer via USB. The app auto-detects the serial port.",
    accent: "#FF2D78",
  },
  {
    num: "02",
    title: "See your signal",
    body: "The live EMG waveform appears immediately. Flex any finger and watch the amplitude spike. This is the raw signal - before filtering, before classification.",
    accent: "#A78BFA",
  },
  {
    num: "03",
    title: "Make a gesture",
    body: "Hold any of the six gestures for one second. The classifier extracts 64 features from your signal window and returns a prediction within 50ms.",
    accent: "#22D3EE",
  },
]

export default function DesktopApp() {
  const navigate = useNavigate()
  const [macHovered, setMacHovered] = useState(false)
  const [winHovered, setWinHovered] = useState(false)
  const [linHovered, setLinHovered] = useState(false)

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07071a",
      "--bg":           "#07071a",
      "--bg-secondary": "#0c0c26",
      "--text":         "#ffffff",
      "--text-secondary": "rgba(255,255,255,0.60)",
      "--text-tertiary":  "rgba(255,255,255,0.35)",
      "--border":       "rgba(255,255,255,0.08)",
      "--accent":       "#FF2D78",
      "--accent-soft":  "rgba(255,45,120,0.08)",
    }}>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden", minHeight: "100vh", display: "flex", alignItems: "center", background: "#07071a" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <LiquidChrome {...HERO_CHROME} interactive={true}/>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(3,0,18,0.72) 0%, rgba(3,0,18,0.55) 50%, rgba(3,0,18,0.85) 100%)", zIndex: 1 }}/>

        <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 960, margin: "0 auto", padding: "140px 32px 100px" }}>
          <Reveal>
            {/* Eyebrow */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 100, padding: "5px 14px", marginBottom: 32 }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 400, letterSpacing: "0.03em" }}>free · open source · MIT licence</span>
            </div>

            <h1 style={{ fontSize: "clamp(40px, 7vw, 80px)", fontWeight: 700, letterSpacing: "-3px", lineHeight: 1.0, color: "#fff", marginBottom: 20 }}>
              Download myojam.
            </h1>
            <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "rgba(255,255,255,0.60)", fontWeight: 300, lineHeight: 1.75, maxWidth: 500, marginBottom: 56 }}>
              Real-time EMG gesture classification. Runs locally on your machine - no internet, no account, no latency. Backed by research you can read.
            </p>

            {/* Platform cards */}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "stretch" }}>
              <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                <PlatformCard platform="mac" hovered={macHovered} setHovered={setMacHovered}/>
              </div>
              <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                <PlatformCard platform="windows" hovered={winHovered} setHovered={setWinHovered}/>
              </div>
              <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                <PlatformCard platform="linux" hovered={linHovered} setHovered={setLinHovered}/>
              </div>
            </div>

            {/* Research link */}
            <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/research/paper")}
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font)", fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 300, padding: 0, transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
              >
                Read the research →
              </button>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.18)" }}>·</span>
              <button
                onClick={() => navigate("/how-it-works")}
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font)", fontSize: 13, color: "rgba(255,255,255,0.45)", fontWeight: 300, padding: 0, transition: "color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,0.8)"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.45)"}
              >
                How it works →
              </button>
            </div>
          </Reveal>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: 0.3 }}>
          <span style={{ fontSize: 10, color: "#fff", letterSpacing: "0.1em", textTransform: "uppercase" }}>scroll</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M4 9l4 4 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--bg)", borderTop: "1px solid var(--border)", padding: "96px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>What's inside</SectionPill>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600, letterSpacing: "-1.5px", color: "var(--text)", marginBottom: 16, marginTop: 16 }}>
              Built for the signal, not the screenshot.
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, maxWidth: 520, marginBottom: 56 }}>
              Every design decision in the app was made to make the EMG signal readable and the classifier transparent.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.06} style={{ height: "100%" }}>
                <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 16, padding: "32px 28px", transition: "border-color 0.2s", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = f.accent + "60"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <div style={{ marginBottom: 20 }}>{f.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>{f.title}</div>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, margin: 0 }}>{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "96px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Setup</SectionPill>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600, letterSpacing: "-1.5px", color: "var(--text)", marginBottom: 16, marginTop: 16 }}>
              From sensor to gesture in three steps.
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, maxWidth: 480, marginBottom: 64 }}>
              You need a MyoWare 2.0 sensor and an Arduino. Everything else - filtering, feature extraction, classification - happens inside the app.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 0 }}>
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.08}>
                <div style={{ position: "relative", padding: "0 32px 0 0" }}>
                  {i < STEPS.length - 1 && (
                    <div style={{ position: "absolute", top: 22, left: "calc(100% - 12px)", width: 24, height: 1, background: "var(--border)", zIndex: 1 }}/>
                  )}
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: s.accent + "18", border: `1px solid ${s.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.accent, fontFamily: "monospace" }}>{s.num}</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginBottom: 10 }}>{s.title}</div>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, margin: 0 }}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <div style={{ marginTop: 48, padding: "20px 24px", background: "rgba(255,45,120,0.04)", border: "1px solid rgba(255,45,120,0.15)", borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 14 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="9" cy="9" r="7.5" stroke="#FF2D78" strokeWidth="1.4" fill="none"/>
                <path d="M9 8v4M9 6h.01" stroke="#FF2D78" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              <p style={{ margin: 0, fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.7 }}>
                No MyoWare sensor yet? The browser-based <span onClick={() => navigate("/playground")} style={{ color: "var(--accent)", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>Signal Playground</span> lets you explore simulated EMG data with no hardware at all.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Hardware wiring guide ────────────────────────────────────────────── */}
      <div style={{ background: "var(--bg)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "96px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Wiring guide</SectionPill>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600, letterSpacing: "-1.5px", color: "var(--text)", marginBottom: 16, marginTop: 16 }}>
              How to connect the hardware.
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, maxWidth: 520, marginBottom: 48 }}>
              Three wires connect a MyoWare 2.0 to an Arduino Uno. The Arduino forwards the analog voltage over USB serial at 115200 baud.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>

            {/* Pin table */}
            <Reveal>
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Pin connections
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["MyoWare 2.0", "Arduino Uno", "Wire colour", "Purpose"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { myo: "+",    ard: "5V",   wire: "Red",    wcolor: "#EF4444", purpose: "Power (5 V supply)"     },
                      { myo: "−",    ard: "GND",  wire: "Black",  wcolor: "#6B7280", purpose: "Ground reference"        },
                      { myo: "SIG",  ard: "A0",   wire: "Yellow", wcolor: "#F59E0B", purpose: "Analog EMG signal"       },
                    ].map(({ myo, ard, wire, wcolor, purpose }) => (
                      <tr key={myo} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#FF2D78", fontFamily: "monospace" }}>{myo}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: "var(--text)", fontFamily: "monospace" }}>{ard}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                            <span style={{ width: 10, height: 10, borderRadius: "50%", background: wcolor, flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)" }}/>
                            {wire}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-tertiary)", fontWeight: 300 }}>{purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ padding: "14px 20px", fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300, lineHeight: 1.6, borderTop: "1px solid var(--border)" }}>
                  Place the sensor on your forearm, centred over the flexor digitorum. Electrode placement matters - see the education hub article for a guide.
                </div>
              </div>
            </Reveal>

            {/* Arduino sketch */}
            <Reveal delay={0.1}>
              <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Arduino sketch</span>
                  <span style={{ fontSize: 10, color: "#10B981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 100, padding: "2px 8px", fontWeight: 500 }}>Copy from GitHub</span>
                </div>
                <pre style={{ margin: 0, padding: "20px", fontSize: 12, lineHeight: 1.7, color: "rgba(255,255,255,0.75)", fontFamily: "monospace", overflowX: "auto", background: "transparent" }}>{`void setup() {
  Serial.begin(115200);
}

void loop() {
  int val = analogRead(A0);
  // Map 0–1023 → 0–3.3V (mV)
  float mv = val * (3300.0 / 1023.0);
  Serial.println(mv);
  delay(5); // 200 Hz
}`}</pre>
                <div style={{ padding: "14px 20px", fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300, lineHeight: 1.6, borderTop: "1px solid var(--border)" }}>
                  Upload this to the Arduino. The app auto-detects the serial port when you switch to Sensor mode. Baud rate must be <span style={{ color: "#22D3EE", fontFamily: "monospace" }}>115200</span>.
                </div>
              </div>
            </Reveal>
          </div>

          {/* Placement tips */}
          <Reveal delay={0.15}>
            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {[
                { tip: "Sensor placement", body: "Centre the electrode pad over the belly of the flexor digitorum superficialis - roughly 3–4 cm below the elbow crease, forearm facing up.", color: "#FF2D78" },
                { tip: "Reference electrode", body: "Attach the reference (REF) electrode on a bony, muscle-free area: the bony point of the elbow (olecranon) works well and reduces interference.", color: "#A78BFA" },
                { tip: "Between sessions", body: "Remove and reattach the sensor in the same position each time. Even 1–2 cm of drift degrades accuracy by 5–10pp. Mark your forearm with a pen as a guide.", color: "#22D3EE" },
              ].map(({ tip, body, color }) => (
                <div key={tip} style={{ border: `1px solid ${color}20`, borderTop: `3px solid ${color}`, borderRadius: "0 0 12px 12px", background: `${color}06`, padding: "16px 18px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{tip}</div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.65, margin: 0 }}>{body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Research backing ─────────────────────────────────────────────────── */}
      <div style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", padding: "96px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <SectionPill>Research</SectionPill>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 600, letterSpacing: "-1.5px", color: "var(--text)", marginBottom: 16, marginTop: 16 }}>
              Not a demo. A research instrument.
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.75, maxWidth: 520, marginBottom: 48 }}>
              The classifier embedded in myojam is the same one documented in four open-access technical reports - every hyperparameter, every design decision, every tradeoff, published.
            </p>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 32 }}>
            {[
              { val: "84.85%", label: "Cross-subject accuracy", sub: "Tested on 10 unseen subjects", accent: "#FF2D78" },
              { val: "64", label: "Features extracted", sub: "MAV · RMS · WL · ZCR × 16 ch", accent: "#A78BFA" },
              { val: "LOSO", label: "Cross-validation", sub: "Leave-one-subject-out", accent: "#22D3EE" },
              { val: "Ninapro DB5", label: "Benchmark dataset", sub: "52 gestures · 10 subjects · 16ch", accent: "#10B981" },
            ].map((s, i) => (
              <Reveal key={s.val} delay={i * 0.06} style={{ height: "100%" }}>
                <div style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 14, padding: "24px 20px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
                  <div style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, color: s.accent, letterSpacing: "-1px", marginBottom: 6 }}>{s.val}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 300, lineHeight: 1.5 }}>{s.sub}</div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {[
                { label: "Full technical report", path: "/research/paper" },
                { label: "Classifier comparison", path: "/research/classifier-analysis" },
                { label: "Variability review", path: "/research/variability-review" },
                { label: "Windowing analysis", path: "/research/windowing-analysis" },
              ].map(({ label, path }) => (
                <button key={path} onClick={() => navigate(path)}
                  style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "var(--text-secondary)", borderRadius: 100, padding: "8px 18px", fontSize: 13, cursor: "pointer", fontFamily: "var(--font)", fontWeight: 400, transition: "all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)" }}
                >
                  {label} →
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Requirements ─────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)", padding: "64px 32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
            <Reveal>
              <SectionPill>Requirements</SectionPill>
              <h3 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.8px", color: "var(--text)", marginBottom: 24, marginTop: 16 }}>What you need</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[["Operating system", "macOS 12+ · Windows 10+ · Ubuntu 20.04+"], ["Hardware sensor", "MyoWare 2.0 EMG sensor"], ["Microcontroller", "Arduino Uno or compatible"], ["Processor", "Apple Silicon · Intel · x64 · ARM64"], ["Download size", "~280–295 MB (platform bundle)"], ["License", "MIT - free to use, modify, and distribute"]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 300, minWidth: 140 }}>{k}</span>
                    <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 400 }}>{v}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <SectionPill>Open source</SectionPill>
              <h3 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.8px", color: "var(--text)", marginBottom: 16, marginTop: 16 }}>Everything is public</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.8, marginBottom: 24 }}>
                The desktop app source - Python, PyQt6, the signal processing pipeline, and the trained Random Forest model - is on GitHub under MIT. Fork it, modify it, build on it.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["Signal processing pipeline (bandpass filter, windowing, feature extraction)", "64-feature Random Forest classifier (MAV, RMS, WL, ZCR × 16 channels)", "Live serial reader from Arduino at 115200 baud", "PyQt6 dark-theme UI with custom widget painting", "Three.js 3D hand model (embedded in QWebEngineView)"].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF2D78", flexShrink: 0, marginTop: 6 }}/>
                    <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 300, lineHeight: 1.6 }}>{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ───────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", overflow: "hidden", padding: "120px 32px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <LiquidChrome {...FOOTER_CHROME} interactive={false}/>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "rgba(3,0,18,0.78)", zIndex: 1 }}/>
        <div style={{ position: "relative", zIndex: 2, maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#FF2D78", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>Ready to start</div>
            <h2 style={{ fontSize: "clamp(32px, 5vw, 54px)", fontWeight: 700, letterSpacing: "-2px", lineHeight: 1.05, color: "#fff", marginBottom: 20 }}>
              Start reading your muscles.
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.55)", fontWeight: 300, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 48px" }}>
              Surface EMG hardware interfaces are still rare, still expensive, and still mostly locked inside research labs. myojam is what it looks like when that changes.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <a href={MAC_URL} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FF2D78", color: "#fff", textDecoration: "none", borderRadius: 100, padding: "14px 32px", fontSize: 15, fontWeight: 600, boxShadow: "0 6px 24px rgba(255,45,120,0.40)", transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.transform="scale(1.04)"; e.currentTarget.style.boxShadow="0 12px 36px rgba(255,45,120,0.55)" }}
                onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.boxShadow="0 6px 24px rgba(255,45,120,0.40)" }}
              >
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Download for macOS
              </a>
              <a href={WIN_URL} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,120,215,0.18)", border: "1px solid rgba(0,120,215,0.35)", color: "#3BAAFF", textDecoration: "none", borderRadius: 100, padding: "14px 28px", fontSize: 15, fontWeight: 600, transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.transform="scale(1.04)"; e.currentTarget.style.background="rgba(0,120,215,0.28)" }}
                onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.background="rgba(0,120,215,0.18)" }}
              >
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Windows
              </a>
              <a href={LINUX_URL} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.32)", color: "#34D399", textDecoration: "none", borderRadius: 100, padding: "14px 28px", fontSize: 15, fontWeight: 600, transition: "all 0.18s" }}
                onMouseEnter={e => { e.currentTarget.style.transform="scale(1.04)"; e.currentTarget.style.background="rgba(16,185,129,0.25)" }}
                onMouseLeave={e => { e.currentTarget.style.transform="scale(1)"; e.currentTarget.style.background="rgba(16,185,129,0.15)" }}
              >
                <svg width="14" height="14" viewBox="0 0 12 12" fill="none"><path d="M6 1v7M3 5l3 3 3-3M1 10h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Linux
              </a>
            </div>
            <div style={{ marginTop: 24, fontSize: 12, color: "rgba(255,255,255,0.25)", fontWeight: 300 }}>
              v1.0.0 · macOS 12+ · Windows 10+ · Ubuntu 20.04+ · MIT licence · no account required
            </div>
          </Reveal>
        </div>
      </div>

      <Footer />
    </div>
  )
}
