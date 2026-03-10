// Barrel file — preserves all existing import paths for consumers
export { createSatellites, getSatellites, pauseSatellites, resumeSatellites } from './satellite-orbit.js';
export { animateSatelliteExit, fadeInSatellites, SATELLITE_EXIT_DURATION, OTHER_FADE_DURATION, STAGGER_INTERVAL, ENTRANCE_MOVE_DURATION } from './satellite-transition.js';
export { initSatelliteInteraction, pauseSatelliteClicks, resumeSatelliteClicks } from './satellite-interaction.js';
