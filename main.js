// Main entry point for Ryan Little's personal website
// Ensures proper module loading order and initialization

// Wait for all modules to load
document.addEventListener('DOMContentLoaded', function() {
    // Verify all required functions are available
    if (typeof initializeWebsite === 'function') {
        console.log('✅ Core module loaded successfully');
    } else {
        console.error('❌ Core module failed to load');
    }
    
    if (typeof initShootingStars === 'function') {
        console.log('✅ Animations module loaded successfully');
    } else {
        console.error('❌ Animations module failed to load');
    }
    
    if (typeof startMinigame === 'function') {
        console.log('✅ Minigame module loaded successfully');
    } else {
        console.error('❌ Minigame module failed to load');
    }
    
    // Initialize mobile optimizations if available
    if (typeof initMobileOptimizations === 'function') {
        console.log('✅ Mobile module loaded successfully');
    } else {
        console.error('❌ Mobile module failed to load');
    }
    
    // Initialize Earth Night System if available
    if (typeof EarthNightSystem !== 'undefined') {
        console.log('✅ Earth Night System loaded successfully');
        EarthNightSystem.init();
    } else {
        console.log('❌ Earth Night System failed to load');
    }
    
    // Log device information for debugging
    if (typeof DeviceInfo !== 'undefined') {
        console.log('📱 Device Info:', {
            isMobile: DeviceInfo.isMobile,
            isEdge: DeviceInfo.isEdge,
            isFirefox: DeviceInfo.isFirefox,
            isSafari: DeviceInfo.isSafari,
            isIOS: DeviceInfo.isIOS,
            isAndroid: DeviceInfo.isAndroid,
            isChrome: DeviceInfo.isChrome,
            pixelRatio: DeviceInfo.pixelRatio
        });
    }
    
    console.log('🚀 Website initialized successfully!');
});

// Add error handling for script loading
window.addEventListener('error', function(e) {
    if (e.target.tagName === 'SCRIPT') {
        console.error('❌ Script loading error:', e.target.src);
    }
});

// Add performance monitoring
window.addEventListener('load', function() {
    // Log performance metrics
    if ('performance' in window) {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('⚡ Performance:', {
            loadTime: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
            domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
            firstPaint: performance.getEntriesByType('paint')[0]?.startTime
        });
    }
    
    // Initialize night mode detection - REMOVED
    // initNightMode();
});

// Night mode detection and management - REMOVED
