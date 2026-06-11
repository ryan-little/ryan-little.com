# Status

**Phase:** Stable — maintenance only
**Last updated:** 2026-06-11
**Live:** https://ryan-little.com
**Repo:** ryan-little/ryan-little.com

## Current State

Fully deployed and stable. Three.js globe, SPA router, satellite transitions, shooting star minigame, and all 4 content pages live. Full audit done 2026-04-04 (48 issues fixed). Initial blocking JS ~11.4KB gzipped after the 2026-06-11 code-split; Three.js chunk (~131KB gzipped) loads async behind the spinner.

## Recent Work (2026-06-11)

- **Vite 7 → 8 upgrade** (Rolldown): `rollupOptions` → `rolldownOptions`, `manualChunks` → `output.codeSplitting.groups`
- **Code-split Three.js**: new `src/scene-boot.js` holds all Three-dependent bootstrap, loaded via dynamic `import()` from `main.js`. Router, mobile nav, page rendering, and hero links boot immediately; `showPageNow`/`hidePageNow` DOM-only fallbacks handle navigation before the scene is ready. Initial blocking JS 144.7KB → 11.4KB gzipped
- 7-angle agent review of the full diff: most candidates refuted against code (raycaster/pool invariant holds; reduced-motion removal is self-consistent; deep-link `isPaused` state correct; error paths covered). One fix applied: extracted duplicated resume download handler into `src/download.js`
- Cloudflare auto-injection issue verified resolved on the live site (single clean beacon tag); wrangler OAuth can't manage Web Analytics — dashboard only
- Content audit: all 33 referenced images exist on disk ("missing images" item was stale); see Remaining Work for polish items
- Hardened resume download handlers (`main.js`, `page-renderer.js`) — try/catch + `res.ok` check + anchor appended to DOM for Safari; user-visible alert on failure
- Per-route `document.title` in `router.js` (e.g. "About Me — Ryan Little"); home title restored on back/popstate
- Removed `prefers-reduced-motion` CSS block from `global.css` — decided against accessibility machinery for a personal site (recoverable from git history)
- Removed redundant `.filter()` allocation in `checkStarHit` (`shooting-star.js`) — pool invariant guarantees active stars are visible/uncaught
- Removed incorrect `esc()` on `data-resume-link` attribute value (read via `.dataset`, not rendered)
- Deps: three 0.182 → 0.184 (+1.6KB gzipped), vite → 8.0.16
- **Repositioning**: hero subtitle and all head metadata (title, meta/OG/Twitter descriptions, schema.org jobTitle) now say "Geospatial Analyst" only — Developer identity removed "for now" per Ryan; content.json body mentions of web development left as-is

## Recent Work (2026-05-14)

- Fixed full-page screenshot support — `page-open` class on `<html>` switches `#page-container` from `position: fixed` to `position: absolute` when a page is open, allowing browsers and iOS to detect full document height
- Fixed interval leaks — `sunCacheInterval` and cloud refresh intervals now properly guarded; IDs stored
- Deduplicated error UI — `showWebGLError` / `showInitError` merged into `showFatalError(message)`
- Hardened Methuselah age calc — parses base age + year from content string via regex instead of hardcoded string match
- Added Cloudflare Web Analytics beacon snippet directly to `index.html` — fixes CORS/SRI errors from Cloudflare's auto-injected tag using a mismatched integrity hash

## Remaining Work

- Content polish (audited 2026-06-11 — all 33 referenced images exist on disk; spain_portugal/rocky_mountain "missing images" item was stale):
  - `rocky-mountain` description is the thinnest entry — no named trail/summit/landmark
  - `japan` entry uses `osaka_headshot.webp` but Osaka isn't in its location list ("Tokyo, Kyoto, Hiroshima, Nara")
  - `lhlhammer_transback.webp` is orphaned in public/images/ (unreferenced)
  - About page: `wateringreenland.webp` captioned as professional remote-sensing work — could read as CACI-specific

## Someday / Maybe

- Cross-browser audit (Safari, Firefox, Chrome)
- Single source of truth for page titles (`ROUTE_TITLES` in router.js duplicates content.json titles — fine at 4 static pages)
