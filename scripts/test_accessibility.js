/**
 * Accessibility Test Script
 * 
 * This script tests the website for accessibility compliance including:
 * - Color contrast compliance (WCAG AA)
 * - ARIA attributes validation
 * - Keyboard navigation testing
 * 
 * Requirements: 2.5 - WCAG AA contrast compliance
 */

const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');
const fs = require('fs');
const path = require('path');

// URLs to test
const urls = [
  'http://localhost:5000/',
  'http://localhost:5000/contact.html',
  'http://localhost:5000/thanks.html',
  'http://localhost:5000/privacy.html',
  'http://localhost:5000/terms.html'
];

// Elements to test for keyboard navigation
const keyboardNavElements = [
  'a.navbar-brand',
  'a.nav-link',
  'a.btn-primary',
  'button.accordion-button',
  'a[href="#cta"]',
  'form input[type="email"]',
  'form button[type="submit"]'
];

// Function to test color contrast
async function testColorContrast(page) {
  console.log('\n🎨 Testing Color Contrast...');
  
  // Use axe-core to check for color contrast issues
  const results = await new AxePuppeteer(page).analyze();
  
  // Filter for color contrast violations
  const contrastViolations = results.violations.filter(
    violation => violation.id === 'color-contrast'
  );
  
  if (contrastViolations.length === 0) {
    console.log('✅ No color contrast issues found');
    return true;
  } else {
    console.log(`❌ Found ${contrastViolations.length} color contrast issues:`);
    contrastViolations.forEach(violation => {
      console.log(`- ${violation.help}: ${violation.description}`);
      violation.nodes.forEach(node => {
        console.log(`  Element: ${node.html}`);
        console.log(`  Fix: ${node.failureSummary}`);
      });
    });
    return false;
  }
}

// Function to validate ARIA attributes
async function validateAriaAttributes(page) {
  console.log('\n🔍 Validating ARIA attributes...');
  
  // Use axe-core to check for ARIA issues
  const results = await new AxePuppeteer(page).analyze();
  
  // Filter for ARIA-related violations
  const ariaViolations = results.violations.filter(
    violation => violation.id.includes('aria') || 
                 violation.tags.includes('aria') ||
                 violation.tags.includes('wcag2a') ||
                 violation.tags.includes('wcag2aa')
  );
  
  if (ariaViolations.length === 0) {
    console.log('✅ No ARIA attribute issues found');
    return true;
  } else {
    console.log(`❌ Found ${ariaViolations.length} ARIA attribute issues:`);
    ariaViolations.forEach(violation => {
      console.log(`- ${violation.help}: ${violation.description}`);
      violation.nodes.forEach(node => {
        console.log(`  Element: ${node.html}`);
        console.log(`  Fix: ${node.failureSummary}`);
      });
    });
    return false;
  }
}

// Function to test keyboard navigation
async function testKeyboardNavigation(page) {
  console.log('\n⌨️ Testing keyboard navigation...');
  
  let allElementsReachable = true;
  
  // Test each element for keyboard focus
  for (const selector of keyboardNavElements) {
    try {
      // Try to focus the element using Tab key simulation
      await page.keyboard.press('Tab');
      
      // Check if any element matching the selector is focused
      const isFocused = await page.evaluate((sel) => {
        const elements = document.querySelectorAll(sel);
        for (const el of elements) {
          if (document.activeElement === el) {
            return true;
          }
        }
        return false;
      }, selector);
      
      if (isFocused) {
        console.log(`✅ Element "${selector}" is keyboard accessible`);
      } else {
        console.log(`❌ Element "${selector}" is not keyboard accessible`);
        allElementsReachable = false;
      }
    } catch (error) {
      console.log(`❌ Error testing keyboard navigation for "${selector}": ${error.message}`);
      allElementsReachable = false;
    }
  }
  
  // Test accordion keyboard interaction
  try {
    // Find all accordion buttons
    const accordionButtons = await page.$$('button.accordion-button');
    
    if (accordionButtons.length > 0) {
      // Focus the first accordion button
      await accordionButtons[0].focus();
      
      // Press Enter to toggle
      await page.keyboard.press('Enter');
      
      // Check if the accordion expanded/collapsed
      const isExpanded = await page.evaluate(() => {
        const button = document.querySelector('button.accordion-button');
        return button.getAttribute('aria-expanded') === 'true';
      });
      
      console.log(`✅ Accordion keyboard interaction ${isExpanded ? 'works' : 'failed'}`);
    }
  } catch (error) {
    console.log(`❌ Error testing accordion keyboard interaction: ${error.message}`);
    allElementsReachable = false;
  }
  
  return allElementsReachable;
}

// Main test function
async function runAccessibilityTests() {
  const browser = await puppeteer.launch({ headless: true });
  const results = {
    colorContrast: { pass: 0, fail: 0 },
    ariaAttributes: { pass: 0, fail: 0 },
    keyboardNavigation: { pass: 0, fail: 0 }
  };
  
  try {
    // Create results directory if it doesn't exist
    const resultsDir = path.join(__dirname, '..', 'test_results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // Test each URL
    for (const url of urls) {
      console.log(`\n📝 Testing URL: ${url}`);
      const page = await browser.newPage();
      
      try {
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        // Run tests
        const contrastResult = await testColorContrast(page);
        results.colorContrast[contrastResult ? 'pass' : 'fail']++;
        
        const ariaResult = await validateAriaAttributes(page);
        results.ariaAttributes[ariaResult ? 'pass' : 'fail']++;
        
        const keyboardResult = await testKeyboardNavigation(page);
        results.keyboardNavigation[keyboardResult ? 'pass' : 'fail']++;
        
      } catch (error) {
        console.error(`Error testing ${url}: ${error.message}`);
      } finally {
        await page.close();
      }
    }
    
    // Output summary
    console.log('\n📊 Accessibility Test Summary:');
    console.log(`Color Contrast: ${results.colorContrast.pass} passed, ${results.colorContrast.fail} failed`);
    console.log(`ARIA Attributes: ${results.ariaAttributes.pass} passed, ${results.ariaAttributes.fail} failed`);
    console.log(`Keyboard Navigation: ${results.keyboardNavigation.pass} passed, ${results.keyboardNavigation.fail} failed`);
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = path.join(resultsDir, `accessibility-test-${timestamp}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to ${resultsPath}`);
    
  } finally {
    await browser.close();
  }
}

// Run the tests
runAccessibilityTests().catch(console.error);