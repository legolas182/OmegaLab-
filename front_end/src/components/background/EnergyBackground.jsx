import { useRef, useMemo, Suspense, memo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

import vertexShader from './shaders/waveVertex.glsl?raw'
import fragmentShader from './shaders/waveFragment.glsl?raw'
import { globalMouseRef } from '../futuristic/visualRefs'
import EnergyGrid from '../futuristic/EnergyGrid'
import EnergyParticles from '../futuristic/EnergyParticles'
import ScannerEffect from '../futuristic/ScannerEffect'

// Colores neon: púrpura, azul, verde (laboratorio / nebulosa digital)
const COLORS = {
  purple: new THREE.Color('#a855f7'),
  blue: new THREE.Color('#00e5ff'),
  green: new THREE.Color('#00ffa3'),
}

// Parámetros base (mouse modula con easing)
const BASE_AMPLITUDE = 0.18
const BASE_FREQUENCY = 1.2
const BASE_INTENSITY = 1.15
const MOUSE_AMPLITUDE_FACTOR = 0.7
const MOUSE_INTENSITY_FACTOR = 0.5
const EASING = 0.08

// Bloom: máxima nitidez, glow solo en lo muy brillante (translucidez visible)
const BLOOM = {
  intensity: 1.1,
  luminanceThreshold: 0.55,
  luminanceSmoothing: 0.3,
  radius: 0.22,
}

// Plane gigante: muchos segmentos para deformación orgánica suave
const SEGMENTS_X = 120
const SEGMENTS_Y = 80

// Easing suave (lerp)
function lerp(a, b, t) {
  return a + (b - a) * Math.min(1, t)
}

const EnergyWave = memo(function EnergyWave() {
  const materialRef = useRef(null)
  const { viewport } = useThree()
  const mouseTarget = useRef({ x: 0.5, y: 0.5 })
  const mouseSmooth = useRef({ x: 0.5, y: 0.5 })
  const ampSmooth = useRef(BASE_AMPLITUDE)
  const intensitySmooth = useRef(BASE_INTENSITY)

  // Tamaño reducido: banda horizontal contenida (ilusión translúcida sobre el fondo)
  const scaleX = viewport.width * 0.62
  const scaleY = viewport.height * 0.42

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uAmplitude: { value: BASE_AMPLITUDE },
      uFrequency: { value: BASE_FREQUENCY },
      uIntensity: { value: BASE_INTENSITY },
      uColorPurple: { value: COLORS.purple },
      uColorBlue: { value: COLORS.blue },
      uColorGreen: { value: COLORS.green },
    }),
    []
  )

  useEffect(() => {
    const onMove = (e) => {
      mouseTarget.current.x = e.clientX / window.innerWidth
      mouseTarget.current.y = 1.0 - e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame((_, delta) => {
    if (!materialRef.current?.uniforms) return
    const u = materialRef.current.uniforms

    // Easing del mouse
    mouseSmooth.current.x = lerp(mouseSmooth.current.x, mouseTarget.current.x, EASING)
    mouseSmooth.current.y = lerp(mouseSmooth.current.y, mouseTarget.current.y, EASING)
    globalMouseRef.current.x = mouseSmooth.current.x
    globalMouseRef.current.y = mouseSmooth.current.y
    u.uTime.value += delta
    u.uMouse.value.set(mouseSmooth.current.x, mouseSmooth.current.y)
    u.uResolution.value.set(window.innerWidth, window.innerHeight)

    // Amplitud e intensidad reactivas al mouse (más actividad en centro de pantalla)
    const mx = mouseSmooth.current.x
    const my = mouseSmooth.current.y
    const distFromCenter = Math.hypot(mx - 0.5, my - 0.5)
    const react = 1.0 - distFromCenter * 1.2
    const targetAmp = BASE_AMPLITUDE + Math.max(0, react) * MOUSE_AMPLITUDE_FACTOR
    const targetInt = BASE_INTENSITY + Math.max(0, react) * MOUSE_INTENSITY_FACTOR
    ampSmooth.current = lerp(ampSmooth.current, targetAmp, EASING)
    intensitySmooth.current = lerp(intensitySmooth.current, targetInt, EASING)
    u.uAmplitude.value = ampSmooth.current
    u.uIntensity.value = intensitySmooth.current
  })

  return (
    <mesh position={[0, 0, 0]} scale={[scaleX, scaleY, 1]}>
      <planeGeometry args={[1, 1, SEGMENTS_X, SEGMENTS_Y]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
})

function Scene() {
  return (
    <>
      <color attach="background" args={['#050a12']} />
      <fog attach="fog" args={['#050a12', 3, 80]} />
      <EnergyWave />
      <EnergyGrid />
      <EnergyParticles />
      <ScannerEffect />
      {/* Postprocessing: Bloom controlado (nitidez alta, sin blur excesivo). Opcional: color grading vía LUT. */}
      <EffectComposer multisampling={0} stencilBuffer={false}>
        <Bloom
          intensity={BLOOM.intensity}
          luminanceThreshold={BLOOM.luminanceThreshold}
          luminanceSmoothing={BLOOM.luminanceSmoothing}
          mipmapBlur
          radius={BLOOM.radius}
        />
      </EffectComposer>
    </>
  )
}

function EnergyBackground() {
  return (
    <div className="energy-bg" aria-hidden="true">
      <Canvas
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        camera={{ position: [0, 0, 6], fov: 60, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        frameloop="always"
        resize={{ scroll: false }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default memo(EnergyBackground)
