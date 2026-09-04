import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, ContactShadows, RoundedBox, Sparkles, Html, useProgress } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Suspense, useRef, useState, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MacOSDesktop from './MacOSDesktop'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

/* ===== Shared scroll progress + mouse pos refs ===== */
const scrollProgress = { current: 0 }
const mousePos = { x: 0, y: 0 }

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div style={{ color: '#fff', fontFamily: 'monospace', fontSize: '0.9rem' }}>
        Loading {progress.toFixed(0)}%
      </div>
    </Html>
  )
}

/* ===== Terminal Screen — dynamic canvas texture ===== */
function TerminalScreen({ screenRef }) {
  const canvasRef = useRef(null)
  const textureRef = useRef(null)
  const stateRef = useRef({
    charIndex: 0,
    lineIndex: 0,
    lastCharTime: 0,
    lineCompleteTime: 0,
    isLineComplete: false,
    restartTime: 0,
  })

  const lines = [
    '> INITIALIZING CREATIVE OS...',
    '> LOADING ARCHIVE MODULES...',
    '> [OK] Films — 6 works loaded',
    '> [OK] Concepts — 3 projects loaded',
    '> [OK] AI Lab — 4 stages loaded',
    '> [OK] Visual — 10 works loaded',
    '> WELCOME, 刘怡彤 SUNNY',
    '> READY.',
  ]

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 640
    canvasRef.current = canvas

    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    textureRef.current = texture

    return () => { texture.dispose() }
  }, [])

  useFrame((state) => {
    const canvas = canvasRef.current
    const texture = textureRef.current
    const screen = screenRef.current
    if (!canvas || !texture || !screen) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const t = state.clock.elapsedTime
    const s = stateRef.current

    // Typewriter — type one char every 0.04s
    if (s.lineIndex < lines.length) {
      if (!s.isLineComplete) {
        if (t - s.lastCharTime > 0.04) {
          s.lastCharTime = t
          s.charIndex++
          if (s.charIndex >= lines[s.lineIndex].length) {
            s.isLineComplete = true
            s.lineCompleteTime = t
          }
        }
      } else {
        if (t - s.lineCompleteTime > 0.3) {
          s.lineIndex++
          s.charIndex = 0
          s.isLineComplete = false
          s.lastCharTime = t
        }
      }
    } else {
      if (s.restartTime === 0) s.restartTime = t
      if (t - s.restartTime > 3) {
        s.lineIndex = 0
        s.charIndex = 0
        s.isLineComplete = false
        s.lastCharTime = t
        s.restartTime = 0
      }
    }

    // === Draw terminal ===
    ctx.fillStyle = '#080c14'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Scanlines — CRT retro filter
    for (let y = 0; y < canvas.height; y += 3) {
      ctx.fillStyle = `rgba(0, 255, 170, ${y % 6 === 0 ? 0.05 : 0.025})`
      ctx.fillRect(0, y, canvas.width, 1)
    }

    // Terminal text with glow
    ctx.font = 'bold 22px "Courier New", monospace'
    ctx.shadowBlur = 12

    const lineHeight = 36
    const startY = 50
    const startX = 35

    for (let i = 0; i <= s.lineIndex && i < lines.length; i++) {
      const text = (i === s.lineIndex && !s.isLineComplete)
        ? lines[i].substring(0, s.charIndex)
        : lines[i]

      if (lines[i].includes('[OK]')) {
        ctx.fillStyle = '#00ff88'
        ctx.shadowColor = '#00ff88'
      } else if (lines[i].includes('WELCOME')) {
        ctx.fillStyle = '#88ddff'
        ctx.shadowColor = '#88ddff'
      } else if (lines[i].includes('READY')) {
        ctx.fillStyle = '#ffff88'
        ctx.shadowColor = '#ffff88'
      } else {
        ctx.fillStyle = '#00ffaa'
        ctx.shadowColor = '#00ffaa'
      }
      ctx.fillText(text, startX, startY + i * lineHeight)
    }

    // Blinking cursor
    if (s.lineIndex >= lines.length - 1 && s.isLineComplete) {
      const blink = Math.sin(t * 4) > 0
      if (blink) {
        const cursorY = startY + (lines.length - 1) * lineHeight
        ctx.fillStyle = '#00ffaa'
        ctx.shadowColor = '#00ffaa'
        ctx.shadowBlur = 10
        ctx.fillRect(startX + 8, cursorY - 18, 12, 22)
      }
    }

    ctx.shadowBlur = 0

    // CRT vignette
    const grad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 100,
      canvas.width / 2, canvas.height / 2, canvas.width * 0.6
    )
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(1, 'rgba(0,0,0,0.5)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    texture.needsUpdate = true

    // Apply texture to screen material
    const mat = screen.material
    if (!mat.map) {
      mat.map = texture
      mat.emissiveMap = texture
      mat.emissive = new THREE.Color('#ffffff')
      mat.color = new THREE.Color('#ffffff')
    }
  })

  return null
}

/* ===== Retro Computer Model ===== */
function RetroComputer() {
  const groupRef = useRef()
  const screenRef = useRef()
  const screenGlowRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const sp = scrollProgress.current

    if (groupRef.current) {
      const targetRotY = mousePos.x * 0.15 * (1 - sp * 0.6)
      const targetRotX = -mousePos.y * 0.1 * (1 - sp * 0.6)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.08)
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.08)
    }

    if (screenRef.current) {
      const baseGlow = 0.8 + Math.sin(t * 0.8) * 0.15
      const scrollBoost = sp * sp * 2.5
      screenRef.current.material.emissiveIntensity = baseGlow + scrollBoost
    }
    if (screenGlowRef.current) {
      screenGlowRef.current.material.opacity = 0.06 + sp * sp * 0.4
    }
  })

  const bodyMaterial = (
    <meshPhysicalMaterial
      color="#d4d4d8"
      roughness={0.2}
      metalness={0.1}
      clearcoat={0.5}
      clearcoatRoughness={0.3}
      sheen={0.3}
      sheenColor="#f0f0f0"
    />
  )

  const accentMaterial = (
    <meshPhysicalMaterial
      color="#3a3a3c"
      roughness={0.3}
      metalness={0.4}
      clearcoat={0.8}
      clearcoatRoughness={0.2}
    />
  )

  return (
    <group ref={groupRef} position={[0, -1.92, -0.264]} scale={1.2}>
      {/* Monitor body */}
      <RoundedBox args={[3.2, 2.2, 0.35]} radius={0.08} smoothness={8} position={[0, 1.6, 0]}>
        {bodyMaterial}
      </RoundedBox>

      {/* Screen bezel */}
      <RoundedBox args={[2.9, 1.9, 0.05]} radius={0.04} smoothness={6} position={[0, 1.6, 0.18]}>
        <meshPhysicalMaterial color="#1a1a1c" roughness={0.15} metalness={0.3} />
      </RoundedBox>

      {/* Screen — terminal canvas texture */}
      <mesh ref={screenRef} position={[0, 1.6, 0.22]}>
        <planeGeometry args={[2.7, 1.7]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0}
          toneMapped={false}
        />
      </mesh>

      {/* Screen glow overlay */}
      <mesh ref={screenGlowRef} position={[0, 1.6, 0.221]}>
        <planeGeometry args={[3.2, 2.2]} />
        <meshBasicMaterial color="#4a9eff" transparent opacity={0.06} toneMapped={false} />
      </mesh>

      <TerminalScreen screenRef={screenRef} />

      {/* Monitor stand - neck */}
      <RoundedBox args={[0.35, 0.6, 0.2]} radius={0.06} smoothness={6} position={[0, 0.75, 0]}>
        {accentMaterial}
      </RoundedBox>

      {/* Monitor stand - base plate */}
      <RoundedBox args={[1.8, 0.12, 1.0]} radius={0.05} smoothness={6} position={[0, 0.42, -0.1]}>
        {accentMaterial}
      </RoundedBox>

      {/* Keyboard */}
      <RoundedBox args={[4.0, 0.2, 1.4]} radius={0.06} smoothness={8} position={[0, 0.15, 0.9]} rotation={[-0.08, 0, 0]}>
        {bodyMaterial}
      </RoundedBox>

      {/* Keyboard keys */}
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 14 }).map((_, col) => (
          <RoundedBox
            key={`key-${row}-${col}`}
            args={[0.22, 0.06, 0.22]}
            radius={0.02}
            smoothness={4}
            position={[-1.5 + col * 0.24, 0.26, 0.45 + row * 0.26]}
            rotation={[-0.08, 0, 0]}
          >
            <meshPhysicalMaterial color="#e8e8ec" roughness={0.25} metalness={0.05} clearcoat={0.3} />
          </RoundedBox>
        ))
      )}

      {/* Trackpad */}
      <RoundedBox args={[1.2, 0.03, 0.7]} radius={0.02} smoothness={6} position={[0, 0.26, 1.65]} rotation={[-0.08, 0, 0]}>
        <meshPhysicalMaterial color="#c4c4c8" roughness={0.15} metalness={0.1} clearcoat={0.6} />
      </RoundedBox>

      {/* Power LED */}
      <mesh position={[1.2, 0.28, 0.9]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </group>
  )
}

/* ===== Hill Base ===== */
function HillBase() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.9, 0]} receiveShadow>
      <circleGeometry args={[8, 64]} />
      <meshStandardMaterial color="#1e1e2e" roughness={0.7} metalness={0.1} />
    </mesh>
  )
}

/* ===== Scroll-driven Camera Rig — Z-axis zoom + mouse parallax ===== */
function CameraRig() {
  const { camera } = useThree()
  const smoothedProgress = useRef(0)

  // Manual mouse tracking — more reliable than state.pointer
  useEffect(() => {
    const onMouseMove = (e) => {
      // Normalize to -1..1
      mousePos.x = (e.clientX / window.innerWidth) * 2 - 1
      mousePos.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  useFrame(() => {
    const sp = scrollProgress.current
    // Smooth lerp the progress value
    smoothedProgress.current += (sp - smoothedProgress.current) * 0.08

    const p = smoothedProgress.current

    // Eased progression for cinematic feel
    const easedP = p < 0.5
      ? 2 * p * p
      : 1 - Math.pow(-2 * p + 2, 2) / 2

    // Pure Z-axis movement: 6 → 0.8
    const startZ = 6
    const endZ = 0.8
    const targetZ = startZ - (startZ - endZ) * easedP

    // Mouse parallax — subtle, fades as we zoom in
    const parallaxStrength = 0.3 * (1 - p * 0.7)
    const targetX = mousePos.x * parallaxStrength
    const targetY = mousePos.y * parallaxStrength * 0.5

    // Smooth lerp X, Y, Z
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.06)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.06)
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.12)

    // Always look at origin (screen center)
    camera.lookAt(0, 0, 0)
  })

  return null
}

/* ===== Dynamic Bloom Controller ===== */
function BloomController({ bloomRef }) {
  useFrame(() => {
    if (bloomRef.current) {
      const p = scrollProgress.current
      // Bloom intensity: 0.6 → 3.5 as camera approaches/enters screen
      const intensity = 0.6 + p * p * 2.9
      bloomRef.current.intensity = intensity
      // Lower threshold so more of the screen glow triggers bloom
      bloomRef.current.luminanceThreshold = 0.2 - p * 0.15
    }
  })
  return null
}

/* ===== 3D Scene ===== */
function Scene({ bloomRef }) {
  return (
    <>
      <Environment preset="city" background={false} />

      {/* Main directional light */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
      >
        <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10, 0.1, 50]} />
      </directionalLight>

      {/* Warm rim light */}
      <pointLight position={[-4, 3, -3]} intensity={3} color="#ffaa66" distance={20} decay={2} />

      {/* Cool ambient */}
      <ambientLight intensity={0.3} color="#6688cc" />

      {/* Fill light */}
      <pointLight position={[3, 2, 4]} intensity={0.5} color="#88aaff" distance={15} decay={2} />

      <RetroComputer />

      <HillBase />

      <ContactShadows
        position={[0, -1.86, 0.8]}
        opacity={0.5}
        scale={12}
        blur={2.5}
        far={4}
        color="#000000"
      />

      <Sparkles count={300} scale={12} size={2} speed={0.3} opacity={0.6} color="#88ccff" />

      <CameraRig />
      <BloomController bloomRef={bloomRef} />
    </>
  )
}

/* ===== Main App ===== */
function App() {
  const bloomRef = useRef()
  const heroRef = useRef()
  const [scrollPct, setScrollPct] = useState(0)

  useEffect(() => {
    // Reset scroll progress on mount (prevents HMR stale state)
    scrollProgress.current = 0

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: 'top top',
        end: '+=200%',
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          scrollProgress.current = self.progress
          setScrollPct(self.progress)
        },
        scrub: 1,
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  // Hero overlay opacity: fade out in first 25% of scroll
  const heroOverlayOpacity = Math.max(0, 1 - scrollPct * 4)

  // About section opacity: fade in at 75%+
  const aboutOpacity = Math.max(0, (scrollPct - 0.75) * 4)

  // macOS desktop fades in at 85%+ scroll
  const macDesktopVisible = scrollPct > 0.85

  return (
    <div className="app">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        camera={{ position: [0, 0, 6], fov: 45 }}
      >
        <color attach="background" args={['#0a0a14']} />
        <fog attach="fog" args={['#0a0a14', 8, 25]} />

        <Suspense fallback={<Loader />}>
          <Scene bloomRef={bloomRef} />
        </Suspense>

        <EffectComposer>
          <Bloom
            ref={bloomRef}
            intensity={0.6}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette eskil={false} offset={0.3} darkness={0.6} />
        </EffectComposer>
      </Canvas>

      {/* Pinned Hero Section */}
      <div className="hero-pinned" ref={heroRef}>
        {/* Nav */}
        <div className="nav-bar" style={{ opacity: heroOverlayOpacity }}>
          <span className="nav-brand">刘怡彤Sunny</span>
        </div>

        {/* Hero text */}
        <div className="hero-text" style={{ opacity: heroOverlayOpacity }}>
          <div className="hero-eyebrow">CREATIVE ARCHIVE / 01</div>
          <h1 className="hero-title">
            I CREATE<br />WORLDS.
          </h1>
          <p className="hero-subtitle">
            通过影像、人工智能和叙事，<br />创造新的视觉体验。
          </p>
        </div>

        {/* Scroll hint - mouse scroll icon */}
        <div className="scroll-hint" style={{ opacity: Math.max(0, 1 - scrollPct * 10) }}>
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span>滚动以进入</span>
        </div>

        {/* Screen immersion overlay - blue glow when entering screen */}
        <div
          className="screen-immersion"
          style={{
            opacity: Math.max(0, (scrollPct - 0.6) * 2.5),
          }}
        />

        {/* macOS Desktop — fades in when camera enters screen */}
        <MacOSDesktop visible={macDesktopVisible} />
      </div>
    </div>
  )
}

export default App
