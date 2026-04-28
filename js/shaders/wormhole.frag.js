export default /* glsl */`
precision highp float;
uniform float uTime;
uniform float uProgress;
uniform vec2  uResolution;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  vec2 c = uv - 0.5;
  c.x *= uResolution.x / uResolution.y;
  float r = length(c);
  float a = atan(c.y, c.x);

  float rayCount = mix(12.0, 48.0, uProgress);
  float rays = 0.5 + 0.5 * sin(a * rayCount + uTime * 3.0);
  rays = pow(rays, mix(2.0, 1.0, uProgress));

  float tunnel = smoothstep(0.7 + 0.4 * (1.0 - uProgress), 0.0, r);
  tunnel = pow(tunnel, 1.6);

  float streak = pow(max(0.0, 1.0 - r * (1.0 - uProgress * 0.7)), 3.0);

  float spiral = sin(a * 8.0 - uTime * 6.0 + r * 18.0 * uProgress);
  spiral = smoothstep(0.5, 1.0, spiral) * (1.0 - r);

  float intensity = rays * tunnel * 1.2 + streak * 0.6 + spiral * 0.4 * uProgress;
  intensity *= mix(0.4, 1.6, uProgress);

  float grain = (hash(uv * uResolution.xy + uTime) - 0.5) * 0.03;

  vec3 dark = vec3(0.020, 0.020, 0.024);
  vec3 silver = vec3(0.82, 0.82, 0.86);
  vec3 col = mix(dark, silver, clamp(intensity + grain, 0.0, 1.0));

  float vignette = smoothstep(0.95, 0.4, r) * uProgress;
  col = mix(col, vec3(0.0), 1.0 - vignette);
  col *= mix(1.0, 1.0 + uProgress * 0.4, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`;
