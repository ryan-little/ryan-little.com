import './styles/global.css';
import { initScene } from './globe/scene.js';
import { createEarth } from './globe/earth.js';
import { createStarfield } from './globe/starfield.js';
import { createGalaxies } from './globe/galaxies.js';
import { createSatellites, initSatelliteInteraction } from './globe/satellites.js';
import { initRouter, navigateTo } from './pages/router.js';
import { transitionToPage, transitionToGlobe } from './pages/transition.js';
import { renderPage } from './pages/page-renderer.js';
import { initShootingStars } from './game/shooting-star.js';
import { initMinigame } from './game/minigame.js';

async function init() {
    const container = document.getElementById('scene-container');
    if (!container) {
        console.error('Scene container not found');
        return;
    }

    initScene(container);
    createStarfield();
    await createGalaxies();
    await createEarth();
    await createSatellites();
    await initShootingStars();
    initMinigame();

    // Store last clicked satellite for zoom transitions
    let lastClickedSatellite = null;
    let lastClickedSatelliteId = null;

    // Router
    initRouter({
        onNavigate: async (route) => {
            renderPage(route, lastClickedSatelliteId);
            await transitionToPage(lastClickedSatellite);
            lastClickedSatellite = null;
            lastClickedSatelliteId = null;
        },
        onBack: async () => {
            await transitionToGlobe();
        },
    });

    // Connect satellite clicks to router
    initSatelliteInteraction((pageId, satellite) => {
        lastClickedSatellite = satellite;
        lastClickedSatelliteId = pageId;
        navigateTo(pageId);
    });

    console.log('v2 initialized');
}

init();
