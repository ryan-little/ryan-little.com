import './styles/global.css';
import { initRouter, navigateTo } from './pages/router.js';
import { renderPage } from './pages/page-renderer.js';
import { downloadResume } from './download.js';

// External links for satellites that don't have in-app pages
const EXTERNAL_SATELLITES = {
    blog: 'https://ryanpdlittle.com',
};

// Set once the dynamically imported Three.js scene has fully booted.
// Until then, navigation falls back to instant DOM-only page show/hide.
let sceneApi = null;

// Store last clicked satellite for zoom transitions
let lastClickedSatellite = null;
let lastClickedSatelliteId = null;

function showFatalError(message) {
    document.body.innerHTML = `
        <div style="background:#0a0a1a;color:#e0d8d0;font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:2rem;">
            <div>
                <h1 style="color:#e8a849;margin-bottom:1rem;">Ryan Little</h1>
                <p>${message}</p>
                <p style="margin-top:1rem;"><a href="https://linkedin.com/in/rpdlittle" style="color:#e8a849;">LinkedIn</a> · <a href="https://github.com/ryan-little" style="color:#e8a849;">GitHub</a></p>
            </div>
        </div>`;
}

function hideSpinner() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) {
        spinner.classList.add('hidden');
        spinner.addEventListener('transitionend', () => spinner.remove(), { once: true });
    }
}

// DOM-only versions of transitionToPage/transitionToGlobe, used when the
// Three.js scene hasn't loaded yet (e.g. a deep link on a cold cache).
function showPageNow() {
    const pageContainer = document.getElementById('page-container');
    document.getElementById('ui-overlay').classList.add('fading-out');
    pageContainer.scrollTop = 0;
    pageContainer.classList.remove('hidden');
    pageContainer.style.display = '';
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            pageContainer.classList.add('visible');
        });
    });
}

function hidePageNow() {
    const pageContainer = document.getElementById('page-container');
    document.getElementById('ui-overlay').classList.remove('fading-out');
    pageContainer.classList.remove('visible');
    pageContainer.classList.add('hidden');
    pageContainer.innerHTML = '';
}

// Router boots immediately so content pages and deep links work
// even while the 3D scene is still loading.
initRouter({
    onNavigate: async (route) => {
        renderPage(route, lastClickedSatelliteId);
        if (sceneApi) {
            await sceneApi.transitionToPage(lastClickedSatellite);
        } else {
            showPageNow();
            hideSpinner();
        }
        lastClickedSatellite = null;
        lastClickedSatelliteId = null;
    },
    onBack: async () => {
        if (sceneApi) {
            await sceneApi.transitionToGlobe();
        } else {
            hidePageNow();
        }
    },
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

async function initGlobe() {
    const container = document.getElementById('scene-container');
    if (!container) {
        console.error('Scene container not found');
        return;
    }

    const sceneBoot = await import('./scene-boot.js');

    try {
        sceneBoot.startRenderer(container);
    } catch (err) {
        console.error('WebGL init failed:', err);
        showFatalError("Your browser doesn't support WebGL, which this site requires.");
        return;
    }

    await sceneBoot.populateScene({
        // Connect satellite clicks to router
        onSatelliteClick: (pageId, satellite) => {
            if (EXTERNAL_SATELLITES[pageId]) {
                window.open(EXTERNAL_SATELLITES[pageId], '_blank', 'noopener');
                return;
            }
            lastClickedSatellite = satellite;
            lastClickedSatelliteId = pageId;
            navigateTo(pageId);
        },
    });

    sceneApi = sceneBoot;
    hideSpinner();
}

initGlobe().catch((err) => {
    console.error('Init failed:', err);
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.remove();
    showFatalError('Something went wrong loading the site. Please try refreshing.');
});

// Setup hero link handlers after DOM is ready
function setupHeroLinks() {
    // Assemble email href at runtime to avoid scraper exposure
    const emailLink = document.querySelector('[data-email-user]');
    if (emailLink) {
        const addr = emailLink.dataset.emailUser + '@' + emailLink.dataset.emailDomain;
        emailLink.href = 'mailto:' + addr;
    }

    const resumeLink = document.querySelector('[data-resume-path]');
    if (resumeLink) {
        resumeLink.style.cursor = 'pointer';
        resumeLink.addEventListener('click', (e) => {
            e.preventDefault();
            downloadResume(resumeLink.dataset.resumePath + resumeLink.dataset.resumeExt);
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupHeroLinks);
} else {
    setupHeroLinks();
}
