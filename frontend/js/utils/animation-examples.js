// frontend/js/utils/animation-examples.js
// ------------------------------------------------------------
// Animation examples and documentation for the team
// This file is for reference only and is not imported in the main application
// ------------------------------------------------------------

/**
 * AOS Animation Examples
 * 
 * This file provides examples of how to use AOS animations in the EihDah website.
 * 
 * Basic Usage:
 * <div data-aos="fade-up">Content</div>
 * 
 * Available Animation Types:
 * - fade-up
 * - fade-down
 * - fade-left
 * - fade-right
 * - fade-in
 * - zoom-in
 * - zoom-out
 * - slide-up
 * - slide-down
 * 
 * Additional Options:
 * - data-aos-delay="200" (delay in ms)
 * - data-aos-duration="800" (duration in ms)
 * - data-aos-easing="ease-in-out" (easing function)
 * - data-aos-once="true" (animation only happens once)
 * - data-aos-anchor="#element" (trigger animation when specific element enters viewport)
 * - data-aos-anchor-placement="top-bottom" (position of element relative to window)
 * 
 * Accessibility:
 * - Animations are automatically disabled for users with prefers-reduced-motion settings
 * - Always ensure content is accessible without animations
 * 
 * Performance Tips:
 * - Use animations sparingly to avoid performance issues
 * - Avoid animating large elements or many elements simultaneously
 * - Set 'once: true' to improve performance (default in our implementation)
 */

// Example HTML implementations:

/*
<!-- Basic fade up animation -->
<div data-aos="fade-up">
  <h2>This will fade up when scrolled into view</h2>
</div>

<!-- Animation with delay -->
<div data-aos="fade-up" data-aos-delay="300">
  <p>This will fade up 300ms after the previous element</p>
</div>

<!-- Animation with custom duration -->
<div data-aos="fade-left" data-aos-duration="1200">
  <p>This will take 1.2 seconds to animate</p>
</div>

<!-- Staggered animations in a list -->
<ul>
  <li data-aos="fade-up" data-aos-delay="100">Item 1</li>
  <li data-aos="fade-up" data-aos-delay="200">Item 2</li>
  <li data-aos="fade-up" data-aos-delay="300">Item 3</li>
</ul>

<!-- Zoom in animation -->
<div data-aos="zoom-in">
  <img src="image.jpg" alt="Description">
</div>
*/