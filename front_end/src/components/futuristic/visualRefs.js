// Ref global para posición del mouse (normalizada 0–1), actualizado por EnergyBackground.
// Usado por EnergyGrid y otros efectos para parallax / reacción sin prop drilling.
export const globalMouseRef = { current: { x: 0.5, y: 0.5 } }
