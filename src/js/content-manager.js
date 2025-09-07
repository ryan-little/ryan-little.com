// Content Management System for Ryan Little's personal website
// Provides utilities for managing and updating content dynamically

class ContentManager {
    constructor() {
        this.contentData = null;
        this.isInitialized = false;
    }

    // Initialize the content manager
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Load content data
            const response = await fetch('src/data/content.json');
            this.contentData = await response.json();
            this.isInitialized = true;
        } catch (error) {
        }
    }

    // Get content by path (e.g., 'adventures.panels[0].title')
    getContent(path) {
        if (!this.isInitialized) {
            return null;
        }

        try {
            return this.getNestedValue(this.contentData, path);
        } catch (error) {
            return null;
        }
    }

    // Update content by path
    updateContent(path, value) {
        if (!this.isInitialized) {
            return false;
        }

        try {
            this.setNestedValue(this.contentData, path, value);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Add new adventure
    addAdventure(adventure) {
        if (!this.contentData?.adventures?.panels) return false;
        
        this.contentData.adventures.panels.splice(-1, 0, adventure); // Insert before "What's Next"
        return true;
    }

    // Add new portfolio item
    addPortfolioItem(sectionId, item) {
        const section = this.contentData?.portfolio?.sections?.find(s => s.id === sectionId);
        if (!section) return false;
        
        section.items.push(item);
        return true;
    }

    // Add new tree
    addTree(tree) {
        if (!this.contentData?.trees?.items) return false;
        
        this.contentData.trees.items.push(tree);
        return true;
    }

    // Update countries visited count
    updateCountriesCount(count) {
        if (!this.contentData?.adventures) return false;
        
        this.contentData.adventures.countriesVisited = count;
        return true;
    }

    // Get all adventures
    getAdventures() {
        return this.getContent('adventures.panels') || [];
    }

    // Get all portfolio sections
    getPortfolioSections() {
        return this.getContent('portfolio.sections') || [];
    }

    // Get all trees
    getTrees() {
        return this.getContent('trees.items') || [];
    }

    // Get about sections
    getAboutSections() {
        return this.getContent('about.sections') || [];
    }

    // Utility function to get nested object values
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            if (key.includes('[') && key.includes(']')) {
                const arrayKey = key.substring(0, key.indexOf('['));
                const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')));
                return current[arrayKey][index];
            }
            return current[key];
        }, obj);
    }

    // Utility function to set nested object values
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (key.includes('[') && key.includes(']')) {
                const arrayKey = key.substring(0, key.indexOf('['));
                const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')));
                return current[arrayKey][index];
            }
            return current[key];
        }, obj);
        
        target[lastKey] = value;
    }

    // Export content data (for backup or external use)
    exportContent() {
        if (!this.isInitialized) return null;
        return JSON.stringify(this.contentData, null, 2);
    }

    // Import content data
    importContent(jsonString) {
        try {
            this.contentData = JSON.parse(jsonString);
            this.isInitialized = true;
            return true;
        } catch (error) {
            return false;
        }
    }

    // Refresh content from server
    async refreshContent() {
        try {
            const response = await fetch('src/data/content.json');
            this.contentData = await response.json();
            return true;
        } catch (error) {
            return false;
        }
    }

    // Get content statistics
    getContentStats() {
        if (!this.isInitialized) return null;
        
        return {
            adventures: this.contentData?.adventures?.panels?.length || 0,
            portfolioSections: this.contentData?.portfolio?.sections?.length || 0,
            portfolioItems: this.contentData?.portfolio?.sections?.reduce((total, section) => total + (section.items?.length || 0), 0) || 0,
            trees: this.contentData?.trees?.items?.length || 0,
            aboutSections: this.contentData?.about?.sections?.length || 0,
            countriesVisited: this.contentData?.adventures?.countriesVisited || 0
        };
    }
}

// Create global content manager instance
window.ContentManager = new ContentManager();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.ContentManager.initialize();
    });
} else {
    window.ContentManager.initialize();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentManager;
}
