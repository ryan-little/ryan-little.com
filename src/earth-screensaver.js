import { initScene, getCamera, getRenderer, onUpdate } from './globe/scene.js';
import { createEarth, refreshCloudTexture, setCloudsVisible, setAtmosphereVisible, setDayNightVisible } from './globe/earth.js';
import { createStarfield } from './globe/starfield.js';
import { createMoon, setMoonVisible } from './globe/moon.js';
import { createSun, setSunVisible } from './globe/sun.js';
import { createGraticule, setGraticuleVisible } from './globe/graticule.js';
import { createCityLabels, setCitiesVisible } from './globe/cities.js';
import { createBorders, setBordersVisible } from './globe/borders.js';
import { createLegend } from './globe/legend.js';
import { scheduleCloudRefresh } from './cloud-schedule.js';
import { CLOUD_TEXTURE_URL, CLOUD_TEXTURE_URL_HQ } from './constants.js';
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
        if (e.touches.length !== 1) return;
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
            e.preventDefault();
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            R = Math.max(R_MIN, Math.min(R_MAX, R * (lastPinchDist / dist)));
            lastPinchDist = dist;
        }
    }, { passive: false });
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

    // Use the 8192×4096 textures when the GPU can hold them; otherwise fall back
    // to 4096×2048 so mobile GPUs (often capped at 4096) don't render a blank globe.
    const hq = getRenderer().capabilities.maxTextureSize >= 8192;
    const cloudUrl = hq ? CLOUD_TEXTURE_URL_HQ : CLOUD_TEXTURE_URL;
    const dayUrl = hq ? '/textures/earth-day-8k.webp' : '/textures/earth-day.webp';
    const nightUrl = hq ? '/textures/earth-night-8k.webp' : '/textures/earth-night.webp';

    createStarfield();
    await createEarth({ cloudUrl, dayUrl, nightUrl, realTimeRotation: true, brightness: 1.18, atmosphereIntensity: 2.4 });
    createMoon();
    createSun();
    createGraticule(container, () => R);
    createCityLabels(container, () => R);
    createBorders();

    // Layer legend — toggle visibility of each scene element. Defaults below
    // are overridden by anything the visitor previously saved.
    createLegend(container, [
        { key: 'clouds',      label: 'Clouds',      enabled: true,  apply: setCloudsVisible },
        { key: 'borders',     label: 'Borders',     enabled: true,  apply: setBordersVisible },
        { key: 'cities',      label: 'City Labels', enabled: true,  apply: setCitiesVisible },
        { key: 'graticule',   label: 'Graticule',   enabled: false, apply: setGraticuleVisible },
        { key: 'daynight',    label: 'Day / Night', enabled: true,  apply: setDayNightVisible },
        { key: 'atmosphere',  label: 'Atmosphere',  enabled: true,  apply: setAtmosphereVisible },
        { key: 'sun',         label: 'Sun',         enabled: true,  apply: setSunVisible },
        { key: 'moon',        label: 'Moon',        enabled: true,  apply: setMoonVisible },
    ]);

    requestWakeLock();

    // Refresh live clouds aligned to matteason's 3-hourly cadence
    scheduleCloudRefresh(() => refreshCloudTexture(cloudUrl));

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
