/**
 * Test script to validate social media preview cards
 * This script opens various social media preview testing tools
 * to check how the website will appear when shared.
 */

const { exec } = require('child_process');
const readline = require('readline');
const open = require('open');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Base URL to test
const baseUrl = process.argv[2] || 'https://eihdah.com';

// Pages to test
const pages = [
  '/',
  '/privacy.html',
  '/terms.html',
  '/contact.html',
  '/thanks.html'
];

// Preview testing tools
const previewTools = {
  'Facebook Sharing Debugger': (url) => `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(url)}`,
  'Twitter Card Validator': (url) => `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(url)}`,
  'LinkedIn Post Inspector': (url) => `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(url)}`,
  'Open Graph Checker': (url) => `https://www.opengraph.xyz/url/${encodeURIComponent(url)}`
};

// Function to test a specific page with all tools
async function testPage(page) {
  const url = page === '/' ? baseUrl : `${baseUrl}${page}`;
  console.log(`\n\x1b[36mTesting previews for: ${url}\x1b[0m`);
  
  for (const [toolName, urlGenerator] of Object.entries(previewTools)) {
    const toolUrl = urlGenerator(url);
    console.log(`\x1b[33mOpening ${toolName}...\x1b[0m`);
    await open(toolUrl);
    
    // Wait for user to confirm before continuing to next tool
    await new Promise((resolve) => {
      rl.question('\x1b[32mPress Enter to continue to next test...\x1b[0m', () => {
        resolve();
      });
    });
  }
}

// Main function to run tests
async function main() {
  console.log('\x1b[35m=== Social Media Preview Testing ===\x1b[0m');
  console.log('\x1b[33mThis script will open various social media preview testing tools in your browser.\x1b[0m');
  console.log('\x1b[33mYou will need to manually check the previews in each tool.\x1b[0m');
  
  for (const page of pages) {
    await testPage(page);
  }
  
  console.log('\n\x1b[32mAll tests completed!\x1b[0m');
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error('\x1b[31mError:', error, '\x1b[0m');
  rl.close();
  process.exit(1);
});