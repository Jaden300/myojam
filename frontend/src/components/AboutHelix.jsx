import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

const TIMELINE = [
  { when: 'Sept 2024', what: 'Project conceived as a personal challenge: build a working EMG classifier from scratch using public data and consumer hardware.' },
  { when: 'Oct 2024',  what: 'First real EMG signal streamed from MyoWare 2.0 sensor via Arduino. Bandpass filtering implemented. Signal is noisy but real.' },
  { when: 'Nov 2024',  what: 'First Random Forest trained on Ninapro DB5. Initial accuracy 71.2%. Feature extraction pipeline locked in.' },
  { when: 'Dec 2024',  what: 'Cross-subject model trained across all 10 Ninapro subjects. 84.85% accuracy. Pipeline generalises to unseen individuals.' },
  { when: 'Jan 2025',  what: 'macOS desktop app launched. Gesture predictions control real mouse cursor and keyboard for the first time end-to-end.' },
  { when: 'Feb 2025',  what: 'Web demo launched at myojam.com. FastAPI backend on Render, React frontend on Vercel. No hardware required.' },
  { when: 'Mar 2025',  what: 'Full site redesign. Education hub, signal playground, AI chatbot, block coding environment (myocode) launched.' },
  { when: 'Apr 2025',  what: 'Educators hub launched with full lesson plans, quizzes, and curriculum materials for classroom use.' },
]

const N = TIMELINE.length

const STAGE_COLORS = [
  '#FF2D78', '#e8185c', '#c026d3', '#9333ea',
  '#7c3aed', '#4f46e5', '#3b82f6', '#06b6d4',
]

export default function AboutHelix() {
  const sectionRef = useRef(null)
  const mountRef   = useRef(null)
  const stageRef   = useRef(0)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const el  = mountRef.current
    const sec = sectionRef.current
    if (!el || !sec) return

    // ── Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'
    el.appendChild(renderer.domElement)
    renderer.setSize(el.offsetWidth || window.innerWidth / 2, el.offsetHeight || window.innerHeight)

    // ── Scene / Camera
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, el.offsetWidth / el.offsetHeight, 0.1, 100)
    camera.position.set(3.8, 0, 3.8)

    // ── Helix node positions
    const HELIX_R    = 1.25
    const HELIX_H    = 5.4
    const STEP_ANGLE = Math.PI * 0.65

    const hPositions = Array.from({ length: N }, (_, i) => new THREE.Vector3(
      HELIX_R * Math.cos(i * STEP_ANGLE),
      (i / (N - 1)) * HELIX_H - HELIX_H / 2,
      HELIX_R * Math.sin(i * STEP_ANGLE)
    ))

    const group = new THREE.Group()
    scene.add(group)

    // ── Node spheres (one per timeline entry)
    const nodeMats = hPositions.map(() => new THREE.MeshBasicMaterial({
      color: new THREE.Color('#4f46e5'), transparent: true, opacity: 0.55,
    }))
    const nodes = hPositions.map((pos, i) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), nodeMats[i])
      mesh.position.copy(pos)
      group.add(mesh)
      return mesh
    })

    // ── Halo glow per node
    const haloMats = hPositions.map(() => new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FF2D78'), transparent: true, opacity: 0, side: THREE.BackSide,
    }))
    hPositions.forEach((pos, i) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 14), haloMats[i])
      mesh.position.copy(pos)
      group.add(mesh)
    })

    // ── Helix backbone lines
    for (let i = 0; i < N - 1; i++) {
      group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([hPositions[i].clone(), hPositions[i+1].clone()]),
        new THREE.LineBasicMaterial({ color: '#4f46e5', transparent: true, opacity: 0.22 })
      ))
    }

    // ── Cross rungs (node → central axis)
    for (let i = 0; i < N; i++) {
      group.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          hPositions[i].clone(),
          new THREE.Vector3(0, hPositions[i].y, 0),
        ]),
        new THREE.LineBasicMaterial({ color: '#312e81', transparent: true, opacity: 0.18 })
      ))
    }

    // ── Vertical spine
    group.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, -HELIX_H / 2 - 0.4, 0),
        new THREE.Vector3(0,  HELIX_H / 2 + 0.4, 0),
      ]),
      new THREE.LineBasicMaterial({ color: '#1e1b4b', transparent: true, opacity: 0.45 })
    ))

    // ── Orbit rings (world-space so they don't spin with the group)
    function makeRing(radius, tube) {
      return new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 8, 64),
        new THREE.MeshBasicMaterial({ color: '#FF2D78', transparent: true, opacity: 0.72 })
      )
    }
    const ring1 = makeRing(0.46, 0.008)
    const ring2 = makeRing(0.33, 0.005)
    scene.add(ring1, ring2)

    // ── Background particles
    const BG = 380
    const bgBuf = new Float32Array(BG * 3)
    for (let i = 0; i < BG; i++) {
      bgBuf[i*3]   = (Math.random() - 0.5) * 10
      bgBuf[i*3+1] = (Math.random() - 0.5) * 10
      bgBuf[i*3+2] = (Math.random() - 0.5) * 10
    }
    const bgGeo = new THREE.BufferGeometry()
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgBuf, 3))
    scene.add(new THREE.Points(bgGeo,
      new THREE.PointsMaterial({ color: '#fff', size: 0.022, transparent: true, opacity: 0.13 })
    ))

    // ── Pre-allocated vectors
    const tgtCamPos      = new THREE.Vector3()
    const tgtLookAt      = new THREE.Vector3()
    const activeWorldPos = new THREE.Vector3()
    const rotEuler       = new THREE.Euler()
    const tgtColor       = new THREE.Color()

    // ── Scroll → stage
    function onScroll() {
      const rect       = sec.getBoundingClientRect()
      const scrollable = sec.offsetHeight - window.innerHeight
      if (scrollable <= 0) return
      const progress = Math.max(0, Math.min(1, -rect.top / scrollable))
      const stage    = Math.min(N - 1, Math.floor(progress * N))
      if (stage !== stageRef.current) {
        stageRef.current = stage
        setActiveIdx(stage)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    // ── Resize
    function onResize() {
      const w = el.offsetWidth  || window.innerWidth / 2
      const h = el.offsetHeight || window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)
    // Fire once after first paint to catch late flex layout
    requestAnimationFrame(onResize)

    // ── Pause when off-screen
    let visible = false
    const observer = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 })
    observer.observe(sec)

    let raf, autoRot = 0, ringRot = 0

    function tick() {
      raf = requestAnimationFrame(tick)
      if (!visible) return

      autoRot += 0.003
      ringRot  += 0.013
      group.rotation.y = autoRot

      const ai = stageRef.current
      rotEuler.set(0, autoRot, 0)
      activeWorldPos.copy(hPositions[ai]).applyEuler(rotEuler)

      // Camera drifts toward active node height
      const ty = activeWorldPos.y * 0.55
      tgtCamPos.set(3.8, ty + 0.35, 3.8)
      tgtLookAt.set(0, ty, 0)
      camera.position.lerp(tgtCamPos, 0.025)
      camera.lookAt(tgtLookAt.x, tgtLookAt.y, tgtLookAt.z)

      // Node appearance
      for (let i = 0; i < N; i++) {
        const active = i === ai
        tgtColor.set(active ? STAGE_COLORS[ai] : '#4f46e5')
        nodeMats[i].color.lerp(tgtColor, 0.07)
        nodeMats[i].opacity   += ((active ? 1.0 : 0.5) - nodeMats[i].opacity)   * 0.07
        haloMats[i].opacity   += ((active ? 0.13 : 0)  - haloMats[i].opacity)   * 0.07
        const ts = active ? 2.0 : 1.0
        nodes[i].scale.x += (ts - nodes[i].scale.x) * 0.07
        nodes[i].scale.y  = nodes[i].scale.z = nodes[i].scale.x
      }

      // Orbit rings track active node
      ring1.material.color.set(STAGE_COLORS[ai])
      ring2.material.color.set(STAGE_COLORS[ai])
      ring1.position.copy(activeWorldPos)
      ring1.rotation.y = ringRot
      ring1.rotation.z = ringRot * 0.32
      ring2.position.copy(activeWorldPos)
      ring2.rotation.y = -ringRot * 0.55
      ring2.rotation.x = Math.PI * 0.38

      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  const item = TIMELINE[activeIdx]
  const hex  = STAGE_COLORS[activeIdx]

  return (
    <>
      <style>{`
        @keyframes helixIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 720px) {
          .helix-wrap  { flex-direction: column !important; }
          .helix-left  { flex: none !important; height: 52vh !important; }
          .helix-right { flex: none !important; height: 48vh !important; padding: 28px 28px !important; }
        }
      `}</style>

      <div ref={sectionRef} style={{ height: `${N * 100}vh`, position: 'relative' }}>
        <div className="helix-wrap" style={{
          position: 'sticky', top: 0, height: '100vh',
          display: 'flex', background: '#04010f', overflow: 'hidden',
        }}>

          {/* ── 3D canvas */}
          <div className="helix-left" style={{ flex: 1, position: 'relative' }}>
            <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
          </div>

          {/* ── Text panel */}
          <div className="helix-right" style={{
            flex: 1, position: 'relative',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: '48px 60px',
            borderLeft: '1px solid rgba(255,255,255,0.055)',
          }}>

            {/* Progress pips */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
              {TIMELINE.map((_, i) => (
                <div key={i} style={{
                  height: 3, borderRadius: 2,
                  width: i === activeIdx ? 24 : 4,
                  background: i === activeIdx ? hex : 'rgba(255,255,255,0.13)',
                  transition: 'width 0.4s ease, background 0.4s ease',
                }} />
              ))}
            </div>

            {/* Animated content */}
            <div key={activeIdx} style={{ animation: 'helixIn 0.42s cubic-bezier(0.22,1,0.36,1) both' }}>
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.13em',
                textTransform: 'uppercase', color: hex, marginBottom: 12,
              }}>
                {String(activeIdx + 1).padStart(2, '0')} of {String(N).padStart(2, '0')} · Built in public
              </div>
              <div style={{
                fontSize: 'clamp(26px, 4vw, 46px)', fontWeight: 700,
                letterSpacing: '-1.5px', color: '#ffffff', marginBottom: 22,
                textShadow: `0 0 48px ${hex}44`,
              }}>
                {item.when}
              </div>
              <p style={{
                fontSize: 16, color: 'rgba(255,255,255,0.6)',
                fontWeight: 300, lineHeight: 1.82,
                maxWidth: 380, margin: 0,
              }}>
                {item.what}
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
