// frontend/js/components/video-embed.js
// ------------------------------------------------------------
// Video embed component with lazy loading
// ------------------------------------------------------------

/**
 * Initialize video embeds with lazy loading
 */
export function initVideoEmbed() {
  const videoContainers = document.querySelectorAll('.video-embed-container');
  
  if (!videoContainers.length) return;
  
  videoContainers.forEach(container => {
    const placeholder = container.querySelector('.video-placeholder');
    const videoId = container.dataset.videoId;
    
    if (!placeholder || !videoId) return;
    
    // Create intersection observer for lazy loading
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // Load video when placeholder is near viewport
        if (entry.isIntersecting) {
          loadVideo(container, videoId);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '200px 0px', // Start loading when within 200px of viewport
      threshold: 0.01
    });
    
    // Start observing the placeholder
    observer.observe(placeholder);
    
    // Add click handler to load video immediately on click
    placeholder.addEventListener('click', (e) => {
      e.preventDefault();
      loadVideo(container, videoId);
      observer.unobserve(placeholder);
    });
  });
}

/**
 * Load YouTube video iframe
 */
function loadVideo(container, videoId) {
  const placeholder = container.querySelector('.video-placeholder');
  if (!placeholder) return;
  
  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.setAttribute('src', `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
  iframe.setAttribute('frameborder', '0');
  iframe.setAttribute('allowfullscreen', '');
  iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  iframe.classList.add('video-iframe');
  
  // Replace placeholder with iframe
  placeholder.parentNode.replaceChild(iframe, placeholder);
  
  // Add loaded class to container
  container.classList.add('video-loaded');
}