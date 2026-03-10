import * as THREE from 'three';
import { getCamera } from './scene.js';
import { satellites, labelElements, glowSprites, satState } from './satellite-orbit.js';

// Timing constants — these are interdependent:
// EXIT_MOVE_DURATION controls how long the clicked satellite takes to reach its target.
// The sprite fades out in its last 20% (0.56s-0.7s mark).
// PAGE_SHOW_DELAY (in transition.js) is set to 450ms to start the page fade-in
// before the sprite finishes, creating a smooth crossfade overlap.
export const SATELLITE_EXIT_DURATION = 0.7;    // seconds — clicked satellite move animation
export const OTHER_FADE_DURATION = 0.35;       // seconds — non-clicked satellites fade out
export const STAGGER_INTERVAL = 0.12;          // seconds — delay between each satellite's fade
export const ENTRANCE_MOVE_DURATION = 0.7;     // seconds — returning satellite reverse animation

// Animate satellites out: clicked one scales up + moves to page image position, others reverse-stagger fade
// targetRect: DOMRect from measuring the .page-satellite element's position (optional)
export function animateSatelliteExit(clickedSatellite, targetRect = null) {
    return new Promise((resolve) => {
        const clickedIndex = clickedSatellite ? satellites.indexOf(clickedSatellite) : -1;

        // If no valid satellite (e.g. URL navigation), just fade all out
        if (clickedIndex === -1) {
            satState.isPaused = true;
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

        satState.lastExitedIndex = clickedIndex;

        satState.exitTransition = {
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
    satState.isPaused = false;
    satState.entranceStartTime = performance.now();

    if (sourceRect && satState.lastExitedIndex >= 0) {
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
        const sat = satellites[satState.lastExitedIndex];
        const aspect = sat.userData.aspect || 1;
        const startSize = sourceWidthWorld / aspect;

        // Position the sprite at the page image location
        sat.position.set(worldX, worldY, 0);
        sat.material.rotation = 0; // upright, matching static image
        sat.material.opacity = 1;
        sat.scale.set(startSize * aspect, startSize, 1);
        sat.visible = true;

        satState.entranceTransition = {
            clickedIndex: satState.lastExitedIndex,
            startTime: performance.now(),
            startPos: new THREE.Vector3(worldX, worldY, 0),
            startSize,
        };

        // Don't start entrance fade timer yet — wait for reverse animation to finish
        satState.entranceStartTime = null;

        // Keep other satellites hidden until the reverse animation completes
        for (let i = 0; i < satellites.length; i++) {
            if (i === satState.lastExitedIndex) continue;
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

    satState.lastExitedIndex = -1;
}
