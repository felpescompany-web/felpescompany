import * as THREE from 'three';
import gsap from 'gsap';
import vertexShader from '../shaders/wormhole.vert.js';
import fragmentShader from '../shaders/wormhole.frag.js';
import { loadHorse } from '../core/horse-loader.js';
import { applyChromeToObject } from '../core/chrome-material.js';

export function mountWormhole({ canvas }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x080808);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.set(0, 0, 4);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Wormhole shader plane (background)
  const uniforms = {
    uTime:       { value: 0 },
    uProgress:   { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  };
  const planeGeom = new THREE.PlaneGeometry(2, 2);
  const planeMat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    depthTest: false,
    depthWrite: false,
  });
  const plane = new THREE.Mesh(planeGeom, planeMat);
  plane.frustumCulled = false;
  // Render fullscreen-style plane behind everything via separate scene
  const bgScene = new THREE.Scene();
  const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  bgScene.add(plane);

  // Lights for horse
  scene.add(new THREE.AmbientLight(0x303438, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(2, 4, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 2.6);
  rim.position.set(0, 5, -3); scene.add(rim);

  let horse = null;
  let mounted = true;

  loadHorse().then((h) => {
    if (!mounted) return;
    horse = applyChromeToObject(h, renderer);
    horse.scale.setScalar(1.3);
    horse.position.set(6, -0.4, -3);
    horse.rotation.y = -Math.PI * 0.25;
    scene.add(horse);
  });

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  const clock = new THREE.Clock();
  function tick() {
    if (!mounted) return;
    uniforms.uTime.value = clock.getElapsedTime();
    renderer.autoClear = true;
    renderer.render(bgScene, bgCamera);
    renderer.autoClear = false;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  function play({ onComplete } = {}) {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });

    // 0–1s: horse galops to center
    tl.to({}, { duration: 0.0 });
    if (horse) {
      tl.to(horse.position, {
        x: 0, y: 0, z: 0.5,
        duration: 1.2,
        ease: 'power2.in',
      }, 0)
      .to(horse.rotation, {
        y: 0,
        duration: 1.2,
        ease: 'power2.in',
      }, 0)
      .to(horse.position, {
        y: '+=0.10',
        repeat: 6,
        yoyo: true,
        duration: 0.1,
        ease: 'sine.inOut',
      }, 0);
    }

    // 0.5–2s: wormhole opens
    tl.to(uniforms.uProgress, {
      value: 1.0,
      duration: 1.6,
      ease: 'power2.inOut',
    }, 0.5);

    // 2.0–2.6s: horse dives in (scale to 0 + camera dolly)
    if (horse) {
      tl.to(horse.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.7, ease: 'power3.in' }, 2.0)
        .to(horse.position, { z: -0.5, duration: 0.7, ease: 'power3.in' }, 2.0);
    }
    tl.to(camera, { fov: 22, duration: 0.7, ease: 'power3.in', onUpdate: () => camera.updateProjectionMatrix() }, 2.0);

    // 2.6–3s: collapse
    tl.to(canvas, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 2.6);

    return tl;
  }

  return {
    play,
    dispose() {
      mounted = false;
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    }
  };
}
