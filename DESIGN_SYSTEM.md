# Taskorator Design System Guide

## 🎨 **Design Philosophy**

### Core Principles
- **Flat Design**: Minimal depth, clean lines, no unnecessary shadows or gradients
- **Mobile-First**: Optimized for 360px width screens, scales up gracefully
- **Accessible**: High contrast ratios, clear visual hierarchy
- **Efficient**: Fast interactions, minimal cognitive load
- **Consistent**: Standardized spacing, colors, and patterns

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
    └── Admin/Settings pages
```

### Navigation Pattern
- **Horizontal Navigation**: Fixed top bar with brand, user actions, logout
- **Content Area**: Full-width below navigation
- **Mobile Navigation**: Collapsible/responsive design

## 🎯 **Component Design Standards**

### Task Components
- **Task Cards**: Bordered containers with left accent colors based on creation date
- **Task Mini**: Compact representation for lists
- **Task Navigator**: Master-detail view with left/right sections
- **Progress Indicators**: Bottom border progress bars with transparency

### Interactive Elements
- **Buttons**: Material Design raised/flat buttons
- **Icons**: Material Icons with semantic colors
- **Forms**: Material inputs with proper validation states
- **Navigation**: Clear visual hierarchy and breadcrumbs

## 📱 **Responsive Design**

### Mobile-First (360px+)
- Single column layouts
- Touch-friendly button sizes (44px minimum)
- Simplified navigation patterns
- Readable font sizes (16px+ for body text)

### Tablet (768px+)
- Two-column layouts where appropriate
- Expanded navigation options
- Side panels for secondary content

### Desktop (1024px+)
- Multi-column layouts
- Enhanced interaction patterns
- Sidebar navigation
- Hover states and tooltips

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

### Base Unit: 8px
- **xs**: 4px (0.5 unit)
- **sm**: 8px (1 unit)
- **md**: 16px (2 units)
- **lg**: 24px (3 units)
- **xl**: 32px (4 units)
- **xxl**: 48px (6 units)

### Component Spacing
- **Card padding**: 16px (md)
- **Section gaps**: 24px (lg)
- **Button spacing**: 8px (sm)
- **Form field spacing**: 16px (md)

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
