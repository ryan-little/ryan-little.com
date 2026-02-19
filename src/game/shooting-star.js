import * as THREE from 'three';
import { getScene, getCamera, onUpdate } from '../globe/scene.js';
import { getCurrentRoute } from '../pages/router.js';

const POOL_SIZE = 60;
const pool = [];
const activeStars = [];
const textureLoader = new THREE.TextureLoader();
let starTexture = null;

export async function initShootingStars() {
    starTexture = await new Promise((resolve) => {
        textureLoader.load('/shootingstar.webp', resolve, undefined, () => {
            textureLoader.load('/shootingstar.png', resolve, undefined, () => resolve(null));
        });
    });

    const scene = getScene();
    for (let i = 0; i < POOL_SIZE; i++) {
        const material = new THREE.SpriteMaterial({
            map: starTexture,
            transparent: true,
            opacity: 0,
            depthTest: false,
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(0.4, 0.2, 1);
        sprite.visible = false;
        scene.add(sprite);
        pool.push(sprite);
    }

    // Update active stars each frame
    onUpdate((delta) => {
        for (let i = activeStars.length - 1; i >= 0; i--) {
            const star = activeStars[i];
            const data = star.userData;
            data.progress += delta / data.duration;

            if (data.progress >= 1) {
                recycleStar(star);
                activeStars.splice(i, 1);
                continue;
            }

            // Lerp position
            star.position.lerpVectors(data.start, data.end, data.progress);

            // Fade in then out
            const fadeIn = Math.min(data.progress * 10, 1);
            const fadeOut = Math.max(1 - (data.progress - 0.8) * 5, 0);
            star.material.opacity = Math.min(fadeIn, fadeOut);
        }
    });

    // Spawn occasional background shooting stars
    let bgTimer = Math.random() * 8 + 4;
    onUpdate((delta) => {
        bgTimer -= delta;
        if (bgTimer <= 0) {
            if (!getCurrentRoute()) {  // only spawn on globe screen
                spawnStar('background');
            }
            bgTimer = Math.random() * 8 + 4;
        }
    });
}

export function spawnStar(type = 'background') {
    const star = pool.find(s => !s.visible);
    if (!star) return null;

    star.visible = true;
    star.material.opacity = 0;

    // Compute visible area at z=0 from camera
    // Camera at z=5, FOV 45°: visible half-height = tan(22.5°) * 5 ≈ 2.07
    const visHalf = 2.5; // slightly generous
    const visHalfW = visHalf * (window.innerWidth / window.innerHeight);

    // Pick a random edge to spawn from (0=left, 1=right, 2=top, 3=bottom)
    const edge = Math.floor(Math.random() * 4);
    let sx, sy, ex, ey;
    const margin = 1.5; // spawn this far outside visible area

    if (edge === 0) { // left
        sx = -visHalfW - margin;
        sy = (Math.random() - 0.5) * visHalf * 2;
        ex = visHalfW + margin;
        ey = (Math.random() - 0.5) * visHalf * 2;
    } else if (edge === 1) { // right
        sx = visHalfW + margin;
        sy = (Math.random() - 0.5) * visHalf * 2;
        ex = -visHalfW - margin;
        ey = (Math.random() - 0.5) * visHalf * 2;
    } else if (edge === 2) { // top
        sx = (Math.random() - 0.5) * visHalfW * 2;
        sy = visHalf + margin;
        ex = (Math.random() - 0.5) * visHalfW * 2;
        ey = -visHalf - margin;
    } else { // bottom
        sx = (Math.random() - 0.5) * visHalfW * 2;
        sy = -visHalf - margin;
        ex = (Math.random() - 0.5) * visHalfW * 2;
        ey = visHalf + margin;
    }

    const sz = (Math.random() - 0.5) * 2 - 1; // slight z variation
    const start = new THREE.Vector3(sx, sy, sz);
    const end = new THREE.Vector3(ex, ey, sz);

    star.position.copy(start);
    star.userData = {
        type,
        start: start.clone(),
        end,
        progress: 0,
        duration: type === 'minigame' ? (Math.random() * 3 + 5) : (Math.random() * 3 + 4),
        // minigame: 5-8s (easier to catch), background: 4-7s (leisurely)
        caught: false,
    };

    const direction = end.clone().sub(start);
    const angle = Math.atan2(direction.y, direction.x);
    star.material.rotation = angle;

    // Minigame stars slightly larger
    if (type === 'minigame') {
        star.scale.set(0.5, 0.25, 1);
    } else {
        star.scale.set(0.4, 0.2, 1);
    }

    activeStars.push(star);
    return star;
}

function recycleStar(star) {
    star.visible = false;
    star.material.opacity = 0;
    star.userData = {};
}

export function getActiveStars() { return activeStars; }

export function clearAllStars() {
    for (const star of activeStars) recycleStar(star);
    activeStars.length = 0;
}

// Check if a click/tap hit a shooting star (for minigame)
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

export function checkStarHit(clientX, clientY) {
    const camera = getCamera();
    pointer.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);
    raycaster.params.Sprite = { threshold: 0.8 };

    const visibleStars = activeStars.filter(s => s.visible && !s.userData.caught);
    const intersects = raycaster.intersectObjects(visibleStars);

    if (intersects.length > 0) {
        const hit = intersects[0].object;
        hit.userData.caught = true;
        recycleStar(hit);
        const idx = activeStars.indexOf(hit);
        if (idx !== -1) activeStars.splice(idx, 1);
        return hit;
    }
    return null;
}
