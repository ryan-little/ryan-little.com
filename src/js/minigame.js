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
    // Check if DeviceInfo is available
    if (typeof DeviceInfo === 'undefined') {
        console.error('❌ DeviceInfo not available, cannot start minigame');
        return;
    }
    
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
    
    // Fade out UI elements during minigame - use simplified reverse satellite animation
    fadeOutUIElementsSimplified();
    
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
    const topPosition = isMobileDevice ? '50%' : '65%';
    
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

// Simplified fade out function that uses reverse satellite animation
function fadeOutUIElementsSimplified() {
    console.log('🎮 Starting simplified minigame fade out...');
    console.log('🎮 DeviceInfo.isMobile:', typeof DeviceInfo !== 'undefined' ? DeviceInfo.isMobile : 'undefined');
    
    // Use the reverse satellite animation from desktop.js
    if (typeof reverseSatelliteFadeIn === 'function') {
        reverseSatelliteFadeIn();
    } else {
        console.warn('⚠️ reverseSatelliteFadeIn function not available, falling back to basic fade');
        // Fallback: basic satellite fade
        const satellites = document.querySelectorAll('.satellite');
        satellites.forEach(satellite => {
            satellite.style.transition = 'opacity 0.5s ease';
            satellite.style.opacity = '0.3';
            satellite.style.pointerEvents = 'none';
        });
    }
    
    // Dim your name and subtitle during minigame
    const nameElements = document.querySelectorAll('.title-line, .title-subtitle');
    nameElements.forEach(element => {
        element.style.setProperty('opacity', '0.3', 'important');
        element.style.setProperty('transition', 'opacity 0.5s ease', 'important');
        element.style.pointerEvents = 'none';
        console.log('🎮 Title/subtitle faded out for minigame:', element.textContent);
    });
    
    // Fade out social media buttons
    const socialButtons = document.querySelectorAll('.social-links a');
    socialButtons.forEach(button => {
        button.style.transition = 'opacity 0.5s ease';
        button.style.opacity = '0.3';
        button.style.pointerEvents = 'none';
        button.style.cursor = 'default';
        button.setAttribute('data-original-href', button.href);
        button.removeAttribute('href');
    });
    
    // Fade out mobile link tree buttons with staggered timing (like satellites)
    const mobileButtons = document.querySelectorAll('.mobile-link-item');
    console.log(`📱 Found ${mobileButtons.length} mobile buttons to fade out`);
    
    if (mobileButtons.length > 0) {
        mobileButtons.forEach((button, index) => {
            const delay = (mobileButtons.length - 1 - index) * 200; // 0ms, 200ms, 400ms, 600ms (reverse order)
            
            setTimeout(() => {
                // Disable CSS animations that might override opacity
                button.style.animation = 'none';
                button.style.webkitAnimation = 'none';
                button.style.mozAnimation = 'none';
                button.style.oAnimation = 'none';
                
                button.style.transition = 'opacity 0.5s ease';
                button.style.opacity = '0.3'; // Ghost-like appearance during minigame (like satellites)
                button.style.pointerEvents = 'none';
                button.style.cursor = 'default';
                button.setAttribute('data-original-href', button.href);
                button.removeAttribute('href');
                console.log(`📱 Mobile button ${index + 1} faded out for minigame (opacity: ${button.style.opacity})`);
            }, delay);
        });
    } else {
        console.warn('⚠️ No mobile buttons found to fade out');
    }
    
    // Store original Earth sprite positioning and lower z-index during minigame
    const earthSprite = document.querySelector('.earth-sprite');
    if (earthSprite) {
        // Store original positioning for exact restoration
        const computedStyle = window.getComputedStyle(earthSprite);
        earthSprite.dataset.originalTop = computedStyle.top;
        earthSprite.dataset.originalLeft = computedStyle.left;
        earthSprite.dataset.originalTransform = computedStyle.transform;
        earthSprite.dataset.originalPosition = computedStyle.position;
        earthSprite.dataset.originalWidth = computedStyle.width;
        earthSprite.dataset.originalHeight = computedStyle.height;
        
        earthSprite.style.zIndex = '1';
        earthSprite.style.pointerEvents = 'none';
        console.log('🌍 Stored original Earth sprite positioning for restoration');
    }
}

function fadeOutUIElements() {
    // Make satellites ghost-like during minigame - keep them spinning in orbit
    const satellites = document.querySelectorAll('.satellite');
    satellites.forEach(satellite => {
        // Keep orbital animations running - don't disable them
        const computedStyle = window.getComputedStyle(satellite);
        const currentAnimation = computedStyle.animation;
        
        // If there's an orbital animation, keep it running
        if (currentAnimation && currentAnimation.includes('orbit')) {
            satellite.style.animation = currentAnimation;
        } else {
            // Re-enable the orbital animation if it was disabled
            satellite.style.animation = '';
        }
        
        // Keep satellite image spinning
        const satelliteImage = satellite.querySelector('.satellite-image');
        if (satelliteImage) {
            satelliteImage.style.animation = 'satelliteSpin 8s linear infinite';
        }
        
        // Keep labels counter-rotating - restore proper counter-rotation animations
        const label = satellite.querySelector('.satellite-label');
        if (label) {
            // Remove any inline animation styles to let CSS take over
            label.style.removeProperty('animation');
            label.style.removeProperty('webkitAnimation');
            label.style.removeProperty('mozAnimation');
            label.style.removeProperty('oAnimation');
        }
        
        // Make them ghost-like (semi-transparent) instead of invisible
        satellite.style.transition = 'opacity 0.5s ease';
        satellite.style.opacity = '0.3'; // Ghost-like appearance
        satellite.style.pointerEvents = 'none';
        satellite.style.zIndex = '1'; // Lower z-index during minigame
        
        // Also fade out labels
        if (label) {
            label.style.transition = 'opacity 0.5s ease';
            label.style.opacity = '0.3';
        }
    });
    
    // Dim your name and subtitle during minigame - preserve animations for later restoration
    const nameElements = document.querySelectorAll('.title-line, .title-subtitle');
    nameElements.forEach(element => {
        // Mark as protected immediately to prevent mobile optimizations from moving them
        element.dataset.protected = 'true';
        
        // Store current transform to preserve positioning
        const currentTransform = window.getComputedStyle(element).transform;
        element.dataset.originalTransform = currentTransform;
        
        // Store original animation values for restoration
        const computedStyle = window.getComputedStyle(element);
        element.dataset.originalAnimation = computedStyle.animation;
        element.dataset.originalWebkitAnimation = computedStyle.webkitAnimation;
        element.dataset.originalMozAnimation = computedStyle.mozAnimation;
        element.dataset.originalOAnimation = computedStyle.oAnimation;
        
        // Simple opacity change only - no transitions during minigame
        element.style.setProperty('opacity', '0.3', 'important');
        element.style.setProperty('transition', 'none', 'important'); // No transitions
        // Preserve current positioning by maintaining transform
        element.style.setProperty('transform', currentTransform, 'important');
        // Temporarily disable CSS animations
        element.style.animation = 'none';
        element.style.webkitAnimation = 'none';
        element.style.mozAnimation = 'none';
        element.style.oAnimation = 'none';
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
    
    // Fade out mobile link tree buttons with staggered timing (like satellites)
    const mobileButtons = document.querySelectorAll('.mobile-link-item');
    mobileButtons.forEach((button, index) => {
        const delay = (mobileButtons.length - 1 - index) * 200; // 0ms, 200ms, 400ms, 600ms (reverse order)
        
        setTimeout(() => {
            // Disable CSS animations first
            button.style.animation = 'none';
            button.style.webkitAnimation = 'none';
            button.style.mozAnimation = 'none';
            button.style.oAnimation = 'none';
            
            button.style.transition = 'opacity 0.5s ease';
            button.style.opacity = '0.3'; // Ghost-like appearance during minigame (like satellites)
            button.style.pointerEvents = 'none';
            button.style.zIndex = '50'; // Keep above other elements but below minigame UI
            // Disable the link functionality
            button.style.cursor = 'default';
            button.setAttribute('data-original-href', button.href);
            button.removeAttribute('href');
            console.log(`📱 Mobile button ${index + 1} faded out for minigame (staggered)`);
        }, delay);
    });
    
    // Store original Earth sprite positioning and lower z-index during minigame
    const earthSprite = document.querySelector('.earth-sprite');
    if (earthSprite) {
        // Store original positioning for exact restoration (only if not already stored)
        if (!earthSprite.dataset.originalTop) {
            const computedStyle = window.getComputedStyle(earthSprite);
            earthSprite.dataset.originalTop = computedStyle.top;
            earthSprite.dataset.originalLeft = computedStyle.left;
            earthSprite.dataset.originalTransform = computedStyle.transform;
            earthSprite.dataset.originalPosition = computedStyle.position;
            earthSprite.dataset.originalWidth = computedStyle.width;
            earthSprite.dataset.originalHeight = computedStyle.height;
            console.log('🌍 Stored original Earth sprite positioning for restoration (fadeOutUIElements)');
        }
        
        earthSprite.style.zIndex = '1';
        earthSprite.style.pointerEvents = 'none';
    }
}

// Simplified fade in function that uses satellite initialization
function fadeInUIElementsSimplified() {
    console.log('🎮 Starting simplified minigame fade in...');
    
    // Use the fast satellite initialization from desktop.js for quicker restoration
    if (typeof initSatelliteFadeInFast === 'function') {
        initSatelliteFadeInFast();
    } else if (typeof initSatelliteFadeIn === 'function') {
        initSatelliteFadeIn();
    } else {
        console.warn('⚠️ initSatelliteFadeInFast function not available, falling back to basic fade');
        // Fallback: basic satellite fade
        const satellites = document.querySelectorAll('.satellite');
        satellites.forEach(satellite => {
            satellite.style.transition = 'opacity 0.6s ease';
            satellite.style.opacity = '1';
            satellite.style.pointerEvents = 'auto';
        });
    }
    
    // Restore other UI elements
    const nameElements = document.querySelectorAll('.title-line, .title-subtitle');
    nameElements.forEach(element => {
        element.style.setProperty('opacity', '1', 'important');
        element.style.setProperty('transition', 'opacity 0.6s ease', 'important');
        element.style.pointerEvents = 'auto';
        console.log('🎮 Title/subtitle restored after minigame:', element.textContent);
    });
    
    // Restore social media buttons
    const socialButtons = document.querySelectorAll('.social-links a');
    socialButtons.forEach(button => {
        button.style.transition = 'opacity 0.6s ease';
        button.style.opacity = '1';
        button.style.pointerEvents = 'auto';
        button.style.cursor = 'pointer';
        if (button.getAttribute('data-original-href')) {
            button.href = button.getAttribute('data-original-href');
            button.removeAttribute('data-original-href');
        }
    });
    
    // Restore mobile link tree buttons with faster staggered timing
    const mobileButtons = document.querySelectorAll('.mobile-link-item');
    mobileButtons.forEach((button, index) => {
        const delay = 1000 + (index * 200); // 1.0s, 1.2s, 1.4s, 1.6s (much faster than satellites)
        
        setTimeout(() => {
            button.style.transition = 'opacity 0.6s ease';
            button.style.opacity = '1';
            button.style.pointerEvents = 'auto';
            button.style.cursor = 'pointer';
            if (button.getAttribute('data-original-href')) {
                button.href = button.getAttribute('data-original-href');
                button.removeAttribute('data-original-href');
            }
            // Re-enable CSS animations after fade-in
            button.style.animation = '';
            button.style.webkitAnimation = '';
            button.style.mozAnimation = '';
            button.style.oAnimation = '';
            console.log(`📱 Mobile button ${index + 1} faded in after minigame`);
        }, delay);
    });
    
    // Restore Earth sprite to exact original positioning
    const earthSprite = document.querySelector('.earth-sprite');
    if (earthSprite) {
        // Restore exact original positioning if stored
        if (earthSprite.dataset.originalTop) {
            earthSprite.style.top = earthSprite.dataset.originalTop;
            earthSprite.style.left = earthSprite.dataset.originalLeft;
            earthSprite.style.transform = earthSprite.dataset.originalTransform;
            earthSprite.style.position = earthSprite.dataset.originalPosition;
            earthSprite.style.width = earthSprite.dataset.originalWidth;
            earthSprite.style.height = earthSprite.dataset.originalHeight;
            console.log('🌍 Restored Earth sprite to exact original positioning');
        }
        
        earthSprite.style.zIndex = '5';
        earthSprite.style.pointerEvents = 'auto';
        earthSprite.style.opacity = '1';
    }
    
    // Restart desktop optimizations like page initialization (only on desktop)
    if (typeof window.restartDesktopOptimizations === 'function' && typeof DeviceInfo !== 'undefined' && !DeviceInfo.isMobile) {
        setTimeout(() => {
            window.restartDesktopOptimizations();
        }, 500);
    }
}

function fadeInUIElementsStaggered() {
    // Restore satellites to full opacity - keep their orbital animations
    const satellites = document.querySelectorAll('.satellite');
    satellites.forEach((satellite, index) => {
        setTimeout(() => {
            // Keep orbital animations running - don't disable them
            const computedStyle = window.getComputedStyle(satellite);
            const currentAnimation = computedStyle.animation;
            
            // If there's an orbital animation, keep it running
            if (currentAnimation && currentAnimation.includes('orbit')) {
                satellite.style.animation = currentAnimation;
            } else {
                // Re-enable the orbital animation if it was disabled
                satellite.style.animation = '';
            }
            
            // Keep satellite image spinning
            const satelliteImage = satellite.querySelector('.satellite-image');
            if (satelliteImage) {
                satelliteImage.style.animation = 'satelliteSpin 8s linear infinite';
            }
            
            // Keep labels counter-rotating
            const label = satellite.querySelector('.satellite-label');
            if (label) {
                const labelAnimation = computedStyle.animation;
                if (labelAnimation && labelAnimation.includes('counterRotate')) {
                    label.style.animation = labelAnimation;
                } else {
                    label.style.animation = '';
                }
            }
            
            // Restore to full opacity
            satellite.style.transition = 'opacity 0.6s ease';
            satellite.style.opacity = '1'; // Full opacity
            satellite.style.pointerEvents = 'auto';
            satellite.style.zIndex = '20'; // Restore original z-index
            
            // Also restore label opacity
            if (label) {
                label.style.transition = 'opacity 0.6s ease';
                label.style.opacity = '1';
            }
        }, index * 100);
    });
    
    // Skip title/subtitle restoration - they're already restored in showGameEndAnimation
    // Only restore if they haven't been restored yet
    setTimeout(() => {
        const nameElements = document.querySelectorAll('.title-line, .title-subtitle');
        nameElements.forEach((element, index) => {
            // Skip if already restored
            if (element.dataset.restored) {
                return;
            }
            
            setTimeout(() => {
                // Remove all inline styles that might cause animations
                element.style.removeProperty('animation');
                element.style.removeProperty('webkitAnimation');
                element.style.removeProperty('mozAnimation');
                element.style.removeProperty('oAnimation');
                element.style.removeProperty('transform');
                element.style.removeProperty('transition');
                
                // Instant opacity restoration - no transitions
                element.style.setProperty('opacity', '1', 'important');
                element.style.setProperty('transition', 'none', 'important');
                
                // Ensure pointer events are restored
                element.style.pointerEvents = 'auto';
                
                // Mark this element as restored to prevent further interference
                element.dataset.restored = 'true';
                
                // Also mark the parent hero-title to prevent mobile optimizations from interfering
                const heroTitle = element.closest('.hero-title');
                if (heroTitle) {
                    heroTitle.dataset.restored = 'true';
                }
            }, index * 50); // Further reduced stagger delay for smoother appearance
        });
    }, 300);
    
    // Fade in social media buttons last (600ms) - simple fade only
    setTimeout(() => {
        const socialButtons = document.querySelectorAll('.social-links a');
        socialButtons.forEach((button, index) => {
            setTimeout(() => {
                button.style.transition = 'opacity 0.6s ease';
                button.style.opacity = '1';
                button.style.pointerEvents = 'auto';
                button.style.zIndex = '200'; // Restore original z-index
                button.style.cursor = 'pointer';
                // Restore the link functionality
                if (button.getAttribute('data-original-href')) {
                    button.href = button.getAttribute('data-original-href');
                    button.removeAttribute('data-original-href');
                }
            }, index * 100);
        });
    }, 600);
    
    // Fade in mobile link tree buttons with faster staggered timing
    const mobileButtons = document.querySelectorAll('.mobile-link-item');
    mobileButtons.forEach((button, index) => {
        const delay = 1000 + (index * 200); // 1.0s, 1.2s, 1.4s, 1.6s (much faster than satellites)
        
        setTimeout(() => {
            button.style.transition = 'opacity 0.6s ease';
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
            console.log(`📱 Mobile button ${index + 1} faded in after minigame (staggered)`);
        }, delay);
    });
    
    // Restore Earth sprite z-index and prevent animations
    const earthSprite = document.querySelector('.earth-sprite');
    if (earthSprite) {
        // Prevent any CSS animations from running
        earthSprite.style.animation = 'none';
        earthSprite.style.webkitAnimation = 'none';
        earthSprite.style.mozAnimation = 'none';
        earthSprite.style.oAnimation = 'none';
        
        // Restore exact original positioning if stored
        if (earthSprite.dataset.originalTop) {
            earthSprite.style.top = earthSprite.dataset.originalTop;
            earthSprite.style.left = earthSprite.dataset.originalLeft;
            earthSprite.style.transform = earthSprite.dataset.originalTransform;
            earthSprite.style.position = earthSprite.dataset.originalPosition;
            earthSprite.style.width = earthSprite.dataset.originalWidth;
            earthSprite.style.height = earthSprite.dataset.originalHeight;
            console.log('🌍 Restored Earth sprite to exact original positioning (staggered)');
        } else {
            // Fallback to device-specific positioning
            if (typeof DeviceInfo !== 'undefined' && DeviceInfo.isMobile) {
                // Let CSS handle mobile positioning - don't override with desktop positioning
                earthSprite.style.removeProperty('transform');
                earthSprite.style.removeProperty('top');
                earthSprite.style.removeProperty('left');
            } else {
                // Desktop positioning
                earthSprite.style.transform = 'translate(-50%, -50%)';
            }
        }
        
        earthSprite.style.opacity = '1';
        earthSprite.style.zIndex = '5';
        earthSprite.style.pointerEvents = 'auto';
    }
    
    // Restart desktop optimizations like page initialization (only on desktop)
    if (typeof window.restartDesktopOptimizations === 'function' && typeof DeviceInfo !== 'undefined' && !DeviceInfo.isMobile) {
        setTimeout(() => {
            window.restartDesktopOptimizations();
        }, 500); // Reduced delay for smoother transition
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
        max-width: 90vw;
        width: max-content;
        word-wrap: break-word;
        white-space: normal;
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
            const isMobile = DeviceInfo.isMobile;
            const actionText = isMobile ? 'Tap' : 'Click';
            cooldownDisplay.innerHTML = `${actionText} another <span style="color: #ffa500;">shooting star</span> to play again!`;
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
                
                // Restore title/subtitle with proper animation restoration
                const nameElements = document.querySelectorAll('.title-line, .title-subtitle');
                nameElements.forEach(element => {
                    // Remove all inline styles that override CSS animations
                    element.style.removeProperty('opacity');
                    element.style.removeProperty('transform');
                    element.style.removeProperty('transition');
                    
                    // Restore original animations if they were stored
                    if (element.dataset.originalAnimation) {
                        element.style.animation = element.dataset.originalAnimation;
                    } else {
                        element.style.removeProperty('animation');
                    }
                    if (element.dataset.originalWebkitAnimation) {
                        element.style.webkitAnimation = element.dataset.originalWebkitAnimation;
                    } else {
                        element.style.removeProperty('webkitAnimation');
                    }
                    if (element.dataset.originalMozAnimation) {
                        element.style.mozAnimation = element.dataset.originalMozAnimation;
                    } else {
                        element.style.removeProperty('mozAnimation');
                    }
                    if (element.dataset.originalOAnimation) {
                        element.style.oAnimation = element.dataset.originalOAnimation;
                    } else {
                        element.style.removeProperty('oAnimation');
                    }
                    
                    // Ensure pointer events are restored
                    element.style.pointerEvents = 'auto';
                    
                    // Remove the restored flag to allow future animations
                    element.removeAttribute('data-restored');
                    element.removeAttribute('data-protected');
                    
                    // Clean up stored animation data
                    element.removeAttribute('data-original-animation');
                    element.removeAttribute('data-original-webkit-animation');
                    element.removeAttribute('data-original-moz-animation');
                    element.removeAttribute('data-original-o-animation');
                    element.removeAttribute('data-original-transform');
                });
                
                // Now use simplified restoration - just run satellite initialization again
                fadeInUIElementsSimplified();
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
    
    // Note: UI elements are already restored by fadeInUIElementsSimplified() 
    // No need to restore them again here to avoid double restoration
    
    // Complete reset without page refresh
    console.log('🎮 Minigame reset complete - ready for new game!');
}

// Initialize mobile minigame after all functions and variables are defined
function initMobileMinigame() {
    // Minigame can only be started by clicking shooting stars after cooldown
    console.log('🎮 Mobile minigame ready - click shooting stars to start!');
}

initMobileMinigame();
