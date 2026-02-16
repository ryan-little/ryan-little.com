import { spawnStar, clearAllStars, checkStarHit } from './shooting-star.js';
import { scoring } from './scoring.js';
import { onUpdate } from '../globe/scene.js';
import { getCurrentRoute } from '../pages/router.js';

const GAME_DURATION = 20;
const COOLDOWN_DURATION = 5;

let state = 'idle';
let gameTimer = 0;
let spawnTimer = 0;
let visibilityPaused = false;

const overlay = () => document.getElementById('game-overlay');

export function getGameState() { return state; }

export function initMinigame() {
    // Page Visibility API - pause/resume
    document.addEventListener('visibilitychange', () => {
        visibilityPaused = document.hidden;
    });

    // Click/tap handler for catching stars during game
    function handleGameClick(event) {
        // Don't interact with stars while viewing a content page
        if (getCurrentRoute()) return;

        const x = event.clientX ?? event.changedTouches?.[0]?.clientX;
        const y = event.clientY ?? event.changedTouches?.[0]?.clientY;
        if (x === undefined) return;

        if (state === 'active') {
            const hit = checkStarHit(x, y);
            if (hit) {
                const combo = scoring.addCatch();
                showComboPopup(x, y, combo);
                updateScoreDisplay();
            }
        }

        // Clicking a background star triggers the game
        if (state === 'idle') {
            const hit = checkStarHit(x, y);
            if (hit) {
                startGame();
            }
        }
    }

    window.addEventListener('click', handleGameClick);
    window.addEventListener('touchend', handleGameClick, { passive: true });

    // Register update loop
    onUpdate((delta) => {
        if (visibilityPaused) return;
        update(delta);
    });
}

function startGame() {
    if (state !== 'idle') return;
    state = 'countdown';
    scoring.reset();
    document.body.classList.add('game-active');
    showGameUI();
    runCountdown();
}

async function runCountdown() {
    const el = overlay();
    for (let i = 3; i > 0; i--) {
        el.innerHTML = `<div class="game-countdown">${i}</div>`;
        await delay(1000);
    }
    el.innerHTML = `<div class="game-countdown">GO!</div>`;
    await delay(500);
    state = 'active';
    gameTimer = GAME_DURATION;
    spawnTimer = 0;
    updateGameUI();
}

function update(delta) {
    if (state === 'active') {
        gameTimer -= delta;
        spawnTimer -= delta;

        if (spawnTimer <= 0) {
            // Spawn 2-3 stars at once
            const count = Math.floor(Math.random() * 2) + 2;
            for (let i = 0; i < count; i++) {
                spawnStar('minigame');
            }
            const progress = 1 - (gameTimer / GAME_DURATION);
            const interval = 0.4 - progress * 0.25; // 0.4s → 0.15s (much faster)
            spawnTimer = interval + Math.random() * 0.15;
        }

        if (gameTimer <= 0) {
            endGame();
        }

        updateGameUI();
    }

    if (state === 'cooldown') {
        gameTimer -= delta;
        if (gameTimer <= 0) {
            state = 'idle';
            clearAllStars();
            hideGameUI();
            document.body.classList.remove('game-active');
        }
    }
}

function endGame() {
    state = 'ending';
    clearAllStars();
    const isNewHighScore = scoring.saveHighScore();
    showEndScreen(isNewHighScore);

    setTimeout(() => {
        state = 'cooldown';
        gameTimer = COOLDOWN_DURATION;
    }, 2500);
}

function showGameUI() {
    const el = overlay();
    el.classList.remove('hidden');
    el.style.pointerEvents = 'auto';
}

function hideGameUI() {
    const el = overlay();
    el.classList.add('hidden');
    el.style.pointerEvents = '';
    el.innerHTML = '';
}

function updateGameUI() {
    const el = overlay();
    const timeLeft = Math.max(0, Math.ceil(gameTimer));
    const warning = timeLeft <= 5 ? ' warning' : '';
    el.innerHTML = `
        <div class="game-timer${warning}">${timeLeft}</div>
        <div class="game-score">Score: ${scoring.score}</div>
    `;
}

function updateScoreDisplay() {
    const scoreEl = overlay().querySelector('.game-score');
    if (scoreEl) {
        scoreEl.textContent = `Score: ${scoring.score}`;
    }
}

function showEndScreen(isNewHighScore) {
    const el = overlay();
    el.innerHTML = `
        <div class="game-end">
            <div class="game-end-score">${scoring.score}</div>
            <div class="game-end-label">${isNewHighScore ? 'New High Score!' : 'Final Score'}</div>
            ${!isNewHighScore && scoring.highScore > 0 ? `<div class="game-end-highscore">Best: ${scoring.highScore}</div>` : ''}
        </div>
    `;
}

function showComboPopup(x, y, combo) {
    if (combo <= 1) return;
    const popup = document.createElement('div');
    popup.className = 'game-combo';
    popup.textContent = `x${combo}!`;
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    document.body.appendChild(popup);
    popup.addEventListener('animationend', () => popup.remove());
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
