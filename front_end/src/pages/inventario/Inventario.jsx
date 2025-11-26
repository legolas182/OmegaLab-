import { Outlet, NavLink, useLocation } from 'react-router-dom'

const Inventario = () => {
  const location = useLocation()

  const subpages = [
    { path: 'productos', name: 'Productos', icon: 'inventory_2' },
    { path: 'materia-prima', name: 'Materia Prima', icon: 'science' },
    { path: 'categorias', name: 'Categorías', icon: 'category' },
    { path: 'unidades-medida', name: 'Unidades de Medida', icon: 'straighten' }
  ]

  const isActive = (path) => {
    return location.pathname === `/inventario/${path}` || 
           (path === 'productos' && location.pathname === '/inventario')
  }

  return (
    <div className="w-full h-full">
      <div className="mb-6">
        <nav className="flex gap-2 border-b border-border-dark">
          {subpages.map((page) => (
            <NavLink
              key={page.path}
              to={page.path}
              className={({ isActive: active }) =>
                `px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  active || isActive(page.path)
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-light hover:border-border-dark'
                }`
              }
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">{page.icon}</span>
                {page.name}
              </div>
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet />
    </div>
  )
}

export default Inventario

