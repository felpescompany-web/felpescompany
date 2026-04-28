import { initLenis, getLenis } from './core/lenis.js';
import { mountLoading } from './sections/loading.js';
import { mountHero } from './sections/hero.js';
import { mountServices } from './sections/services.js';
import { mountFinal } from './sections/final.js';
import { mountWormhole } from './sections/wormhole.js';

const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
window.MAIN_LOADED = true;
gsap.registerPlugin(ScrollTrigger);

const els = {
  loadingRoot:     document.getElementById('loadingRoot'),
  loadingCanvas:   document.getElementById('loadingCanvas'),
  loadingProgress: document.getElementById('loadingProgress'),
  loadingBrand:    document.getElementById('loadingBrand'),
  loadingEnter:    document.getElementById('loadingEnter'),
  heroCanvas:      document.getElementById('heroCanvas'),
  scrollLine:      document.getElementById('scrollLine'),
  servicesSection: document.getElementById('servicesSection'),
  servicesCanvas:  document.getElementById('servicesCanvas'),
  servicesSlides:  document.getElementById('servicesSlides'),
  servicesDots:    document.getElementById('servicesDots'),
  finalCanvas:     document.getElementById('finalCanvas'),
  finalCTA:        document.getElementById('finalCTA'),
  wormholeOverlay: document.getElementById('wormholeOverlay'),
  wormholeCanvas:  document.getElementById('wormholeCanvas'),
};

document.body.style.overflow = 'hidden';

const loadingCtrl = mountLoading({
  canvas: els.loadingCanvas,
  onComplete: () => {
    els.loadingRoot.style.display = 'none';
    bootMain();
  },
});

loadingCtrl.playSequence({
  progressEl: els.loadingProgress,
  brandEl:    els.loadingBrand,
  buttonEl:   els.loadingEnter,
  durationMs: 2400,
});

let mainMounted = false;

function bootMain() {
  if (mainMounted) return;
  mainMounted = true;
  document.body.style.overflow = '';
  initLenis();
  mountHero({ canvas: els.heroCanvas });
  gsap.to(els.scrollLine, {
    scaleY: 0.3,
    opacity: 0.4,
    duration: 1.2,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
  });
  mountServices({
    canvas: els.servicesCanvas,
    sectionEl: els.servicesSection,
    slidesContainer: els.servicesSlides,
    dotsContainer:   els.servicesDots,
  });
  mountFinal({ canvas: els.finalCanvas });

  let wormholeCtrl = null;
  els.finalCTA.addEventListener('click', () => {
    if (wormholeCtrl) return;
    els.wormholeOverlay.classList.add('active');
    const lenis = getLenis();
    if (lenis) lenis.stop();
    wormholeCtrl = mountWormhole({ canvas: els.wormholeCanvas });
    wormholeCtrl.play({
      onComplete: () => {
        const placeholder = document.getElementById('contactPlaceholder');
        if (placeholder) placeholder.classList.add('show');
      },
    });
  });
}

els.loadingEnter.addEventListener('click', () => {
  loadingCtrl.fadeOut();
});
