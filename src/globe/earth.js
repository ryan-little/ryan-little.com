import * as THREE from 'three';
import { getScene, onUpdate } from './scene.js';
import { getSunDirection } from './lighting.js';

let earthMesh = null;
let atmosphereMesh = null;
let elapsed = 0;
const EARTH_RADIUS = 1;
const ROTATION_SPEED = (2 * Math.PI) / 90;
const CLOUD_DRIFT_PERIOD = 10800; // 3 hours for one full cloud revolution relative to surface

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
    uniform sampler2D cloudTexture;
    uniform vec3 sunDirection;
    uniform float cloudOffset;
    varying vec2 vUv;
    varying vec3 vNormalLocal;

    void main() {
        // RepeatWrapping lets the GPU bilinear-filter across the wrap boundary,
        // hiding the seam without a hard mod() cut
        vec2 cloudUv = vec2(vUv.x + cloudOffset, vUv.y);

        vec4 dayColor = texture2D(dayTexture, vUv);
        vec4 nightColor = texture2D(nightTexture, vUv);
        float clouds = texture2D(cloudTexture, cloudUv).r;

        float intensity = dot(vNormalLocal, normalize(sunDirection));
        // Wide soft transition to emulate Earth's atmospheric penumbra
        float blend = smoothstep(-0.25, 0.25, intensity);

        // Screen blend white light into day texture for self-illuminated look
        float innerBrightness = 0.12 * min(max(intensity, 0.0) * 3.0, 1.0);
        vec4 innerLight = vec4(innerBrightness);
        vec4 dayLit = vec4(1.0) - (vec4(1.0) - dayColor) * (vec4(1.0) - innerLight);

        // pow() makes thin clouds fade out, only thick formations stay visible
        float cloudAlpha = pow(clouds, 1.5) * 0.7 * blend;
        dayLit = mix(dayLit, vec4(1.0, 1.0, 1.0, 1.0), cloudAlpha);

        // Cloud shadows: per-fragment tangent-space parallax onto day surface.
        // Build east/north tangent vectors, guarding against degenerate zero at poles.
        vec3 rawEast = vec3(vNormalLocal.z, 0.0, -vNormalLocal.x);
        vec3 east = normalize(mix(rawEast, vec3(1.0, 0.0, 0.0),
                                  smoothstep(0.98, 1.0, abs(vNormalLocal.y))));
        vec3 north = normalize(cross(vNormalLocal, east));
        vec3 sunN = normalize(sunDirection);
        vec3 tangentSun = sunN - dot(sunN, vNormalLocal) * vNormalLocal;
        float shadowDU =  dot(tangentSun, east)  * 0.015;
        float shadowDV = -dot(tangentSun, north) * 0.015;
        // RepeatWrapping handles U wrap naturally; clamp V at poles
        vec2 shadowUv = vec2(cloudUv.x + shadowDU, clamp(cloudUv.y + shadowDV, 0.0, 1.0));
        float shadowCloud = texture2D(cloudTexture, shadowUv).r;
        float shadowAlpha = pow(shadowCloud, 2.0) * 0.5 * blend;
        dayLit = mix(dayLit, dayLit * 0.4, shadowAlpha);

        // Night side: city lights fully visible in deep night, fade near terminator
        float nightVisibility = 1.0 - smoothstep(-0.2, 0.15, intensity);
        vec4 moonlit = dayColor * 0.15;
        vec4 nightLit = nightColor * (2.0 - pow(clouds, 1.5) * 0.86) * nightVisibility + moonlit;

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

export async function createEarth({ cloudUrl = '/textures/earth-clouds.webp', realTimeRotation = false } = {}) {
    const scene = getScene();
    const isMobile = window.innerWidth < 768;
    const segments = isMobile ? 32 : 64;

    const geometry = new THREE.SphereGeometry(EARTH_RADIUS, segments, segments);
    const textureLoader = new THREE.TextureLoader();

    let material;

    try {
        const [dayTexture, nightTexture] = await Promise.all([
            new Promise((resolve, reject) => {
                textureLoader.load('/textures/earth-day.webp', resolve, undefined, reject);
            }),
            new Promise((resolve, reject) => {
                textureLoader.load('/textures/earth-night.webp', resolve, undefined, reject);
            }),
        ]);

        // Cloud texture loads independently — if it fails, no clouds (null → transparent texture)
        const cloudTexture = await new Promise((resolve) => {
            textureLoader.load(cloudUrl, resolve, undefined, () => {
                console.warn(`Cloud texture failed (${cloudUrl}), rendering without clouds`);
                resolve(null);
            });
        });

        dayTexture.colorSpace = THREE.SRGBColorSpace;
        nightTexture.colorSpace = THREE.SRGBColorSpace;
        if (cloudTexture) cloudTexture.wrapS = THREE.RepeatWrapping;

        // If all cloud sources failed, use a transparent 1×1 texture (no clouds rendered)
        const resolvedCloud = cloudTexture ?? (() => {
            const t = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
            t.needsUpdate = true;
            return t;
        })();

        material = new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                dayTexture: { value: dayTexture },
                nightTexture: { value: nightTexture },
                cloudTexture: { value: resolvedCloud },
                sunDirection: { value: new THREE.Vector3() },
                cloudOffset: { value: 0.0 },
            },
        });
    } catch (err) {
        console.warn('Earth textures failed to load, using fallback sprite:', err);
        // Fallback: flat earthsprite texture so globe still renders
        const fallbackTexture = await new Promise((resolve) => {
            textureLoader.load('/images/earthsprite.webp', resolve, undefined, () => resolve(null));
        });
        material = fallbackTexture
            ? new THREE.MeshBasicMaterial({ map: fallbackTexture })
            : new THREE.MeshBasicMaterial({ color: 0x1a4a8a });
    }

    earthMesh = new THREE.Mesh(geometry, material);
    earthMesh.rotation.y = 0;
    scene.add(earthMesh);

    atmosphereMesh = createAtmosphere();
    scene.add(atmosphereMesh);

    onUpdate((delta) => {
        if (earthMesh) {
            if (realTimeRotation) {
                // Set rotation to match actual UTC time so clouds/terrain align geographically.
                // At UTC noon (43200s), rotation.y = 0 → PM faces sun (+X). Increases eastward.
                const now = new Date();
                const utcSeconds = now.getUTCHours() * 3600 + now.getUTCMinutes() * 60 +
                    now.getUTCSeconds() + now.getUTCMilliseconds() / 1000;
                earthMesh.rotation.y = (utcSeconds / 86400 - 0.5) * 2 * Math.PI;
            } else {
                earthMesh.rotation.y += ROTATION_SPEED * delta;
            }
            if (earthMesh.material.uniforms) {
                updateSunUniform();
                elapsed += delta;
                earthMesh.material.uniforms.cloudOffset.value =
                    (elapsed % CLOUD_DRIFT_PERIOD) / CLOUD_DRIFT_PERIOD;
            }
            // Convert sun from Earth object-space to world-space for atmosphere
            if (atmosphereMesh) {
                const sun = getSunDirection();
                const ry  = earthMesh.rotation.y;
                atmosphereMesh.material.uniforms.sunWorldDir.value.set(
                    sun.x * Math.cos(ry) + sun.z * Math.sin(ry),
                    sun.y,
                   -sun.x * Math.sin(ry) + sun.z * Math.cos(ry)
                );
            }
        }
    });

    return earthMesh;
}

function createAtmosphere() {
    const geometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.02, 64, 64);
    const material = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vWorldNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                // Atmosphere mesh has no rotation so local = world normal
                vWorldNormal = normalize(normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 sunWorldDir;
            varying vec3 vNormal;
            varying vec3 vWorldNormal;
            void main() {
                float limb = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);

                // How much is this point on the atmosphere facing the sun?
                float sunAlign  = dot(vWorldNormal, normalize(sunWorldDir));
                float dayFactor = smoothstep(-0.2, 0.2, sunAlign);

                vec3 dayColor   = vec3(0.4, 0.65, 1.0);   // blue-white
                vec3 atmosColor = dayColor * max(dayFactor, 0.35);

                gl_FragColor = vec4(atmosColor, 1.0) * limb * 1.1;
            }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        uniforms: {
            sunWorldDir: { value: new THREE.Vector3(1, 0, 0) },
        },
    });

    return new THREE.Mesh(geometry, material);
}

export function getEarth() { return earthMesh; }
export function getEarthRadius() { return EARTH_RADIUS; }

export function refreshCloudTexture(url) {
    if (!earthMesh?.material?.uniforms?.cloudTexture) return;
    new THREE.TextureLoader().load(url + '?t=' + Date.now(), (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.needsUpdate = true;
        earthMesh.material.uniforms.cloudTexture.value.dispose();
        earthMesh.material.uniforms.cloudTexture.value = texture;
    });
}
