/**
 * Image optimization utilities
 * 
 * This file contains utilities for optimizing images:
 * - Lazy loading
 * - Preventing layout shifts
 * - WebP support detection
 */

// Check for WebP support
function checkWebpSupport() {
  const canvas = document.createElement('canvas');
  if (canvas.getContext && canvas.getContext('2d')) {
    // Check for WebP support
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
}

// Add WebP support class to HTML element
document.documentElement.classList.add(checkWebpSupport() ? 'webp' : 'no-webp');

// Initialize lazy loading for images
function initLazyLoading() {
  // Use native lazy loading if available
  if ('loading' in HTMLImageElement.prototype) {
    // Browser supports native lazy loading
    // Just make sure all images have loading="lazy" attribute
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
  } else {
    // Fallback for browsers that don't support native lazy loading
    // Use Intersection Observer API
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.getAttribute('data-src');
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
            }
            
            const srcset = img.getAttribute('data-srcset');
            if (srcset) {
              img.srcset = srcset;
              img.removeAttribute('data-srcset');
            }
            
            observer.unobserve(img);
          }
        });
      });
      
      // Target images with data-src attribute
      const lazyImages = document.querySelectorAll('img[data-src]');
      lazyImages.forEach(img => {
        imageObserver.observe(img);
      });
    }
  }
}

// Prevent layout shifts by setting dimensions on images
function preventLayoutShifts() {
  const images = document.querySelectorAll('img:not([width]):not([height])');
  images.forEach(img => {
    // If image is already loaded, set dimensions
    if (img.complete) {
      if (!img.hasAttribute('width') && !img.hasAttribute('height')) {
        img.setAttribute('width', img.naturalWidth);
        img.setAttribute('height', img.naturalHeight);
      }
    } else {
      // If image is not loaded yet, set dimensions when it loads
      img.addEventListener('load', () => {
        if (!img.hasAttribute('width') && !img.hasAttribute('height')) {
          img.setAttribute('width', img.naturalWidth);
          img.setAttribute('height', img.naturalHeight);
        }
      });
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initLazyLoading();
  preventLayoutShifts();
});

// Export functions for use in other modules
export { checkWebpSupport, initLazyLoading, preventLayoutShifts };