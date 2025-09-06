// Mobile-specific optimizations and touch handling for Ryan Little's website
// Redesigned to match desktop experience while maintaining minigame functionality
// Performance optimized for smooth mobile experience

console.log('📱 Mobile-new.js loaded - Performance optimized for mobile');

// Mobile-specific device info (always mobile)
// Override the default DeviceInfo with mobile-specific values
if (typeof window.DeviceInfo !== 'undefined') {
    window.DeviceInfo.isMobile = true;
} else {
    // Fallback if core.js hasn't loaded yet
    window.DeviceInfo = {
        isMobile: true,
        isEdge: navigator.userAgent.includes('Edge') || navigator.userAgent.includes('Edg'),
        isFirefox: navigator.userAgent.includes('Firefox'),
        isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isAndroid: /Android/.test(navigator.userAgent),
        isChrome: /Chrome/.test(navigator.userAgent),
        pixelRatio: window.devicePixelRatio || 1
    };
}

// Mobile-specific optimizations and touch handling
function optimizeMobileTouch() {
    console.log('📱 Applying redesigned mobile touch optimizations...');
    
    // Optimize touch targets for all interactive elements
    const touchElements = document.querySelectorAll('.social-link, .mobile-link-item, .minigame-score');
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
        element.style.animationDuration = '90s';
        ['webkit', 'moz', 'o'].forEach(prefix => {
            element.style[`${prefix}AnimationDuration`] = '90s';
        });
    });
    
    console.log('🛰️ Mobile touch optimizations applied');
}

// Responsive mobile layout adjustments
function optimizeMobileLayout() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adjust hero content positioning based on viewport - use CSS default
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        // Use CSS default positioning (top: 20px) but allow some adjustment for very small screens
        const topPosition = Math.max(20, Math.min(60, viewportHeight * 0.05));
        heroContent.style.top = `${topPosition}px`;
        heroContent.style.paddingTop = '0';
    }
    
    // Adjust Earth sprite size based on viewport - work with CSS defaults
    const earthSprite = document.querySelector('.earth-sprite');
    if (earthSprite) {
        // Use CSS default of 300px for mobile, but allow some adjustment for very small screens
        const earthSize = Math.min(300, Math.max(250, viewportWidth * 0.4));
        earthSprite.style.width = `${earthSize}px`;
        earthSprite.style.height = `${earthSize}px`;
        
        // Let CSS handle positioning - don't override
        // earthSprite.style.top = '50%';
        // earthSprite.style.left = '50%';
        // earthSprite.style.transform = 'translate(-50%, -50%)';
    }
    
    // Adjust mobile link tree positioning - move way up
    const mobileLinkTree = document.querySelector('.mobile-link-tree');
    if (mobileLinkTree) {
        const treeTop = Math.max(10, viewportHeight * 0.08);
        mobileLinkTree.style.marginTop = `${treeTop}px`;
    }
    
    // Adjust social links positioning - let them flow naturally
    const socialLinks = document.querySelector('.social-links');
    if (socialLinks) {
        socialLinks.style.position = 'relative';
        socialLinks.style.top = 'auto';
        socialLinks.style.left = 'auto';
        socialLinks.style.transform = 'none';
    }
}

// Landscape mobile optimizations
function optimizeLandscapeMobile() {
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
        
        // Adjust Earth sprite for landscape
        const earthSprite = document.querySelector('.earth-sprite');
        if (earthSprite) {
            earthSprite.style.width = '200px';
            earthSprite.style.height = '200px';
            earthSprite.style.top = '100px';
        }
        
        // Adjust mobile link tree for landscape
        const mobileLinkTree = document.querySelector('.mobile-link-tree');
        if (mobileLinkTree) {
            mobileLinkTree.style.marginTop = '40px';
        }
    }
}

// High DPI mobile display optimizations
function optimizeHighDPIDisplays() {
    if (DeviceInfo.pixelRatio >= 2) {
        // Optimize star background size for high DPI displays
        const stars = document.querySelector('.stars');
        if (stars) {
            stars.style.backgroundSize = '80px 80px, 80px 80px, 80px 80px, 80px 80px, 80px 80px';
        }
    }
}

// Enhanced touch feedback for mobile with sleek interactions
function optimizeTouchFeedback() {
    // Add enhanced touch feedback for mobile link items
    const mobileLinkItems = document.querySelectorAll('.mobile-link-item');
    mobileLinkItems.forEach(element => {
        element.addEventListener('touchstart', function(e) {
            // Add ripple effect
            const ripple = document.createElement('div');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.left = (e.touches[0].clientX - this.offsetLeft) + 'px';
            ripple.style.top = (e.touches[0].clientY - this.offsetTop) + 'px';
            ripple.style.width = ripple.style.height = '100px';
            ripple.style.marginLeft = '-50px';
            ripple.style.marginTop = '-50px';
            ripple.style.pointerEvents = 'none';
            
            this.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            // Smooth return to normal state
            this.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
        }, { passive: true });
        
        element.addEventListener('touchcancel', function() {
            // Smooth return to normal state
            this.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
        }, { passive: true });
    });
    
    // Enhanced touch feedback for social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.92) translateY(-1px)';
            this.style.transition = 'all 0.1s ease';
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1) translateY(0)';
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }, { passive: true });
        
        element.addEventListener('touchcancel', function() {
            this.style.transform = 'scale(1) translateY(0)';
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        }, { passive: true });
    });
    
    // Enhanced touch feedback for minigame elements
    const minigameElements = document.querySelectorAll('.minigame-score');
    minigameElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        }, { passive: true });
    });
}

// Mobile scroll optimizations
function optimizeMobileScrolling() {
    // Enable smooth scrolling on mobile
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.webkitOverflowScrolling = 'touch';
    }
    
    // Prevent overscroll bounce on iOS
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
}

// Comprehensive mobile performance optimizations
function optimizeMobilePerformance() {
    console.log('🚀 Applying mobile performance optimizations...');
    
    // Reduce animation complexity for better performance
    const animatedElements = document.querySelectorAll('.stars, .background-image, .background2');
    animatedElements.forEach(element => {
        // Use transform3d for hardware acceleration
        element.style.transform = 'translateZ(0)';
        element.style.webkitTransform = 'translateZ(0)';
        
        // Optimize will-change property
        element.style.willChange = 'transform';
        
        // Reduce animation duration for smoother performance
        if (element.classList.contains('stars')) {
            element.style.animationDuration = '67.5s';
        } else if (element.classList.contains('background-image')) {
            element.style.animationDuration = '135s';
        } else if (element.classList.contains('background2')) {
            element.style.animationDuration = '180s';
        }
    });
    
    // Optimize mobile link items for performance
    const mobileLinks = document.querySelectorAll('.mobile-link-item');
    mobileLinks.forEach(link => {
        // Use transform3d for hardware acceleration
        link.style.transform = 'translateZ(0)';
        link.style.webkitTransform = 'translateZ(0)';
        
        // Optimize transitions with smoother easing
        link.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // Reduce box-shadow complexity
        link.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        
        // Ensure smooth animation performance
        link.style.willChange = 'transform, opacity';
        link.style.webkitBackfaceVisibility = 'hidden';
        link.style.backfaceVisibility = 'hidden';
    });
    
    // Optimize Earth sprite performance
    const earthSprite = document.querySelector('.earth-sprite');
    if (earthSprite) {
        earthSprite.style.transform = 'translateZ(0)';
        earthSprite.style.webkitTransform = 'translateZ(0)';
        earthSprite.style.willChange = 'transform';
    }
    
    // Optimize social links
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.style.transform = 'translateZ(0)';
        link.style.webkitTransform = 'translateZ(0)';
        link.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    });
    
    // Optimize mobile link tree container
    const mobileLinkTree = document.querySelector('.mobile-link-tree');
    if (mobileLinkTree) {
        mobileLinkTree.style.transform = 'translateZ(0)';
        mobileLinkTree.style.webkitTransform = 'translateZ(0)';
        mobileLinkTree.style.willChange = 'transform';
        mobileLinkTree.style.webkitBackfaceVisibility = 'hidden';
        mobileLinkTree.style.backfaceVisibility = 'hidden';
    }
    
    // Reduce backdrop-filter usage on lower-end devices
    if (DeviceInfo.pixelRatio < 2) {
        const backdropElements = document.querySelectorAll('.mobile-link-item, .social-link');
        backdropElements.forEach(element => {
            element.style.backdropFilter = 'none';
            element.style.webkitBackdropFilter = 'none';
            element.style.background = 'rgba(255, 255, 255, 0.2)';
        });
    }
    
    // Optimize touch interactions
    const touchElements = document.querySelectorAll('.mobile-link-item, .social-link');
    touchElements.forEach(element => {
        element.style.touchAction = 'manipulation';
        element.style.webkitTapHighlightColor = 'transparent';
        element.style.webkitTouchCallout = 'none';
    });
    
    console.log('✅ Mobile performance optimizations applied');
}

// Responsive font sizing for mobile
function optimizeMobileTypography() {
    const viewportWidth = window.innerWidth;
    
    // Adjust hero title size based on viewport width
    const heroTitle = document.querySelector('.hero-title .title-line');
    if (heroTitle && !heroTitle.dataset.restored && !heroTitle.dataset.protected) {
        if (viewportWidth <= 375) {
            heroTitle.style.fontSize = '2.5rem';
        } else if (viewportWidth <= 414) {
            heroTitle.style.fontSize = '2.8rem';
        } else {
            heroTitle.style.fontSize = '3rem';
        }
        // Ensure title is properly stacked
        heroTitle.style.display = 'block';
        heroTitle.style.marginBottom = '0.5rem';
        heroTitle.style.width = '100%';
        heroTitle.style.textAlign = 'center';
        heroTitle.style.float = 'none';
        heroTitle.style.clear = 'both';
    }
    
    // Adjust subtitle size and ensure it's below the title
    const subtitle = document.querySelector('.hero-title .title-subtitle');
    if (subtitle && !subtitle.dataset.restored && !subtitle.dataset.protected) {
        if (viewportWidth <= 375) {
            subtitle.style.fontSize = '1rem';
        } else if (viewportWidth <= 414) {
            subtitle.style.fontSize = '1.1rem';
        } else {
            subtitle.style.fontSize = '1.2rem';
        }
        // Ensure subtitle appears below the title
        subtitle.style.display = 'block';
        subtitle.style.marginTop = '0';
        subtitle.style.marginBottom = '1.5rem';
        subtitle.style.width = '100%';
        subtitle.style.textAlign = 'center';
        subtitle.style.float = 'none';
        subtitle.style.clear = 'both';
    }
}

// Force title stacking on mobile - call this after a short delay to ensure DOM is ready
function forceTitleStacking() {
    setTimeout(() => {
        const heroTitle = document.querySelector('.hero-title');
        const titleLine = document.querySelector('.hero-title .title-line');
        const titleSubtitle = document.querySelector('.hero-title .title-subtitle');
        
        if (heroTitle && titleLine && titleSubtitle && !heroTitle.dataset.restored && !heroTitle.dataset.protected) {
            // Force flexbox layout
            heroTitle.style.display = 'flex';
            heroTitle.style.flexDirection = 'column';
            heroTitle.style.alignItems = 'center';
            heroTitle.style.justifyContent = 'center';
            heroTitle.style.width = '100%';
            
            // Force block display for title elements (only if not restored or protected)
            if (!titleLine.dataset.restored && !titleLine.dataset.protected) {
                titleLine.style.display = 'block';
                titleLine.style.width = '100%';
                titleLine.style.textAlign = 'center';
                titleLine.style.marginBottom = '0.5rem';
                titleLine.style.float = 'none';
                titleLine.style.clear = 'both';
            }
            
            if (!titleSubtitle.dataset.restored && !titleSubtitle.dataset.protected) {
                titleSubtitle.style.display = 'block';
                titleSubtitle.style.width = '100%';
                titleSubtitle.style.textAlign = 'center';
                titleSubtitle.style.marginBottom = '1.5rem';
                titleSubtitle.style.marginTop = '0';
                titleSubtitle.style.float = 'none';
                titleSubtitle.style.clear = 'both';
            }
            
            console.log('🎯 Forced title stacking on mobile');
        }
    }, 100);
}

// Initialize all mobile optimizations
function initMobileOptimizations() {
    console.log('📱 Initializing redesigned mobile optimizations...');
    
    // Add mobile class to body to enable mobile-specific CSS selectors
    document.body.classList.add('mobile');
    
    optimizeMobileTouch();
    optimizeMobileLayout();
    optimizeLandscapeMobile();
    optimizeHighDPIDisplays();
    optimizeTouchFeedback();
    optimizeMobileScrolling();
    optimizeMobileTypography();
    optimizeMobilePerformance();
    
    // Add resize listener for responsive adjustments
    window.addEventListener('resize', () => {
        setTimeout(() => {
            optimizeMobileLayout();
            optimizeLandscapeMobile();
            optimizeMobileTypography();
            optimizeMobilePerformance();
        }, 100);
    });
    
    // Add orientation change listener
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            optimizeMobileLayout();
            optimizeLandscapeMobile();
            optimizeMobileTypography();
            optimizeMobilePerformance();
        }, 100);
    });
    
    // Add viewport change listener for mobile browsers
    window.addEventListener('visualViewport', () => {
        setTimeout(() => {
            optimizeMobileLayout();
            optimizeMobileTypography();
        }, 100);
    });
}

// Initialize mobile optimizations when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileOptimizations);
} else {
    initMobileOptimizations();
}

// Call the force function after initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceTitleStacking);
} else {
    setTimeout(forceTitleStacking, 100);
}

// Export for global access
window.initMobileOptimizations = initMobileOptimizations;
