// Ola nebulosa - Fragment Shader
// Mayor nitidez + ilusión translúcida (alpha moderado, bordes definidos)

uniform float uTime;
uniform float uIntensity;
uniform vec3 uColorPurple;
uniform vec3 uColorBlue;
uniform vec3 uColorGreen;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDisplacement;
varying vec2 vMouseFactor;

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vViewPosition);

  // Fresnel más nítido: potencia mayor = borde fino y definido (menos difuso)
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.6);
  float rim = fresnel * uIntensity;

  // Gradiente neon dinámico (flujo horizontal + tiempo)
  float gradient = vUv.x * 0.85 + uTime * 0.05;
  gradient = fract(gradient);
  vec3 colorMix;
  if (gradient < 0.33) {
    colorMix = mix(uColorPurple, uColorBlue, gradient * 3.0);
  } else if (gradient < 0.66) {
    colorMix = mix(uColorBlue, uColorGreen, (gradient - 0.33) * 3.0);
  } else {
    colorMix = mix(uColorGreen, uColorPurple, (gradient - 0.66) * 3.0);
  }

  // Núcleo nítido: transición más corta (smoothstep más estrecho)
  float dispFactor = smoothstep(0.05, 0.35, vDisplacement * 2.0 + 0.25);
  vec3 core = colorMix * (0.45 + dispFactor * 0.6);
  vec3 finalColor = core + rim * colorMix;
  finalColor *= uIntensity;
  finalColor = pow(finalColor, vec3(0.96));

  // Mouse: más brillo cerca del cursor
  finalColor *= (1.0 + vMouseFactor.x * 0.3);

  // Alpha translúcido: rango moderado para que se vea el fondo a través (ilusión de cristal/plasma)
  float alpha = 0.28 + dispFactor * 0.2 + rim * 0.4;
  alpha *= uIntensity;
  alpha = clamp(alpha, 0.22, 0.55);

  gl_FragColor = vec4(finalColor, alpha);
}
