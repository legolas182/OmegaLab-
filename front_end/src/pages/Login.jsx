import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
<<<<<<< HEAD
import Orb from '../components/Orb'
=======
>>>>>>> origin/main

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
<<<<<<< HEAD
  const [hue, setHue] = useState(0)
=======
>>>>>>> origin/main
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

<<<<<<< HEAD
  const handleNewBackground = () => {
    setHue(Math.random() * 360)
  }

  return (
    <div className="relative flex h-screen w-full flex-col bg-[#0f1923] overflow-hidden">
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a2332]/80 backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2ZM11.9999 12.88L5.5 9.43999L6.49997 8.86001L11.9999 12.01L17.5 8.86001L18.5 9.43999L11.9999 12.88ZM12 4.33L19.5 8.5L12 12.67L4.5 8.5L12 4.33ZM4 15.67V9.6L11.5 13.83V19.89L4 15.67ZM13.5 19.89V13.83L21 9.6V15.67L13.5 19.89Z" />
            </svg>
            <span className="text-white text-sm font-medium">OMEGA LAB</span>
          </div>
        </div>
      </header>

      {/* Orb Container with Login inside */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full max-w-5xl max-h-[900px]">
          <Orb
            hoverIntensity={0.6}
            rotateOnHover={true}
            hue={hue}
            forceHoverState={false}
          >
            {/* Login Panel - Inside Orb */}
            <div className="flex flex-col items-center gap-6 rounded-2xl p-8 max-w-md w-full">
              {/* Main Title */}
              <div className="flex flex-col items-center gap-3 text-center">
                <h1 className="text-4xl font-bold text-white leading-tight">
                  Bienvenido a OMEGA LAB
                </h1>
                <p className="text-white/60 text-base">
                  Sistema PLM/LIMS - Accede a tu espacio de trabajo
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="w-full space-y-4 mt-2">
                {error && (
                  <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-400 text-lg">error</span>
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <label className="flex flex-col">
                  <p className="pb-2 text-sm font-medium text-white/90">Email</p>
                  <input
                    type="email"
                    className="h-12 w-full rounded-lg border border-white/10 bg-[#0f1923]/60 backdrop-blur-sm p-4 text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    placeholder="Introduce tu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </label>

                <label className="flex flex-col">
                  <div className="flex items-baseline justify-between pb-2">
                    <p className="text-sm font-medium text-white/90">Contraseña</p>
                    <a className="text-sm text-primary hover:underline transition-colors" href="#">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <div className="relative flex w-full items-stretch">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="h-12 w-full rounded-lg border border-white/10 bg-[#0f1923]/60 backdrop-blur-sm p-4 pr-12 text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      placeholder="Introduce tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-white/60 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </label>

                {/* Action Buttons */}
                <div className="flex w-full pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 flex items-center justify-center rounded-lg bg-white text-[#0f1923] font-semibold transition-all hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⏳</span>
                        Iniciando...
                      </span>
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </Orb>
        </div>
      </div>

      {/* New Background Button - Bottom Right */}
      <div className="absolute bottom-6 right-6 z-20">
        <button
          type="button"
          onClick={handleNewBackground}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a2332]/80 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all group"
        >
          <svg className="h-4 w-4 text-white/70 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-white/70 group-hover:text-white text-sm font-medium transition-colors">Nuevo Fondo</span>
        </button>
=======
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-dark overflow-x-hidden items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-xl bg-card-dark p-6 shadow-2xl md:p-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-primary/20 rounded-full size-16 flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-primary text-4xl">science</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-light">Bienvenido a PROSCIENCE LAB</h1>
          <p className="text-base text-text-muted">Sistema PLM/LIMS - Accede a tu espacio de trabajo</p>
        </div>

        <form onSubmit={handleLogin} className="w-full space-y-4">
          {error && (
            <div className="rounded-lg bg-danger/20 border border-danger/50 p-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-danger">error</span>
              <p className="text-danger text-sm">{error}</p>
            </div>
          )}

          <label className="flex flex-col">
            <p className="pb-2 text-sm font-medium text-text-light">Email</p>
            <input
              type="email"
              className="form-input h-12 w-full flex-1 resize-none overflow-hidden rounded-lg border-none bg-input-dark p-4 text-base font-normal leading-normal text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
              placeholder="Introduce tu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <label className="flex flex-col">
            <div className="flex items-baseline justify-between pb-2">
              <p className="text-sm font-medium text-text-light">Contraseña</p>
              <a className="text-sm text-primary hover:underline" href="#">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="relative flex w-full items-stretch">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input h-12 w-full flex-1 resize-none overflow-hidden rounded-lg border-none bg-input-dark p-4 pr-12 text-base font-normal leading-normal text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
                placeholder="Introduce tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-text-muted hover:text-primary"
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </label>

          <div className="flex w-full flex-col gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-card-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center rounded-lg border border-primary/40 bg-transparent px-6 text-base font-semibold text-primary transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-card-dark"
            >
              Crear Cuenta
            </button>
          </div>
        </form>
>>>>>>> origin/main
      </div>
    </div>
  )
}

export default Login

