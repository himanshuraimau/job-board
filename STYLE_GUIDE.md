# TalentFlow Design System

## Overview

A clean, modern, and minimalist design system focused on functionality and clarity. No gradients, emphasis on typography, whitespace, and subtle interactions.

## Color Palette

### Primary Colors
- **Background**: `#ffffff` (White)
- **Surface**: `#f8fafc` (Slate 50)
- **Border**: `#e2e8f0` (Slate 200)
- **Muted**: `#64748b` (Slate 500)

### Accent Colors
- **Primary**: `#0f172a` (Slate 900)
- **Secondary**: `#334155` (Slate 700)
- **Success**: `#059669` (Emerald 600)
- **Warning**: `#d97706` (Amber 600)
- **Error**: `#dc2626` (Red 600)
- **Info**: `#2563eb` (Blue 600)

### Text Colors
- **Primary Text**: `#0f172a` (Slate 900)
- **Secondary Text**: `#475569` (Slate 600)
- **Muted Text**: `#64748b` (Slate 500)
- **Light Text**: `#94a3b8` (Slate 400)

## Typography

### Font Stack
- **Primary**: `Inter, system-ui, -apple-system, sans-serif`
- **Monospace**: `'JetBrains Mono', 'Fira Code', monospace`

### Text Scales

```css
/* Headings */
.text-5xl { font-size: 3rem; line-height: 1.2; } /* 48px */
.text-4xl { font-size: 2.25rem; line-height: 1.25; } /* 36px */
.text-3xl { font-size: 1.875rem; line-height: 1.3; } /* 30px */
.text-2xl { font-size: 1.5rem; line-height: 1.35; } /* 24px */
.text-xl { font-size: 1.25rem; line-height: 1.4; } /* 20px */

/* Body Text */
.text-lg { font-size: 1.125rem; line-height: 1.6; } /* 18px */
.text-base { font-size: 1rem; line-height: 1.6; } /* 16px */
.text-sm { font-size: 0.875rem; line-height: 1.5; } /* 14px */
.text-xs { font-size: 0.75rem; line-height: 1.4; } /* 12px */
```

### Font Weights
- **Light**: 300
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## Spacing System

Based on 4px base unit:

- **xs**: 4px (0.25rem)
- **sm**: 8px (0.5rem)
- **md**: 16px (1rem)
- **lg**: 24px (1.5rem)
- **xl**: 32px (2rem)
- **2xl**: 48px (3rem)
- **3xl**: 64px (4rem)

## Components

### Buttons

#### Primary Button
```css
.btn-primary {
  background: #0f172a;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}
.btn-primary:hover {
  background: #1e293b;
  transform: translateY(-1px);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}
.btn-secondary:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}
```

### Cards
```css
.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}
.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```

### Form Elements
```css
.input {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  transition: border-color 0.2s;
  background: white;
}
.input:focus {
  outline: none;
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.1);
}
```

## Layout

### Container Widths
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Grid System
- 12-column grid
- 16px gutters
- Responsive breakpoints

## Animations

### Transitions
- **Fast**: 0.15s ease-out
- **Normal**: 0.2s ease-out
- **Slow**: 0.3s ease-out

### Common Animations
```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

/* Scale in */
@keyframes scaleIn {
  from { 
    opacity: 0; 
    transform: scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: scale(1); 
  }
}
```

## Icons

- Use **Lucide React** icon library
- 16px, 20px, 24px standard sizes
- Consistent stroke width: 1.5px
- Match text color by default

## States

### Loading States
- Subtle skeleton loaders
- Spinner for actions
- Progressive loading for lists

### Error States
- Clear error messages
- Retry actions where applicable
- Non-destructive error handling

### Empty States
- Helpful illustrations
- Clear call-to-action
- Guidance for next steps

## Accessibility

- **Contrast Ratio**: Minimum 4.5:1 for normal text
- **Focus States**: Visible focus indicators
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels
- **Motion**: Respect `prefers-reduced-motion`

## Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
- Start with mobile design
- Progressive enhancement
- Touch-friendly targets (44px minimum)
