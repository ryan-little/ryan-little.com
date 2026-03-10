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
let _onGameStart = null;
let _onGameEnd = null;

const overlay = () => document.getElementById('game-overlay');

export function getGameState() { return state; }

export function initMinigame({ onGameStart, onGameEnd } = {}) {
    _onGameStart = onGameStart;
    _onGameEnd = onGameEnd;
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
    if (_onGameStart) _onGameStart();
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
    if (_onGameEnd) _onGameEnd();
    clearAllStars();
    showEndScreen();

    setTimeout(() => {
        state = 'cooldown';
        gameTimer = COOLDOWN_DURATION;
    }, 2500);
}

let timerEl = null;
let scoreEl = null;
let lastDisplayedTime = null;

function showGameUI() {
    const el = overlay();
    el.classList.remove('hidden');
    el.style.pointerEvents = 'auto';
    el.innerHTML = '<div class="game-timer"></div><div class="game-score"></div>';
    timerEl = el.querySelector('.game-timer');
    scoreEl = el.querySelector('.game-score');
    lastDisplayedTime = null;
}

function hideGameUI() {
    const el = overlay();
    el.classList.add('hidden');
    el.style.pointerEvents = '';
    el.innerHTML = '';
    timerEl = null;
    scoreEl = null;
    lastDisplayedTime = null;
}

function updateGameUI() {
    if (!timerEl || !scoreEl) return;
    const timeLeft = Math.max(0, Math.ceil(gameTimer));
    if (timeLeft !== lastDisplayedTime) {
        lastDisplayedTime = timeLeft;
        timerEl.textContent = timeLeft;
        timerEl.className = timeLeft <= 5 ? 'game-timer warning' : 'game-timer';
    }
    scoreEl.textContent = `Score: ${scoring.score}`;
}

function updateScoreDisplay() {
    const scoreEl = overlay().querySelector('.game-score');
    if (scoreEl) {
        scoreEl.textContent = `Score: ${scoring.score}`;
    }
}

function showEndScreen() {
    const el = overlay();
    el.innerHTML = `
        <div class="game-end">
            <div class="game-end-score">${scoring.score}</div>
            <div class="game-end-label">Nice!</div>
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
