/**
 * Mobile Layout Test Script
 * 
 * This script tests the website layout on mobile devices down to 340px width
 * as specified in requirement 2.4.
 * 
 * Requirements: 2.4 - Maintain proper spacing and layout on mobile devices down to 340px width
 */

const puppeteer = require('puppeteer');
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

// Mobile device widths to test
const mobileWidths = [
  340, // Ultra small (requirement minimum)
  375, // iPhone SE
  390, // iPhone 12/13
  414, // iPhone 8 Plus
  428, // iPhone 13 Pro Max
  480, // Small tablet
  768  // Tablet
];

// Function to check for horizontal overflow
async function checkHorizontalOverflow(page) {
  return page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    
    // Check if body width exceeds viewport width
    const bodyOverflow = body.scrollWidth > window.innerWidth;
    
    // Check if any element extends beyond the viewport width
    const elements = document.querySelectorAll('*');
    let elementOverflow = false;
    let overflowingElements = [];
    
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      if (rect.left < 0 || rect.right > window.innerWidth) {
        elementOverflow = true;
        overflowingElements.push({
          tagName: element.tagName,
          className: element.className,
          id: element.id,
          left: rect.left,
          right: rect.right,
          width: rect.width,
          viewportWidth: window.innerWidth
        });
        
        // Limit to 10 elements to avoid huge results
        if (overflowingElements.length >= 10) break;
      }
    }
    
    return {
      bodyOverflow,
      elementOverflow,
      overflowingElements: overflowingElements.length > 0 ? overflowingElements : null
    };
  });
}

// Function to check for text truncation or overlap
async function checkTextIssues(page) {
  return page.evaluate(() => {
    const textElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, label, input, textarea');
    let issues = [];
    
    for (const element of textElements) {
      // Skip hidden elements
      if (element.offsetParent === null) continue;
      
      const style = window.getComputedStyle(element);
      
      // Check for text overflow
      if (element.scrollWidth > element.clientWidth && style.overflow !== 'visible') {
        issues.push({
          tagName: element.tagName,
          className: element.className,
          id: element.id,
          text: element.textContent.substring(0, 50) + (element.textContent.length > 50 ? '...' : ''),
          issue: 'Text overflow'
        });
      }
      
      // Check for very small text
      if (parseFloat(style.fontSize) < 12) {
        issues.push({
          tagName: element.tagName,
          className: element.className,
          id: element.id,
          text: element.textContent.substring(0, 50) + (element.textContent.length > 50 ? '...' : ''),
          fontSize: style.fontSize,
          issue: 'Small font size'
        });
      }
    }
    
    // Limit to 10 issues to avoid huge results
    return issues.slice(0, 10);
  });
}

// Function to check for touch target size issues
async function checkTouchTargets(page) {
  return page.evaluate(() => {
    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
    let issues = [];
    
    for (const element of interactiveElements) {
      // Skip hidden elements
      if (element.offsetParent === null) continue;
      
      const rect = element.getBoundingClientRect();
      
      // Check if touch target is too small (44x44px is recommended minimum)
      if (rect.width < 44 || rect.height < 44) {
        issues.push({
          tagName: element.tagName,
          className: element.className,
          id: element.id,
          text: element.textContent ? element.textContent.substring(0, 30) : '[no text]',
          width: rect.width,
          height: rect.height,
          issue: 'Touch target too small'
        });
      }
    }
    
    // Limit to 10 issues to avoid huge results
    return issues.slice(0, 10);
  });
}

// Main test function
async function runMobileLayoutTests() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {};
  
  try {
    // Create results directory if it doesn't exist
    const resultsDir = path.join(__dirname, '..', 'test_results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    const screenshotsDir = path.join(resultsDir, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Test each URL
    for (const url of urls) {
      console.log(`\n📱 Testing URL: ${url}`);
      results[url] = {};
      
      // Test each mobile width
      for (const width of mobileWidths) {
        console.log(`Testing at ${width}px width`);
        
        const page = await browser.newPage();
        
        try {
          // Set viewport
          await page.setViewport({
            width: width,
            height: 800,
            deviceScaleFactor: 2,
            isMobile: true,
            hasTouch: true
          });
          
          // Navigate to the page
          await page.goto(url, { waitUntil: 'networkidle2' });
          
          // Take screenshot
          const urlPath = new URL(url).pathname.replace(/\//g, '-').replace(/^-/, '') || 'index';
          const screenshotPath = path.join(screenshotsDir, `${urlPath}-${width}px.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
          
          // Check for layout issues
          const overflowResult = await checkHorizontalOverflow(page);
          const textIssues = await checkTextIssues(page);
          const touchTargetIssues = await checkTouchTargets(page);
          
          // Store results
          results[url][width] = {
            overflow: overflowResult,
            textIssues: textIssues.length > 0 ? textIssues : null,
            touchTargetIssues: touchTargetIssues.length > 0 ? touchTargetIssues : null,
            screenshotPath: screenshotPath,
            pass: !overflowResult.bodyOverflow && !overflowResult.elementOverflow && textIssues.length === 0
          };
          
          // Log results
          if (results[url][width].pass) {
            console.log(`✅ PASS at ${width}px`);
          } else {
            console.log(`❌ FAIL at ${width}px`);
            if (overflowResult.bodyOverflow || overflowResult.elementOverflow) {
              console.log(`  - Horizontal overflow detected`);
            }
            if (textIssues.length > 0) {
              console.log(`  - ${textIssues.length} text issues detected`);
            }
            if (touchTargetIssues.length > 0) {
              console.log(`  - ${touchTargetIssues.length} touch target issues detected`);
            }
          }
          
        } catch (error) {
          console.error(`Error testing ${url} at ${width}px: ${error.message}`);
          results[url][width] = {
            error: error.message,
            pass: false
          };
        } finally {
          await page.close();
        }
      }
    }
    
    // Output summary
    console.log('\n📊 Mobile Layout Test Summary:');
    
    for (const url in results) {
      console.log(`\n${url}:`);
      let passCount = 0;
      
      for (const width of mobileWidths) {
        const result = results[url][width];
        const status = result.pass ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} at ${width}px width`);
        if (result.pass) passCount++;
      }
      
      const allPass = passCount === mobileWidths.length;
      console.log(`${allPass ? '✅' : '❌'} ${passCount}/${mobileWidths.length} widths passed`);
    }
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = path.join(resultsDir, `mobile-layout-test-${timestamp}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to ${resultsPath}`);
    
    // Generate HTML report
    const htmlReport = generateHtmlReport(results, timestamp);
    const htmlReportPath = path.join(resultsDir, `mobile-layout-report-${timestamp}.html`);
    fs.writeFileSync(htmlReportPath, htmlReport);
    console.log(`HTML report saved to ${htmlReportPath}`);
    
  } finally {
    await browser.close();
  }
}

// Function to generate HTML report
function generateHtmlReport(results, timestamp) {
  let urlSections = '';
  
  for (const url in results) {
    let widthRows = '';
    let passCount = 0;
    
    for (const width of mobileWidths) {
      const result = results[url][width];
      if (!result) continue;
      
      if (result.pass) passCount++;
      
      widthRows += `
        <tr>
          <td>${width}px</td>
          <td class="${result.pass ? 'pass' : 'fail'}">${result.pass ? '✅ PASS' : '❌ FAIL'}</td>
          <td>
            ${result.error ? `Error: ${result.error}` : ''}
            ${result.overflow && (result.overflow.bodyOverflow || result.overflow.elementOverflow) ? 
              `<div>Horizontal overflow detected</div>` : ''}
            ${result.textIssues ? `<div>${result.textIssues.length} text issues</div>` : ''}
            ${result.touchTargetIssues ? `<div>${result.touchTargetIssues.length} touch target issues</div>` : ''}
          </td>
          <td>
            ${result.screenshotPath ? `<a href="file://${result.screenshotPath}" target="_blank">View Screenshot</a>` : 'N/A'}
          </td>
        </tr>
      `;
    }
    
    const urlPath = new URL(url).pathname || '/';
    
    urlSections += `
      <section class="url-section">
        <h2>${urlPath}</h2>
        <div class="summary ${passCount === mobileWidths.length ? 'pass' : 'fail'}">
          ${passCount}/${mobileWidths.length} widths passed
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Width</th>
              <th>Status</th>
              <th>Issues</th>
              <th>Screenshot</th>
            </tr>
          </thead>
          <tbody>
            ${widthRows}
          </tbody>
        </table>
      </section>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mobile Layout Test Results - ${timestamp}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1, h2 { color: #2c3e50; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .pass { background-color: #d4edda; color: #155724; }
        .fail { background-color: #f8d7da; color: #721c24; }
        .summary { background-color: #e9ecef; padding: 10px; border-radius: 5px; margin-bottom: 20px; display: inline-block; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
        .url-section { margin-bottom: 40px; }
      </style>
    </head>
    <body>
      <h1>Mobile Layout Test Results</h1>
      <p class="timestamp">Generated on: ${new Date(timestamp.replace(/-/g, ':')).toLocaleString()}</p>
      
      ${urlSections}
      
      <h2>About the Tests</h2>
      <ul>
        <li><strong>Horizontal Overflow:</strong> Checks if any content extends beyond the viewport width, causing horizontal scrolling.</li>
        <li><strong>Text Issues:</strong> Identifies text that may be truncated, too small, or otherwise problematic on mobile.</li>
        <li><strong>Touch Target Issues:</strong> Finds interactive elements that are too small for comfortable touch interaction (< 44x44px).</li>
      </ul>
      
      <p>These tests verify compliance with requirement 2.4: Maintain proper spacing and layout on mobile devices down to 340px width.</p>
    </body>
    </html>
  `;
}

// Run the tests
runMobileLayoutTests().catch(console.error);