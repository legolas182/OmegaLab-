import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRoleName, hasAnyRole } from '../utils/rolePermissions'

const Sidebar = ({ isOpen, onToggle, currentPath }) => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Todos los módulos disponibles
  const allModules = [
    { key: 'dashboard', name: 'Dashboard', icon: 'dashboard', path: '/', roles: ['ADMINISTRADOR', 'SUPERVISOR_QA', 'SUPERVISOR_CALIDAD', 'ANALISTA_LABORATORIO'] },
    { key: 'ideas', name: 'Nuevas Fórmulas', icon: 'lightbulb', path: '/ideas', roles: ['ADMINISTRADOR', 'SUPERVISOR_QA', 'ANALISTA_LABORATORIO'], nameForAnalista: 'Asignado' },
    { key: 'inventario', name: 'Inventario', icon: 'inventory_2', path: '/inventario', roles: ['ADMINISTRADOR', 'SUPERVISOR_QA', 'SUPERVISOR_CALIDAD'] },
    { key: 'ia', name: 'IA / Simulación', icon: 'psychology', path: '/ia', roles: ['ADMINISTRADOR', 'SUPERVISOR_QA'] },
    { key: 'produccion', name: 'Producción / Proceso', icon: 'precision_manufacturing', path: '/produccion', roles: ['ADMINISTRADOR', 'SUPERVISOR_QA'] },
    { key: 'pruebas', name: 'Pruebas / C. Calidad', icon: 'biotech', path: '/pruebas', roles: ['ADMINISTRADOR', 'SUPERVISOR_QA', 'SUPERVISOR_CALIDAD', 'ANALISTA_LABORATORIO'] },
    { key: 'historial', name: 'Historial', icon: 'history', path: '/historial', roles: ['ADMINISTRADOR', 'SUPERVISOR_QA', 'SUPERVISOR_CALIDAD', 'ANALISTA_LABORATORIO'] },
    { key: 'aprobacion', name: 'Aprobación / QA', icon: 'verified', path: '/aprobacion', roles: ['ADMINISTRADOR', 'SUPERVISOR_QA', 'SUPERVISOR_CALIDAD'] },
    { key: 'trazabilidad', name: 'Trazabilidad Lote', icon: 'timeline', path: '/trazabilidad', roles: ['ADMINISTRADOR', 'SUPERVISOR_QA', 'SUPERVISOR_CALIDAD'] },
    { key: 'conocimiento', name: 'Base de Conocimiento', icon: 'menu_book', path: '/conocimiento', roles: ['ADMINISTRADOR', 'SUPERVISOR_QA', 'SUPERVISOR_CALIDAD'] },
    { key: 'configuracion', name: 'Configuración', icon: 'settings', path: '/configuracion', roles: ['ADMINISTRADOR'] }
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
        <aside className="fixed left-0 top-0 h-screen w-64 flex-col bg-card-dark border-r border-border-dark p-4 z-50 hidden lg:flex">
          <div className="flex flex-col gap-4 h-full">
            {/* Logo y Header */}
            <div className="flex items-center gap-3 px-2 py-4">
              <div className="bg-primary/20 rounded-full size-10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">science</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-text-light text-base font-bold leading-normal">OMEGA LAB</h1>
                <p className="text-text-muted text-sm font-normal leading-normal">PLM/LIMS System</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-grow">
              {modules.map((module) => {
                // Si es analista y el módulo tiene nombre específico para analista, usarlo
                const displayName = (hasAnyRole(user, 'ANALISTA_LABORATORIO') && module.nameForAnalista) 
                  ? module.nameForAnalista 
                  : module.name
                return (
                  <Link
                    key={module.key}
                    to={module.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive(module.path)
                        ? 'bg-primary/20 text-primary'
                        : 'text-text-muted hover:bg-border-dark/50'
                    }`}
                  >
                    <span className="material-symbols-outlined">{module.icon}</span>
                    <p className="text-sm font-medium leading-normal">{displayName}</p>
                  </Link>
                )
              })}
            </nav>

            {/* User Info */}
            {user && (
              <div className="mt-auto mb-2 p-3 rounded-lg bg-input-dark border border-border-dark">
                <p className="text-text-light text-sm font-medium truncate">{user.nombre}</p>
                <p className="text-text-muted text-xs truncate">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-primary/20 text-primary text-xs">
                  {getRoleName(user.rol)}
                </span>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex flex-col gap-2">
              <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:bg-border-dark/50 transition-colors">
                <span className="material-symbols-outlined">help_outline</span>
                <p className="text-sm font-medium leading-normal">Ayuda</p>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:bg-border-dark/50 transition-colors"
              >
                <span className="material-symbols-outlined">logout</span>
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
          <aside className="fixed left-0 top-0 h-screen w-64 flex-col bg-card-dark border-r border-border-dark p-4 z-50 lg:hidden">
            <div className="flex flex-col gap-4 h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 px-2 py-4">
                  <div className="bg-primary/20 rounded-full size-10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">science</span>
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-text-light text-base font-bold leading-normal">OMEGA LAB</h1>
                    <p className="text-text-muted text-sm font-normal leading-normal">PLM/LIMS System</p>
                  </div>
                </div>
                <button onClick={onToggle} className="p-2 text-text-muted hover:text-text-light">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <nav className="flex flex-col gap-2 flex-grow">
                {modules.map((module) => {
                  // Si es analista y el módulo tiene nombre específico para analista, usarlo
                  const displayName = (hasAnyRole(user, 'ANALISTA_LABORATORIO') && module.nameForAnalista) 
                    ? module.nameForAnalista 
                    : module.name
                  return (
                    <Link
                      key={module.key}
                      to={module.path}
                      onClick={onToggle}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(module.path)
                          ? 'bg-primary/20 text-primary'
                          : 'text-text-muted hover:bg-border-dark/50'
                      }`}
                    >
                      <span className="material-symbols-outlined">{module.icon}</span>
                      <p className="text-sm font-medium leading-normal">{displayName}</p>
                    </Link>
                  )
                })}
              </nav>

              {/* User Info */}
              {user && (
                <div className="mt-auto mb-2 p-3 rounded-lg bg-input-dark border border-border-dark">
                  <p className="text-text-light text-sm font-medium truncate">{user.nombre}</p>
                  <p className="text-text-muted text-xs truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded bg-primary/20 text-primary text-xs">
                    {user.rol}
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:bg-border-dark/50 transition-colors">
                  <span className="material-symbols-outlined">help_outline</span>
                  <p className="text-sm font-medium leading-normal">Ayuda</p>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:bg-border-dark/50 transition-colors"
                >
                  <span className="material-symbols-outlined">logout</span>
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

