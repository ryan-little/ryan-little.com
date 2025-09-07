// Mobile-specific optimizations and touch handling for Ryan Little's website
// Redesigned to match desktop experience while maintaining minigame functionality
// Performance optimized for smooth mobile experience


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

// IMMEDIATE earth positioning fix - run as soon as possible
function forceEarthPosition() {
    const earthSprite = document.querySelector('.earth-sprite');
    if (earthSprite) {
        earthSprite.style.top = '200px';
        earthSprite.style.left = '50%';
        earthSprite.style.transform = 'translate(-50%, -50%)';
        earthSprite.style.position = 'absolute';
        earthSprite.style.width = '300px';
        earthSprite.style.height = '300px';
        // Don't reset transition or animation - let CSS handle fade-in and night system handle filter transitions
    }
}

// Run immediately if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', forceEarthPosition);
} else {
    forceEarthPosition();
}

// Also run after a short delay to catch any late changes
setTimeout(forceEarthPosition, 10);
setTimeout(forceEarthPosition, 100);

// Mobile Earth Night Dimming System
const MobileEarthNightSystem = {
    earthElement: null,
    updateInterval: null,
    isInitialized: false,
    
    init() {
        // Prevent multiple initializations
        if (this.isInitialized) return;
        
        this.earthElement = document.querySelector('.earth-sprite');
        
        if (!this.earthElement) {
            setTimeout(() => {
                this.earthElement = document.querySelector('.earth-sprite');
                if (this.earthElement) {
                    this.startUpdates();
                    this.isInitialized = true;
                }
            }, 100);
            return;
        }
        
        // Small delay to ensure page is fully rendered
        setTimeout(() => {
            this.startUpdates();
            this.isInitialized = true;
        }, 50);
    },
    
    getTimeBasedBrightness() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        
        // Convert to decimal time for smoother transitions
        const time = hour + (minute / 60);
        
        // Define brightness levels throughout the day (same as desktop)
        let brightness, contrast;
        
        if (time >= 6 && time < 12) {
            // Morning: 6 AM - 12 PM (gradually brightening)
            const morningProgress = (time - 6) / 6; // 0 to 1
            brightness = 0.5 + (morningProgress * 0.5); // 0.5 to 1.0
            contrast = 1.2 - (morningProgress * 0.1); // 1.2 to 1.1
        } else if (time >= 12 && time < 17) {
            // Afternoon: 12 PM - 5 PM (peak brightness)
            brightness = 1.0;
            contrast = 1.1;
        } else if (time >= 17 && time < 20) {
            // Early evening: 5 PM - 8 PM (rapid dimming)
            const earlyEveningProgress = (time - 17) / 3; // 0 to 1
            brightness = 1.0 - (earlyEveningProgress * 0.4); // 1.0 to 0.6
            contrast = 1.1 + (earlyEveningProgress * 0.1); // 1.1 to 1.2
        } else if (time >= 20 && time < 24) {
            // Late evening: 8 PM - 12 AM (continuing to dim)
            const lateEveningProgress = (time - 20) / 4; // 0 to 1
            brightness = 0.6 - (lateEveningProgress * 0.3); // 0.6 to 0.3
            contrast = 1.2 + (lateEveningProgress * 0.1); // 1.2 to 1.3
        } else {
            // Late night: 12 AM - 6 AM (darkest)
            const nightProgress = time / 6; // 0 to 1
            brightness = 0.3 - (nightProgress * 0.15); // 0.3 to 0.15
            contrast = 1.3 + (nightProgress * 0.1); // 1.3 to 1.4
        }
        
        return { brightness, contrast };
    },
    
    updateEarthBrightness() {
        if (!this.earthElement) return;
        
        const { brightness, contrast } = this.getTimeBasedBrightness();
        
        // Use consistent transition timing that matches CSS (2s)
        this.earthElement.style.transition = 'filter 2s ease-in-out';
        this.earthElement.style.filter = `brightness(${brightness}) contrast(${contrast})`;
        
        // Add a subtle blue tint for night time
        if (brightness < 0.7) {
            const blueTint = Math.max(0, (0.7 - brightness) * 0.3);
            this.earthElement.style.filter += ` hue-rotate(${blueTint * 20}deg) saturate(${1 + blueTint})`;
        }
    },
    
    startUpdates() {
        // Ensure we have the earth element
        if (!this.earthElement) {
            this.earthElement = document.querySelector('.earth-sprite');
            if (!this.earthElement) return;
        }
        
        // Start at full daylight brightness with no transition to avoid conflicts
        this.earthElement.style.transition = 'filter 0s ease-in-out';
        this.earthElement.style.filter = 'brightness(1.1) contrast(1.1)';
        
        // Force a reflow to ensure the brightness is applied
        this.earthElement.offsetHeight;
        
        // Wait a bit longer to ensure fade-in is complete, then show brightness pop-up
        setTimeout(() => {
            // Show brightness pop-up effect
            this.earthElement.style.transition = 'filter 0s ease-in-out';
            this.earthElement.style.filter = 'brightness(1.1) contrast(1.1)';
            
            // Then transition to current time-based brightness after a delay
            setTimeout(() => {
                this.updateEarthBrightness();
            }, 1000); // 1 second delay to show the pop-up effect
        }, 500); // Wait for fade-in to complete
        
        // Update every minute for smooth transitions
        this.updateInterval = setInterval(() => {
            this.updateEarthBrightness();
        }, 60000);
    },
    
    stopUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
};

// Mobile-specific optimizations and touch handling
function optimizeMobileTouch() {
    
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
        // Enable hardware acceleration for better performance
        element.style.transform = 'translateZ(0)';
        element.style.willChange = 'transform';
    });
    
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
        // Only adjust size, don't reposition to avoid conflicts with night system
        const earthSize = Math.min(300, Math.max(250, viewportWidth * 0.4));
        earthSprite.style.width = `${earthSize}px`;
        earthSprite.style.height = `${earthSize}px`;
        
        // Don't reposition here - let forceEarthPosition and night system handle positioning
        // This prevents conflicts during animations
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
    // More robust landscape detection for Safari
    const isLandscape = window.innerHeight < window.innerWidth && window.innerWidth > 600;
    
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
            // Force landscape positioning - override any minigame restoration
            earthSprite.style.top = '150px';
            earthSprite.style.left = '50%';
            earthSprite.style.transform = 'translate(-50%, -50%)';
            earthSprite.style.position = 'absolute';
            
            // Ensure no transitions during positioning
            earthSprite.style.transition = 'none';
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
            
        }
    }, 100);
}

// Initialize all mobile optimizations
function initMobileOptimizations() {
    
    // Add mobile class to body to enable mobile-specific CSS selectors
    document.body.classList.add('mobile');
    
    optimizeMobileTouch();
    optimizeMobileLayout();
    
    // Delay landscape optimization to ensure it doesn't interfere with main layout
    setTimeout(() => {
        optimizeLandscapeMobile();
    }, 50);
    
    optimizeHighDPIDisplays();
    optimizeTouchFeedback();
    optimizeMobileScrolling();
    optimizeMobileTypography();
    optimizeMobilePerformance();
    
    // Initialize Mobile Earth Night System after a delay to ensure proper positioning
    if (typeof MobileEarthNightSystem !== 'undefined') {
        setTimeout(() => {
            MobileEarthNightSystem.init();
        }, 2500); // Wait for fade-in animation to complete (1.5s + 0.5s delay + buffer)
    }
    
    // Add resize listener for responsive adjustments
    window.addEventListener('resize', () => {
        setTimeout(() => {
            optimizeMobileLayout();
            // Don't run optimizeLandscapeMobile on resize - it resets earth position
            optimizeMobileTypography();
            optimizeMobilePerformance();
            
            // Force earth position after any layout changes
            forceEarthPosition();
        }, 100);
    });
    
    // Add orientation change listener
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            optimizeMobileLayout();
            // Don't run optimizeLandscapeMobile on orientation change - it resets earth position
            optimizeMobileTypography();
            optimizeMobilePerformance();
            
            // Force earth position after any layout changes
            forceEarthPosition();
        }, 100);
    });
    
    // Add viewport change listener for mobile browsers
    window.addEventListener('visualViewport', () => {
        setTimeout(() => {
            optimizeMobileLayout();
            optimizeMobileTypography();
            
            // Force earth position after any layout changes
            forceEarthPosition();
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

// Mobile Page Navigation Functions
function handleMobileNavigation(target) {
    
    if (target === 'about') {
        openAboutPageMobile();
    } else if (target === 'portfolio') {
        openPortfolioPageMobile();
    } else if (target === 'trees') {
        openTreesPageMobile();
    } else if (target === 'adventures') {
        openAdventuresPageMobile();
    } else {
        console.warn('Unknown navigation target:', target);
    }
}

// About Page Mobile Functions
function openAboutPageMobile() {
    
    // Show the about overlay
    const aboutOverlay = document.getElementById('about-overlay');
    if (aboutOverlay) {
        aboutOverlay.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
    }
}

function closeAboutPageMobile() {
    
    const aboutOverlay = document.getElementById('about-overlay');
    if (aboutOverlay) {
        aboutOverlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
    }
}

// Adventures Page Mobile Functions
function openAdventuresPageMobile() {
    
    // Show the adventures overlay
    const adventuresOverlay = document.getElementById('adventures-overlay');
    if (adventuresOverlay) {
        adventuresOverlay.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
    }
}

function closeAdventuresPageMobile() {
    
    const adventuresOverlay = document.getElementById('adventures-overlay');
    if (adventuresOverlay) {
        adventuresOverlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
    }
}

// Portfolio Page Mobile Functions
function openPortfolioPageMobile() {
    
    // Show the portfolio overlay
    const portfolioOverlay = document.getElementById('portfolio-overlay');
    if (portfolioOverlay) {
        portfolioOverlay.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
    }
}

function closePortfolioPageMobile() {
    
    const portfolioOverlay = document.getElementById('portfolio-overlay');
    if (portfolioOverlay) {
        portfolioOverlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
    }
}

// Trees Page Mobile Functions
function openTreesPageMobile() {
    
    // Show the trees overlay
    const treesOverlay = document.getElementById('trees-overlay');
    if (treesOverlay) {
        treesOverlay.classList.add('active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
    }
}

function closeTreesPageMobile() {
    
    const treesOverlay = document.getElementById('trees-overlay');
    if (treesOverlay) {
        treesOverlay.classList.remove('active');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
    }
}



// Add click handlers for mobile link items
function initMobileNavigation() {
    
    // Add click handlers for mobile link items
    const mobileLinkItems = document.querySelectorAll('.mobile-link-item');
    mobileLinkItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                const target = href.substring(1); // Remove the #
                handleMobileNavigation(target);
            }
        });
    });
    
    // Handle escape key to close any active page
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const aboutOverlay = document.getElementById('about-overlay');
            const portfolioOverlay = document.getElementById('portfolio-overlay');
            const treesOverlay = document.getElementById('trees-overlay');
            
            if (aboutOverlay && aboutOverlay.classList.contains('active')) {
                closeAboutPageMobile();
            } else if (portfolioOverlay && portfolioOverlay.classList.contains('active')) {
                closePortfolioPageMobile();
            } else if (treesOverlay && treesOverlay.classList.contains('active')) {
                closeTreesPageMobile();
            }
        }
    });
    
}

// Initialize mobile navigation when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNavigation);
} else {
    initMobileNavigation();
}

// Function to restart mobile optimizations like page initialization
window.restartMobileOptimizations = function() {
    // Reinitialize mobile optimizations, but skip typography optimizations if elements are restored
    const heroTitle = document.querySelector('.hero-title');
    const titleLine = document.querySelector('.hero-title .title-line');
    const titleSubtitle = document.querySelector('.hero-title .title-subtitle');
    
    // Check if title elements are already restored from minigame
    const isRestored = heroTitle && heroTitle.dataset.restored;
    
    if (!isRestored) {
        // Only reinitialize mobile optimizations if not restored
        initMobileOptimizations();
    } else {
        // Just reinitialize the parts that don't interfere with restored elements
        optimizeMobileTouch();
        optimizeMobileLayout();
        // Don't run optimizeLandscapeMobile on restart - it resets earth position
        optimizeHighDPIDisplays();
        optimizeTouchFeedback();
        optimizeMobileScrolling();
        optimizeMobilePerformance();
    }
};

// Console clear function
window.clearConsole = function() {
    console.clear();
    console.log('Console cleared! 🌍');
};

// Export for global access
window.initMobileOptimizations = initMobileOptimizations;
window.handleMobileNavigation = handleMobileNavigation;
window.openAboutPage = openAboutPageMobile;
window.closeAboutPage = closeAboutPageMobile;
window.openAdventuresPage = openAdventuresPageMobile;
window.closeAdventuresPage = closeAdventuresPageMobile;
window.openPortfolioPage = openPortfolioPageMobile;
window.closePortfolioPage = closePortfolioPageMobile;
window.openTreesPage = openTreesPageMobile;
window.closeTreesPage = closeTreesPageMobile;
window.MobileEarthNightSystem = MobileEarthNightSystem;
