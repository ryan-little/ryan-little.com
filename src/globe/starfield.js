import * as THREE from 'three';
import { getScene, onUpdate } from './scene.js';

const REGULAR_STARS = 6000;
const MILKY_WAY_STARS = 3000;
const STAR_COUNT = REGULAR_STARS + MILKY_WAY_STARS;
const STAR_SPHERE_RADIUS = 500;

export function createStarfield() {
    const scene = getScene();
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const baseSizes = new Float32Array(STAR_COUNT);

    // Main stars with better medium/small distribution
    for (let i = 0; i < REGULAR_STARS - 40; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = STAR_SPHERE_RADIUS;

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        const colorVariant = Math.random();
        if (colorVariant < 0.7) {
            colors[i * 3] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 1.0;
        } else if (colorVariant < 0.85) {
            colors[i * 3] = 0.8; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 1.0;
        } else {
            colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 0.8;
        }

        // More medium/small stars: reduced power from 4 to 3.5
        baseSizes[i] = Math.pow(Math.random(), 3.5) * 8.0 + 0.5;
    }

    // Add 40 extra-bright feature stars
    for (let i = REGULAR_STARS - 40; i < REGULAR_STARS; i++) {
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = STAR_SPHERE_RADIUS;

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Feature stars: warmer, brighter colors
        const warmVariant = Math.random();
        if (warmVariant < 0.5) {
            // Warm white
            colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.98; colors[i * 3 + 2] = 0.85;
        } else {
            // Bright blue-white
            colors[i * 3] = 0.9; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 1.0;
        }

        // Large feature stars: 6-10px
        baseSizes[i] = Math.random() * 4.0 + 6.0;
    }

    // Milky Way band - dense cluster of small stars along a tilted plane
    for (let i = REGULAR_STARS; i < STAR_COUNT; i++) {
        const theta = Math.random() * 2 * Math.PI;
        // Narrow phi range to create a band (±15 degrees from equator)
        const bandWidth = 0.26; // ~15 degrees in radians
        const phi = Math.PI / 2 + (Math.random() - 0.5) * bandWidth;
        const r = STAR_SPHERE_RADIUS;

        // Apply rotation to tilt the band at 30 degrees
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        const tiltAngle = 0.52; // ~30 degrees
        positions[i * 3] = x;
        positions[i * 3 + 1] = y * Math.cos(tiltAngle) - z * Math.sin(tiltAngle);
        positions[i * 3 + 2] = y * Math.sin(tiltAngle) + z * Math.cos(tiltAngle);

        // Milky Way stars: slightly bluish-white, dimmer
        const milkyVariant = Math.random();
        if (milkyVariant < 0.8) {
            colors[i * 3] = 0.95; colors[i * 3 + 1] = 0.97; colors[i * 3 + 2] = 1.0;
        } else {
            colors[i * 3] = 1.0; colors[i * 3 + 1] = 1.0; colors[i * 3 + 2] = 0.95;
        }

        // Small stars for cloudy effect: 0.3-2px
        baseSizes[i] = Math.pow(Math.random(), 2) * 1.7 + 0.3;
    }

    // Select 1000 random stars to twinkle
    const twinkleIndices = [];
    for (let i = 0; i < 1000; i++) {
        twinkleIndices.push(Math.floor(Math.random() * STAR_COUNT));
    }

    // Per-vertex twinkling parameters
    const twinkleSpeed = new Float32Array(STAR_COUNT);
    const twinklePhase = new Float32Array(STAR_COUNT);
    const driftPhase = new Float32Array(STAR_COUNT);

    // Use a Set for O(1) lookup — twinkleIndices contains random star indices, not sequential
    const twinkleSet = new Set(twinkleIndices);

    for (let i = 0; i < STAR_COUNT; i++) {
        if (twinkleSet.has(i)) {
            twinkleSpeed[i] = 2 + (i % 3); // matches original: (2 + idx % 3)
            twinklePhase[i] = 1.0;          // flag: this star twinkles
            driftPhase[i] = i * 1.0;        // unique per star (matches original `idx` usage)
        } else {
            twinkleSpeed[i] = 0.0;
            twinklePhase[i] = 0.0;
            driftPhase[i] = 0.0;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(new Float32Array(baseSizes), 1));
    geometry.setAttribute('twinkleSpeed', new THREE.BufferAttribute(twinkleSpeed, 1));
    geometry.setAttribute('twinklePhase', new THREE.BufferAttribute(twinklePhase, 1));
    geometry.setAttribute('driftPhase', new THREE.BufferAttribute(driftPhase, 1));

    // Custom ShaderMaterial with GPU-side twinkling
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
        },
        vertexShader: `
            attribute float size;
            attribute float twinkleSpeed;
            attribute float twinklePhase;
            attribute float driftPhase;
            uniform float uTime;
            varying vec3 vColor;
            void main() {
                vColor = color;
                // Apply subtle position drift for twinkling stars (preserves visual effect on /earth)
                vec3 pos = position;
                if (twinklePhase > 0.5) {
                    pos.x += sin(uTime * 0.5 + driftPhase) * 0.5;
                    pos.y += cos(uTime * 0.7 + driftPhase) * 0.5;
                    pos.z += sin(uTime * 0.3 + driftPhase * 0.1) * 0.3;
                }
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                // Size twinkling: matches original (sin * 0.5 + 1.0)
                float twinkle = twinklePhase > 0.5
                    ? (sin(uTime * twinkleSpeed) * 0.5 + 1.0)
                    : 1.0;
                gl_PointSize = size * twinkle;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            void main() {
                float dist = length(gl_PointCoord - vec2(0.5));
                if (dist > 0.5) discard;
                float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                gl_FragColor = vec4(vColor, alpha * 0.9);
            }
        `,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        vertexColors: true,  // REQUIRED — enables the `color` attribute used by vColor
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);

    onUpdate((delta) => {
        // Slow rotation so stars drift
        stars.rotation.y += delta * 0.003;
        stars.rotation.x += delta * 0.001;

        // Update time uniform — shader handles twinkling + drift
        material.uniforms.uTime.value = performance.now() * 0.001;
    });

    return stars;
}
