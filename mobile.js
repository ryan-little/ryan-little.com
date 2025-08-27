// Mobile-specific optimizations and touch handling
console.log('📱 Mobile.js loaded, DeviceInfo.isMobile:', typeof DeviceInfo !== 'undefined' ? DeviceInfo.isMobile : 'undefined');

// Mobile touch optimizations
function optimizeMobileTouch() {
    if (!DeviceInfo.isMobile) {
        console.log('❌ Mobile touch optimization skipped - not mobile device');
        return;
    }
    
    console.log('📱 Applying mobile touch optimizations...');
    // Optimize touch targets
    const touchElements = document.querySelectorAll('.satellite, .social-link, .mobile-link-item');
    touchElements.forEach(element => {
        element.style.minWidth = '44px';
        element.style.minHeight = '44px';
        element.style.touchAction = 'manipulation';
        element.style.webkitTapHighlightColor = 'transparent';
        element.style.webkitTouchCallout = 'none';
        element.style.webkitUserSelect = 'none';
        element.style.userSelect = 'none';
    });
    
    // Optimize animations for mobile performance
    const animatedElements = document.querySelectorAll('.stars, .background-image');
    animatedElements.forEach(element => {
        element.style.animationDuration = '60s';
        ['webkit', 'moz', 'o'].forEach(prefix => {
            element.style[`${prefix}AnimationDuration`] = '60s';
        });
    });
    
    // Reduce satellite animation complexity on mobile
    const satellites = document.querySelectorAll('.satellite');
    satellites.forEach(satellite => {
        satellite.style.animationDuration = '15s';
        ['webkit', 'moz', 'o'].forEach(prefix => {
            satellite.style[`${prefix}AnimationDuration`] = '15s';
        });
    });
}

// Landscape mobile optimizations
function optimizeLandscapeMobile() {
    if (!DeviceInfo.isMobile) return;
    
    const isLandscape = window.innerHeight < window.innerWidth;
    
    if (isLandscape) {
        // Adjust hero title spacing for landscape
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            heroTitle.style.marginBottom = '0.5rem';
        }
        
        // Adjust social links spacing for landscape
        const socialLinks = document.querySelector('.social-links');
        if (socialLinks) {
            socialLinks.style.marginTop = '0.5rem';
        }
        
        // Adjust satellite sizes for landscape
        const satellites = document.querySelectorAll('.satellite');
        satellites.forEach(satellite => {
            satellite.style.width = '70px';
            satellite.style.height = '52.5px';
        });
    }
}

// High DPI mobile display optimizations
function optimizeHighDPIDisplays() {
    if (!DeviceInfo.isMobile) return;
    
    if (DeviceInfo.pixelRatio >= 2) {
        // Optimize star background size for high DPI displays
        const stars = document.querySelector('.stars');
        if (stars) {
            stars.style.backgroundSize = '80px 80px, 80px 80px, 80px 80px, 80px 80px, 80px 80px';
        }
    }
}

// Touch feedback optimizations
function optimizeTouchFeedback() {
    if (!DeviceInfo.isMobile) return;
    
    // Add touch feedback for interactive elements
    const touchElements = document.querySelectorAll('.satellite, .social-link, .mobile-link-item');
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        }, { passive: true });
        
        element.addEventListener('touchcancel', function() {
            this.style.transform = 'scale(1)';
        }, { passive: true });
    });
    
    // Debug social link touch events
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach((link, index) => {
        console.log(`🔗 Social link ${index + 1}:`, {
            element: link,
            zIndex: window.getComputedStyle(link).zIndex,
            pointerEvents: window.getComputedStyle(link).pointerEvents,
            position: window.getComputedStyle(link).position
        });
        
        // Add click event listener for debugging
        link.addEventListener('click', function(e) {
            console.log('✅ Social link clicked!', e.target);
        });
        
        // Add touch event listener for debugging
        link.addEventListener('touchstart', function(e) {
            console.log('👆 Social link touch start!', e.target);
        }, { passive: false });
    });
}

// Mobile scroll optimizations
function optimizeMobileScrolling() {
    if (!DeviceInfo.isMobile) return;
    
    // Enable smooth scrolling on mobile
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.webkitOverflowScrolling = 'touch';
    }
    
    // Prevent overscroll bounce on iOS
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
}

// Initialize all mobile optimizations
function initMobileOptimizations() {
    if (!DeviceInfo.isMobile) return;
    
    optimizeMobileTouch();
    optimizeLandscapeMobile();
    optimizeHighDPIDisplays();
    optimizeTouchFeedback();
    optimizeMobileScrolling();
    
    // Add resize listener for orientation changes
    window.addEventListener('resize', () => {
        setTimeout(() => {
            optimizeLandscapeMobile();
            optimizeMobileTouch();
        }, 100);
    });
    
    // Add orientation change listener
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            optimizeLandscapeMobile();
            optimizeMobileTouch();
        }, 100);
    });
}

// Initialize mobile optimizations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileOptimizations);
} else {
    initMobileOptimizations();
}
