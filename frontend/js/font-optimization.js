/**
 * Font optimization utilities
 * 
 * This file contains utilities for optimizing font loading:
 * - Preloading fonts
 * - Font display swap
 * - Font loading API
 */

// Check if the browser supports the Font Loading API
const fontLoadingSupported = 'fonts' in document;

// Font display options
const fontDisplayOptions = {
  swap: 'swap',         // Use fallback font until custom font is loaded
  block: 'block',       // Brief invisible text, then fallback until custom font is loaded
  fallback: 'fallback', // Brief invisible text, then fallback, swap to custom font if loaded quickly
  optional: 'optional', // Like fallback, but browser can decide not to use custom font
  auto: 'auto'          // Browser default behavior
};

// Preload fonts
function preloadFonts(fontUrls) {
  if (!Array.isArray(fontUrls) || fontUrls.length === 0) {
    return;
  }
  
  fontUrls.forEach(fontUrl => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = fontUrl;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// Load fonts using the Font Loading API
function loadFontsWithAPI(fontFamilies) {
  if (!fontLoadingSupported || !Array.isArray(fontFamilies) || fontFamilies.length === 0) {
    return Promise.resolve();
  }
  
  const fontPromises = fontFamilies.map(fontFamily => {
    return document.fonts.load(`1em ${fontFamily}`);
  });
  
  return Promise.all(fontPromises);
}

// Add font-display: swap to all @font-face rules
function addFontDisplaySwap() {
  if (!('styleSheets' in document)) {
    return;
  }
  
  // Check if we've already processed the stylesheets
  if (document.documentElement.classList.contains('fonts-optimized')) {
    return;
  }
  
  // Loop through all stylesheets
  Array.from(document.styleSheets).forEach(styleSheet => {
    try {
      // Skip cross-origin stylesheets
      if (!styleSheet.cssRules) {
        return;
      }
      
      // Loop through all CSS rules
      Array.from(styleSheet.cssRules).forEach(rule => {
        // Check if the rule is a @font-face rule
        if (rule.type === CSSRule.FONT_FACE_RULE) {
          // Check if the rule already has a font-display property
          if (!rule.style.fontDisplay) {
            rule.style.fontDisplay = fontDisplayOptions.swap;
          }
        }
      });
    } catch (e) {
      // Skip stylesheets that can't be accessed due to CORS
      console.warn('Could not access stylesheet:', e);
    }
  });
  
  // Mark as processed
  document.documentElement.classList.add('fonts-optimized');
}

// Initialize font optimization
function initFontOptimization() {
  // Add font-display: swap to all @font-face rules
  addFontDisplaySwap();
  
  // Preload critical fonts
  preloadFonts([
    '/static/fonts/your-main-font.woff2',
    '/static/fonts/your-heading-font.woff2'
  ]);
  
  // Load fonts using the Font Loading API
  if (fontLoadingSupported) {
    loadFontsWithAPI([
      'Your Main Font',
      'Your Heading Font'
    ]).then(() => {
      // Add class to indicate fonts are loaded
      document.documentElement.classList.add('fonts-loaded');
    }).catch(error => {
      console.warn('Error loading fonts:', error);
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initFontOptimization);

// Export functions for use in other modules
export { preloadFonts, loadFontsWithAPI, addFontDisplaySwap, initFontOptimization };