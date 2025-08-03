# Taskorator Design System Guide

## 🎨 **Design Philosophy**

### Core Principles
- **Flat Design**: Minimal depth, clean lines, no unnecessary shadows or gradients
- **Mobile-First**: Optimized for 360px width screens, scales up gracefully
- **Accessible**: High contrast ratios, clear visual hierarchy, touch-friendly targets
- **Efficient**: Fast interactions, minimal cognitive load, compact layouts
- **Consistent**: Standardized spacing, colors, and patterns across all components

### Visual Identity
- **Primary Brand**: Purple gradient (`#7d4fbf` to `#a18ac1`)
- **Interaction Colors**: Blue (`#007bff`), Green (`#27ae60`), Red (`#c0392b`)
- **Neutral Base**: Gray (`#6c757d`), Light Gray (`#b4b4b4`)
- **Typography**: Angular Material's Roboto font family

## 📐 **Layout Architecture**

### App Structure
```
app.component.html
├── .theme-app (root container)
├── app-horizontal-navigation (top navigation bar)
└── router-outlet (main content area)
    ├── Welcome/Login pages
    ├── Task management views
    └── Settings/Admin pages
```

### Navigation Pattern
- **Horizontal Navigation**: Fixed top bar (56px height) with toolbar sections
- **Sidebar Navigation**: Collapsible drawer with dual-column layout
- **Content Area**: Full-width below navigation with consistent padding
- **Mobile Navigation**: Responsive design with overlay drawer

## 🧩 **Component Design Patterns**

### Theme Integration Pattern
All components follow a consistent theming approach:

```html
<!-- Container with theme classes -->
<div class="component-container theme-content">
  <!-- Header with theme typography -->
  <div class="component-header">
    <h2 class="component-title theme-text-primary">
      <mat-icon class="title-icon">icon_name</mat-icon>
      Title Text
    </h2>
  </div>
  
  <!-- Card pattern -->
  <div class="component-card theme-card">
    <div class="card-body">
      <!-- Interactive elements with theme classes -->
      <button class="action-btn theme-nav-item">
        <mat-icon>action_icon</mat-icon>
      </button>
    </div>
  </div>
</div>
```

### Navigation Component Structure
```html
<!-- Toolbar with sections -->
<mat-toolbar class="theme-topbar nav-toolbar">
  <div class="nav-toolbar-left">   <!-- Menu button -->
  <div class="nav-toolbar-center"> <!-- Title/branding -->
  <div class="nav-toolbar-right">  <!-- Actions/search -->
</mat-toolbar>

<!-- Sidebar with dual columns -->
<mat-sidenav class="theme-sidebar">
  <div class="nav-items-container">
    <div class="nav-column nav-parent-column">   <!-- Main navigation -->
    <div class="nav-column nav-child-column">    <!-- Sub-navigation -->
  </div>
  <div class="nav-actions-container">            <!-- Bottom actions -->
</mat-sidenav>
```

### Settings/Form Component Structure
```html
<!-- Settings container -->
<div class="settings-container theme-content">
  <!-- Action header -->
  <div class="settings-header">
    <div class="settings-title-section">    <!-- Title + context -->
    <div class="settings-actions">          <!-- Action buttons -->
  </div>
  
  <!-- Form cards -->
  <div class="settings-card theme-card">
    <div class="settings-card-header">      <!-- Card title with icon -->
    <div class="settings-card-body">
      <form class="settings-form">          <!-- Form elements -->
        <div class="settings-form-group">   <!-- Field groups -->
</div>
```

## 🎯 **Component Standards**

### Interactive Elements
- **Action Buttons**: 40px standard, 44px for primary actions, 36px for compact
- **Touch Targets**: Minimum 44px for accessibility
- **Icon Buttons**: Use `mat-icon-button` with consistent sizing
- **Form Controls**: Standard Material Design inputs with theme integration

### Card Pattern
```scss
.component-card {
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  margin-bottom: 1.5rem;
}
```

### Navigation Items
```scss
.nav-item {
  padding: 0.75rem;           // Touch-friendly
  border-radius: 8px;         // Consistent rounding
  transition: all 0.2s ease;  // Smooth interactions
  
  &:hover {
    background-color: var(--nav-item-hover);
  }
  
  &.active {
    background-color: var(--nav-item-active);
    color: var(--nav-item-active-text);
  }
}
```

## � **CSS Architecture & Variables**

### Theme Variable System

All components use CSS custom properties for consistent theming:

```scss
/* Core theme variables */
--content-bg: Background for main content areas
--card-bg: Card and panel backgrounds
--card-border: Border colors for cards
--card-shadow: Standard shadow for elevated elements

/* Text hierarchy */
--text-primary: Main headings and important text
--text-secondary: Body text and descriptions
--text-muted: Helper text and labels

/* Interactive elements */
--nav-item-hover: Hover state for navigation items
--nav-item-active: Active/selected state background
--nav-item-active-text: Text color for active states
--purple-primary: Brand primary color
--purple-light: Accent and icon colors

/* Form elements */
--input-bg: Form input backgrounds
--input-border: Input border colors
--border: General border color
```

### Component CSS Patterns

**Container Structure:**
```scss
.component-container {
  padding: 1rem;                    // Mobile base
  background-color: var(--content-bg);
  
  @media (min-width: 768px) {
    padding: 1.5rem;               // Desktop increase
  }
}
```

**Interactive Button Pattern:**
```scss
.action-btn {
  width: 40px; height: 40px;       // Standard touch target
  border-radius: 8px;              // Consistent rounding
  background-color: var(--nav-item-hover);
  transition: all 0.2s ease;       // Smooth interactions
  
  &:hover {
    background-color: var(--nav-item-active);
    transform: translateY(-1px);   // Subtle lift effect
  }
}
```

**Form Element Pattern:**
```scss
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;                     // Label to input spacing
  margin-bottom: 1rem;             // Between form groups
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;                     // Icon to text spacing
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.form-input {
  padding: 0.75rem 1rem;          // Touch-friendly padding
  border: 1px solid var(--input-border);
  border-radius: 8px;
  background-color: var(--input-bg);
  
  &:focus {
    border-color: var(--purple-primary);
    box-shadow: 0 0 0 3px var(--purple-light);
  }
}
```

## 📱 **Responsive Breakpoints**

### Mobile-First Approach

```scss
/* Base styles (360px+) */
.component { padding: 1rem; }

/* Small tablets (768px+) */
@media (min-width: 768px) {
  .component { padding: 1.5rem; }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .component { padding: 2rem; }
}
```

### Component Behavior by Screen Size

**Mobile (360px+):**

- Single column layouts
- Touch-friendly button sizes (44px minimum)  
- Simplified navigation patterns
- Readable font sizes (16px+ for body text)
- Compact spacing (1rem base padding)

**Tablet (768px+):**

- Two-column layouts where appropriate
- Expanded navigation options
- Side panels for secondary content
- Increased padding (1.5rem)

**Desktop (1024px+):**

- Multi-column layouts
- Enhanced interaction patterns
- Sidebar navigation
- Hover states and tooltips
- Maximum padding (2rem)

## 🎨 **Color System**

### Primary Palette
```scss
$primary-color: #007bff;           // Primary actions, links
$secondary-color: #6c757d;         // Secondary text, borders
$background-color: #b4b4b4;        // Page backgrounds
$header-main-color: #7d4fbf;       // Brand primary
$header-secondary-color: #a18ac1;  // Brand secondary
$header-text-color: white;         // Header text
```

### Semantic Colors
```scss
$success-color: #27ae60;    // Complete actions, success states
$warning-color: yellow;     // Warning states, parent tasks
$danger-color: #c0392b;     // Delete actions, error states
$info-color: #2980b9;       // Refresh actions, info states
$neutral-color: grey;       // Disabled states, placeholders
```

### Usage Guidelines
- **Green**: Task completion, success feedback
- **Red**: Task deletion, error states
- **Yellow**: Warning states, incomplete parent tasks
- **Blue**: Navigation, refresh actions
- **Purple**: Brand elements, headers
- **Gray**: Disabled states, secondary information

## 🧩 **Component Patterns**

### Card Pattern
- Clean borders with subtle shadows
- Consistent padding (16px)
- Left accent bars for categorization
- Hover states for interactivity

### List Pattern
- Clear item separation
- Consistent spacing between items
- Visual indicators for states (viewed, updated)
- Touch-friendly interaction areas

### Form Pattern
- Material Design inputs
- Clear validation feedback
- Logical tab order
- Accessible labels and hints

## 🚀 **Performance Considerations**

### Loading States
- Skeleton screens for content loading
- Progressive enhancement
- Lazy loading for heavy components

### Animations
- Smooth transitions (200-300ms)
- Meaningful motion (page transitions)
- Respect user preferences (reduced motion)

## 📏 **Spacing System**

### Base Unit: 8px (0.5rem)
- **xs**: 4px (0.25rem) - Tight spacing, icon gaps
- **sm**: 8px (0.5rem) - Button spacing, small gaps
- **md**: 16px (1rem) - Form field spacing, card padding
- **lg**: 24px (1.5rem) - Section gaps, large spacing
- **xl**: 32px (2rem) - Page padding, major sections
- **xxl**: 48px (3rem) - Large separations

### Component Spacing Guidelines
- **Container padding**: 1rem mobile, 1.5rem desktop
- **Card padding**: 1rem (consistent with navigation)
- **Section gaps**: 1.5rem between major sections
- **Form element spacing**: 1rem between fields
- **Button spacing**: 0.5rem between related buttons
- **Navigation padding**: 0.75rem (12px) for toolbar areas

### Button Sizing (Touch-Friendly)
- **Small buttons**: 36px height (navigation actions)
- **Standard buttons**: 40px height (main actions)
- **Large buttons**: 44px height (primary CTAs)
- **Minimum touch target**: 44px as per accessibility guidelines

### Typography Spacing
- **Line height**: 1.4-1.6 for readability
- **Paragraph spacing**: 1rem between paragraphs
- **Heading margins**: 1.5rem top, 0.5rem bottom

## 🔧 **Implementation Guidelines**

### SCSS Structure
```
src/styles/
├── _colors.scss      // Color variables and semantic classes
├── _buttons.scss     // Button styles and variants
├── _inputs.scss      // Form input styles
├── _layout.scss      // Layout utilities and containers
├── _animations.scss  // Transition and animation classes
├── _globals.scss     // Global styles and resets
├── _tasks.scss       // Task-specific component styles
└── theme.scss        // Main theme compilation
```

### Component Organization
- Each component has its own SCSS file
- Use CSS custom properties for dynamic values
- Leverage Angular Material's theming system
- Follow BEM naming conventions where appropriate

This guide should be referenced when creating new components or modifying existing ones to ensure consistency across the application.
