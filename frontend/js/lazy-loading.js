/**
 * Lazy loading implementation for images
 * This script adds native lazy loading to images and implements
 * a fallback for browsers that don't support it
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if native lazy loading is supported
  const hasNativeLazyLoading = 'loading' in HTMLImageElement.prototype;
  
  // If native lazy loading is supported, we don't need to do anything
  // as we've already added the loading="lazy" attribute to images
  
  // For browsers that don't support native lazy loading, implement a fallback
  if (!hasNativeLazyLoading) {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const lazyImage = entry.target;
            
            // If there's a data-src attribute, use it
            if (lazyImage.dataset.src) {
              lazyImage.src = lazyImage.dataset.src;
              delete lazyImage.dataset.src;
            }
            
            // If there's a data-srcset attribute, use it
            if (lazyImage.dataset.srcset) {
              lazyImage.srcset = lazyImage.dataset.srcset;
              delete lazyImage.dataset.srcset;
            }
            
            lazyImage.classList.remove('lazy');
            imageObserver.unobserve(lazyImage);
          }
        });
      });
      
      lazyImages.forEach(lazyImage => {
        imageObserver.observe(lazyImage);
      });
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      // Simple scroll-based lazy loading
      let lazyImageTimeout;
      
      function lazyLoad() {
        if (lazyImageTimeout) {
          clearTimeout(lazyImageTimeout);
        }
        
        lazyImageTimeout = setTimeout(() => {
          const scrollTop = window.pageYOffset;
          
          lazyImages.forEach(lazyImage => {
            if (lazyImage.offsetTop < (window.innerHeight + scrollTop)) {
              if (lazyImage.dataset.src) {
                lazyImage.src = lazyImage.dataset.src;
                delete lazyImage.dataset.src;
              }
              
              if (lazyImage.dataset.srcset) {
                lazyImage.srcset = lazyImage.dataset.srcset;
                delete lazyImage.dataset.srcset;
              }
              
              lazyImage.classList.remove('lazy');
            }
          });
          
          if (lazyImages.length === 0) {
            document.removeEventListener('scroll', lazyLoad);
            window.removeEventListener('resize', lazyLoad);
            window.removeEventListener('orientationChange', lazyLoad);
          }
        }, 20);
      }
      
      document.addEventListener('scroll', lazyLoad);
      window.addEventListener('resize', lazyLoad);
      window.addEventListener('orientationChange', lazyLoad);
      
      // Initial load
      lazyLoad();
    }
  }
  
  // Add lazy loading to picture source elements
  const pictureSources = document.querySelectorAll('picture source');
  pictureSources.forEach(source => {
    if (!source.hasAttribute('loading')) {
      source.setAttribute('loading', 'lazy');
    }
  });
});