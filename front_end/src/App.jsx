import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
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
import Conocimiento from './pages/Conocimiento'
import Configuracion from './pages/Configuracion'
import Login from './pages/Login'

function App() {
  return (
    <AuthProvider>
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
            <Route path="conocimiento" element={<Conocimiento />} />
            <Route path="configuracion" element={<Configuracion />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

