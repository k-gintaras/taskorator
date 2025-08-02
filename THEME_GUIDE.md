# Taskorator Theme System

## Productivity Twilight Theme

The theme system provides a cohesive design language that balances productivity with visual comfort. The default "twilight" theme offers a perfect middle ground between dark and light modes.

## Theme Structure

### CSS Variables Available

#### Background Layers
- `--bg-primary`: Main app background
- `--bg-secondary`: Sidebar, secondary panels
- `--bg-surface`: Cards, elevated content
- `--bg-elevated`: Hover states, active elements

#### Purple Brand System
- `--purple-primary`: Main brand color (#8b5cf6)
- `--purple-hover`: Hover states (#7c3aed)
- `--purple-light`: Subtle accents (#a78bfa)
- `--purple-muted`: Disabled states (#6d28d9)

#### Text Hierarchy
- `--text-primary`: Main headings, important text
- `--text-secondary`: Body text, descriptions
- `--text-muted`: Helper text, placeholders
- `--text-accent`: Purple accent text

#### Component Variables
- `--card-bg`, `--card-border`, `--card-shadow`
- `--btn-primary-bg`, `--btn-secondary-bg`
- `--input-bg`, `--input-border`, `--input-focus`
- `--nav-item-hover`, `--nav-item-active`

## Usage Examples

### Using CSS Variables
```scss
.my-component {
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  color: var(--text-primary);
}
```

### Using Theme Classes
```html
<div class="theme-card">
  <h2 class="theme-text-primary">Title</h2>
  <p class="theme-text-secondary">Description</p>
  <button class="theme-btn-primary">Action</button>
</div>
```

### App Layout Classes
```html
<div class="theme-app">
  <header class="theme-topbar">Top Navigation</header>
  <aside class="theme-sidebar">Side Menu</aside>
  <main class="theme-content">Main Content</main>
</div>
```

## Theme Service

### Switching Themes
```typescript
import { ThemeService } from './services/core/theme.service';

constructor(private themeService: ThemeService) {}

// Set specific theme
this.themeService.setTheme('light');
this.themeService.setTheme('dark');
this.themeService.setTheme('twilight');

// Toggle through themes
this.themeService.toggleTheme();

// Check current theme
const current = this.themeService.getCurrentTheme();
const isDark = this.themeService.isDarkMode();
```

### Available Themes
1. **Twilight (Default)**: Productivity-focused, warm dark theme
2. **Light**: Clean, bright theme for daylight use
3. **Dark**: Deep dark theme for night work

## Component Styling Guidelines

### Cards
```scss
.my-card {
  @extend .theme-card;
  
  &:hover {
    background-color: var(--card-hover-bg);
  }
}
```

### Buttons
```scss
// Primary action button
.action-btn {
  @extend .theme-btn-primary;
}

// Secondary button
.secondary-btn {
  @extend .theme-btn-secondary;
}
```

### Navigation Items
```scss
.nav-item {
  @extend .theme-nav-item;
  
  &.active {
    background-color: var(--nav-item-active);
    color: var(--nav-item-active-text);
  }
}
```

## Color Semantic Meanings

- **Purple**: Brand, primary actions, focus states
- **Success Green**: Completed tasks, positive feedback
- **Warning Amber**: Pending tasks, caution states
- **Error Red**: Failed actions, critical warnings
- **Info Blue**: Informational content, links

## Design Principles

1. **Consistent Elevation**: Use defined shadow levels
2. **Purposeful Color**: Purple for brand/actions, semantics for status
3. **Clear Hierarchy**: Primary, secondary, muted text levels
4. **Accessible Contrast**: All text meets WCAG guidelines
5. **Cohesive Spacing**: Use the elevation system for layering

## Future Enhancements

- System theme detection (auto dark/light)
- Custom theme creation
- Theme-specific animations
- High contrast accessibility mode
