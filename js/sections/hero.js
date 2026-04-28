import * as THREE from 'three';
import { loadHorse } from '../core/horse-loader.js';
import { applyChromeToObject } from '../core/chrome-material.js';
import { createDustField } from '../core/dust.js';

const gsap = window.gsap;

export function mountHero({ canvas }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080808);

  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0.2, 5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 4, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xaab5c4, 0.6);
  fill.position.set(-3, 1, 2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 2.2);
  rim.position.set(0, 5, -3);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0x202428, 0.4));

  const dust = createDustField({ count: 700, radius: 14 });
  scene.add(dust);

  let horse = null;
  let mounted = true;
  const target = { rx: 0, ry: 0, cx: 0, cy: 0 };
  const current = { rx: 0, ry: 0, cx: 0, cy: 0 };

  loadHorse().then((h) => {
    if (!mounted) return;
    horse = applyChromeToObject(h, renderer);
    horse.scale.setScalar(1.4);
    scene.add(horse);
    gsap.to(horse.position, {
      y: '+=0.15',
      yoyo: true,
      repeat: -1,
      duration: 3,
      ease: 'sine.inOut',
    });
  });

  function onMouse(e) {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = (e.clientY / window.innerHeight) * 2 - 1;
    target.ry = x * 0.4;
    target.rx = -y * 0.2;
    target.cx = x * 0.18;
    target.cy = -y * 0.12;
  }
  window.addEventListener('mousemove', onMouse);

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  const clock = new THREE.Clock();
  function tick() {
    if (!mounted) return;
    const dt = clock.getDelta() * 60;
    current.rx += (target.rx - current.rx) * 0.08;
    current.ry += (target.ry - current.ry) * 0.08;
    current.cx += (target.cx - current.cx) * 0.06;
    current.cy += (target.cy - current.cy) * 0.06;
    if (horse) {
      horse.rotation.x = current.rx;
      horse.rotation.y = current.ry;
    }
    dust.userData.tick(dt);
    camera.position.x = current.cx;
    camera.position.y = 0.2 + current.cy;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  return {
    scene,
    camera,
    renderer,
    getHorse: () => horse,
    dispose() {
      mounted = false;
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    }
  };
}
