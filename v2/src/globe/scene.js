import * as THREE from 'three';

let scene, camera, renderer;
let animationId = null;
const clock = new THREE.Clock();

const updateCallbacks = [];

const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 0, 5);
let cameraAnimation = null;

export function initScene(container) {
    scene = new THREE.Scene();

    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer({
        antialias: window.devicePixelRatio < 2,
        alpha: false,
        powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    const onResize = () => {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    function animate() {
        animationId = requestAnimationFrame(animate);
        const delta = Math.min(clock.getDelta(), 0.1);

        // Update camera animation if active
        if (cameraAnimation) {
            const { startPos, targetPos, duration, startTime, resolve } = cameraAnimation;
            const elapsed = performance.now() - startTime;
            let t = Math.min(elapsed / duration, 1);
            // Ease in-out cubic
            t = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

            camera.position.lerpVectors(startPos, targetPos, t);

            if (elapsed >= duration) {
                camera.position.copy(targetPos);
                cameraAnimation = null;
                resolve();
            }
        }

        for (const cb of updateCallbacks) cb(delta);
        renderer.render(scene, camera);
    }
    animate();

    return { scene, camera, renderer, clock };
}

export function getScene() { return scene; }
export function getCamera() { return camera; }
export function getRenderer() { return renderer; }

export function onUpdate(callback) {
    updateCallbacks.push(callback);
}

export function removeUpdate(callback) {
    const idx = updateCallbacks.indexOf(callback);
    if (idx !== -1) updateCallbacks.splice(idx, 1);
}

export function animateCamera(targetPos, duration = 1000, easing = 'easeInOut') {
    return new Promise((resolve) => {
        const startPos = camera.position.clone();
        const startTime = performance.now();

        cameraAnimation = {
            startPos,
            targetPos: targetPos.clone(),
            duration,
            startTime,
            resolve,
        };
    });
}

export function getDefaultCameraPos() { return DEFAULT_CAMERA_POS.clone(); }
