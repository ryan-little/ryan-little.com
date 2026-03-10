import * as THREE from 'three';
import { getScene, getCamera, onUpdate } from './scene.js';
import { getEarthRadius } from './earth.js';
import { MOBILE_BREAKPOINT_3D } from '../constants.js';

const ORBIT_SPEED = 0.25; // Same speed for all - prevents grouping

const SATELLITE_CONFIG = [
    { id: 'about', label: 'About', texture: '/satellites/satellite1.webp', orbitRadius: 2.1, orbitTilt: 0.2, phase: 0 },
    { id: 'portfolio', label: 'Portfolio', texture: '/satellites/satellite2.webp', orbitRadius: 2.3, orbitTilt: -0.15, phase: (2 * Math.PI) / 5 },
    { id: 'trees', label: 'Trees', texture: '/satellites/satellite3.webp', orbitRadius: 2.5, orbitTilt: 0.1, phase: (4 * Math.PI) / 5 },
    { id: 'adventures', label: 'Adventures', texture: '/satellites/satellite4.webp', orbitRadius: 2.2, orbitTilt: -0.25, phase: (6 * Math.PI) / 5 },
    { id: 'blog', label: 'Blog', texture: '/satellites/satellite5.webp', orbitRadius: 2.4, orbitTilt: 0.18, phase: (8 * Math.PI) / 5 },
];

const MAX_CONFIGURED_RADIUS = Math.max(...SATELLITE_CONFIG.map(c => c.orbitRadius));

export const satellites = [];
export const labelElements = [];
export const glowSprites = [];
const textureLoader = new THREE.TextureLoader();

// Shared mutable state for cross-module access
export const satState = {
    isPaused: false,
    isHoverPaused: false,
    hoveredSatellite: null,
    exitTransition: null,
    entranceTransition: null,
    entranceStartTime: null,
    initialFadeComplete: false,
    lastExitedIndex: -1,
    returnedIndex: -1,
    onClickCallback: null,
};

export function pauseSatellites() {
    satState.isPaused = true;
}

export function resumeSatellites() {
    satState.isPaused = false;
}

export async function createSatellites() {
    const scene = getScene();

    // Create label container
    let labelContainer = document.getElementById('satellite-labels');
    if (!labelContainer) {
        labelContainer = document.createElement('div');
        labelContainer.id = 'satellite-labels';
        document.body.appendChild(labelContainer);
    }

    // Load all satellite textures in parallel
    const textures = await Promise.all(
        SATELLITE_CONFIG.map(config => new Promise((resolve) => {
            textureLoader.load(config.texture, resolve, undefined, () => {
                resolve(createPlaceholderTexture());
            });
        }))
    );

    // Create sprites using loaded textures
    const glowTexture = createWhiteOrbGlow(); // single shared glow texture

    for (let i = 0; i < SATELLITE_CONFIG.length; i++) {
        const config = SATELLITE_CONFIG[i];
        const texture = textures[i];
        texture.colorSpace = THREE.SRGBColorSpace;

        const aspect = texture.image ? (texture.image.width / texture.image.height) : 1;

        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            opacity: 0, // Start invisible for fade-in
            color: new THREE.Color(1, 1, 1),
        });
        const sprite = new THREE.Sprite(material);
        sprite.renderOrder = 100; // Ensure satellites render on top of stars
        const isMobile = window.innerWidth < MOBILE_BREAKPOINT_3D;
        const size = isMobile ? 0.15 : 0.2;
        sprite.scale.set(size * aspect, size, 1);

        // Staggered fade-in timing
        const fadeDelay = satellites.length * 0.3; // 0s, 0.3s, 0.6s, 0.9s
        const fadeDuration = 0.8;
        sprite.userData = {
            ...config,
            angle: config.phase,
            baseSize: size,
            aspect,
            fadeDelay,
            fadeDuration,
            fadeStartTime: null,
        };

        scene.add(sprite);
        satellites.push(sprite);

        // Create white orb glow effect (shared texture)
        const glowMaterial = new THREE.SpriteMaterial({
            map: glowTexture,
            transparent: true,
            opacity: 0,
            depthTest: false,
            blending: THREE.AdditiveBlending,
        });
        const glowSprite = new THREE.Sprite(glowMaterial);
        const glowScale = size * 3.0; // Large white orb
        glowSprite.scale.set(glowScale, glowScale, 1);
        glowSprite.renderOrder = 99; // Just behind satellite (which is 100)
        scene.add(glowSprite);
        glowSprites.push(glowSprite);

        // HTML label (positioned via projection, not CSS2DRenderer)
        const labelDiv = document.createElement('div');
        labelDiv.className = 'satellite-label';
        labelDiv.textContent = config.label;
        labelDiv.addEventListener('click', () => {
            if (satState.onClickCallback) satState.onClickCallback(config.id, sprite);
        });
        labelContainer.appendChild(labelDiv);
        labelElements.push(labelDiv);
    }

    const camera = getCamera();
    const _projected = new THREE.Vector3();

    // Ray-sphere intersection: is the Earth between camera and satellite?
    function isOccluded(satPos) {
        const R = getEarthRadius();
        const cx = camera.position.x, cy = camera.position.y, cz = camera.position.z;
        const dx = satPos.x - cx, dy = satPos.y - cy, dz = satPos.z - cz;
        const a = dx * dx + dy * dy + dz * dz;
        const b = 2 * (cx * dx + cy * dy + cz * dz);
        const c = cx * cx + cy * cy + cz * cz - R * R;
        const disc = b * b - 4 * a * c;
        if (disc < 0) return false;
        const t = (-b - Math.sqrt(disc)) / (2 * a);
        return t > 0 && t < 1;
    }

    function projectLabel(sat, label) {
        _projected.copy(sat.position);
        _projected.y -= 0.22;
        _projected.project(camera);
        if (_projected.z > 1) {
            label.style.display = 'none';
        } else {
            label.style.display = '';
            const x = (_projected.x * 0.5 + 0.5) * window.innerWidth;
            const y = (-_projected.y * 0.5 + 0.5) * window.innerHeight;
            label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        }
    }

    const startTime = performance.now();

    onUpdate((delta) => {
        const now = performance.now();
        const elapsed = (now - startTime) / 1000;

        // ── Exit transition: clicked satellite scales up + moves to page image position,
        //    others do reverse stagger fade-out, labels hidden ──
        if (satState.exitTransition) {
            const exitElapsed = (now - satState.exitTransition.startTime) / 1000;
            const clickedIdx = satState.exitTransition.clickedIndex;
            let allOthersDone = true;

            // Fade out non-clicked satellites in reverse order
            let staggerCount = 0;
            for (let i = satellites.length - 1; i >= 0; i--) {
                if (i === clickedIdx) continue;
                const sat = satellites[i];
                const label = labelElements[i];
                const glow = glowSprites[i];

                const fadeStart = staggerCount * 0.12;
                const fadeProgress = Math.max(0, Math.min((exitElapsed - fadeStart) / 0.35, 1));
                const opacity = satState.exitTransition.opacities[i] * (1 - fadeProgress);

                sat.material.opacity = opacity;
                sat.visible = opacity > 0.01;
                glow.material.opacity = 0;
                glow.visible = false;
                label.style.opacity = String(1 - fadeProgress);
                if (fadeProgress >= 1) label.style.display = 'none';

                if (fadeProgress < 1) allOthersDone = false;
                staggerCount++;
            }

            // Animate clicked satellite: move to target + scale up
            const clickedSat = satellites[clickedIdx];
            const clickedLabel = labelElements[clickedIdx];
            const clickedGlow = glowSprites[clickedIdx];

            // Hide label immediately during transition
            clickedLabel.style.display = 'none';
            clickedGlow.material.opacity = 0;
            clickedGlow.visible = false;

            const moveDuration = 0.7;
            const moveProgress = Math.min(exitElapsed / moveDuration, 1);
            const moveEased = 1 - Math.pow(1 - moveProgress, 3); // ease out cubic

            const sp = satState.exitTransition.startPos;
            const tp = satState.exitTransition.targetPos;
            const startSize = satState.exitTransition.startSize;
            const targetSize = satState.exitTransition.targetSize;
            const aspect = clickedSat.userData.aspect || 1;

            // Lerp position
            clickedSat.position.x = sp.x + (tp.x - sp.x) * moveEased;
            clickedSat.position.y = sp.y + (tp.y - sp.y) * moveEased;
            clickedSat.position.z = sp.z + (tp.z - sp.z) * moveEased;

            // Scale up
            const currentSize = startSize + (targetSize - startSize) * moveEased;
            clickedSat.scale.set(currentSize * aspect, currentSize, 1);

            // Rotate back to upright (0) to match static page image
            clickedSat.material.rotation = satState.exitTransition.startRotation * (1 - moveEased);

            // Fade out in last 20% of the move
            if (moveProgress >= 0.8) {
                const fadeProgress = (moveProgress - 0.8) / 0.2;
                clickedSat.material.opacity = satState.exitTransition.opacities[clickedIdx] * (1 - fadeProgress);
            }

            const clickedDone = moveProgress >= 1;

            if (allOthersDone && clickedDone) {
                // Hide all and restore scale
                for (let i = 0; i < satellites.length; i++) {
                    satellites[i].visible = false;
                    glowSprites[i].visible = false;
                    labelElements[i].style.display = 'none';
                    // Restore original scale for when satellites re-enter
                    const d = satellites[i].userData;
                    satellites[i].scale.set(d.baseSize * d.aspect, d.baseSize, 1);
                }
                satState.isPaused = true;
                const onComplete = satState.exitTransition.onComplete;
                satState.exitTransition = null;
                onComplete();
            }
            return; // Skip normal update during exit
        }

        // Calculate visible world dimensions at z=0 based on camera frustum
        const vFov = camera.fov * Math.PI / 180;
        const dist = camera.position.z;
        const visibleHeight = 2 * Math.tan(vFov / 2) * dist;
        const visibleWidth = visibleHeight * camera.aspect;

        // Max orbit radius at ~75-80% of visible area
        const maxRadius = Math.min(visibleWidth, visibleHeight) * 0.38;

        // Scale all orbits proportionally so largest fits within maxRadius
        const orbitScale = maxRadius / MAX_CONFIGURED_RADIUS;

        // ── Entrance transition: returning satellite spins from page position back to orbit ──
        if (satState.entranceTransition) {
            const entElapsed = (now - satState.entranceTransition.startTime) / 1000;
            const idx = satState.entranceTransition.clickedIndex;
            const sat = satellites[idx];
            const d = sat.userData;

            const moveDuration = 0.7;
            const moveProgress = Math.min(entElapsed / moveDuration, 1);
            const moveEased = 1 - Math.pow(1 - moveProgress, 3); // ease out cubic

            // Compute current orbit target position
            const radius = d.orbitRadius * orbitScale;
            const targetX = Math.cos(d.angle) * radius;
            const targetY = Math.sin(d.angle) * radius;
            const targetZ = Math.sin(d.angle) * d.orbitTilt * 0.5;

            // Lerp from page position to orbit position
            const sp = satState.entranceTransition.startPos;
            sat.position.x = sp.x + (targetX - sp.x) * moveEased;
            sat.position.y = sp.y + (targetY - sp.y) * moveEased;
            sat.position.z = sp.z + (targetZ - sp.z) * moveEased;

            // Scale down from page size to orbit size
            const startSize = satState.entranceTransition.startSize;
            const currentSize = startSize + (d.baseSize - startSize) * moveEased;
            sat.scale.set(currentSize * d.aspect, currentSize, 1);

            // Rotate from upright (0) to orbit rotation
            const targetRotation = d.angle + Math.PI;
            sat.material.rotation = targetRotation * moveEased;

            // Fade in during first 20%
            if (moveProgress < 0.2) {
                sat.material.opacity = moveProgress / 0.2;
            } else {
                sat.material.opacity = 1;
            }

            sat.visible = true;
            labelElements[idx].style.display = 'none';
            glowSprites[idx].visible = false;

            if (moveProgress >= 1) {
                // Reverse animation done — let normal loop keep it visible via returnedIndex
                satState.returnedIndex = idx;
                sat.material.opacity = 1;

                // Now fade in the other satellites
                satState.entranceStartTime = performance.now();
                for (let i = 0; i < satellites.length; i++) {
                    if (i === idx) continue;
                    satellites[i].visible = true;
                    satellites[i].material.opacity = 0;
                    labelElements[i].style.display = '';
                    labelElements[i].style.opacity = '0';
                }
                satState.entranceTransition = null;
            }
        }

        // Determine fade timing source (entrance re-fade or initial load)
        const fadeBaseTime = satState.entranceStartTime !== null ? satState.entranceStartTime : startTime;
        const fadeElapsed = (now - fadeBaseTime) / 1000;

        for (let i = 0; i < satellites.length; i++) {
            const sat = satellites[i];
            const d = sat.userData;
            const glow = glowSprites[i];
            const label = labelElements[i];

            // During reverse entrance animation, only the returning satellite is visible
            if (satState.entranceTransition) {
                if (i === satState.entranceTransition.clickedIndex) {
                    glow.position.copy(sat.position);
                }
                glow.material.opacity = 0;
                glow.visible = false;
                if (i !== satState.entranceTransition.clickedIndex) {
                    sat.visible = false;
                    label.style.display = 'none';
                }
                continue;
            }

            // Update orbit position (skip if page-paused or hover-paused)
            if (!satState.isPaused && !satState.isHoverPaused) {
                d.angle += ORBIT_SPEED * delta;

                // Returned satellite stays fully visible — skip fade-in
                if (i === satState.returnedIndex) {
                    sat.material.opacity = 1;
                    label.style.display = '';
                    label.style.opacity = '0.8';
                    label.style.animation = 'none'; // Prevent CSS labelFadeIn from replaying
                } else if (fadeElapsed >= d.fadeDelay) {
                    // Fade-in animation (uses entrance timing if returning from page)
                    const fadeProgress = Math.min((fadeElapsed - d.fadeDelay) / d.fadeDuration, 1);
                    const eased = 1 - Math.pow(1 - fadeProgress, 3);
                    sat.material.opacity = eased;
                    label.style.opacity = String(Math.min(eased, 0.8)); // labels max at 0.8
                } else {
                    sat.material.opacity = 0;
                    label.style.opacity = '0';
                }

                const radius = d.orbitRadius * orbitScale;

                // Orbit in XY plane (screen plane) so satellites are always visible
                sat.position.x = Math.cos(d.angle) * radius;
                sat.position.y = Math.sin(d.angle) * radius;
                sat.position.z = Math.sin(d.angle) * d.orbitTilt * 0.5;

                // Rotate sprite so right side (sensors) always faces Earth center
                sat.material.rotation = d.angle + Math.PI;
            }

            // ALWAYS update glow position and opacity (even when paused/hovering)
            glow.position.copy(sat.position);

            const isHovered = sat === satState.hoveredSatellite;
            const targetGlowOpacity = isHovered ? 0.5 : 0;
            glow.material.opacity += (targetGlowOpacity - glow.material.opacity) * delta * 8;

            // When page is open, hide satellites completely
            if (satState.isPaused) {
                sat.visible = false;
                glow.visible = false;
                label.style.display = 'none';
                continue;
            }

            // Check occlusion
            const behind = isOccluded(sat.position);

            sat.visible = !behind;
            glow.visible = !behind;
            if (behind) {
                label.style.display = 'none';
                continue;
            }

            projectLabel(sat, label);
        }

        // Check if fade-in is complete (initial or entrance)
        if (satState.entranceStartTime !== null) {
            const maxFadeTime = (satellites.length - 1) * 0.3 + 0.8 + 0.1;
            if (fadeElapsed >= maxFadeTime) {
                satState.entranceStartTime = null;
                satState.initialFadeComplete = true;
                if (satState.returnedIndex >= 0) {
                    labelElements[satState.returnedIndex].style.animation = ''; // Restore CSS glow animation
                }
                satState.returnedIndex = -1; // All satellites visible now, clear override
            }
        } else if (!satState.initialFadeComplete) {
            const maxFadeTime = (satellites.length - 1) * 0.3 + 0.8 + 0.1;
            if (elapsed >= maxFadeTime) {
                satState.initialFadeComplete = true;
            }
        }
    });

    return satellites;
}

export function getSatellites() { return satellites; }

function createPlaceholderTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#888';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#fff';
    ctx.fillRect(8, 24, 48, 16);
    ctx.fillRect(24, 8, 16, 48);
    return new THREE.CanvasTexture(canvas);
}

function createWhiteOrbGlow() {
    const canvas = document.createElement('canvas');
    const size = 256;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const center = size / 2;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    return new THREE.CanvasTexture(canvas);
}
