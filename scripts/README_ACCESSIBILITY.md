# Accessibility Testing Documentation

This document explains how to run accessibility tests for the EihDah website and what they check for.

## Overview

The accessibility tests check for compliance with WCAG AA standards, focusing on:

1. **Color contrast compliance** - Ensures text has sufficient contrast against its background
2. **ARIA attributes validation** - Checks that ARIA attributes are used correctly
3. **Keyboard navigation testing** - Verifies that all interactive elements can be accessed via keyboard

## Requirements

These tests fulfill Requirement 2.5 from the project specifications:
> WHEN any section of the website is displayed THEN the system SHALL ensure all elements pass WCAG AA contrast requirements.

## Running the Tests

To run the accessibility tests:

1. Make sure the development server is running:
   ```
   npm run dev
   ```

2. In a separate terminal, run the accessibility tests:
   ```
   npm run test:a11y
   ```

## Test Details

### Color Contrast Testing

- Uses axe-core to check all text elements against WCAG AA contrast requirements
- Identifies elements with insufficient contrast
- Provides suggestions for fixing contrast issues

### ARIA Attributes Validation

- Checks that ARIA attributes are used correctly
- Validates roles, states, and properties
- Ensures proper parent-child relationships for ARIA components
- Verifies that required ARIA attributes are present

### Keyboard Navigation Testing

- Tests that all interactive elements can be reached using the Tab key
- Verifies that accordion components can be operated with keyboard
- Checks that focus indicators are visible
- Ensures proper focus order

## Test Results

Test results are saved to the `test_results` directory with a timestamp. The results include:

- Summary of passed/failed tests for each category
- Detailed information about any failures
- Suggestions for fixing issues

## Fixing Common Issues

### Color Contrast

- Increase the contrast between text and background colors
- Use darker text on light backgrounds or lighter text on dark backgrounds
- Avoid using gray text on colored backgrounds

### ARIA Attributes

- Ensure all interactive elements have appropriate ARIA roles
- Add missing required ARIA attributes
- Fix incorrect parent-child relationships

### Keyboard Navigation

- Add tabindex="0" to elements that should be focusable
- Ensure visible focus indicators
- Implement proper keyboard event handlers for custom components

## Resources

- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa)
- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)