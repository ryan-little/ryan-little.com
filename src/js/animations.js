// Animation functionality for Ryan Little's personal website
// Handles shooting stars and other visual effects

// WebP support detection for JavaScript-generated elements
function getImageUrl(filename, extension = 'webp') {
    // Check if WebP is supported
    const canvas = document.createElement('canvas');
    const isWebPSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    if (isWebPSupported && extension === 'webp') {
        return `assets/images_webp/${filename}.webp`;
    } else {
        return `assets/images/${filename}.png`;
    }
}

// Unified Shooting Star System
class ShootingStarSystem {
    constructor() {
        this.container = null;
        this.backgroundStars = [];
        this.minigameStars = [];
        this.isMinigameActive = false;
        this.init();
    }
    
    init() {
        this.createContainer();
        this.startBackgroundStars();
    }
    
    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'shooting-star-container';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 150;
            overflow: visible;
        `;
        document.body.appendChild(this.container);
    }
    
    createShootingStar(type = 'background', options = {}) {
        const shootingStar = document.createElement('div');
        shootingStar.className = `shooting-star ${type}`;
        
        // Random starting position (off-screen)
        const startSide = Math.floor(Math.random() * 4);
        let startX, startY, endX, endY;
        
        // Define center area to avoid (where earth is)
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const earthRadius = 300;
        
        switch(startSide) {
            case 0: // Top
                startX = Math.random() * window.innerWidth;
                startY = -50;
                if (Math.abs(startX - centerX) < earthRadius) {
                    if (startX < centerX) {
                        endX = startX - (Math.random() * 200 + 100);
                    } else {
                        endX = startX + (Math.random() * 200 + 100);
                    }
                } else {
                    endX = startX + (Math.random() - 0.5) * window.innerWidth;
                }
                endY = window.innerHeight + 50;
                break;
            case 1: // Right
                startX = window.innerWidth + 50;
                startY = Math.random() * window.innerHeight;
                endX = startX - (Math.random() * window.innerWidth + 100);
                if (Math.abs(startY - centerY) < earthRadius) {
                    if (startY < centerY) {
                        endY = startY - (Math.random() * 200 + 100);
                    } else {
                        endY = startY + (Math.random() * 200 + 100);
                    }
                } else {
                    endY = startY + (Math.random() - 0.5) * window.innerHeight;
                }
                break;
            case 2: // Bottom
                startX = Math.random() * window.innerWidth;
                startY = window.innerHeight + 50;
                if (Math.abs(startX - centerX) < earthRadius) {
                    if (startX < centerX) {
                        endX = startX - (Math.random() * 200 + 100);
                    } else {
                        endX = startX + (Math.random() * 200 + 100);
                    }
                } else {
                    endX = startX + (Math.random() - 0.5) * window.innerWidth;
                }
                endY = -50;
                break;
            case 3: // Left
                startX = -50;
                startY = Math.random() * window.innerHeight;
                endX = startX + (Math.random() * window.innerWidth + 100);
                if (Math.abs(startY - centerY) < earthRadius) {
                    if (startY < centerY) {
                        endY = startY - (Math.random() * 200 + 100);
                    } else {
                        endY = startY + (Math.random() * 200 + 100);
                    }
                } else {
                    endY = startY + (Math.random() - 0.5) * window.innerHeight;
                }
                break;
        }
        
        // Validate coordinates to prevent NaN errors
        if (isNaN(startX) || isNaN(startY) || isNaN(endX) || isNaN(endY)) {
            console.warn('Invalid coordinates detected, skipping shooting star creation');
            return null;
        }
        
        // Calculate angle for rotation
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        // Random size variation
        const sizeVariation = Math.random() * 0.4 + 1.2;
        const width = Math.round(80 * sizeVariation);
        const height = Math.round(40 * sizeVariation);
        
        // Duration based on type
        const duration = type === 'minigame' ? 
            (Math.random() * 3 + 6) : // Slower for minigame
            (Math.random() * 2 + 4);  // Faster for background
        
        // Set initial position and rotation
        shootingStar.style.cssText = `
            position: absolute;
            left: ${startX}px;
            top: ${startY}px;
            width: ${width}px;
            height: ${height}px;
            background-image: url('${getImageUrl('shootingstar')}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            transform: rotate(${angle}deg);
            opacity: 0;
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
            cursor: pointer;
            pointer-events: auto;
            z-index: ${type === 'minigame' ? '160' : '155'};
            touch-action: manipulation;
            -webkit-tap-highlight-color: transparent;
        `;
        
        // Add event listeners based on type
        if (type === 'minigame') {
            shootingStar.addEventListener('click', this.handleMinigameStarClick.bind(this));
            shootingStar.addEventListener('touchstart', this.handleMinigameStarClick.bind(this), { passive: false });
        } else if (type === 'background') {
            shootingStar.addEventListener('click', this.handleBackgroundStarClick.bind(this));
            shootingStar.addEventListener('touchstart', this.handleBackgroundStarClick.bind(this), { passive: false });
        }
        
        // Add to container
        this.container.appendChild(shootingStar);
        
        // Create keyframe animation for movement
        const keyframes = [
            { left: `${startX}px`, top: `${startY}px`, opacity: 0 },
            { left: `${startX + (deltaX * 0.05)}px`, top: `${startY + (deltaY * 0.05)}px`, opacity: 1 },
            { left: `${endX}px`, top: `${endY}px`, opacity: 0.8 }
        ];
        
        const animation = shootingStar.animate(keyframes, {
            duration: duration * 1000,
            easing: 'linear',
            fill: 'forwards'
        });
        
        // Remove after animation completes
        animation.onfinish = () => {
            if (shootingStar.parentNode) {
                shootingStar.remove();
            }
            // Remove from tracking arrays
            if (type === 'minigame') {
                this.minigameStars = this.minigameStars.filter(star => star !== shootingStar);
            } else {
                this.backgroundStars = this.backgroundStars.filter(star => star !== shootingStar);
            }
        };
        
        // Track the star
        if (type === 'minigame') {
            this.minigameStars.push(shootingStar);
        } else {
            this.backgroundStars.push(shootingStar);
        }
        
        return shootingStar;
    }
    
    handleBackgroundStarClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🎯 Background star clicked!', {
            type: e.type,
            target: e.target,
            minigameActive: window.minigameActive,
            gameCooldown: window.gameCooldown,
            hasStartMinigame: typeof startMinigame === 'function',
            DeviceInfo: typeof DeviceInfo !== 'undefined' ? DeviceInfo : 'undefined'
        });
        
        // Start minigame if not active and not in cooldown
        if (typeof startMinigame === 'function' && !window.minigameActive && !window.gameCooldown) {
            console.log('🎮 Starting minigame from background star click');
            try {
                startMinigame();
            } catch (error) {
                console.error('❌ Error starting minigame:', error);
            }
        } else {
            console.log('❌ Cannot start minigame:', {
                startMinigameExists: typeof startMinigame === 'function',
                minigameActive: window.minigameActive,
                gameCooldown: window.gameCooldown
            });
        }
        
        // Remove the clicked star
        if (e.target.parentNode) {
            e.target.remove();
        }
    }
    
    handleMinigameStarClick(e) {
        e.preventDefault();
        
        if (window.minigameActive) {
            // Increment score if minigame is active
            if (typeof window.gameScore === 'number') {
                window.gameScore++;
                console.log('🎯 Minigame star clicked! Score:', window.gameScore);
                if (typeof updateScoreDisplay === 'function') {
                    updateScoreDisplay();
                }
            } else {
                console.warn('❌ gameScore is not a number:', window.gameScore);
            }
        } else if (!window.gameCooldown) {
            // Start minigame if not active and not in cooldown
            if (typeof startMinigame === 'function') {
                startMinigame();
            }
        }
        
        // Remove the clicked star
        if (e.target.parentNode) {
            e.target.remove();
        }
    }
    
    startBackgroundStars() {
        const createBackgroundStar = () => {
            if (!this.isMinigameActive) {
                this.createShootingStar('background');
            }
            const delay = Math.random() * 20000 + 10000;
            setTimeout(createBackgroundStar, delay);
        };
        
        // Create first background star after initial delay
        setTimeout(() => {
            if (!this.isMinigameActive) {
                this.createShootingStar('background');
            }
            createBackgroundStar();
        }, Math.random() * 8000 + 3000);
    }
    
    startMinigameStars() {
        this.isMinigameActive = true;
        this.clearMinigameStars();
        
        const createMinigameStar = () => {
            if (this.isMinigameActive) {
                this.createShootingStar('minigame');
                const delay = DeviceInfo.isMobile ? Math.random() * 200 + 150 : Math.random() * 100 + 50;
                setTimeout(createMinigameStar, delay);
            }
        };
        
        createMinigameStar();
    }
    
    stopMinigameStars() {
        this.isMinigameActive = false;
        this.clearMinigameStars();
    }
    
    clearMinigameStars() {
        this.minigameStars.forEach(star => {
            if (star.parentNode) {
                star.remove();
            }
        });
        this.minigameStars = [];
    }
    
    clearAllStars() {
        this.clearMinigameStars();
        this.backgroundStars.forEach(star => {
            if (star.parentNode) {
                star.remove();
            }
        });
        this.backgroundStars = [];
    }
}

// Global shooting star system instance
let shootingStarSystem;

// Initialize shooting stars
function initShootingStars() {
    if (!shootingStarSystem) {
        shootingStarSystem = new ShootingStarSystem();
        console.log('⭐ Shooting star system initialized');
    }
}

// Export functions for minigame use
window.createMinigameShootingStar = () => shootingStarSystem?.createShootingStar('minigame');
window.startMinigameStars = () => {
    if (!shootingStarSystem) {
        initShootingStars();
    }
    shootingStarSystem?.startMinigameStars();
};
window.stopMinigameStars = () => shootingStarSystem?.stopMinigameStars();
window.clearAllShootingStars = () => shootingStarSystem?.clearAllStars();
window.shootingStarSystem = shootingStarSystem;

// Initialize shooting stars when this module loads
initShootingStars();
