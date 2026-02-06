import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

const STORAGE_KEY = 'omega-lab-theme'

const THEME_VARS = {
  dark: {
    '--bg-body': '#0f1923',
    '--bg-card': '#16222e',
    '--bg-input': '#20364b',
    '--text-primary': '#EAEAEA',
    '--text-muted': '#8dadce',
    '--border-color': '#2e4d6b',
    '--scrollbar-track': '#16222e',
    '--scrollbar-thumb': '#2e4d6b',
    '--scrollbar-thumb-hover': '#3a5f7f',
  },
  light: {
    '--bg-body': '#f5f7f8',
    '--bg-card': '#ffffff',
    '--bg-input': '#e8eef3',
    '--text-primary': '#1a1a2e',
    '--text-muted': '#64748b',
    '--border-color': '#cbd5e1',
    '--scrollbar-track': '#e2e8f0',
    '--scrollbar-thumb': '#94a3b8',
    '--scrollbar-thumb-hover': '#64748b',
  },
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    return localStorage.getItem(STORAGE_KEY) || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className="min-h-screen" style={THEME_VARS[theme]}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
