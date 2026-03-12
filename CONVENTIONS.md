# Conventions

## JavaScript

- ES modules throughout — `import`/`export`, no CommonJS, no `window` globals
- No framework — vanilla JS only
- Three.js per-frame logic registers via `scene.js`'s `onUpdate(callback)` — do not add logic directly to the render loop
- Prefer named exports over default exports for module clarity

## CSS

- Custom properties defined in `src/styles/global.css` — use them everywhere
- No inline styles or style manipulation via JS (except Three.js canvas positioning)
- CSS Grid for page layouts; Flexbox for alignment within components
- Mobile-first where possible

## Three.js

- Objects that need per-frame updates register with `onUpdate()`, not a separate `requestAnimationFrame`
- Satellite sprites: `depthTest: false` (render above Earth mesh)
- Occlusion: JS ray-sphere intersection test — don't rely on depth buffer for sprite visibility
- Tidal locking pattern: `material.rotation = angle + Math.PI` for Earth-facing sprites

## Assets

- Images: WebP format preferred
- Static assets: `public/` (copied verbatim to `dist/`, not processed by Vite)
- Processed assets (imported in JS/CSS): `src/assets/` if needed
- Earth textures: NASA Blue Marble (day) + Black Marble (night) — do not replace without checking file size impact on bundle

## Color Palette

```
--accent: #e8a849        /* gold */
--muted:  #b0a8a0        /* warm gray */
--bg:     #000000        /* pure black */
```

## Typography

- Font family: Inter (loaded from Google Fonts)
- Icons: Font Awesome 6.4 (CDN)
- Satellite labels: 1.1rem, font-weight 600

## Animation Specs

- Hero entrance: 1.5s fade/slide
- Social links stagger: 1.2s–1.8s
- Satellite label stagger: 0s / 0.3s / 0.6s / 0.9s
- Card grid stagger: 12 levels
- Satellite transition crossfade overlap: 450ms

## Build

- Dev: `npm run dev` → localhost:3000
- Production: `npm run build` → `dist/`
- JS bundle budget: 150KB gzipped (currently ~139KB)
- Do not commit `dist/` — GitHub Pages deploys from the `dist/` output of the build action (or direct push; check current deploy method)
