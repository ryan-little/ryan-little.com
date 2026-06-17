import * as THREE from 'three';

// Convert geographic coords to Earth mesh local-space vector.
// Convention matches earth.js / cities.js: PM (0°E) at +X, 90°E at -Z.
export function latLonToLocal(lat, lon, radius = 1, target = new THREE.Vector3()) {
    const phi = Math.PI + (lon * Math.PI) / 180;
    const theta = Math.PI / 2 - (lat * Math.PI) / 180;
    return target.set(
        -Math.cos(phi) * Math.sin(theta),
        Math.cos(theta),
        Math.sin(phi) * Math.sin(theta)
    ).multiplyScalar(radius);
}
