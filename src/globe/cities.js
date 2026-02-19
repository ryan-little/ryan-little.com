import * as THREE from 'three';
import { getScene, getCamera, onUpdate } from './scene.js';
import { getEarth } from './earth.js';

const CITIES = [
    // ── United States ───────────────────────────────────────────
    { name: 'New York',       lat:  40.71, lon:  -74.01 },
    { name: 'Los Angeles',    lat:  34.05, lon: -118.24 },
    { name: 'Chicago',        lat:  41.88, lon:  -87.63 },
    { name: 'Houston',        lat:  29.76, lon:  -95.37 },
    { name: 'Phoenix',        lat:  33.45, lon: -112.07 },
    { name: 'Philadelphia',   lat:  39.95, lon:  -75.17 },
    { name: 'San Antonio',    lat:  29.42, lon:  -98.49 },
    { name: 'San Diego',      lat:  32.72, lon: -117.16 },
    { name: 'Dallas',         lat:  32.78, lon:  -96.80 },
    { name: 'San Jose',       lat:  37.34, lon: -121.89 },
    { name: 'Austin',         lat:  30.27, lon:  -97.74 },
    { name: 'Jacksonville',   lat:  30.33, lon:  -81.66 },
    { name: 'Fort Worth',     lat:  32.75, lon:  -97.33 },
    { name: 'Columbus',       lat:  39.96, lon:  -82.99 },
    { name: 'Charlotte',      lat:  35.23, lon:  -80.84 },
    { name: 'Indianapolis',   lat:  39.77, lon:  -86.16 },
    { name: 'San Francisco',  lat:  37.77, lon: -122.42 },
    { name: 'Seattle',        lat:  47.61, lon: -122.33 },
    { name: 'Denver',         lat:  39.74, lon: -104.98 },
    { name: 'Washington DC',  lat:  38.91, lon:  -77.04 },
    { name: 'Nashville',      lat:  36.17, lon:  -86.78 },
    { name: 'Oklahoma City',  lat:  35.47, lon:  -97.52 },
    { name: 'El Paso',        lat:  31.76, lon: -106.49 },
    { name: 'Boston',         lat:  42.36, lon:  -71.06 },
    { name: 'Memphis',        lat:  35.15, lon:  -90.05 },
    { name: 'Louisville',     lat:  38.25, lon:  -85.76 },
    { name: 'Baltimore',      lat:  39.29, lon:  -76.61 },
    { name: 'Milwaukee',      lat:  43.04, lon:  -87.91 },
    { name: 'Albuquerque',    lat:  35.08, lon: -106.65 },
    { name: 'Tucson',         lat:  32.22, lon: -110.93 },
    { name: 'Sacramento',     lat:  38.58, lon: -121.49 },
    { name: 'Kansas City',    lat:  39.10, lon:  -94.58 },
    { name: 'Atlanta',        lat:  33.75, lon:  -84.39 },
    { name: 'Raleigh',        lat:  35.79, lon:  -78.64 },
    { name: 'Minneapolis',    lat:  44.98, lon:  -93.27 },
    { name: 'New Orleans',    lat:  29.95, lon:  -90.07 },
    { name: 'Tampa',          lat:  27.95, lon:  -82.46 },
    { name: 'St. Louis',      lat:  38.63, lon:  -90.20 },
    { name: 'Pittsburgh',     lat:  40.44, lon:  -79.99 },
    { name: 'Cincinnati',     lat:  39.10, lon:  -84.51 },
    { name: 'Orlando',        lat:  28.54, lon:  -81.38 },
    { name: 'Las Vegas',      lat:  36.17, lon: -115.14 },
    { name: 'Portland',       lat:  45.52, lon: -122.68 },
    { name: 'Detroit',        lat:  42.33, lon:  -83.05 },
    { name: 'Miami',          lat:  25.77, lon:  -80.19 },
    { name: 'Salt Lake City', lat:  40.76, lon: -111.89 },
    { name: 'Honolulu',       lat:  21.31, lon: -157.86 },
    { name: 'Anchorage',      lat:  61.22, lon: -149.90 },
    // ── Rest of Americas ────────────────────────────────────────
    { name: 'Toronto',        lat:  43.70, lon:  -79.42 },
    { name: 'Vancouver',      lat:  49.25, lon: -123.12 },
    { name: 'Montreal',       lat:  45.51, lon:  -73.57 },
    { name: 'Mexico City',    lat:  19.43, lon:  -99.13 },
    { name: 'Bogotá',         lat:   4.71, lon:  -74.07 },
    { name: 'Lima',           lat: -12.05, lon:  -77.03 },
    { name: 'São Paulo',      lat: -23.55, lon:  -46.63 },
    { name: 'Rio de Janeiro', lat: -22.91, lon:  -43.17 },
    { name: 'Buenos Aires',   lat: -34.60, lon:  -58.38 },
    { name: 'Santiago',       lat: -33.45, lon:  -70.67 },
    // ── Europe ──────────────────────────────────────────────────
    { name: 'London',         lat:  51.51, lon:   -0.13 },
    { name: 'Paris',          lat:  48.85, lon:    2.35 },
    { name: 'Madrid',         lat:  40.42, lon:   -3.70 },
    { name: 'Berlin',         lat:  52.52, lon:   13.41 },
    { name: 'Rome',           lat:  41.90, lon:   12.50 },
    { name: 'Istanbul',       lat:  41.01, lon:   28.95 },
    { name: 'Moscow',         lat:  55.75, lon:   37.62 },
    { name: 'Amsterdam',      lat:  52.37, lon:    4.90 },
    { name: 'Vienna',         lat:  48.21, lon:   16.37 },
    { name: 'Warsaw',         lat:  52.23, lon:   21.01 },
    // ── Africa & Middle East ─────────────────────────────────────
    { name: 'Cairo',          lat:  30.04, lon:   31.24 },
    { name: 'Lagos',          lat:   6.52, lon:    3.38 },
    { name: 'Nairobi',        lat:  -1.29, lon:   36.82 },
    { name: 'Johannesburg',   lat: -26.20, lon:   28.04 },
    { name: 'Addis Ababa',    lat:   9.02, lon:   38.75 },
    { name: 'Kinshasa',       lat:  -4.32, lon:   15.32 },
    { name: 'Casablanca',     lat:  33.59, lon:   -7.62 },
    { name: 'Riyadh',         lat:  24.69, lon:   46.72 },
    { name: 'Dubai',          lat:  25.20, lon:   55.27 },
    { name: 'Baghdad',        lat:  33.34, lon:   44.40 },
    { name: 'Tehran',         lat:  35.69, lon:   51.42 },
    { name: 'Karachi',        lat:  24.86, lon:   67.01 },
    // ── Asia ─────────────────────────────────────────────────────
    { name: 'Tokyo',          lat:  35.69, lon:  139.69 },
    { name: 'Seoul',          lat:  37.57, lon:  126.98 },
    { name: 'Beijing',        lat:  39.91, lon:  116.39 },
    { name: 'Shanghai',       lat:  31.22, lon:  121.47 },
    { name: 'Delhi',          lat:  28.65, lon:   77.22 },
    { name: 'Mumbai',         lat:  19.08, lon:   72.88 },
    { name: 'Dhaka',          lat:  23.72, lon:   90.41 },
    { name: 'Bangkok',        lat:  13.75, lon:  100.52 },
    { name: 'Singapore',      lat:   1.36, lon:  103.82 },
    { name: 'Jakarta',        lat:  -6.21, lon:  106.85 },
    { name: 'Osaka',          lat:  34.69, lon:  135.50 },
    { name: 'Manila',         lat:  14.60, lon:  120.98 },
    { name: 'Kuala Lumpur',   lat:   3.14, lon:  101.69 },
    { name: 'Lahore',         lat:  31.55, lon:   74.34 },
    { name: 'Bangalore',      lat:  12.97, lon:   77.59 },
    { name: 'Kolkata',        lat:  22.57, lon:   88.36 },
    { name: 'Ho Chi Minh',    lat:  10.82, lon:  106.63 },
    { name: 'Yangon',         lat:  16.87, lon:   96.13 },
    { name: 'Kabul',          lat:  34.53, lon:   69.17 },
    // ── Oceania ──────────────────────────────────────────────────
    { name: 'Sydney',         lat: -33.87, lon:  151.21 },
    { name: 'Melbourne',      lat: -37.81, lon:  144.96 },
];

// Convert geographic coords to Earth mesh local-space unit vector.
// Convention: PM (0°E) at +X, 90°E at -Z  (matches earth.js shader).
function latLonToLocal(lat, lon) {
    const phi   = Math.PI + lon * Math.PI / 180;
    const theta = Math.PI / 2 - lat * Math.PI / 180;
    return new THREE.Vector3(
        -Math.cos(phi) * Math.sin(theta),
         Math.cos(theta),
         Math.sin(phi) * Math.sin(theta)
    );
}

// Labels fade in when camera is closer than this radius
const LABEL_SHOW_R  = 3.0;
const LABEL_FULL_R  = 2.3;

export function createCityLabels(container, getR) {
    const scene = getScene();

    // ── 3D dot markers (always present, rotate with Earth) ──────
    const positions = new Float32Array(CITIES.length * 3);
    CITIES.forEach((city, i) => {
        const v = latLonToLocal(city.lat, city.lon);
        positions[i * 3]     = v.x;
        positions[i * 3 + 1] = v.y;
        positions[i * 3 + 2] = v.z;
    });

    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const dotMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.009,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
    });

    const dots = new THREE.Points(dotGeo, dotMat);
    scene.add(dots);

    // ── HTML labels ──────────────────────────────────────────────
    const entries = CITIES.map((city, i) => {
        const el = document.createElement('div');
        el.className = 'city-label';
        el.textContent = city.name;
        container.appendChild(el);
        return { el, localPos: latLonToLocal(city.lat, city.lon) };
    });

    const worldPos = new THREE.Vector3();

    onUpdate(() => {
        const earth = getEarth();
        if (!earth) return;

        const r       = getR();
        const camera  = getCamera();
        const w       = container.clientWidth;
        const h       = container.clientHeight;
        const ry      = earth.rotation.y;
        const cosRY   = Math.cos(ry);
        const sinRY   = Math.sin(ry);
        const camDir  = camera.position.clone().normalize();

        // Dots rotate with Earth
        dots.rotation.y = ry;

        // Label opacity based on zoom
        const labelAlpha = Math.max(0, Math.min(1,
            (LABEL_SHOW_R - r) / (LABEL_SHOW_R - LABEL_FULL_R)
        ));

        for (const { el, localPos } of entries) {
            if (labelAlpha <= 0) {
                el.style.display = 'none';
                continue;
            }

            // Rotate local position by Earth's current Y rotation
            worldPos.set(
                localPos.x * cosRY + localPos.z * sinRY,
                localPos.y,
               -localPos.x * sinRY + localPos.z * cosRY
            );

            // Hide if on the far side of the globe
            if (worldPos.dot(camDir) < 0.15) {
                el.style.display = 'none';
                continue;
            }

            const ndc = worldPos.clone().project(camera);
            el.style.display  = 'block';
            el.style.opacity  = labelAlpha;
            el.style.left     = ((ndc.x + 1) / 2 * w) + 'px';
            el.style.top      = ((-ndc.y + 1) / 2 * h) + 'px';
        }
    });
}
