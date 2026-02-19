import { initScene, getCamera, getRenderer, onUpdate } from './globe/scene.js';
import { createEarth, refreshCloudTexture } from './globe/earth.js';
import { createStarfield } from './globe/starfield.js';
import { createMoon } from './globe/moon.js';
import { createCityLabels } from './globe/cities.js';

const LIVE_CLOUD_URL = 'https://clouds.matteason.co.uk/images/4096x2048/clouds.jpg';
const DRIFT_PERIOD = 240;  // seconds per full horizontal orbit
const IDLE_TIMEOUT = 10000; // ms before auto-drift resumes after interaction

let R = 3.5;
const R_MIN = 1.5;
const R_MAX = 8.0;
const TRANSITION_DURATION = 2.0; // seconds to lerp back to drift path
let azimuth = 0;
let elevation = 0;
let driftTime = 0;
let isAutoDrift = true;
let isTransitioning = false;
let transitionTime = 0;
let resumeAzimuth = 0;
let resumeElevation = 0;
let idleTimer = null;
let isDragging = false;
let lastX = 0;
let lastY = 0;

function getDriftAzimuth(t) {
    return -t * (2 * Math.PI / DRIFT_PERIOD);
}

function getDriftElevation(t) {
    return Math.sin(t * (2 * Math.PI / 420)) * 0.30 +
           Math.sin(t * (2 * Math.PI / 170)) * 0.12;
}

function resumeDrift() {
    // Sync driftTime to current azimuth so drift path starts near here
    driftTime = -azimuth * DRIFT_PERIOD / (2 * Math.PI);
    resumeAzimuth = azimuth;
    resumeElevation = elevation;
    transitionTime = 0;
    isTransitioning = true;
    isAutoDrift = true;
}

function startInteraction() {
    isAutoDrift = false;
    clearTimeout(idleTimer);
}

function scheduleResume() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(resumeDrift, IDLE_TIMEOUT);
}

function setupControls(canvas) {
    // Mouse
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        startInteraction();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        azimuth  -= (e.clientX - lastX) * 0.006;
        elevation += (e.clientY - lastY) * 0.004;
        elevation = Math.max(-1.1, Math.min(1.1, elevation));
        lastX = e.clientX;
        lastY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;
        scheduleResume();
    });

    // Touch
    canvas.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        lastX = t.clientX;
        lastY = t.clientY;
        startInteraction();
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length !== 1) return; // two-finger pinch handled separately
        const t = e.touches[0];
        azimuth  -= (t.clientX - lastX) * 0.006;
        elevation += (t.clientY - lastY) * 0.004;
        elevation = Math.max(-1.1, Math.min(1.1, elevation));
        lastX = t.clientX;
        lastY = t.clientY;
        scheduleResume();
    }, { passive: true });

    let lastPinchDist = null;

    canvas.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) lastPinchDist = null;
        scheduleResume();
    });

    // Scroll to zoom
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        R = Math.max(R_MIN, Math.min(R_MAX, R + e.deltaY * 0.004));
    }, { passive: false });

    // Pinch to zoom
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            lastPinchDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
        }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && lastPinchDist !== null) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            R = Math.max(R_MIN, Math.min(R_MAX, R * (lastPinchDist / dist)));
            lastPinchDist = dist;
        }
    }, { passive: true });
}

async function requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try {
        await navigator.wakeLock.request('screen');
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

    getCamera().position.set(0, 0, R);

    createStarfield();
    await createEarth({ cloudUrl: LIVE_CLOUD_URL, realTimeRotation: true });
    createMoon();
    createCityLabels(container, () => R);

    requestWakeLock();

    // Refresh live clouds every 2 hours to match matteason's update cadence
    const TWO_HOURS = 2 * 60 * 60 * 1000;
    setInterval(() => refreshCloudTexture(LIVE_CLOUD_URL), TWO_HOURS);

    setupControls(getRenderer().domElement);

    onUpdate((delta) => {
        if (isAutoDrift) {
            driftTime += delta;
            const targetAz  = getDriftAzimuth(driftTime);
            const targetEl  = getDriftElevation(driftTime);

            if (isTransitioning) {
                transitionTime += delta;
                const t = Math.min(transitionTime / TRANSITION_DURATION, 1);
                // Ease-in-out cubic
                const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                azimuth   = resumeAzimuth + (targetAz - resumeAzimuth) * ease;
                elevation = resumeElevation + (targetEl - resumeElevation) * ease;
                if (t >= 1) isTransitioning = false;
            } else {
                azimuth   = targetAz;
                elevation = targetEl;
            }
        }

        const cam = getCamera();
        cam.position.x = R * Math.cos(elevation) * Math.sin(azimuth);
        cam.position.y = R * Math.sin(elevation);
        cam.position.z = R * Math.cos(elevation) * Math.cos(azimuth);
        cam.lookAt(0, 0, 0);
    });
}

init();
