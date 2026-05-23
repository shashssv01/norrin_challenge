---
name: Compliance Lens
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#271901'
  on-tertiary-container: '#98805d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  citation:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: -0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 16px
  container-max: 1280px
---

## Brand & Style

The design system is engineered for **Institutional Trust** and **Regulatory Precision**. Targeting legal departments, compliance officers, and AI developers, the UI must evoke an emotional response of security, thoroughness, and authoritative guidance. 

The chosen style is **Corporate / Modern** with strong **Minimalist** influences. It avoids unnecessary decorative flourishes in favor of structural clarity and high-contrast information density. Every pixel must feel intentional, reflecting the gravity of legal compliance. The aesthetic utilizes generous whitespace to reduce cognitive load during complex document reviews, while maintaining a strict, grid-based order that suggests a systematic approach to the AI Act.

## Colors

The palette is anchored by **Deep Navy (#0F172A)** to establish immediate professional authority. The primary color is used for navigation, core branding, and primary actions to signify stability.

Functional colors are critical for the "Risk Tiering" system of the AI Act. These are used sparingly but decisively:
- **Crimson (#991B1B)** for Prohibited practices, requiring immediate attention.
- **Amber (#D97706)** for High Risk, signaling caution and mandatory documentation.
- **Blue (#2563EB)** for Limited Risk, denoting transparency requirements.
- **Green (#16A34A)** for Minimal Risk.

The default mode is **Light**, utilizing a tiered grayscale (Slate/Zinc) for background surfaces to maintain the feel of a digital "White Paper."

## Typography

This design system uses a triple-font strategy to differentiate between narrative, data, and legal references:
1. **Source Serif 4**: Used for headlines and section titles. Its transitional serif style provides a "Legal Tech" aesthetic that feels scholarly and established.
2. **Inter**: The workhorse for all body copy and interface elements. It ensures maximum readability for long-form compliance explanations.
3. **JetBrains Mono**: Reserved for citations, Article numbers (e.g., *Article 52*), and technical metadata. The monospaced nature emphasizes the "Lens" or "Scanner" aspect of the AI tool.

Mobile adjustments: `headline-lg` scales to 24px on devices below 768px. All body copy remains at a minimum of 16px to ensure accessibility during field audits.

## Layout & Spacing

The layout follows a **Fixed Grid** model for the main dashboard to provide a sense of structured data, transitioning to a **Fluid Grid** for document viewers. 

- **Desktop (1440px+):** 12-column grid with 24px gutters and 64px outer margins.
- **Tablet (768px - 1024px):** 8-column grid with 20px gutters and 32px margins.
- **Mobile (<768px):** 4-column grid with 16px gutters and 16px margins.

Spacing follows a strict 4px base unit. Component internal padding should be generous (typically 24px or 32px for cards) to emphasize the premium, high-trust nature of the product. The "Disclaimer Architecture" is implemented as a fixed 40px utility bar at the top or bottom of the viewport, ensuring confidence scores and legal disclaimers never scroll out of view.

## Elevation & Depth

To maintain a professional and "flat" institutional feel, this design system avoids heavy shadows. Depth is communicated through **Low-contrast Outlines** and **Tonal Layers**.

- **Level 0 (Background):** #F8FAFC (Slate 50).
- **Level 1 (Cards/Surface):** White (#FFFFFF) with a 1px border in #E2E8F0.
- **Level 2 (Dropdowns/Modals):** White with a 1px border in #CBD5E1 and a very soft ambient shadow (0px 4px 12px rgba(15, 23, 42, 0.05)).

Active states and focused elements use a 2px Deep Navy border rather than a shadow to indicate selection, reinforcing the "precision" brand pillar.

## Shapes

The shape language is **Soft (0.25rem / 4px)**. This subtle rounding removes the aggressive sharpness of pure brutalism while maintaining a structured, formal appearance. 

- **Small elements (Buttons, Inputs, Tags):** 4px radius.
- **Large elements (Cards, Modals):** 8px radius (`rounded-lg`).
- **Interactive Focus Rings:** 2px offset with a 4px radius.

Buttons are never pill-shaped; they remain rectangular with soft corners to align with the "Legal Tech" aesthetic.

## Components

### Four-Eyes Principle Cards
The primary interface pattern for validation. These are split-view cards.
- **Left Column (Classifier):** Labeled with a "Source: AI" tag. Uses a subtle Blue-tinted background.
- **Right Column (Validator):** Labeled with a "Source: Expert" tag. Uses a subtle Slate-tinted background.
- A vertical "Challenge" line connects the two if the Validator disagrees with the AI.

### Risk Indicators
Status chips using the functional color palette. They include a small circular dot icon and the Risk Tier in `label-caps`. 

### Input Fields
Strict, bordered inputs. Label is always visible above the field in `body-sm` (Slate 600). Focus state uses a 2px Navy border.

### Buttons
- **Primary:** Deep Navy (#0F172A) background with White text.
- **Secondary:** White background with 1px Slate border.
- **Ghost:** Transparent background with Navy text, used for secondary citations.

### Disclaimer Architecture (Persistent Bar)
A full-width, low-height bar at the bottom of the screen. Background: #1E293B (Slate 800), Text: White `body-sm`. It must display: "Confidence Score," "AI-Generated Content Disclaimer," and "Last Audit Date."

### Citation Chips
Small, `jetbrainsMono` formatted tags used within text blocks to link to specific EU AI Act articles. Background: #F1F5F9; Border: #E2E8F0.