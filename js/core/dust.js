import * as THREE from 'three';

export function createDustField({ count = 600, radius = 14, size = 0.018, color = 0xC0C0C0 } = {}) {
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const r = radius * (0.4 + Math.random() * 0.6);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    speeds[i] = 0.05 + Math.random() * 0.15;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geom, mat);
  points.userData.speeds = speeds;
  points.userData.tick = (dt) => {
    const pos = geom.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += speeds[i] * dt * 0.05;
      if (pos[i * 3 + 1] > radius) {
        pos[i * 3 + 1] = -radius;
      }
    }
    geom.attributes.position.needsUpdate = true;
    points.rotation.y += dt * 0.0003;
  };

  return points;
}
