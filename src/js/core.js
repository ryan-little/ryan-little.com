// Core functionality for Ryan Little's personal website
// Handles initialization, browser detection, and core utilities

// Wait for DOM to be ready before defining DeviceInfo
document.addEventListener('DOMContentLoaded', function() {
    // Unified device and browser detection
    window.DeviceInfo = {
    // Check for mobile user agent and viewport size
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
              (window.innerWidth <= 1024),
    isEdge: navigator.userAgent.includes('Edge') || navigator.userAgent.includes('Edg'),
    isFirefox: navigator.userAgent.includes('Firefox'),
    isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    isChrome: /Chrome/.test(navigator.userAgent),
    pixelRatio: window.devicePixelRatio || 1
};

    // Make DeviceInfo available globally
    window.DeviceInfo = DeviceInfo;
    
    // Make EarthNightSystem available globally
    window.EarthNightSystem = EarthNightSystem;
});



// Simple Earth Night Dimming System (Desktop Only)
const EarthNightSystem = {
    earthElement: null,
    updateInterval: null,
    
    init() {
        // Only initialize on desktop (screen width > 1024px)
        if (window.innerWidth <= 1024) {
            console.log('🌍 Earth Night System disabled on mobile devices');
            return;
        }
        
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
        
        // Handle window resize to show/hide effect
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 1024) {
                // Reset to normal brightness on mobile
                if (this.earthElement) {
                    this.earthElement.style.filter = 'brightness(1.1) contrast(1.1)';
                    this.earthElement.style.transition = 'none';
                }
            } else {
                // Apply appropriate brightness on desktop
                this.updateEarthBrightness();
            }
        });
        
        console.log('🌍 Earth Night System updates started');
    },
    
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    },
    

};

// Performance optimizations
const PerformanceOptimizer = {
    optimizeForDevice: () => {
        console.log('🚀 PerformanceOptimizer.optimizeForDevice called, isMobile:', DeviceInfo.isMobile);
        
        if (DeviceInfo.isMobile) {
            console.log('📱 Applying mobile optimizations...');
            
            // Reduce animation complexity on mobile
            const stars = document.querySelector('.stars');
            if (stars) {
                stars.style.animationDuration = '60s';
                ['webkit', 'moz', 'o'].forEach(prefix => {
                    stars.style[`${prefix}AnimationDuration`] = '60s';
                });
                console.log('⭐ Stars animation optimized for mobile');
            }
            
            // Optimize touch interactions
            const satellites = document.querySelectorAll('.satellite');
            satellites.forEach(satellite => {
                satellite.style.touchAction = 'manipulation';
                satellite.style.webkitTouchCallout = 'none';
                satellite.style.webkitUserSelect = 'none';
            });
            console.log('🛰️ Satellites optimized for mobile touch');
        } else {
            console.log('💻 Desktop optimizations applied');
        }
    },
    
    applyBrowserFixes: () => {
        if (DeviceInfo.isEdge) {
            // Fix for Edge star rendering - use smaller size for desktop
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
        
        if (DeviceInfo.isIOS) {
            // Fix for iOS viewport height issues
            const hero = document.querySelector('.hero');
            if (hero) {
                hero.style.minHeight = '-webkit-fill-available';
            }
            
            // Fix for iOS transform issues
            const transformElements = document.querySelectorAll('.satellite, .hero-background, .stars');
            transformElements.forEach(el => {
                el.style.webkitTransform = 'translate3d(0, 0, 0)';
                el.style.transform = 'translate3d(0, 0, 0)';
            });
        }
        
        if (DeviceInfo.isAndroid && DeviceInfo.isChrome) {
            // Optimize star background size for Android - use smaller size for desktop
            const stars = document.querySelector('.stars');
            if (stars) {
                stars.style.backgroundSize = '120px 120px, 120px 120px, 120px 120px, 120px 120px, 120px 120px';
            }
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWebsite);
} else {
    initializeWebsite();
}

function initializeWebsite() {
    // Initialize satellite movement
    initSatelliteMovement();
    
    // Initialize shooting stars
    initShootingStars();
    
    // Add loading animation
    document.body.classList.add('loaded');
    
    // Apply device-specific optimizations
    PerformanceOptimizer.optimizeForDevice();
    PerformanceOptimizer.applyBrowserFixes();
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
    
    // Add hover functionality to pause all satellite animations
    let isHovering = false;
    
    satellites.forEach(satellite => {
        satellite.addEventListener('mouseenter', () => {
            if (!isHovering) {
                isHovering = true;
                console.log('🛰️ Satellite hovered - pausing all satellite animations');
                
                // Pause all satellite orbital animations
                satellites.forEach(sat => {
                    sat.style.animationPlayState = 'paused';
                });
            }
        });
        
        satellite.addEventListener('mouseleave', () => {
            if (isHovering) {
                isHovering = false;
                console.log('🛰️ Satellite hover ended - resuming all satellite animations');
                
                // Resume all satellite orbital animations
                satellites.forEach(sat => {
                    sat.style.animationPlayState = 'running';
                });
            }
        });
    });
}


