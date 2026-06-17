import * as THREE from 'three';
import { getScene, onUpdate } from './scene.js';
import { getEarth } from './earth.js';
import { latLonToLocal } from './geo.js';

// Country borders from Natural Earth 110m (public domain), pre-flattened into
// public/data/borders.json as { rings: [[lon,lat,lon,lat,...], ...] }.
const R = 1.001;

let bordersGroup = null;

export function setBordersVisible(visible) {
    if (bordersGroup) bordersGroup.visible = visible;
}

export async function createBorders() {
    const scene = getScene();
    bordersGroup = new THREE.Group();
    bordersGroup.visible = false;
    scene.add(bordersGroup);

    // Rotate with the Earth so borders stay registered to the surface.
    onUpdate(() => {
        const earth = getEarth();
        if (earth) bordersGroup.rotation.y = earth.rotation.y;
    });

    try {
        const res = await fetch('/data/borders.json');
        const { rings } = await res.json();

        // One merged LineSegments (single draw call) instead of ~300 Line objects.
        const positions = [];
        const v = new THREE.Vector3();
        for (const ring of rings) {
            for (let i = 0; i < ring.length - 2; i += 2) {
                latLonToLocal(ring[i + 1], ring[i], R, v);
                positions.push(v.x, v.y, v.z);
                latLonToLocal(ring[i + 3], ring[i + 2], R, v);
                positions.push(v.x, v.y, v.z);
            }
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        const mat = new THREE.LineBasicMaterial({
            color: 0xffffff, transparent: true, opacity: 0.3, depthWrite: false,
        });
        bordersGroup.add(new THREE.LineSegments(geo, mat));
    } catch (err) {
        console.warn('Country borders failed to load:', err);
    }

    return bordersGroup;
}
