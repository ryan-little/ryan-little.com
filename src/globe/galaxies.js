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

    const galaxyGroup = new THREE.Group();
    scene.add(galaxyGroup);

    // Place 15-20 galaxy sprites scattered across the sky sphere
    // Use each texture 2-3 times at different positions/sizes/rotations
    const placements = [];
    const count = 18;

    if (textures.length === 0) return galaxyGroup;

    for (let i = 0; i < count; i++) {
        const texIndex = i % textures.length;

        // Try multiple random positions to find one that isn't too close to others
        let x, y, z;
        let placed = false;
        for (let attempt = 0; attempt < 10; attempt++) {
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            const r = GALAXY_SPHERE_RADIUS;

            x = r * Math.sin(phi) * Math.cos(theta);
            y = r * Math.sin(phi) * Math.sin(theta);
            z = r * Math.cos(phi);

            let tooClose = false;
            for (const p of placements) {
                const dx = x - p.x, dy = y - p.y, dz = z - p.z;
                if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 120) {
                    tooClose = true;
                    break;
                }
            }
            if (!tooClose) {
                placed = true;
                break;
            }
        }
        if (!placed) continue; // Skip if no valid position found after retries

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

        galaxyGroup.add(sprite);
    }

    // Slightly slower rotation than starfield for depth parallax
    onUpdate((delta) => {
        galaxyGroup.rotation.y += delta * 0.002;
        galaxyGroup.rotation.x += delta * 0.0006;
    });

    return galaxyGroup;
}
