// Ola nebulosa horizontal - Vertex Shader
// Deformación: ruido procedural (tipo Perlin) + ondas seno
// Movimiento orgánico, fluido, cubre todo el fondo

uniform float uTime;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uFrequency;
uniform vec2 uResolution;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDisplacement;
varying vec2 vMouseFactor;

// Ruido 3D suave (estilo Perlin, orgánico)
float hash(vec3 p) {
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

float noise3d(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float n = mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z
  );
  return n;
}

// Ruido fractal (varias octavas) para movimiento más orgánico
float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  float f = 1.0;
  for (int i = 0; i < 4; i++) {
    v += a * noise3d(p * f);
    a *= 0.5;
    f *= 2.0;
  }
  return v;
}

void main() {
  vUv = uv;

  // Mouse: influencia suave para distorsión/intensidad
  float mouseDist = length(uv - uMouse);
  float mouseInfluence = exp(-mouseDist * 2.2);
  vMouseFactor = vec2(mouseInfluence, 1.0 - mouseInfluence * 0.5);

  // Escala de frecuencia según aspect (misma densidad visual en cualquier resolución)
  float aspect = (uResolution.y > 0.0) ? (uResolution.x / uResolution.y) : 1.0;
  float freq = uFrequency * (1.0 + aspect * 0.15);

  // Ondas seno (flujo horizontal + algo vertical)
  float wave1 = sin(position.x * freq + uTime) * 0.5;
  float wave2 = sin(position.x * freq * 0.6 + uTime * 1.2) * 0.3;
  float wave3 = sin(position.y * freq * 0.8 + uTime * 0.4) * 0.2;

  // Ruido procedural (fbm) = ondulación continua y orgánica
  vec3 noiseCoord = vec3(position.x * 0.5, position.y * 0.5, uTime * 0.25);
  float n = fbm(noiseCoord);
  float n2 = fbm(noiseCoord * 1.3 + vec3(10.0, 5.0, 0.0));

  float displacement = (wave1 + wave2 + wave3) * 0.5 + (n + n2 * 0.5) * 0.5;
  displacement *= uAmplitude;
  displacement *= (1.0 + vMouseFactor.x * 0.8);

  vDisplacement = displacement;

  vec3 pos = position + normal * displacement;
  vec4 modelViewPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * modelViewPosition;

  vNormal = normalize(normalMatrix * normal);
  vViewPosition = -modelViewPosition.xyz;
}
