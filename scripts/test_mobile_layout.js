// Mobile layout testing script
// This script helps test the website layout at different viewport sizes
// It adds a viewport resizer tool to the page

(function() {
  'use strict';
  
  // Common mobile viewport sizes to test
  const viewportSizes = [
    { name: 'Ultra Small', width: 340, height: 640 },
    { name: 'Small Mobile', width: 375, height: 667 },
    { name: 'Medium Mobile', width: 414, height: 736 },
    { name: 'Large Mobile', width: 480, height: 854 },
    { name: 'Small Tablet', width: 600, height: 960 },
    { name: 'Medium Tablet', width: 768, height: 1024 },
    { name: 'Large Tablet', width: 992, height: 1200 },
    { name: 'Desktop', width: 1200, height: 800 }
  ];
  
  // Create viewport resizer UI
  function createViewportResizer() {
    const resizerContainer = document.createElement('div');
    resizerContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      z-index: 9999;
      font-family: sans-serif;
      font-size: 14px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    `;
    
    const currentSize = document.createElement('div');
    currentSize.style.cssText = `
      margin-bottom: 10px;
      text-align: center;
      font-weight: bold;
    `;
    currentSize.textContent = `Current: ${window.innerWidth}px × ${window.innerHeight}px`;
    resizerContainer.appendChild(currentSize);
    
    // Update current size on window resize
    window.addEventListener('resize', () => {
      currentSize.textContent = `Current: ${window.innerWidth}px × ${window.innerHeight}px`;
    });
    
    // Create buttons for each viewport size
    viewportSizes.forEach(size => {
      const button = document.createElement('button');
      button.style.cssText = `
        display: block;
        width: 100%;
        margin-bottom: 5px;
        padding: 5px 10px;
        background-color: #3949ab;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
      `;
      button.textContent = `${size.name} (${size.width}px)`;
      button.addEventListener('click', () => {
        window.resizeTo(size.width, size.height);
      });
      resizerContainer.appendChild(button);
    });
    
    // Add toggle button to show/hide the resizer
    const toggleButton = document.createElement('button');
    toggleButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #3949ab;
      color: white;
      width: 30px;
      height: 30px;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      z-index: 10000;
      display: none;
    `;
    toggleButton.textContent = '+';
    toggleButton.addEventListener('click', () => {
      if (resizerContainer.style.display === 'none') {
        resizerContainer.style.display = 'block';
        toggleButton.style.display = 'none';
      }
    });
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.style.cssText = `
      position: absolute;
      top: 5px;
      right: 5px;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 16px;
    `;
    closeButton.textContent = '×';
    closeButton.addEventListener('click', () => {
      resizerContainer.style.display = 'none';
      toggleButton.style.display = 'block';
    });
    resizerContainer.appendChild(closeButton);
    
    // Add to document
    document.body.appendChild(resizerContainer);
    document.body.appendChild(toggleButton);
  }
  
  // Add grid overlay to help with alignment
  function createGridOverlay() {
    const gridButton = document.createElement('button');
    gridButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      background-color: #3949ab;
      color: white;
      padding: 5px 10px;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      z-index: 9999;
      font-family: sans-serif;
      font-size: 12px;
    `;
    gridButton.textContent = 'Toggle Grid';
    
    const gridOverlay = document.createElement('div');
    gridOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: linear-gradient(to right, rgba(255,0,0,0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,0,0,0.1) 1px, transparent 1px);
      background-size: 20px 20px;
      pointer-events: none;
      z-index: 9998;
      display: none;
    `;
    
    let gridVisible = false;
    gridButton.addEventListener('click', () => {
      gridVisible = !gridVisible;
      gridOverlay.style.display = gridVisible ? 'block' : 'none';
    });
    
    document.body.appendChild(gridButton);
    document.body.appendChild(gridOverlay);
  }
  
  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    createViewportResizer();
    createGridOverlay();
  });
})();