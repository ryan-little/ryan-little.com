// Core functionality for Ryan Little's personal website
// Handles initialization, browser detection, and core utilities

// Wait for DOM to be ready before defining DeviceInfo
document.addEventListener('DOMContentLoaded', function() {
    // Browser detection (device detection is handled by specific mobile/desktop modules)
    window.DeviceInfo = {
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
});



// Earth Night System is now handled by desktop.js

// Shared performance optimizations
const PerformanceOptimizer = {
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
    // Initialize shooting stars
    initShootingStars();
    
    // Add loading animation
    document.body.classList.add('loaded');
    
    // Apply browser-specific fixes
    PerformanceOptimizer.applyBrowserFixes();
}



// Satellite movement is now handled by desktop.js


