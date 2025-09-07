// Component system for Ryan Little's personal website
// Provides reusable HTML components and page builders

class ComponentSystem {
    constructor() {
        this.isMobile = window.DeviceInfo?.isMobile || false;
    }

    // Create a reusable image component
    createImageComponent(imageData, className = 'content-image', maxWidth = null) {
        const width = maxWidth || (this.isMobile ? '250px' : '300px');
        
        return `
            <div class="image-container" style="max-width: ${width}; margin: 1rem auto;">
                <picture>
                    <source srcset="${imageData.webp}" type="image/webp">
                    <img src="${imageData.fallback}" alt="${imageData.alt}" class="${className}">
                </picture>
                ${imageData.caption ? `<div class="image-caption">${imageData.caption}</div>` : ''}
            </div>
        `;
    }

    // Create a reusable satellite navigation component
    createSatelliteNav() {
        return `
            <div class="satellite-nav">
                <div class="satellite satellite-about satellite-orbit-standard" data-target="about">
                    <picture>
                        <source srcset="assets/images_webp/satellite1.webp" type="image/webp">
                        <img src="assets/images/satellite1.png" alt="About Satellite" class="satellite-image">
                    </picture>
                    <div class="satellite-label">About</div>
                </div>
                <div class="satellite satellite-trees satellite-orbit-offset" data-target="trees">
                    <picture>
                        <source srcset="assets/images_webp/satellite3.webp" type="image/webp">
                        <img src="assets/images/satellite3.png" alt="Trees Satellite" class="satellite-image">
                    </picture>
                    <div class="satellite-label">Trees</div>
                </div>
                <div class="satellite satellite-portfolio satellite-orbit-wide" data-target="portfolio">
                    <picture>
                        <source srcset="assets/images_webp/satellite1.webp" type="image/webp">
                        <img src="assets/images/satellite1.png" alt="Portfolio Satellite" class="satellite-image">
                    </picture>
                    <div class="satellite-label">Portfolio</div>
                </div>
                <div class="satellite satellite-adventures satellite-orbit-extended" data-target="adventures">
                    <picture>
                        <source srcset="assets/images_webp/satellite2.webp" type="image/webp">
                        <img src="assets/images/satellite2.png" alt="Adventures Satellite" class="satellite-image">
                    </picture>
                    <div class="satellite-label">Adventures</div>
                </div>
            </div>
        `;
    }

    // Create a reusable hero section component
    createHeroSection() {
        return `
            <section id="home" class="hero">
                <div class="hero-background">
                    <div class="background-image"></div>
                    <div class="background2"></div>
                    <div class="stars"></div>
                    <div class="earth-sprite"></div>
                </div>

                <div class="hero-content">
                    <div class="hero-text">
                        <h1 class="hero-title">
                            <span class="title-line">Ryan Little</span>
                            <span class="title-subtitle">Geospatial Analyst</span>
                        </h1>
                    </div>
                    
                    <div class="social-links">
                        <a href="https://linkedin.com/in/rpdlittle" target="_blank" rel="noopener" class="social-link">
                            <i class="fab fa-linkedin"></i>
                        </a>
                        <a href="mailto:ryan@ryanpdlittle.com" class="social-link">
                            <i class="fas fa-envelope"></i>
                        </a>
                        <a href="https://github.com/ryan-little" target="_blank" rel="noopener" class="social-link">
                            <i class="fab fa-github"></i>
                        </a>
                        <a href="https://littlehammerlabs.com" target="_blank" rel="noopener" class="social-link">
                            <img src="assets/images_webp/lhlhammer_transback.webp" alt="Little Hammer Labs" class="social-icon-image">
                        </a>
                    </div>
                    <div class="social-link-blur social-link-blur-1"></div>
                    <div class="social-link-blur social-link-blur-2"></div>
                    <div class="social-link-blur social-link-blur-3"></div>
                    <div class="social-link-blur social-link-blur-4"></div>
                </div>
            </section>
        `;
    }

    // Create a reusable mobile link tree component
    createMobileLinkTree() {
        return `
            <div class="mobile-link-tree">
                <a href="#portfolio" class="mobile-link-item">
                    <picture>
                        <source srcset="assets/images_webp/satellite1.webp" type="image/webp">
                        <img src="assets/images/satellite1.png" alt="Portfolio" class="mobile-link-icon mobile-spin-standard">
                    </picture>
                    <span class="mobile-link-text">Portfolio</span>
                </a>
                <a href="#about" class="mobile-link-item">
                    <picture>
                        <source srcset="assets/images_webp/satellite2.webp" type="image/webp">
                        <img src="assets/images/satellite2.png" alt="About" class="mobile-link-icon mobile-spin-reverse">
                    </picture>
                    <span class="mobile-link-text">About</span>
                </a>
                <a href="#trees" class="mobile-link-item">
                    <picture>
                        <source srcset="assets/images_webp/satellite3.webp" type="image/webp">
                        <img src="assets/images/satellite3.png" alt="Trees" class="mobile-link-icon mobile-spin-slow">
                    </picture>
                    <span class="mobile-link-text">Trees</span>
                </a>
                <a href="#adventures" class="mobile-link-item">
                    <picture>
                        <source srcset="assets/images_webp/satellite2.webp" type="image/webp">
                        <img src="assets/images/satellite2.png" alt="Adventures" class="mobile-link-icon mobile-spin-fast-reverse">
                    </picture>
                    <span class="mobile-link-text">Adventures</span>
                </a>
            </div>
        `;
    }

    // Create a reusable page overlay component
    createPageOverlay(pageId, title, subtitle, satelliteType = 'satellite1') {
        return `
            <div id="${pageId}-overlay" class="${pageId}-overlay">
                <div class="background-image"></div>
                <div class="background2"></div>
                <div class="stars"></div>
                <div class="centered-satellite">
                    <picture>
                        <source srcset="assets/images_webp/${satelliteType}.webp" type="image/webp">
                        <img src="assets/images/${satelliteType}.png" alt="${title} Satellite" class="satellite-image">
                    </picture>
                </div>
                <div class="${pageId}-content-pane">
                    <button class="${pageId}-back-button" onclick="close${this.capitalizeFirst(pageId)}Page()">
                        <span class="arrow">←</span>
                        Back to Earth
                    </button>
                    <div class="${pageId}-info">
                        <h2>${title}</h2>
                        <p>${subtitle}</p>
                        <div class="${pageId}-sections" id="${pageId}-sections">
                            <!-- Content will be populated by template system -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Create a reusable countries counter component
    createCountriesCounter(count) {
        return `
            <div class="countries-counter">
                <div class="counter-number">${count}</div>
                <div class="counter-label">Countries Visited</div>
            </div>
        `;
    }

    // Create a reusable back button component
    createBackButton(pageId) {
        return `
            <button class="${pageId}-back-button" onclick="close${this.capitalizeFirst(pageId)}Page()">
                <span class="arrow">←</span>
                Back to Earth
            </button>
        `;
    }

    // Create a reusable page header component
    createPageHeader(title, subtitle) {
        return `
            <div class="page-header">
                <h2>${title}</h2>
                <p>${subtitle}</p>
            </div>
        `;
    }

    // Create a reusable stats list component
    createStatsList(stats) {
        return `
            <div class="stats-list">
                <h5>${stats.title}</h5>
                <ul>
                    ${stats.items.map(item => {
                        const [key, ...valueParts] = item.split(':');
                        const value = valueParts.join(':').trim();
                        return `<li><strong>${key}:</strong> ${value}</li>`;
                    }).join('')}
                </ul>
            </div>
        `;
    }

    // Create a reusable tag list component
    createTagList(tags) {
        return `
            <div class="tag-list">
                ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;
    }

    // Create a reusable meta information component
    createMetaInfo(location, date) {
        return `
            <div class="meta-info">
                <span class="location"><i class="fas fa-map-marker-alt"></i> ${location}</span>
                <span class="date"><i class="fas fa-calendar"></i> ${date}</span>
            </div>
        `;
    }

    // Create a reusable section header component
    createSectionHeader(title, icon) {
        return `
            <h3><i class="${icon}"></i> ${title}</h3>
        `;
    }

    // Create a reusable placeholder component
    createPlaceholder(icon, text) {
        return `
            <div class="placeholder">
                <i class="${icon}"></i>
                <span>${text}</span>
            </div>
        `;
    }

    // Create a specialized contact overlay component
    createContactOverlay() {
        return `
            <div id="contact-overlay" class="contact-overlay">
                <div class="background-image"></div>
                <div class="background2"></div>
                <div class="stars"></div>
                <div class="centered-satellite">
                    <picture>
                        <source srcset="assets/images_webp/satellite1.webp" type="image/webp">
                        <img src="assets/images/satellite1.png" alt="Contact Satellite" class="satellite-image">
                    </picture>
                </div>
                <div class="contact-content-pane">
                    <button class="contact-back-button" onclick="closeContactPage()">
                        <span class="arrow">←</span>
                        Back to Earth
                    </button>
                    <div class="contact-info">
                        <h2>Get in Touch</h2>
                        <p>Ready to collaborate on your next geospatial project? Let's connect!</p>
                        
                        <div class="contact-methods">
                            <a href="mailto:ryan@ryanpdlittle.com" class="contact-method" title="Email">
                                <i class="fas fa-envelope"></i>
                            </a>
                            <a href="https://linkedin.com/in/rpdlittle" target="_blank" rel="noopener" class="contact-method" title="LinkedIn">
                                <i class="fab fa-linkedin"></i>
                            </a>
                            <a href="https://github.com/ryan-little" target="_blank" rel="noopener" class="contact-method" title="GitHub">
                                <i class="fab fa-github"></i>
                            </a>
                            <a href="https://littlehammerlabs.com" target="_blank" rel="noopener" class="contact-method" title="Little Hammer Labs">
                                <img src="assets/images_webp/lhlhammer_transback.webp" alt="Little Hammer Labs" class="contact-icon-image">
                            </a>
                        </div>
                        
                        <div class="contact-details">
                            <div class="contact-detail">
                                <i class="fas fa-phone"></i>
                                <span>+1-619-861-9595</span>
                            </div>
                            <div class="contact-detail">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>San Diego, CA</span>
                            </div>
                            <div class="contact-detail">
                                <i class="fas fa-globe"></i>
                                <span>www.ryan-little.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Utility function to capitalize first letter
    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Build complete page structure
    buildPageStructure(pageType) {
        const structures = {
            'desktop': {
                hero: this.createHeroSection(),
                satelliteNav: this.createSatelliteNav(),
                overlays: [
                    this.createPageOverlay('adventures', 'Adventures', 'Exploring the world, one adventure at a time.', 'satellite2'),
                    this.createPageOverlay('about', 'About Me', 'Exploring the intersection of geography, technology, and nature.', 'satellite1'),
                    this.createPageOverlay('portfolio', 'Portfolio', 'Showcasing my work in geospatial analysis, web development, and photography.', 'satellite1'),
                    this.createPageOverlay('trees', 'Trees I\'ve Visited', 'Celebrating the silent giants that shape our landscapes and sustain our planet.', 'satellite3'),
                    this.createContactOverlay()
                ]
            },
            'mobile': {
                hero: this.createHeroSection(),
                mobileLinkTree: this.createMobileLinkTree(),
                overlays: [
                    this.createPageOverlay('adventures', 'Adventures', 'Exploring the world, one adventure at a time.', 'satellite2'),
                    this.createPageOverlay('about', 'About Me', 'Exploring the intersection of geography, technology, and nature.', 'satellite1'),
                    this.createPageOverlay('portfolio', 'Portfolio', 'Showcasing my work in geospatial analysis, web development, and photography.', 'satellite1'),
                    this.createPageOverlay('trees', 'Trees I\'ve Visited', 'Celebrating the silent giants that shape our landscapes and sustain our planet.', 'satellite3'),
                    this.createContactOverlay()
                ]
            }
        };

        return structures[pageType] || structures['desktop'];
    }

    // Update component system for device type changes
    updateForDeviceType(isMobile) {
        this.isMobile = isMobile;
    }
}

// Create global component system instance
window.ComponentSystem = new ComponentSystem();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComponentSystem;
}
