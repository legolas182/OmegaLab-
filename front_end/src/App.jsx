import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Ideas from './pages/Ideas'
import Inventario from './pages/inventario/Inventario'
import Productos from './pages/inventario/Productos'
import MateriaPrima from './pages/inventario/MateriaPrima'
import Categorias from './pages/inventario/Categorias'
import UnidadesMedida from './pages/inventario/UnidadesMedida'
import IA from './pages/IA'
import Produccion from './pages/Produccion'
import Pruebas from './pages/Pruebas'
import Historial from './pages/Historial'
import Aprobacion from './pages/Aprobacion'
import Trazabilidad from './pages/Trazabilidad'
import Configuracion from './pages/Configuracion'
import Login from './pages/Login'

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f1f5f9',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f1f5f9',
            },
          },
        }}
      />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="ideas" element={<Ideas />} />
            <Route path="inventario" element={<Inventario />}>
              <Route index element={<Navigate to="productos" replace />} />
              <Route path="productos" element={<Productos />} />
              <Route path="materia-prima" element={<MateriaPrima />} />
              <Route path="categorias" element={<Categorias />} />
              <Route path="unidades-medida" element={<UnidadesMedida />} />
            </Route>
            <Route path="ia" element={<IA />} />
            <Route path="produccion" element={<Produccion />} />
            <Route path="pruebas" element={<Pruebas />} />
            <Route path="historial" element={<Historial />} />
            <Route path="aprobacion" element={<Aprobacion />} />
            <Route path="trazabilidad" element={<Trazabilidad />} />
            <Route path="configuracion" element={<Configuracion />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

