import { CLOUD_REFRESH_HOURS } from './constants.js';

// Align cloud refreshes to matteason's actual 3-hourly cadence instead of a
// fixed interval from page load. EUMETSAT data publishes around the synoptic
// hours (00, 03, 06… UTC); we wait a short margin past each boundary for the
// new composite to be generated and uploaded, then refresh every 3h after.
const PROCESSING_MARGIN_MIN = 25;

function msUntilNextRefresh(now) {
    const next = new Date(now);
    const nextSynopticHour =
        (Math.floor(now.getUTCHours() / CLOUD_REFRESH_HOURS) + 1) * CLOUD_REFRESH_HOURS;
    // setUTCHours normalizes hour 24 → next day 00:00
    next.setUTCHours(nextSynopticHour, PROCESSING_MARGIN_MIN, 0, 0);
    return next - now;
}

// Schedules refreshFn at the next aligned boundary, then every 3h.
// Returns a cleanup function that cancels the pending timers.
export function scheduleCloudRefresh(refreshFn) {
    let intervalId = null;
    const timeoutId = setTimeout(() => {
        refreshFn();
        intervalId = setInterval(refreshFn, CLOUD_REFRESH_HOURS * 60 * 60 * 1000);
    }, msUntilNextRefresh(new Date()));

    return () => {
        clearTimeout(timeoutId);
        if (intervalId) clearInterval(intervalId);
    };
}
