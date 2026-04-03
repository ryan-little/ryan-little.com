# ryan-little.com

Space-themed personal portfolio. 3D Earth globe with orbiting satellite navigation and a shooting star minigame. Vite 7 + vanilla JS/CSS + Three.js r182, deployed to GitHub Pages.

## Stack

- **Build:** Vite 7, vanilla ES modules, no framework
- **3D:** Three.js r182
- **Styles:** CSS Grid + custom properties
- **Hosting:** GitHub Pages (static build from `dist/`)
- **Fonts:** Inter (Google Fonts), Font Awesome 6.4
- **Images:** WebP

## Commands

```bash
npm run dev      # Dev server on localhost:3000
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

## Project Structure

```
src/
  main.js              # Entry point; tracks lastClickedSatellite for return transition
  constants.js         # Shared constants
  globe/               # Three.js 3D scene
    scene.js           # Renderer, camera, render loop, onUpdate(), animateCamera()
    earth.js           # Earth mesh + day/night shader + atmosphere
    satellites.js      # Satellite sprites, XY-plane orbits, HTML labels, raycasting, glow
    starfield.js       # 9,000 star particles (ShaderMaterial, power distribution, Milky Way band)
    galaxies.js        # 26 galaxy/nebula sprites on sky sphere with anti-clustering
    lighting.js        # Real-time sun position from UTC
  game/                # Shooting star minigame
    minigame.js        # State machine: idle → countdown → active → ending → cooldown
    shooting-star.js   # Object pool of 60 shooting stars, edge-spawning
    scoring.js         # Score, combos, localStorage high score
  pages/               # Content pages
    router.js          # SPA router (History API + 404.html GitHub Pages redirect)
    transition.js      # Satellite exit/entrance animations + page crossfade
    page-renderer.js   # Renders 4 pages from content.json; special-case image handling
  styles/
    global.css         # Base styles, CSS variables, satellite labels, hero animations
    pages.css          # Content page layouts, card animations, hover effects
    game.css           # Minigame overlay styles
    transitions.css    # Page transition opacity rules
  data/
    content.json       # All page content (v1 format; paths remapped at render time)
public/                # Static assets copied verbatim to dist/
  textures/            # NASA Blue Marble (day, 239KB) + Black Marble (night, 794KB)
  satellites/          # satellite1-4.webp
  galaxies/            # galaxy1-26.webp (cropped from spritesheet)
  images/              # Content images (WebP)
  404.html             # GitHub Pages SPA deep-link redirect
docs/plans/            # Historical design + implementation plans (read-only reference)
```

## Key Architecture

The Three.js scene is the UI — satellites are the nav items. See ARCHITECTURE.md for component breakdown, data flow, and key patterns.

## Conventions

See CONVENTIONS.md.

## Branch Notes

- `main` — production (GitHub Pages deploys from here)
- `v2` branch existed during the refactor; merged to main. All work goes directly to main now.
