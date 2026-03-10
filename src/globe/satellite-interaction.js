import * as THREE from 'three';
import { getCamera } from './scene.js';
import { satellites, labelElements, satState } from './satellite-orbit.js';

// Click/tap interaction
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

export function initSatelliteInteraction(onSatelliteClick) {
    satState.onClickCallback = onSatelliteClick;
    const camera = getCamera();

    function handlePointer(event) {
        if (!satState.initialFadeComplete) return; // Wait for initial fade-in
        if (satState.isPaused) return;
        if (satState.exitTransition) return; // Don't allow clicks during transition

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
        if (!satState.initialFadeComplete) return; // Wait for initial fade-in
        if (satState.isPaused) return;           // skip when page/game active
        if (satState.exitTransition) return; // No hover during transition

        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        raycaster.params.Sprite = { threshold: 0.3 };
        const intersects = raycaster.intersectObjects(satellites);

        const isHoveringAnySatellite = intersects.length > 0;
        satState.isHoverPaused = isHoveringAnySatellite;

        satState.hoveredSatellite = isHoveringAnySatellite ? intersects[0].object : null;

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

export function pauseSatelliteClicks() {
    satState.isPaused = true;
}

export function resumeSatelliteClicks() {
    satState.isPaused = false;
}
