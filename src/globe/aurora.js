import * as THREE from 'three';
import { getScene, onUpdate } from './scene.js';
import { getSunDirection } from './lighting.js';
import { getEarth } from './earth.js';

export function createAurora() {
    const scene = getScene();

    // Sit just above the atmosphere mesh (radius 1.02)
    const geometry = new THREE.SphereGeometry(1.04, 64, 32);

    const material = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormalLocal;
            void main() {
                vNormalLocal = normalize(normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 sunDirection;
            uniform float time;
            varying vec3 vNormalLocal;

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                return mix(
                    mix(hash(i),               hash(i + vec2(1.0, 0.0)), f.x),
                    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
                    f.y
                );
            }

            void main() {
                float lat = asin(clamp(vNormalLocal.y, -1.0, 1.0));
                float absLat = abs(lat);

                // Band from ~62° to ~80° (in radians: 1.08 to 1.40)
                float band = smoothstep(1.08, 1.20, absLat) * smoothstep(1.42, 1.28, absLat);
                if (band < 0.001) discard;

                // Night side only — fade out toward the day side
                float nightBlend = smoothstep(0.2, -0.1, dot(normalize(sunDirection), vNormalLocal));
                if (nightBlend < 0.001) discard;

                float lon = atan(vNormalLocal.x, vNormalLocal.z);

                // Two-octave shimmer along longitude
                float shimmer = noise(vec2(lon * 6.0 + time * 0.25, absLat * 10.0))
                              + 0.5 * noise(vec2(lon * 14.0 - time * 0.4, absLat * 18.0));
                shimmer /= 1.5;

                // Green → cyan color shift
                vec3 color = mix(vec3(0.05, 0.9, 0.3), vec3(0.0, 0.5, 1.0), shimmer);
                float alpha = band * nightBlend * (0.25 + 0.45 * shimmer);

                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        depthWrite: false,
        uniforms: {
            sunDirection: { value: new THREE.Vector3() },
            time:         { value: 0.0 },
        },
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let elapsed = 0;
    onUpdate((delta) => {
        const earth = getEarth();
        if (!earth) return;
        mesh.rotation.y = earth.rotation.y;
        elapsed += delta;
        material.uniforms.time.value = elapsed;
        const sun = getSunDirection();
        material.uniforms.sunDirection.value.set(sun.x, sun.y, sun.z);
    });

    return mesh;
}
