# Taskorator Design System Contract (DSC)

**🎯 TL;DR:** Theme shells + Tailwind utilities + CSS variables only. No custom SCSS classes. No hex colors.

**⚡ Quick Start:** Copy existing component patterns. Use `theme-content`, `theme-card`, `theme-btn-primary`. Add Tailwind utilities. Never create new CSS classes.

---

## ⚠️ CRITICAL: The Workflow That Prevents 300+ Line SCSS Files

### ✅ DO: The Right Way (5-10 lines of SCSS max)

1. **Start with theme shells**: `theme-content`, `theme-card`, `theme-btn-primary`
2. **Add Tailwind utilities**: `flex`, `items-center`, `gap-3`, `p-6`, `rounded-lg`
3. **Use CSS variables for theming**: `style="color: var(--purple-primary);"`
4. **Only add SCSS for impossible-to-do-with-Tailwind stuff**: focus states, complex pseudo-elements

```html
<!-- ✅ PERFECT: Theme shell + Tailwind + CSS vars -->
<div class="theme-content p-6 min-h-screen">
  <div class="theme-card p-6 mb-6">
    <h2 class="theme-text-primary text-lg font-medium flex items-center gap-2">
      <mat-icon style="color: var(--purple-primary);">edit_note</mat-icon>
      Task Input
    </h2>
    
    <textarea 
      class="w-full p-3 rounded-lg border"
      style="background: var(--input-bg); border-color: var(--input-border);"
      placeholder="Enter tasks..."
    ></textarea>
    
    <button class="theme-btn-primary flex items-center gap-2 px-4 py-2">
      <mat-icon>save</mat-icon>
      Save
    </button>
  </div>
</div>
```

```scss
/* ✅ PERFECT: Minimal SCSS (5-10 lines max) */
textarea:focus {
  outline: none;
  border-color: var(--purple-primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}
```

### ❌ DON'T: The Wrong Way (300+ lines of SCSS hell)

```scss
/* ❌ WRONG: Custom classes for everything */
.my-container {
  padding: 1rem;
  background-color: var(--content-bg);
  /* 50 more lines... */
}

.my-card {
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  /* 100 more lines... */
}

.my-button {
  background-color: var(--purple-primary);
  /* 150 more lines... */
}
```

```html
<!-- ❌ WRONG: Custom classes everywhere -->
<div class="my-container">
  <div class="my-card">
    <h2 class="my-title">Task Input</h2>
    <textarea class="my-textarea"></textarea>
    <button class="my-button">Save</button>
  </div>
</div>
```

---

## 🏗️ Component Creation Checklist

When creating ANY new component, follow this exact order:

1. **✅ Copy existing pattern** from settings/artificer components
2. **✅ Check parent-child hierarchy**: Parent = H1, Child Main = H2, Child Sections = H3+
3. **✅ Use theme shells**: `theme-content`, `theme-card`, `theme-text-*`, `theme-btn-*`
4. **✅ Add Tailwind for layout**: `flex`, `grid`, `gap-*`, `p-*`, `rounded-*`, `space-y-*`
5. **✅ Use CSS variables for colors**: `style="color: var(--purple-primary);"`
6. **✅ Only custom SCSS for complex interactions** (focus, hover, pseudo-elements)

**🚨 STOP!** If you're writing more than 10 lines of SCSS, you're doing it wrong!

---

## 1) Tokens: the only colors

Define and use these CSS variables. Never hard‑code hex/rgb in components or SCSS.

```css
:root {
  --bg-primary: #0f0f14; --bg-surface: #171822; --card-bg: var(--bg-surface);
  --card-border: rgba(255,255,255,.08); --card-shadow: 0 6px 24px rgba(0,0,0,.25);
  --text-primary: #fff; --text-secondary: #c9c9d1; --text-muted: #8a8a93;
  --purple-primary: #8b5cf6; --purple-hover: #7c3aed; --purple-light: #a78bfa;
  --nav-item-hover: rgba(255,255,255,.05);
  --nav-item-active: rgba(139,92,246,.18); --nav-item-active-text: #fff;
  --input-bg: #13141b; --input-border: #2a2b35; --input-focus: #a78bfa;
  --border: #2a2b35;
}
```

**📍 Source of truth:** `src/styles/theme.scss`

## 2) Theme shells first

Always wrap UI with theme-* classes, then add Tailwind utilities if needed.

```css
.theme-content { background: var(--bg-primary); color: var(--text-secondary); }
.theme-card    { background: var(--card-bg); border:1px solid var(--card-border); box-shadow: var(--card-shadow); border-radius:12px; }
.theme-text-primary   { color: var(--text-primary); }
.theme-text-secondary { color: var(--text-secondary); }
.theme-text-muted     { color: var(--text-muted); }
.theme-btn-primary { background: var(--purple-primary); color:#fff; border-radius:10px; padding:.625rem 1rem; }
.theme-btn-primary:hover { background: var(--purple-hover); }
.theme-btn-secondary{ background: var(--nav-item-hover); color: var(--text-secondary); border-radius:10px; padding:.625rem 1rem; }
.theme-nav-item { background: transparent; }
.theme-nav-item:hover { background: var(--nav-item-hover); }
```

## 3) Real Component Examples (Copy These Patterns!)

### Settings-Style Toggle (Perfect Pattern)

```html
<label class="flex items-center gap-4 p-3 rounded-lg cursor-pointer hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-5 transition-colors">
  <input type="checkbox" [(ngModel)]="isEnabled" class="sr-only" />
  <div class="relative w-11 h-6 rounded-full transition-colors" 
       [style.background-color]="isEnabled ? 'var(--purple-primary)' : 'var(--bg-elevated)'"
       [style.border]="'1px solid ' + (isEnabled ? 'var(--purple-primary)' : 'var(--border)')">
    <div class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-200"
         [style.background-color]="isEnabled ? 'white' : 'var(--text-primary)'"
         [style.transform]="isEnabled ? 'translateX(20px)' : 'translateX(0)'">
    </div>
  </div>
  <div class="flex items-center gap-3 flex-1">
    <mat-icon class="text-lg" style="color: var(--purple-light);">settings</mat-icon>
    <span class="theme-text-secondary">Setting Name</span>
  </div>
</label>
```

### Action Buttons (Icon + Text)

```html
<!-- Primary Action -->
<button class="theme-btn-primary flex items-center gap-2 px-6 py-3">
  <mat-icon>save</mat-icon>
  Save Changes
</button>

<!-- Icon-only Actions (Settings pattern) -->
<button class="theme-nav-item w-10 h-10 rounded-lg flex items-center justify-center">
  <mat-icon>edit</mat-icon>
</button>
```

### Stats Grid

```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div class="p-4 rounded-lg text-center" style="background: var(--bg-elevated); border: 1px solid var(--border);">
    <div class="theme-text-muted text-xs font-semibold uppercase tracking-wide mb-1">Total</div>
    <div class="theme-text-primary text-lg font-semibold">{{ count }}</div>
  </div>
</div>
```

### Form Inputs

```html
<div>
  <label class="theme-text-secondary text-sm font-medium flex items-center gap-2 mb-2">
    <mat-icon class="text-sm" style="color: var(--purple-light);">description</mat-icon>
    Field Label
  </label>
  <textarea 
    class="w-full p-3 rounded-lg border text-sm leading-relaxed"
    style="background: var(--input-bg); border-color: var(--input-border); color: var(--text-primary);"
    placeholder="Enter text..."
  ></textarea>
</div>
```

---

## 4) Header Hierarchy (Critical for Layout!)

**🚨 HEADER ALIGNMENT ISSUE SOLVED!**

### Parent-Child Header Rules

```html
<!-- ✅ PARENT Component (crucible.component.html) -->
<div class="theme-content p-4 md:p-6">
  <div class="mb-6">
    <div class="flex items-center gap-3 mb-3">
      <mat-icon style="font-size: 2rem; width: 2rem; height: 2rem; display: flex; align-items: center;">{{ data.icon }}</mat-icon>
      <h1 class="text-2xl font-bold theme-text-primary">{{ data.title }}</h1>
    </div>
    <p class="theme-text-secondary">{{ data.description }}</p>
  </div>
  <router-outlet></router-outlet>
</div>
```

```html
<!-- ✅ CHILD Component (input-to-tasks.component.html) -->
<div class="theme-content p-4 md:p-6 min-h-screen">
  <div class="theme-card p-6 mb-6">
    <div class="mb-4">
      <h2 class="card-title theme-text-primary flex items-center gap-2 mb-2">
        <mat-icon>add_task</mat-icon>
        Mass Add Tasks
      </h2>
      <p class="text-sm theme-text-secondary mb-4">Description text</p>
    </div>
    <!-- content sections use h3 -->
  </div>
</div>
```

### DO vs DON'T

```html
<!-- ❌ WRONG: Child creates competing H1 -->
<div class="theme-content p-4 md:p-6 min-h-screen">
  <div class="flex items-center gap-3 mb-6 pb-4 border-b">
    <mat-icon class="text-3xl">add_task</mat-icon>
    <h1 class="text-2xl font-semibold">Mass Add Tasks</h1>  <!-- ← CREATES MISALIGNMENT! -->
  </div>
</div>
```

```html
<!-- ✅ RIGHT: Child uses H2 for main section, H3 for subsections -->
<div class="theme-content p-4 md:p-6 min-h-screen">
  <div class="theme-card p-6 mb-6">
    <h2 class="card-title theme-text-primary flex items-center gap-2 mb-2">
      <mat-icon>add_task</mat-icon>
      Mass Add Tasks
    </h2>
    <div class="flex items-center gap-2 mb-4">
      <mat-icon>tune</mat-icon>
      <h3 class="theme-text-primary text-lg font-medium">Options</h3>  <!-- ← Subsection -->
    </div>
  </div>
</div>
```

**🎯 Rule**: Parent = H1, Child Main = H2, Child Sections = H3+

---

## 5) Absolute Bans (To Prevent SCSS Hell)

- ❌ **NO** raw hex/rgb/hsl in templates/SCSS: `color: #8b5cf6` ← WRONG
- ❌ **NO** custom CSS classes for appearance: `.my-button`, `.my-card` ← WRONG  
- ❌ **NO** recreating existing theme shells: `.custom-primary-btn` ← WRONG
- ❌ **NO** more than 10 lines of SCSS per component
- ✅ **YES** CSS variables only: `style="color: var(--purple-primary);"` ← RIGHT
- ✅ **YES** theme shells + Tailwind: `class="theme-btn-primary flex items-center"` ← RIGHT

## 6) When You Need Custom SCSS (Rare!)

Only write custom SCSS for things Tailwind literally cannot do:

```scss
/* ✅ GOOD: Complex focus states */
textarea:focus {
  outline: none;
  border-color: var(--purple-primary);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

/* ✅ GOOD: Complex pseudo-elements */
.toggle::before {
  content: '';
  position: absolute;
  /* ... positioning that changes dynamically ... */
}
```

```scss
/* ❌ BAD: Things Tailwind can do */
.my-container {
  display: flex;        /* ← use `flex` */
  gap: 1rem;           /* ← use `gap-4` */
  padding: 1.5rem;     /* ← use `p-6` */
  border-radius: 8px;  /* ← use `rounded-lg` */
}
```

## 7) Quick Reference: Most Used Patterns

### Page Layout

```html
<div class="theme-content p-4 md:p-6 min-h-screen">
  <!-- content here -->
</div>
```

### Card with Header

```html
<div class="theme-card p-6 mb-6">
  <div class="flex items-center gap-2 mb-4">
    <mat-icon style="color: var(--purple-primary);">settings</mat-icon>
    <h2 class="theme-text-primary text-lg font-medium">Section Title</h2>
  </div>
  <!-- content -->
</div>
```

### Icon Button (Most Common)

```html
<button class="theme-nav-item w-10 h-10 rounded-lg flex items-center justify-center">
  <mat-icon>edit</mat-icon>
</button>
```

### Typography Hierarchy

```html
<h1 class="theme-text-primary text-2xl font-semibold">Main Title</h1>
<h2 class="theme-text-primary text-lg font-medium">Section Title</h2>
<p class="theme-text-secondary">Body text</p>
<span class="theme-text-muted text-sm">Helper text</span>
```

---

## Migration Checklist (How We Should Have Done It)

✅ **Step 1:** Look at existing similar component (settings, artificer)  
✅ **Step 2:** Copy the HTML structure and classes  
✅ **Step 3:** Replace content but keep the theme shells  
✅ **Step 4:** Add/remove Tailwind utilities as needed  
✅ **Step 5:** Use CSS variables for any custom colors  
✅ **Step 6:** Write <10 lines of SCSS only if absolutely needed  

❌ **What we did wrong:** Started writing custom SCSS classes instead of copying existing patterns!

## Tooling Guardrails

### Stylelint Rules (.stylelintrc.json)

```json
{
  "rules": {
    "color-named": "never",
    "color-no-hex": true,
    "declaration-property-value-disallowed-list": {
      "color": ["/^((?!var\\().)*$/"],
      "/.*background.*/": ["/^((?!var\\().)*$/"]
    }
  }
}
```

### SCSS File Size Limit

If your component SCSS file is >20 lines, you're probably doing it wrong. The input-to-tasks component should have been ~5 lines, not 340+!
