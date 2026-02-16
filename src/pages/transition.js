import { animateSatelliteExit, fadeInSatellites } from '../globe/satellites.js';

const TRANSITION_DURATION = 400;

// Measure where .page-satellite will appear by briefly showing the page invisibly
function measureSatelliteTarget(pageContainer) {
    // Temporarily make the container visible but invisible to the user
    pageContainer.classList.remove('hidden');
    pageContainer.style.display = '';
    pageContainer.style.opacity = '0';
    pageContainer.style.pointerEvents = 'none';

    const satImg = pageContainer.querySelector('.page-satellite');
    let targetRect = null;
    if (satImg) {
        const rect = satImg.getBoundingClientRect();
        // If image hasn't loaded yet, height may be 0 — estimate from CSS width
        const isMobile = window.innerWidth <= 600;
        const cssWidth = isMobile ? 140 : 200;
        const height = rect.height > 0 ? rect.height : cssWidth; // satellite images are ~square
        targetRect = {
            left: rect.left,
            top: rect.top,
            width: rect.width || cssWidth,
            height: height,
        };
    }

    // Hide it again
    pageContainer.style.opacity = '';
    pageContainer.style.pointerEvents = '';
    pageContainer.classList.add('hidden');
    pageContainer.style.display = 'none';

    return targetRect;
}

export function transitionToPage(satellite) {
    return new Promise(async (resolve) => {
        const pageContainer = document.getElementById('page-container');
        const uiOverlay = document.getElementById('ui-overlay');

        // Mark page-satellite to skip its CSS fade-in BEFORE measuring,
        // so getBoundingClientRect returns the un-animated (final) layout rect.
        // The satelliteFadeIn animation uses scale(0.8) which would skew measurements.
        if (satellite) {
            const satImg = pageContainer.querySelector('.page-satellite');
            if (satImg) satImg.classList.add('transition-placed');
        }

        // Measure where the static .page-satellite image will appear
        const targetRect = satellite ? measureSatelliteTarget(pageContainer) : null;

        // Fade out globe UI
        uiOverlay.classList.add('fading-out');

        // Start showing the page partway through the exit animation so the static
        // satellite image crossfades with the animated sprite (no visual gap).
        // The sprite fades out in its last 20% (0.56-0.7s), so we start the page
        // fade-in at ~0.45s, giving a smooth overlap.
        if (satellite) {
            const PAGE_SHOW_DELAY = 450; // ms — start page fade-in before sprite finishes
            setTimeout(() => {
                pageContainer.classList.remove('hidden');
                pageContainer.style.display = '';
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        pageContainer.classList.add('visible');
                    });
                });
            }, PAGE_SHOW_DELAY);
        }

        // Animate satellites: clicked one scales up + moves to target,
        // others do reverse stagger fade-out
        await animateSatelliteExit(satellite, targetRect);

        // For URL navigation (no satellite), show page immediately after exit
        if (!satellite) {
            pageContainer.classList.remove('hidden');
            pageContainer.style.display = '';
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    pageContainer.classList.add('visible');
                });
            });
        }

        setTimeout(resolve, TRANSITION_DURATION);
    });
}

export function transitionToGlobe() {
    return new Promise(async (resolve) => {
        const pageContainer = document.getElementById('page-container');
        const uiOverlay = document.getElementById('ui-overlay');

        // Measure page-satellite position before hiding the page
        let sourceRect = null;
        const satImg = pageContainer.querySelector('.page-satellite');
        if (satImg) {
            const rect = satImg.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                sourceRect = {
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height,
                };
            }
        }

        // Fade out page
        pageContainer.classList.remove('visible');

        // Fade satellites back in — returning satellite reverse-animates from page position
        fadeInSatellites(sourceRect);

        // Fade in globe UI
        uiOverlay.classList.remove('fading-out');

        setTimeout(() => {
            pageContainer.classList.add('hidden');
            pageContainer.innerHTML = '';
            resolve();
        }, TRANSITION_DURATION);
    });
}
