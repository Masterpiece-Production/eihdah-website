# Performance Testing Documentation

This document explains how to run performance tests for the EihDah website and what they check for.

## Overview

The performance tests focus on:

1. **Cumulative Layout Shift (CLS)** - Ensures the website maintains CLS below 0.1 on mobile devices
2. **Mobile Layout Testing** - Verifies proper layout and spacing on mobile devices down to 340px width
3. **Lighthouse CI** - Automated performance testing in CI/CD pipeline

## Requirements

These tests fulfill the following requirements from the project specifications:

- Requirement 2.4: WHEN the website is viewed on mobile devices (down to 340px width) THEN the system SHALL maintain proper spacing and layout.
- Requirement 2.6: WHEN the page loads on mobile devices THEN the system SHALL maintain Cumulative Layout Shift (CLS) below 0.1 on Lighthouse mobile tests.

## Running the Tests

### Local Testing

To run the performance tests locally:

1. Make sure the development server is running:
   ```
   npm run dev
   ```

2. In a separate terminal, run the CLS tests:
   ```
   npm run test:cls
   ```

3. To test mobile layouts:
   ```
   npm run test:mobile
   ```

4. To run all performance tests:
   ```
   npm run test:perf
   ```

5. To run all tests (performance, accessibility, and Open Graph):
   ```
   npm run test:all
   ```

### CI/CD Testing

Performance tests are automatically run in the CI/CD pipeline using GitHub Actions and Lighthouse CI. The configuration is in:

- `.github/workflows/lighthouse-ci.yml`
- `.github/lighthouse-config.json`

## Test Details

### CLS Testing

The `test_cls.js` script:

- Measures CLS using both Puppeteer and Lighthouse
- Tests on mobile viewport sizes
- Generates detailed reports with pass/fail status
- Provides visual reports with screenshots

### Mobile Layout Testing

The `test_mobile_layout.js` script:

- Tests layouts at multiple mobile widths (340px to 768px)
- Checks for horizontal overflow issues
- Identifies text truncation or small font issues
- Validates touch target sizes
- Takes screenshots at each width for visual comparison

### Lighthouse CI

The Lighthouse CI configuration:

- Runs performance tests on multiple pages
- Tests both mobile and desktop experiences
- Enforces strict thresholds for key metrics
- Generates detailed reports accessible from GitHub Actions

## Test Results

Test results are saved to the `test_results` directory with timestamps. The results include:

- JSON data with detailed metrics
- HTML reports with visualizations
- Screenshots for visual comparison
- Links to Lighthouse reports

## Fixing Common Issues

### CLS Issues

- Add explicit width and height attributes to images
- Use aspect ratio boxes for media elements
- Avoid inserting content above existing content
- Use CSS transform for animations instead of properties that trigger layout changes

### Mobile Layout Issues

- Use responsive units (%, rem, em) instead of fixed pixel values
- Test with actual devices or accurate emulators
- Implement proper media queries for different screen sizes
- Ensure touch targets are at least 44x44px

## Resources

- [Web Vitals - CLS](https://web.dev/cls/)
- [Optimize CLS](https://web.dev/optimize-cls/)
- [Responsive Design Testing](https://web.dev/responsive-web-design-basics/)
- [Lighthouse Documentation](https://github.com/GoogleChrome/lighthouse)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)