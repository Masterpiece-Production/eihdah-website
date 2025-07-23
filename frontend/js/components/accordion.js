// frontend/js/components/accordion.js
// ------------------------------------------------------------
// Accordion component for use cases and FAQs
// ------------------------------------------------------------

/**
 * Initialize accordion functionality with proper accessibility attributes
 */
export function initAccordion() {
  const accordions = document.querySelectorAll('.accordion');
  
  if (!accordions.length) return;
  
  accordions.forEach(accordion => {
    const buttons = accordion.querySelectorAll('.accordion-button');
    
    buttons.forEach(button => {
      // Ensure proper ARIA attributes
      const headerId = button.id || `accordion-header-${Math.random().toString(36).substring(2, 9)}`;
      const contentId = button.getAttribute('aria-controls') || `accordion-content-${Math.random().toString(36).substring(2, 9)}`;
      
      if (!button.id) button.id = headerId;
      
      const content = button.getAttribute('aria-controls') 
        ? document.getElementById(button.getAttribute('aria-controls'))
        : button.nextElementSibling;
        
      if (content && !content.id) content.id = contentId;
      
      if (content) {
        button.setAttribute('aria-controls', content.id);
        content.setAttribute('aria-labelledby', button.id);
      }
      
      // Add click event listener if not using Bootstrap's collapse
      if (!window.bootstrap) {
        button.addEventListener('click', function() {
          const expanded = button.getAttribute('aria-expanded') === 'true';
          button.setAttribute('aria-expanded', !expanded);
          
          if (content) {
            content.classList.toggle('show');
            content.style.maxHeight = !expanded ? `${content.scrollHeight}px` : null;
          }
        });
      }
    });
  });
}