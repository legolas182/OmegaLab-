import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getRoleName, hasAnyRole } from '../utils/rolePermissions'

const Sidebar = ({ isOpen, onToggle, currentPath }) => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Todos los módulos disponibles con colores únicos (sin repetición)
  const allModules = [
    { key: 'dashboard', name: 'Dashboard', icon: 'dashboard', path: '/', roles: ['ADMINISTRADOR'], color: 'primary' },
    { key: 'aprobacion', name: 'Aprobaciones', icon: 'verified', path: '/aprobacion', roles: ['ADMINISTRADOR', 'SUPERVISOR_QA'], color: 'success' },
    { key: 'ia', name: 'IA / Simulación', icon: 'psychology', path: '/ia', roles: ['ADMINISTRADOR', 'SUPERVISOR_QA'], color: 'accent-purple' },
    { key: 'ideas', name: 'Nuevas Fórmulas', icon: 'lightbulb', path: '/ideas', roles: ['ADMINISTRADOR', 'SUPERVISOR_QA', 'ANALISTA_LABORATORIO'], nameForAnalista: 'Asignado', color: 'warning' },
    { key: 'inventario', name: 'Inventario', icon: 'inventory_2', path: '/inventario', roles: ['ADMINISTRADOR', 'SUPERVISOR_QA', 'SUPERVISOR_CALIDAD'], color: 'info' },
    { key: 'produccion', name: 'Producción / Proceso', icon: 'precision_manufacturing', path: '/produccion', roles: ['ADMINISTRADOR', 'SUPERVISOR_CALIDAD'], color: 'accent-teal' },
    { key: 'pruebas', name: 'Pruebas / C. Calidad', icon: 'biotech', path: '/pruebas', roles: ['ADMINISTRADOR', 'ANALISTA_LABORATORIO'], color: 'accent-blue' },
    { key: 'historial', name: 'Historial', icon: 'history', path: '/historial', roles: ['ADMINISTRADOR', 'SUPERVISOR_QA', 'SUPERVISOR_CALIDAD', 'ANALISTA_LABORATORIO'], color: 'accent-amber' },
    { key: 'trazabilidad', name: 'Trazabilidad Lote', icon: 'timeline', path: '/trazabilidad', roles: ['ADMINISTRADOR', 'SUPERVISOR_CALIDAD'], color: 'accent-cyan' },
    { key: 'configuracion', name: 'Configuración', icon: 'settings', path: '/configuracion', roles: ['ADMINISTRADOR'], color: 'text-muted' }
  ]

  // Filtrar módulos según el rol del usuario
  const modules = user ? allModules.filter(module => {
    if (!module.roles || module.roles.length === 0) return true
    return module.roles.some(role => hasAnyRole(user, role))
  }) : []

  const isActive = (path) => {
    if (path === '/') {
      return currentPath === '/'
    }
    return currentPath.startsWith(path)
  }

  return (
    <>
      {isOpen && (
        <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col glass-panel border-r border-border-dark p-4 z-50 hidden lg:flex overflow-hidden">
          <div className="flex flex-col gap-4 h-full min-h-0">
            {/* Logo y Header - icono del proyecto resaltado */}
            <div className="flex items-center gap-3 px-2 py-4 flex-shrink-0">
              <div className="rounded-full size-12 flex items-center justify-center bg-primary/25 ring-2 ring-primary/50 ring-offset-2 ring-offset-card-dark shadow-lg shadow-primary/40">
                <span className="material-symbols-outlined text-primary text-3xl drop-shadow-sm">science</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-text-light text-base font-bold leading-normal">Omega Lab</h1>
                <p className="text-text-muted text-sm font-normal leading-normal">PLM/LIMS System</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
              {modules.map((module) => {
                const displayName = (hasAnyRole(user, 'ANALISTA_LABORATORIO') && module.nameForAnalista) 
                  ? module.nameForAnalista 
                  : module.name
                const active = isActive(module.path)

                // Mismo estilo que modo oscuro: iconos con color y glow en ambos temas
                const iconFigureClasses = {
                  'primary': active ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary/40' : 'bg-primary/15 text-primary group-hover:bg-primary/25 group-hover:scale-105',
                  'success': active ? 'bg-success text-white shadow-lg shadow-success/30 ring-2 ring-success/40' : 'bg-success/15 text-success group-hover:bg-success/25 group-hover:scale-105',
                  'warning': active ? 'bg-warning text-white shadow-lg shadow-warning/30 ring-2 ring-warning/40' : 'bg-warning/15 text-warning group-hover:bg-warning/25 group-hover:scale-105',
                  'info': active ? 'bg-info text-white shadow-lg shadow-info/30 ring-2 ring-info/40' : 'bg-info/15 text-info group-hover:bg-info/25 group-hover:scale-105',
                  'accent-purple': active ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/30 ring-2 ring-accent-purple/40' : 'bg-accent-purple/15 text-accent-purple group-hover:bg-accent-purple/25 group-hover:scale-105',
                  'accent-blue': active ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/30 ring-2 ring-accent-blue/40' : 'bg-accent-blue/15 text-accent-blue group-hover:bg-accent-blue/25 group-hover:scale-105',
                  'accent-teal': active ? 'bg-accent-teal text-white shadow-lg shadow-accent-teal/30 ring-2 ring-accent-teal/40' : 'bg-accent-teal/15 text-accent-teal group-hover:bg-accent-teal/25 group-hover:scale-105',
                  'accent-amber': active ? 'bg-accent-amber text-white shadow-lg shadow-accent-amber/30 ring-2 ring-accent-amber/40' : 'bg-accent-amber/15 text-accent-amber group-hover:bg-accent-amber/25 group-hover:scale-105',
                  'accent-cyan': active ? 'bg-accent-cyan text-white shadow-lg shadow-accent-cyan/30 ring-2 ring-accent-cyan/40' : 'bg-accent-cyan/15 text-accent-cyan group-hover:bg-accent-cyan/25 group-hover:scale-105',
                  'text-muted': active ? 'bg-text-muted text-card-dark shadow-lg ring-2 ring-text-muted/40' : 'bg-border-dark/40 text-text-muted group-hover:bg-border-dark group-hover:text-text-light group-hover:scale-105'
                }
                const figureClass = iconFigureClasses[module.color] || iconFigureClasses['primary']

                const rowBgByColor = { primary: 'bg-primary/10', success: 'bg-success/10', warning: 'bg-warning/10', info: 'bg-info/10', 'accent-purple': 'bg-accent-purple/10', 'accent-blue': 'bg-accent-blue/10', 'accent-teal': 'bg-accent-teal/10', 'accent-amber': 'bg-accent-amber/10', 'accent-cyan': 'bg-accent-cyan/10', 'text-muted': 'bg-border-dark/30' }
                const rowClass = active
                  ? (rowBgByColor[module.color] || 'bg-border-dark/30')
                  : 'text-text-muted hover:bg-border-dark/40 group'

                return (
                  <Link
                    key={module.key}
                    to={module.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${rowClass}`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${figureClass}`}>
                      <span className="material-symbols-outlined text-xl">{module.icon}</span>
                    </div>
                    <p className="text-sm font-medium leading-normal">{displayName}</p>
                  </Link>
                )
              })}
            </nav>

            {/* User Info */}
            {user && (
              <div className="flex-shrink-0 mt-auto mb-2 p-3 rounded-lg bg-input-dark border border-border-dark">
                <p className="text-text-light text-sm font-medium truncate">{user.nombre}</p>
                <p className="text-text-muted text-xs truncate">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-primary/20 text-primary text-xs">
                  {getRoleName(user.rol)}
                </span>
              </div>
            )}

            {/* Footer Actions - mismo estilo que modo oscuro (iconos con color y glow) */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={toggleTheme}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:bg-border-dark/40 transition-all duration-200"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-white/15 text-white shadow-lg shadow-white/25 ring-2 ring-white/30 group-hover:bg-white group-hover:text-gray-900 group-hover:shadow-white/25 group-hover:scale-105'
                      : 'bg-gradient-to-br from-[#4169E1] to-[#1e3a8a] text-white shadow-lg shadow-blue-900/40 ring-2 ring-blue-400/50 group-hover:from-[#5b7cff] group-hover:to-[#2c4aad] group-hover:shadow-blue-800/50 group-hover:scale-105'
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                </div>
                <p className="text-sm font-medium leading-normal">{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</p>
              </button>
              <button className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:bg-border-dark/40 transition-all duration-200">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-info/15 text-info flex items-center justify-center transition-all duration-200 group-hover:bg-info group-hover:text-white group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-info/25">
                  <span className="material-symbols-outlined text-xl">help_outline</span>
                </div>
                <p className="text-sm font-medium leading-normal">Ayuda</p>
              </button>
              <button
                onClick={handleLogout}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:bg-border-dark/40 transition-all duration-200"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-danger/15 text-danger flex items-center justify-center transition-all duration-200 group-hover:bg-danger group-hover:text-white group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-danger/25">
                  <span className="material-symbols-outlined text-xl">logout</span>
                </div>
                <p className="text-sm font-medium leading-normal">Cerrar Sesión</p>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-card-dark border border-border-dark text-text-light"
      >
        <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
      </button>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
          <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col glass-panel border-r border-border-dark p-4 z-50 lg:hidden overflow-hidden">
            <div className="flex flex-col gap-4 h-full min-h-0">
              <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3 px-2 py-4">
                  <div 
                    className="rounded-full size-12 flex items-center justify-center bg-primary/20 ring-2 ring-primary/40 ring-offset-2 ring-offset-card-dark backdrop-blur-sm"
                    style={{ boxShadow: '0 0 24px rgba(0, 127, 255, 0.22), 0 0 48px rgba(0, 127, 255, 0.12), 0 0 72px rgba(0, 127, 255, 0.06)' }}
                  >
                    <span className="material-symbols-outlined text-primary text-3xl" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 127, 255, 0.4))' }}>science</span>
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-text-light text-base font-bold leading-normal">Omega Lab</h1>
                    <p className="text-text-muted text-sm font-normal leading-normal">PLM/LIMS System</p>
                  </div>
                </div>
                <button onClick={onToggle} className="p-2 text-text-muted hover:text-text-light">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <nav className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto">
                {modules.map((module) => {
                  const displayName = (hasAnyRole(user, 'ANALISTA_LABORATORIO') && module.nameForAnalista) 
                    ? module.nameForAnalista 
                    : module.name
                  const active = isActive(module.path)
                  const iconFigureClasses = {
                    'primary': active ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary/40' : 'bg-primary/15 text-primary group-hover:bg-primary/25 group-hover:scale-105',
                    'success': active ? 'bg-success text-white shadow-lg shadow-success/30 ring-2 ring-success/40' : 'bg-success/15 text-success group-hover:bg-success/25 group-hover:scale-105',
                    'warning': active ? 'bg-warning text-white shadow-lg shadow-warning/30 ring-2 ring-warning/40' : 'bg-warning/15 text-warning group-hover:bg-warning/25 group-hover:scale-105',
                    'info': active ? 'bg-info text-white shadow-lg shadow-info/30 ring-2 ring-info/40' : 'bg-info/15 text-info group-hover:bg-info/25 group-hover:scale-105',
                    'accent-purple': active ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/30 ring-2 ring-accent-purple/40' : 'bg-accent-purple/15 text-accent-purple group-hover:bg-accent-purple/25 group-hover:scale-105',
                    'accent-blue': active ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/30 ring-2 ring-accent-blue/40' : 'bg-accent-blue/15 text-accent-blue group-hover:bg-accent-blue/25 group-hover:scale-105',
                    'accent-teal': active ? 'bg-accent-teal text-white shadow-lg shadow-accent-teal/30 ring-2 ring-accent-teal/40' : 'bg-accent-teal/15 text-accent-teal group-hover:bg-accent-teal/25 group-hover:scale-105',
                    'accent-amber': active ? 'bg-accent-amber text-white shadow-lg shadow-accent-amber/30 ring-2 ring-accent-amber/40' : 'bg-accent-amber/15 text-accent-amber group-hover:bg-accent-amber/25 group-hover:scale-105',
                    'accent-cyan': active ? 'bg-accent-cyan text-white shadow-lg shadow-accent-cyan/30 ring-2 ring-accent-cyan/40' : 'bg-accent-cyan/15 text-accent-cyan group-hover:bg-accent-cyan/25 group-hover:scale-105',
                    'text-muted': active ? 'bg-text-muted text-card-dark shadow-lg ring-2 ring-text-muted/40' : 'bg-border-dark/40 text-text-muted group-hover:bg-border-dark group-hover:text-text-light group-hover:scale-105'
                  }
                  const figureClass = iconFigureClasses[module.color] || iconFigureClasses['primary']
                  const rowBgByColor = { primary: 'bg-primary/10', success: 'bg-success/10', warning: 'bg-warning/10', info: 'bg-info/10', 'accent-purple': 'bg-accent-purple/10', 'accent-blue': 'bg-accent-blue/10', 'accent-teal': 'bg-accent-teal/10', 'accent-amber': 'bg-accent-amber/10', 'accent-cyan': 'bg-accent-cyan/10', 'text-muted': 'bg-border-dark/30' }
                  const rowClass = active ? (rowBgByColor[module.color] || 'bg-border-dark/30') : 'text-text-muted hover:bg-border-dark/40 group'
                  return (
                    <Link
                      key={module.key}
                      to={module.path}
                      onClick={onToggle}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${rowClass}`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${figureClass}`}>
                        <span className="material-symbols-outlined text-xl">{module.icon}</span>
                      </div>
                      <p className="text-sm font-medium leading-normal">{displayName}</p>
                    </Link>
                  )
                })}
              </nav>

              {/* User Info */}
              {user && (
                <div className="flex-shrink-0 mt-auto mb-2 p-3 rounded-lg bg-input-dark border border-border-dark">
                  <p className="text-text-light text-sm font-medium truncate">{user.nombre}</p>
                  <p className="text-text-muted text-xs truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-primary/20 text-primary text-xs">
                    {user.rol}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={toggleTheme}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:bg-border-dark/40 transition-all duration-200"
                  title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-white/15 text-white shadow-lg shadow-white/25 ring-2 ring-white/30 group-hover:bg-white group-hover:text-gray-900 group-hover:shadow-white/25 group-hover:scale-105'
                        : 'bg-gradient-to-br from-[#4169E1] to-[#1e3a8a] text-white shadow-lg shadow-blue-900/40 ring-2 ring-blue-400/50 group-hover:from-[#5b7cff] group-hover:to-[#2c4aad] group-hover:shadow-blue-800/50 group-hover:scale-105'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                  </div>
                  <p className="text-sm font-medium leading-normal">{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</p>
                </button>
                <button className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:bg-border-dark/40 transition-all duration-200">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-info/15 text-info flex items-center justify-center transition-all duration-200 group-hover:bg-info group-hover:text-white group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-info/25">
                    <span className="material-symbols-outlined text-xl">help_outline</span>
                  </div>
                  <p className="text-sm font-medium leading-normal">Ayuda</p>
                </button>
                <button
                  onClick={handleLogout}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:bg-border-dark/40 transition-all duration-200"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-danger/15 text-danger flex items-center justify-center transition-all duration-200 group-hover:bg-danger group-hover:text-white group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-danger/25">
                    <span className="material-symbols-outlined text-xl">logout</span>
                  </div>
                  <p className="text-sm font-medium leading-normal">Cerrar Sesión</p>
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  )
}

export default Sidebar

