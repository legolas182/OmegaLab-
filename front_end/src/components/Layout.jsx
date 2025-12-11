import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import ChatAssistant from './ChatAssistant'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const { user } = useAuth()

  return (
    <div className="flex h-screen w-full bg-background-dark overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} currentPath={location.pathname} />
      <main className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="h-full w-full p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Asistente de IA - Solo para Supervisor de Calidad */}
      {user?.rol === 'SUPERVISOR_CALIDAD' && <ChatAssistant />}
    </div>
  )
}

export default Layout

