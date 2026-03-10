import './styles/global.css';
import { initScene } from './globe/scene.js';
import { createEarth, refreshCloudTexture } from './globe/earth.js';
import { createStarfield } from './globe/starfield.js';
import { createGalaxies } from './globe/galaxies.js';
import { createSatellites, initSatelliteInteraction, pauseSatelliteClicks, resumeSatelliteClicks } from './globe/satellites.js';
import { initRouter, navigateTo } from './pages/router.js';
import { transitionToPage, transitionToGlobe } from './pages/transition.js';
import { renderPage } from './pages/page-renderer.js';
import { initShootingStars } from './game/shooting-star.js';
import { initMinigame } from './game/minigame.js';

function showWebGLError() {
    document.body.innerHTML = `
        <div style="background:#0a0a1a;color:#e0d8d0;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:2rem;">
            <div>
                <h1 style="color:#e8a849;margin-bottom:1rem;">Ryan Little</h1>
                <p>Your browser doesn't support WebGL, which this site requires.</p>
                <p style="margin-top:1rem;"><a href="https://linkedin.com/in/rpdlittle" style="color:#e8a849;">LinkedIn</a> · <a href="https://github.com/ryan-little" style="color:#e8a849;">GitHub</a></p>
            </div>
        </div>`;
}

async function init() {
    const container = document.getElementById('scene-container');
    if (!container) {
        console.error('Scene container not found');
        return;
    }

    try {
        initScene(container);
    } catch (err) {
        console.error('WebGL init failed:', err);
        showWebGLError();
        return;
    }
    createStarfield();
    const LIVE_CLOUD_URL = 'https://clouds.matteason.co.uk/images/4096x2048/clouds.jpg';
    await Promise.all([createGalaxies(), createEarth({ cloudUrl: LIVE_CLOUD_URL })]);
    setInterval(() => refreshCloudTexture(LIVE_CLOUD_URL), 2 * 60 * 60 * 1000);
    await createSatellites();
    await initShootingStars();
    initMinigame({
        onGameStart: () => pauseSatelliteClicks(),
        onGameEnd: () => resumeSatelliteClicks(),
    });

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

    // External links for satellites that don't have in-app pages
    const EXTERNAL_SATELLITES = {
        blog: 'https://ryanpdlittle.com',
    };

    // Connect satellite clicks to router
    initSatelliteInteraction((pageId, satellite) => {
        if (EXTERNAL_SATELLITES[pageId]) {
            window.open(EXTERNAL_SATELLITES[pageId], '_blank', 'noopener');
            return;
        }
        lastClickedSatellite = satellite;
        lastClickedSatelliteId = pageId;
        navigateTo(pageId);
    });

    // Mobile nav button handlers — same router flow as satellite clicks, no animation
    document.querySelectorAll('.mobile-nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const route = btn.dataset.route;
            if (!route) return;
            if (EXTERNAL_SATELLITES[route]) {
                window.open(EXTERNAL_SATELLITES[route], '_blank', 'noopener');
                return;
            }
            navigateTo(route);
        });
    });


}

init();

// Assemble email href at runtime to avoid scraper exposure
const emailLink = document.querySelector('[data-email-user]');
if (emailLink) {
    const addr = emailLink.dataset.emailUser + '@' + emailLink.dataset.emailDomain;
    emailLink.href = 'mailto:' + addr;
}

// Assemble resume href at runtime to avoid crawler indexing
const resumeLink = document.querySelector('[data-resume-path]');
if (resumeLink) {
    const path = resumeLink.dataset.resumePath + resumeLink.dataset.resumeExt;
    resumeLink.href = path;
    resumeLink.download = 'Ryan-Little-Resume.pdf';
}
