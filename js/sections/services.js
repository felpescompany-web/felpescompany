import * as THREE from 'three';
import { loadHorse } from '../core/horse-loader.js';
import { applyChromeToObject } from '../core/chrome-material.js';
import { createDustField } from '../core/dust.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

export const SERVICES = [
  { num: '01', nome: 'Design Gráfico',                desc: 'Peças visuais que comunicam poder antes de qualquer palavra.', categoria: 'Visual' },
  { num: '02', nome: 'Branding e Identidade Visual',  desc: 'Do logo ao manual — construímos a alma da sua marca.',         categoria: 'Marca' },
  { num: '03', nome: 'Criação de Sites',              desc: 'Experiências digitais que impressionam e convertem.',          categoria: 'Digital' },
  { num: '04', nome: 'Marketing Digital',             desc: 'Estratégia que coloca sua marca onde ela precisa estar.',      categoria: 'Growth' },
  { num: '05', nome: 'Projetos Arquitetônicos',       desc: 'Espaços que existem antes mesmo de serem construídos.',        categoria: 'Espaço' },
  { num: '06', nome: 'Embalagem e Packaging',         desc: 'O produto que seduz antes de ser aberto.',                     categoria: 'Produto' },
  { num: '07', nome: 'Pitch Deck e Apresentações',    desc: 'Ideias que vencem antes da reunião terminar.',                 categoria: 'Estratégia' },
  { num: '08', nome: 'SEO e Tráfego Pago',            desc: 'Sua marca encontrada por quem já quer comprar.',               categoria: 'Performance' },
];

const POSES = [
  { ry:  0.0,  rx:  0.0  },
  { ry:  0.4,  rx: -0.05 },
  { ry: -0.4,  rx:  0.05 },
  { ry:  0.8,  rx:  0.0  },
  { ry: -0.8,  rx: -0.08 },
  { ry:  0.3,  rx:  0.15 },
  { ry: -0.3,  rx: -0.15 },
  { ry:  0.0,  rx:  0.05 },
];

export function mountServices({ canvas, sectionEl, slidesContainer, dotsContainer }) {
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

  scene.add(new THREE.AmbientLight(0x202428, 0.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(3, 4, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 2.0);
  rim.position.set(0, 5, -3); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xaab5c4, 0.5);
  fill.position.set(-3, 1, 2); scene.add(fill);

  const dust = createDustField({ count: 600, radius: 14 });
  scene.add(dust);

  let horse = null;
  let mounted = true;
  const clock = new THREE.Clock();

  loadHorse().then((h) => {
    if (!mounted) return;
    horse = applyChromeToObject(h, renderer);
    horse.scale.setScalar(1.0);
    scene.add(horse);
    gsap.to(horse.position, { y: '+=0.12', yoyo: true, repeat: -1, duration: 3.4, ease: 'sine.inOut' });
  });

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  function tick() {
    if (!mounted) return;
    const dt = clock.getDelta() * 60;
    dust.userData.tick(dt);
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  slidesContainer.innerHTML = '';
  dotsContainer.innerHTML = '';

  const slideEls = SERVICES.map((s, i) => {
    const article = document.createElement('article');
    article.className = 'service-slide';
    article.innerHTML = `
      <div class="service-left">
        <div class="service-num silver-gradient">${s.num}</div>
        <h2 class="service-name">${s.nome}</h2>
        <p class="service-desc">${s.desc}</p>
      </div>
      <div class="service-right">
        <div class="service-cat-line"></div>
        <div class="service-cat tracked-wide">${s.categoria}</div>
        <div class="service-index tracked">${i + 1} / ${SERVICES.length}</div>
      </div>
    `;
    slidesContainer.appendChild(article);
    return article;
  });

  const dotEls = SERVICES.map((_, i) => {
    const d = document.createElement('span');
    d.className = 'service-dot' + (i === 0 ? ' active' : '');
    dotsContainer.appendChild(d);
    return d;
  });

  ScrollTrigger.create({
    trigger: sectionEl,
    start: 'top top',
    end: 'bottom bottom',
    pin: '.services-pin',
    pinSpacing: false,
  });

  slideEls.forEach((slide, i) => {
    gsap.set(slide, { opacity: 0, y: 60 });
    ScrollTrigger.create({
      trigger: sectionEl,
      start: `top+=${i * window.innerHeight} top`,
      end: `top+=${(i + 1) * window.innerHeight} top`,
      onEnter: () => animateTo(i),
      onEnterBack: () => animateTo(i),
    });
  });

  function animateTo(i) {
    slideEls.forEach((s, idx) => {
      if (idx === i) {
        gsap.to(s, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
      } else {
        gsap.to(s, { opacity: 0, y: idx < i ? -40 : 60, duration: 0.5, ease: 'power2.in' });
      }
    });
    dotEls.forEach((d, idx) => d.classList.toggle('active', idx === i));
    if (horse) {
      gsap.to(horse.rotation, {
        x: POSES[i].rx,
        y: POSES[i].ry,
        duration: 1.0,
        ease: 'power2.inOut',
      });
    }
  }

  return {
    dispose() {
      mounted = false;
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    }
  };
}
