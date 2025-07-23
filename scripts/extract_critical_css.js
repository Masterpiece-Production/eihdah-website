/**
 * Extract critical CSS for faster page rendering
 * This script extracts the CSS needed for above-the-fold content
 */

const critical = require('critical');
const fs = require('fs');
const path = require('path');

// HTML files to process
const htmlFiles = [
  'index.html',
  'contact.html',
  'privacy.html',
  'terms.html',
  'thanks.html'
];

// Process each HTML file
async function processCriticalCSS() {
  console.log('Extracting critical CSS...');
  
  for (const htmlFile of htmlFiles) {
    try {
      console.log(`Processing ${htmlFile}...`);
      
      // Generate critical CSS
      const result = await critical.generate({
        src: htmlFile,
        target: {
          css: `static/dist/critical-${path.basename(htmlFile, '.html')}.css`,
          html: htmlFile,
          uncritical: `static/dist/deferred-${path.basename(htmlFile, '.html')}.css`,
        },
        inline: true,
        dimensions: [
          {
            width: 320,
            height: 640
          },
          {
            width: 768,
            height: 1024
          },
          {
            width: 1280,
            height: 800
          }
        ],
        extract: true,
        penthouse: {
          blockJSRequests: false,
        },
      });
      
      console.log(`✓ Critical CSS extracted for ${htmlFile}`);
    } catch (err) {
      console.error(`Error processing ${htmlFile}:`, err);
    }
  }
}

// Run the process
processCriticalCSS().catch(err => {
  console.error('Critical CSS extraction failed:', err);
  process.exit(1);
});