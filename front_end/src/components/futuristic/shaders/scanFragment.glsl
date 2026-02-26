// Línea de escaneo horizontal con glow
uniform float uTime;
uniform float uIntensity;
uniform vec3 uColor;

varying vec2 vUv;

void main() {
  float speed = 0.35;
  float y = fract(vUv.y - uTime * speed);
  float line = exp(-y * y * 80.0);
  float glow = exp(-y * y * 12.0) * 0.4;
  vec3 col = uColor * (line + glow) * uIntensity;
  float alpha = (line + glow) * uIntensity * 0.5;
  alpha = clamp(alpha, 0.0, 0.4);
  gl_FragColor = vec4(col, alpha);
}
