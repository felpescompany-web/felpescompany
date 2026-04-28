import * as THREE from 'three';
import gsap from 'gsap';
import { loadHorse, applyWireframe } from '../core/horse-loader.js';

export function mountLoading({ canvas, onComplete }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x080808, 1);

  let horse = null;
  let mounted = true;

  loadHorse().then((h) => {
    if (!mounted) return;
    horse = applyWireframe(h, 0xC0C0C0, 0.55);
    horse.scale.setScalar(1.1);
    scene.add(horse);
  });

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  const clock = new THREE.Clock();
  function tick() {
    if (!mounted) return;
    const t = clock.getElapsedTime();
    if (horse) {
      horse.rotation.y = t * 0.35;
      horse.position.y = Math.sin(t * 1.4) * 0.06;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  return {
    playSequence({ progressEl, brandEl, buttonEl, durationMs = 2400 }) {
      const tl = gsap.timeline();
      tl.to(progressEl, { width: '100%', duration: durationMs / 1000, ease: 'power2.out' });
      tl.call(() => {
        if (horse) {
          horse.traverse((c) => {
            if (c.isMesh) {
              gsap.to(c.material, { opacity: 0, duration: 0.7, ease: 'power2.out' });
            }
          });
        }
      });
      tl.to(brandEl, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' }, '-=0.2');
      tl.to(buttonEl, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, '-=0.3');
      return tl;
    },
    fadeOut() {
      return gsap.to(canvas.parentElement, { opacity: 0, duration: 0.8, ease: 'power2.inOut', onComplete: () => {
        mounted = false;
        renderer.dispose();
        if (onComplete) onComplete();
      }});
    },
    dispose() {
      mounted = false;
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    }
  };
}
