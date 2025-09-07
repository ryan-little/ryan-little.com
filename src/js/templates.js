// Template system for Ryan Little's personal website
// Handles dynamic content generation from JSON data

class TemplateEngine {
    constructor() {
        this.contentData = null;
        this.isMobile = window.DeviceInfo?.isMobile || false;
    }

    // Load content data from Content Manager
    async loadContent() {
        try {
            // Use Content Manager if available, otherwise fallback to direct fetch
            if (window.ContentManager && window.ContentManager.isInitialized) {
                this.contentData = window.ContentManager.contentData;
            } else {
                const response = await fetch('src/data/content.json');
                this.contentData = await response.json();
            }
            return this.contentData;
        } catch (error) {
            console.error('Failed to load content for templates:', error);
            return null;
        }
    }

    // Generate adventure panel HTML
    generateAdventurePanel(adventure) {
        if (adventure.isPlaceholder) {
            return `
                <div class="adventure-panel whats-next-panel">
                    <div class="adventure-image">
                        <div class="whats-next-placeholder">
                            <i class="fas fa-rocket"></i>
                            <span>Coming Soon</span>
                        </div>
                    </div>
                    <div class="adventure-details">
                        <h3>${adventure.title}</h3>
                        <div class="adventure-meta">
                            <span class="location"><i class="fas fa-map-marker-alt"></i> ${adventure.location}</span>
                            <span class="date"><i class="fas fa-calendar"></i> ${adventure.date}</span>
                        </div>
                        <p>${adventure.description}</p>
                        <div class="adventure-tags">
                            ${adventure.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
        }

        return `
            <div class="adventure-panel">
                <div class="adventure-image">
                    <picture>
                        <source srcset="${adventure.image.webp}" type="image/webp">
                        <img src="${adventure.image.fallback}" alt="${adventure.image.alt}" class="panel-image">
                    </picture>
                </div>
                <div class="adventure-details">
                    <h3>${adventure.title}</h3>
                    <div class="adventure-meta">
                        <span class="location"><i class="fas fa-map-marker-alt"></i> ${adventure.location}</span>
                        <span class="date"><i class="fas fa-calendar"></i> ${adventure.date}</span>
                    </div>
                    <p>${adventure.description}</p>
                    <div class="adventure-tags">
                        ${adventure.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Generate portfolio section HTML
    generatePortfolioSection(section) {
        const items = section.items.map(item => {
            let itemHTML = `
                <div class="portfolio-item">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
            `;

            if (item.image) {
                const maxWidth = this.isMobile ? '250px' : '300px';
                
                // Check if there are additional images to display side by side
                if (item.additionalImages && item.additionalImages.length > 0) {
                    // Display images side by side
                    itemHTML += `
                        <div class="images-container" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; margin: 1rem auto;">
                            <div class="image-container" style="max-width: ${maxWidth}; flex: 1; min-width: 200px;">
                                <picture>
                                    <source srcset="${item.image.webp}" type="image/webp">
                                    <img src="${item.image.fallback}" alt="${item.image.alt}" class="content-image">
                                </picture>
                                <div class="image-caption">${item.image.caption}</div>
                            </div>
                    `;
                    
                    // Add additional images
                    item.additionalImages.forEach(additionalImage => {
                        itemHTML += `
                            <div class="image-container" style="max-width: ${maxWidth}; flex: 1; min-width: 200px;">
                                <picture>
                                    <source srcset="${additionalImage.webp}" type="image/webp">
                                    <img src="${additionalImage.fallback}" alt="${additionalImage.alt}" class="content-image">
                                </picture>
                                <div class="image-caption">${additionalImage.caption}</div>
                            </div>
                        `;
                    });
                    
                    itemHTML += `</div>`;
                } else {
                    // Single image display
                    itemHTML += `
                        <div class="image-container" style="max-width: ${maxWidth}; margin: 1rem auto;">
                            <picture>
                                <source srcset="${item.image.webp}" type="image/webp">
                                <img src="${item.image.fallback}" alt="${item.image.alt}" class="content-image">
                            </picture>
                            <div class="image-caption">${item.image.caption}</div>
                        </div>
                    `;
                }
            }

            itemHTML += `</div>`;
            return itemHTML;
        }).join('');

        return `
            <div class="portfolio-section">
                <h3><i class="${section.icon}"></i> ${section.title}</h3>
                <div class="portfolio-items">
                    ${items}
                </div>
            </div>
        `;
    }

    // Generate tree item HTML
    generateTreeItem(tree) {
        const maxWidth = this.isMobile ? '300px' : '400px';
        
        return `
            <div class="tree-item">
                <h4>${tree.title}</h4>
                <p>${tree.description}</p>
                
                <div class="image-container" style="max-width: ${maxWidth}; margin: 1rem auto;">
                    <picture>
                        <source srcset="${tree.image.webp}" type="image/webp">
                        <img src="${tree.image.fallback}" alt="${tree.image.alt}" class="content-image">
                    </picture>
                    <div class="image-caption">${tree.image.caption}</div>
                </div>
                
                <div class="tree-stats">
                    <h5>${tree.stats.title}</h5>
                    <ul>
                        ${tree.stats.items.map(item => `<li><strong>${item.split(':')[0]}:</strong> ${item.split(':').slice(1).join(':').trim()}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    // Generate about section HTML
    generateAboutSection(section) {
        let sectionHTML = `
            <div class="about-section">
                <h3><i class="${section.icon}"></i> ${section.title}</h3>
        `;

        section.content.forEach(content => {
            if (content.includes('**')) {
                // Handle bold text
                const parts = content.split('**');
                let formattedContent = '';
                for (let i = 0; i < parts.length; i++) {
                    if (i % 2 === 1) {
                        formattedContent += `<strong>${parts[i]}</strong>`;
                    } else {
                        formattedContent += parts[i];
                    }
                }
                sectionHTML += `<p>${formattedContent}</p>`;
            } else {
                sectionHTML += `<p>${content}</p>`;
            }
        });

        if (section.image) {
            const maxWidth = this.isMobile ? '200px' : '250px';
            sectionHTML += `
                <div class="image-container" style="max-width: ${maxWidth}; margin: 1rem auto;">
                    <picture>
                        <source srcset="${section.image.webp}" type="image/webp">
                        <img src="${section.image.fallback}" alt="${section.image.alt}" class="content-image">
                    </picture>
                    <div class="image-caption">${section.image.caption}</div>
                </div>
            `;
        }

        sectionHTML += `</div>`;
        return sectionHTML;
    }

    // Populate adventures section
    async populateAdventures() {
        if (!this.contentData) await this.loadContent();
        
        const adventuresGrid = document.querySelector('.adventures-grid');
        if (!adventuresGrid) {
            console.warn('TemplateEngine: Adventures grid not found');
            return;
        }

        const adventuresHTML = this.contentData.adventures.panels
            .map(adventure => this.generateAdventurePanel(adventure))
            .join('');

        adventuresGrid.innerHTML = adventuresHTML;
    }

    // Populate adventure counters
    async populateAdventureCounters() {
        if (!this.contentData) await this.loadContent();
        
        // Update countries counter
        const countriesCounter = document.querySelector('.countries-counter .counter-number');
        if (countriesCounter && this.contentData.adventures.countriesVisited) {
            countriesCounter.textContent = this.contentData.adventures.countriesVisited;
        }

        // Update national parks counter
        const nationalParksCounter = document.querySelector('.national-parks-counter .counter-number');
        if (nationalParksCounter && this.contentData.adventures.nationalParksVisited) {
            nationalParksCounter.textContent = this.contentData.adventures.nationalParksVisited;
        }
    }

    // Populate portfolio section
    async populatePortfolio() {
        if (!this.contentData) await this.loadContent();
        
        const portfolioSections = document.querySelector('.portfolio-sections');
        if (!portfolioSections) {
            console.warn('TemplateEngine: Portfolio sections not found');
            return;
        }

        const portfolioHTML = this.contentData.portfolio.sections
            .map(section => this.generatePortfolioSection(section))
            .join('');

        portfolioSections.innerHTML = portfolioHTML;
    }

    // Populate trees section
    async populateTrees() {
        if (!this.contentData) await this.loadContent();
        
        const treesSections = document.querySelector('.trees-sections');
        if (!treesSections) {
            console.warn('TemplateEngine: Trees sections not found');
            return;
        }

        const treesHTML = this.contentData.trees.items
            .map(tree => this.generateTreeItem(tree))
            .join('');

        treesSections.innerHTML = treesHTML;
    }

    // Populate about section
    async populateAbout() {
        if (!this.contentData) await this.loadContent();
        
        const aboutSections = document.querySelector('.about-sections');
        if (!aboutSections) {
            console.warn('TemplateEngine: About sections not found');
            return;
        }

        const aboutHTML = this.contentData.about.sections
            .map(section => this.generateAboutSection(section))
            .join('');

        aboutSections.innerHTML = aboutHTML;
    }

    // Populate all sections
    async populateAllSections() {
        
        await this.loadContent();
        
        // Populate sections in parallel for better performance
        await Promise.all([
            this.populateAdventures(),
            this.populateAdventureCounters(),
            this.populatePortfolio(),
            this.populateTrees(),
            this.populateAbout()
        ]);

    }

    // Update content when device type changes
    updateForDeviceType(isMobile) {
        this.isMobile = isMobile;
        // Re-populate sections with new device-specific settings
        this.populateAllSections();
    }
}

// Create global template engine instance
window.TemplateEngine = new TemplateEngine();

// Add global function for manual testing
window.testTemplates = function() {
    if (window.TemplateEngine) {
        window.TemplateEngine.populateAllSections();
    } else {
        console.error('TemplateEngine not available');
    }
};

// Template initialization is now handled by main index.html after content is loaded
// This ensures templates populate after the dynamic content is inserted into the DOM
