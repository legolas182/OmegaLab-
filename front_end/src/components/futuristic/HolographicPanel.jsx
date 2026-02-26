import { memo } from 'react'

const defaultClass = 'holographic-panel'

/**
 * Panel UI estilo holograma: fondo transparente con blur, borde luminoso animado,
 * ruido digital sutil, efecto scan vertical, hover glow, sombras energéticas.
 * Soporta contenido React (children).
 */
function HolographicPanel({
  children,
  className = '',
  style = {},
  as: Component = 'div',
  ...rest
}) {
  return (
    <Component
      className={`${defaultClass} ${className}`.trim()}
      style={style}
      data-futuristic-panel
      {...rest}
    >
      <div className="holographic-panel-scan" aria-hidden="true" />
      <div className="holographic-panel-noise" aria-hidden="true" />
      <div className="holographic-panel-border-glow" aria-hidden="true" />
      <div className="holographic-panel-content">{children}</div>
    </Component>
  )
}

export default memo(HolographicPanel)
