# Content Management System

This document explains how to use the new content management system for Ryan Little's personal website.

## Overview

The website now uses a modular content management system that separates content from presentation, making it easier to maintain and update. The system consists of three main components:

1. **JSON Content Files** - Store all content data
2. **Template System** - Generates HTML from content data
3. **Component System** - Provides reusable HTML components

## File Structure

```
src/
├── data/
│   └── content.json          # Main content data file
├── js/
│   ├── content-manager.js    # Content management utilities
│   ├── templates.js          # Template generation system
│   └── components.js         # Reusable HTML components
```

## Content Management

### Adding New Adventures

To add a new adventure, edit `src/data/content.json` and add a new object to the `adventures.panels` array:

```json
{
  "id": "new-adventure",
  "title": "Adventure Name",
  "location": "Location",
  "date": "2024",
  "description": "Description of the adventure",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "image": {
    "webp": "assets/images_webp/image.webp",
    "fallback": "assets/images/image.jpg",
    "alt": "Image description"
  }
}
```

### Adding New Portfolio Items

Add items to existing sections in `portfolio.sections`:

```json
{
  "title": "Project Name",
  "description": "Project description",
  "image": {
    "webp": "assets/images_webp/image.webp",
    "fallback": "assets/images/image.jpg",
    "alt": "Image description",
    "caption": "Image caption"
  }
}
```

### Adding New Trees

Add new tree entries to the `trees.items` array:

```json
{
  "id": "tree-name",
  "title": "Tree Name",
  "description": "Tree description",
  "image": {
    "webp": "assets/images_webp/image.webp",
    "fallback": "assets/images/image.jpg",
    "alt": "Image description",
    "caption": "Image caption"
  },
  "stats": {
    "title": "Statistics Title",
    "items": [
      "Height: 100 feet",
      "Age: 1000 years"
    ]
  }
}
```

## Using the Content Manager

The Content Manager provides JavaScript utilities for dynamic content management:

```javascript
// Get content
const adventures = window.ContentManager.getAdventures();

// Update content
window.ContentManager.updateCountriesCount(15);

// Add new adventure
window.ContentManager.addAdventure({
  id: "new-adventure",
  title: "New Adventure",
  // ... other properties
});

// Get content statistics
const stats = window.ContentManager.getContentStats();
console.log(stats); // { adventures: 6, portfolioSections: 3, ... }
```

## Template System

The template system automatically generates HTML from the JSON content. Templates are device-aware and will adjust image sizes and layouts based on whether the user is on mobile or desktop.

### Key Features

- **Device-aware rendering** - Automatically adjusts for mobile vs desktop
- **Image optimization** - Uses WebP with fallbacks
- **Consistent styling** - Maintains design consistency across all content
- **Easy updates** - Change content without touching HTML

## Component System

The component system provides reusable HTML components:

```javascript
// Create an image component
const imageHTML = window.ComponentSystem.createImageComponent({
  webp: "path/to/image.webp",
  fallback: "path/to/image.jpg",
  alt: "Description",
  caption: "Caption"
});

// Create a page overlay
const overlayHTML = window.ComponentSystem.createPageOverlay(
  'adventures', 
  'Adventures', 
  'Exploring the world'
);
```

## Benefits

1. **Maintainability** - Content is separated from presentation
2. **Consistency** - All content follows the same structure
3. **Flexibility** - Easy to add new content types
4. **Performance** - Content is loaded once and cached
5. **Device Optimization** - Automatic mobile/desktop adjustments

## Migration Notes

The old hardcoded HTML content has been replaced with template placeholders. The system automatically populates these placeholders when the page loads.

### Before (Hardcoded)
```html
<div class="adventure-panel">
  <h3>Big Bend National Park</h3>
  <!-- ... hardcoded content ... -->
</div>
```

### After (Template-driven)
```html
<div class="adventures-grid">
  <!-- Content will be populated by templates.js -->
</div>
```

## Troubleshooting

### Content Not Loading
- Check that `src/data/content.json` exists and is valid JSON
- Verify that the content manager is initialized before templates run
- Check browser console for error messages

### Images Not Displaying
- Ensure image paths in JSON are correct
- Check that both WebP and fallback images exist
- Verify image file permissions

### Styling Issues
- Templates maintain the same CSS classes as before
- Check that CSS files are loading properly
- Verify device detection is working correctly

## Future Enhancements

Potential improvements to the system:

1. **Admin Interface** - Web-based content editing
2. **Content Validation** - Schema validation for JSON content
3. **Image Optimization** - Automatic image resizing and optimization
4. **Content Versioning** - Track content changes over time
5. **Multi-language Support** - Support for multiple languages
