// Three.js-dependent bootstrap, loaded via dynamic import() from main.js so
// the three chunk stays out of the initial bundle.
import { initScene } from './globe/scene.js';
import { createEarth, refreshCloudTexture } from './globe/earth.js';
import { createStarfield } from './globe/starfield.js';
import { createGalaxies } from './globe/galaxies.js';
import { createSatellites, initSatelliteInteraction, pauseSatelliteClicks, resumeSatelliteClicks, animateSatelliteExit } from './globe/satellites.js';
import { getCurrentRoute } from './pages/router.js';
import { initShootingStars } from './game/shooting-star.js';
import { initMinigame } from './game/minigame.js';
import { CLOUD_TEXTURE_URL } from './constants.js';

export { transitionToPage, transitionToGlobe } from './pages/transition.js';

export function startRenderer(container) {
    initScene(container);
}

export async function populateScene({ onSatelliteClick }) {
    createStarfield();
    await Promise.all([createGalaxies(), createEarth({ cloudUrl: CLOUD_TEXTURE_URL })]);
    const _cloudRefreshInterval = setInterval(() => refreshCloudTexture(CLOUD_TEXTURE_URL), 2 * 60 * 60 * 1000);
    await createSatellites();
    await initShootingStars();
    initMinigame({
        onGameStart: () => pauseSatelliteClicks(),
        onGameEnd: () => resumeSatelliteClicks(),
    });
    initSatelliteInteraction(onSatelliteClick);

    // If a page was deep-linked before the scene finished loading, put the
    // satellites in the post-navigation state so the back transition works.
    if (getCurrentRoute()) {
        animateSatelliteExit(null, null);
    }
}
