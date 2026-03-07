# ryan-little.com - V2 Rebuild

## Project Overview
Personal portfolio website for Ryan Little (Geospatial Analyst). Space-themed with 3D Earth globe, orbiting satellites for navigation, and a shooting star minigame.

## Tech Stack
- **Build:** Vite 7 + vanilla ES modules (no framework)
- **3D:** Three.js r182
- **Styles:** CSS3 (Grid, custom properties)
- **Deployment:** GitHub Pages (static build from `dist/`)

## Key Architecture
- Three.js renders a 3D scene (Earth, satellites, starfield)
- Lightweight SPA router handles page navigation with camera zoom transitions
- Content loads from `src/data/content.json`
- Single responsive layout serves all devices
- No CSS2DRenderer — satellite labels are plain HTML divs positioned via JS projection
- Camera animation system in `scene.js` with ease-in-out cubic easing

## Directory Structure
```
src/
  main.js                  # App entry point, tracks lastClickedSatellite
  globe/                   # Three.js 3D scene modules
    scene.js               # WebGL renderer, camera, render loop, onUpdate(), animateCamera()
    earth.js               # Earth mesh + day/night shader + atmosphere
    satellites.js          # Satellite sprites + XY-plane orbits + HTML labels + raycasting + glow
    starfield.js           # 9000 star particles (6000 main + 3000 Milky Way band) with ShaderMaterial
    galaxies.js            # 26 galaxy/nebula sprites on sky sphere with additive blending + drift
    lighting.js            # Real-time sun position from UTC
  game/                    # Minigame modules
    minigame.js            # Game state machine (idle→countdown→active→ending→cooldown)
    shooting-star.js       # Object-pooled shooting stars (60 pool), edge-spawning
    scoring.js             # Score + combos + localStorage high score
  pages/                   # Content page modules
    router.js              # SPA routing (History API + 404.html deep linking)
    transition.js          # Satellite exit/entrance animations + page transitions
    page-renderer.js       # Renders all 4 pages from content.json + static satellite images
  styles/
    global.css             # Base styles, CSS variables, satellite label styles, hero animations
    pages.css              # Content page layouts, card animations, hover effects
    game.css               # Minigame overlay styles, countdown/end animations
    transitions.css        # Page transition opacity rules
  data/
    content.json           # All page content (from v1, image paths remapped in renderer)
public/                    # Static assets (copied to dist/)
  textures/                # NASA Blue Marble (day) + Black Marble (night)
  satellites/              # satellite1-4.webp
  galaxies/                # galaxy1-26.webp — cropped from spritesheet
  images/                  # Content images (webp)
  404.html                 # GitHub Pages SPA redirect
docs/plans/                # Design + implementation plans
```

## Design Decisions

Full design decisions reference (satellite transitions, shader details, color palette, animation specs, image handling, starfield/galaxy config): `knowledge-hub/projects/ryan-little-com/design-decisions.md`

Key quick-reference:
- **Palette:** Gold accent `#e8a849`, warm gray `#b0a8a0`, pure black background
- **Satellite orbits:** XY plane, 0.25 rad/s, ray-sphere occlusion, tidal locking
- **Transitions:** Satellite scales to 200px static image position, 450ms crossfade
- **Content.json paths:** v1 used `assets/images_webp/X`, renderer remaps to `/images/X`

## Conventions
- ES module imports/exports (no window globals)
- CSS custom properties defined in `src/styles/global.css`
- Three.js objects use `scene.js`'s `onUpdate(callback)` for per-frame logic
- Font: Inter (Google Fonts)
- Icons: Font Awesome 6.4
- Image format: WebP preferred

## Build
```bash
npm run dev      # Dev server on :3000
npm run build    # Production build to dist/
```
- JS bundle: ~139KB gzipped (budget: 150KB)
- Earth textures: ~1MB total (Blue Marble 239KB + Black Marble 794KB)

## Branch
- `v2` branch for all development
- `main` branch has original v1 site

## Plans
- Design doc: `docs/plans/2026-02-15-v2-redesign-design.md`
- Implementation plan: `docs/plans/2026-02-15-v2-implementation-plan.md`

## Remaining Work
- Review page content for accuracy/quality (adventures descriptions, about section, etc.)
- SEO meta tags, service worker, manifest.json
- Missing content images for newer adventures (spain_portugal, rocky_mountain, etc.)
- Cross-browser testing
- Consider code-splitting Three.js to reduce chunk warning
