import { useRef, useMemo, memo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { globalMouseRef } from './visualRefs'

const COUNT = 180
const DEFAULT_COLOR = new THREE.Color('#00e5ff')

function EnergyParticlesInner() {
  const pointsRef = useRef(null)
  const { viewport } = useThree()

  const positions = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * viewport.width * 1.1
      pos[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 1.1
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    return pos
  }, [viewport.width, viewport.height])

  useFrame((state) => {
    if (!pointsRef.current) return
    const pos = pointsRef.current.geometry.attributes.position.array
    const time = state.clock.elapsedTime
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] += Math.sin(time * 0.2 + i * 0.1) * 0.002
      pos[i * 3 + 1] += Math.cos(time * 0.15 + i * 0.07) * 0.002
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef} position={[0, 0, 0.2]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={DEFAULT_COLOR}
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default memo(EnergyParticlesInner)
