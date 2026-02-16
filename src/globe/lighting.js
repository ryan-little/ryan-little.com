/**
 * Calculate the sun's direction vector based on current UTC time.
 * Uses a simplified solar position algorithm.
 */
export function getSunDirection() {
    const now = new Date();
    const dayOfYear = getDayOfYear(now);
    const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;

    // Solar declination (simplified)
    const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));
    const declinationRad = (declination * Math.PI) / 180;

    // Hour angle: sun is at longitude = (12 - utcHours) * 15 degrees
    const hourAngle = ((12 - utcHours) * 15 * Math.PI) / 180;

    // Convert to 3D direction in Earth mesh object space.
    // Three.js SphereGeometry maps PM (u=0.5) to +X axis,
    // 90°E (u=0.75) to -Z axis, so we need:
    // +X = PM, -Z = 90°E (clockwise when viewed from above)
    const x = Math.cos(declinationRad) * Math.cos(hourAngle);
    const y = Math.sin(declinationRad);
    const z = -Math.cos(declinationRad) * Math.sin(hourAngle);

    return { x, y, z };
}

function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}
