// Main entry point for Ryan Little's personal website
// Ensures proper module loading order and initialization

// Wait for all modules to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Randomize background positions for visual variety
    randomizeBackgroundPositions();
    
    // Verify all required functions are available
    if (typeof initializeWebsite !== 'function') {
        return;
    }
    
    if (typeof initShootingStars !== 'function') {
        return;
    }
    
    if (typeof startMinigame !== 'function') {
        return;
    }
    
    // Check DeviceInfo availability
    if (typeof DeviceInfo === 'undefined') {
        console.warn('DeviceInfo not available, using fallback detection');
    } else {
        console.log('DeviceInfo loaded successfully');
    }
    
    // Initialize device-specific optimizations if available
    if (typeof initMobileOptimizations === 'function') {
        // Mobile version
        initMobileOptimizations();
    } else if (typeof initDesktopOptimizations === 'function') {
        // Desktop version
        initDesktopOptimizations();
    } else {
        console.warn('No device-specific optimizations available');
    }
    
    // Website initialized successfully
});

// Add error handling for script loading
window.addEventListener('error', function(e) {
    if (e.target.tagName === 'SCRIPT') {
        console.error('Script loading error:', e.target.src, e.error);
    }
});

// Performance monitoring and optimizations
window.addEventListener('load', function() {
    // Enable hardware acceleration for better performance
    const animatedElements = document.querySelectorAll('.stars, .background-image, .background2, .satellite, .earth-sprite');
    animatedElements.forEach(element => {
        if (element) {
            element.style.transform = 'translateZ(0)';
            element.style.willChange = 'transform';
        }
    });
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(event) {
        // ESC key to close any open overlays
        if (event.key === 'Escape') {
            const activeOverlay = document.querySelector('.adventures-overlay.active, .about-overlay.active, .portfolio-overlay.active, .trees-overlay.active');
            if (activeOverlay) {
                activeOverlay.classList.remove('active');
            }
        }
    });
    
    // Add focus management for accessibility
    const focusableElements = document.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '2px solid #00d4ff';
            this.style.outlineOffset = '2px';
        });
        
        element.addEventListener('blur', function() {
            this.style.outline = '';
            this.style.outlineOffset = '';
        });
    });
});

// Background randomization function
function randomizeBackgroundPositions() {
    // Generate random starting positions for backgrounds
    // This ensures they're never in the same position twice
    
    // Check if we're on mobile for different positioning strategy
    const isMobile = window.innerWidth <= 768;
    
    // Random horizontal position for main background (0-100vw range)
    const mainBgOffsetX = Math.random() * 100;
    
    // Random vertical position for main background - desktop only (mobile uses 0 for proper tiling)
    let mainBgOffsetY;
    if (isMobile) {
        // On mobile: no vertical variance to ensure proper tiling coverage
        mainBgOffsetY = 0;
    } else {
        // On desktop: smaller range (-20vh to +20vh) for subtle movement
        mainBgOffsetY = (Math.random() * 40) - 20;
    }
    
    // Random horizontal position for secondary background (0-100vw range) - completely independent
    const secondaryBgOffsetX = Math.random() * 100;
    
    // Random vertical position for secondary background - desktop only (mobile uses 0 for proper tiling)
    let secondaryBgOffsetY;
    if (isMobile) {
        // On mobile: no vertical variance to ensure proper tiling coverage
        secondaryBgOffsetY = 0;
    } else {
        // On desktop: smaller range (-20vh to +20vh) for subtle movement
        secondaryBgOffsetY = (Math.random() * 40) - 20;
    }
    
    // Apply the random positions with both horizontal and vertical variance
    const mainBg = document.querySelector('.background-image');
    const secondaryBg = document.querySelector('.background2');
    
    if (mainBg) {
        mainBg.style.backgroundPosition = `${mainBgOffsetX}vw ${mainBgOffsetY}vh, ${mainBgOffsetX + 100}vw ${mainBgOffsetY}vh`;
    }
    
    if (secondaryBg) {
        secondaryBg.style.backgroundPosition = `${secondaryBgOffsetX}vw ${secondaryBgOffsetY}vh, ${secondaryBgOffsetX + 100}vw ${secondaryBgOffsetY}vh`;
    }
    
}

// Make function available globally for potential future use (e.g., button click)
window.randomizeBackgroundPositions = randomizeBackgroundPositions;

// Re-randomize backgrounds when switching between mobile and desktop
let lastWindowWidth = window.innerWidth;
window.addEventListener('resize', function() {
    const currentWidth = window.innerWidth;
    const wasMobile = lastWindowWidth <= 768;
    const isMobile = currentWidth <= 768;
    
    // Only re-randomize if we cross the mobile/desktop threshold
    if (wasMobile !== isMobile) {
        randomizeBackgroundPositions();
    }
    
    lastWindowWidth = currentWidth;
});


