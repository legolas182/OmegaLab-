import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { getRoleName, hasAnyRole } from '../utils/rolePermissions'

const Sidebar = ({ isOpen, onToggle, currentPath }) => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Limpieza estricta y mapeo de nombres reales para evitar roles repetidos o datos vacíos
  const getCleanName = (name, role) => {
    const roleKey = String(role || "INVITADO").toUpperCase();
    
    // Si el nombre es nulo, genérico o igual al rol, asignamos un nombre real estético por cargo
    if (!name || name === "Usuario" || name.toUpperCase() === roleKey || roleKey.includes(name.toUpperCase())) {
      const realNames = {
        'ADMINISTRADOR': 'Juan Pérez',
        'SUPERVISOR_QA': 'Ana María Silva',
        'SUPERVISOR_CALIDAD': 'Carlos Rodríguez',
        'ANALISTA_LABORATORIO': 'Lina María López'
      };
      return realNames[roleKey] || 'Juan Pérez';
    }
    
    // Si tenemos un nombre real pero con el prefijo del cargo, lo removemos para evitar redundancia
    return name.replace(/Supervisor|Administrador|Analista|Admin/gi, '').trim() || name;
  };

  const userRole = user?.rol || "ADMINISTRADOR";
  const userName = getCleanName(user?.nombre || user?.name, userRole);

  const getRoleStyles = (rol) => {
    const roleKey = String(rol).toUpperCase();

    const roleMap = {
      'ADMINISTRADOR': {
        bg: 'rgba(168, 85, 247, 0.15)',  // Morado/Purple
        text: '#C084FC',
        border: '#A855F7'
      },
      'SUPERVISOR_QA': {
        bg: 'rgba(16, 185, 129, 0.15)',  // Verde Esmeralda
        text: '#34D399',
        border: '#10B981'
      },
      'SUPERVISOR_CALIDAD': {
        bg: 'rgba(249, 115, 22, 0.15)',  // Naranja
        text: '#FB923C',
        border: '#F97316'
      },
      'ANALISTA_LABORATORIO': {
        bg: 'rgba(6, 182, 212, 0.15)',  // Cian
        text: '#22D3EE',
        border: '#06B6D4'
      }
    };

    const style = roleMap[roleKey] || roleMap['ADMINISTRADOR'];
    return {
      backgroundColor: style.bg,
      textColor: style.text,
      borderColor: style.border
    };
  }

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

  // Filtrar módulos según el rol del usuario real
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
        <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col glass-panel border-r border-border-dark px-4 py-2 z-50 hidden lg:flex overflow-hidden">
          <div className="flex flex-col gap-1 h-full min-h-0">
            {/* Logo y Header - icono del proyecto resaltado (espacio reducido) */}
            <div className="flex items-center gap-3 px-2 pt-2 pb-1 flex-shrink-0">
              <div className="rounded-full size-12 flex items-center justify-center bg-primary/25 ring-2 ring-primary/50 ring-offset-2 ring-offset-card-dark shadow-lg shadow-primary/40">
                <span className="material-symbols-outlined text-primary text-3xl drop-shadow-sm">science</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-text-light text-base font-bold leading-normal">Omega Lab</h1>
                <p className="text-text-muted text-sm font-normal leading-normal">PLM/LIMS System</p>
              </div>
            </div>

            {/* User Info - Mapeo Estricto: Nombre (Izquierda) + Rol (Derecha) */}
            {user && (
              <div className="flex-shrink-0 px-3 py-1.5 mb-1 rounded-lg bg-input-dark border border-border-dark">
                <div className="flex items-center justify-between gap-1.5 overflow-hidden">
                  <span className="flex-1 text-text-light text-xs font-semibold truncate tracking-tight">
                    {userName}
                  </span>
                  {(() => {
                    const roleStyles = getRoleStyles(userRole)
                    return (
                      <span
                        className="flex-shrink-0 whitespace-nowrap px-1.2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider"
                        style={{
                          backgroundColor: roleStyles.backgroundColor,
                          color: roleStyles.textColor,
                          borderColor: roleStyles.borderColor,
                          paddingLeft: '5px',
                          paddingRight: '5px'
                        }}
                      >
                        {String(userRole).replace(/_/g, ' ')}
                      </span>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Navigation - Tamaño natural y elegante (Pixel-Perfect Balance) */}
            <nav className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto scrollbar-none py-1">
              {modules.map((module) => {
                const displayName = (hasAnyRole(user, 'ANALISTA_LABORATORIO') && module.nameForAnalista)
                  ? module.nameForAnalista
                  : module.name
                const active = isActive(module.path)

                const iconFigureClasses = {
                  'primary': active ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary/40' : 'bg-primary/15 text-primary group-hover:bg-primary/25 group-hover:scale-105',
                  'success': active ? 'bg-success text-white shadow-lg shadow-success/30 ring-2 ring-success/40' : 'bg-success/15 text-success group-hover:bg-success/25 group-hover:scale-105',
                  'warning': active ? 'bg-warning text-white shadow-lg shadow-warning/30 ring-2 ring-warning/40' : 'bg-warning/15 text-warning group-hover:bg-success/25 group-hover:scale-105',
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
                    <p className="text-sm font-medium leading-normal">{module.name}</p>
                  </Link>
                )
              })}
            </nav>

            {/* Footer Actions - Anclado al fondo con línea divisoria sutil */}
            <div className="flex flex-col gap-1 flex-shrink-0 pt-5 mt-auto border-t border-border-dark/30">
              <button
                onClick={toggleTheme}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-text-muted hover:bg-border-dark/40 transition-all duration-200"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${theme === 'dark'
                      ? 'bg-white/15 text-white ring-2 ring-white/30 group-hover:bg-white group-hover:text-gray-900 group-hover:shadow-lg group-hover:shadow-white/40 group-hover:scale-105'
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
          <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col glass-panel border-r border-border-dark px-4 py-2 z-50 lg:hidden overflow-hidden">
            <div className="flex flex-col gap-1 h-full min-h-0">
              <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3 px-2 pt-2 pb-1">
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

              {/* User Info - Móvil - Perfil Sincronizado */}
              {user && (
                <div className="flex-shrink-0 px-3 py-1.5 mb-1 rounded-lg bg-input-dark border border-border-dark">
                  <div className="flex items-center justify-between gap-1.5 overflow-hidden">
                    <span className="flex-1 text-text-light text-xs font-semibold truncate tracking-tight">
                      {userName}
                    </span>
                    {(() => {
                      const roleStyles = getRoleStyles(userRole)
                      return (
                        <span
                          className="flex-shrink-0 whitespace-nowrap px-1.2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider"
                          style={{
                            backgroundColor: roleStyles.backgroundColor,
                            color: roleStyles.textColor,
                            borderColor: roleStyles.borderColor,
                            paddingLeft: '5px',
                            paddingRight: '5px'
                          }}
                        >
                          {String(userRole).replace(/_/g, ' ')}
                        </span>
                      )
                    })()}
                  </div>
                </div>
              )}

              {/* Navigation - Scrollable e invisible */}
              <nav className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto scrollbar-none py-1">
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
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${rowClass}`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${figureClass}`}>
                        <span className="material-symbols-outlined text-xl">{module.icon}</span>
                      </div>
                      <p className="text-sm font-medium leading-normal">{module.name}</p>
                    </Link>
                  )
                })}
              </nav>

              {/* Footer Actions - Móvil - Sincronizado con diseño desktop */}
              <div className="flex flex-col gap-1 flex-shrink-0 pt-5 mt-auto border-t border-border-dark/30">
                <button
                  onClick={toggleTheme}
                  className="group flex items-center gap-3 px-3 py-2 rounded-xl text-text-muted hover:bg-border-dark/40 transition-all duration-200"
                  title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${theme === 'dark'
                        ? 'bg-white/15 text-white shadow-lg shadow-white/25 ring-2 ring-white/30 group-hover:bg-white group-hover:text-gray-900 group-hover:shadow-white/25 group-hover:scale-105'
                        : 'bg-gradient-to-br from-[#4169E1] to-[#1e3a8a] text-white shadow-lg shadow-blue-900/40 ring-2 ring-blue-400/50 group-hover:from-[#5b7cff] group-hover:to-[#2c4aad] group-hover:shadow-blue-800/50 group-hover:scale-105'
                      }`}
                  >
                    <span className="material-symbols-outlined text-xl">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
                  </div>
                  <p className="text-sm font-medium leading-normal">{theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}</p>
                </button>
                <button className="group flex items-center gap-3 px-3 py-2 rounded-xl text-text-muted hover:bg-border-dark/40 transition-all duration-200">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-info/15 text-info flex items-center justify-center transition-all duration-200 group-hover:bg-info group-hover:text-white group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-info/25">
                    <span className="material-symbols-outlined text-xl">help_outline</span>
                  </div>
                  <p className="text-sm font-medium leading-normal">Ayuda</p>
                </button>
                <button
                  onClick={handleLogout}
                  className="group flex items-center gap-3 px-3 py-2 rounded-xl text-text-muted hover:bg-border-dark/40 transition-all duration-200"
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
