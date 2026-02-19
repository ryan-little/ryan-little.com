const STORAGE_KEY = 'v2-minigame-highscore';

export const scoring = {
    score: 0,
    combo: 0,
    lastCatchTime: 0,
    highScore: (() => { try { return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10); } catch { return 0; } })(),

    reset() {
        this.score = 0;
        this.combo = 0;
        this.lastCatchTime = 0;
    },

    addCatch() {
        const now = Date.now();
        if (now - this.lastCatchTime < 1500) {
            this.combo = Math.min(this.combo + 1, 4);
        } else {
            this.combo = 1;
        }
        this.lastCatchTime = now;
        this.score += this.combo;
        return this.combo;
    },

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(STORAGE_KEY, String(this.highScore));
            return true;
        }
        return false;
    },
};
