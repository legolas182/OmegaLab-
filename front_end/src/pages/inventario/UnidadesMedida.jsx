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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
            className="w-full h-12 px-4 rounded-lg bg-input-dark border-none text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50"
          >
            {tipos.map(tipo => (
              <option key={tipo} value={tipo === 'Todos' ? '' : tipo}>{tipo}</option>
            ))}
          </select>
        </div>
        <div className="text-text-muted text-sm">
          {filteredUnidades.length} unidad{filteredUnidades.length !== 1 ? 'es' : ''} disponible{filteredUnidades.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUnidades.map((unidad) => (
          <div
            key={unidad.codigo}
            className="rounded-lg bg-card-dark border border-border-dark p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-text-light font-semibold text-lg mb-1">{unidad.nombre}</h3>
                <span className="px-2 py-1 rounded text-xs bg-primary/20 text-primary">
                  {unidad.codigo}
                </span>
              </div>
              <span className="px-2 py-1 rounded text-xs bg-text-muted/20 text-text-muted">
                {unidad.tipo}
              </span>
            </div>
            <p className="text-text-muted text-sm">{unidad.descripcion}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg bg-card-dark border border-border-dark p-6">
        <h3 className="text-text-light font-semibold mb-4">Información sobre Unidades de Medida</h3>
        <div className="space-y-2 text-text-muted text-sm">
          <p>Las unidades de medida son estándares predefinidos utilizados en el sistema para:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Productos terminados: generalmente se usan unidades (un), kilogramos (kg) o litros (L)</li>
            <li>Materias primas: se usan kilogramos (kg), gramos (g) o miligramos (mg)</li>
            <li>Componentes: se usan gramos (g) o miligramos (mg) para pequeñas cantidades</li>
          </ul>
          <p className="mt-4">Al crear productos o materiales, selecciona la unidad de medida más apropiada según el tipo de elemento.</p>
        </div>
      </div>
    </div>
  )
}

export default UnidadesMedida

