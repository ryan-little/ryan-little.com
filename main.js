// Main entry point for Ryan Little's personal website
// Ensures proper module loading order and initialization

// Wait for all modules to load
document.addEventListener('DOMContentLoaded', function() {
    // Verify all required functions are available
    if (typeof initializeWebsite !== 'function') {
        console.error('❌ Core module failed to load');
        return;
    }
    
    if (typeof initShootingStars !== 'function') {
        console.error('❌ Animations module failed to load');
        return;
    }
    
    if (typeof startMinigame !== 'function') {
        console.error('❌ Minigame module failed to load');
        return;
    }
    
    // Initialize mobile optimizations if available
    if (typeof initMobileOptimizations !== 'function') {
        console.error('❌ Mobile module failed to load');
        return;
    }
    
    // Initialize Earth Night System only on desktop
    if (typeof EarthNightSystem !== 'undefined' && !DeviceInfo?.isMobile) {
        EarthNightSystem.init();
    }
    
    // Website initialized successfully
    console.log('🚀 Website ready');
});

// Add error handling for script loading
window.addEventListener('error', function(e) {
    if (e.target.tagName === 'SCRIPT') {
        console.error('❌ Script loading error:', e.target.src);
    }
});

// Performance monitoring (silent)
window.addEventListener('load', function() {
    // Performance monitoring active but silent
});


