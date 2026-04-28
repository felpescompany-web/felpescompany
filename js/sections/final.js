import * as THREE from 'three';
import gsap from 'gsap';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createChromeMaterial } from '../core/chrome-material.js';

function buildTrophy(material) {
  const trophy = new THREE.Group();
  trophy.name = 'trophy';

  const base = new THREE.Mesh(
    new RoundedBoxGeometry(1.0, 0.18, 1.0, 4, 0.04),
    material
  );
  base.position.y = -1.05;
  trophy.add(base);

  const baseTop = new THREE.Mesh(
    new RoundedBoxGeometry(0.7, 0.10, 0.7, 4, 0.03),
    material
  );
  baseTop.position.y = -0.92;
  trophy.add(baseTop);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.11, 0.55, 32),
    material
  );
  stem.position.y = -0.6;
  trophy.add(stem);

  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 32, 32), material);
  knot.position.y = -0.32;
  trophy.add(knot);

  // Cup as LatheGeometry (chalice profile)
  const points = [];
  const profile = [
    [0.12, -0.18],
    [0.20, -0.10],
    [0.30,  0.00],
    [0.42,  0.15],
    [0.50,  0.35],
    [0.52,  0.55],
    [0.50,  0.70],
    [0.45,  0.78],
  ];
  for (const [x, y] of profile) points.push(new THREE.Vector2(x, y));
  const cup = new THREE.Mesh(
    new THREE.LatheGeometry(points, 64),
    material
  );
  cup.position.y = -0.05;
  trophy.add(cup);

  // Handles (two halves of a torus on each side)
  const handleGeom = new THREE.TorusGeometry(0.22, 0.03, 16, 64, Math.PI);
  const left = new THREE.Mesh(handleGeom, material);
  left.position.set(-0.50, 0.35, 0);
  left.rotation.set(0, Math.PI / 2, Math.PI / 2);
  trophy.add(left);
  const right = new THREE.Mesh(handleGeom, material);
  right.position.set(0.50, 0.35, 0);
  right.rotation.set(0, -Math.PI / 2, Math.PI / 2);
  trophy.add(right);

  // Top accent
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 24), material);
  top.position.y = 0.78;
  trophy.add(top);

  return trophy;
}

export function mountFinal({ canvas }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080808);

  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 4.4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene.add(new THREE.AmbientLight(0x202428, 0.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(2, 4, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 2.4);
  rim.position.set(0, 5, -3); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xaab5c4, 0.6);
  fill.position.set(-3, 1, 2); scene.add(fill);

  const mat = createChromeMaterial(renderer, { roughness: 0.14, envMapIntensity: 1.6 });
  const trophy = buildTrophy(mat);
  trophy.position.y = 0.05;
  scene.add(trophy);

  gsap.to(trophy.rotation, { y: Math.PI * 2, repeat: -1, duration: 18, ease: 'none' });
  gsap.to(trophy.position, { y: 0.18, yoyo: true, repeat: -1, duration: 4, ease: 'sine.inOut' });

  let mounted = true;

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  function tick() {
    if (!mounted) return;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  return {
    dispose() {
      mounted = false;
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    }
  };
}
