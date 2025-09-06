// Desktop-specific functionality for Ryan Little's personal website
// Handles satellite navigation, Earth night system, and desktop optimizations

console.log('💻 Desktop.js loaded - Desktop optimizations active');

// Desktop-specific device info (always desktop)
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
        if (DeviceInfo.isEdge) {
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
        
        if (DeviceInfo.isFirefox) {
            // Firefox-specific optimizations
            const animatedElements = document.querySelectorAll('.satellite, .hero-background, .stars');
            animatedElements.forEach(el => {
                el.style.transform = 'translateZ(0)';
            });
        }
        
        if (DeviceInfo.isSafari) {
            // Safari-specific optimizations
            const transformElements = document.querySelectorAll('.satellite, .hero-background, .stars');
            transformElements.forEach(el => {
                el.style.webkitTransform = 'translate3d(0, 0, 0)';
                el.style.transform = 'translate3d(0, 0, 0)';
            });
        }
    }
};

// Initialize dynamic satellite movement (Desktop Only)
function initSatelliteMovement() {
    console.log('🛰️ Initializing desktop satellite movement...');
    
    const satellites = document.querySelectorAll('.satellite');
    
    // Define distance ranges for each satellite (largest possible spread, different speeds)
    const distanceRanges = [
        { min: 280, max: 410, current: 345, speed: 0.3 },
        { min: 280, max: 410, current: 345, speed: 0.4 },
        { min: 280, max: 410, current: 345, speed: 0.5 },
        { min: 280, max: 400, current: 345, speed: 0.6 }
    ];
    
    // Add hover functionality to pause all satellite orbital animations while keeping spinning
    let isHovering = false;
    let isPageVisible = true;
    let isPageActive = false; // Track if we're actively in a page
    let animationId = null; // Track the animation frame ID
    
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
        if (!isHovering && !isPageActive) {
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
        }
        
        animationId = requestAnimationFrame(animateSatellites);
    }
    
    // Start the animation
    animateSatellites();
    
    // Page visibility API to maintain pause state when switching tabs
    document.addEventListener('visibilitychange', () => {
        isPageVisible = !document.hidden;
        if (!isPageVisible && (isHovering || isPageActive)) {
            // Keep paused when page is not visible and was hovering or in a page
            console.log('🛰️ Page hidden - maintaining satellite pause state');
        } else if (isPageVisible && (isHovering || isPageActive)) {
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
        isPageActive = true;
        pauseAllOrbitalAnimations();
        console.log('🛰️ Satellites paused for page navigation');
    };
    
    // Function to resume after page navigation (will be called by back button)
    window.resumeSatellitesAfterPage = function() {
        isPageActive = false;
        if (!isHovering) {
            resumeAllOrbitalAnimations();
            console.log('🛰️ Satellites resumed after page navigation');
        }
    };
    
    satellites.forEach((satellite, index) => {
        // Mouse events for desktop
        satellite.addEventListener('mouseenter', () => {
            if (!isHovering) {
                isHovering = true;
                console.log('🛰️ Satellite hovered - pausing orbital animations, keeping spinning');
                pauseAllOrbitalAnimations();
            }
        });
        
        satellite.addEventListener('mouseleave', () => {
            if (isHovering) {
                isHovering = false;
                console.log('🛰️ Satellite hover ended - resuming orbital animations');
                if (!isPageActive) {
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
                // Add navigation logic here when pages are implemented
                // For now, just log the target
            }
        });
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

// Export for global access
window.initDesktopOptimizations = initDesktopOptimizations;
window.EarthNightSystem = EarthNightSystem;
