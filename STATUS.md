# Status

**Phase:** Stable — maintenance only
**Last updated:** 2026-05-14
**Live:** https://ryan-little.com
**Repo:** ryan-little/ryan-little.com

## Current State

Fully deployed and stable. Three.js globe, SPA router, satellite transitions, shooting star minigame, and all 4 content pages live. Full audit done 2026-04-04 (48 issues fixed). JS bundle ~139KB gzipped (budget: 150KB).

## Recent Work (2026-05-14)

- Fixed full-page screenshot support — `page-open` class on `<html>` switches `#page-container` from `position: fixed` to `position: absolute` when a page is open, allowing browsers and iOS to detect full document height
- Fixed interval leaks — `sunCacheInterval` and cloud refresh intervals now properly guarded; IDs stored
- Deduplicated error UI — `showWebGLError` / `showInitError` merged into `showFatalError(message)`
- Hardened Methuselah age calc — parses base age + year from content string via regex instead of hardcoded string match
- Added Cloudflare Web Analytics beacon snippet directly to `index.html` — fixes CORS/SRI errors from Cloudflare's auto-injected tag using a mismatched integrity hash

## Remaining Work

- Content review: adventures descriptions, about section text accuracy
- Missing content images for newer adventures (spain_portugal, rocky_mountain, etc.)
- **Disable Cloudflare Web Analytics auto-injection** in Cloudflare dashboard (Speed > Web Analytics → switch to Manual) — beacon is in index.html directly; auto-inject creates a duplicate broken tag

## Someday / Maybe

- Code-split Three.js to reduce initial parse time (approaching 150KB bundle budget)
- Cross-browser audit (Safari, Firefox, Chrome)
