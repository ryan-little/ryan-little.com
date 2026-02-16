import * as THREE from 'three';
import { getScene, onUpdate } from './scene.js';
import { getSunDirection } from './lighting.js';

let earthMesh = null;
let atmosphereMesh = null;
const EARTH_RADIUS = 1;
const ROTATION_SPEED = (2 * Math.PI) / 90;

// Use object-space normals so terminator is fixed to Earth's surface
const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormalLocal;
    void main() {
        vUv = uv;
        vNormalLocal = normalize(normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;
    uniform vec3 sunDirection;
    varying vec2 vUv;
    varying vec3 vNormalLocal;

    void main() {
        vec4 dayColor = texture2D(dayTexture, vUv);
        vec4 nightColor = texture2D(nightTexture, vUv);

        float intensity = dot(vNormalLocal, normalize(sunDirection));
        float blend = smoothstep(-0.15, 0.2, intensity);

        // Brighter day side: 0.5 ambient + up to 1.3 direct = max 1.8x
        vec4 dayLit = dayColor * (0.5 + 1.3 * max(intensity, 0.0));
        // Boost night side city lights
        vec4 nightLit = nightColor * 1.4 * (1.0 - blend);

        gl_FragColor = mix(nightLit, dayLit, blend);
    }
`;

function updateSunUniform() {
    if (!earthMesh) return;
    // getSunDirection already returns in the mesh's object space
    // (PM at +X, 90°E at -Z), so no quaternion transform needed.
    // The terminator stays geographically correct regardless of mesh rotation.
    const sun = getSunDirection();
    earthMesh.material.uniforms.sunDirection.value.set(sun.x, sun.y, sun.z);
}

export async function createEarth() {
    const scene = getScene();
    const isMobile = window.innerWidth < 768;
    const segments = isMobile ? 32 : 64;

    const geometry = new THREE.SphereGeometry(EARTH_RADIUS, segments, segments);
    const textureLoader = new THREE.TextureLoader();

    const [dayTexture, nightTexture] = await Promise.all([
        new Promise((resolve, reject) => {
            textureLoader.load('/textures/earth-day.jpg', resolve, undefined, reject);
        }),
        new Promise((resolve, reject) => {
            textureLoader.load('/textures/earth-night.jpg', resolve, undefined, reject);
        }),
    ]);

    dayTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.colorSpace = THREE.SRGBColorSpace;

    const uniforms = {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        sunDirection: { value: new THREE.Vector3() },
    };

    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
    });

    earthMesh = new THREE.Mesh(geometry, material);
    earthMesh.rotation.y = 0;
    scene.add(earthMesh);

    atmosphereMesh = createAtmosphere();
    scene.add(atmosphereMesh);

    // Update every frame: rotation + sun in object space
    onUpdate((delta) => {
        if (earthMesh) {
            earthMesh.rotation.y += ROTATION_SPEED * delta;
            updateSunUniform();
        }
    });

    return earthMesh;
}

function createAtmosphere() {
    const geometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.02, 64, 64);
    const material = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            void main() {
                float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                // Warm blue-white atmosphere glow
                gl_FragColor = vec4(0.4, 0.65, 1.0, 1.0) * intensity * 1.3;
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
    });

    return new THREE.Mesh(geometry, material);
}

export function getEarth() { return earthMesh; }
export function getEarthRadius() { return EARTH_RADIUS; }
