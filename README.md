# Felpes Company

> Todo império começa com uma identidade.

Site institucional da Felpes Company — luxo minimalista (preto + prata), com cavalo 3D chrome, scroll suave, animações GSAP e transição final em wormhole GLSL.

## Stack

- **Three.js** — modelos 3D, materiais chrome, PMREM env map
- **GSAP + ScrollTrigger** — animações scroll-driven
- **Lenis** — scroll inercial suave
- **GLSL Shaders** — efeito wormhole na transição final
- **HTML estático + importmap CDN** — sem build step

## Como rodar

```bash
# Servir local (precisa de um servidor pra ESM imports + loader de modelos):
python3 -m http.server 8000
```

Depois abra:

- **Site completo**: `http://localhost:8000/index.html`
- **Seções isoladas**:
  - `http://localhost:8000/sections/1-loading.html`
  - `http://localhost:8000/sections/2-hero.html`
  - `http://localhost:8000/sections/3-services.html`
  - `http://localhost:8000/sections/4-final.html`
  - `http://localhost:8000/sections/5-wormhole.html`

## Asset 3D requerido

Coloque o modelo do cavalo em:

```
assets/models/horse.glb
```

(Sem o arquivo, o site sobe normal e mostra um cubo wireframe placeholder no lugar do cavalo, com warning no console.)

O troféu é gerado proceduralmente em Three.js — não precisa de asset externo.

## Estrutura

```
.
├── index.html                Site final integrado
├── sections/                 Cada seção como HTML standalone testável
│   ├── 1-loading.html
│   ├── 2-hero.html
│   ├── 3-services.html
│   ├── 4-final.html
│   └── 5-wormhole.html
├── assets/models/horse.glb   (você sobe)
├── css/style.css             Tokens + utilities
└── js/
    ├── core/
    │   ├── lenis.js          Lenis + GSAP ticker
    │   ├── chrome-material.js MeshStandardMaterial chrome + PMREM
    │   └── horse-loader.js   GLTFLoader cacheado (Promise singleton)
    ├── sections/
    │   ├── loading.js
    │   ├── hero.js
    │   ├── services.js
    │   ├── final.js          Troféu procedural (Lathe + Box + Torus)
    │   └── wormhole.js
    ├── shaders/
    │   ├── wormhole.vert.js
    │   └── wormhole.frag.js
    └── main.js               Orquestrador do index.html
```

## Fluxo

1. **Loading** (~3s): cavalo wireframe gira, barra prata preenche, logo fade-in, botão "Entrar"
2. **Hero**: cavalo chrome no centro, parallax mouse, indicador de scroll
3. **Services**: cavalo sticky no centro, 8 serviços passam ao redor com ScrollTrigger, dots no rodapé
4. **Final**: troféu chrome flutuando, slogan, CTA "Construa a sua"
5. **Wormhole**: ao clicar o CTA, cavalo galopa pro centro, tunel GLSL se abre, raios de luz, colapso → contact

## Paleta

```
--bg:            #080808
--silver:        #C0C0C0
--silver-bright: #E8E8E8
--muted:         #444444
```

## Tipografia

- **Serif** (display): Georgia
- **Sans** (UI): Inter / system stack
