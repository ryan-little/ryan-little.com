# Mobile/Desktop Separation

This project has been separated into distinct mobile and desktop versions for better performance and maintainability.

## File Structure

### HTML Files
- `index.html` - Device detector and redirector
- `index-mobile.html` - Mobile-optimized version
- `index-desktop.html` - Desktop-optimized version

### CSS Files
- `src/mobile.css` - Mobile-specific styles
- `src/desktop.css` - Desktop-specific styles
- `src/styles.css` - Original unified styles (kept for reference)

### JavaScript Files
- `src/js/core.js` - Shared core functionality
- `src/js/utilities.js` - Shared utilities
- `src/js/animations.js` - Shared shooting star system
- `src/js/minigame.js` - Shared minigame functionality
- `src/js/mobile.js` - Mobile-specific optimizations
- `src/js/desktop.js` - Desktop-specific functionality
- `src/js/main.js` - Shared initialization logic

## How It Works

1. **Device Detection**: `index.html` detects the device type and redirects accordingly
2. **Mobile Version**: Uses `mobile.css` and `mobile.js` for touch-optimized experience
3. **Desktop Version**: Uses `desktop.css` and `desktop.js` for mouse-optimized experience with satellite navigation

## Key Differences

### Mobile Version
- Mobile link tree instead of satellite navigation
- Touch-optimized interactions
- Simplified animations for better performance
- No Earth night system
- Responsive typography and layout

### Desktop Version
- Satellite orbital navigation system
- Earth night dimming system
- Hover effects and mouse interactions
- Complex animations and transitions
- Fixed layout optimized for larger screens

## Benefits

1. **Performance**: Each version only loads what it needs
2. **Maintainability**: Clear separation of concerns
3. **User Experience**: Optimized for each device type
4. **Code Clarity**: Easier to understand and modify

## Testing

Test both versions by:
1. Opening `index-mobile.html` directly for mobile testing
2. Opening `index-desktop.html` directly for desktop testing
3. Opening `index.html` to test device detection and redirection
