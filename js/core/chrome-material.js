import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const envCache = new WeakMap();

export function getEnvMap(renderer) {
  if (envCache.has(renderer)) return envCache.get(renderer);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  pmrem.dispose();

  envCache.set(renderer, env);
  return env;
}

export function createChromeMaterial(renderer, opts = {}) {
  const envMap = getEnvMap(renderer);
  return new THREE.MeshStandardMaterial({
    color: opts.color ?? 0xE8E8E8,
    metalness: opts.metalness ?? 1.0,
    roughness: opts.roughness ?? 0.18,
    envMap,
    envMapIntensity: opts.envMapIntensity ?? 1.4,
  });
}

export function applyChromeToObject(object3d, renderer, opts) {
  const mat = createChromeMaterial(renderer, opts);
  object3d.traverse((child) => {
    if (child.isMesh) {
      child.material = mat;
      child.castShadow = false;
      child.receiveShadow = false;
    }
  });
  return object3d;
}
