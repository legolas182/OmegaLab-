// Grid futurista: líneas finas luminosas, parallax suave con mouse
uniform float uTime;
uniform vec2 uMouse;
uniform float uIntensity;
uniform vec3 uColor;

varying vec2 vUv;

void main() {
  float aspect = 1.0;
  vec2 uv = vUv - 0.5;
  uv.x *= aspect;
  vec2 m = uMouse - 0.5;
  m.x *= aspect;
  uv -= m * 0.08;
  uv += 0.5;

  float grid = 24.0;
  vec2 g = fract(uv * grid);
  float lx = smoothstep(0.0, 0.03, g.x) + smoothstep(1.0, 0.97, g.x);
  float ly = smoothstep(0.0, 0.03, g.y) + smoothstep(1.0, 0.97, g.y);
  float line = max(lx, ly);

  float pulse = 0.85 + 0.15 * sin(uTime * 0.5);
  vec3 col = uColor * line * uIntensity * pulse;
  float alpha = line * uIntensity * 0.12;
  alpha = clamp(alpha, 0.0, 0.25);

  gl_FragColor = vec4(col, alpha);
}
