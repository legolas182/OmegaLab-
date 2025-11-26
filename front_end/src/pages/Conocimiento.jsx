import { useState } from 'react'

const Conocimiento = () => {
  const [documentos, setDocumentos] = useState([
    {
      id: 'DOC-001',
      titulo: 'SOP-001: Procedimiento de Limpieza de Líneas',
      tipo: 'SOP',
      version: 'v3.2',
      estado: 'Vigente',
      fechaAprobacion: '15/12/2023',
      aprobadoPor: 'Dr. Juan Pérez',
      categoria: 'Producción'
    },
    {
      id: 'DOC-002',
      titulo: 'Guía BPM - Decreto 3249 de 2006',
      tipo: 'Guía',
      version: 'v1.0',
      estado: 'Vigente',
      fechaAprobacion: '01/01/2024',
      aprobadoPor: 'QA Manager',
      categoria: 'Regulatorio'
    },
    {
      id: 'DOC-003',
      titulo: 'Farmacopea USP - Métodos Analíticos',
      tipo: 'Farmacopea',
      version: 'USP 43',
      estado: 'Vigente',
      fechaAprobacion: 'N/A',
      aprobadoPor: 'USP',
      categoria: 'Referencia'
    }
  ])

  const [selectedDoc, setSelectedDoc] = useState(null)
  const [filtro, setFiltro] = useState('Todos')

  const categorias = ['Todos', 'SOP', 'Guía', 'Farmacopea', 'Regulatorio', 'Producción']

  return (
    <div className="w-full h-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-text-light text-3xl font-bold tracking-tight">Base de Conocimiento</h1>
          <p className="text-text-muted text-sm mt-1">Repositorio de documentación esencial con control de versiones</p>
        </div>
        <button className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 flex items-center gap-2">
          <span className="material-symbols-outlined">add</span>
          Nuevo Documento
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltro(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filtro === cat
                ? 'bg-primary text-white'
                : 'bg-input-dark text-text-light hover:bg-border-dark'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Documentos */}
        <div className="lg:col-span-1">
          <div className="rounded-lg bg-card-dark border border-border-dark">
            <div className="p-4 border-b border-border-dark">
              <h2 className="text-text-light font-semibold">Documentos</h2>
            </div>
            <div className="divide-y divide-border-dark max-h-[600px] overflow-y-auto">
              {documentos
                .filter(doc => filtro === 'Todos' || doc.categoria === filtro || doc.tipo === filtro)
                .map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`p-4 cursor-pointer hover:bg-border-dark/50 ${
                      selectedDoc?.id === doc.id ? 'bg-primary/10 border-l-4 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-text-light font-medium text-sm">{doc.titulo}</p>
                        <p className="text-text-muted text-xs mt-1">{doc.id}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        doc.estado === 'Vigente' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                      }`}>
                        {doc.version}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">
                        {doc.tipo}
                      </span>
                      <span className="px-2 py-1 rounded bg-input-dark text-text-muted text-xs">
                        {doc.categoria}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Detalle del Documento */}
        <div className="lg:col-span-2">
          {selectedDoc ? (
            <div className="space-y-6">
              {/* Información General */}
              <div className="rounded-lg bg-card-dark border border-border-dark p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-text-light text-2xl font-bold">{selectedDoc.titulo}</h2>
                    <p className="text-text-muted text-sm mt-1">{selectedDoc.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded ${
                    selectedDoc.estado === 'Vigente' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                  }`}>
                    {selectedDoc.estado}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-text-muted text-xs mb-1">Versión</p>
                    <p className="text-text-light font-medium">{selectedDoc.version}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs mb-1">Fecha de Aprobación</p>
                    <p className="text-text-light font-medium">{selectedDoc.fechaAprobacion}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs mb-1">Aprobado Por</p>
                    <p className="text-text-light font-medium">{selectedDoc.aprobadoPor}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs mb-1">Categoría</p>
                    <p className="text-text-light font-medium">{selectedDoc.categoria}</p>
                  </div>
                </div>

                <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90">
                  Ver Documento Completo
                </button>
              </div>

              {/* Historial de Versiones */}
              <div className="rounded-lg bg-card-dark border border-border-dark p-6">
                <h3 className="text-text-light font-semibold mb-4">Historial de Versiones</h3>
                <div className="space-y-3">
                  {[
                    { version: 'v3.2', fecha: '15/12/2023', cambios: 'Actualización de procedimientos de limpieza', aprobadoPor: 'Dr. Juan Pérez' },
                    { version: 'v3.1', fecha: '10/09/2023', cambios: 'Corrección de errores menores', aprobadoPor: 'Dr. Juan Pérez' },
                    { version: 'v3.0', fecha: '01/06/2023', cambios: 'Revisión completa del documento', aprobadoPor: 'QA Manager' }
                  ].map((hist, idx) => (
                    <div key={idx} className="p-4 rounded-lg bg-input-dark border border-border-dark">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-text-light font-medium">{hist.version}</p>
                          <p className="text-text-muted text-xs">{hist.cambios}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          idx === 0 ? 'bg-success/20 text-success' : 'bg-text-muted/20 text-text-muted'
                        }`}>
                          {idx === 0 ? 'Actual' : 'Histórica'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                        <span>Fecha: {hist.fecha}</span>
                        <span>Aprobado por: {hist.aprobadoPor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Control de Acceso */}
              <div className="rounded-lg bg-card-dark border border-border-dark p-6">
                <h3 className="text-text-light font-semibold mb-4">Control de Acceso y Aprobación</h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-input-dark">
                    <p className="text-text-light text-sm font-medium mb-2">Roles con Acceso</p>
                    <div className="flex flex-wrap gap-2">
                      {['QA Manager', 'Producción', 'Calidad'].map((rol) => (
                        <span key={rol} className="px-2 py-1 rounded bg-primary/20 text-primary text-xs">
                          {rol}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                    <p className="text-warning text-sm font-medium mb-1">
                      <span className="material-symbols-outlined align-middle">lock</span> Registro Inalterable
                    </p>
                    <p className="text-text-muted text-xs">
                      Los documentos aprobados no pueden ser modificados. Para cambios, crear nueva versión.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-card-dark border border-border-dark p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-text-muted mb-4">menu_book</span>
              <p className="text-text-muted">Selecciona un documento para ver sus detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Conocimiento

