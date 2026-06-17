import * as THREE from 'three';
import { getScene, getCamera, onUpdate } from './scene.js';
import { getSunDirection } from './lighting.js';
import { getEarth, getEarthRadius } from './earth.js';

// Closer than the starfield (500) / galaxies (400) so the sun reads as being
// in front of them, but far beyond Earth's surface so Earth occludes it when
// the sun is on the night side.
const SUN_DISTANCE = 300;
const CORE_SIZE = 20;  // bright disc
const HALO_SIZE = 95;  // soft additive glow around it

let sunGroup = null;

// Radial-gradient sprite texture, generated once on a canvas (no asset needed).
function makeGlowTexture(inner) {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0.0, 'rgba(255, 252, 245, 1)');
    g.addColorStop(inner, 'rgba(255, 240, 210, 0.55)');
    g.addColorStop(0.5, 'rgba(255, 215, 150, 0.18)');
    g.addColorStop(1.0, 'rgba(255, 200, 120, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
}

export function setSunVisible(visible) {
    if (sunGroup) sunGroup.visible = visible;
}

export function createSun() {
    const scene = getScene();
    sunGroup = new THREE.Group();

    const coreMat = new THREE.SpriteMaterial({
        map: makeGlowTexture(0.22),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: true,         // let the opaque Earth occlude the sun when behind it
        transparent: true,
    });
    const core = new THREE.Sprite(coreMat);
    core.scale.set(CORE_SIZE, CORE_SIZE, 1);
    sunGroup.add(core);

    const haloMat = new THREE.SpriteMaterial({
        map: makeGlowTexture(0.08),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        transparent: true,
        opacity: 0.7,
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(HALO_SIZE, HALO_SIZE, 1);
    sunGroup.add(halo);

    scene.add(sunGroup);

    const sunWorld = new THREE.Vector3();
    const toSun = new THREE.Vector3();
    onUpdate(() => {
        const earth = getEarth();
        if (!earth) return;
        // Sun direction object-space → world-space (rotate by Earth's rotation.y),
        // matching earth.js / moon.js so the sun lines up with the terminator.
        const s = getSunDirection();
        const ry = earth.rotation.y;
        sunWorld.set(
            s.x * Math.cos(ry) + s.z * Math.sin(ry),
            s.y,
            -s.x * Math.sin(ry) + s.z * Math.cos(ry)
        );
        sunGroup.position.copy(sunWorld).multiplyScalar(SUN_DISTANCE);

        // Occlusion: fade the sun out when the Earth sits between camera and sun.
        // The additive halo is large, so depth-testing alone leaves it bleeding
        // around the limb — instead ray-test camera→sun against the Earth sphere.
        const cam = getCamera();
        toSun.copy(sunGroup.position).sub(cam.position);
        const distToSun = toSun.length();
        toSun.divideScalar(distToSun); // normalize
        const tca = -cam.position.dot(toSun); // closest-approach param (Earth at origin)
        let vis = 1;
        if (tca > 0 && tca < distToSun) {
            const perp = Math.sqrt(Math.max(cam.position.lengthSq() - tca * tca, 0));
            const r = getEarthRadius();
            // 1 = clear of the limb, 0 = behind the disc, soft edge across the limb
            vis = THREE.MathUtils.smoothstep(perp, r * 0.97, r * 1.13);
        }
        coreMat.opacity = vis;
        haloMat.opacity = 0.7 * vis;
    });

    return sunGroup;
}
