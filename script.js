// Cross-browser compatible personal website functionality
// Includes mobile support and Edge compatibility fixes

// Browser detection and compatibility
const isEdge = navigator.userAgent.includes('Edge') || navigator.userAgent.includes('Edg');
const isFirefox = navigator.userAgent.includes('Firefox');
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

// Cross-browser event handling
const addEvent = (element, event, handler) => {
    if (element.addEventListener) {
        element.addEventListener(event, handler, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + event, handler);
    }
};

// Cross-browser CSS property setting
const setCSSProperty = (element, property, value) => {
    if (element.style.setProperty) {
        element.style.setProperty(property, value);
    } else {
        element.style[property] = value;
    }
};

// Performance optimization for animations
const supportsTransform3d = (() => {
    const el = document.createElement('div');
    el.style.transform = 'translate3d(0,0,0)';
    return el.style.transform !== '';
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWebsite);
} else {
    initializeWebsite();
}

function initializeWebsite() {
    // Initialize stars with browser-specific optimizations
    generateRandomStars();
    
    // Initialize satellite movement
    initSatelliteMovement();
    
    // Initialize shooting stars
    initShootingStars();
    
    // Initialize mobile minigame button
    initMobileMinigame();
    
    // Add loading animation
    document.body.classList.add('loaded');
    
    // Add mobile-specific optimizations
    if (isMobile) {
        optimizeForMobile();
    }
    
    // Add Edge-specific fixes
    if (isEdge) {
        applyEdgeFixes();
    }
}

// Initialize mobile minigame button
function initMobileMinigame() {
    const mobileMinigameButton = document.querySelector('.mobile-link-item.minigame');
    if (mobileMinigameButton) {
        mobileMinigameButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (!minigameActive && !gameCooldown) {
                startMinigame();
            }
        });
    }
}

// Mobile optimizations
function optimizeForMobile() {
    // Reduce animation complexity on mobile
    const stars = document.querySelector('.stars');
    if (stars) {
        stars.style.animationDuration = '60s';
        stars.style.webkitAnimationDuration = '60s';
        stars.style.mozAnimationDuration = '60s';
        stars.style.oAnimationDuration = '60s';
    }
    
    // Optimize touch interactions
    const satellites = document.querySelectorAll('.satellite');
    satellites.forEach(satellite => {
        satellite.style.touchAction = 'manipulation';
        satellite.style.webkitTouchCallout = 'none';
        satellite.style.webkitUserSelect = 'none';
    });
}

// Edge-specific compatibility fixes
function applyEdgeFixes() {
    // Fix for Edge star rendering
    const stars = document.querySelector('.stars');
    if (stars) {
        stars.style.backgroundSize = '150px 150px, 150px 150px, 150px 150px, 150px 150px, 150px 150px';
    }
    
    // Fix for Edge transform issues
    const elements = document.querySelectorAll('.satellite, .hero-background, .stars');
    elements.forEach(el => {
        el.style.msTransform = 'translateZ(0)';
        el.style.transform = 'translateZ(0)';
    });
}

// Minigame variables
let minigameActive = false;
let gameScore = 0;
let gameTimer = null;
let countdownTimer = null;
let shootingStarRain = null;
let gameCooldown = false;
let shouldCreateStars = false;

// Generate Random Star Field with cross-browser compatibility
function generateRandomStars() {
    const stars = document.querySelector('.stars');
    if (!stars) return;
    
    // Clear existing stars
    stars.style.backgroundImage = '';
    
    // Browser-specific star generation
    let starCSS = '';
    const numStars = isMobile ? 120 : 180; // Reduce stars on mobile for performance
    
    for (let i = 0; i < numStars; i++) {
        // More random positioning with slight clustering avoidance
        let x, y;
        if (Math.random() < 0.7) {
            // 70% of stars use standard random distribution
            x = Math.random() * 100;
            y = Math.random() * 100;
        } else {
            // 30% of stars use more varied distribution for randomness
            x = (Math.random() * 0.8 + 0.1) * 100;
            y = (Math.random() * 0.8 + 0.1) * 100;
        }
        
        // More varied star sizes with browser compatibility
        const sizeVariation = Math.random();
        let size;
        if (sizeVariation < 0.6) {
            size = Math.random() * 1.5 + 0.3;
        } else if (sizeVariation < 0.85) {
            size = Math.random() * 1.5 + 1.8;
        } else {
            size = Math.random() * 2 + 3.3;
        }
        
        // More varied brightness for natural look
        const brightness = Math.random() * 0.9 + 0.1;
        
        // Use simpler gradient for better browser compatibility
        if (isEdge || isFirefox) {
            starCSS += `radial-gradient(${size}px ${size}px at ${x}% ${y}%, rgba(255,255,255,${brightness}) 0%, transparent 100%),`;
        } else {
            starCSS += `radial-gradient(${size}px ${size}px at ${x}% ${y}%, rgba(255,255,255,${brightness}) 0%, transparent 100%),`;
        }
    }
    
    // Remove trailing comma and set background
    starCSS = starCSS.slice(0, -1);
    
    // Set background with fallback
    try {
        stars.style.backgroundImage = starCSS;
    } catch (e) {
        // Fallback for older browsers
        stars.style.backgroundImage = 'radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.8) 0%, transparent 100%)';
    }
}

// Initialize dynamic satellite movement
function initSatelliteMovement() {
    const satellites = document.querySelectorAll('.satellite');
    
    // Define distance ranges for each satellite (largest possible spread, different speeds)
    const distanceRanges = [
        { min: 280, max: 410, current: 345, speed: 0.3 },
        { min: 280, max: 410, current: 345, speed: 0.4 },
        { min: 280, max: 410, current: 345, speed: 0.5 },
        { min: 280, max: 400, current: 345, speed: 0.6 }
    ];
    
    // Set initial random distances
    satellites.forEach((satellite, index) => {
        const range = distanceRanges[index];
        range.current = Math.random() * (range.max - range.min) + range.min;
        
        // Set initial CSS variable
        document.documentElement.style.setProperty(
            `--satellite${index + 1}-distance`, 
            `${range.current}px`
        );
        
        // Determine initial movement direction
        const distanceToMin = range.current - range.min;
        const distanceToMax = range.max - range.current;
        range.direction = distanceToMin < distanceToMax ? 1 : -1;
    });
    
    // Animate satellite distances
    function animateSatellites() {
        satellites.forEach((satellite, index) => {
            const range = distanceRanges[index];
            
            range.current += range.direction * range.speed;
            
            // Check if we hit a boundary
            if (range.current >= range.max) {
                range.current = range.max;
                range.direction = -1;
            } else if (range.current <= range.min) {
                range.current = range.min;
                range.direction = 1;
            }
            
            // Update CSS variable
            document.documentElement.style.setProperty(
                `--satellite${index + 1}-distance`, 
                `${range.current}px`
            );
        });
        
        requestAnimationFrame(animateSatellites);
    }
    
    // Start the animation
    animateSatellites();
}

// Shooting Stars Animation
function initShootingStars() {
    // Create shooting star container
    const shootingStarContainer = document.createElement('div');
    shootingStarContainer.className = 'shooting-star-container';
    shootingStarContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 15;
        overflow: visible;
    `;
    document.body.appendChild(shootingStarContainer);
    
    // Function to create a regular shooting star (non-clickable)
    function createShootingStar() {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';
        
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
        
        // Calculate angle for rotation
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        // Random size variation
        const sizeVariation = Math.random() * 0.4 + 1.2;
        const width = Math.round(80 * sizeVariation);
        const height = Math.round(40 * sizeVariation);
        
        // Slower movement for regular stars
        const duration = Math.random() * 2 + 4;
        
        // Set initial position and rotation
        shootingStar.style.cssText = `
            position: absolute;
            left: ${startX}px;
            top: ${startY}px;
            width: ${width}px;
            height: ${height}px;
            background-image: url('assets/images/shootingstar.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            transform: rotate(${angle}deg);
            opacity: 0;
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
            cursor: pointer;
            pointer-events: auto;
            z-index: 15;
        `;
        
        // Add click event for minigame discovery
        shootingStar.addEventListener('click', handleShootingStarClick);
        
        // Add to container
        shootingStarContainer.appendChild(shootingStar);
        
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
        };
    }
    
    // Function to create a clickable shooting star for minigame
    function createClickableShootingStar() {
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star clickable';
        
        // Random starting position (off-screen)
        const startSide = Math.floor(Math.random() * 4);
        let startX, startY, endX, endY;
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const earthRadius = 300;
        
        switch(startSide) {
            case 0: // Top
                startX = Math.random() * window.innerWidth;
                startY = -50;
                if (Math.abs(startX - centerX) < earthRadius) {
                    endX = startX < centerX ? startX - (Math.random() * 200 + 100) : startX + (Math.random() * 200 + 100);
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
                    endY = startY < centerY ? startY - (Math.random() * 200 + 100) : startY + (Math.random() * 200 + 100);
                } else {
                    endY = startY + (Math.random() - 0.5) * window.innerHeight;
                }
                break;
            case 2: // Bottom
                startX = Math.random() * window.innerWidth;
                startY = window.innerHeight + 50;
                if (Math.abs(startX - centerX) < earthRadius) {
                    endX = startX < centerX ? startX - (Math.random() * 200 + 100) : startX + (Math.random() * 200 + 100);
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
                    endY = startY < centerY ? startY - (Math.random() * 200 + 100) : startY + (Math.random() * 200 + 100);
                } else {
                    endY = startY + (Math.random() - 0.5) * window.innerHeight;
                }
                break;
        }
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        const sizeVariation = Math.random() * 0.4 + 1.2;
        const width = Math.round(80 * sizeVariation);
        const height = Math.round(40 * sizeVariation);
        
        // Much slower movement for minigame
        const duration = Math.random() * 3 + 6;
        
        shootingStar.style.cssText = `
            position: absolute;
            left: ${startX}px;
            top: ${startY}px;
            width: ${width}px;
            height: ${height}px;
            background-image: url('assets/images/shootingstar.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            transform: rotate(${angle}deg);
            opacity: 0;
            filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.8));
            cursor: pointer;
            pointer-events: auto;
            z-index: 16;
        `;
        
        // Add click and touch events for minigame (mobile support)
        shootingStar.addEventListener('click', handleShootingStarClick);
        shootingStar.addEventListener('touchstart', handleShootingStarClick, { passive: false });
        
        // Mobile-specific styling
        if (window.innerWidth <= 768) {
            shootingStar.style.cursor = 'pointer';
            shootingStar.style.touchAction = 'manipulation';
            shootingStar.style.webkitTapHighlightColor = 'transparent';
        }
        
        shootingStarContainer.appendChild(shootingStar);
        
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
        
        animation.onfinish = () => {
            if (shootingStar.parentNode) {
                shootingStar.remove();
            }
        };
    }
    
    // Function to handle shooting star clicks
    function handleShootingStarClick(e) {
        e.preventDefault();
        
        if (!minigameActive && !gameCooldown) {
            startMinigame();
        } else if (minigameActive) {
            gameScore++;
            updateScoreDisplay();
        }
        
        // Remove the clicked star
        if (e.target.parentNode) {
            e.target.remove();
        }
    }
    
    // Function to start the minigame
    function startMinigame() {
        minigameActive = true;
        gameScore = 0;
        
        // Hide any existing score display from previous game
        const existingScore = document.querySelector('.minigame-score');
        if (existingScore) {
            existingScore.remove();
        }
        
        // Hide any existing cooldown display
        const existingCooldown = document.querySelector('.minigame-cooldown');
        if (existingCooldown) {
            existingCooldown.remove();
        }
        
        // Fade out UI elements during minigame
        fadeOutUIElements();
        
        // Show score display
        showScoreDisplay();
        updateScoreDisplay();
        
        // Start countdown
        startCountdown();
    }
    
    // Function to show score display
    function showScoreDisplay() {
        const existingScore = document.querySelector('.minigame-score');
        if (existingScore) {
            existingScore.remove();
        }
        
        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'minigame-score';
        // Mobile-specific styling
        const isMobileDevice = window.innerWidth <= 768;
        const fontSize = isMobileDevice ? '1rem' : '1.25rem';
        const topPosition = isMobileDevice ? '25%' : '35%';
        
        scoreDisplay.style.cssText = `
            position: fixed;
            top: ${topPosition};
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-family: 'Inter', sans-serif;
            font-size: ${fontSize};
            font-weight: 500;
            text-align: center;
            z-index: 1000;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
            opacity: 0;
            transition: opacity 0.5s ease;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
        `;
        scoreDisplay.textContent = 'Score: 0';
        
        document.body.appendChild(scoreDisplay);
        
        // Fade in
        setTimeout(() => {
            scoreDisplay.style.opacity = '1';
        }, 100);
    }
    
    // Function to update score display
    function updateScoreDisplay() {
        const scoreDisplay = document.querySelector('.minigame-score');
        if (scoreDisplay) {
            scoreDisplay.textContent = `Score: ${gameScore}`;
        }
    }
    
    // Function to start countdown
    function startCountdown() {
        const countdownDisplay = document.createElement('div');
        countdownDisplay.className = 'minigame-countdown';
        
        // Mobile-specific styling
        const isMobileDevice = window.innerWidth <= 768;
        const countdownFontSize = isMobileDevice ? '3rem' : '4rem';
        const countdownTop = isMobileDevice ? '40%' : '50%';
        
        countdownDisplay.style.cssText = `
            position: fixed;
            top: ${countdownTop};
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-family: 'Inter', sans-serif;
            font-size: ${countdownFontSize};
            font-weight: 700;
            text-align: center;
            z-index: 1001;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.8);
            opacity: 0;
            transition: opacity 0.3s ease;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
        `;
        
        document.body.appendChild(countdownDisplay);
        
        // Create instructions display
        const instructionsDisplay = document.createElement('div');
        instructionsDisplay.className = 'minigame-instructions';
        
        // Mobile-specific styling for instructions
        const instructionsFontSize = isMobileDevice ? '1.2rem' : '1.5rem';
        const instructionsTop = isMobileDevice ? '25%' : '30%';
        const instructionsText = isMobileDevice ? 'Tap as many shooting stars as you can!' : 'Click as many shooting stars as you can!';
        
        instructionsDisplay.style.cssText = `
            position: fixed;
            top: ${instructionsTop};
            left: 50%;
            transform: translateX(-50%);
            color: #ffa500;
            font-family: 'Inter', sans-serif;
            font-size: ${instructionsFontSize};
            font-weight: 400;
            text-align: center;
            z-index: 1001;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 165, 0, 0.6), 0 0 40px rgba(255, 165, 0, 0.4);
            opacity: 0;
            transition: opacity 0.3s ease;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
        `;
        instructionsDisplay.textContent = instructionsText;
        document.body.appendChild(instructionsDisplay);
        
        let countdown = 3;
        
        function showCountdown() {
            if (countdown > 0) {
                countdownDisplay.textContent = countdown;
                countdownDisplay.style.opacity = '1';
                
                // Show instructions during countdown
                instructionsDisplay.style.opacity = '1';
                
                setTimeout(() => {
                    countdownDisplay.style.opacity = '0';
                    countdown--;
                    setTimeout(showCountdown, 500);
                }, 500);
            } else {
                countdownDisplay.textContent = 'GO!';
                countdownDisplay.style.opacity = '1';
                
                // Hide instructions when game starts
                instructionsDisplay.style.opacity = '0';
                
                setTimeout(() => {
                    countdownDisplay.style.opacity = '0';
                    // Remove both displays
                    setTimeout(() => {
                        if (countdownDisplay.parentNode) {
                            countdownDisplay.remove();
                        }
                        if (instructionsDisplay.parentNode) {
                            instructionsDisplay.remove();
                        }
                    }, 300);
                }, 1000);
                
                // Start shooting star rain
                startShootingStarRain();
            }
        }
        
        showCountdown();
    }
    
    // Function to start shooting star rain
    function startShootingStarRain() {
        // Show large countdown timer over Earth
        showLargeCountdown();
        
        // Enable star creation
        shouldCreateStars = true;
        
        // Create many clickable shooting stars
        const createStar = () => {
            if (minigameActive && shouldCreateStars) {
                createClickableShootingStar();
                setTimeout(createStar, Math.random() * 100 + 50);
            }
        };
        
        createStar();
        
        // Set timer for 20 seconds
        gameTimer = setTimeout(() => {
            shouldCreateStars = false;
            endMinigame();
        }, 20000);
    }
    
    // Function to end minigame
    function endMinigame() {
        minigameActive = false;
        gameCooldown = true;
        
        // Quickly fade out all shooting stars
        fadeOutAllShootingStars();
        
        // Clear timers
        if (gameTimer) {
            clearTimeout(gameTimer);
            gameTimer = null;
        }
        
        // Start cooldown timer (15 seconds)
        startCooldownTimer();
        
        // Add animated transition effect
        showGameEndAnimation();
    }
    
    // Function to start and display cooldown timer
    function startCooldownTimer() {
        const scoreDisplay = document.querySelector('.minigame-score');
        if (!scoreDisplay) return;
        
        // Create cooldown display under the score
        const cooldownDisplay = document.createElement('div');
        cooldownDisplay.className = 'minigame-cooldown';
        cooldownDisplay.style.cssText = `
            position: fixed;
            top: 38%;
            left: 50%;
            transform: translateX(-50%);
            color: rgba(255, 255, 255, 0.8);
            font-family: 'Inter', sans-serif;
            font-size: 1rem;
            font-weight: 400;
            text-align: center;
            z-index: 1000;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        document.body.appendChild(cooldownDisplay);
        
        // Insert cooldown display after the score
        scoreDisplay.parentNode.insertBefore(cooldownDisplay, scoreDisplay.nextSibling);
        
        let timeLeft = 15;
        
        function updateCooldown() {
            if (timeLeft > 0) {
                cooldownDisplay.textContent = `Cooldown: ${timeLeft}s`;
                cooldownDisplay.style.opacity = '1';
                timeLeft--;
                setTimeout(updateCooldown, 1000);
            } else {
                // Cooldown finished - show play again message
                cooldownDisplay.textContent = 'Click another to play again!';
                cooldownDisplay.style.color = 'rgba(255, 255, 255, 1)';
                cooldownDisplay.style.fontWeight = '500';
                
                // End cooldown
                gameCooldown = false;
                shouldCreateStars = false;
            }
        }
        
        // Start the cooldown countdown
        updateCooldown();
    }
    
    // Function to show animated game end transition
    function showGameEndAnimation() {
        // Create a flash effect
        const flashOverlay = document.createElement('div');
        flashOverlay.className = 'game-end-flash';
        flashOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle at center, rgba(255,255,255,0.3) 0%, transparent 70%);
            z-index: 1000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.4s ease;
        `;
        document.body.appendChild(flashOverlay);
        
        // Flash effect sequence
        setTimeout(() => {
            flashOverlay.style.opacity = '1';
            
            setTimeout(() => {
                flashOverlay.style.opacity = '0';
                
                setTimeout(() => {
                    // Remove flash overlay
                    if (flashOverlay.parentNode) {
                        flashOverlay.remove();
                    }
                    
                    // Now fade in UI elements with staggered timing
                    fadeInUIElementsStaggered();
                }, 400);
            }, 200);
        }, 100);
    }
    
    // Function to fade in UI elements with staggered animation
    function fadeInUIElementsStaggered() {
        // Fade in satellites first (0ms delay)
        const satellites = document.querySelectorAll('.satellite');
        satellites.forEach((satellite, index) => {
            setTimeout(() => {
                satellite.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                satellite.style.opacity = '1';
                satellite.style.pointerEvents = 'auto';
                // Add a subtle bounce effect
                satellite.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    satellite.style.transform = 'scale(1)';
                }, 100);
            }, index * 100);
        });
        
        // Fade in name and subtitle with slight delay (300ms)
        setTimeout(() => {
            const nameElements = document.querySelectorAll('.title-line, .title-subtitle');
            nameElements.forEach((element, index) => {
                setTimeout(() => {
                    // Remove inline styles to let CSS take over
                    element.style.removeProperty('opacity');
                    element.style.removeProperty('transition');
                    // Force the final state immediately
                    element.style.setProperty('opacity', '1', 'important');
                    element.style.setProperty('transform', 'translateY(0)', 'important');
                    // Re-enable CSS animations with proper values
                    element.style.animation = 'fadeInUp 1.5s ease-out forwards';
                    // Add a subtle entrance effect
                    element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                }, index * 150);
            });
        }, 300);
        
        // Fade in social media buttons last (600ms)
        setTimeout(() => {
            const socialButtons = document.querySelectorAll('.social-links a');
            socialButtons.forEach((button, index) => {
                setTimeout(() => {
                    button.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    button.style.opacity = '1';
                    button.style.pointerEvents = 'auto';
                    // Add a subtle entrance effect
                    button.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        button.style.transform = 'scale(1)';
                    }, 150);
                }, index * 100);
            });
        }, 600);
    }
    
    // Function to quickly fade out all shooting stars
    function fadeOutAllShootingStars() {
        const shootingStars = document.querySelectorAll('.shooting-star');
        
        shootingStars.forEach(star => {
            // Quick fade out
            star.style.transition = 'opacity 0.3s ease';
            star.style.opacity = '0';
            
            // Remove from DOM after fade
            setTimeout(() => {
                if (star.parentNode) {
                    star.remove();
                }
            }, 300);
        });
    }
    
    // Function to fade out UI elements during minigame
    function fadeOutUIElements() {
        // Fade out satellites
        const satellites = document.querySelectorAll('.satellite');
        satellites.forEach(satellite => {
            satellite.style.transition = 'opacity 0.5s ease';
            satellite.style.opacity = '0.3';
            satellite.style.pointerEvents = 'none';
        });
        
        // Fade out your name and subtitle
        const nameElements = document.querySelectorAll('.title-line, .title-subtitle');
        nameElements.forEach(element => {
            // Use !important to override CSS animations
            element.style.setProperty('opacity', '0.3', 'important');
            element.style.setProperty('transition', 'opacity 0.5s ease', 'important');
            // Temporarily disable CSS animations
            element.style.animation = 'none';
        });
        
        // Fade out social media buttons
        const socialButtons = document.querySelectorAll('.social-links a');
        socialButtons.forEach(button => {
            button.style.transition = 'opacity 0.5s ease';
            button.style.opacity = '0.3';
            button.style.pointerEvents = 'none';
        });
    }
    
    // Function to show large countdown timer over Earth
    function showLargeCountdown() {
        // Remove existing countdown display
        const existingCountdown = document.querySelector('.minigame-countdown');
        if (existingCountdown) {
            existingCountdown.remove();
        }
        
        const countdownDisplay = document.createElement('div');
        countdownDisplay.className = 'minigame-countdown';
        countdownDisplay.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-family: 'Inter', sans-serif;
            font-size: 6rem;
            font-weight: 700;
            text-align: center;
            z-index: 1001;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.8);
            opacity: 0;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(countdownDisplay);
        
        let timeLeft = 20;
        
        function updateCountdown() {
            if (timeLeft > 0) {
                countdownDisplay.textContent = timeLeft;
                countdownDisplay.style.opacity = '1';
                
                // Turn red in last 5 seconds
                if (timeLeft <= 5) {
                    countdownDisplay.style.color = '#ff4444';
                    countdownDisplay.style.textShadow = '0 4px 8px rgba(255, 68, 68, 0.8)';
                }
                
                timeLeft--;
                setTimeout(updateCountdown, 1000);
            } else {
                // Fade out countdown
                countdownDisplay.style.opacity = '0';
                setTimeout(() => {
                    if (countdownDisplay.parentNode) {
                        countdownDisplay.remove();
                    }
                }, 300);
                
                // End the minigame when countdown reaches zero
                if (minigameActive) {
                    setTimeout(() => {
                        endMinigame();
                    }, 100);
                }
            }
        }
        
        updateCountdown();
    }
    
    // Function to schedule next shooting star
    function scheduleNextShootingStar() {
        const delay = Math.random() * 20000 + 10000;
        
        setTimeout(() => {
            if (!minigameActive) {
                createShootingStar();
            }
            scheduleNextShootingStar();
        }, delay);
    }
    
    // Create first shooting star after initial delay
    setTimeout(() => {
        if (!minigameActive) {
            createShootingStar();
        }
        scheduleNextShootingStar();
    }, Math.random() * 8000 + 3000);
}
