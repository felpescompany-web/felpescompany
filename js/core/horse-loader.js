import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const HORSE_PATH = '/assets/models/horse.glb';

let cachedScene = null;
let loadPromise = null;

function buildPlaceholder() {
  const group = new THREE.Group();
  const geom = new THREE.BoxGeometry(1.2, 1.2, 1.2);
  const mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({ color: 0xC0C0C0, wireframe: true }));
  mesh.name = 'PLACEHOLDER_CUBE';
  group.add(mesh);
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
