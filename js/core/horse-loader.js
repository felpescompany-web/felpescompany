import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const HORSE_PATH = new URL('../../assets/models/horse.glb', import.meta.url).href;

let cachedScene = null;
let loadPromise = null;

function buildPlaceholder() {
  const group = new THREE.Group();
  // Elegant chrome sculpture instead of a cube — luxe placeholder
  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.8, 0.22, 220, 32, 2, 3),
    new THREE.MeshStandardMaterial({ color: 0xE8E8E8, metalness: 1.0, roughness: 0.18 })
  );
  knot.name = 'PLACEHOLDER_KNOT';
  group.add(knot);
  // Subtle inner orbital ring
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.15, 0.012, 8, 128),
    new THREE.MeshStandardMaterial({ color: 0xC0C0C0, metalness: 1.0, roughness: 0.3 })
  );
  ring.rotation.x = Math.PI / 2.2;
  group.add(ring);
  group.userData.isPlaceholder = true;
  return group;
}

export function loadHorse() {
  if (cachedScene) {
    return Promise.resolve(cachedScene.clone(true));
  }
  if (loadPromise) return loadPromise.then((s) => s.clone(true));

  const loader = new GLTFLoader();
  loadPromise = new Promise((resolve) => {
    loader.load(
      HORSE_PATH,
      (gltf) => {
        cachedScene = gltf.scene;
        const box = new THREE.Box3().setFromObject(cachedScene);
        const center = box.getCenter(new THREE.Vector3());
        cachedScene.position.sub(center);
        const size = box.getSize(new THREE.Vector3()).length();
        const scale = 2.4 / size;
        cachedScene.scale.setScalar(scale);

        const wrapper = new THREE.Group();
        wrapper.add(cachedScene);
        cachedScene = wrapper;

        resolve(cachedScene.clone(true));
      },
      undefined,
      (err) => {
        console.warn('[horse-loader] Falha ao carregar horse.glb. Usando placeholder.', err);
        cachedScene = buildPlaceholder();
        resolve(cachedScene.clone(true));
      }
    );
  });

  return loadPromise;
}

export function applyWireframe(object3d, color = 0xC0C0C0, opacity = 0.55) {
  const mat = new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity,
  });
  object3d.traverse((child) => {
    if (child.isMesh) child.material = mat;
  });
  return object3d;
}
