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
- **Name/links centered over the Earth** (not above it)
- **Social button order:** LinkedIn, GitHub, Email, Little Hammer Labs
- **Day/night terminator:** Object-space normals in shader, `getSunDirection()` outputs directly in mesh object space (PM at +X, 90°E at -Z matching Three.js SphereGeometry UV mapping). No quaternion transform needed — terminator is geographically accurate regardless of rotation speed.
- **Earth rotation:** 90 seconds per revolution (decorative). Terminator stays geographically correct at all times.
- **Earth brightness:** Day side shader uses `0.5 + 1.3 * intensity` (max 1.8x), night side boosted 1.4x. Atmosphere glow at 1.3x intensity with warm blue-white tint.
- **Satellite sprites:** Realistic satellite images with transparent backgrounds. Sprites render above Earth (depthTest: false). Orbit size 0.2 desktop / 0.15 mobile. Sensors (right side of image) always face Earth via `material.rotation = d.angle + Math.PI` (tidal locking).
- **Satellite orbits:** XY plane (screen plane) so they're always visible. Frustum-based responsive sizing using camera FOV + aspect ratio. Same orbit speed (0.25 rad/s) with evenly spaced phases — prevents grouping. Orbit radii 2.1–2.5 units. `MAX_CONFIGURED_RADIUS` auto-derived from config.
- **Satellite occlusion:** Labels and sprites hide behind Earth via ray-sphere intersection test each frame (JS-based, not depth buffer)
- **Satellites disabled during minigame:** Raycaster and label pointer-events blocked when game state is not idle
- **Satellites hidden during page view:** Separated `isPaused` (page pause) from `isHoverPaused` (hover pause). When a page is open, satellites are hidden, clicks blocked, orbits frozen.
- **Satellite hover effects:** White orb glow sprite with additive blending, `.hovered` class with gold text-shadow on labels
- **Satellite labels:** 1.1rem, font-weight 600, staggered fade-in (0s, 0.3s, 0.6s, 0.9s)
- **Satellite click transition (exit):** Clicked satellite scales up to match the 200px static page image and moves to the page-header position. During the fly, it rotates from orbit rotation back to upright (0) to match the static image. Label hidden immediately. Other satellites do reverse stagger fade-out. Page crossfades in at 450ms overlap. Target position measured via `measureSatelliteTarget()` (briefly shows page invisibly to get exact `.page-satellite` bounding rect). `transition-placed` class skips CSS fade-in animation on the static image.
- **Satellite click transition (return):** When navigating back, the last-clicked satellite reverse-animates from the page image position back to its orbit — shrinking, spinning from upright to orbit-locked rotation. Other satellites stagger-fade in normally. Satellites are not clickable/hoverable until initial fade-in completes.
- **Warm color palette:** Accent is gold `#e8a849`, muted text is warm gray `#b0a8a0`, background is pure black
- **Animations:** Hero entrance (1.5s), social link stagger (1.2s-1.8s), card stagger-fade (12 levels), counter count-up, hover glow effects, game UI countdown/end animations
- **Social link hovers:** White drop-shadow glow + scale 1.3x
- **Image handling:** `aspect-ratio` with `object-fit: cover` (3:2 adventures, 16:9 default trees, 3:4 portrait for General Sherman + Hyperion via `TREE_PORTRAIT` set, circle headshot with `center top`). Custom `object-position` per tree via `TREE_CROP` map in renderer.
- **Content alignment:** Titles, subtitles, headers, tags, stats all centered. Descriptions/body text left-aligned.
- **Static satellite images on pages:** 200px desktop / 140px mobile, displayed above page title
- **Page container semi-transparent:** `rgba(0, 0, 0, 0.82)` so starfield is visible through
- **Content.json paths:** v1 used `assets/images_webp/X`, renderer remaps to `/images/X`
- **Starfield:** Custom ShaderMaterial with per-vertex sizes (power distribution up to 8.5px), 40 feature stars (6-10px, warmer colors), 6000 main + 3000 Milky Way band (tilted 30°), 1000 twinkling with independent drift
- **Shooting stars:** Spawn from screen edges using camera visible area. Pool of 60. Minigame spawns 2-3 at a time with accelerating interval (0.4s→0.15s). Background stars blocked during content page view.
- **Galaxy sprites:** 26 unique galaxy/nebula images cropped from spritesheet (732KB total webp). Placed on a 400-unit radius sky sphere with additive blending, opacity 1.0, random sizes (10-50 units), random rotations. Anti-clustering with 120-unit minimum spacing. Slow Y+X axis drift matching starfield.
- **Portfolio logos:** Auto-detected via alt text containing "Logo", capped at 180px with `.portfolio-logo` class
- **Enlargeable images:** Portfolio additional images (below main image) are clickable with a lightbox overlay for full-size viewing. "(click to enlarge)" hint shown in caption.
- **Methuselah age:** Auto-computed from current year in page-renderer.js (base: 4,854 years as of 2024). No hardcoded "as of" date.

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
