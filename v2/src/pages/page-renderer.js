import contentData from '../data/content.json';
import { navigateBack } from './router.js';

// Remap v1 asset paths to v2 public paths
function img(path) {
    if (!path) return '';
    return '/' + path
        .replace('assets/images_webp/', 'images/')
        .replace('assets/images/', 'images/');
}

// Custom crop positions for tree images (object-position)
const TREE_CROP = {
    'hyperion': 'center 70%',
    'methuselah': 'center 75%',
};

// Trees that should display portrait (3:4) instead of landscape (16:9)
const TREE_PORTRAIT = new Set(['general-sherman', 'hyperion']);

// Map route to satellite image
const SATELLITE_IMAGES = {
    about: '/satellites/satellite1.webp',
    portfolio: '/satellites/satellite2.webp',
    trees: '/satellites/satellite3.webp',
    adventures: '/satellites/satellite4.webp',
};

export function renderPage(route, satelliteId = null) {
    const container = document.getElementById('page-container');
    const data = contentData[route];
    if (!data) return;

    const renderers = {
        about: renderAbout,
        portfolio: renderPortfolio,
        adventures: renderAdventures,
        trees: renderTrees,
    };

    const renderer = renderers[route];
    if (renderer) {
        const satelliteImg = SATELLITE_IMAGES[satelliteId || route] || '';
        container.innerHTML = renderer(data, satelliteImg);
    }

    // Back button handler
    container.querySelectorAll('.back-button').forEach(btn => {
        btn.addEventListener('click', () => navigateBack());
    });

    // Animate counters
    animateCounters();

    // Enlargeable image lightbox
    container.querySelectorAll('.enlargeable').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });

    // Scroll to top
    container.scrollTop = 0;
}

function openLightbox(src, alt) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `<img src="${src}" alt="${alt}" class="lightbox-image">`;
    overlay.addEventListener('click', () => {
        overlay.classList.add('closing');
        overlay.addEventListener('animationend', () => overlay.remove());
    });
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));
}

function animateCounters() {
    const counters = document.querySelectorAll('.counter-number');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent, 10);
        if (isNaN(target)) return;
        counter.textContent = '0';
        const duration = 1500; // ms
        const start = performance.now();
        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    });
}

function renderAbout(data, satelliteImg) {
    return `
        <div class="page about-page">
            <button class="back-button">
                <span class="arrow">&larr;</span> Back to Earth
            </button>
            <div class="page-header">
                ${satelliteImg ? `<img src="${satelliteImg}" alt="Satellite" class="page-satellite">` : ''}
                <h2>${data.title}</h2>
                <p>${data.subtitle}</p>
            </div>
            <div class="page-content">
                ${data.headshot ? `
                    <div class="headshot-container">
                        <img src="${img(data.headshot.webp)}" alt="${data.headshot.alt}" loading="lazy">
                        <p class="image-caption">${data.headshot.caption}</p>
                    </div>
                ` : ''}
                <div class="sections-grid">
                    ${data.sections.map(section => `
                        <div class="section-card">
                            <div class="section-header">
                                <i class="${section.icon}"></i>
                                <h3>${section.title}</h3>
                            </div>
                            <div class="section-content">
                                ${section.content.map(line => `<p>${line}</p>`).join('')}
                            </div>
                            ${section.image ? `
                                <img src="${img(section.image.webp)}" alt="${section.image.alt}" loading="lazy" class="section-image">
                                ${section.image.caption ? `<p class="image-caption">${section.image.caption}</p>` : ''}
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderPortfolio(data, satelliteImg) {
    return `
        <div class="page portfolio-page">
            <button class="back-button">
                <span class="arrow">&larr;</span> Back to Earth
            </button>
            <div class="page-header">
                ${satelliteImg ? `<img src="${satelliteImg}" alt="Satellite" class="page-satellite">` : ''}
                <h2>${data.title}</h2>
                <p>${data.subtitle}</p>
            </div>
            <div class="page-content">
                ${data.sections.map(section => `
                    <div class="portfolio-section">
                        <div class="section-header">
                            <i class="${section.icon}"></i>
                            <h3>${section.title}</h3>
                        </div>
                        <div class="portfolio-grid">
                            ${section.items.map(item => `
                                <div class="portfolio-card">
                                    <h4>${item.title}</h4>
                                    <p>${item.description}</p>
                                    ${item.image ? `
                                        <img src="${img(item.image.webp)}" alt="${item.image.alt}" loading="lazy" class="portfolio-image${item.image.alt?.includes('Logo') ? ' portfolio-logo' : ''}">
                                        ${item.image.caption ? `<p class="image-caption">${item.image.caption}</p>` : ''}
                                    ` : ''}
                                    ${(item.additionalImages || []).map(ai => `
                                        <img src="${img(ai.webp)}" alt="${ai.alt}" loading="lazy" class="portfolio-image enlargeable">
                                        ${ai.caption ? `<p class="image-caption">${ai.caption} <span class="enlarge-hint">(click to enlarge)</span></p>` : ''}
                                    `).join('')}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderAdventures(data, satelliteImg) {
    return `
        <div class="page adventures-page">
            <button class="back-button">
                <span class="arrow">&larr;</span> Back to Earth
            </button>
            <div class="page-header">
                ${satelliteImg ? `<img src="${satelliteImg}" alt="Satellite" class="page-satellite">` : ''}
                <h2>${data.title}</h2>
                <p>${data.subtitle}</p>
            </div>
            <div class="adventure-counters">
                <div class="counter">
                    <span class="counter-number">${data.countriesVisited}</span>
                    <span class="counter-label">Countries</span>
                </div>
                <div class="counter">
                    <span class="counter-number">${data.nationalParksVisited}</span>
                    <span class="counter-label">National Parks</span>
                </div>
            </div>
            <div class="page-content">
                <div class="adventures-grid">
                    ${data.panels.map(panel => `
                        <div class="adventure-card${panel.isPlaceholder ? ' placeholder' : ''}">
                            ${panel.image ? `
                                <img src="${img(panel.image.webp)}" alt="${panel.image.alt}" loading="lazy" class="adventure-image">
                            ` : ''}
                            <div class="adventure-info">
                                <h4>${panel.title}</h4>
                                <p class="adventure-location">${panel.location}</p>
                                <p class="adventure-date">${panel.date}</p>
                                <p>${panel.description}</p>
                                ${panel.tags ? `
                                    <div class="adventure-tags">
                                        ${panel.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderTrees(data, satelliteImg) {
    return `
        <div class="page trees-page">
            <button class="back-button">
                <span class="arrow">&larr;</span> Back to Earth
            </button>
            <div class="page-header">
                ${satelliteImg ? `<img src="${satelliteImg}" alt="Satellite" class="page-satellite">` : ''}
                <h2>${data.title}</h2>
                <p>${data.subtitle}</p>
            </div>
            <div class="page-content">
                <div class="trees-grid">
                    ${data.items.map(tree => {
                        const isPortrait = TREE_PORTRAIT.has(tree.id);
                        const styleProps = [];
                        if (TREE_CROP[tree.id]) styleProps.push(`object-position: ${TREE_CROP[tree.id]}`);
                        if (isPortrait) styleProps.push('aspect-ratio: 3 / 4');
                        const styleAttr = styleProps.length ? ` style="${styleProps.join('; ')}"` : '';

                        // Auto-compute Methuselah's age from current year
                        const stats = tree.stats ? tree.stats.items.map(stat => {
                            if (tree.id === 'methuselah' && stat.includes('4,854 years old')) {
                                const currentAge = 4854 + (new Date().getFullYear() - 2024);
                                return `Age: ${currentAge.toLocaleString()} years old`;
                            }
                            return stat;
                        }) : [];

                        return `
                        <div class="tree-card">
                            ${tree.image ? `
                                <img src="${img(tree.image.webp)}" alt="${tree.image.alt}" loading="lazy" class="tree-image"${styleAttr}>
                                ${tree.image.caption ? `<p class="image-caption">${tree.image.caption}</p>` : ''}
                            ` : ''}
                            <div class="tree-info">
                                <h4>${tree.title}</h4>
                                <p>${tree.description}</p>
                                ${tree.stats ? `
                                    <div class="tree-stats">
                                        <h5>${tree.stats.title}</h5>
                                        <ul>
                                            ${stats.map(stat => `<li>${stat}</li>`).join('')}
                                        </ul>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `}).join('')}
                </div>
            </div>
        </div>
    `;
}
