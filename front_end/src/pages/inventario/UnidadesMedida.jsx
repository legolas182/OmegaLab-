import { useState } from 'react'

const UnidadesMedida = () => {
  const unidades = [
    { codigo: 'un', nombre: 'Unidad', descripcion: 'Unidad de medida estándar', tipo: 'Cantidad' },
    { codigo: 'kg', nombre: 'Kilogramo', descripcion: 'Unidad de masa (1000 gramos)', tipo: 'Masa' },
    { codigo: 'g', nombre: 'Gramo', descripcion: 'Unidad de masa', tipo: 'Masa' },
    { codigo: 'mg', nombre: 'Miligramo', descripcion: 'Unidad de masa (0.001 gramos)', tipo: 'Masa' },
    { codigo: 'L', nombre: 'Litro', descripcion: 'Unidad de volumen (1000 mililitros)', tipo: 'Volumen' },
    { codigo: 'mL', nombre: 'Mililitro', descripcion: 'Unidad de volumen', tipo: 'Volumen' },
    { codigo: 'm', nombre: 'Metro', descripcion: 'Unidad de longitud', tipo: 'Longitud' },
    { codigo: 'cm', nombre: 'Centímetro', descripcion: 'Unidad de longitud (0.01 metros)', tipo: 'Longitud' },
    { codigo: 'mm', nombre: 'Milímetro', descripcion: 'Unidad de longitud (0.001 metros)', tipo: 'Longitud' }
  ]

  const [selectedTipo, setSelectedTipo] = useState('')

  const tipos = ['Todos', 'Cantidad', 'Masa', 'Volumen', 'Longitud']

  const filteredUnidades = selectedTipo && selectedTipo !== 'Todos'
    ? unidades.filter(u => u.tipo === selectedTipo)
    : unidades

  return (
    <div className="w-full h-full flex flex-col min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-slate-950/50 border border-white/5 text-text-light focus:outline-none focus:border-primary/50 transition-all text-sm font-medium"
          >
            {tipos.map(tipo => (
              <option key={tipo} value={tipo === 'Todos' ? '' : tipo} className="bg-slate-900">{tipo}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-text-muted bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
            {filteredUnidades.length} unidad{filteredUnidades.length !== 1 ? 'es' : ''} disponible{filteredUnidades.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 gap-6 overflow-hidden">
        <div className="rounded-xl bg-card-dark border border-border-dark flex-1 flex flex-col min-h-0 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-border-dark shrink-0 bg-white/5">
            <h2 className="text-text-light font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">straighten</span>
              Catálogo de Unidades
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredUnidades.map((unidad) => (
                <div
                  key={unidad.codigo}
                  className="rounded-2xl bg-white/5 border border-white/10 p-6 hover:border-primary/30 hover:bg-white/10 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 text-primary mb-3">
                        <span className="font-bold text-sm">{unidad.codigo}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase bg-white/5 text-text-muted border border-white/10 group-hover:border-primary/30 transition-colors">
                        {unidad.tipo}
                      </span>
                    </div>
                    <h3 className="text-text-light font-bold text-lg mb-2">{unidad.nombre}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{unidad.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/5 border border-cyan-500/20 p-6 shadow-inner">
              <h3 className="text-text-light font-bold flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">info</span>
                Información del Sistema de Medición
              </h3>
              <div className="space-y-3 text-text-muted text-sm leading-relaxed">
                <p>Las unidades de medida son estándares predefinidos en el ecosistema LIMS para asegurar la trazabilidad:</p>
                <ul className="list-none space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/70"></span>
                    <strong className="text-text-light">Productos terminados:</strong> unidades (un), kilogramos (kg) o litros (L)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/70"></span>
                    <strong className="text-text-light">Materias primas:</strong> kilogramos (kg), gramos (g) o miligramos (mg)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/70"></span>
                    <strong className="text-text-light">Micro-componentes y trazadores:</strong> gramos (g) o miligramos (mg) de precisión
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UnidadesMedida

