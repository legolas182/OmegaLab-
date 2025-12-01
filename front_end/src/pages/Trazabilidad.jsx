import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { hasAnyRole } from '../utils/rolePermissions'

const Trazabilidad = () => {
  const { user } = useAuth()

  // Verificar permisos - Solo Supervisor QA y Administrador
  if (!user || (!hasAnyRole(user, 'SUPERVISOR_QA') && !hasAnyRole(user, 'ADMINISTRADOR'))) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-danger mb-4">lock</span>
          <p className="text-text-light text-lg font-semibold mb-2">Acceso Restringido</p>
          <p className="text-text-muted text-sm">Solo Supervisor QA y Administrador pueden acceder a Trazabilidad Lote</p>
        </div>
      </div>
    )
  }
  const [loteId, setLoteId] = useState('LOTE-2024-001')
  const [trazabilidad, setTrazabilidad] = useState({
    lote: 'LOTE-2024-001',
    producto: 'Vitamina D3 2000UI',
    fechaProduccion: '15/01/2024',
    eventos: [
      {
        fecha: '10/01/2024',
        hora: '08:30',
        tipo: 'Origen',
        descripcion: 'Recepción de Materias Primas',
        detalles: [
          { item: 'Colecalciferol', lote: 'MP-2024-001', proveedor: 'Proveedor A', cantidad: '50 kg' },
          { item: 'Excipiente', lote: 'MP-2024-002', proveedor: 'Proveedor B', cantidad: '1950 kg' }
        ],
        usuario: 'Juan Pérez',
        identificador: 'REC-2024-001'
      },
      {
        fecha: '12/01/2024',
        hora: '14:15',
        tipo: 'Proceso',
        descripcion: 'Dispensación de Ingredientes',
        detalles: [
          { item: 'Pesaje realizado en BAL-001', calibracion: 'Vigente hasta 30/06/2024' }
        ],
        usuario: 'María González',
        identificador: 'DISP-2024-001'
      },
      {
        fecha: '13/01/2024',
        hora: '09:00',
        tipo: 'Proceso',
        descripcion: 'Line Clearance - Línea A',
        detalles: [
          { item: 'Limpieza verificada', equipo: 'Línea A', checklist: 'Completo' }
        ],
        usuario: 'Carlos Rodríguez',
        identificador: 'LC-2024-001'
      },
      {
        fecha: '15/01/2024',
        hora: '16:45',
        tipo: 'Calidad',
        descripcion: 'Muestreo para Control de Calidad',
        detalles: [
          { item: 'Muestra MU-2024-001', analista: 'Ana García', equipos: 'HPLC-001, BAL-002' }
        ],
        usuario: 'Ana García',
        identificador: 'MU-2024-001'
      },
      {
        fecha: '17/01/2024',
        hora: '11:20',
        tipo: 'Distribución',
        descripcion: 'Liberación y Distribución',
        detalles: [
          { item: 'Lote liberado por Dr. Juan Pérez', destino: 'Almacén Principal' }
        ],
        usuario: 'Dr. Juan Pérez',
        identificador: 'LIB-2024-001'
      }
    ]
  })

  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-text-light text-3xl font-bold tracking-tight">Trazabilidad de Lote</h1>
          <p className="text-text-muted text-sm mt-1">Vista detallada de la línea de tiempo completa del lote</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={loteId}
            onChange={(e) => setLoteId(e.target.value)}
            placeholder="Buscar lote..."
            className="h-10 px-4 rounded-lg bg-input-dark border-none text-text-light placeholder:text-text-muted focus:outline-0 focus:ring-2 focus:ring-primary/50"
          />
          <button className="h-10 px-6 rounded-lg bg-primary text-white font-medium hover:bg-primary/90">
            Buscar
          </button>
        </div>
      </div>

      {/* Información del Lote */}
      <div className="rounded-lg bg-card-dark border border-border-dark p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-text-muted text-sm mb-1">ID del Lote</p>
            <p className="text-text-light font-semibold text-lg">{trazabilidad.lote}</p>
          </div>
          <div>
            <p className="text-text-muted text-sm mb-1">Producto</p>
            <p className="text-text-light font-semibold">{trazabilidad.producto}</p>
          </div>
          <div>
            <p className="text-text-muted text-sm mb-1">Fecha de Producción</p>
            <p className="text-text-light font-semibold">{trazabilidad.fechaProduccion}</p>
          </div>
        </div>
      </div>

      {/* Línea de Tiempo */}
      <div className="rounded-lg bg-card-dark border border-border-dark p-6">
        <h2 className="text-text-light text-xl font-semibold mb-6">Línea de Tiempo Completa</h2>
        
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border-dark"></div>

          {/* Eventos */}
          <div className="space-y-8">
            {trazabilidad.eventos.map((evento, index) => (
              <div key={index} className="relative flex gap-6">
                {/* Punto en la línea */}
                <div className={`relative z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${
                  evento.tipo === 'Origen' ? 'bg-primary' :
                  evento.tipo === 'Proceso' ? 'bg-warning' :
                  evento.tipo === 'Calidad' ? 'bg-info' :
                  'bg-success'
                }`}>
                  <span className="material-symbols-outlined text-white">
                    {evento.tipo === 'Origen' ? 'inventory' :
                     evento.tipo === 'Proceso' ? 'precision_manufacturing' :
                     evento.tipo === 'Calidad' ? 'biotech' :
                     'local_shipping'}
                  </span>
                </div>

                {/* Contenido del evento */}
                <div className="flex-1 pb-8">
                  <div className="rounded-lg bg-input-dark border border-border-dark p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs ${
                            evento.tipo === 'Origen' ? 'bg-primary/20 text-primary' :
                            evento.tipo === 'Proceso' ? 'bg-warning/20 text-warning' :
                            evento.tipo === 'Calidad' ? 'bg-info/20 text-info' :
                            'bg-success/20 text-success'
                          }`}>
                            {evento.tipo}
                          </span>
                          <span className="text-text-muted text-xs">{evento.identificador}</span>
                        </div>
                        <h3 className="text-text-light font-semibold">{evento.descripcion}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-text-light text-sm font-medium">{evento.fecha}</p>
                        <p className="text-text-muted text-xs">{evento.hora}</p>
                      </div>
                    </div>

                    {/* Detalles */}
                    <div className="space-y-2 mt-3">
                      {evento.detalles.map((detalle, idx) => (
                        <div key={idx} className="p-2 rounded bg-card-dark text-sm">
                          {Object.entries(detalle).map(([key, value]) => (
                            <div key={key} className="flex gap-2">
                              <span className="text-text-muted capitalize">{key}:</span>
                              <span className="text-text-light">{value}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>

                    {/* Usuario */}
                    <div className="mt-3 pt-3 border-t border-border-dark">
                      <p className="text-text-muted text-xs">
                        <span className="material-symbols-outlined align-middle text-base">person</span>
                        Registrado por: {evento.usuario}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen de Trazabilidad */}
      <div className="mt-6 rounded-lg bg-card-dark border border-border-dark p-6">
        <h2 className="text-text-light text-xl font-semibold mb-4">Resumen de Trazabilidad</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-input-dark">
            <p className="text-text-muted text-xs mb-1">Materias Primas</p>
            <p className="text-text-light font-semibold">2</p>
          </div>
          <div className="p-4 rounded-lg bg-input-dark">
            <p className="text-text-muted text-xs mb-1">Equipos Utilizados</p>
            <p className="text-text-light font-semibold">4</p>
          </div>
          <div className="p-4 rounded-lg bg-input-dark">
            <p className="text-text-muted text-xs mb-1">Pruebas Realizadas</p>
            <p className="text-text-light font-semibold">1</p>
          </div>
          <div className="p-4 rounded-lg bg-input-dark">
            <p className="text-text-muted text-xs mb-1">Estado Final</p>
            <span className="inline-block px-2 py-1 rounded bg-success/20 text-success text-xs">
              Liberado
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Trazabilidad

