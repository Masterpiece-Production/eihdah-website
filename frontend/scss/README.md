# EihDah Design System

This document outlines the design system for the EihDah microsite, including color tokens, typography, spacing, and accessibility guidelines.

## Color System

All colors in the design system have been tested for WCAG AA compliance. The contrast ratios are documented in the variables.scss file.

### Primary Colors
- `$primary`: #3949ab - Main brand color
- `$primary-dark`: #1a237e - Darker variant for hover states and accents
- `$primary-light`: #7986cb - Lighter variant for backgrounds and accents

### Secondary Colors
- `$secondary`: #ff5722 - Secondary brand color for CTAs and highlights
- `$secondary-dark`: #d84315 - Darker variant for hover states
- `$secondary-light`: #ff8a65 - Lighter variant for backgrounds

### Accent Colors
- `$accent`: #00bcd4 - Accent color for tertiary elements
- `$accent-dark`: #0097a7 - Darker variant
- `$accent-light`: #4dd0e1 - Lighter variant

### Semantic Colors
- `$success`: #4caf50 - Success states
- `$warning`: #ff9800 - Warning states
- `$danger`: #f44336 - Error states
- `$info`: #2196f3 - Information states

### Neutral Colors
- `$dark`: #212121 - Dark text color
- `$light`: #f5f5f5 - Light background color
- `$white`: #ffffff - White
- `$black`: #000000 - Black

### Gray Scale
- `$gray-100` through `$gray-900` - Various shades of gray for UI elements

## Typography

### Font Families
- `$font-family-sans-serif`: 'Inter', system-ui, etc. - Primary font for all text
- `$font-family-monospace`: SFMono-Regular, etc. - For code snippets

### Font Weights
- `$font-weight-normal`: 400
- `$font-weight-medium`: 500
- `$font-weight-semibold`: 600
- `$font-weight-bold`: 700

### Font Sizes
- Base: 1rem (16px)
- Headings: Fluid scaling between mobile and desktop sizes
- Utility classes: .fs-1 through .fs-6, .fs-sm, .fs-xs

## Spacing System

The spacing system is built on a base unit of 1rem (16px) and provides consistent spacing throughout the interface.

### Numeric Scale
- 0: 0
- 1: 0.25rem (4px)
- 2: 0.5rem (8px)
- 3: 0.75rem (12px)
- 4: 1rem (16px)
- 5: 1.5rem (24px)
- 6: 2rem (32px)
- 7: 3rem (48px)
- 8: 4rem (64px)
- 9: 6rem (96px)
- 10: 8rem (128px)

### Semantic Scale
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)
- 3xl: 4rem (64px)
- 4xl: 6rem (96px)
- 5xl: 8rem (128px)

### Section Spacing
- Small: 3rem (48px)
- Medium: 5rem (80px)
- Large: 8rem (128px)

### Component Spacing
- Extra Small: 0.5rem (8px)
- Small: 1rem (16px)
- Medium: 1.5rem (24px)
- Large: 2rem (32px)

## Accessibility

All color combinations have been tested to ensure they meet WCAG AA contrast requirements:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio

### Accessibility Features
- Focus styles for keyboard navigation
- Skip links for screen readers
- Reduced motion options
- ARIA attribute styling
- Screen reader utilities

## Usage

### Color Usage
```scss
.my-element {
  color: $primary;
  background-color: $light;
}
```

### Utility Classes
```html
<div class="text-primary bg-light p-4 mb-5">
  This element has primary text color, light background, padding of 1rem, and margin-bottom of 3rem.
</div>
```

### Responsive Utilities
```html
<div class="text-center text-md-start">
  This text is centered on mobile and left-aligned on medium screens and up.
</div>
```

### Accessibility Classes
```html
<button class="focus-ring">
  This button has an accessible focus style.
</button>

<a href="#main" class="skip-link">Skip to main content</a>
```