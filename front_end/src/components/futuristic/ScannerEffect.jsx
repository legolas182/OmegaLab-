import { useRef, useMemo, memo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import scanVertex from './shaders/scanVertex.glsl?raw'
import scanFragment from './shaders/scanFragment.glsl?raw'

const DEFAULT_COLOR = new THREE.Color('#00e5ff')

function ScannerEffectInner() {
  const meshRef = useRef(null)
  const { viewport } = useThree()
  const scaleX = viewport.width * 1.1
  const scaleY = viewport.height * 1.1

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0.65 },
      uColor: { value: DEFAULT_COLOR },
    }),
    []
  )

  useFrame((_, delta) => {
    if (!meshRef.current?.uniforms) return
    meshRef.current.uniforms.uTime.value += delta
  })

  return (
    <mesh position={[0, 0, 0.5]} scale={[scaleX, scaleY, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={meshRef}
        vertexShader={scanVertex}
        fragmentShader={scanFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

export default memo(ScannerEffectInner)
