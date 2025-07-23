// frontend/js/utils/animations.js
// ------------------------------------------------------------
// Animation utilities using AOS (Animate On Scroll)
// ------------------------------------------------------------

import AOS from 'aos';
import 'aos/dist/aos.css';

/**
 * Initialize AOS animations with custom settings
 */
export function initAnimations() {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Configure AOS with appropriate settings
  AOS.init({
    // Core settings
    duration: prefersReducedMotion ? 0 : 800,
    easing: 'ease-in-out',
    once: true,
    offset: 100,
    
    // Disable animations completely if user prefers reduced motion
    disable: prefersReducedMotion,
    
    // Animation triggers
    startEvent: 'DOMContentLoaded',
    
    // Animation timing for different elements
    delay: 0,
    
    // Mirror animations when scrolling up
    mirror: false,
    
    // Anchor placement (where element should be in viewport to trigger animation)
    anchorPlacement: 'top-bottom'
  });
  
  // Refresh AOS when window is resized
  window.addEventListener('resize', () => {
    AOS.refresh();
  });
}