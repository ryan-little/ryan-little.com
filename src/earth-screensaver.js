import { initScene, getCamera } from './globe/scene.js';
import { createEarth } from './globe/earth.js';
import { createStarfield } from './globe/starfield.js';
import { createGalaxies } from './globe/galaxies.js';

// Request wake lock so screen doesn't dim during screensaver use
async function requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try {
        await navigator.wakeLock.request('screen');
        // Re-acquire if the tab comes back into focus
        document.addEventListener('visibilitychange', async () => {
            if (document.visibilityState === 'visible') {
                try { await navigator.wakeLock.request('screen'); } catch {}
            }
        });
    } catch {}
}

async function init() {
    const container = document.getElementById('scene-container');

    try {
        initScene(container);
    } catch (err) {
        console.error('WebGL init failed:', err);
        return;
    }

    // Move camera closer so Earth fills more of the screen
    getCamera().position.set(0, 0, 3.5);

    createStarfield();
    await createGalaxies();
    await createEarth();

    requestWakeLock();
}

init();
