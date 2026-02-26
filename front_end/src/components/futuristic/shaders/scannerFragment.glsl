// Línea de escaneo horizontal con glow
uniform float uTime;
uniform float uSpeed;
uniform float uIntensity;

varying vec2 vUv;

void main() {
  float scanY = fract(uTime * uSpeed);
  float dist = abs(vUv.y - scanY);
  dist = min(dist, abs(vUv.y - scanY + 1.0));
  dist = min(dist, abs(vUv.y - scanY - 1.0));

  float line = 1.0 - smoothstep(0.0, 0.06, dist);
  float glow = exp(-dist * 25.0) * uIntensity;
  vec3 color = vec3(0.3, 0.85, 1.0);
  float alpha = (line + glow * 0.5) * uIntensity * 0.5;
  alpha = clamp(alpha, 0.0, 0.4);

  gl_FragColor = vec4(color, alpha);
}
