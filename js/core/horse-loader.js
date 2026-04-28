import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { buildProceduralHorse } from './procedural-horse.js';

const HORSE_PATH = new URL('../../assets/models/horse.glb', import.meta.url).href;

let cachedScene = null;
let loadPromise = null;

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
      () => {
        cachedScene = buildProceduralHorse();
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
