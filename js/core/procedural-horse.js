import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/**
 * Stylized low-poly chrome horse, built from primitives.
 * Returned as a THREE.Group ready to receive a chrome material via
 * applyChromeToObject() from chrome-material.js.
 *
 * Anatomy (all sizes in scene units):
 *   body, neck, head, snout, two ears,
 *   four legs (upper + hoof), tail (3 segments), mane (planes).
 *
 * The whole group is centered around its bounding box origin so that
 * scene-level transforms (scale, position, rotation) behave predictably.
 */
export function buildProceduralHorse() {
  const horse = new THREE.Group();
  horse.name = 'ProceduralHorse';
  horse.userData.isPlaceholder = true;

  const tmpMat = new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 0.9, roughness: 0.3 });

  function add(geom, x, y, z, rx = 0, ry = 0, rz = 0) {
    const m = new THREE.Mesh(geom, tmpMat);
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, rz);
    horse.add(m);
    return m;
  }

  // --- Body: capsule lying along X axis ---
  const body = add(
    new THREE.CapsuleGeometry(0.42, 1.25, 8, 16),
    0, 0.05, 0,
    0, 0, Math.PI / 2
  );
  body.scale.set(1, 1, 0.9);

  // --- Chest swell ---
  add(new THREE.SphereGeometry(0.40, 16, 12), 0.62, 0.05, 0).scale.set(0.9, 1.0, 1.0);

  // --- Hindquarters swell ---
  add(new THREE.SphereGeometry(0.46, 16, 12), -0.62, 0.10, 0).scale.set(0.95, 1.05, 1.05);

  // --- Neck: tapered cylinder leaning forward + up ---
  const neck = add(
    new THREE.CylinderGeometry(0.20, 0.30, 0.85, 18),
    0.85, 0.55, 0,
    0, 0, -Math.PI / 2.6
  );
  neck.scale.set(1, 1, 0.9);

  // --- Head: rounded box ---
  const head = add(
    new RoundedBoxGeometry(0.30, 0.34, 0.58, 4, 0.06),
    1.28, 0.92, 0,
    0, 0, -Math.PI / 7
  );

  // --- Snout: smaller box on the front of the head ---
  add(
    new RoundedBoxGeometry(0.22, 0.20, 0.28, 4, 0.05),
    1.50, 0.78, 0,
    0, 0, -Math.PI / 7
  );

  // --- Ears: two small cones on top of the head ---
  const earGeom = new THREE.ConeGeometry(0.07, 0.18, 8);
  add(earGeom, 1.20, 1.16, 0.10, -0.1, 0, -Math.PI / 9);
  add(earGeom, 1.20, 1.16, -0.10,  0.1, 0, -Math.PI / 9);

  // --- Legs ---
  // 4 legs, positioned at front-left, front-right, back-left, back-right
  // Each leg = upper (cylinder) + hoof (cylinder thicker at base)
  const legPositions = [
    [ 0.55, -0.40,  0.22], // front-right
    [ 0.55, -0.40, -0.22], // front-left
    [-0.55, -0.40,  0.22], // back-right
    [-0.55, -0.40, -0.22], // back-left
  ];

  for (const [lx, ly, lz] of legPositions) {
    add(new THREE.CylinderGeometry(0.09, 0.10, 0.85, 12), lx, ly, lz);
    add(new THREE.CylinderGeometry(0.13, 0.11, 0.10, 12), lx, ly - 0.45, lz);
  }

  // --- Tail: 3 segments, gently curving back & down ---
  let tx = -1.10, ty = 0.30, tz = 0;
  let ang = -Math.PI / 2.4;
  for (let i = 0; i < 3; i++) {
    const r1 = 0.08 - i * 0.018;
    const r2 = 0.06 - i * 0.018;
    const len = 0.32;
    const seg = add(
      new THREE.CylinderGeometry(r1, r2, len, 10),
      tx, ty, tz,
      0, 0, ang
    );
    // Move forward in local direction for next segment
    tx += Math.cos(ang + Math.PI / 2) * len;
    ty += Math.sin(ang + Math.PI / 2) * len;
    ang -= 0.35;
  }

  // --- Mane: 7 thin planes along the neck ---
  const maneGeom = new THREE.PlaneGeometry(0.04, 0.32);
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const mx = 0.62 + t * 0.55;
    const my = 0.62 + t * 0.30;
    const plane = add(
      maneGeom,
      mx, my, 0,
      0, Math.PI / 2, -Math.PI / 3 + (Math.random() - 0.5) * 0.3
    );
    plane.scale.set(1, 1 + Math.random() * 0.2, 1);
  }

  // --- Center the whole group on the origin ---
  const box = new THREE.Box3().setFromObject(horse);
  const center = box.getCenter(new THREE.Vector3());
  horse.position.sub(center);

  // Wrap so external code can set transforms on the wrapper without fighting
  // our re-centering above.
  const wrapper = new THREE.Group();
  wrapper.name = 'ProceduralHorseWrapper';
  wrapper.userData.isPlaceholder = true;
  wrapper.add(horse);

  // Normalize size so it matches the GLB's expected scale (~2.4 max dim)
  const size = box.getSize(new THREE.Vector3()).length();
  const targetSize = 2.4;
  wrapper.scale.setScalar(targetSize / size);

  return wrapper;
}
