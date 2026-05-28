---
name: Kuku Smart
colors:
  surface: '#fbf8ff'
  surface-dim: '#d5d8f9'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2ff'
  surface-container: '#ececff'
  surface-container-high: '#e5e6ff'
  surface-container-highest: '#dee0ff'
  on-surface: '#161a32'
  on-surface-variant: '#404943'
  inverse-surface: '#2b2f48'
  inverse-on-surface: '#f0efff'
  outline: '#707973'
  outline-variant: '#bfc9c1'
  surface-tint: '#2c694e'
  primary: '#0f5238'
  on-primary: '#ffffff'
  primary-container: '#2d6a4f'
  on-primary-container: '#a8e7c5'
  inverse-primary: '#95d4b3'
  secondary: '#7d5800'
  on-secondary: '#ffffff'
  secondary-container: '#ffb702'
  on-secondary-container: '#6b4b00'
  tertiary: '#634019'
  on-tertiary: '#ffffff'
  tertiary-container: '#7e572e'
  on-tertiary-container: '#ffd1a7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f0ce'
  primary-fixed-dim: '#95d4b3'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#0e5138'
  secondary-fixed: '#ffdea9'
  secondary-fixed-dim: '#ffba27'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4100'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#f0bd8b'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#623f18'
  background: '#fbf8ff'
  on-background: '#161a32'
  surface-variant: '#dee0ff'
typography:
  headline-lg:
    fontFamily: Work Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
  headline-lg-mobile:
    fontFamily: Work Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Work Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.5px
  label-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  margin-mobile: 1.25rem
  gutter-mobile: 1rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 1.5rem
  touch-target: 3rem
---

## Brand & Style

The design system is built for the agricultural sector, specifically poultry management. The brand personality is **practical, dependable, and nurturing**. It aims to evoke a sense of organized growth and vitality, transforming complex farm data into actionable insights for farmers.

The visual style is **Corporate / Modern** with a focus on **High-Accessibility**. It prioritizes utility over decoration, utilizing a "no-frills" aesthetic that ensures the interface remains legible under direct sunlight or in dusty environments. The UI feels low-cost and efficient, avoiding unnecessary gradients or heavy effects in favor of clear information hierarchy and high-contrast elements.

## Colors

The palette is grounded in the natural environment of a farm while maintaining a professional software feel.

- **Primary (Forest Green):** Represents growth, health, and the agricultural foundation. Used for primary actions and brand presence.
- **Secondary (Vitality Yellow):** Represents energy and health. Used sparingly for highlights, alerts, or status indicators related to livestock wellbeing.
- **Tertiary (Earth Brown):** A grounding color used for secondary accents or categorization.
- **Neutral (Slate):** A high-contrast neutral used for typography and icons to ensure maximum readability against the light background.

The background uses a subtle off-white (`#F8F9FA`) to reduce glare and eye strain for farmers spending long periods in the app.

## Typography

Typography is the most critical element of this design system. It uses a dual-font approach to balance professional structure with extreme readability.

- **Headlines (Work Sans):** Chosen for its grounded, professional, and stable appearance. It provides a clear anchor for page sections.
- **Body & Labels (Atkinson Hyperlegible Next):** Specifically designed for high-legibility. The distinct character shapes help prevent errors in data entry and reading, which is vital when monitoring flock health or financial records.

Text sizes are slightly larger than standard mobile apps to accommodate outdoor usage and varied vision levels. Line heights are generous to prevent crowding of information.

## Layout & Spacing

This design system follows a **Mobile-First Fluid Grid**. On mobile devices, it uses a 4-column system that expands to 8 columns on tablets and 12 columns on desktop.

**Spacing Principles:**
- **Generous Touch Targets:** Every interactive element maintains a minimum height of 48px (`3rem`) to ensure accuracy for users who may be wearing gloves or have dirty hands.
- **Vertical Rhythm:** A consistent 8px base unit is used. Content is grouped into "cards" or "slabs" with clear 16px (`stack-md`) spacing between them to differentiate data points.
- **Safe Margins:** 20px (`1.25rem`) side margins ensure that content does not get cut off by screen protectors or ruggedized phone cases.

## Elevation & Depth

To maintain a "no-frills" and accessible aesthetic, depth is communicated through **Tonal Layers** rather than heavy shadows.

- **Level 0 (Base):** The app background in light grey/white.
- **Level 1 (Surface):** White cards used for data modules and list items. These use a very thin, low-contrast 1px border (`#DEE2E6`) to define their edges.
- **Level 2 (Active):** High-contrast primary color surfaces used for buttons or active state indicators.

Shadows are used only for floating action buttons (FABs) or critical modal overlays, using a tight, dark, low-blur shadow to imply physical stacking without looking "dreamy" or decorative.

## Shapes

The design system uses **Soft (0.25rem)** roundedness. 

This subtle rounding provides a modern, friendly feel while maintaining a sense of efficiency and industrial reliability. It avoids the "playfulness" of pill-shaped buttons in favor of a more utilitarian, tool-like appearance. 

- **Small elements (Checkboxes):** 2px radius.
- **Standard elements (Buttons, Inputs):** 4px (`0.25rem`) radius.
- **Large containers (Cards):** 8px (`0.5rem`) radius.

## Components

### Buttons
Primary buttons use the Primary Green with white text. Secondary buttons use a thick 2px Primary Green border. All buttons must have a height of 48px or 56px to provide a large, confident touch target.

### Input Fields
Inputs are outlined with a 1px border. Labels are always visible (never floating) above the input to ensure the user never loses context of what they are filling in. Support for large numeric keypads is a priority for data entry.

### Cards & Lists
Data is presented in "Record Cards." Each card groups related info (e.g., Feed Consumption, Mortality). Cards use a white background with a subtle border. Lists of animals or inventory use high-contrast text and a clear chevron icon for navigation.

### Chips & Status Indicators
Status indicators (e.g., "Healthy," "At Risk," "Sold") use high-contrast background tints with bold labels. Green for success, Yellow for warning, and Red for critical alerts.

### Navigation
A persistent Bottom Navigation bar with large icons and clear text labels. Icons must be simple, thick-stroked glyphs for clarity.

### Specialized Components
- **Data Entry Stepper:** A simplified multi-step form for recording daily flock data, reducing cognitive load by showing one input category at a time.
- **Health Badge:** A high-visibility indicator placed at the top of flock dashboards to show the overall status of the farm at a glance.