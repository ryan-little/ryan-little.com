// Mobile breakpoints — 3D uses 768 for quality (geometry, sprite size),
// CSS uses 600 for layout. Both are intentional.
export const MOBILE_BREAKPOINT_3D = 768;

// Live cloud texture URLs (matteason.co.uk, EUMETSAT data, regenerated every 3h).
// Standard 4096×2048 (~1.6MB) is the safe default; the 8192×4096 version (~5.7MB)
// is sharper but exceeds the 4096 max texture size on some mobile GPUs, so /earth
// only uses it when the GPU reports support.
export const CLOUD_TEXTURE_URL = 'https://clouds.matteason.co.uk/images/4096x2048/clouds.jpg';
export const CLOUD_TEXTURE_URL_HQ = 'https://clouds.matteason.co.uk/images/8192x4096/clouds.jpg';

// matteason regenerates the composite every 3 hours, so polling faster just
// re-downloads the same image.
export const CLOUD_REFRESH_HOURS = 3;
