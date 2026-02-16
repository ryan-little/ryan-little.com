# V2 Portfolio Website Redesign - Design Document

**Date:** 2026-02-15
**Author:** Ryan Little + Claude
**Status:** Approved

---

## Overview

Complete rebuild of ryan-little.com from the ground up. Same core concept (space-themed portfolio with satellites orbiting an Earth, shooting star minigame) but with modern tooling, a 3D globe, single responsive layout, and cleaner architecture.

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Build tool | Vite + vanilla ES modules | Modern bundling without framework overhead |
| 3D Engine | Three.js | Photorealistic globe with day/night + city lights |
| Layout | Single responsive (no separate mobile/desktop) | Eliminates code duplication, one codebase |
| Navigation | Separate routes with animated transitions | SEO-friendly URLs + visual interest |
| Earth style | Photorealistic NASA textures (optimized) | Compressed to ~1.3MB total for both textures |
| Satellite style | Hybrid (real photos + 3D depth effects) | Matches realistic globe aesthetic |
| Background | Three.js particle starfield + galaxy sprites | Replaces pixel art CSS backgrounds |
| Minigame stars | Pixel art (kept from v1) | Retro game aesthetic is intentional and fun |
| Hosting | GitHub Pages (static build output) | Existing hosting, works perfectly with Vite |

---

## 1. 3D Earth Globe

### Technology
- Three.js `WebGLRenderer` with `PerspectiveCamera`
- Auto-rotating `SphereGeometry` mesh

### Textures (3 layers, blended via custom shader)
- **Day map:** NASA Blue Marble, compressed to ~800KB (1024px desktop, 512px mobile)
- **Night map:** NASA Black Marble / city lights, ~500KB
- **Blend shader:** Calculates real sun position from `Date()` UTC time, renders day texture on sun-facing side and night/city lights on dark side
- The terminator line (day/night boundary) is physically accurate and moves in real-time

### Visual Effects
- Fresnel atmosphere glow (thin blue rim around Earth)
- City lights visible only on night side, intensity scales with darkness
- Slow auto-rotation (~1 revolution per 60 seconds)
- No user-controlled rotation (camera is fixed, Earth rotates)

### Mobile Optimization
- Lower geometry segments: 32 (mobile) vs 64 (desktop)
- Smaller textures: 512px (mobile) vs 1024px (desktop)
- `devicePixelRatio` capped at 2
- Reduced shader complexity if needed (fallback to simpler blend)

---

## 2. Satellite Orbit System

### Architecture
- 4 satellites orbiting the globe in Three.js 3D space
- Real elliptical orbits (not CSS animations)
- Each satellite: textured plane (real satellite photo, transparent background)
- Billboard rendering: always faces camera
- Floating HTML labels via `CSS2DRenderer` (crisp text overlay on 3D scene)

### Visual Effects
- Subtle shadow cast on globe
- Slight tilt variation based on orbit position
- Size perspective (slightly larger when closer to camera)
- Hover/tap: satellite slows, scales up, label brightens
- Glow effect on hover

### Responsiveness
- Same satellite system on all screen sizes
- Orbit radius scales with viewport (tighter orbits on mobile)
- Touch-friendly hit targets (tap zone larger than visual satellite)

### Satellite Assets
- Real geospatial satellite photos with transparent backgrounds
- Option 1: Edited photos of actual satellites (Landsat, GOES, Sentinel, etc.)
- Option 2: High-quality renders of satellite 3D models
- Each satellite image ~50-100KB (WebP, transparent)

---

## 3. Background

### Starfield
- Three.js particle system (single draw call for all stars)
- Thousands of small points distributed in a large sphere around the scene
- Stars vary in size, brightness, and color (white, slight blue, slight yellow)
- Subtle twinkling (random opacity oscillation on a subset)
- Parallax effect during page transitions (camera movement causes subtle shift)

### Galaxies & Nebulae
- 3-5 distant galaxy/nebula sprites placed in the skybox
- Hubble-style images at low opacity
- Subtle nebula glow in 1-2 areas (textured planes or additive blended sprites)
- Adds depth and wonder without performance cost

---

## 4. Page Navigation & Transitions

### Routing
- SPA with History API (same approach as v1, improved)
- URLs: `/`, `/about`, `/portfolio`, `/adventures`, `/trees`
- GitHub Pages 404.html redirect for deep linking (proven pattern from v1)
- Service worker intercepts routes for offline support

### Transition: Globe → Content Page
1. User clicks/taps a satellite
2. Camera smoothly zooms toward the clicked satellite (~1s ease-out)
3. Scene fades/blurs as camera approaches
4. Crossfade to content page
5. Satellite image persists at top of page as visual anchor
6. Content page has dimmed star particle background

### Transition: Content Page → Globe
1. "Back to Earth" button or browser back
2. Content fades out
3. Camera zooms back to globe view
4. Satellites and globe fade in
5. Resume auto-rotation and orbits

### Content Pages
- Clean, modern card-based layout
- Responsive grid (CSS Grid)
- Space-themed header with satellite image
- Smooth scroll within pages
- Image lazy loading with blur-up placeholders
- Sections can be reordered/redesigned freely
- No more duplicated overlay HTML (one template system)

---

## 5. Minigame (Polished Shooting Stars)

### Core Gameplay (same as v1)
- Triggered by clicking a background shooting star
- 3-2-1-GO countdown
- 20-second game: click/tap shooting stars for points
- 5-second cooldown after game ends

### New Features
- **High score persistence:** localStorage, displayed after each game
- **Particle burst:** Quick 3D particle explosion when star is caught
- **Combo system:** Catching stars in quick succession multiplies points (x2, x3, x4)
- **Star trails:** Pixel art stars with particle trail effect in 3D space
- **Difficulty scaling:** Stars spawn faster as game progresses

### Bug Fixes from v1
- **Tab switching fix:** Page Visibility API pauses game timer and star spawning when tab is hidden. Resume cleanly without star bunching.
- **UI fade simplified:** CSS class toggles instead of 200+ lines of inline style manipulation
- **State management:** Clean state machine (idle → countdown → active → ending → cooldown → idle) instead of scattered boolean flags

### Visual Style
- Keep pixel art shooting star sprite (retro game aesthetic)
- Stars fly through the 3D star field (depth perception)
- Score and timer as HTML overlay (CSS-styled, not DOM-heavy)
- Satellites dim with a single CSS class toggle

---

## 6. Project Structure

```
v2/
  index.html                      # Single entry point
  vite.config.js                  # Build config + GitHub Pages settings
  package.json                    # Dependencies (three, vite)
  src/
    main.js                       # App entry, scene init, router init
    globe/
      scene.js                    # Three.js scene, renderer, camera, resize
      earth.js                    # Earth mesh, textures, day/night shader
      satellites.js               # Satellite objects, orbits, interaction
      starfield.js                # Background stars + galaxy sprites
      lighting.js                 # Sun position calculation, terminator math
    game/
      minigame.js                 # Game state machine, lifecycle
      shooting-star.js            # Star creation, physics, rendering
      effects.js                  # Particle effects (burst, trail, combo text)
      scoring.js                  # Score, combos, high score (localStorage)
    pages/
      router.js                   # SPA routing (History API)
      transition.js               # Camera zoom + crossfade animations
      page-renderer.js            # Dynamic page content from JSON
      about.js                    # About page layout/logic
      portfolio.js                # Portfolio page layout/logic
      adventures.js               # Adventures page layout/logic
      trees.js                    # Trees page layout/logic
    styles/
      global.css                  # Base styles, CSS variables, fonts
      pages.css                   # Content page layouts, cards, grids
      game.css                    # Minigame UI overlay styles
      transitions.css             # Page transition animations
  public/
    textures/
      earth-day.jpg               # NASA Blue Marble (~800KB)
      earth-night.jpg             # NASA Black Marble (~500KB)
    satellites/
      landsat.webp                # Real satellite photos (transparent)
      goes.webp
      sentinel.webp
      iss.webp
    galaxies/
      nebula1.webp                # Distant galaxy sprites
      nebula2.webp
    images/                       # Content images from v1 (optimized)
      [carried over and compressed]
    shooting-star.png             # Pixel art star from v1
  data/
    content.json                  # Content data (from v1, possibly restructured)
```

---

## 7. Performance Budget

| Metric | Target | v1 Baseline |
|--------|--------|-------------|
| Initial JS bundle | <150KB gzipped | ~100KB unminified |
| Three.js (tree-shaken) | ~100KB gzipped | N/A |
| Earth textures | ~1.3MB total | N/A (2D sprite was 212KB) |
| Total assets (initial load) | <3MB | ~5MB+ |
| Time to interactive | <3s on 4G | ~4-5s estimated |
| Frame rate (idle) | 60fps desktop, 30fps mobile | Variable |
| Frame rate (minigame) | 30fps+ all devices | Drops on mobile |

### Optimization Strategies
- Texture lazy loading (low-res placeholder → full res)
- Adaptive quality based on device capabilities
- requestAnimationFrame with delta time (no fixed-fps assumptions)
- Object pooling for shooting stars (reuse instead of create/destroy)
- Compressed textures (KTX2/Basis Universal if browser supports)
- Vite code splitting (Three.js loaded only when needed)

---

## 8. Migration Plan

### Phase 0: Setup
- Move all current files to `v1/` directory
- Initialize Vite project in `v2/`
- Set up GitHub Pages deployment from `v2/dist/`

### Phase 1: Core 3D Scene
- Three.js scene, camera, renderer
- Earth mesh with day/night shader
- Starfield + galaxies
- Responsive resize handling

### Phase 2: Satellites & Interaction
- Satellite objects with orbits
- Label rendering (CSS2DRenderer)
- Hover/click interaction
- Mobile touch handling

### Phase 3: Page System
- SPA router
- Page transition animations (camera zoom)
- Content pages (about, portfolio, adventures, trees)
- Content loading from JSON

### Phase 4: Minigame
- Shooting star system (pixel art in 3D space)
- Game state machine
- Scoring + combos + high score
- Particle effects
- Tab visibility handling

### Phase 5: Polish
- Asset optimization (texture compression, image optimization)
- Performance profiling + fixes
- Service worker for offline
- PWA manifest
- SEO (meta tags, structured data)
- Cross-browser testing

---

## 9. Known Risks

| Risk | Mitigation |
|------|------------|
| Three.js bundle size | Tree-shaking + code splitting. Only import used modules. |
| Mobile WebGL performance | Adaptive quality, lower-res textures, reduced geometry |
| NASA texture licensing | Blue Marble and Black Marble are public domain |
| Satellite photo sourcing | NASA/ESA satellite images are typically public domain. Fallback: 3D renders |
| Browser WebGL support | Graceful fallback to 2D canvas or static image for old browsers |
| GitHub Pages SPA routing | Proven 404.html redirect pattern from v1 |

---

## 10. What We're Keeping from V1

- `content.json` data (possibly restructured)
- Content images (optimized)
- Pixel art shooting star sprite
- Space theme and color palette
- "Back to Earth" navigation metaphor
- Minigame core gameplay
- GitHub Pages hosting
- Service worker offline support pattern
- SPA routing with deep link support

## What We're Dropping

- Separate mobile/desktop HTML files
- CSS background-based starfield
- 2D pixel art Earth sprite
- Window global state management
- Script loading order dependencies
- 200+ lines of inline style manipulation
- Code duplication between mobile.js and desktop.js
- Mobile link tree (replaced by responsive satellite orbits)
- Manual cache busting (Vite handles this)
