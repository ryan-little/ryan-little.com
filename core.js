// Core functionality for Ryan Little's personal website
// Handles initialization, browser detection, and core utilities

// Unified device and browser detection
const DeviceInfo = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768,
    isEdge: navigator.userAgent.includes('Edge') || navigator.userAgent.includes('Edg'),
    isFirefox: navigator.userAgent.includes('Firefox'),
    isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
    isAndroid: /Android/.test(navigator.userAgent),
    isChrome: /Chrome/.test(navigator.userAgent),
    pixelRatio: window.devicePixelRatio || 1
};

// Cross-browser utilities
const BrowserUtils = {
    addEvent: (element, event, handler) => {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + event, handler);
        }
    },
    
    setCSSProperty: (element, property, value) => {
        if (element.style.setProperty) {
            element.style.setProperty(property, value);
        } else {
            element.style[property] = value;
        }
    },
    
    supportsTransform3d: (() => {
        const el = document.createElement('div');
        el.style.transform = 'translate3d(0,0,0)';
        return el.style.transform !== '';
    })()
};

// Performance optimizations
const PerformanceOptimizer = {
    optimizeForDevice: () => {
        if (DeviceInfo.isMobile) {
            // Reduce animation complexity on mobile
            const stars = document.querySelector('.stars');
            if (stars) {
                stars.style.animationDuration = '60s';
                ['webkit', 'moz', 'o'].forEach(prefix => {
                    stars.style[`${prefix}AnimationDuration`] = '60s';
                });
            }
            
            // Optimize touch interactions
            const satellites = document.querySelectorAll('.satellite');
            satellites.forEach(satellite => {
                satellite.style.touchAction = 'manipulation';
                satellite.style.webkitTouchCallout = 'none';
                satellite.style.webkitUserSelect = 'none';
            });
        }
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
            // Optimize star background size for Android
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
    // Initialize stars with browser-specific optimizations
    generateRandomStars();
    
    // Initialize satellite movement
    initSatelliteMovement();
    
    // Initialize shooting stars
    initShootingStars();
    
    // Add loading animation
    document.body.classList.add('loaded');
    
    // Apply device-specific optimizations
    PerformanceOptimizer.optimizeForDevice();
    PerformanceOptimizer.applyBrowserFixes();
    
    // Debug social links
    debugSocialLinks();
}

// Generate Random Star Field with cross-browser compatibility
function generateRandomStars() {
    const stars = document.querySelector('.stars');
    if (!stars) return;
    
    // Clear existing stars
    stars.style.backgroundImage = '';
    
    // Browser-specific star generation
    let starCSS = '';
    const numStars = DeviceInfo.isMobile ? 120 : 180; // Reduce stars on mobile for performance
    
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
        if (DeviceInfo.isEdge || DeviceInfo.isFirefox) {
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

// Debug function to check social links
function debugSocialLinks() {
    setTimeout(() => {
        const socialLinks = document.querySelectorAll('.social-link');
        const socialLinksContainer = document.querySelector('.social-links');
        
        console.log('🔗 Social Links Debug:', {
            container: socialLinksContainer,
            containerZIndex: socialLinksContainer ? window.getComputedStyle(socialLinksContainer).zIndex : 'N/A',
            containerPosition: socialLinksContainer ? window.getComputedStyle(socialLinksContainer).position : 'N/A',
            linksCount: socialLinks.length,
            links: Array.from(socialLinks).map((link, index) => ({
                index,
                element: link,
                href: link.href,
                zIndex: window.getComputedStyle(link).zIndex,
                position: window.getComputedStyle(link).position,
                pointerEvents: window.getComputedStyle(link).pointerEvents,
                display: window.getComputedStyle(link).display,
                opacity: window.getComputedStyle(link).opacity,
                transform: window.getComputedStyle(link).transform
            }))
        });
        
        // Test click events
        socialLinks.forEach((link, index) => {
            link.addEventListener('click', function(e) {
                console.log(`✅ Social link ${index + 1} clicked!`, e.target.href);
            });
            
            link.addEventListener('mouseenter', function(e) {
                console.log(`🖱️ Social link ${index + 1} mouse enter`);
            });
        });
        
        // Check if shooting star container is covering social links
        const shootingStarContainer = document.querySelector('.shooting-star-container');
        if (shootingStarContainer) {
            console.log('⭐ Shooting Star Container:', {
                element: shootingStarContainer,
                zIndex: window.getComputedStyle(shootingStarContainer).zIndex,
                position: window.getComputedStyle(shootingStarContainer).position,
                pointerEvents: window.getComputedStyle(shootingStarContainer).pointerEvents
            });
        }
        
        // Fallback: ensure social links are visible after 3 seconds
        setTimeout(() => {
            if (socialLinksContainer && window.getComputedStyle(socialLinksContainer).opacity === '0') {
                console.log('⚠️ Social links animation may have failed, applying fallback');
                socialLinksContainer.classList.add('loaded');
            }
        }, 3000);
    }, 1000);
}
