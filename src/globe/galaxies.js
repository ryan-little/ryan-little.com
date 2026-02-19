import * as THREE from 'three';
import { getScene, onUpdate } from './scene.js';

const GALAXY_COUNT = 26;
const GALAXY_SPHERE_RADIUS = 400; // In front of stars (500) but far behind Earth (~1.0)
const GALAXY_TEXTURES = Array.from({ length: GALAXY_COUNT }, (_, i) => `/galaxies/galaxy${i + 1}.webp`);

export async function createGalaxies() {
    const scene = getScene();
    const loader = new THREE.TextureLoader();

    // Load all textures — use allSettled so a missing file doesn't crash the whole site
    const results = await Promise.allSettled(
        GALAXY_TEXTURES.map(path => loader.loadAsync(path))
    );
    const textures = results
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value);

    const sprites = [];

    // Place 15-20 galaxy sprites scattered across the sky sphere
    // Use each texture 2-3 times at different positions/sizes/rotations
    const placements = [];
    const count = 18;

    if (textures.length === 0) return sprites;

    for (let i = 0; i < count; i++) {
        const texIndex = i % textures.length;

        // Random position on sphere using uniform distribution
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = GALAXY_SPHERE_RADIUS;

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        // Check minimum distance from other placements to avoid clustering
        let tooClose = false;
        for (const p of placements) {
            const dx = x - p.x, dy = y - p.y, dz = z - p.z;
            if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 120) {
                tooClose = true;
                break;
            }
        }
        if (tooClose) {
            // Skip this one, try to place fewer rather than cluster
            continue;
        }

        placements.push({ x, y, z });

        const tex = textures[texIndex];
        const aspect = tex.image.width / tex.image.height;

        const material = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            opacity: 1.0,
            depthTest: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        const sprite = new THREE.Sprite(material);
        sprite.position.set(x, y, z);

        // Random size: 10-50 world units for more variety
        const baseSize = 10 + Math.random() * 40;
        sprite.scale.set(baseSize * aspect, baseSize, 1);

        // Random rotation
        sprite.material.rotation = Math.random() * Math.PI * 2;

        // Render order: above stars (default 0) but below Earth and satellites
        sprite.renderOrder = 1;

        scene.add(sprite);
        sprites.push(sprite);
    }

    // Slow drift matching starfield rotation
    onUpdate((delta) => {
        for (const sprite of sprites) {
            // Rotate position around Y axis matching star drift
            const x = sprite.position.x;
            const z = sprite.position.z;
            const angle = delta * 0.003;
            sprite.position.x = x * Math.cos(angle) - z * Math.sin(angle);
            sprite.position.z = x * Math.sin(angle) + z * Math.cos(angle);

            // Tiny X rotation drift
            const y = sprite.position.y;
            const z2 = sprite.position.z;
            const angle2 = delta * 0.001;
            sprite.position.y = y * Math.cos(angle2) - z2 * Math.sin(angle2);
            sprite.position.z = y * Math.sin(angle2) + z2 * Math.cos(angle2);
        }
    });

    return sprites;
}
