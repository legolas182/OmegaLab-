import { useRef, useEffect, memo } from 'react'
import { useVisualSystem } from './VisualSystemProvider'

function EnergyCursor() {
  const elRef = useRef(null)
  const { cursorGlowEnabled } = useVisualSystem()

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const onMove = (e) => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  if (!cursorGlowEnabled) return null

  return (
    <div
      ref={elRef}
      className="energy-cursor"
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: 120,
        height: 120,
        marginLeft: -60,
        marginTop: -60,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}

export default memo(EnergyCursor)
