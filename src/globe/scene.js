import * as THREE from 'three';

let scene, camera, renderer;
let animationId = null;
const clock = new THREE.Clock();

const updateCallbacks = [];

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

