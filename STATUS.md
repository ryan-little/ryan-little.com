# Status

**Phase:** Stable — refactor complete, merged to main
**Live:** https://ryan-little.com
**Repo:** ryan-little/ryan-little.com

## Current State

V2 is fully deployed. The refactor branch (`v2`) is merged. The Three.js scene, SPA router, satellite transitions, shooting star minigame, and all 4 content pages are complete and live.

JS bundle: ~139KB gzipped (budget: 150KB — within limit).

## Remaining Work

- Content review: adventures descriptions, about section text accuracy
- Missing content images for newer adventures (spain_portugal, rocky_mountain, etc.)
- Cross-browser testing (Safari, Firefox, Chrome)

## Someday / Maybe

- SEO meta tags, `manifest.json`
- Service worker for offline / repeat-visit performance
- Code-split Three.js to reduce initial parse time (approaching 150KB bundle budget)
