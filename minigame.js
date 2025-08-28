// Minigame functionality for Ryan Little's personal website
// Handles the shooting star minigame with mobile and desktop support

// Minigame variables
let minigameActive = false;
let gameScore = 0;
let gameTimer = null;
let countdownTimer = null;
let gameCooldown = false;

// Make variables globally accessible for shooting star system
window.minigameActive = minigameActive;
window.gameScore = gameScore;
window.gameCooldown = gameCooldown;

// Minigame Functions
function startMinigame() {
    minigameActive = true;
    gameScore = 0;
    
    // Update global variables
    window.minigameActive = minigameActive;
    window.gameScore = gameScore;
    
    console.log('🎮 Minigame started! Global score:', window.gameScore, 'Local score:', gameScore);
    
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

function showScoreDisplay() {
    const existingScore = document.querySelector('.minigame-score');
    if (existingScore) {
        existingScore.remove();
    }
    
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'minigame-score';
    // Mobile-specific styling
    const isMobileDevice = DeviceInfo.isMobile;
    const fontSize = isMobileDevice ? '1rem' : '1.25rem';
    const topPosition = isMobileDevice ? '50%' : '65%'; // Move score below timer on mobile
    
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

function updateScoreDisplay() {
    const scoreDisplay = document.querySelector('.minigame-score');
    if (scoreDisplay) {
        // Use the global gameScore to ensure consistency
        const currentScore = window.gameScore || gameScore;
        scoreDisplay.textContent = `Score: ${currentScore}`;
    }
}

function startCountdown() {
    const countdownDisplay = document.createElement('div');
    countdownDisplay.className = 'minigame-countdown';
    
    // Mobile-specific styling
    const isMobileDevice = DeviceInfo.isMobile;
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
    const instructionsTop = isMobileDevice ? '65%' : '30%'; // Move further down on mobile
    const instructionsText = isMobileDevice ? 'Tap as many shooting stars as you can!' : 'Click as many shooting stars as you can!';
    
    instructionsDisplay.style.cssText = `
        position: fixed;
        top: ${instructionsTop};
        left: 50%;
        transform: translate(-50%, -50%);
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
            
            // Start shooting star rain using unified system
            startShootingStarRain();
        }
    }
    
    showCountdown();
}

function startShootingStarRain() {
    // Use unified shooting star system
    if (typeof window.startMinigameStars === 'function') {
        window.startMinigameStars();
    }
    
    // Show large countdown timer over Earth
    showLargeCountdown();
}

function endMinigame() {
    minigameActive = false;
    gameCooldown = true;
    
    // Update global variables
    window.minigameActive = minigameActive;
    window.gameCooldown = gameCooldown;
    
    // Stop minigame stars using unified system
    if (typeof window.stopMinigameStars === 'function') {
        window.stopMinigameStars();
    }
    
    // Clear timers
    if (gameTimer) {
        clearTimeout(gameTimer);
        gameTimer = null;
    }
    
    // Start cooldown timer (10 seconds)
    startCooldownTimer();
    
    // Add animated transition effect
    showGameEndAnimation();
}

function fadeOutUIElements() {
    // Fade out satellites
    const satellites = document.querySelectorAll('.satellite');
    satellites.forEach(satellite => {
        satellite.style.transition = 'opacity 0.5s ease';
        satellite.style.opacity = '0.3';
        satellite.style.pointerEvents = 'none';
        satellite.style.zIndex = '1'; // Lower z-index during minigame
    });
    
    // Fade out your name and subtitle
    const nameElements = document.querySelectorAll('.title-line, .title-subtitle');
    nameElements.forEach(element => {
        // Store the current transform to preserve exact positioning
        const currentTransform = window.getComputedStyle(element).transform;
        element.dataset.originalTransform = currentTransform;
        
        // Use !important to override CSS animations
        element.style.setProperty('opacity', '0.3', 'important');
        element.style.setProperty('transition', 'opacity 0.5s ease', 'important');
        // Temporarily disable CSS animations
        element.style.animation = 'none';
        // Preserve exact positioning by maintaining current transform
        element.style.setProperty('transform', currentTransform, 'important');
        // Disable pointer events
        element.style.pointerEvents = 'none';
    });
    
    // Fade out social media buttons
    const socialButtons = document.querySelectorAll('.social-links a');
    socialButtons.forEach(button => {
        // Disable CSS animations first
        button.style.animation = 'none';
        button.style.webkitAnimation = 'none';
        button.style.mozAnimation = 'none';
        button.style.oAnimation = 'none';
        
        button.style.transition = 'opacity 0.5s ease';
        button.style.opacity = '0.3';
        button.style.pointerEvents = 'none';
        button.style.zIndex = '100'; // Keep above other elements but below minigame UI
        // Disable the link functionality
        button.style.cursor = 'default';
        button.setAttribute('data-original-href', button.href);
        button.removeAttribute('href');
    });
    
    // Fade out mobile link tree buttons
    const mobileButtons = document.querySelectorAll('.mobile-link-item');
    mobileButtons.forEach(button => {
        // Disable CSS animations first
        button.style.animation = 'none';
        button.style.webkitAnimation = 'none';
        button.style.mozAnimation = 'none';
        button.style.oAnimation = 'none';
        
        button.style.transition = 'opacity 0.5s ease';
        button.style.opacity = '0.3';
        button.style.pointerEvents = 'none';
        button.style.zIndex = '50'; // Keep above other elements but below minigame UI
        // Disable the link functionality
        button.style.cursor = 'default';
        button.setAttribute('data-original-href', button.href);
        button.removeAttribute('href');
    });
    
    // Lower z-index of Earth sprite during minigame
    const earthSprite = document.querySelector('.earth-sprite');
    if (earthSprite) {
        earthSprite.style.zIndex = '1';
        earthSprite.style.pointerEvents = 'none';
    }
}

function fadeInUIElementsStaggered() {
    // Fade in satellites first (0ms delay)
    const satellites = document.querySelectorAll('.satellite');
    satellites.forEach((satellite, index) => {
        setTimeout(() => {
            satellite.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            satellite.style.opacity = '1';
            satellite.style.pointerEvents = 'auto';
            satellite.style.zIndex = '20'; // Restore original z-index
            // Add a subtle bounce effect
            satellite.style.transform = 'scale(1.05)';
            setTimeout(() => {
                satellite.style.transform = 'scale(1)';
            }, 100);
        }, index * 100);
    });
    
    // Fade in name and subtitle with slight delay (300ms)
    // Preserve original positioning during minigame
    setTimeout(() => {
        const nameElements = document.querySelectorAll('.title-line, .title-subtitle');
        nameElements.forEach((element, index) => {
            setTimeout(() => {
                // Remove inline styles to let CSS take over
                element.style.removeProperty('opacity');
                element.style.removeProperty('transition');
                // Restore the exact original positioning without animation
                if (element.dataset.originalTransform) {
                    element.style.setProperty('transform', element.dataset.originalTransform, 'important');
                }
                // Force the final state immediately
                element.style.setProperty('opacity', '1', 'important');
                // Don't re-enable CSS animations that could affect positioning
                // element.style.animation = 'fadeInUp 1.5s ease-out forwards';
                // Add a subtle entrance effect for opacity only
                element.style.transition = 'opacity 0.8s ease';
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
                button.style.zIndex = '200'; // Restore original z-index
                button.style.cursor = 'pointer';
                // Restore the link functionality
                if (button.getAttribute('data-original-href')) {
                    button.href = button.getAttribute('data-original-href');
                    button.removeAttribute('data-original-href');
                }
                // Add a subtle entrance effect
                button.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 150);
            }, index * 100);
        });
    }, 600);
    
    // Fade in mobile link tree buttons last (900ms)
    setTimeout(() => {
        const mobileButtons = document.querySelectorAll('.mobile-link-item');
        mobileButtons.forEach((button, index) => {
            setTimeout(() => {
                button.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                button.style.opacity = '1';
                button.style.pointerEvents = 'auto';
                button.style.zIndex = '10'; // Restore original z-index
                button.style.cursor = 'pointer';
                // Restore the link functionality
                if (button.getAttribute('data-original-href')) {
                    button.href = button.getAttribute('data-original-href');
                    button.removeAttribute('data-original-href');
                }
                // Re-enable CSS animations
                button.style.animation = '';
                button.style.webkitAnimation = '';
                button.style.mozAnimation = '';
                button.style.oAnimation = '';
                // Add a subtle entrance effect
                button.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 150);
            }, index * 100);
        });
    }, 900);
    
    // Restore Earth sprite z-index
    const earthSprite = document.querySelector('.earth-sprite');
    if (earthSprite) {
        earthSprite.style.zIndex = '5';
        earthSprite.style.pointerEvents = 'auto';
    }
}

function showLargeCountdown() {
    // Remove existing countdown display
    const existingCountdown = document.querySelector('.minigame-countdown');
    if (existingCountdown) {
        existingCountdown.remove();
    }
    
    const countdownDisplay = document.createElement('div');
    countdownDisplay.className = 'minigame-countdown';
    
    // Mobile-specific positioning
    const isMobileDevice = DeviceInfo.isMobile;
    const countdownTop = isMobileDevice ? '40%' : '50%'; // Position above center on mobile
    const countdownFontSize = isMobileDevice ? '4rem' : '6rem'; // Slightly smaller on mobile
    
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
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(countdownDisplay);
    
    // Game duration - 20 seconds on both mobile and desktop
    let timeLeft = 20; // 20 seconds on both mobile and desktop
    
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

function startCooldownTimer() {
    const scoreDisplay = document.querySelector('.minigame-score');
    if (!scoreDisplay) return;
    
    // Create cooldown display under the score
    const cooldownDisplay = document.createElement('div');
    cooldownDisplay.className = 'minigame-cooldown';
    
    // Mobile-specific positioning for cooldown
    const isMobileDevice = DeviceInfo.isMobile;
    const cooldownTop = isMobileDevice ? '35%' : '38%';
    
    cooldownDisplay.style.cssText = `
        position: fixed;
        top: ${cooldownTop};
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
    
    let timeLeft = 10;
    
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
            window.gameCooldown = false;
            
            // Reset shooting star system to allow new background stars
            if (typeof window.clearAllShootingStars === 'function') {
                window.clearAllShootingStars();
            }
            
            // Restart background star creation after cooldown
            if (window.shootingStarSystem && typeof window.shootingStarSystem.startBackgroundStars === 'function') {
                setTimeout(() => {
                    window.shootingStarSystem.startBackgroundStars();
                }, 1000);
            }
            
            // Start fade out sequence after 3 seconds
            setTimeout(() => {
                startFadeOutSequence();
            }, 3000);
        }
    }
    
    // Start the cooldown countdown
    updateCooldown();
}

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

// Function to fade out score and cooldown text, then reset webpage
function startFadeOutSequence() {
    const scoreDisplay = document.querySelector('.minigame-score');
    const cooldownDisplay = document.querySelector('.minigame-cooldown');
    
    if (scoreDisplay) {
        scoreDisplay.style.transition = 'opacity 2s ease-out';
        scoreDisplay.style.opacity = '0';
    }
    
    if (cooldownDisplay) {
        cooldownDisplay.style.transition = 'opacity 2s ease-out';
        cooldownDisplay.style.opacity = '0';
    }
    
    // After fade out completes, reset the webpage state (no page reload)
    setTimeout(() => {
        resetWebpage();
    }, 2000);
}

// Function to fully reset the webpage to initial state (NO page reload)
function resetWebpage() {
    // Remove all minigame-related elements
    const minigameElements = document.querySelectorAll('.minigame-score, .minigame-cooldown, .minigame-countdown, .minigame-instructions');
    minigameElements.forEach(element => {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    });
    
    // Reset minigame state
    minigameActive = false;
    gameCooldown = false;
    gameScore = 0;
    
    // Update global variables
    window.minigameActive = minigameActive;
    window.gameCooldown = gameCooldown;
    window.gameScore = gameScore;
    
    // Clear any remaining timers
    if (gameTimer) {
        clearTimeout(gameTimer);
        gameTimer = null;
    }
    
    // Reset all UI elements to full opacity and restore z-index
    const satellites = document.querySelectorAll('.satellite');
    satellites.forEach(satellite => {
        satellite.style.opacity = '1';
        satellite.style.pointerEvents = 'auto';
        satellite.style.zIndex = '20';
        satellite.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    const nameElements = document.querySelectorAll('.title-line, .title-subtitle');
    nameElements.forEach(element => {
        element.style.removeProperty('opacity');
        element.style.removeProperty('transition');
        element.style.removeProperty('z-index');
        element.style.removeProperty('animation');
        element.style.pointerEvents = 'auto';
        // Don't re-apply fadeInUp animation to prevent position changes
    });
    
    const socialButtons = document.querySelectorAll('.social-links a');
    socialButtons.forEach(button => {
        button.style.opacity = '1';
        button.style.pointerEvents = 'auto';
        button.style.zIndex = '200';
        button.style.transition = 'all 0.3s ease';
        button.style.cursor = 'pointer';
        // Restore the link functionality
        if (button.getAttribute('data-original-href')) {
            button.href = button.getAttribute('data-original-href');
            button.removeAttribute('data-original-href');
        }
    });
    
    const mobileButtons = document.querySelectorAll('.mobile-link-item');
    mobileButtons.forEach(button => {
        // Only restore if not already visible to prevent double animation
        if (button.style.opacity !== '1') {
            button.style.opacity = '1';
            button.style.transition = 'opacity 0.3s ease';
        }
        button.style.pointerEvents = 'auto';
        button.style.zIndex = '10';
        button.style.cursor = 'pointer';
        // Restore the link functionality
        if (button.getAttribute('data-original-href')) {
            button.href = button.getAttribute('data-original-href');
            button.removeAttribute('data-original-href');
        }
    });
    
    // Restore Earth sprite with proper layering
    const earthSprite = document.querySelector('.earth-sprite');
    if (earthSprite) {
        earthSprite.style.zIndex = '5'; // Above background (z-index: 2) and stars (z-index: 1)
        earthSprite.style.pointerEvents = 'auto';
    }
    
    // Complete reset without page refresh
    console.log('🎮 Minigame reset complete - ready for new game!');
}

// Initialize mobile minigame after all functions and variables are defined
function initMobileMinigame() {
    // Minigame can only be started by clicking shooting stars after cooldown
    console.log('🎮 Mobile minigame ready - click shooting stars to start!');
}

initMobileMinigame();
