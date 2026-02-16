import * as THREE from 'three';
import { getScene, getCamera, onUpdate } from './scene.js';
import { getEarthRadius } from './earth.js';
import { getGameState } from '../game/minigame.js';

const ORBIT_SPEED = 0.25; // Same speed for all - prevents grouping

const SATELLITE_CONFIG = [
    { id: 'about', label: 'About', texture: '/satellites/satellite1.webp', orbitRadius: 2.1, orbitTilt: 0.2, phase: 0 },
    { id: 'portfolio', label: 'Portfolio', texture: '/satellites/satellite2.webp', orbitRadius: 2.3, orbitTilt: -0.15, phase: Math.PI / 2 },
    { id: 'trees', label: 'Trees', texture: '/satellites/satellite3.webp', orbitRadius: 2.5, orbitTilt: 0.1, phase: Math.PI },
    { id: 'adventures', label: 'Adventures', texture: '/satellites/satellite4.webp', orbitRadius: 2.2, orbitTilt: -0.25, phase: (3 * Math.PI) / 2 },
];

const MAX_CONFIGURED_RADIUS = Math.max(...SATELLITE_CONFIG.map(c => c.orbitRadius));

const satellites = [];
const labelElements = [];
const glowSprites = [];
const textureLoader = new THREE.TextureLoader();
let _onClickCallback = null;
let isPaused = false;    // page-level pause (viewing content)
let isHoverPaused = false; // hover pause (mousing over satellite)
let hoveredSatellite = null;

// Transition animation state
let exitTransition = null;      // non-null during satellite exit animation
let entranceTransition = null;  // non-null during reverse satellite entrance animation
let entranceStartTime = null;   // non-null during satellite entrance fade-in
let initialFadeComplete = false; // true after initial stagger fade-in finishes
let lastExitedIndex = -1;       // which satellite flew to the page
let returnedIndex = -1;         // satellite that just returned — skip fade-in, keep visible

export async function createSatellites() {
    const scene = getScene();

    // Create label container
    let labelContainer = document.getElementById('satellite-labels');
    if (!labelContainer) {
        labelContainer = document.createElement('div');
        labelContainer.id = 'satellite-labels';
        document.body.appendChild(labelContainer);
    }

    for (const config of SATELLITE_CONFIG) {
        const texture = await new Promise((resolve) => {
            textureLoader.load(config.texture, resolve, undefined, () => {
                resolve(createPlaceholderTexture());
            });
        });
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
        const isMobile = window.innerWidth < 768;
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

        // Create white orb glow effect
        const glowTexture = createWhiteOrbGlow();
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
            if (_onClickCallback) _onClickCallback(config.id, sprite);
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
        if (exitTransition) {
            const exitElapsed = (now - exitTransition.startTime) / 1000;
            const clickedIdx = exitTransition.clickedIndex;
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
                const opacity = exitTransition.opacities[i] * (1 - fadeProgress);

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

            const sp = exitTransition.startPos;
            const tp = exitTransition.targetPos;
            const startSize = exitTransition.startSize;
            const targetSize = exitTransition.targetSize;
            const aspect = clickedSat.userData.aspect || 1;

            // Lerp position
            clickedSat.position.x = sp.x + (tp.x - sp.x) * moveEased;
            clickedSat.position.y = sp.y + (tp.y - sp.y) * moveEased;
            clickedSat.position.z = sp.z + (tp.z - sp.z) * moveEased;

            // Scale up
            const currentSize = startSize + (targetSize - startSize) * moveEased;
            clickedSat.scale.set(currentSize * aspect, currentSize, 1);

            // Rotate back to upright (0) to match static page image
            clickedSat.material.rotation = exitTransition.startRotation * (1 - moveEased);

            // Fade out in last 20% of the move
            if (moveProgress >= 0.8) {
                const fadeProgress = (moveProgress - 0.8) / 0.2;
                clickedSat.material.opacity = exitTransition.opacities[clickedIdx] * (1 - fadeProgress);
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
                isPaused = true;
                const onComplete = exitTransition.onComplete;
                exitTransition = null;
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
        if (entranceTransition) {
            const entElapsed = (now - entranceTransition.startTime) / 1000;
            const idx = entranceTransition.clickedIndex;
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
            const sp = entranceTransition.startPos;
            sat.position.x = sp.x + (targetX - sp.x) * moveEased;
            sat.position.y = sp.y + (targetY - sp.y) * moveEased;
            sat.position.z = sp.z + (targetZ - sp.z) * moveEased;

            // Scale down from page size to orbit size
            const startSize = entranceTransition.startSize;
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
                returnedIndex = idx;
                sat.material.opacity = 1;

                // Now fade in the other satellites
                entranceStartTime = performance.now();
                for (let i = 0; i < satellites.length; i++) {
                    if (i === idx) continue;
                    satellites[i].visible = true;
                    satellites[i].material.opacity = 0;
                    labelElements[i].style.display = '';
                    labelElements[i].style.opacity = '0';
                }
                entranceTransition = null;
            }
        }

        // Determine fade timing source (entrance re-fade or initial load)
        const fadeBaseTime = entranceStartTime !== null ? entranceStartTime : startTime;
        const fadeElapsed = (now - fadeBaseTime) / 1000;

        for (let i = 0; i < satellites.length; i++) {
            const sat = satellites[i];
            const d = sat.userData;
            const glow = glowSprites[i];
            const label = labelElements[i];

            // During reverse entrance animation, only the returning satellite is visible
            if (entranceTransition) {
                if (i === entranceTransition.clickedIndex) {
                    glow.position.copy(sat.position);
                }
                glow.material.opacity = 0;
                glow.visible = false;
                if (i !== entranceTransition.clickedIndex) {
                    sat.visible = false;
                    label.style.display = 'none';
                }
                continue;
            }

            // Update orbit position (skip if page-paused or hover-paused)
            if (!isPaused && !isHoverPaused) {
                d.angle += ORBIT_SPEED * delta;

                // Returned satellite stays fully visible — skip fade-in
                if (i === returnedIndex) {
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

            const isHovered = sat === hoveredSatellite;
            const targetGlowOpacity = isHovered ? 0.5 : 0;
            glow.material.opacity += (targetGlowOpacity - glow.material.opacity) * delta * 8;

            // When page is open, hide satellites completely
            if (isPaused) {
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
        if (entranceStartTime !== null) {
            const maxFadeTime = (satellites.length - 1) * 0.3 + 0.8 + 0.1;
            if (fadeElapsed >= maxFadeTime) {
                entranceStartTime = null;
                initialFadeComplete = true;
                if (returnedIndex >= 0) {
                    labelElements[returnedIndex].style.animation = ''; // Restore CSS glow animation
                }
                returnedIndex = -1; // All satellites visible now, clear override
            }
        } else if (!initialFadeComplete) {
            const maxFadeTime = (satellites.length - 1) * 0.3 + 0.8 + 0.1;
            if (elapsed >= maxFadeTime) {
                initialFadeComplete = true;
            }
        }
    });

    return satellites;
}

// ── Transition exports ──

// Animate satellites out: clicked one scales up + moves to page image position, others reverse-stagger fade
// targetRect: DOMRect from measuring the .page-satellite element's position (optional)
export function animateSatelliteExit(clickedSatellite, targetRect = null) {
    return new Promise((resolve) => {
        const clickedIndex = clickedSatellite ? satellites.indexOf(clickedSatellite) : -1;

        // If no valid satellite (e.g. URL navigation), just fade all out
        if (clickedIndex === -1) {
            isPaused = true;
            resolve();
            return;
        }

        const cam = getCamera();
        const vFov = cam.fov * Math.PI / 180;
        const dist = cam.position.z;
        const halfHeight = Math.tan(vFov / 2) * dist;
        const halfWidth = halfHeight * cam.aspect;

        let targetX, targetY, targetWidthWorld;

        if (targetRect) {
            // Use the measured position of .page-satellite for precise targeting
            const centerX = targetRect.left + targetRect.width / 2;
            const centerY = targetRect.top + targetRect.height / 2;

            // Convert screen pixels to NDC (-1 to +1)
            const ndcX = (centerX / window.innerWidth) * 2 - 1;
            const ndcY_val = 1 - (centerY / window.innerHeight) * 2;

            // Convert NDC to world coordinates at z=0
            targetX = ndcX * halfWidth;
            targetY = ndcY_val * halfHeight;
            targetWidthWorld = (targetRect.width / window.innerWidth) * (2 * halfWidth);
        } else {
            // Fallback: estimate position (~180px from top, centered)
            const pxFromTop = 180;
            const ndcY_val = 1 - 2 * (pxFromTop / window.innerHeight);
            targetX = 0;
            targetY = ndcY_val * halfHeight;
            const pixelsPerUnit = window.innerHeight / (2 * halfHeight);
            targetWidthWorld = 200 / pixelsPerUnit;
        }

        // Compute target scale: match the static image width
        const aspect = clickedSatellite.userData.aspect || 1;
        const targetSize = targetWidthWorld / aspect;

        lastExitedIndex = clickedIndex;

        exitTransition = {
            clickedIndex,
            startTime: performance.now(),
            startPos: clickedSatellite.position.clone(),
            targetPos: new THREE.Vector3(targetX, targetY, 0),
            startSize: clickedSatellite.userData.baseSize,
            targetSize,
            startRotation: clickedSatellite.material.rotation,
            opacities: satellites.map(s => s.material.opacity),
            onComplete: resolve,
        };
    });
}

// Fade satellites back in with stagger (like initial load)
// sourceRect: if provided, the returning satellite reverse-animates from this screen position
export function fadeInSatellites(sourceRect = null) {
    isPaused = false;
    entranceStartTime = performance.now();

    if (sourceRect && lastExitedIndex >= 0) {
        // Reverse animation for the satellite that flew to the page
        const cam = getCamera();
        const vFov = cam.fov * Math.PI / 180;
        const camDist = cam.position.z;
        const halfHeight = Math.tan(vFov / 2) * camDist;
        const halfWidth = halfHeight * cam.aspect;

        // Convert source screen rect to world coordinates
        const centerX = sourceRect.left + sourceRect.width / 2;
        const centerY = sourceRect.top + sourceRect.height / 2;
        const ndcX = (centerX / window.innerWidth) * 2 - 1;
        const ndcY = 1 - (centerY / window.innerHeight) * 2;
        const worldX = ndcX * halfWidth;
        const worldY = ndcY * halfHeight;

        // Compute starting size (match the page image width in world units)
        const sourceWidthWorld = (sourceRect.width / window.innerWidth) * (2 * halfWidth);
        const sat = satellites[lastExitedIndex];
        const aspect = sat.userData.aspect || 1;
        const startSize = sourceWidthWorld / aspect;

        // Position the sprite at the page image location
        sat.position.set(worldX, worldY, 0);
        sat.material.rotation = 0; // upright, matching static image
        sat.material.opacity = 1;
        sat.scale.set(startSize * aspect, startSize, 1);
        sat.visible = true;

        entranceTransition = {
            clickedIndex: lastExitedIndex,
            startTime: performance.now(),
            startPos: new THREE.Vector3(worldX, worldY, 0),
            startSize,
        };

        // Don't start entrance fade timer yet — wait for reverse animation to finish
        entranceStartTime = null;

        // Keep other satellites hidden until the reverse animation completes
        for (let i = 0; i < satellites.length; i++) {
            if (i === lastExitedIndex) continue;
            satellites[i].material.opacity = 0;
            satellites[i].visible = false;
            labelElements[i].style.display = 'none';
            labelElements[i].style.opacity = '0';
        }
    } else {
        // Normal fade-in for all
        for (let i = 0; i < satellites.length; i++) {
            satellites[i].material.opacity = 0;
            satellites[i].visible = true;
            labelElements[i].style.display = '';
            labelElements[i].style.opacity = '0';
        }
    }

    lastExitedIndex = -1;
}

// Click/tap interaction
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

export function initSatelliteInteraction(onSatelliteClick) {
    _onClickCallback = onSatelliteClick;
    const camera = getCamera();

    function handlePointer(event) {
        if (!initialFadeComplete) return; // Wait for initial fade-in
        if (getGameState() !== 'idle') return;
        if (isPaused) return;
        if (exitTransition) return; // Don't allow clicks during transition

        const x = event.clientX ?? event.changedTouches?.[0]?.clientX;
        const y = event.clientY ?? event.changedTouches?.[0]?.clientY;
        if (x === undefined) return;

        pointer.x = (x / window.innerWidth) * 2 - 1;
        pointer.y = -(y / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        raycaster.params.Sprite = { threshold: 0.3 };
        const intersects = raycaster.intersectObjects(satellites);

        if (intersects.length > 0) {
            const satellite = intersects[0].object;
            onSatelliteClick(satellite.userData.id, satellite);
        }
    }

    window.addEventListener('click', handlePointer);
    window.addEventListener('touchend', handlePointer, { passive: true });

    // Hover effect (desktop)
    window.addEventListener('mousemove', (event) => {
        if (!initialFadeComplete) return; // Wait for initial fade-in
        if (getGameState() !== 'idle') return;
        if (exitTransition) return; // No hover during transition

        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        raycaster.params.Sprite = { threshold: 0.3 };
        const intersects = raycaster.intersectObjects(satellites);

        const isHoveringAnySatellite = intersects.length > 0;
        isHoverPaused = isHoveringAnySatellite;

        hoveredSatellite = isHoveringAnySatellite ? intersects[0].object : null;

        for (let i = 0; i < satellites.length; i++) {
            const sat = satellites[i];
            const label = labelElements[i];
            const isHovered = intersects.some(inter => inter.object === sat);
            const base = sat.userData.baseSize;
            const aspect = sat.userData.aspect || 1;
            const scale = isHovered ? base * 1.2 : base;
            sat.scale.set(scale * aspect, scale, 1);

            if (isHovered) {
                label.classList.add('hovered');
            } else {
                label.classList.remove('hovered');
            }
        }
        document.body.style.cursor = isHoveringAnySatellite ? 'pointer' : 'default';
    });
}

export function getSatellites() { return satellites; }

export function pauseSatellites() {
    isPaused = true;
}

export function resumeSatellites() {
    isPaused = false;
}

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
