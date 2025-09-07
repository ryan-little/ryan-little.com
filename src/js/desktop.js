// Desktop-specific functionality for Ryan Little's personal website
// Handles satellite navigation, Earth night system, and desktop optimizations


// Desktop-specific device info (always desktop)
// Override the default DeviceInfo with desktop-specific values
if (typeof window.DeviceInfo !== 'undefined') {
    window.DeviceInfo.isMobile = false;
    window.DeviceInfo.isIOS = false; // Desktop only
    window.DeviceInfo.isAndroid = false; // Desktop only
} else {
    // Fallback if core.js hasn't loaded yet
    window.DeviceInfo = {
        isMobile: false,
        isEdge: navigator.userAgent.includes('Edge') || navigator.userAgent.includes('Edg'),
        isFirefox: navigator.userAgent.includes('Firefox'),
        isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
        isIOS: false, // Desktop only
        isAndroid: false, // Desktop only
        isChrome: /Chrome/.test(navigator.userAgent),
        pixelRatio: window.devicePixelRatio || 1
    };
}

// Simple Earth Night Dimming System (Desktop)
const EarthNightSystem = {
    earthElement: null,
    updateInterval: null,
    
    init() {
        this.earthElement = document.querySelector('.earth-sprite');
        
        if (!this.earthElement) {
            setTimeout(() => {
                this.earthElement = document.querySelector('.earth-sprite');
                if (this.earthElement) {
                    this.startUpdates();
                }
            }, 100);
            return;
        }
        this.startUpdates();
    },
    
    getTimeBasedBrightness() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        // Convert to decimal time for smoother transitions
        const time = hour + (minute / 60);
        
        // Define brightness levels throughout the day
        let brightness, contrast;
        
        if (time >= 6 && time < 12) {
            // Morning: 6 AM - 12 PM (gradually brightening)
            const morningProgress = (time - 6) / 6; // 0 to 1
            brightness = 0.5 + (morningProgress * 0.5); // 0.5 to 1.0
            contrast = 1.2 - (morningProgress * 0.1); // 1.2 to 1.1
        } else if (time >= 12 && time < 17) {
            // Afternoon: 12 PM - 5 PM (peak brightness)
            brightness = 1.0;
            contrast = 1.1;
        } else if (time >= 17 && time < 20) {
            // Early evening: 5 PM - 8 PM (rapid dimming)
            const earlyEveningProgress = (time - 17) / 3; // 0 to 1
            brightness = 1.0 - (earlyEveningProgress * 0.4); // 1.0 to 0.6
            contrast = 1.1 + (earlyEveningProgress * 0.1); // 1.1 to 1.2
        } else if (time >= 20 && time < 24) {
            // Late evening: 8 PM - 12 AM (continuing to dim)
            const lateEveningProgress = (time - 20) / 4; // 0 to 1
            brightness = 0.6 - (lateEveningProgress * 0.3); // 0.6 to 0.3
            contrast = 1.2 + (lateEveningProgress * 0.1); // 1.2 to 1.3
        } else {
            // Late night: 12 AM - 6 AM (darkest)
            const nightProgress = time / 6; // 0 to 1
            brightness = 0.3 - (nightProgress * 0.15); // 0.3 to 0.15
            contrast = 1.3 + (nightProgress * 0.1); // 1.3 to 1.4
        }
        
        return { brightness, contrast };
    },
    
    updateEarthBrightness() {
        if (!this.earthElement) {
            console.warn('Earth element not available for brightness update');
            return;
        }
        
        const { brightness, contrast } = this.getTimeBasedBrightness();
        
        // Apply smooth transition with CSS transition (longer transition for the initial change)
        this.earthElement.style.transition = 'filter 3s ease-in-out';
        this.earthElement.style.filter = `brightness(${brightness}) contrast(${contrast})`;
        
    },
    
    startUpdates() {
        // Start at full daylight brightness
        this.earthElement.style.transition = 'filter 0s ease-in-out';
        this.earthElement.style.filter = 'brightness(1.1) contrast(1.1)';
        
        // Then transition to current time-based brightness after a short delay
        setTimeout(() => {
            this.updateEarthBrightness();
        }, 1000); // 1 second delay
    },
    
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
};

// Desktop Performance Optimizations
const DesktopPerformanceOptimizer = {
    optimizeForDevice: () => {
        
        // Desktop-specific optimizations
        const stars = document.querySelector('.stars');
        if (stars) {
            stars.style.animationDuration = '90s';
            ['webkit', 'moz', 'o'].forEach(prefix => {
                stars.style[`${prefix}AnimationDuration`] = '90s';
            });
            // Enable hardware acceleration for better performance
            stars.style.transform = 'translateZ(0)';
            stars.style.willChange = 'transform';
        }
        
        // Optimize satellite interactions with hardware acceleration
        const satellites = document.querySelectorAll('.satellite');
        satellites.forEach(satellite => {
            satellite.style.cursor = 'pointer';
            // Enable hardware acceleration for smoother animations
            satellite.style.transform = 'translateZ(0)';
            satellite.style.willChange = 'transform';
        });
        
        // Optimize Earth sprite for better performance
        const earthSprite = document.querySelector('.earth-sprite');
        if (earthSprite) {
            earthSprite.style.transform = 'translateZ(0)';
            earthSprite.style.willChange = 'transform, filter';
        }
    },
    
    applyBrowserFixes: () => {
        // Use shared browser fixes from core.js
        if (typeof PerformanceOptimizer !== 'undefined') {
            PerformanceOptimizer.applyBrowserFixes();
        }
    }
};

// Global satellite movement state - accessible from anywhere
window.SatelliteMovementState = {
    isHovering: false,
    isPageVisible: true,
    isPageActive: false,
    animationId: null,
    distanceRanges: [
        { min: 280, max: 410, current: 345, speed: 0.3 },
        { min: 280, max: 410, current: 345, speed: 0.4 },
        { min: 280, max: 410, current: 345, speed: 0.5 },
        { min: 280, max: 400, current: 345, speed: 0.6 }
    ]
};

// Initialize dynamic satellite movement (Desktop Only)
function initSatelliteMovement() {
    
    const satellites = document.querySelectorAll('.satellite');
    
    // Initialize satellite fade-in with staggered timing
    initSatelliteFadeIn();
    
    // Use global state
    const { isHovering, isPageVisible, isPageActive, animationId } = window.SatelliteMovementState;
    const distanceRanges = window.SatelliteMovementState.distanceRanges;
    
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
        // Only animate if not paused
        if (!window.SatelliteMovementState.isHovering && !window.SatelliteMovementState.isPageActive) {
            satellites.forEach((satellite, index) => {
                const range = window.SatelliteMovementState.distanceRanges[index];
                
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
        }
        
        window.SatelliteMovementState.animationId = requestAnimationFrame(animateSatellites);
    }
    
    // Start the animation
    animateSatellites();
    
    // Page visibility API to maintain pause state when switching tabs
    document.addEventListener('visibilitychange', () => {
        window.SatelliteMovementState.isPageVisible = !document.hidden;
        if (!window.SatelliteMovementState.isPageVisible && (window.SatelliteMovementState.isHovering || window.SatelliteMovementState.isPageActive)) {
            // Keep paused when page is not visible and was hovering or in a page
        } else if (window.SatelliteMovementState.isPageVisible && (window.SatelliteMovementState.isHovering || window.SatelliteMovementState.isPageActive)) {
            // Resume paused state when page becomes visible again
        }
    });
    
    // Function to pause all orbital animations
    function pauseAllOrbitalAnimations() {
        satellites.forEach(sat => {
            sat.classList.add('orbital-paused');
        });
    }
    
    // Function to resume all orbital animations
    function resumeAllOrbitalAnimations() {
        satellites.forEach(sat => {
            sat.classList.remove('orbital-paused');
        });
    }
    
    // Function to pause for page navigation (will be called when pages are added)
    window.pauseSatellitesForPage = function() {
        window.SatelliteMovementState.isPageActive = true;
        pauseAllOrbitalAnimations();
    };
    
    // Function to resume after page navigation (will be called by back button)
    window.resumeSatellitesAfterPage = function() {
        window.SatelliteMovementState.isPageActive = false;
        if (!window.SatelliteMovementState.isHovering) {
            resumeAllOrbitalAnimations();
        }
    };
    
    satellites.forEach((satellite, index) => {
        // Mouse events for desktop
        satellite.addEventListener('mouseenter', () => {
            if (!window.SatelliteMovementState.isHovering) {
                window.SatelliteMovementState.isHovering = true;
                pauseAllOrbitalAnimations();
            }
        });
        
        satellite.addEventListener('mouseleave', () => {
            if (window.SatelliteMovementState.isHovering) {
                window.SatelliteMovementState.isHovering = false;
                if (!window.SatelliteMovementState.isPageActive) {
                    resumeAllOrbitalAnimations();
                }
            }
        });
        
        // Click events for desktop navigation
        satellite.addEventListener('click', (e) => {
            e.preventDefault();
            const target = satellite.getAttribute('data-target');
            if (target) {
                handleSatelliteNavigation(target, satellite);
            }
        });
    });
}

// Initialize satellite fade-in with staggered timing
function initSatelliteFadeIn() {
    
    const satellites = document.querySelectorAll('.satellite');
    const labels = document.querySelectorAll('.satellite-label');
    
    // Fade in satellites with staggered timing
    satellites.forEach((satellite, index) => {
        const delay = 4500 + (index * 500); // 4.5s, 5.0s, 5.5s, 6.0s
        
        setTimeout(() => {
            satellite.style.opacity = '1';
            satellite.style.pointerEvents = 'auto'; // Restore clickability
            satellite.style.cursor = 'pointer'; // Ensure cursor shows it's clickable
        }, delay);
    });
    
    // Fade in labels with the same timing
    labels.forEach((label, index) => {
        const delay = 4500 + (index * 500); // 4.5s, 5.0s, 5.5s, 6.0s
        
        setTimeout(() => {
            label.style.opacity = '1';
        }, delay);
    });
}

// Fast satellite restoration for post-minigame (much quicker than initial page load)
function initSatelliteFadeInFast() {
    
    const satellites = document.querySelectorAll('.satellite');
    const labels = document.querySelectorAll('.satellite-label');
    
    // Fade in satellites with much faster staggered timing
    satellites.forEach((satellite, index) => {
        const delay = 200 + (index * 150); // 0.2s, 0.35s, 0.5s, 0.65s (much faster!)
        
        setTimeout(() => {
            satellite.style.transition = 'opacity 0.4s ease';
            satellite.style.opacity = '1';
            satellite.style.pointerEvents = 'auto'; // Restore clickability
            satellite.style.cursor = 'pointer'; // Ensure cursor shows it's clickable
            satellite.style.zIndex = '20'; // Restore original z-index
        }, delay);
    });
    
    // Fade in labels with the same fast timing
    labels.forEach((label, index) => {
        const delay = 200 + (index * 150); // 0.2s, 0.35s, 0.5s, 0.65s
        
        setTimeout(() => {
            label.style.transition = 'opacity 0.4s ease';
            label.style.opacity = '1';
        }, delay);
    });
}

// Reverse satellite initialization - fade out satellites (opposite of initSatelliteFadeIn)
function reverseSatelliteFadeIn() {
    
    const satellites = document.querySelectorAll('.satellite');
    const labels = document.querySelectorAll('.satellite-label');
    
    // Fade out satellites with staggered timing (reverse order)
    satellites.forEach((satellite, index) => {
        const delay = (satellites.length - 1 - index) * 200; // 0ms, 200ms, 400ms, 600ms
        
        setTimeout(() => {
            satellite.style.transition = 'opacity 0.5s ease';
            satellite.style.opacity = '0.3'; // Ghost-like appearance during minigame
            satellite.style.pointerEvents = 'none';
        }, delay);
    });
    
    // Fade out labels with the same timing
    labels.forEach((label, index) => {
        const delay = (labels.length - 1 - index) * 200; // 0ms, 200ms, 400ms, 600ms
        
        setTimeout(() => {
            label.style.transition = 'opacity 0.5s ease';
            label.style.opacity = '0.3';
        }, delay);
    });
}

// Desktop-specific initialization
function initDesktopOptimizations() {
    
    // Initialize satellite movement
    initSatelliteMovement();
    
    // Apply device-specific optimizations
    DesktopPerformanceOptimizer.optimizeForDevice();
    DesktopPerformanceOptimizer.applyBrowserFixes();
    
    // Initialize Earth Night System
    if (typeof EarthNightSystem !== 'undefined') {
        EarthNightSystem.init();
    }
    
}

// Initialize desktop optimizations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDesktopOptimizations);
} else {
    initDesktopOptimizations();
}

// Function to restart desktop optimizations like page initialization
window.restartDesktopOptimizations = function() {
    
    // Get current satellite positions to maintain visual continuity
    const satellites = document.querySelectorAll('.satellite');
    const currentPositions = [];
    satellites.forEach((satellite, index) => {
        const computedStyle = window.getComputedStyle(satellite);
        const transform = computedStyle.transform;
        currentPositions[index] = transform;
    });
    
    // Stop any existing animations
    if (window.SatelliteMovementState.animationId) {
        cancelAnimationFrame(window.SatelliteMovementState.animationId);
        window.SatelliteMovementState.animationId = null;
    }
    
    // Reset all state variables to initial values
    window.SatelliteMovementState.isHovering = false;
    window.SatelliteMovementState.isPageActive = false;
    window.SatelliteMovementState.isPageVisible = true;
    
    // Reset distance ranges to initial values
    window.SatelliteMovementState.distanceRanges.forEach((range, index) => {
        range.current = Math.random() * (range.max - range.min) + range.min;
        range.direction = Math.random() > 0.5 ? 1 : -1;
        
        // Reset CSS variables
        document.documentElement.style.setProperty(
            `--satellite${index + 1}-distance`, 
            `${range.current}px`
        );
    });
    
    // Remove all orbital-paused classes
    satellites.forEach(sat => {
        sat.classList.remove('orbital-paused');
    });
    
    // Maintain current visual positions during reset
    satellites.forEach((satellite, index) => {
        if (currentPositions[index]) {
            satellite.style.transform = currentPositions[index];
        }
    });
    
    // Call the full desktop initialization like a fresh page load
    setTimeout(() => {
        // Remove the temporary transform styles to let CSS animations take over
        satellites.forEach(satellite => {
            satellite.style.removeProperty('transform');
        });
        
        initDesktopOptimizations();
        
        // Reinitialize the night system to restore proper brightness/contrast
        if (typeof EarthNightSystem !== 'undefined') {
            EarthNightSystem.updateEarthBrightness();
        }
    }, 50); // Reduced delay for smoother transition
};

// Page Navigation System
function handleSatelliteNavigation(target, clickedSatellite) {
    
    if (target === 'adventures') {
        openAdventuresPage(clickedSatellite);
    } else if (target === 'about') {
        openAboutPage(clickedSatellite);
    } else if (target === 'portfolio') {
        openPortfolioPage(clickedSatellite);
    } else if (target === 'trees') {
        openTreesPage(clickedSatellite);
    } else {
        console.warn('Unknown navigation target:', target);
    }
}



// Adventures Page Functions
function openAdventuresPage(clickedSatellite) {
    
    // Pause all animations except background stars and scaled satellite
    pauseAllAnimationsExceptPage();
    
    // Get the clicked satellite's image source
    const satelliteImg = clickedSatellite.querySelector('.satellite-image');
    const satelliteSrc = satelliteImg.src;
    const satelliteSrcset = satelliteImg.srcset;
    
    // Update the centered satellite in the overlay
    const centeredSatellite = document.querySelector('.adventures-overlay .centered-satellite img');
    if (centeredSatellite) {
        centeredSatellite.src = satelliteSrc;
        if (satelliteSrcset) {
            centeredSatellite.srcset = satelliteSrcset;
        }
    }
    
    // Show the adventures overlay
    const adventuresOverlay = document.getElementById('adventures-overlay');
    if (adventuresOverlay) {
        adventuresOverlay.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
    }
}

function closeAdventuresPage() {
    
    const adventuresOverlay = document.getElementById('adventures-overlay');
    if (adventuresOverlay) {
        adventuresOverlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Resume all animations after a short delay
        setTimeout(() => {
            resumeAllAnimationsAfterPage();
        }, 500);
        
    }
}



// About Page Functions
function openAboutPage(clickedSatellite) {
    
    // Pause all animations except background stars and scaled satellite
    pauseAllAnimationsExceptPage();
    
    // Get the clicked satellite's image source
    const satelliteImg = clickedSatellite.querySelector('.satellite-image');
    const satelliteSrc = satelliteImg.src;
    const satelliteSrcset = satelliteImg.srcset;
    
    // Update the centered satellite in the overlay
    const centeredSatellite = document.querySelector('.about-overlay .centered-satellite img');
    if (centeredSatellite) {
        centeredSatellite.src = satelliteSrc;
        if (satelliteSrcset) {
            centeredSatellite.srcset = satelliteSrcset;
        }
    }
    
    // Show the about overlay
    const aboutOverlay = document.getElementById('about-overlay');
    if (aboutOverlay) {
        aboutOverlay.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
    }
}

function closeAboutPage() {
    
    const aboutOverlay = document.getElementById('about-overlay');
    if (aboutOverlay) {
        aboutOverlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Resume all animations after a short delay
        setTimeout(() => {
            resumeAllAnimationsAfterPage();
        }, 500);
        
    }
}

// Portfolio Page Functions
function openPortfolioPage(clickedSatellite) {
    
    // Pause all animations except background stars and scaled satellite
    pauseAllAnimationsExceptPage();
    
    // Get the clicked satellite's image source
    const satelliteImg = clickedSatellite.querySelector('.satellite-image');
    const satelliteSrc = satelliteImg.src;
    const satelliteSrcset = satelliteImg.srcset;
    
    // Update the centered satellite in the overlay
    const centeredSatellite = document.querySelector('.portfolio-overlay .centered-satellite img');
    if (centeredSatellite) {
        centeredSatellite.src = satelliteSrc;
        if (satelliteSrcset) {
            centeredSatellite.srcset = satelliteSrcset;
        }
    }
    
    // Show the portfolio overlay
    const portfolioOverlay = document.getElementById('portfolio-overlay');
    if (portfolioOverlay) {
        portfolioOverlay.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
    }
}

function closePortfolioPage() {
    
    const portfolioOverlay = document.getElementById('portfolio-overlay');
    if (portfolioOverlay) {
        portfolioOverlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Resume all animations after a short delay
        setTimeout(() => {
            resumeAllAnimationsAfterPage();
        }, 500);
        
    }
}

// Trees Page Functions
function openTreesPage(clickedSatellite) {
    
    // Pause all animations except background stars and scaled satellite
    pauseAllAnimationsExceptPage();
    
    // Get the clicked satellite's image source
    const satelliteImg = clickedSatellite.querySelector('.satellite-image');
    const satelliteSrc = satelliteImg.src;
    const satelliteSrcset = satelliteImg.srcset;
    
    // Update the centered satellite in the overlay
    const centeredSatellite = document.querySelector('.trees-overlay .centered-satellite img');
    if (centeredSatellite) {
        centeredSatellite.src = satelliteSrc;
        if (satelliteSrcset) {
            centeredSatellite.srcset = satelliteSrcset;
        }
    }
    
    // Show the trees overlay
    const treesOverlay = document.getElementById('trees-overlay');
    if (treesOverlay) {
        treesOverlay.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
    }
}

function closeTreesPage() {
    
    const treesOverlay = document.getElementById('trees-overlay');
    if (treesOverlay) {
        treesOverlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Resume all animations after a short delay
        setTimeout(() => {
            resumeAllAnimationsAfterPage();
        }, 500);
        
    }
}

// Generic animation control functions for all pages
function pauseAllAnimationsExceptPage() {
    
    // Pause satellite orbital animations
    const satellites = document.querySelectorAll('.satellite');
    satellites.forEach(sat => {
        sat.classList.add('orbital-paused');
    });
    
    // Pause background image animations (but keep stars moving)
    const backgroundImage = document.querySelector('.hero-background .background-image');
    const background2 = document.querySelector('.hero-background .background2');
    
    if (backgroundImage) {
        backgroundImage.style.animationPlayState = 'paused';
    }
    if (background2) {
        background2.style.animationPlayState = 'paused';
    }
    
    // Pause Earth sprite if it has animations
    const earthSprite = document.querySelector('.earth-sprite');
    if (earthSprite) {
        earthSprite.style.animationPlayState = 'paused';
    }
    
    // Pause any shooting stars
    if (typeof window.clearAllShootingStars === 'function') {
        window.clearAllShootingStars();
    }
    
    // Set page active state to prevent satellite movement
    window.SatelliteMovementState.isPageActive = true;
    
}

function resumeAllAnimationsAfterPage() {
    
    // Resume satellite orbital animations
    const satellites = document.querySelectorAll('.satellite');
    satellites.forEach(sat => {
        sat.classList.remove('orbital-paused');
    });
    
    // Resume background image animations
    const backgroundImage = document.querySelector('.hero-background .background-image');
    const background2 = document.querySelector('.hero-background .background2');
    
    if (backgroundImage) {
        backgroundImage.style.animationPlayState = 'running';
    }
    if (background2) {
        background2.style.animationPlayState = 'running';
    }
    
    // Resume Earth sprite animations
    const earthSprite = document.querySelector('.earth-sprite');
    if (earthSprite) {
        earthSprite.style.animationPlayState = 'running';
    }
    
    // Resume shooting stars
    if (typeof window.initShootingStars === 'function') {
        window.initShootingStars();
    }
    
    // Clear page active state to allow satellite movement
    window.SatelliteMovementState.isPageActive = false;
    
    // Resume satellite movement if not hovering
    if (!window.SatelliteMovementState.isHovering) {
        const satellites = document.querySelectorAll('.satellite');
        satellites.forEach(sat => {
            sat.classList.remove('orbital-paused');
        });
    }
    
}

// Handle escape key to close any active page
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const adventuresOverlay = document.getElementById('adventures-overlay');
        const aboutOverlay = document.getElementById('about-overlay');
        const portfolioOverlay = document.getElementById('portfolio-overlay');
        const treesOverlay = document.getElementById('trees-overlay');
        if (adventuresOverlay && adventuresOverlay.classList.contains('active')) {
            closeAdventuresPage();
        } else if (aboutOverlay && aboutOverlay.classList.contains('active')) {
            closeAboutPage();
        } else if (portfolioOverlay && portfolioOverlay.classList.contains('active')) {
            closePortfolioPage();
        } else if (treesOverlay && treesOverlay.classList.contains('active')) {
            closeTreesPage();
        }
    }
});

// Export for global access
window.initDesktopOptimizations = initDesktopOptimizations;
window.EarthNightSystem = EarthNightSystem;
window.initSatelliteFadeIn = initSatelliteFadeIn;
window.initSatelliteFadeInFast = initSatelliteFadeInFast;

// Debug function for testing night system
window.testNightSystem = function() {
    console.log('=== Night System Test ===');
    
    if (!window.EarthNightSystem) {
        console.error('EarthNightSystem not available');
        return;
    }
    
    const earth = document.querySelector('.earth-sprite');
    if (!earth) {
        console.error('Earth element not found');
        return;
    }
    
    console.log('Earth element found:', earth);
    
    const values = window.EarthNightSystem.getTimeBasedBrightness();
    console.log('Expected values:', values);
    
    const computedStyle = window.getComputedStyle(earth);
    console.log('Current filter:', computedStyle.filter);
    
    // Force an update
    window.EarthNightSystem.updateEarthBrightness();
    
    const newComputedStyle = window.getComputedStyle(earth);
    console.log('Filter after update:', newComputedStyle.filter);
    
    console.log('=== Test Complete ===');
};

// Console clear function
window.clearConsole = function() {
    console.clear();
    console.log('Console cleared! 🌍');
};
window.reverseSatelliteFadeIn = reverseSatelliteFadeIn;
window.openAdventuresPage = openAdventuresPage;
window.closeAdventuresPage = closeAdventuresPage;
window.openAboutPage = openAboutPage;
window.closeAboutPage = closeAboutPage;
window.openPortfolioPage = openPortfolioPage;
window.closePortfolioPage = closePortfolioPage;
window.openTreesPage = openTreesPage;
window.closeTreesPage = closeTreesPage;
