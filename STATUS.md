# Status

**Phase:** Stable — maintenance only
**Last updated:** 2026-08-17
**Live:** https://ryan-little.com
**Repo:** ryan-little/ryan-little.com

## Current State

Fully deployed and stable. Three.js globe, SPA router, satellite transitions, shooting star minigame, and all 4 content pages live. Full audit done 2026-04-04 (48 issues fixed). Initial blocking JS ~11.4KB gzipped after the 2026-06-11 code-split; Three.js chunk (~131KB gzipped) loads async behind the spinner. Separate `/earth` ambient screensaver page (real-time-rotation globe, own Vite entry) — expanded 2026-06-17.

## Recent Work (2026-08-17)

Content refresh audited against The Atlas, plus a CI bump. No code changes — `content.json` and `index.html` metadata only.

- **Added two Penn State portfolio pieces** at the top of the GIS section: the published **California Wildfires Since 2000 StoryMap** (link + cover image, captured headless from the live page at 1600x890 WebP) and the **Wildfire Structure Risk Tool** (GEOG 485 final: arcpy toolbox, DEM slope + LANDFIRE fuel reclass, 100 ft defensible space radius, Idyllwild test area). The risk tool has no image — its ArcGIS Pro outputs live on the Windows machine
- **Removed Little Hammer Labs entirely** — the portfolio card and its DGA Transcriber sub-item, the About page "Building" card, and the schema.org person description in `index.html`. LHL was archived in the vault 2026-08-12 as dormant. `lhl-logo.webp`, `dgatranscribericon.webp` and `lhlhammer_transback.webp` are now orphaned in `public/images/`
- **About: "Building" → "Currently Studying"** (graduation-cap icon) — Penn State Graduate Certificate in Spatial Data Science, the two finished courses, and the credits carrying into the M.S. Kept as the third card so the `sections.slice(0, 3)` grid layout holds. No grades, no course numbers, per Ryan
- **Development section restructured:** the "Personal Sites" paired card became a **"Writing"** paired card holding **Pyrogeography** and **Summit Register**, both described as in preparation with no outbound links (neither publication is public yet). `ryan-little.com` split out as its own item; `ryanpdlittle.com` no longer appears as a portfolio entry, though the Blog nav link still points there since it's still publishing weekly
- **CI:** `deploy.yml` off Node 20 and deprecated action majors (checkout@v6, setup-node@v7 on Node 22, configure-pages@v6, upload-pages-artifact@v5, deploy-pages@v5)
- Adventures page left untouched — Ryan is considering removing it, so the missing 2026 trips (Zion, the World Cup weekend, Whitney) and the 12 countries / 22 national parks counters were deliberately not updated. The vault's Travel History recount gets 9 and 9

## Recent Work (2026-06-17)

Major feature pass on the **`/earth` ambient screensaver** (separate entry; homepage globe left visually unchanged — all `/earth`-only effects are gated behind `createEarth` options):

- **Visible sun** (`globe/sun.js`) — billboard locked to the live subsolar point, ray-test limb occlusion so the Earth eclipses it on the night side
- **Moon texture** — real lunar surface map (`moon.webp`, Solar System Scope CC-BY 4.0); was a flat gray sphere
- **Geographic graticule** (`globe/graticule.js`) — 15° lat/long lines, equator/prime-meridian highlighted, named circles (tropics ±23.44°, polar ±66.56°); degree + name labels, horizon-culled
- **Country borders** (`globe/borders.js`) — white Natural Earth 110m outlines pre-flattened to `public/data/borders.json` (47KB gzip), single LineSegments draw call
- **Layer legend** (`globe/legend.js`) — hover-revealed panel toggling clouds, borders, cities, graticule, day/night, atmosphere, sun, moon; state persisted to localStorage
- **8192×4096 day/night/cloud textures** on capable GPUs (gated by `renderer.capabilities.maxTextureSize >= 8192`), 4096 fallback for mobile; `earth-day-8k.webp` / `earth-night-8k.webp` bundled, HQ clouds (`CLOUD_TEXTURE_URL_HQ`) fetched live
- Round glowing city markers (replaced white squares, shrunk to 0.012); +18% earth brightness + boosted atmosphere rim — both `/earth`-only uniforms
- **Cloud refresh aligned to matteason's true 3h cadence** (`cloud-schedule.js`, synoptic UTC hours + 25min margin) — applied to homepage globe too
- Tried and **removed during iteration**: bloom post-processing (too bright), ISS live tracker (read oddly), earthquakes (USGS) + wildfires (NASA EONET) data layers — settled on a clean borders-only data overlay
- New modules: `sun.js`, `graticule.js`, `legend.js`, `borders.js`, `geo.js`, `cloud-schedule.js`. Merged `earth-enhancements` → main, deployed live.

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
  - `lhlhammer_transback.webp`, `lhl-logo.webp` and `dgatranscribericon.webp` are orphaned in public/images/ (unreferenced since the 2026-08-17 LHL removal)
  - About page: `wateringreenland.webp` captioned as professional remote-sensing work — could read as CACI-specific
- **Adventures page: decision pending.** Ryan is considering removing it (2026-08-17). Until that's settled it stays as-is, stale: no 2026 trips, and counters claiming 12 countries / 22 national parks the vault can't support
- **Wildfire Structure Risk Tool needs a map image.** Everything else in the GIS section has one. A risk-scored structure export from ArcGIS Pro would do it; the project files are on the Windows machine
- **Writing card links.** Pyrogeography and Summit Register are named without links because neither is public. Add `link` fields once they launch (`pyrogeography.substack.com` is reserved; Summit Register's URL is unset)

## Someday / Maybe

- Cross-browser audit (Safari, Firefox, Chrome)
- Single source of truth for page titles (`ROUTE_TITLES` in router.js duplicates content.json titles — fine at 4 static pages)
