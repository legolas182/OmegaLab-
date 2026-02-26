import { createContext, useContext, useMemo, useState, useCallback } from 'react'

const VisualSystemContext = createContext(null)

const DEFAULT_CONFIG = {
  glowIntensity: 1.0,
  gridIntensity: 0.6,
  particlesIntensity: 0.8,
  scanIntensity: 0.7,
  borderGlowIntensity: 1.0,
  colorPrimary: '#00e5ff',
  colorSecondary: '#a855f7',
  colorAccent: '#00ffa3',
  animationSpeed: 1.0,
  scanSpeed: 1.0,
  reducedMotion: false,
  cursorGlowEnabled: true,
  enabled: {
    grid: true,
    particles: true,
    scanner: true,
  },
}

export function VisualSystemProvider({ children, overrides = {} }) {
  const [config, setConfig] = useState(() => ({ ...DEFAULT_CONFIG, ...overrides }))

  const setVisualConfig = useCallback((next) => {
    setConfig((c) => (typeof next === 'function' ? next(c) : { ...c, ...next }))
  }, [])

  const value = useMemo(
    () => ({
      ...config,
      setVisualConfig,
    }),
    [config, setVisualConfig]
  )

  return (
    <VisualSystemContext.Provider value={value}>
      {children}
    </VisualSystemContext.Provider>
  )
}

export function useVisualSystem() {
  const ctx = useContext(VisualSystemContext)
  if (!ctx) {
    throw new Error('useVisualSystem must be used within VisualSystemProvider')
  }
  return ctx
}

export { VisualSystemContext }
export default VisualSystemProvider
