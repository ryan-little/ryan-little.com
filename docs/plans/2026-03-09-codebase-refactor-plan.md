# Codebase Refactor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve code quality and performance of ryan-little.com with zero visual/functional changes.

**Architecture:** Split the 661-line `satellites.js` into 3 focused modules + barrel. Optimize render loop (shader twinkling, group rotation, cached sun). Parallelize texture loading. Fix code quality issues. Protect resume from crawlers. All work on a `refactor` branch.

**Tech Stack:** Vite 7, Three.js r182, vanilla ES modules, GitHub Pages

**Spec:** `docs/plans/2026-03-09-codebase-refactor-design.md`

---

## Chunk 1: Setup & Dead Code Removal

### Task 1: Create refactor branch and constants file

**Files:**
- Create: `src/constants.js`

- [ ] **Step 1: Create refactor branch**

```bash
cd /Users/ryan/Desktop/Projects/ryan-little.com
git checkout -b refactor
```

- [ ] **Step 2: Create constants.js**

```js
// src/constants.js
// Mobile breakpoints — 3D uses 768 for quality (geometry, sprite size),
// CSS uses 600 for layout. Both are intentional.
export const MOBILE_BREAKPOINT_3D = 768;
export const MOBILE_BREAKPOINT_LAYOUT = 600;
```

- [ ] **Step 3: Commit**

```bash
git add src/constants.js
git commit -m "chore: create constants.js with mobile breakpoint values"
```

---

### Task 2: Remove dead code

**Files:**
- Delete: `src/globe/aurora.js`
- Modify: `src/styles/pages.css:533-547` (remove `.adventure-tags`, `.tag`)
- Modify: `src/styles/pages.css:768-770` (remove `.blog-link-card i`)

- [ ] **Step 1: Delete aurora.js**

```bash
rm src/globe/aurora.js
```

- [ ] **Step 2: Remove dead CSS — `.adventure-tags` and `.tag` blocks**

In `src/styles/pages.css`, delete lines 533-547:

```css
/* DELETE this entire block */
.adventure-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: 0.6rem;
    justify-content: center;
}

.tag {
    background: rgba(232, 168, 73, 0.12);
    color: var(--color-accent);
    font-size: 0.72rem;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
}
```

- [ ] **Step 3: Remove dead CSS — `.blog-link-card i`**

In `src/styles/pages.css`, delete lines 768-770:

```css
/* DELETE this entire block */
.blog-link-card i {
    font-size: 1rem;
}
```

- [ ] **Step 4: Fix blog satellite label animation (bug)**

In `src/styles/global.css`, after line 270 (`#satellite-labels > :nth-child(4) { animation-delay: 0.9s, 1.7s; }`), add:

```css
#satellite-labels > :nth-child(5) { animation-delay: 1.2s, 2.0s; }
```

This was missing when the 5th blog satellite was added — the label plays its fade-in and glow animation at 0s instead of following the stagger pattern.

- [ ] **Step 5: Verify build**

```bash
npm run build
```
Expected: Build succeeds, no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix: add missing 5th satellite label animation stagger, remove dead code"
```

---

### Task 3: Fix service worker precache

**Files:**
- Modify: `public/sw.js:1-14`

- [ ] **Step 1: Add satellite5.webp to precache and bump cache version**

In `public/sw.js`, change line 1:
```js
const CACHE_NAME = 'ryan-little-v2-4';
```

After line 13 (`'/satellites/satellite4.webp',`), add:
```js
    '/satellites/satellite5.webp',
```

- [ ] **Step 2: Commit**

```bash
git add public/sw.js
git commit -m "fix: add satellite5.webp to service worker precache"
```

---

## Chunk 2: Satellite Module Split

### Task 4: Create satellite-orbit.js

**Files:**
- Create: `src/globe/satellite-orbit.js`
- Source: `src/globe/satellites.js:1-414` (orbit logic, labels, glow, occlusion)

- [ ] **Step 1: Create satellite-orbit.js**

Extract from `satellites.js`: `SATELLITE_CONFIG`, `ORBIT_SPEED`, `MAX_CONFIGURED_RADIUS`, arrays (`satellites`, `labelElements`, `glowSprites`), `textureLoader`, `createSatellites()`, `isOccluded()`, `projectLabel()`, the entire `onUpdate` callback, `getSatellites()`, `createPlaceholderTexture()`, `createWhiteOrbGlow()`, and the pause/hover state vars (`isPaused`, `isHoverPaused`, `hoveredSatellite`).

The module needs to export:
- `createSatellites()`
- `getSatellites()`
- `satellites` array (for interaction/transition modules to reference)
- `labelElements` array
- `glowSprites` array
- `isPaused` getter/setter (or `pauseSatellites()`, `resumeSatellites()`)
- `isHoverPaused` getter/setter
- `hoveredSatellite` getter/setter
- `initialFadeComplete` getter
- `exitTransition` getter/setter
- `entranceTransition` getter/setter
- `entranceStartTime` getter/setter
- `lastExitedIndex` getter/setter
- `returnedIndex` getter/setter

Since these are mutable shared state, use a shared state object pattern:

```js
// At top of satellite-orbit.js
export const satState = {
    isPaused: false,
    isHoverPaused: false,
    hoveredSatellite: null,
    exitTransition: null,
    entranceTransition: null,
    entranceStartTime: null,
    initialFadeComplete: false,
    lastExitedIndex: -1,
    returnedIndex: -1,
    onClickCallback: null,
};
```

This lets `satellite-transition.js` and `satellite-interaction.js` import `satState` and read/write it directly without circular imports.

Also export the existing `pauseSatellites()` / `resumeSatellites()` functions (used by `transition.js`):

```js
export function pauseSatellites() {
    satState.isPaused = true;
}

export function resumeSatellites() {
    satState.isPaused = false;
}
```

Import `MOBILE_BREAKPOINT_3D` from `../constants.js` and replace the `window.innerWidth < 768` check on line 66 with `window.innerWidth < MOBILE_BREAKPOINT_3D`.

**Shared glow texture optimization:** Move `createWhiteOrbGlow()` call to before the satellite creation loop, and reuse the single texture for all 5 glow sprites:

```js
// Before the loop:
const glowTexture = createWhiteOrbGlow();

// Inside the loop (replace line 87):
// const glowTexture = createWhiteOrbGlow();  // DELETE — was creating 5 identical textures
const glowMaterial = new THREE.SpriteMaterial({
    map: glowTexture,  // reuse single texture
    ...
});
```

- [ ] **Step 2: Verify file compiles (no syntax errors)**

```bash
npx vite build 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/globe/satellite-orbit.js
git commit -m "refactor: extract satellite-orbit.js from satellites.js"
```

---

### Task 5: Create satellite-transition.js

**Files:**
- Create: `src/globe/satellite-transition.js`
- Source: `src/globe/satellites.js:417-547` (transition functions)

- [ ] **Step 1: Create satellite-transition.js**

Extract `animateSatelliteExit()` and `fadeInSatellites()` from `satellites.js`.

Import shared state and arrays:
```js
import * as THREE from 'three';
import { getCamera } from './scene.js';
import { satellites, labelElements, glowSprites, satState } from './satellite-orbit.js';
```

Add named timing constants at the top:
```js
// Timing constants — these are interdependent:
// EXIT_MOVE_DURATION controls how long the clicked satellite takes to reach its target.
// The sprite fades out in its last 20% (0.56s-0.7s mark).
// PAGE_SHOW_DELAY (in transition.js) is set to 450ms to start the page fade-in
// before the sprite finishes, creating a smooth crossfade overlap.
export const SATELLITE_EXIT_DURATION = 0.7;    // seconds — clicked satellite move animation
export const OTHER_FADE_DURATION = 0.35;       // seconds — non-clicked satellites fade out
export const STAGGER_INTERVAL = 0.12;          // seconds — delay between each satellite's fade
export const ENTRANCE_MOVE_DURATION = 0.7;     // seconds — returning satellite reverse animation
```

Replace all `satState` references: e.g. `isPaused` becomes `satState.isPaused`, `exitTransition` becomes `satState.exitTransition`, etc.

Export:
- `animateSatelliteExit(clickedSatellite, targetRect)` → Promise
- `fadeInSatellites(sourceRect)`
- The named timing constants

- [ ] **Step 2: Commit**

```bash
git add src/globe/satellite-transition.js
git commit -m "refactor: extract satellite-transition.js with named timing constants"
```

---

### Task 6: Create satellite-interaction.js

**Files:**
- Create: `src/globe/satellite-interaction.js`
- Source: `src/globe/satellites.js:549-616` (raycaster, click/hover)

- [ ] **Step 1: Create satellite-interaction.js**

Extract `initSatelliteInteraction()` (raycaster, `handlePointer`, mousemove handler).

```js
import * as THREE from 'three';
import { getCamera } from './scene.js';
import { satellites, labelElements, satState } from './satellite-orbit.js';
```

**Remove cross-domain coupling:** Delete the `import { getGameState } from '../game/minigame.js'` line. Remove `if (getGameState() !== 'idle') return;` guards from both `handlePointer` and the `mousemove` handler.

**Add new pause exports for game integration:**
```js
export function pauseSatelliteClicks() {
    satState.isPaused = true;
}

export function resumeSatelliteClicks() {
    satState.isPaused = false;
}
```

**Add `isPaused` guard to mousemove handler** (line 584 in original):
```js
window.addEventListener('mousemove', (event) => {
    if (!satState.initialFadeComplete) return;
    if (satState.isPaused) return;           // <-- NEW: skip when page/game active
    if (satState.exitTransition) return;
    // ... rest unchanged
});
```

Export:
- `initSatelliteInteraction(onSatelliteClick)`
- `pauseSatelliteClicks()`
- `resumeSatelliteClicks()`

- [ ] **Step 2: Commit**

```bash
git add src/globe/satellite-interaction.js
git commit -m "refactor: extract satellite-interaction.js, remove minigame coupling"
```

---

### Task 7: Convert satellites.js to barrel file

**Files:**
- Modify: `src/globe/satellites.js` (complete rewrite — barrel)

- [ ] **Step 1: Replace satellites.js with barrel re-exports**

```js
// Barrel file — preserves all existing import paths for consumers
export { createSatellites, getSatellites, pauseSatellites, resumeSatellites } from './satellite-orbit.js';
export { animateSatelliteExit, fadeInSatellites } from './satellite-transition.js';
export { initSatelliteInteraction, pauseSatelliteClicks, resumeSatelliteClicks } from './satellite-interaction.js';
```

- [ ] **Step 2: Verify all existing imports still resolve**

Check that `main.js`, `transition.js` still import from `./globe/satellites.js` and their imports match the barrel exports:
- `main.js` imports: `createSatellites`, `initSatelliteInteraction`
- `transition.js` imports: `animateSatelliteExit`, `fadeInSatellites`

- [ ] **Step 3: Verify build**

```bash
npm run build
```
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/globe/satellites.js
git commit -m "refactor: convert satellites.js to barrel re-exporting split modules"
```

---

### Task 8: Wire game-satellite decoupling in main.js

**Files:**
- Modify: `src/main.js:6,11,43,68`

- [ ] **Step 1: Update main.js imports**

Add `pauseSatelliteClicks, resumeSatelliteClicks` to the satellites import:

```js
import { createSatellites, initSatelliteInteraction, pauseSatelliteClicks, resumeSatelliteClicks } from './globe/satellites.js';
```

- [ ] **Step 2: Wire game lifecycle to satellite pause**

Change `initMinigame()` on line 43 to pass callbacks:

```js
initMinigame({
    onGameStart: () => pauseSatelliteClicks(),
    onGameEnd: () => resumeSatelliteClicks(),
});
```

- [ ] **Step 3: Update initMinigame to accept callbacks**

In `src/game/minigame.js`, change `initMinigame()` signature (line 18) and wire callbacks:

```js
export function initMinigame({ onGameStart, onGameEnd } = {}) {
```

In `startGame()` (line 61), add at the top:
```js
if (onGameStart) onGameStart();
```

In the cooldown completion block (line 113, inside `if (gameTimer <= 0)`), add before `document.body.classList.remove`:
```js
if (onGameEnd) onGameEnd();
```

Store callbacks in module scope:
```js
let _onGameStart = null;
let _onGameEnd = null;

export function initMinigame({ onGameStart, onGameEnd } = {}) {
    _onGameStart = onGameStart;
    _onGameEnd = onGameEnd;
    // ... rest unchanged
}
```

Then use `_onGameStart` in `startGame()` and `_onGameEnd` in `endGame()` (line 118, after `state = 'ending'`). Do NOT place `_onGameEnd` in the cooldown completion block — that fires 5s later and would leave satellite clicks paused during the entire cooldown period.

- [ ] **Step 4: Verify build**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add src/main.js src/game/minigame.js
git commit -m "refactor: wire game lifecycle to satellite pause via main.js callbacks"
```

---

## Chunk 3: Performance — Render Loop

### Task 9: Galaxy drift → group rotation

**Files:**
- Modify: `src/globe/galaxies.js:20-103`

- [ ] **Step 1: Wrap sprites in a Group and simplify drift**

Replace the current per-sprite trig rotation (lines 86-103) with a group rotation approach:

In `createGalaxies()`, before the placement loop, create a group:
```js
const galaxyGroup = new THREE.Group();
scene.add(galaxyGroup);
```

Change `scene.add(sprite)` (line 82) to `galaxyGroup.add(sprite)`.

Replace the entire `onUpdate` block (lines 87-103) with:
```js
onUpdate((delta) => {
    galaxyGroup.rotation.y += delta * 0.003;
    galaxyGroup.rotation.x += delta * 0.001;
});
```

Change return to `return galaxyGroup` (the sprites are children of the group).

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/globe/galaxies.js
git commit -m "perf: replace per-sprite trig drift with group rotation for galaxies"
```

---

### Task 10: Cache getSunDirection()

**Files:**
- Modify: `src/globe/earth.js:79-86,156-185`

- [ ] **Step 1: Add sun direction cache**

At the top of `earth.js` (after the existing module-level vars around line 10), add:

```js
let cachedSunDir = null;
let sunCacheInterval = null;

function updateSunCache() {
    cachedSunDir = getSunDirection();
}
```

- [ ] **Step 2: Initialize cache in createEarth and set interval**

After `scene.add(atmosphereMesh)` (line 154), add:
```js
updateSunCache();
sunCacheInterval = setInterval(updateSunCache, 60000); // refresh every 60s
```

- [ ] **Step 3: Update updateSunUniform to use cached value**

Replace `updateSunUniform()` (lines 79-86) with:
```js
function updateSunUniform() {
    if (!earthMesh || !cachedSunDir) return;
    earthMesh.material.uniforms.sunDirection.value.set(cachedSunDir.x, cachedSunDir.y, cachedSunDir.z);
}
```

- [ ] **Step 4: Update atmosphere to use cached value with per-frame rotation**

In the `onUpdate` callback, replace the atmosphere block (lines 177-184):

```js
if (atmosphereMesh && cachedSunDir) {
    const sun = cachedSunDir; // cached, not recalculated
    const ry = earthMesh.rotation.y;
    atmosphereMesh.material.uniforms.sunWorldDir.value.set(
        sun.x * Math.cos(ry) + sun.z * Math.sin(ry),
        sun.y,
       -sun.x * Math.sin(ry) + sun.z * Math.cos(ry)
    );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/globe/earth.js
git commit -m "perf: cache getSunDirection() with 60s refresh, eliminate per-frame Date construction"
```

---

### Task 11: Starfield twinkling → vertex shader

**Files:**
- Modify: `src/globe/starfield.js:92-166`

- [ ] **Step 1: Add twinkling attributes and uniforms**

After the existing geometry attribute setup (line 95), add twinkling data:

```js
// Per-vertex twinkling parameters
const twinkleSpeed = new Float32Array(STAR_COUNT);
const twinklePhase = new Float32Array(STAR_COUNT);
const driftPhase = new Float32Array(STAR_COUNT);

// Use a Set for O(1) lookup — twinkleIndices contains random star indices, not sequential
const twinkleSet = new Set(twinkleIndices);

for (let i = 0; i < STAR_COUNT; i++) {
    if (twinkleSet.has(i)) {
        twinkleSpeed[i] = 2 + (i % 3); // matches original: (2 + idx % 3)
        twinklePhase[i] = 1.0;          // flag: this star twinkles
        driftPhase[i] = i * 1.0;        // unique per star (matches original `idx` usage)
    } else {
        twinkleSpeed[i] = 0.0;
        twinklePhase[i] = 0.0;
        driftPhase[i] = 0.0;
    }
}

geometry.setAttribute('twinkleSpeed', new THREE.BufferAttribute(twinkleSpeed, 1));
geometry.setAttribute('twinklePhase', new THREE.BufferAttribute(twinklePhase, 1));
geometry.setAttribute('driftPhase', new THREE.BufferAttribute(driftPhase, 1));
```

Move the `twinkleIndices` generation (lines 129-132) to before this block so it's available.

- [ ] **Step 2: Update vertex shader to handle twinkling**

Replace the vertex shader in the `ShaderMaterial` (lines 100-108):

```glsl
attribute float size;
attribute float twinkleSpeed;
attribute float twinklePhase;
attribute float driftPhase;
uniform float uTime;
varying vec3 vColor;
void main() {
    vColor = color;
    // Apply subtle position drift for twinkling stars (preserves visual effect on /earth)
    vec3 pos = position;
    if (twinklePhase > 0.5) {
        pos.x += sin(uTime * 0.5 + driftPhase) * 0.5;
        pos.y += cos(uTime * 0.7 + driftPhase) * 0.5;
        pos.z += sin(uTime * 0.3 + driftPhase * 0.1) * 0.3;
    }
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    // Size twinkling: matches original (sin * 0.5 + 1.0)
    float twinkle = twinklePhase > 0.5
        ? (sin(uTime * twinkleSpeed) * 0.5 + 1.0)
        : 1.0;
    gl_PointSize = size * twinkle;
    gl_Position = projectionMatrix * mvPosition;
}
```

- [ ] **Step 3: Add uTime uniform and preserve vertexColors**

Update the `ShaderMaterial` constructor — **IMPORTANT: `vertexColors: true` MUST be preserved** or all stars render white:

```js
const material = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0.0 },
    },
    vertexShader: /* ... (from Step 2) ... */,
    fragmentShader: /* ... (unchanged) ... */,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    vertexColors: true,  // REQUIRED — enables the `color` attribute used by vColor
});
```

- [ ] **Step 4: Replace the CPU twinkling loop with a simple uniform update**

Replace the entire `onUpdate` callback (lines 144-166) with:

```js
onUpdate((delta) => {
    // Slow rotation so stars drift
    stars.rotation.y += delta * 0.003;
    stars.rotation.x += delta * 0.001;

    // Update time uniform — shader handles twinkling + drift
    material.uniforms.uTime.value = performance.now() * 0.001;
});
```

This removes the CPU buffer writes entirely. No `sizeAttr.needsUpdate`, no `posAttr.needsUpdate`, no per-star loop.

- [ ] **Step 5: Clean up unused variables**

Remove the now-unused `twinkleBasePositions` array and the closure references to `baseSizes` in the update loop (they're now baked into the vertex attributes).

- [ ] **Step 6: Verify build**

```bash
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add src/globe/starfield.js
git commit -m "perf: move starfield twinkling to vertex shader, preserve position drift"
```

---

### Task 12: Minigame UI optimization

**Files:**
- Modify: `src/game/minigame.js:130-151`

- [ ] **Step 1: Create DOM elements once in showGameUI**

Replace `showGameUI()` (lines 130-134):

```js
let timerEl = null;
let scoreEl = null;
let lastDisplayedTime = null;

function showGameUI() {
    const el = overlay();
    el.classList.remove('hidden');
    el.style.pointerEvents = 'auto';
    el.innerHTML = '<div class="game-timer"></div><div class="game-score"></div>';
    timerEl = el.querySelector('.game-timer');
    scoreEl = el.querySelector('.game-score');
    lastDisplayedTime = null;
}
```

- [ ] **Step 2: Update only when values change**

Replace `updateGameUI()` (lines 143-151):

```js
function updateGameUI() {
    if (!timerEl || !scoreEl) return;
    const timeLeft = Math.max(0, Math.ceil(gameTimer));
    if (timeLeft !== lastDisplayedTime) {
        lastDisplayedTime = timeLeft;
        timerEl.textContent = timeLeft;
        timerEl.className = timeLeft <= 5 ? 'game-timer warning' : 'game-timer';
    }
    scoreEl.textContent = `Score: ${scoring.score}`;
}
```

- [ ] **Step 3: Clean up refs in hideGameUI**

Update `hideGameUI()` (lines 136-141) to clear refs:

```js
function hideGameUI() {
    const el = overlay();
    el.classList.add('hidden');
    el.style.pointerEvents = '';
    el.innerHTML = '';
    timerEl = null;
    scoreEl = null;
    lastDisplayedTime = null;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/game/minigame.js
git commit -m "perf: create game UI DOM elements once, update textContent only when changed"
```

---

### Task 13: Mobile atmosphere segments

**Files:**
- Modify: `src/globe/earth.js:153,192-193`

- [ ] **Step 1: Pass segments to createAtmosphere**

Change line 153 from:
```js
atmosphereMesh = createAtmosphere();
```
to:
```js
atmosphereMesh = createAtmosphere(segments);
```

- [ ] **Step 2: Accept segments parameter**

Change `createAtmosphere()` (line 192) from:
```js
function createAtmosphere() {
    const geometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.02, 64, 64);
```
to:
```js
function createAtmosphere(segments = 64) {
    const geometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.02, segments, segments);
```

- [ ] **Step 3: Import and use MOBILE_BREAKPOINT_3D**

Add to imports in `earth.js`:
```js
import { MOBILE_BREAKPOINT_3D } from '../constants.js';
```

Replace line 90:
```js
const isMobile = window.innerWidth < MOBILE_BREAKPOINT_3D;
```

- [ ] **Step 4: Commit**

```bash
git add src/globe/earth.js
git commit -m "perf: pass segment count to atmosphere, use named breakpoint constant"
```

---

## Chunk 4: Performance — Loading

### Task 14: Parallel texture loading — satellites

**Files:**
- Modify: `src/globe/satellite-orbit.js:46-111` (or equivalent lines in the new file)

- [ ] **Step 1: Load all 5 satellite textures in parallel**

Replace the sequential `for...of` texture loading loop with `Promise.all`:

```js
// Load all satellite textures in parallel
const textures = await Promise.all(
    SATELLITE_CONFIG.map(config => new Promise((resolve) => {
        textureLoader.load(config.texture, resolve, undefined, () => {
            resolve(createPlaceholderTexture());
        });
    }))
);

// Create sprites using loaded textures
const glowTexture = createWhiteOrbGlow(); // single shared glow texture
for (let i = 0; i < SATELLITE_CONFIG.length; i++) {
    const config = SATELLITE_CONFIG[i];
    const texture = textures[i];
    texture.colorSpace = THREE.SRGBColorSpace;

    const aspect = texture.image ? (texture.image.width / texture.image.height) : 1;
    // ... rest of sprite creation uses `config` and `texture`
    // ... glow material uses shared `glowTexture`
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/globe/satellite-orbit.js
git commit -m "perf: load satellite textures in parallel with Promise.all"
```

---

### Task 15: Parallel texture loading — startup sequence

**Files:**
- Modify: `src/main.js:38-40`

- [ ] **Step 1: Run createGalaxies and createEarth in parallel**

Replace lines 38-40:
```js
createStarfield();
await createGalaxies();
await createEarth();
```

With:
```js
createStarfield();
await Promise.all([createGalaxies(), createEarth()]);
```

- [ ] **Step 2: Commit**

```bash
git add src/main.js
git commit -m "perf: parallelize galaxy and earth texture loading at startup"
```

---

### Task 16: Parallel texture loading — earth clouds

**Files:**
- Modify: `src/globe/earth.js:98-114`

- [ ] **Step 1: Include cloud in initial texture load with allSettled**

Replace the sequential day/night `Promise.all` + separate cloud load (lines 98-114) with:

```js
const results = await Promise.allSettled([
    new Promise((resolve, reject) => {
        textureLoader.load('/textures/earth-day.webp', resolve, undefined, reject);
    }),
    new Promise((resolve, reject) => {
        textureLoader.load('/textures/earth-night.webp', resolve, undefined, reject);
    }),
    new Promise((resolve) => {
        textureLoader.load(cloudUrl, resolve, undefined, () => {
            console.warn(`Cloud texture failed (${cloudUrl}), rendering without clouds`);
            resolve(null);
        });
    }),
]);

// Day and night are required — if either failed, throw to trigger fallback
if (results[0].status === 'rejected') throw results[0].reason;
if (results[1].status === 'rejected') throw results[1].reason;

const dayTexture = results[0].value;
const nightTexture = results[1].value;
const cloudTexture = results[2].status === 'fulfilled' ? results[2].value : null;
```

The rest of the function (colorSpace, wrapS, resolvedCloud fallback) stays the same.

- [ ] **Step 2: Commit**

```bash
git add src/globe/earth.js
git commit -m "perf: load cloud texture in parallel with day/night textures"
```

---

## Chunk 5: Code Quality Fixes

### Task 17: Fix lightbox HTML injection

**Files:**
- Modify: `src/pages/page-renderer.js:72-81`

- [ ] **Step 1: Replace innerHTML with createElement**

Replace `openLightbox()` (lines 72-81):

```js
function openLightbox(src, alt) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';

    const img = document.createElement('img');
    img.src = src;    // setAttribute handles encoding correctly — no esc() needed
    img.alt = alt;
    img.className = 'lightbox-image';
    overlay.appendChild(img);

    overlay.addEventListener('click', () => {
        overlay.classList.add('closing');
        overlay.addEventListener('animationend', () => overlay.remove());
    });
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/page-renderer.js
git commit -m "fix: use createElement for lightbox to prevent URL corruption from esc()"
```

---

### Task 18: Scope animateCounters

**Files:**
- Modify: `src/pages/page-renderer.js:60,84-85`

- [ ] **Step 1: Pass container to animateCounters**

Change line 60 from:
```js
animateCounters();
```
to:
```js
animateCounters(container);
```

Change lines 84-85 from:
```js
function animateCounters() {
    const counters = document.querySelectorAll('.counter-number');
```
to:
```js
function animateCounters(container) {
    const counters = container.querySelectorAll('.counter-number');
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/page-renderer.js
git commit -m "fix: scope animateCounters query to page container element"
```

---

### Task 19: Shooting star Vector3 reuse

**Files:**
- Modify: `src/game/shooting-star.js:19-31,69-136`

- [ ] **Step 1: Pre-allocate Vector3 pairs per pool slot**

After the pool creation loop (line 31), add:

```js
// Pre-allocate Vector3 pairs to avoid GC during gameplay
for (let i = 0; i < POOL_SIZE; i++) {
    pool[i].userData = {
        _start: new THREE.Vector3(),
        _end: new THREE.Vector3(),
    };
}
```

- [ ] **Step 2: Reuse vectors in spawnStar**

In `spawnStar()`, replace lines 109-115:

```js
const start = new THREE.Vector3(sx, sy, sz);
const end = new THREE.Vector3(ex, ey, sz);

star.position.copy(start);
star.userData = {
    type,
    start: start.clone(),
    end,
```

With:
```js
const startVec = star.userData._start;
const endVec = star.userData._end;
startVec.set(sx, sy, sz);
endVec.set(ex, ey, sz);

star.position.copy(startVec);
star.userData = {
    _start: startVec,  // preserve pre-allocated refs
    _end: endVec,
    type,
    start: startVec,   // used by lerp in update loop
    end: endVec,
```

- [ ] **Step 3: Update recycleStar to preserve pre-allocated vectors**

`recycleStar()` (line 138) currently does `star.userData = {}` which wipes the pre-allocated vectors. Fix:

```js
function recycleStar(star) {
    star.visible = false;
    star.material.opacity = 0;
    // Preserve pre-allocated Vector3 refs — only clear game state
    const _start = star.userData._start;
    const _end = star.userData._end;
    star.userData = { _start, _end };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/game/shooting-star.js
git commit -m "perf: reuse pre-allocated Vector3 pairs in shooting star pool"
```

---

### Task 20: Named timing constants in transition.js

**Files:**
- Modify: `src/pages/transition.js:3,61`

- [ ] **Step 1: Import timing constants and use them**

Add import at top:
```js
import { animateSatelliteExit, fadeInSatellites, SATELLITE_EXIT_DURATION } from '../globe/satellites.js';
```

Update the barrel `satellites.js` to also export timing constants:
```js
export { SATELLITE_EXIT_DURATION, OTHER_FADE_DURATION, STAGGER_INTERVAL, ENTRANCE_MOVE_DURATION } from './satellite-transition.js';
```

Replace the `PAGE_SHOW_DELAY` magic number (line 61) with a named constant and add a comment:
```js
// Start page fade-in before sprite exit finishes.
// Sprite fades out in last 20% of SATELLITE_EXIT_DURATION (0.56s-0.7s),
// so we start at 450ms for smooth crossfade overlap.
const PAGE_SHOW_DELAY = 450;
```

(The 450ms value stays the same — we're just documenting the relationship.)

- [ ] **Step 2: Commit**

```bash
git add src/pages/transition.js src/globe/satellites.js
git commit -m "refactor: document timing constant relationships in transitions"
```

---

## Chunk 6: Anti-Crawler & HTML Improvements

### Task 21: Protect resume PDF from crawlers

**Files:**
- Modify: `index.html:83`
- Modify: `src/main.js:96-101`
- Modify: `src/pages/page-renderer.js:130-136`
- Modify: `public/robots.txt:1-4`

- [ ] **Step 1: Update resume link in index.html to use data attributes**

Replace line 83:
```html
<a href="/ryan-little-resume.pdf" download="Ryan-Little-Resume.pdf" aria-label="Resume"><i class="fas fa-file-alt"></i></a>
```
With:
```html
<a data-resume-path="/ryan-little-resume" data-resume-ext=".pdf" aria-label="Resume"><i class="fas fa-file-alt"></i></a>
```

- [ ] **Step 2: Assemble resume href at runtime in main.js**

After the email assembly block (line 101), add:

```js
// Assemble resume href at runtime to avoid crawler indexing
const resumeLink = document.querySelector('[data-resume-path]');
if (resumeLink) {
    const path = resumeLink.dataset.resumePath + resumeLink.dataset.resumeExt;
    resumeLink.href = path;
    resumeLink.download = 'Ryan-Little-Resume.pdf';
}
```

- [ ] **Step 3: Update page-renderer.js resume link**

In `renderAbout()`, replace the resume link block (lines 130-136):

```js
${data.resumeLink ? `
    <div class="about-resume">
        <a data-resume-link="${esc(data.resumeLink)}" class="resume-link">
            <i class="fas fa-file-alt"></i> View Resume
        </a>
    </div>
` : ''}
```

Then in `renderPage()` (after the back button handler, around line 57), add resume link assembly:

```js
// Assemble resume link at runtime (anti-crawler)
container.querySelectorAll('[data-resume-link]').forEach(link => {
    link.href = link.dataset.resumeLink;
    link.target = '_blank';
    link.rel = 'noopener';
});
```

- [ ] **Step 4: Add robots.txt disallow**

In `public/robots.txt`, add before the Sitemap line:

```
Disallow: /ryan-little-resume.pdf
```

Full file becomes:
```
User-agent: *
Allow: /
Disallow: /ryan-little-resume.pdf

Sitemap: https://ryan-little.com/sitemap.xml
```

- [ ] **Step 5: Verify resume links work in dev**

```bash
npm run dev
```
Open http://localhost:3000, inspect resume link — should have `href` assembled by JS. View page source — should NOT contain `.pdf` URL.

- [ ] **Step 6: Commit**

```bash
git add index.html src/main.js src/pages/page-renderer.js public/robots.txt
git commit -m "fix: protect resume PDF from crawler indexing via runtime assembly"
```

---

### Task 22: Font Awesome subset

**Files:**
- Modify: `index.html:37`

- [ ] **Step 1: Replace full FA CSS with solid + brands subsets**

Replace line 37:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer">
```

With two lines:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/solid.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/brands.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
```

Note: FA 6.4 subset CSS requires the core `fontawesome.min.css` as well:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/fontawesome.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/solid.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/brands.min.css" crossorigin="anonymous" referrerpolicy="no-referrer">
```

- [ ] **Step 2: Verify icons render in dev**

```bash
npm run dev
```
Check: LinkedIn/GitHub icons (brands), envelope/file-alt/camera icons (solid) all render.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "perf: switch Font Awesome to solid+brands subsets, ~60% less CSS"
```

---

### Task 23: Preload critical textures

**Files:**
- Modify: `index.html` (add in `<head>` section)

- [ ] **Step 1: Add preload hints after the icon links (around line 17)**

```html
<link rel="preload" as="image" type="image/webp" href="/textures/earth-day.webp">
    <link rel="preload" as="image" type="image/webp" href="/textures/earth-night.webp">
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "perf: preload Earth day/night textures for faster globe render"
```

---

### Task 24: Mobile nav dimensions and backdrop-filter

**Files:**
- Modify: `index.html:88-106` (add width/height to images)
- Modify: `src/styles/global.css:307-328` (move backdrop-filter to container)

- [ ] **Step 1: Add image dimensions to mobile nav**

Add `width="28" height="28"` to each mobile nav `<img>`:

```html
<img src="/satellites/satellite1.webp" alt="About" class="mobile-nav-icon" width="28" height="28">
```

Repeat for all 5 satellite images in the mobile nav.

- [ ] **Step 2: Move backdrop-filter to container**

In `src/styles/global.css`, add `backdrop-filter` to the `#mobile-nav` block inside the media query (around line 307):

```css
#mobile-nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-top: 1.5rem;
    width: 100%;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 14px;
}
```

Remove `backdrop-filter` from `.mobile-nav-item` (delete lines 327-328):
```css
/* DELETE these two lines from .mobile-nav-item */
backdrop-filter: blur(8px);
-webkit-backdrop-filter: blur(8px);
```

- [ ] **Step 3: Verify mobile layout in dev**

```bash
npm run dev
```
Check mobile view (≤600px) — nav buttons should still have blurred background.

- [ ] **Step 4: Commit**

```bash
git add index.html src/styles/global.css
git commit -m "perf: add mobile nav image dimensions, consolidate backdrop-filter"
```

---

## Chunk 7: Final Verification

### Task 25: Full build and verification

- [ ] **Step 1: Run production build**

```bash
npm run build
```
Expected: Build succeeds, no errors, no warnings.

- [ ] **Step 2: Start preview server**

```bash
npm run preview
```

- [ ] **Step 3: Manual verification checklist**

Verify each item:

- [ ] Globe renders with Earth, starfield, galaxies
- [ ] All 5 satellites orbit, hover glow works, click navigates
- [ ] About page: renders with headshot, sections, resume link works
- [ ] Portfolio page: renders with cards, images, project links
- [ ] Adventures page: counters animate, cards with images
- [ ] Trees page: tree cards with stats, Methuselah age updates
- [ ] Blog satellite opens ryanpdlittle.com in new tab
- [ ] Back button returns to globe with satellite entrance animation
- [ ] Minigame: click shooting star → countdown → gameplay → scoring → end screen
- [ ] `/earth` screensaver: moon visible, city labels, drag/zoom, auto-drift resumes after idle
- [ ] `/earth` starfield: twinkling stars with subtle position drift
- [ ] Mobile nav (≤600px): all 5 buttons work, blurred background
- [ ] Resume link assembled at runtime (not in page source)
- [ ] Email link assembled at runtime
- [ ] View page source: no `.pdf` URL visible

- [ ] **Step 4: Commit any fixes**

If anything broke, fix and commit before proceeding.

- [ ] **Step 5: Final commit message**

```bash
git log --oneline refactor ^main
```

Review the commit history looks clean.
