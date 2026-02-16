# V2 Portfolio Website Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild ryan-little.com as a modern Vite + Three.js site with a photorealistic 3D Earth globe, orbiting satellites, animated page transitions, and a polished shooting star minigame.

**Architecture:** Vite bundles vanilla ES modules. Three.js renders a 3D scene (Earth, satellites, starfield). A lightweight SPA router handles page navigation with camera zoom transitions. Content loads from JSON. Single responsive layout serves all devices.

**Tech Stack:** Vite 6, Three.js (r170+), vanilla JavaScript (ES modules), CSS3 (Grid, custom properties, transitions), GitHub Pages deployment.

**Design Doc:** `docs/plans/2026-02-15-v2-redesign-design.md`

---

## Phase 0: Project Setup

### Task 1: Move v1 files and initialize v2 project

**Files:**
- Move: all current root files → `v1/`
- Create: `v2/package.json`
- Create: `v2/vite.config.js`
- Create: `v2/index.html`
- Create: `v2/src/main.js`
- Create: `v2/src/styles/global.css`

**Step 1: Move existing site to v1 directory**

```bash
mkdir v1
# Move all site files (not git/docs/node_modules) into v1
mv index.html index-desktop.html index-mobile.html 404.html v1/
mv src v1/src
mv assets v1/assets
mv sw.js manifest.json robots.txt sitemap.xml v1/
mv CNAME v1/ 2>/dev/null
mv CHANGELOG.md REFACTORING_PLAN.md README.md v1/
```

Keep `docs/`, `CLAUDE.md`, and `.git` in root.

**Step 2: Initialize Vite project**

```bash
cd v2
npm init -y
npm install vite three
npm install -D @vitejs/plugin-legacy  # Optional: legacy browser support
```

**Step 3: Create vite.config.js**

```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

**Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ryan Little - Geospatial Analyst</title>
    <meta name="description" content="Ryan Little - Geospatial Analyst with expertise in GIS, Remote Sensing, and Spatial Analysis.">
    <meta name="theme-color" content="#0a0a1a">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <!-- Three.js canvas renders here -->
    <div id="scene-container"></div>

    <!-- HTML overlay for labels, UI, pages -->
    <div id="ui-overlay">
        <div id="hero-text">
            <h1 class="hero-title">Ryan Little</h1>
            <p class="hero-subtitle">Geospatial Analyst</p>
        </div>
        <div id="social-links">
            <a href="https://linkedin.com/in/rpdlittle" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
            <a href="mailto:ryan@ryanpdlittle.com" aria-label="Email"><i class="fas fa-envelope"></i></a>
            <a href="https://github.com/ryan-little" target="_blank" rel="noopener" aria-label="GitHub"><i class="fab fa-github"></i></a>
            <a href="https://littlehammerlabs.com" target="_blank" rel="noopener" aria-label="Little Hammer Labs"><img src="/images/lhlhammer_transback.webp" alt="Little Hammer Labs" class="social-icon-image"></a>
        </div>
    </div>

    <!-- Page content container (populated by router) -->
    <div id="page-container" class="hidden"></div>

    <!-- Game UI overlay -->
    <div id="game-overlay" class="hidden"></div>

    <script type="module" src="/src/main.js"></script>
</body>
</html>
```

**Step 5: Create global.css**

```css
:root {
    --color-bg: #0a0a1a;
    --color-text: #ffffff;
    --color-text-muted: #a0a0b0;
    --color-accent: #4a9eff;
    --color-accent-warm: #ffa500;
    --font-primary: 'Inter', system-ui, sans-serif;
    --transition-fast: 0.2s ease;
    --transition-medium: 0.5s ease;
    --transition-slow: 1s ease;
}

*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-primary);
    -webkit-font-smoothing: antialiased;
}

#scene-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

#scene-container canvas {
    display: block;
}

#ui-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 5vh;
}

#ui-overlay a, #ui-overlay button {
    pointer-events: auto;
}

#hero-text {
    text-align: center;
    pointer-events: none;
}

.hero-title {
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    text-shadow: 0 2px 20px rgba(0, 0, 0, 0.8);
}

.hero-subtitle {
    font-size: clamp(0.9rem, 2vw, 1.3rem);
    font-weight: 300;
    color: var(--color-text-muted);
    margin-top: 0.5rem;
    text-shadow: 0 1px 10px rgba(0, 0, 0, 0.6);
}

#social-links {
    display: flex;
    gap: 1.5rem;
    margin-top: 1.5rem;
    pointer-events: auto;
}

#social-links a {
    color: var(--color-text);
    font-size: 1.4rem;
    opacity: 0.7;
    transition: opacity var(--transition-fast), transform var(--transition-fast);
    text-decoration: none;
}

#social-links a:hover {
    opacity: 1;
    transform: translateY(-2px);
}

.social-icon-image {
    width: 1.4rem;
    height: 1.4rem;
    object-fit: contain;
    filter: brightness(0.7);
    transition: filter var(--transition-fast);
}

#social-links a:hover .social-icon-image {
    filter: brightness(1);
}

#page-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 20;
    overflow-y: auto;
    background: rgba(10, 10, 26, 0.95);
    transition: opacity var(--transition-medium), transform var(--transition-medium);
}

#page-container.hidden {
    opacity: 0;
    pointer-events: none;
    transform: scale(1.02);
}

#game-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 30;
    pointer-events: none;
}

#game-overlay.hidden {
    display: none;
}

.hidden {
    display: none;
}
```

**Step 6: Create main.js entry point (skeleton)**

```javascript
import './styles/global.css';

console.log('v2 initializing...');

// App initialization will be added as modules are built
async function init() {
    const container = document.getElementById('scene-container');
    if (!container) {
        console.error('Scene container not found');
        return;
    }
    console.log('Scene container ready:', container.clientWidth, 'x', container.clientHeight);
}

init();
```

**Step 7: Copy assets to v2/public**

```bash
mkdir -p v2/public/images v2/public/textures v2/public/satellites v2/public/galaxies
# Copy content images from v1
cp v1/assets/images_webp/*.webp v2/public/images/
# Copy pixel art shooting star
cp v1/assets/images/shootingstar.png v2/public/
cp v1/assets/images_webp/shootingstar.webp v2/public/
# Copy social icon
cp v1/assets/images_webp/lhlhammer_transback.webp v2/public/images/
# Copy content.json
mkdir -p v2/src/data
cp v1/src/data/content.json v2/src/data/
```

**Step 8: Verify dev server runs**

```bash
cd v2 && npx vite
```

Open http://localhost:3000. Expect: black page with "Ryan Little / Geospatial Analyst" text and social links. Console shows "v2 initializing..." and scene container dimensions.

**Step 9: Commit**

```bash
git add v1/ v2/ docs/
git commit -m "feat: move v1 to subdirectory, initialize v2 Vite project"
```

---

## Phase 1: Core 3D Scene

### Task 2: Three.js scene setup

**Files:**
- Create: `v2/src/globe/scene.js`
- Modify: `v2/src/main.js`

**Step 1: Create scene.js with renderer, camera, and render loop**

```javascript
import * as THREE from 'three';

let scene, camera, renderer;
let animationId = null;
const clock = new THREE.Clock();

export function initScene(container) {
    // Scene
    scene = new THREE.Scene();

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
    camera.position.set(0, 0, 5);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: window.devicePixelRatio < 2,
        alpha: false,
        powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a1a, 1);
    container.appendChild(renderer.domElement);

    // Resize handling
    const onResize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    // Start render loop
    function animate() {
        animationId = requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.1); // Clamp delta to prevent jumps
        // Update callbacks will be added here
        renderer.render(scene, camera);
    }
    animate();

    return { scene, camera, renderer, clock };
}

export function getScene() { return scene; }
export function getCamera() { return camera; }
export function getRenderer() { return renderer; }

// Callbacks for modules to hook into the render loop
const updateCallbacks = [];
export function onUpdate(callback) {
    updateCallbacks.push(callback);
}
export function removeUpdate(callback) {
    const idx = updateCallbacks.indexOf(callback);
    if (idx !== -1) updateCallbacks.splice(idx, 1);
}
```

Update the animate function to call update callbacks:

```javascript
function animate() {
    animationId = requestAnimationFrame(animate);
    const delta = Math.min(clock.getDelta(), 0.1);
    for (const cb of updateCallbacks) cb(delta);
    renderer.render(scene, camera);
}
```

**Step 2: Update main.js to init scene**

```javascript
import './styles/global.css';
import { initScene } from './globe/scene.js';

async function init() {
    const container = document.getElementById('scene-container');
    if (!container) return;

    const { scene } = initScene(container);

    // Temporary: add a test sphere to verify rendering
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x4a9eff, wireframe: true });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
}

import * as THREE from 'three';
init();
```

**Step 3: Verify in browser**

Open http://localhost:3000. Expect: blue wireframe sphere centered on screen against dark background. Resizing window should update proportionally.

**Step 4: Commit**

```bash
git add v2/src/globe/scene.js v2/src/main.js
git commit -m "feat: add Three.js scene setup with renderer, camera, and render loop"
```

---

### Task 3: Earth mesh with day texture

**Files:**
- Create: `v2/src/globe/earth.js`
- Modify: `v2/src/main.js`

**Note:** For initial development, use a placeholder Earth texture. NASA Blue Marble textures will be sourced and optimized in the polish phase. For now, use a free low-res Earth texture or a procedural blue sphere.

**Step 1: Create earth.js**

```javascript
import * as THREE from 'three';
import { getScene, onUpdate } from './scene.js';

let earthMesh = null;
const EARTH_RADIUS = 1;
const ROTATION_SPEED = (2 * Math.PI) / 60; // 1 revolution per 60 seconds

export async function createEarth() {
    const scene = getScene();
    const isMobile = window.innerWidth < 768;
    const segments = isMobile ? 32 : 64;

    const geometry = new THREE.SphereGeometry(EARTH_RADIUS, segments, segments);

    // Load day texture
    const textureLoader = new THREE.TextureLoader();
    const dayTexture = await new Promise((resolve, reject) => {
        textureLoader.load('/textures/earth-day.jpg', resolve, undefined, reject);
    });
    dayTexture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshPhongMaterial({
        map: dayTexture,
        shininess: 5,
    });

    earthMesh = new THREE.Mesh(geometry, material);
    scene.add(earthMesh);

    // Add ambient light so Earth is visible
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Add directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(5, 2, 5);
    scene.add(sunLight);

    // Register rotation in update loop
    onUpdate((delta) => {
        if (earthMesh) {
            earthMesh.rotation.y += ROTATION_SPEED * delta;
        }
    });

    return earthMesh;
}

export function getEarth() { return earthMesh; }
```

**Step 2: Get a placeholder Earth texture**

For development, download a free low-res Earth texture to `v2/public/textures/earth-day.jpg`. NASA's visible Earth page has public domain options. A 1024x512 equirectangular map works.

Alternatively, create a simple procedural texture or use a solid blue sphere for now and swap textures later.

**Step 3: Update main.js**

```javascript
import './styles/global.css';
import { initScene } from './globe/scene.js';
import { createEarth } from './globe/earth.js';

async function init() {
    const container = document.getElementById('scene-container');
    if (!container) return;

    initScene(container);
    await createEarth();
}

init();
```

**Step 4: Verify in browser**

Expect: textured Earth sphere slowly rotating. Lit from one side (simulated sun). Dark on the other side.

**Step 5: Commit**

```bash
git add v2/src/globe/earth.js v2/src/main.js v2/public/textures/
git commit -m "feat: add rotating Earth mesh with day texture"
```

---

### Task 4: Day/night shader with sun position

**Files:**
- Create: `v2/src/globe/lighting.js`
- Modify: `v2/src/globe/earth.js`

**Step 1: Create lighting.js with sun position calculator**

```javascript
/**
 * Calculate the sun's direction vector based on current UTC time.
 * Uses a simplified solar position algorithm.
 */
export function getSunDirection() {
    const now = new Date();
    const dayOfYear = getDayOfYear(now);
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;

    // Solar declination (simplified)
    const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));
    const declinationRad = (declination * Math.PI) / 180;

    // Hour angle: sun is at longitude = (12 - utcHours) * 15 degrees
    const hourAngle = ((12 - utcHours) * 15 * Math.PI) / 180;

    // Convert to 3D direction vector
    const x = Math.cos(declinationRad) * Math.sin(hourAngle);
    const y = Math.sin(declinationRad);
    const z = Math.cos(declinationRad) * Math.cos(hourAngle);

    return { x, y, z };
}

function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}
```

**Step 2: Create custom shader material in earth.js**

Replace the simple `MeshPhongMaterial` with a custom `ShaderMaterial` that blends day and night textures based on the sun direction.

```javascript
// In earth.js - custom shader uniforms:
const uniforms = {
    dayTexture: { value: dayTexture },
    nightTexture: { value: nightTexture },
    sunDirection: { value: new THREE.Vector3() },
};

// Vertex shader: pass normal and UV to fragment
const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

// Fragment shader: blend day/night based on sun angle
const fragmentShader = `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec3 sunDirection;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
        vec4 dayColor = texture2D(dayTexture, vUv);
        vec4 nightColor = texture2D(nightTexture, vUv);

        // Dot product of surface normal with sun direction
        float intensity = dot(vNormal, normalize(sunDirection));

        // Smooth transition at terminator (-0.1 to 0.1)
        float blend = smoothstep(-0.1, 0.1, intensity);

        // Day side gets lit, night side shows city lights
        vec4 dayLit = dayColor * (0.3 + 0.7 * max(intensity, 0.0));
        vec4 nightLit = nightColor * (1.0 - blend);

        gl_FragColor = mix(nightLit, dayLit, blend);
    }
`;
```

**Step 3: Update sun direction each frame**

```javascript
// In the update callback:
onUpdate((delta) => {
    if (earthMesh) {
        earthMesh.rotation.y += ROTATION_SPEED * delta;
        const sun = getSunDirection();
        earthMesh.material.uniforms.sunDirection.value.set(sun.x, sun.y, sun.z);
    }
});
```

**Step 4: Verify in browser**

Expect: Earth with visible day/night split. The night side should show city lights texture (or be dark if night texture not yet available). The terminator line should match approximately the real-world position based on current time.

**Step 5: Commit**

```bash
git add v2/src/globe/lighting.js v2/src/globe/earth.js
git commit -m "feat: add day/night shader with real-time sun position"
```

---

### Task 5: Atmosphere glow effect

**Files:**
- Modify: `v2/src/globe/earth.js`

**Step 1: Add atmosphere mesh**

```javascript
function createAtmosphere() {
    const geometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.015, 64, 64);
    const material = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 0.8;
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
    });

    return new THREE.Mesh(geometry, material);
}
```

**Step 2: Verify** - thin blue glow rim around Earth edges.

**Step 3: Commit**

---

### Task 6: Starfield particle system

**Files:**
- Create: `v2/src/globe/starfield.js`
- Modify: `v2/src/main.js`

**Step 1: Create starfield.js**

```javascript
import * as THREE from 'three';
import { getScene, onUpdate } from './scene.js';

const STAR_COUNT = 3000;
const STAR_SPHERE_RADIUS = 500;

export function createStarfield() {
    const scene = getScene();
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);

    for (let i = 0; i < STAR_COUNT; i++) {
        // Distribute on sphere surface
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = STAR_SPHERE_RADIUS;

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Slight color variation (white, blue-white, yellow-white)
        const colorVariant = Math.random();
        if (colorVariant < 0.7) {
            colors[i * 3] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 1.0;
        } else if (colorVariant < 0.85) {
            colors[i * 3] = 0.8; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 1.0;
        } else {
            colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 0.8;
        }

        // Size variation
        sizes[i] = Math.random() * 1.5 + 0.5;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
        size: 1.0,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: false,
        depthWrite: false,
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);

    // Subtle twinkling
    const twinkleIndices = [];
    for (let i = 0; i < 200; i++) {
        twinkleIndices.push(Math.floor(Math.random() * STAR_COUNT));
    }

    onUpdate((delta) => {
        const time = performance.now() * 0.001;
        const sizeAttr = geometry.getAttribute('size');
        for (const idx of twinkleIndices) {
            sizeAttr.array[idx] = (Math.sin(time * (2 + idx % 3)) * 0.5 + 1.0) * sizes[idx];
        }
        sizeAttr.needsUpdate = true;
    });

    return stars;
}
```

**Step 2: Add to main.js**

```javascript
import { createStarfield } from './globe/starfield.js';
// ... in init():
createStarfield();
```

**Step 3: Verify** - thousands of stars surrounding the scene, some subtly twinkling.

**Step 4: Commit**

---

### Task 7: Galaxy/nebula sprites

**Files:**
- Modify: `v2/src/globe/starfield.js`

**Step 1: Add galaxy sprite loader**

```javascript
export function addGalaxySprites() {
    const scene = getScene();
    const textureLoader = new THREE.TextureLoader();

    const galaxyConfigs = [
        { path: '/galaxies/nebula1.webp', position: [200, 50, -300], scale: 80, opacity: 0.15 },
        { path: '/galaxies/nebula2.webp', position: [-250, -80, -200], scale: 60, opacity: 0.1 },
    ];

    for (const config of galaxyConfigs) {
        textureLoader.load(config.path, (texture) => {
            const material = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: config.opacity,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            });
            const sprite = new THREE.Sprite(material);
            sprite.position.set(...config.position);
            sprite.scale.set(config.scale, config.scale, 1);
            scene.add(sprite);
        });
    }
}
```

**Step 2: Source 2-3 nebula/galaxy images** (public domain Hubble images, compressed to ~100KB WebP each) and place in `v2/public/galaxies/`.

**Step 3: Verify** - subtle distant galaxy sprites visible in background behind stars.

**Step 4: Commit**

---

## Phase 2: Satellites & Interaction

### Task 8: Satellite objects with orbits

**Files:**
- Create: `v2/src/globe/satellites.js`
- Modify: `v2/src/main.js`

**Step 1: Create satellites.js**

```javascript
import * as THREE from 'three';
import { getScene, getCamera, onUpdate } from './scene.js';

const SATELLITE_CONFIG = [
    { id: 'about', label: 'About', texture: '/satellites/satellite1.webp', orbitRadius: 1.8, orbitSpeed: 0.3, orbitTilt: 0.2, phase: 0 },
    { id: 'portfolio', label: 'Portfolio', texture: '/satellites/satellite2.webp', orbitRadius: 2.1, orbitSpeed: 0.25, orbitTilt: -0.15, phase: Math.PI / 2 },
    { id: 'trees', label: 'Trees', texture: '/satellites/satellite3.webp', orbitRadius: 2.4, orbitSpeed: 0.2, orbitTilt: 0.1, phase: Math.PI },
    { id: 'adventures', label: 'Adventures', texture: '/satellites/satellite4.webp', orbitRadius: 2.0, orbitSpeed: 0.35, orbitTilt: -0.25, phase: (3 * Math.PI) / 2 },
];

const satellites = [];
const textureLoader = new THREE.TextureLoader();

export async function createSatellites() {
    const scene = getScene();

    for (const config of SATELLITE_CONFIG) {
        // Load satellite texture
        const texture = await new Promise((resolve) => {
            textureLoader.load(config.texture, resolve, undefined, () => {
                // Fallback to placeholder on error
                resolve(createPlaceholderTexture());
            });
        });

        // Create billboard sprite
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: true,
            depthWrite: false,
        });
        const sprite = new THREE.Sprite(material);
        const isMobile = window.innerWidth < 768;
        const size = isMobile ? 0.25 : 0.3;
        sprite.scale.set(size, size, 1);
        sprite.userData = { ...config, angle: config.phase };

        scene.add(sprite);
        satellites.push(sprite);
    }

    // Orbit animation
    onUpdate((delta) => {
        for (const sat of satellites) {
            const d = sat.userData;
            d.angle += d.orbitSpeed * delta;

            // Responsive orbit radius
            const screenScale = Math.min(window.innerWidth, window.innerHeight) / 800;
            const radius = d.orbitRadius * Math.max(0.6, Math.min(1.2, screenScale));

            sat.position.x = Math.cos(d.angle) * radius;
            sat.position.z = Math.sin(d.angle) * radius * 0.6; // Elliptical
            sat.position.y = Math.sin(d.angle) * d.orbitTilt + Math.sin(d.angle * 2) * 0.1;
        }
    });

    return satellites;
}

export function getSatellites() { return satellites; }

function createPlaceholderTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#888';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#fff';
    ctx.fillRect(8, 24, 48, 16);
    ctx.fillRect(24, 8, 16, 48);
    return new THREE.CanvasTexture(canvas);
}
```

**Step 2: Copy satellite images** from v1 or source new ones.

```bash
cp v1/assets/images_webp/satellite1.webp v2/public/satellites/
cp v1/assets/images_webp/satellite2.webp v2/public/satellites/
cp v1/assets/images_webp/satellite3.webp v2/public/satellites/
cp v1/assets/images_webp/satellite2.webp v2/public/satellites/satellite4.webp
```

**Step 3: Update main.js**

```javascript
import { createSatellites } from './globe/satellites.js';
// in init():
await createSatellites();
```

**Step 4: Verify** - 4 satellites orbiting Earth at different speeds and distances. Responsive to screen size.

**Step 5: Commit**

---

### Task 9: Satellite labels (CSS2DRenderer)

**Files:**
- Modify: `v2/src/globe/satellites.js`
- Modify: `v2/src/globe/scene.js`
- Modify: `v2/src/styles/global.css`

**Step 1: Add CSS2DRenderer to scene.js**

```javascript
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

let labelRenderer;

// In initScene(), after WebGL renderer setup:
labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(container.clientWidth, container.clientHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
container.appendChild(labelRenderer.domElement);

// In animate():
labelRenderer.render(scene, camera);

// In resize handler:
labelRenderer.setSize(width, height);

export function getLabelRenderer() { return labelRenderer; }
```

**Step 2: Add labels to each satellite in satellites.js**

```javascript
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// After creating each sprite:
const labelDiv = document.createElement('div');
labelDiv.className = 'satellite-label';
labelDiv.textContent = config.label;
labelDiv.style.pointerEvents = 'auto';
labelDiv.style.cursor = 'pointer';
const label = new CSS2DObject(labelDiv);
label.position.set(0, -0.2, 0);
sprite.add(label);
```

**Step 3: Add label styles to global.css**

```css
.satellite-label {
    color: var(--color-text);
    font-size: 0.8rem;
    font-weight: 500;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.9);
    white-space: nowrap;
    opacity: 0.8;
    transition: opacity var(--transition-fast), transform var(--transition-fast);
    user-select: none;
}

.satellite-label:hover {
    opacity: 1;
    transform: scale(1.1);
}
```

**Step 4: Verify** - labels appear below each satellite, always face camera, hover highlights.

**Step 5: Commit**

---

### Task 10: Satellite click/tap interaction (raycasting)

**Files:**
- Modify: `v2/src/globe/satellites.js`

**Step 1: Add raycaster for click/tap detection**

```javascript
import { getCamera } from './scene.js';

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

export function initSatelliteInteraction(onSatelliteClick) {
    const camera = getCamera();

    function handlePointer(event) {
        // Normalize pointer position
        const x = event.clientX ?? event.touches?.[0]?.clientX;
        const y = event.clientY ?? event.touches?.[0]?.clientY;
        if (x === undefined) return;

        pointer.x = (x / window.innerWidth) * 2 - 1;
        pointer.y = -(y / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        // Increase raycaster threshold for easier tapping on mobile
        raycaster.params.Sprite = { threshold: 0.3 };
        const intersects = raycaster.intersectObjects(satellites);

        if (intersects.length > 0) {
            const satellite = intersects[0].object;
            onSatelliteClick(satellite.userData.id, satellite);
        }
    }

    window.addEventListener('click', handlePointer);
    window.addEventListener('touchend', handlePointer, { passive: true });

    // Hover effect (desktop only)
    window.addEventListener('mousemove', (event) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        raycaster.params.Sprite = { threshold: 0.3 };
        const intersects = raycaster.intersectObjects(satellites);

        for (const sat of satellites) {
            const isHovered = intersects.some(i => i.object === sat);
            const scale = isHovered ? 0.38 : 0.3;
            sat.scale.set(scale, scale, 1);
        }
        document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    });
}
```

**Step 2: Wire up in main.js**

```javascript
import { createSatellites, initSatelliteInteraction } from './globe/satellites.js';

await createSatellites();
initSatelliteInteraction((pageId, satellite) => {
    console.log('Navigate to:', pageId);
    // Router will be connected in Phase 3
});
```

**Step 3: Verify** - clicking/tapping a satellite logs its page ID. Hover scales it up on desktop.

**Step 4: Commit**

---

## Phase 3: Page System

### Task 11: SPA Router

**Files:**
- Create: `v2/src/pages/router.js`
- Modify: `v2/src/main.js`

**Step 1: Create router.js**

```javascript
const VALID_ROUTES = ['about', 'portfolio', 'adventures', 'trees'];

let currentRoute = null;
let onNavigateCallback = null;
let onBackCallback = null;

export function initRouter({ onNavigate, onBack }) {
    onNavigateCallback = onNavigate;
    onBackCallback = onBack;

    // Handle browser back/forward
    window.addEventListener('popstate', (event) => {
        const route = event.state?.route || null;
        if (route && VALID_ROUTES.includes(route)) {
            currentRoute = route;
            onNavigateCallback(route, { fromPopState: true });
        } else {
            currentRoute = null;
            onBackCallback({ fromPopState: true });
        }
    });

    // Check for deep link on initial load
    checkDeepLink();
}

export function navigateTo(route) {
    if (!VALID_ROUTES.includes(route)) return;
    if (route === currentRoute) return;

    currentRoute = route;
    history.pushState({ route }, '', `/${route}`);
    onNavigateCallback(route, { fromPopState: false });
}

export function navigateBack() {
    if (!currentRoute) return;
    currentRoute = null;
    history.pushState({ route: null }, '', '/');
    onBackCallback({ fromPopState: false });
}

export function getCurrentRoute() { return currentRoute; }

function checkDeepLink() {
    // Check sessionStorage (from 404.html redirect)
    const redirectPath = sessionStorage.getItem('spa-redirect');
    if (redirectPath) {
        sessionStorage.removeItem('spa-redirect');
        if (VALID_ROUTES.includes(redirectPath)) {
            currentRoute = redirectPath;
            history.replaceState({ route: redirectPath }, '', `/${redirectPath}`);
            onNavigateCallback(redirectPath, { fromPopState: false });
            return;
        }
    }

    // Check URL pathname
    const path = window.location.pathname.replace(/^\//, '').replace(/\/$/, '');
    if (path && VALID_ROUTES.includes(path)) {
        currentRoute = path;
        history.replaceState({ route: path }, '', `/${path}`);
        onNavigateCallback(path, { fromPopState: false });
    }
}
```

**Step 2: Wire into main.js**

```javascript
import { initRouter, navigateTo, navigateBack } from './pages/router.js';

// After scene + satellites:
initRouter({
    onNavigate: (route, opts) => {
        console.log('Navigate to:', route, opts);
        // Page rendering + transitions added in next tasks
    },
    onBack: (opts) => {
        console.log('Back to globe', opts);
    },
});

// Connect satellite clicks to router
initSatelliteInteraction((pageId) => {
    navigateTo(pageId);
});
```

**Step 3: Verify** - clicking satellite changes URL. Browser back returns to `/`. Deep linking works.

**Step 4: Commit**

---

### Task 12: Page transition animations

**Files:**
- Create: `v2/src/pages/transition.js`
- Create: `v2/src/styles/transitions.css`
- Modify: `v2/src/main.js`

**Step 1: Create transition.js**

```javascript
import { getCamera } from '../globe/scene.js';

const TRANSITION_DURATION = 800; // ms

export function transitionToPage(satellite) {
    return new Promise((resolve) => {
        const camera = getCamera();
        const pageContainer = document.getElementById('page-container');
        const uiOverlay = document.getElementById('ui-overlay');

        // Fade out globe UI
        uiOverlay.classList.add('fading-out');

        // Fade in page container
        pageContainer.classList.remove('hidden');
        requestAnimationFrame(() => {
            pageContainer.classList.add('visible');
        });

        setTimeout(resolve, TRANSITION_DURATION);
    });
}

export function transitionToGlobe() {
    return new Promise((resolve) => {
        const pageContainer = document.getElementById('page-container');
        const uiOverlay = document.getElementById('ui-overlay');

        // Fade out page
        pageContainer.classList.remove('visible');

        // Fade in globe UI
        uiOverlay.classList.remove('fading-out');

        setTimeout(() => {
            pageContainer.classList.add('hidden');
            pageContainer.innerHTML = '';
            resolve();
        }, TRANSITION_DURATION);
    });
}
```

**Step 2: Create transitions.css**

```css
#ui-overlay {
    transition: opacity 0.6s ease;
}

#ui-overlay.fading-out {
    opacity: 0;
    pointer-events: none;
}

#page-container {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

#page-container.visible {
    opacity: 1;
    transform: translateY(0);
}

#page-container.hidden {
    opacity: 0;
    pointer-events: none;
}
```

**Step 3: Import in global.css**

```css
@import './transitions.css';
```

**Step 4: Verify** - clicking satellite fades out globe UI, fades in page container. Reverse on back.

**Step 5: Commit**

---

### Task 13: Page renderer (content from JSON)

**Files:**
- Create: `v2/src/pages/page-renderer.js`
- Create: `v2/src/styles/pages.css`

**Step 1: Create page-renderer.js**

This loads content.json and renders the appropriate page into the page container.

```javascript
let contentData = null;

async function loadContent() {
    if (contentData) return contentData;
    const response = await fetch('/data/content.json');
    contentData = await response.json();
    return contentData;
}

export async function renderPage(route) {
    const content = await loadContent();
    const container = document.getElementById('page-container');

    const renderers = {
        about: renderAbout,
        portfolio: renderPortfolio,
        adventures: renderAdventures,
        trees: renderTrees,
    };

    const renderer = renderers[route];
    if (renderer) {
        container.innerHTML = renderer(content[route]);
    }

    // Add back button handler
    container.querySelector('.back-button')?.addEventListener('click', () => {
        import('./router.js').then(m => m.navigateBack());
    });
}

function renderAbout(data) {
    return `
        <div class="page about-page">
            <button class="back-button">
                <span class="arrow">&larr;</span> Back to Earth
            </button>
            <div class="page-header">
                <h2>${data.title}</h2>
                <p>${data.subtitle}</p>
            </div>
            <div class="page-content">
                ${data.headshot ? `
                    <div class="headshot-container">
                        <img src="/${data.headshot.webp}" alt="${data.headshot.alt}" loading="lazy">
                        <p class="image-caption">${data.headshot.caption}</p>
                    </div>
                ` : ''}
                <div class="sections-grid">
                    ${data.sections.map(section => `
                        <div class="section-card">
                            <div class="section-header">
                                <i class="${section.icon}"></i>
                                <h3>${section.title}</h3>
                            </div>
                            <div class="section-content">
                                ${section.content.map(line => `<p>${line}</p>`).join('')}
                            </div>
                            ${section.image ? `
                                <img src="/${section.image.webp}" alt="${section.image.alt}" loading="lazy" class="section-image">
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Similar functions for renderPortfolio, renderAdventures, renderTrees
// Each follows the card-based layout pattern with responsive grid
```

**Step 2: Create pages.css** with card layouts, responsive grid, back button, image styles.

**Step 3: Create individual page renderers** for portfolio, adventures, and trees.

**Step 4: Wire renderPage into the router's onNavigate callback in main.js.**

**Step 5: Verify** - clicking each satellite shows its content page with proper layout.

**Step 6: Commit**

---

### Task 14: Individual page layouts

**Can be parallelized as 4 independent sub-tasks:**

- **14a:** About page - headshot, section cards with icons, education/professional/skills
- **14b:** Portfolio page - GIS projects gallery with images, development section
- **14c:** Adventures page - counters (countries/parks), adventure cards with photos, tags
- **14d:** Trees page - tree cards with stats, large images

Each page follows the same pattern:
1. Back button at top
2. Page header (title, subtitle)
3. Content grid (responsive, card-based)
4. Image lazy loading

These 4 can be developed by separate agents simultaneously since they each write to their own file and share the same CSS framework from pages.css.

---

## Phase 4: Minigame

### Task 15: Shooting star rendering (pixel art in 3D scene)

**Files:**
- Create: `v2/src/game/shooting-star.js`

**Step 1: Create shooting-star.js with object pooling**

```javascript
import * as THREE from 'three';
import { getScene, getCamera, onUpdate } from '../globe/scene.js';

const POOL_SIZE = 30;
const pool = [];
const activeStars = [];
const textureLoader = new THREE.TextureLoader();
let starTexture = null;

export async function initShootingStars() {
    starTexture = await new Promise((resolve) => {
        textureLoader.load('/shooting-star.webp', resolve, undefined, () => {
            textureLoader.load('/shooting-star.png', resolve);
        });
    });

    // Pre-create pool
    const scene = getScene();
    for (let i = 0; i < POOL_SIZE; i++) {
        const material = new THREE.SpriteMaterial({
            map: starTexture,
            transparent: true,
            opacity: 0,
            depthTest: false,
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.3, 0.15, 1);
        sprite.visible = false;
        scene.add(sprite);
        pool.push(sprite);
    }

    // Update active stars
    onUpdate((delta) => {
        for (let i = activeStars.length - 1; i >= 0; i--) {
            const star = activeStars[i];
            const data = star.userData;
            data.progress += delta / data.duration;

            if (data.progress >= 1) {
                recycleStar(star);
                activeStars.splice(i, 1);
                continue;
            }

            // Lerp position
            star.position.lerpVectors(data.start, data.end, data.progress);

            // Fade in then out
            const fadeIn = Math.min(data.progress * 10, 1);
            const fadeOut = Math.max(1 - (data.progress - 0.8) * 5, 0);
            star.material.opacity = Math.min(fadeIn, fadeOut);
        }
    });
}

export function spawnStar(type = 'background') {
    const star = pool.find(s => !s.visible);
    if (!star) return null;

    star.visible = true;
    star.material.opacity = 0;

    // Random trajectory across the scene
    const spread = 8;
    const start = new THREE.Vector3(
        (Math.random() - 0.5) * spread * 2,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread - 2
    );
    const direction = new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread * 0.5,
        (Math.random() - 0.5) * spread
    );
    const end = start.clone().add(direction);

    star.position.copy(start);
    star.userData = {
        type,
        start: start.clone(),
        end,
        progress: 0,
        duration: type === 'minigame' ? (Math.random() * 3 + 5) : (Math.random() * 2 + 3),
    };

    // Look at end point for rotation
    const angle = Math.atan2(direction.y, direction.x);
    star.material.rotation = angle;

    activeStars.push(star);
    return star;
}

function recycleStar(star) {
    star.visible = false;
    star.material.opacity = 0;
}

export function getActiveStars() { return activeStars; }
export function clearAllStars() {
    for (const star of activeStars) recycleStar(star);
    activeStars.length = 0;
}
```

**Step 2: Verify** - background stars occasionally fly across the scene.

**Step 3: Commit**

---

### Task 16: Game state machine

**Files:**
- Create: `v2/src/game/minigame.js`
- Create: `v2/src/game/scoring.js`
- Create: `v2/src/styles/game.css`

**Step 1: Create scoring.js**

```javascript
const STORAGE_KEY = 'v2-minigame-highscore';

export const scoring = {
    score: 0,
    combo: 0,
    lastCatchTime: 0,
    highScore: parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10),

    reset() {
        this.score = 0;
        this.combo = 0;
        this.lastCatchTime = 0;
    },

    addCatch() {
        const now = Date.now();
        if (now - this.lastCatchTime < 1500) {
            this.combo = Math.min(this.combo + 1, 4);
        } else {
            this.combo = 1;
        }
        this.lastCatchTime = now;
        this.score += this.combo;
        return this.combo;
    },

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(STORAGE_KEY, String(this.highScore));
            return true; // New high score
        }
        return false;
    },
};
```

**Step 2: Create minigame.js with state machine**

States: `idle` → `countdown` → `active` → `ending` → `cooldown` → `idle`

```javascript
import { spawnStar, clearAllStars } from './shooting-star.js';
import { scoring } from './scoring.js';

const GAME_DURATION = 20;
const COOLDOWN_DURATION = 5;

let state = 'idle';
let gameTimer = 0;
let spawnTimer = 0;
let countdownValue = 3;
let visibilityPaused = false;

export function getGameState() { return state; }

export function startGame() {
    if (state !== 'idle') return;
    state = 'countdown';
    countdownValue = 3;
    scoring.reset();
    updateUI();
    runCountdown();
}

async function runCountdown() {
    for (let i = 3; i > 0; i--) {
        countdownValue = i;
        updateUI();
        await delay(1000);
    }
    countdownValue = 0;
    state = 'active';
    gameTimer = GAME_DURATION;
    updateUI();
}

export function update(delta) {
    if (visibilityPaused) return;

    if (state === 'active') {
        gameTimer -= delta;
        spawnTimer -= delta;

        if (spawnTimer <= 0) {
            spawnStar('minigame');
            // Spawn faster as game progresses
            const progress = 1 - (gameTimer / GAME_DURATION);
            const interval = 0.8 - progress * 0.5; // 0.8s → 0.3s
            spawnTimer = interval + Math.random() * 0.3;
        }

        if (gameTimer <= 0) {
            endGame();
        }

        updateUI();
    }

    if (state === 'cooldown') {
        gameTimer -= delta;
        if (gameTimer <= 0) {
            state = 'idle';
            clearAllStars();
            hideGameUI();
        }
        updateUI();
    }
}

function endGame() {
    state = 'ending';
    clearAllStars();
    const isNewHighScore = scoring.saveHighScore();
    showEndScreen(isNewHighScore);

    setTimeout(() => {
        state = 'cooldown';
        gameTimer = COOLDOWN_DURATION;
        updateUI();
    }, 2000);
}

// Page Visibility API - pause/resume
document.addEventListener('visibilitychange', () => {
    visibilityPaused = document.hidden;
});

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
function updateUI() { /* Updates game overlay DOM */ }
function showEndScreen() { /* Shows final score + high score */ }
function hideGameUI() { /* Hides game overlay */ }
```

**Step 3: Create game.css**

```css
.game-score {
    position: fixed;
    top: 60%;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1.25rem;
    font-weight: 500;
    color: white;
    text-shadow: 0 2px 10px rgba(0,0,0,0.8);
    z-index: 35;
}

.game-countdown {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 5rem;
    font-weight: 700;
    color: white;
    text-shadow: 0 4px 20px rgba(0,0,0,0.8);
    z-index: 35;
    transition: opacity 0.3s;
}

.game-timer {
    position: fixed;
    top: 45%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 4rem;
    font-weight: 700;
    z-index: 35;
    transition: color 0.3s;
}

.game-timer.warning {
    color: #ff4444;
    text-shadow: 0 4px 12px rgba(255, 68, 68, 0.5);
}

.game-combo {
    position: fixed;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-accent-warm);
    text-shadow: 0 2px 8px rgba(255, 165, 0, 0.5);
    z-index: 35;
    animation: comboPopup 0.4s ease-out;
    pointer-events: none;
}

@keyframes comboPopup {
    from { transform: scale(0.5) translateY(0); opacity: 1; }
    to { transform: scale(1.2) translateY(-20px); opacity: 0; }
}

/* Dim UI during game with a single class */
.game-active #ui-overlay {
    opacity: 0.2;
    pointer-events: none;
    transition: opacity 0.5s ease;
}
```

**Step 4: Wire into main.js** - connect click detection for stars, update loop, body class toggle.

**Step 5: Verify** - full minigame loop: click background star → countdown → gameplay → score → cooldown → idle. High score persists across reloads. Tab switching pauses correctly.

**Step 6: Commit**

---

### Task 17: Particle effects (star burst, combo text)

**Files:**
- Create: `v2/src/game/effects.js`

Particle burst when catching a star (quick 3D particle explosion). Combo text popup ("x2!", "x3!") as floating CSS elements.

---

## Phase 5: Polish & Deployment

### Task 18: Source and optimize assets

- Download NASA Blue Marble day texture (public domain), compress to ~800KB JPG
- Download NASA Black Marble night texture (city lights), compress to ~500KB JPG
- Source 2-3 nebula images from Hubble archives, compress to ~100KB WebP each
- Source or create satellite images with transparent backgrounds
- Optimize all content images from v1 (compress to max 500KB each)
- Create proper favicon from Earth texture

### Task 19: Service worker + PWA

**Files:**
- Create: `v2/public/sw.js`
- Create: `v2/public/manifest.json`
- Create: `v2/public/404.html`

Service worker caches built assets. 404.html handles SPA deep linking on GitHub Pages. Manifest provides PWA metadata.

### Task 20: SEO + meta tags

Add OpenGraph and Twitter Card meta tags. Add structured data (JSON-LD). Update robots.txt and sitemap.xml.

### Task 21: Performance profiling

- Lighthouse audit (target >90 performance)
- Test on real mobile devices (or BrowserStack)
- Profile Three.js render performance
- Verify texture loading times
- Check bundle size (target <150KB gzipped JS)

### Task 22: Cross-browser testing

- Chrome, Firefox, Safari, Edge
- iOS Safari, Android Chrome
- Test WebGL fallback behavior
- Verify touch interactions on mobile

### Task 23: GitHub Pages deployment

**Files:**
- Modify: `v2/vite.config.js` (set base path if needed)
- Create: GitHub Actions workflow or manual `gh-pages` deployment

```bash
cd v2
npm run build  # outputs to v2/dist/
# Deploy dist/ to GitHub Pages
```

---

## Parallelization Strategy for Agent Teams

These tasks can be worked on simultaneously by independent agents:

### Batch 1 (Sequential - must be first):
- **Task 1:** Project setup (1 agent)

### Batch 2 (After Task 1):
- **Task 2:** Scene setup (1 agent)
- **Task 6:** Starfield (can start as soon as scene.js exists)

### Batch 3 (After Task 2):
- **Task 3:** Earth mesh (depends on scene)
- **Task 7:** Galaxy sprites (depends on starfield)
- **Task 8:** Satellites (depends on scene)

### Batch 4 (After Task 3):
- **Task 4:** Day/night shader (depends on Earth mesh)
- **Task 5:** Atmosphere (depends on Earth mesh)
- **Task 9:** Satellite labels (depends on satellites)
- **Task 10:** Satellite interaction (depends on satellites)

### Batch 5 (After Task 10):
- **Task 11:** Router (depends on satellite interaction)
- **Task 15:** Shooting stars (depends on scene, can parallel with router)

### Batch 6 (After Task 11):
- **Task 12:** Page transitions (depends on router)
- **Task 13:** Page renderer (depends on router)
- **Task 16:** Game state machine (depends on shooting stars)

### Batch 7 (After Task 13, fully parallelizable):
- **Task 14a:** About page layout (1 agent)
- **Task 14b:** Portfolio page layout (1 agent)
- **Task 14c:** Adventures page layout (1 agent)
- **Task 14d:** Trees page layout (1 agent)

### Batch 8 (After everything):
- **Task 17:** Particle effects
- **Tasks 18-23:** Polish & deployment

---

## Agent Team Prompt Template

When spawning agents for parallel work, use this context:

```
You are working on v2 of ryan-little.com, a space-themed portfolio website.

PROJECT CONTEXT:
- Vite + vanilla ES modules (no framework)
- Three.js for 3D rendering
- Single responsive layout
- GitHub Pages deployment

CODEBASE LOCATION: /Users/ryan/Desktop/Projects/ryan-little.com/v2/

KEY FILES:
- v2/src/main.js - App entry point
- v2/src/globe/scene.js - Three.js scene (exports: initScene, getScene, getCamera, onUpdate)
- v2/src/globe/earth.js - Earth mesh
- v2/src/globe/satellites.js - Satellite system
- v2/src/globe/starfield.js - Star particles
- v2/src/pages/router.js - SPA routing (exports: initRouter, navigateTo, navigateBack)
- v2/src/data/content.json - Content data

CONVENTIONS:
- ES module imports/exports (no window globals)
- CSS custom properties defined in global.css
- Three.js objects use scene.js's onUpdate() for animation
- Font: Inter (Google Fonts, already loaded)
- Icons: Font Awesome 6.4 (already loaded)

DESIGN DOC: docs/plans/2026-02-15-v2-redesign-design.md
```
