import * as THREE from 'three';
import { getScene, onUpdate } from './scene.js';
import { getSunDirection } from './lighting.js';
import { getEarth } from './earth.js';

// Known new moon: Jan 6, 2000 18:14 UTC → 5.76 days after J2000.0 (Jan 1.5 2000)
const NEW_MOON_J2000 = 5.254;
const SYNODIC_PERIOD = 29.53059; // days
const MOON_DISTANCE = 50;
const MOON_RADIUS = 0.75;

function getMoonPhase() {
    const d = (Date.now() - Date.UTC(2000, 0, 1, 12)) / 86400000;
    return (((d - NEW_MOON_J2000) % SYNODIC_PERIOD) / SYNODIC_PERIOD) * 2 * Math.PI;
}

export function createMoon() {
    const scene = getScene();

    const geometry = new THREE.SphereGeometry(MOON_RADIUS, 32, 32);
    const material = new THREE.MeshPhongMaterial({
        color: 0xc8c8c0,
        shininess: 3,
    });
    const moonMesh = new THREE.Mesh(geometry, material);
    scene.add(moonMesh);

    // Directional light from the sun — only affects Phong/Lambert materials (i.e. the moon)
    const sunLight = new THREE.DirectionalLight(0xfff8f0, 1.3);
    scene.add(sunLight);

    // Faint earthshine so the dark side isn't completely black
    const earthshine = new THREE.AmbientLight(0x111210, 1.0);
    scene.add(earthshine);

    // Ecliptic pole: Z-axis — sun lives in XY plane (solar-time world space), so ecliptic pole = Z
    const eclipticPole = new THREE.Vector3(0, 0, 1);
    const sunWorld = new THREE.Vector3();
    const moonDir = new THREE.Vector3();

    onUpdate(() => {
        const earth = getEarth();
        if (!earth) return;

        // Sun direction: object-space → world-space (rotate by Earth's current rotation.y)
        const s = getSunDirection();
        const ry = earth.rotation.y;
        sunWorld.set(
            s.x * Math.cos(ry) + s.z * Math.sin(ry),
            s.y,
            -s.x * Math.sin(ry) + s.z * Math.cos(ry)
        );

        // Directional light at sun position
        sunLight.position.set(sunWorld.x * 200, sunWorld.y * 200, sunWorld.z * 200);

        // Moon direction: rotate sun direction by phase angle around ecliptic pole
        // phase=0 → new moon (near sun), phase=π → full moon (opposite sun)
        const phase = getMoonPhase();
        moonDir.copy(sunWorld).applyAxisAngle(eclipticPole, phase);
        moonMesh.position.copy(moonDir).multiplyScalar(MOON_DISTANCE);
    });

    return moonMesh;
}
