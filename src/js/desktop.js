// Desktop-specific functionality for Ryan Little's personal website
// Handles satellite navigation, Earth night system, and desktop optimizations

console.log('💻 Desktop.js loaded - Desktop optimizations active');

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

// Simple Earth Night Dimming System (Desktop Only)
const EarthNightSystem = {
    earthElement: null,
    updateInterval: null,
    
    init() {
        console.log('🌍 Initializing Earth Night System...');
        this.earthElement = document.querySelector('.earth-sprite');
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
            brightness = 0.6 + (morningProgress * 0.5); // 0.6 to 1.1
            contrast = 1.3 - (morningProgress * 0.2); // 1.3 to 1.1
        } else if (time >= 12 && time < 18) {
            // Afternoon: 12 PM - 6 PM (peak brightness)
            brightness = 1.1;
            contrast = 1.1;
        } else if (time >= 18 && time < 24) {
            // Evening: 6 PM - 12 AM (gradually dimming)
            const eveningProgress = (time - 18) / 6; // 0 to 1
            brightness = 1.1 - (eveningProgress * 0.7); // 1.1 to 0.4
            contrast = 1.1 + (eveningProgress * 0.1); // 1.1 to 1.2
        } else {
            // Late night: 12 AM - 6 AM (darkest)
            const nightProgress = time / 6; // 0 to 1
            brightness = 0.4 - (nightProgress * 0.2); // 0.4 to 0.2
            contrast = 1.2 + (nightProgress * 0.1); // 1.2 to 1.3
        }
        
        return { brightness, contrast };
    },
    
    updateEarthBrightness() {
        if (!this.earthElement) return;
        
        const { brightness, contrast } = this.getTimeBasedBrightness();
        
        // Apply smooth transition with CSS transition
        this.earthElement.style.transition = 'filter 2s ease-in-out';
        this.earthElement.style.filter = `brightness(${brightness}) contrast(${contrast})`;
    },
    
    startUpdates() {
        // Update immediately
        this.updateEarthBrightness();
        
        // Update every 5 minutes for smooth transitions throughout the day
        this.updateInterval = setInterval(() => {
            this.updateEarthBrightness();
        }, 5 * 60 * 1000);
        
        console.log('🌍 Earth Night System updates started');
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
        console.log('💻 Applying desktop optimizations...');
        
        // Desktop-specific optimizations
        const stars = document.querySelector('.stars');
        if (stars) {
            stars.style.animationDuration = '90s';
            ['webkit', 'moz', 'o'].forEach(prefix => {
                stars.style[`${prefix}AnimationDuration`] = '90s';
            });
            console.log('⭐ Stars animation optimized for desktop');
        }
        
        // Optimize satellite interactions
        const satellites = document.querySelectorAll('.satellite');
        satellites.forEach(satellite => {
            satellite.style.cursor = 'pointer';
        });
        console.log('🛰️ Satellites optimized for desktop interaction');
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
    console.log('🛰️ Initializing desktop satellite movement...');
    
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
            console.log('🛰️ Page hidden - maintaining satellite pause state');
        } else if (window.SatelliteMovementState.isPageVisible && (window.SatelliteMovementState.isHovering || window.SatelliteMovementState.isPageActive)) {
            // Resume paused state when page becomes visible again
            console.log('🛰️ Page visible - maintaining satellite pause state');
        }
    });
    
    // Function to pause all orbital animations
    function pauseAllOrbitalAnimations() {
        satellites.forEach(sat => {
            sat.classList.add('orbital-paused');
        });
        console.log('🛰️ All orbital animations paused (rotation and distance)');
    }
    
    // Function to resume all orbital animations
    function resumeAllOrbitalAnimations() {
        satellites.forEach(sat => {
            sat.classList.remove('orbital-paused');
        });
        console.log('🛰️ All orbital animations resumed (rotation and distance)');
    }
    
    // Function to pause for page navigation (will be called when pages are added)
    window.pauseSatellitesForPage = function() {
        window.SatelliteMovementState.isPageActive = true;
        pauseAllOrbitalAnimations();
        console.log('🛰️ Satellites paused for page navigation');
    };
    
    // Function to resume after page navigation (will be called by back button)
    window.resumeSatellitesAfterPage = function() {
        window.SatelliteMovementState.isPageActive = false;
        if (!window.SatelliteMovementState.isHovering) {
            resumeAllOrbitalAnimations();
            console.log('🛰️ Satellites resumed after page navigation');
        }
    };
    
    satellites.forEach((satellite, index) => {
        // Mouse events for desktop
        satellite.addEventListener('mouseenter', () => {
            if (!window.SatelliteMovementState.isHovering) {
                window.SatelliteMovementState.isHovering = true;
                console.log('🛰️ Satellite hovered - pausing orbital animations, keeping spinning');
                pauseAllOrbitalAnimations();
            }
        });
        
        satellite.addEventListener('mouseleave', () => {
            if (window.SatelliteMovementState.isHovering) {
                window.SatelliteMovementState.isHovering = false;
                console.log('🛰️ Satellite hover ended - resuming orbital animations');
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
                console.log(`🛰️ Desktop satellite clicked: ${target}`);
                handleSatelliteNavigation(target, satellite);
            }
        });
    });
}

// Initialize satellite fade-in with staggered timing
function initSatelliteFadeIn() {
    console.log('🛰️ Initializing satellite fade-in...');
    
    const satellites = document.querySelectorAll('.satellite');
    const labels = document.querySelectorAll('.satellite-label');
    
    // Fade in satellites with staggered timing
    satellites.forEach((satellite, index) => {
        const delay = 4500 + (index * 500); // 4.5s, 5.0s, 5.5s, 6.0s
        
        setTimeout(() => {
            satellite.style.opacity = '1';
            satellite.style.pointerEvents = 'auto'; // Restore clickability
            satellite.style.cursor = 'pointer'; // Ensure cursor shows it's clickable
            console.log(`🛰️ Satellite ${index + 1} faded in and made clickable`);
        }, delay);
    });
    
    // Fade in labels with the same timing
    labels.forEach((label, index) => {
        const delay = 4500 + (index * 500); // 4.5s, 5.0s, 5.5s, 6.0s
        
        setTimeout(() => {
            label.style.opacity = '1';
            console.log(`🏷️ Label ${index + 1} faded in`);
        }, delay);
    });
}

// Fast satellite restoration for post-minigame (much quicker than initial page load)
function initSatelliteFadeInFast() {
    console.log('🛰️ Initializing fast satellite fade-in for post-minigame...');
    
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
            console.log(`🛰️ Satellite ${index + 1} quickly faded in and made clickable`);
        }, delay);
    });
    
    // Fade in labels with the same fast timing
    labels.forEach((label, index) => {
        const delay = 200 + (index * 150); // 0.2s, 0.35s, 0.5s, 0.65s
        
        setTimeout(() => {
            label.style.transition = 'opacity 0.4s ease';
            label.style.opacity = '1';
            console.log(`🏷️ Label ${index + 1} quickly faded in`);
        }, delay);
    });
}

// Reverse satellite initialization - fade out satellites (opposite of initSatelliteFadeIn)
function reverseSatelliteFadeIn() {
    console.log('🛰️ Reversing satellite fade-in (fading out)...');
    
    const satellites = document.querySelectorAll('.satellite');
    const labels = document.querySelectorAll('.satellite-label');
    
    // Fade out satellites with staggered timing (reverse order)
    satellites.forEach((satellite, index) => {
        const delay = (satellites.length - 1 - index) * 200; // 0ms, 200ms, 400ms, 600ms
        
        setTimeout(() => {
            satellite.style.transition = 'opacity 0.5s ease';
            satellite.style.opacity = '0.3'; // Ghost-like appearance during minigame
            satellite.style.pointerEvents = 'none';
            console.log(`🛰️ Satellite ${index + 1} faded out for minigame`);
        }, delay);
    });
    
    // Fade out labels with the same timing
    labels.forEach((label, index) => {
        const delay = (labels.length - 1 - index) * 200; // 0ms, 200ms, 400ms, 600ms
        
        setTimeout(() => {
            label.style.transition = 'opacity 0.5s ease';
            label.style.opacity = '0.3';
            console.log(`🏷️ Label ${index + 1} faded out for minigame`);
        }, delay);
    });
}

// Desktop-specific initialization
function initDesktopOptimizations() {
    console.log('💻 Initializing desktop optimizations...');
    
    // Initialize satellite movement
    initSatelliteMovement();
    
    // Apply device-specific optimizations
    DesktopPerformanceOptimizer.optimizeForDevice();
    DesktopPerformanceOptimizer.applyBrowserFixes();
    
    // Initialize Earth Night System
    if (typeof EarthNightSystem !== 'undefined') {
        EarthNightSystem.init();
    }
    
    console.log('✅ Desktop optimizations initialized');
}

// Initialize desktop optimizations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDesktopOptimizations);
} else {
    initDesktopOptimizations();
}

// Function to restart desktop optimizations like page initialization
window.restartDesktopOptimizations = function() {
    console.log('🛰️ Restarting desktop optimizations like page initialization...');
    
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
        console.log('✅ Desktop optimizations restarted - hover functionality restored');
    }, 50); // Reduced delay for smoother transition
};

// Page Navigation System
function handleSatelliteNavigation(target, clickedSatellite) {
    console.log(`🛰️ Navigating to: ${target}`);
    
    if (target === 'contact') {
        openContactPage(clickedSatellite);
    } else if (target === 'about') {
        openAboutPage(clickedSatellite);
    } else if (target === 'portfolio') {
        openPortfolioPage(clickedSatellite);
    } else if (target === 'trees') {
        openTreesPage(clickedSatellite);
    } else {
        console.log(`📄 ${target} page not implemented yet`);
    }
}

function openContactPage(clickedSatellite) {
    console.log('📧 Opening contact page...');
    
    // Pause all animations except background stars and scaled satellite
    pauseAllAnimationsExceptContact();
    
    // Get the clicked satellite's image source
    const satelliteImg = clickedSatellite.querySelector('.satellite-image');
    const satelliteSrc = satelliteImg.src;
    const satelliteSrcset = satelliteImg.srcset;
    
    // Update the centered satellite in the overlay
    const centeredSatellite = document.querySelector('.contact-overlay .centered-satellite img');
    if (centeredSatellite) {
        centeredSatellite.src = satelliteSrc;
        if (satelliteSrcset) {
            centeredSatellite.srcset = satelliteSrcset;
        }
    }
    
    // Show the contact overlay
    const contactOverlay = document.getElementById('contact-overlay');
    if (contactOverlay) {
        contactOverlay.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        console.log('✅ Contact page opened - all animations paused except stars and scaled satellite');
    }
}

function closeContactPage() {
    console.log('📧 Closing contact page...');
    
    const contactOverlay = document.getElementById('contact-overlay');
    if (contactOverlay) {
        contactOverlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Resume all animations after a short delay
        setTimeout(() => {
            resumeAllAnimationsAfterContact();
        }, 500);
        
        console.log('✅ Contact page closed - all animations resumed');
    }
}

// Animation control functions for contact page
function pauseAllAnimationsExceptContact() {
    console.log('⏸️ Pausing all animations except background stars and scaled satellite...');
    
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
    
    console.log('✅ All animations paused except background stars and scaled satellite');
}

function resumeAllAnimationsAfterContact() {
    console.log('▶️ Resuming all animations...');
    
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
    
    console.log('✅ All animations resumed');
}

// About Page Functions
function openAboutPage(clickedSatellite) {
    console.log('👤 Opening about page...');
    
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
        
        console.log('✅ About page opened - all animations paused except stars and scaled satellite');
    }
}

function closeAboutPage() {
    console.log('👤 Closing about page...');
    
    const aboutOverlay = document.getElementById('about-overlay');
    if (aboutOverlay) {
        aboutOverlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Resume all animations after a short delay
        setTimeout(() => {
            resumeAllAnimationsAfterPage();
        }, 500);
        
        console.log('✅ About page closed - all animations resumed');
    }
}

// Portfolio Page Functions
function openPortfolioPage(clickedSatellite) {
    console.log('💼 Opening portfolio page...');
    
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
        
        console.log('✅ Portfolio page opened - all animations paused except stars and scaled satellite');
    }
}

function closePortfolioPage() {
    console.log('💼 Closing portfolio page...');
    
    const portfolioOverlay = document.getElementById('portfolio-overlay');
    if (portfolioOverlay) {
        portfolioOverlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Resume all animations after a short delay
        setTimeout(() => {
            resumeAllAnimationsAfterPage();
        }, 500);
        
        console.log('✅ Portfolio page closed - all animations resumed');
    }
}

// Trees Page Functions
function openTreesPage(clickedSatellite) {
    console.log('🌳 Opening trees page...');
    
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
        
        console.log('✅ Trees page opened - all animations paused except stars and scaled satellite');
    }
}

function closeTreesPage() {
    console.log('🌳 Closing trees page...');
    
    const treesOverlay = document.getElementById('trees-overlay');
    if (treesOverlay) {
        treesOverlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        // Resume all animations after a short delay
        setTimeout(() => {
            resumeAllAnimationsAfterPage();
        }, 500);
        
        console.log('✅ Trees page closed - all animations resumed');
    }
}

// Generic animation control functions for all pages
function pauseAllAnimationsExceptPage() {
    console.log('⏸️ Pausing all animations except background stars and scaled satellite...');
    
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
    
    console.log('✅ All animations paused except background stars and scaled satellite');
}

function resumeAllAnimationsAfterPage() {
    console.log('▶️ Resuming all animations...');
    
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
    
    console.log('✅ All animations resumed');
}

// Handle escape key to close any active page
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const contactOverlay = document.getElementById('contact-overlay');
        const aboutOverlay = document.getElementById('about-overlay');
        const portfolioOverlay = document.getElementById('portfolio-overlay');
        const treesOverlay = document.getElementById('trees-overlay');
        
        if (contactOverlay && contactOverlay.classList.contains('active')) {
            closeContactPage();
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
window.reverseSatelliteFadeIn = reverseSatelliteFadeIn;
window.openContactPage = openContactPage;
window.closeContactPage = closeContactPage;
window.openAboutPage = openAboutPage;
window.closeAboutPage = closeAboutPage;
window.openPortfolioPage = openPortfolioPage;
window.closePortfolioPage = closePortfolioPage;
window.openTreesPage = openTreesPage;
window.closeTreesPage = closeTreesPage;
