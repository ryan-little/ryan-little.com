# Architecture

## Overview

The Three.js scene is the entire UI. The 3D Earth globe and its orbiting satellites serve as the landing page; each satellite is a nav item. Clicking one triggers a transition animation into a content page. All page content comes from `src/data/content.json`. A custom SPA router using the History API handles navigation without page reloads.

```
Browser
  └── Vite 7 (dev/build)
       └── main.js (entry)
            ├── globe/   — Three.js scene (Earth, satellites, starfield, galaxies, lighting)
            ├── game/    — Shooting star minigame (state machine, object pool, scoring)
            └── pages/   — SPA router, transitions, content renderer
```

## Components

### Globe (`src/globe/`)

| Module | Responsibility |
|--------|----------------|
| `scene.js` | WebGL renderer, camera, render loop. Exposes `onUpdate(cb)` for per-frame callbacks and `animateCamera()` for smooth transitions. |
| `earth.js` | Earth mesh with a custom day/night GLSL shader. Day side: `0.5 + 1.3 * intensity` (max 1.8x). Night side: boosted 1.4x. Atmosphere glow at 1.3x with warm blue-white tint. Earth rotates at 90s/rev (decorative). |
| `satellites.js` | 4 satellite sprites on XY-plane orbits (always facing camera). Tidal-locked to Earth (`rotation = angle + Math.PI`). HTML labels positioned via JS projection (no CSS2DRenderer). Ray-sphere occlusion test per frame hides labels/sprites behind Earth. |
| `starfield.js` | 9,000 stars via custom `ShaderMaterial`. 6,000 main field + 3,000 Milky Way band (tilted 30°). 40 feature stars (6–10px, warmer colors). 1,000 twinkling stars. Power distribution for size variance. |
| `galaxies.js` | 26 galaxy/nebula sprites on a 400-unit sky sphere. Additive blending, random sizes (10–50 units), random rotations. 120-unit minimum spacing (anti-clustering). Slow Y+X drift matching starfield. |
| `lighting.js` | Computes real-time sun direction from UTC for the day/night terminator. |

### Minigame (`src/game/`)

State machine: `idle → countdown → active → ending → cooldown`

- Spawns 2–3 shooting stars at a time with accelerating interval (0.4s → 0.15s)
- Object pool of 60 shooting stars — avoids GC pressure during peak activity
- Score, combos, and high score persisted to `localStorage`
- Satellites disabled (raycasting + pointer events blocked) during active game state
- Background shooting stars blocked during content page view

### Pages (`src/pages/`)

- **Router:** History API. GitHub Pages deep linking via `public/404.html` redirect (standard SPA workaround for static hosts).
- **Transitions:** On satellite click — satellite scales up to match the 200px static page image and animates to `.page-header` position. `measureSatelliteTarget()` briefly renders the target page invisibly to measure the exact bounding rect. Other satellites stagger-fade out. Page crossfades in at 450ms overlap. Return navigation reverses the animation.
- **Page renderer:** Reads `content.json`, remaps v1 image paths (`assets/images_webp/X` → `/images/X`) at render time. Special-case handling: `TREE_PORTRAIT` set, `TREE_CROP` crop map, portfolio logo auto-detection (via alt text), Methuselah age auto-computation.

## Data Flow

1. `main.js` initializes scene, registers all `onUpdate()` callbacks
2. User clicks satellite → `satellites.js` fires route via `router.js`
3. `router.js` updates History API, calls `transition.js`
4. `transition.js` measures target DOM position, animates satellite exit, fades other satellites
5. `page-renderer.js` builds page HTML from `content.json`
6. Page crossfades in; satellites hidden, input blocked
7. Back navigation: `transition.js` reverses — satellite returns to orbit

## Key Patterns

- **`onUpdate(callback)`** — all per-frame logic registers with `scene.js`; no monolithic render loop
- **Object-space sun direction** — terminator accurate without quaternion transforms
- **JS ray-sphere occlusion** — WebGL depth buffer not queryable per-sprite; JS test runs cheaply at 4 satellites
- **`measureSatelliteTarget()`** — invisible DOM render to measure target position before animating
- **Content path remapping** — v1 data reused; renderer adapts paths, no data migration
