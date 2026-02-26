import { useRef, useMemo, memo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { globalMouseRef } from './visualRefs'

import gridVertex from './shaders/gridVertex.glsl?raw'
import gridFragment from './shaders/gridFragment.glsl?raw'

const DEFAULT_COLOR = new THREE.Color('#00e5ff')

function EnergyGridInner() {
  const meshRef = useRef(null)
  const { viewport } = useThree()
  const scaleX = viewport.width * 1.2
  const scaleY = viewport.height * 1.2

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uIntensity: { value: 0.55 },
      uColor: { value: DEFAULT_COLOR },
    }),
    []
  )

  useFrame((_, delta) => {
    if (!meshRef.current?.uniforms) return
    const u = meshRef.current.uniforms
    u.uTime.value += delta
    u.uMouse.value.set(globalMouseRef.current.x, globalMouseRef.current.y)
  })

  return (
    <mesh position={[0, 0, -0.5]} scale={[scaleX, scaleY, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={meshRef}
        vertexShader={gridVertex}
        fragmentShader={gridFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

export default memo(EnergyGridInner)
