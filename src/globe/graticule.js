import * as THREE from 'three';
import { getScene, getCamera, onUpdate } from './scene.js';
import { getEarth } from './earth.js';

const R = 1.002;       // just above the Earth surface (radius 1)
const R_LABEL = 1.01;  // labels float slightly higher so they clear the lines
const GRID_STEP = 15;  // degrees between standard graticule lines
const SAMPLE = 2;      // degrees between sampled points along a line

// Named circles of latitude (the "actual" ones an atlas labels).
const TROPIC = 23.4365;       // Tropic of Cancer / Capricorn
const POLAR_CIRCLE = 66.5635; // Arctic / Antarctic circle

const LATITUDE_LABELS = [
    { lat: 0,             text: 'Equator',             cls: 'eq' },
    { lat: 30,            text: '30°N',                cls: 'lat' },
    { lat: -30,           text: '30°S',                cls: 'lat' },
    { lat: 60,            text: '60°N',                cls: 'lat' },
    { lat: -60,           text: '60°S',                cls: 'lat' },
    { lat: TROPIC,        text: 'Tropic of Cancer',    cls: 'named' },
    { lat: -TROPIC,       text: 'Tropic of Capricorn', cls: 'named' },
    { lat: POLAR_CIRCLE,  text: 'Arctic Circle',       cls: 'named' },
    { lat: -POLAR_CIRCLE, text: 'Antarctic Circle',    cls: 'named' },
];

let graticuleGroup = null;
let graticuleVisible = false;
let latLabels = [];
let lonLabels = [];

// Same convention as cities.js / earth.js: PM (0°E) at +X, 90°E at -Z.
function latLonToLocal(lat, lon, radius) {
    const phi = Math.PI + (lon * Math.PI) / 180;
    const theta = Math.PI / 2 - (lat * Math.PI) / 180;
    return new THREE.Vector3(
        -Math.cos(phi) * Math.sin(theta),
        Math.cos(theta),
        Math.sin(phi) * Math.sin(theta)
    ).multiplyScalar(radius);
}

function parallel(lat, material, group) {
    const pts = [];
    for (let lon = -180; lon <= 180; lon += SAMPLE) pts.push(latLonToLocal(lat, lon, R));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), material));
}

function meridian(lon, material, group) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += SAMPLE) pts.push(latLonToLocal(lat, lon, R));
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), material));
}

function lonText(lon) {
    if (lon === 0) return '0°';
    if (lon === 180 || lon === -180) return '180°';
    return lon > 0 ? `${lon}°E` : `${-lon}°W`;
}

export function setGraticuleVisible(visible) {
    graticuleVisible = visible;
    if (graticuleGroup) graticuleGroup.visible = visible;
    if (!visible) {
        for (const { el } of [...latLabels, ...lonLabels]) el.style.display = 'none';
    }
}

export function createGraticule(container, getR) {
    const scene = getScene();
    graticuleGroup = new THREE.Group();

    const gridMat = new THREE.LineBasicMaterial({
        color: 0x6ab0e0, transparent: true, opacity: 0.28, depthWrite: false,
    });
    const equatorMat = new THREE.LineBasicMaterial({
        color: 0x8fd4ff, transparent: true, opacity: 0.6, depthWrite: false,
    });
    const primeMat = new THREE.LineBasicMaterial({
        color: 0x8fd4ff, transparent: true, opacity: 0.5, depthWrite: false,
    });
    // Tropics & polar circles in a warm tint so they read as distinct named lines.
    const namedMat = new THREE.LineBasicMaterial({
        color: 0xe6b170, transparent: true, opacity: 0.5, depthWrite: false,
    });

    // Standard parallels every 15° (equator highlighted), skipping the poles.
    for (let lat = -75; lat <= 75; lat += GRID_STEP) {
        parallel(lat, lat === 0 ? equatorMat : gridMat, graticuleGroup);
    }
    // Named circles of latitude.
    for (const lat of [TROPIC, -TROPIC, POLAR_CIRCLE, -POLAR_CIRCLE]) {
        parallel(lat, namedMat, graticuleGroup);
    }
    // Meridians every 15° (prime meridian + antimeridian highlighted).
    for (let lon = -180; lon < 180; lon += GRID_STEP) {
        meridian(lon, (lon === 0 || lon === 180 || lon === -180) ? primeMat : gridMat, graticuleGroup);
    }

    graticuleGroup.visible = false; // off by default; legend turns it on
    scene.add(graticuleGroup);

    // ── HTML labels ──────────────────────────────────────────────
    function makeLabel(text, cls) {
        const el = document.createElement('div');
        el.className = 'graticule-label' + (cls ? ' ' + cls : '');
        el.textContent = text;
        el.style.display = 'none';
        container.appendChild(el);
        return el;
    }
    latLabels = LATITUDE_LABELS.map(({ lat, text, cls }) => ({ el: makeLabel(text, cls), lat }));
    lonLabels = [];
    for (let lon = -180; lon < 180; lon += 30) {
        lonLabels.push({ el: makeLabel(lonText(lon), 'lon'), localPos: latLonToLocal(0, lon, R_LABEL) });
    }

    const camXZ    = new THREE.Vector3();
    const worldPos = new THREE.Vector3();
    const camDir   = new THREE.Vector3();
    const ndc      = new THREE.Vector3();

    onUpdate(() => {
        const earth = getEarth();
        if (!earth) return;
        graticuleGroup.rotation.y = earth.rotation.y;
        if (!graticuleVisible) return;

        const camera = getCamera();
        const w = container.clientWidth;
        const h = container.clientHeight;
        const r = getR();
        const ry = earth.rotation.y;
        const cosRY = Math.cos(ry);
        const sinRY = Math.sin(ry);
        camDir.copy(camera.position).normalize();

        // Latitude labels: place at the camera-facing longitude on each circle.
        // Still horizon-cull so labels for latitudes on the far side (e.g. the
        // opposite pole when the globe is tilted) are hidden by the Earth.
        camXZ.set(camera.position.x, 0, camera.position.z).normalize();
        for (const { el, lat } of latLabels) {
            const latRad = (lat * Math.PI) / 180;
            const cosLat = Math.cos(latRad);
            worldPos.set(camXZ.x * cosLat, Math.sin(latRad), camXZ.z * cosLat).multiplyScalar(R_LABEL);
            if (worldPos.dot(camDir) < 1 / r) {
                el.style.display = 'none';
                continue;
            }
            ndc.copy(worldPos).project(camera);
            el.style.display = 'block';
            el.style.left = ((ndc.x + 1) / 2 * w) + 'px';
            el.style.top  = ((-ndc.y + 1) / 2 * h) + 'px';
        }

        // Longitude labels: ride the equator, rotate with Earth, hide behind horizon.
        for (const { el, localPos } of lonLabels) {
            worldPos.set(
                localPos.x * cosRY + localPos.z * sinRY,
                localPos.y,
               -localPos.x * sinRY + localPos.z * cosRY
            );
            if (worldPos.dot(camDir) < 1 / r) {
                el.style.display = 'none';
                continue;
            }
            ndc.copy(worldPos).project(camera);
            el.style.display = 'block';
            el.style.left = ((ndc.x + 1) / 2 * w) + 'px';
            el.style.top  = ((-ndc.y + 1) / 2 * h) + 'px';
        }
    });

    return graticuleGroup;
}
