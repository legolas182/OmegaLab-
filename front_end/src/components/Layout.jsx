import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import ChatAssistant from './ChatAssistant'
import HolographicPanel from './futuristic/HolographicPanel'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const { user } = useAuth()

  return (
    <div className="cosmic-backdrop flex h-screen w-full min-h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} currentPath={location.pathname} />
      <main className={`flex-1 h-screen overflow-y-auto transition-all duration-300 relative z-10 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <HolographicPanel className="h-full w-full p-6 lg:p-8 min-h-full border-l border-white/5">
          <Outlet />
        </HolographicPanel>
      </main>

      {/* Asistente de IA - Solo para Supervisor de Calidad */}
      {user?.rol === 'SUPERVISOR_CALIDAD' && <ChatAssistant />}
    </div>
  )
}

export default Layout

