# ryan-little.com Codebase Refactor Design

**Date:** 2026-03-09
**Branch:** `refactor` (off `main`)
**Goal:** Improve code quality and performance with zero visual/functional changes

## Guiding Principles

- Site works and looks identical after refactor
- Both entry points (`index.html` + `earth/index.html`) must work
- New `refactor` branch, merged into `main` once verified

## Section 1: File Organization & Dead Code

### Split `satellites.js` (661 lines → 3 files + barrel)

- **`satellite-orbit.js`** (~250 lines) — `SATELLITE_CONFIG`, sprite creation, orbit physics, label projection, glow sprites, occlusion
- **`satellite-transition.js`** (~200 lines) — exit/entrance animation state machines, `animateSatelliteExit()`, `fadeInSatellites()`, timing constants
- **`satellite-interaction.js`** (~150 lines) — raycaster, hover/click handling, `initSatelliteInteraction()`, pause state
- **`satellites.js`** — thin barrel re-exporting public API (preserves all existing imports)

### Dead code removal

- Delete `src/globe/aurora.js`
- Delete dead CSS rules: `.adventure-tags`, `.tag`, `.blog-link-card i` from `pages.css`

### Service worker fix

- Add `'/satellites/satellite5.webp'` to `PRECACHE_URLS` in `public/sw.js`

## Section 2: Performance — Render Loop & Loading

### Parallel texture loading

- **`createSatellites()`**: convert sequential `for...of await` to `Promise.all` for all 5 satellite textures
- **`main.js init()`**: run `createGalaxies()` and `createEarth()` in parallel via `Promise.all`
- **`earth.js`**: include cloud texture in the initial `Promise.all` with day/night textures

### Cache `getSunDirection()`

- Call once in `earth.js`, cache result, refresh on 60-second interval
- Pass cached value to both `updateSunUniform()` and atmosphere rotation
- Eliminates 2× `new Date()` per frame

### Galaxy drift → group rotation

- Wrap all galaxy sprites in a `THREE.Group`
- Rotate the group per frame instead of recalculating 72 trig calls on individual positions

### Starfield twinkling → vertex shader

- Add `uniform float uTime` to vertex shader
- Compute twinkling size variation in shader: `gl_PointSize = size * (0.7 + 0.3 * sin(uTime * freq + vertexIndex))`
- Remove CPU-side buffer writes (1,000 stars × 60fps) and position drift
- Biggest per-frame CPU cost reduction

### Minigame UI optimization

- Create timer/score DOM elements once at game start
- Update `.textContent` only when `Math.ceil(gameTimer)` changes
- Eliminates innerHTML rebuild every frame during 20s game

### Shared glow texture

- Create radial gradient canvas texture once before satellite loop
- Reuse for all 5 glow sprites (saves 4 canvas allocations + GPU uploads)

### Mobile atmosphere segments

- Pass `segments` from `createEarth()` into `createAtmosphere()`
- Mobile gets 32 segments instead of hardcoded 64

## Section 3: Code Quality & Consistency

### Standardize mobile breakpoint

- Define `const MOBILE_BREAKPOINT = 600` in `src/constants.js`
- Update JS checks in `satellites.js` and `earth.js` from `< 768` to `<= 600`
- Matches CSS `@media (max-width: 600px)`

### Fix lightbox HTML injection

- Replace `esc(src)` template string with `document.createElement('img')` + `setAttribute`
- Safe against URL corruption from `&` in query strings

### Scope `animateCounters()`

- Change `document.querySelectorAll('.counter-number')` to `container.querySelectorAll('.counter-number')`

### Add `isPaused` guard to mousemove

- Early return in mousemove handler when content page is open
- Skip raycasting against hidden sprites

### Shooting star Vector3 reuse

- Pre-allocate `start`/`end` Vector3 pairs per pool slot during `initShootingStars()`
- Reuse via `.set()` in `spawnStar()` instead of allocating 3 new Vector3s per spawn

### Named timing constants

- Extract magic numbers from `transition.js` and `satellite-transition.js`
- E.g. `SATELLITE_EXIT_DURATION = 700`, `PAGE_SHOW_DELAY = 450`, `STAGGER_INTERVAL = 120`
- Document relationships between interdependent timings

### Remove cross-domain coupling

- Remove `satellites.js → minigame.js` import
- Have `main.js` call `pauseSatelliteInteraction()` on game start, `resumeSatelliteInteraction()` on game end
- Uses existing pause mechanism — globe modules stay independent of game modules

### Anti-crawler protection

- **Resume PDF**: apply runtime-assembly pattern (data-attributes + JS `setAttribute`) in both `index.html` and `page-renderer.js`
- **`robots.txt`**: add `Disallow: /ryan-little-resume.pdf`
- Email already protected via data-attribute assembly — no changes needed

## Section 4: HTML & Asset Loading

### Font Awesome subset

- Switch `all.min.css` → `solid.min.css` + `brands.min.css`
- Only icon sets used on the site; cuts ~60% FA CSS payload

### Preload critical textures

- Add `<link rel="preload" as="image" href="/textures/earth-day.webp">` in `<head>`
- Same for `earth-night.webp`
- Browser fetches during script parsing instead of waiting for JS execution

### Mobile nav image dimensions

- Add `width="28" height="28"` to 5 `<img>` elements in `#mobile-nav`
- Prevents layout shift during load

### Backdrop-filter consolidation

- Move `backdrop-filter: blur(8px)` from each `.mobile-nav-item` to `#mobile-nav` container
- Same visual, 1 compositor layer instead of 5

## Section 5: Out of Scope

- No galaxy texture atlas (26 → 1 request)
- No shooting stars → `THREE.Points` conversion
- No unified event bus
- No dynamic imports for game modules
- No new dependencies
- No content.json data structure changes
- No route config unification

## Verification Plan

1. `npm run build` succeeds with no warnings
2. `npm run preview` — manual verification:
   - Globe renders with Earth, starfield, galaxies, satellites
   - All 5 satellites orbit, hover, and click correctly
   - All 4 content pages render with images, back button works
   - Blog satellite opens ryanpdlittle.com in new tab
   - Minigame: click shooting star → countdown → gameplay → scoring → end
   - `/earth` screensaver: moon, city labels, drag/zoom, auto-drift
   - Mobile nav: all 5 buttons work
   - Resume/email links function (assembled at runtime)
   - Resume PDF not in page source HTML
3. Visual comparison against live site
