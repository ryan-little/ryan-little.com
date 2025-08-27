// Utilities and helper functions for Ryan Little's personal website
// Centralized common functionality used across modules

// DOM utilities
const DOMUtils = {
    // Create element with attributes
    createElement: (tag, className, attributes = {}) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key === 'textContent') {
                element.textContent = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        return element;
    },
    
    // Remove element safely
    removeElement: (element) => {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    },
    
    // Remove multiple elements
    removeElements: (selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => DOMUtils.removeElement(element));
    },
    
    // Fade element in/out
    fadeElement: (element, fadeIn = true, duration = 300) => {
        if (!element) return;
        
        element.style.transition = `opacity ${duration}ms ease`;
        
        if (fadeIn) {
            element.style.opacity = '0';
            element.style.display = 'block';
            requestAnimationFrame(() => {
                element.style.opacity = '1';
            });
        } else {
            element.style.opacity = '0';
            setTimeout(() => {
                element.style.display = 'none';
            }, duration);
        }
    }
};

// Animation utilities
const AnimationUtils = {
    // Smooth animation with easing
    animate: (element, properties, duration = 300, easing = 'ease') => {
        if (!element) return;
        
        element.style.transition = `all ${duration}ms ${easing}`;
        Object.assign(element.style, properties);
        
        setTimeout(() => {
            element.style.transition = '';
        }, duration);
    },
    
    // Staggered animation for multiple elements
    stagger: (elements, animationFn, delay = 100) => {
        if (!Array.isArray(elements)) {
            elements = Array.from(elements);
        }
        
        elements.forEach((element, index) => {
            setTimeout(() => animationFn(element), index * delay);
        });
    }
};

// Performance utilities
const PerformanceUtils = {
    // Debounce function calls
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function calls
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Check if element is in viewport
    isInViewport: (element) => {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Event utilities
const EventUtils = {
    // Add event listener with options
    addEvent: (element, event, handler, options = {}) => {
        if (!element) return;
        
        const defaultOptions = {
            passive: true,
            capture: false
        };
        
        element.addEventListener(event, handler, { ...defaultOptions, ...options });
    },
    
    // Remove event listener
    removeEvent: (element, event, handler) => {
        if (!element) return;
        element.removeEventListener(event, handler);
    },
    
    // Add touch feedback
    addTouchFeedback: (element, scale = 0.95) => {
        if (!element || !DeviceInfo.isMobile) return;
        
        const touchStart = () => {
            element.style.transform = `scale(${scale})`;
        };
        
        const touchEnd = () => {
            element.style.transform = 'scale(1)';
        };
        
        EventUtils.addEvent(element, 'touchstart', touchStart);
        EventUtils.addEvent(element, 'touchend', touchEnd);
        EventUtils.addEvent(element, 'touchcancel', touchEnd);
    }
};

// Validation utilities
const ValidationUtils = {
    // Check if value is valid number
    isValidNumber: (value) => {
        return typeof value === 'number' && !isNaN(value) && isFinite(value);
    },
    
    // Check if coordinates are valid
    isValidCoordinates: (x, y) => {
        return ValidationUtils.isValidNumber(x) && ValidationUtils.isValidNumber(y);
    },
    
    // Validate DOM element
    isValidElement: (element) => {
        return element && element.nodeType === Node.ELEMENT_NODE;
    }
};

// Export utilities to global scope for use across modules
window.DOMUtils = DOMUtils;
window.AnimationUtils = AnimationUtils;
window.PerformanceUtils = PerformanceUtils;
window.EventUtils = EventUtils;
window.ValidationUtils = ValidationUtils;
