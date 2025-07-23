/**
 * Performance Test Script - Cumulative Layout Shift (CLS)
 * 
 * This script tests the website for performance metrics with a focus on CLS scores
 * on mobile devices as specified in requirement 2.6.
 * 
 * Requirements: 2.6 - Maintain CLS below 0.1 on Lighthouse mobile tests
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// URLs to test
const urls = [
  'http://localhost:5000/',
  'http://localhost:5000/contact.html',
  'http://localhost:5000/thanks.html',
  'http://localhost:5000/privacy.html',
  'http://localhost:5000/terms.html'
];

// Mobile device configuration
const mobileDevice = {
  name: 'Mobile',
  userAgent: 'Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Mobile Safari/537.36',
  viewport: {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    isLandscape: false
  }
};

// Function to measure CLS
async function measureCLS(page) {
  // Inject the PerformanceObserver to measure CLS
  await page.evaluate(() => {
    window.clsValue = 0;
    
    // Create a PerformanceObserver to monitor layout shifts
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          window.clsValue += entry.value;
        }
      }
    });
    
    // Start observing layout shift entries
    observer.observe({ type: 'layout-shift', buffered: true });
  });
  
  // Wait for page to stabilize (5 seconds)
  await page.waitForTimeout(5000);
  
  // Scroll the page to trigger any lazy-loaded content
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight / 2);
  });
  
  // Wait for any layout shifts from scrolling
  await page.waitForTimeout(2000);
  
  // Scroll to bottom
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  
  // Wait for any layout shifts from scrolling
  await page.waitForTimeout(2000);
  
  // Get the final CLS value
  const clsValue = await page.evaluate(() => window.clsValue);
  return clsValue;
}

// Function to run Lighthouse CLI for more accurate CLS measurement
async function runLighthouse(url, isMobile = true) {
  const outputPath = path.join(__dirname, '..', 'test_results', 'lighthouse');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  const fileName = `lighthouse-${new URL(url).pathname.replace(/\//g, '-').replace(/^-/, '')}-${isMobile ? 'mobile' : 'desktop'}.json`;
  const outputFile = path.join(outputPath, fileName || 'index.json');
  
  try {
    // Run Lighthouse CLI
    const deviceFlag = isMobile ? '--preset=mobile' : '--preset=desktop';
    const command = `npx lighthouse ${url} --output=json --output-path="${outputFile}" ${deviceFlag} --chrome-flags="--headless --no-sandbox --disable-gpu"`;
    
    console.log(`Running Lighthouse for ${url} (${isMobile ? 'Mobile' : 'Desktop'})`);
    execSync(command, { stdio: 'inherit' });
    
    // Read and parse the Lighthouse results
    const rawData = fs.readFileSync(outputFile);
    const lighthouseResult = JSON.parse(rawData);
    
    // Extract CLS score
    const cls = lighthouseResult.audits['cumulative-layout-shift'].numericValue;
    const clsScore = lighthouseResult.audits['cumulative-layout-shift'].score;
    
    return {
      cls,
      clsScore,
      performanceScore: lighthouseResult.categories.performance.score * 100,
      lcp: lighthouseResult.audits['largest-contentful-paint'].numericValue,
      fid: lighthouseResult.audits['max-potential-fid'].numericValue,
      tbt: lighthouseResult.audits['total-blocking-time'].numericValue,
      reportPath: outputFile
    };
  } catch (error) {
    console.error(`Error running Lighthouse for ${url}: ${error.message}`);
    return {
      cls: null,
      clsScore: null,
      performanceScore: null,
      lcp: null,
      fid: null,
      tbt: null,
      error: error.message
    };
  }
}

// Main test function
async function runPerformanceTests() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = {
    puppeteerCLS: [],
    lighthouse: []
  };
  
  try {
    // Create results directory if it doesn't exist
    const resultsDir = path.join(__dirname, '..', 'test_results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    // Test each URL
    for (const url of urls) {
      console.log(`\n📊 Testing URL: ${url}`);
      
      // Test with Puppeteer
      const page = await browser.newPage();
      
      try {
        // Set mobile device emulation
        await page.emulate(mobileDevice);
        
        // Navigate to the page
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        // Measure CLS
        const cls = await measureCLS(page);
        
        console.log(`Puppeteer CLS: ${cls.toFixed(3)}`);
        results.puppeteerCLS.push({
          url,
          cls,
          pass: cls < 0.1
        });
        
      } catch (error) {
        console.error(`Error testing ${url} with Puppeteer: ${error.message}`);
      } finally {
        await page.close();
      }
      
      // Test with Lighthouse
      try {
        const lighthouseResult = await runLighthouse(url, true); // true for mobile
        
        if (lighthouseResult.cls !== null) {
          console.log(`Lighthouse CLS: ${lighthouseResult.cls.toFixed(3)} (Score: ${lighthouseResult.clsScore})`);
          console.log(`Performance Score: ${lighthouseResult.performanceScore.toFixed(0)}%`);
          console.log(`LCP: ${(lighthouseResult.lcp / 1000).toFixed(2)}s`);
          console.log(`TBT: ${lighthouseResult.tbt.toFixed(0)}ms`);
          
          results.lighthouse.push({
            url,
            cls: lighthouseResult.cls,
            clsScore: lighthouseResult.clsScore,
            performanceScore: lighthouseResult.performanceScore,
            lcp: lighthouseResult.lcp,
            tbt: lighthouseResult.tbt,
            pass: lighthouseResult.cls < 0.1,
            reportPath: lighthouseResult.reportPath
          });
        } else {
          console.log(`Lighthouse test failed: ${lighthouseResult.error}`);
        }
      } catch (error) {
        console.error(`Error running Lighthouse for ${url}: ${error.message}`);
      }
    }
    
    // Output summary
    console.log('\n📊 Performance Test Summary:');
    
    console.log('\nPuppeteer CLS Results:');
    let puppeteerPassCount = 0;
    results.puppeteerCLS.forEach(result => {
      const status = result.pass ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${result.url}: CLS = ${result.cls.toFixed(3)}`);
      if (result.pass) puppeteerPassCount++;
    });
    
    console.log('\nLighthouse CLS Results:');
    let lighthousePassCount = 0;
    results.lighthouse.forEach(result => {
      const status = result.pass ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${result.url}: CLS = ${result.cls.toFixed(3)}, Performance = ${result.performanceScore.toFixed(0)}%`);
      if (result.pass) lighthousePassCount++;
    });
    
    console.log(`\nPuppeteer: ${puppeteerPassCount}/${results.puppeteerCLS.length} URLs passed CLS test`);
    console.log(`Lighthouse: ${lighthousePassCount}/${results.lighthouse.length} URLs passed CLS test`);
    
    // Save results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsPath = path.join(resultsDir, `performance-test-${timestamp}.json`);
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to ${resultsPath}`);
    
    // Generate HTML report
    const htmlReport = generateHtmlReport(results, timestamp);
    const htmlReportPath = path.join(resultsDir, `performance-report-${timestamp}.html`);
    fs.writeFileSync(htmlReportPath, htmlReport);
    console.log(`HTML report saved to ${htmlReportPath}`);
    
  } finally {
    await browser.close();
  }
}

// Function to generate HTML report
function generateHtmlReport(results, timestamp) {
  const puppeteerRows = results.puppeteerCLS.map(result => `
    <tr>
      <td>${result.url}</td>
      <td class="${result.cls < 0.1 ? 'pass' : 'fail'}">${result.cls.toFixed(3)}</td>
      <td>${result.pass ? '✅ PASS' : '❌ FAIL'}</td>
    </tr>
  `).join('');
  
  const lighthouseRows = results.lighthouse.map(result => `
    <tr>
      <td>${result.url}</td>
      <td class="${result.cls < 0.1 ? 'pass' : 'fail'}">${result.cls.toFixed(3)}</td>
      <td>${result.performanceScore.toFixed(0)}%</td>
      <td>${(result.lcp / 1000).toFixed(2)}s</td>
      <td>${result.tbt.toFixed(0)}ms</td>
      <td>${result.pass ? '✅ PASS' : '❌ FAIL'}</td>
      <td><a href="file://${result.reportPath}" target="_blank">View Report</a></td>
    </tr>
  `).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Performance Test Results - ${timestamp}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1, h2 { color: #2c3e50; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 30px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .pass { background-color: #d4edda; color: #155724; }
        .fail { background-color: #f8d7da; color: #721c24; }
        .summary { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
      </style>
    </head>
    <body>
      <h1>Performance Test Results</h1>
      <p class="timestamp">Generated on: ${new Date(timestamp.replace(/-/g, ':')).toLocaleString()}</p>
      
      <div class="summary">
        <h2>Summary</h2>
        <p>Puppeteer: ${results.puppeteerCLS.filter(r => r.pass).length}/${results.puppeteerCLS.length} URLs passed CLS test</p>
        <p>Lighthouse: ${results.lighthouse.filter(r => r.pass).length}/${results.lighthouse.length} URLs passed CLS test</p>
      </div>
      
      <h2>Puppeteer CLS Results</h2>
      <table>
        <thead>
          <tr>
            <th>URL</th>
            <th>CLS</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${puppeteerRows}
        </tbody>
      </table>
      
      <h2>Lighthouse Results</h2>
      <table>
        <thead>
          <tr>
            <th>URL</th>
            <th>CLS</th>
            <th>Performance</th>
            <th>LCP</th>
            <th>TBT</th>
            <th>Status</th>
            <th>Report</th>
          </tr>
        </thead>
        <tbody>
          ${lighthouseRows}
        </tbody>
      </table>
      
      <h2>About the Metrics</h2>
      <ul>
        <li><strong>CLS (Cumulative Layout Shift):</strong> Measures visual stability. Lower is better, with < 0.1 being good.</li>
        <li><strong>Performance Score:</strong> Overall Lighthouse performance score (0-100%).</li>
        <li><strong>LCP (Largest Contentful Paint):</strong> Measures loading performance. Lower is better, with < 2.5s being good.</li>
        <li><strong>TBT (Total Blocking Time):</strong> Measures interactivity. Lower is better, with < 300ms being good.</li>
      </ul>
    </body>
    </html>
  `;
}

// Run the tests
runPerformanceTests().catch(console.error);