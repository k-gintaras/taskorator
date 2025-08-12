# Taskorator Design System Contract (DSC)

Short version: Single source of truth + theme-* shells. Use CSS variables only. Utilities are fine inside shells. DaisyUI is bound to tokens. No ad‑hoc classes, no raw hex.

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

Notes:

- Prefer tokens present in `src/styles/theme.scss`; add any missing there.
- Project may run light/dark variants by data-theme overrides.

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

## 3) DaisyUI bound to tokens

Tailwind config binds DaisyUI to CSS variables and safelists theme shells. See `tailwind.config.js`.

- Theme name: taskorator
- Use DaisyUI components only inside theme shells for consistent visuals.

## 4) Bans and naming

- Ban raw hex/rgb/hsl in component templates/SCSS. Use var(--*).
- Ban new non-theme-* appearance classes. Layout-only classes allowed (e.g., .form-grid, .stack, .cluster).
- Deprecate action-btn, login-btn-*, welcome-btn-* in favor of theme-btn-*.

## 5) Canonical patterns (copy/paste)

Buttons

```html
<button class="theme-btn-primary">Confirm</button>
<button class="theme-btn-secondary">Cancel</button>
```

Cards

```html
<div class="theme-card p-4">
  <h3 class="theme-text-primary text-lg">Title</h3>
  <p class="theme-text-secondary">Body</p>
</div>
```

Tabs / Nav

```html
<button class="tab theme-nav-item" [class.tab-active]="active">General</button>
<style>
.tab-active{ background:var(--nav-item-active); color:var(--nav-item-active-text); font-weight:700; }
</style>
```

Inputs

```html
<label class="theme-text-muted text-sm">Title</label>
<input class="w-full rounded-md" style="background:var(--input-bg);border:1px solid var(--input-border);color:var(--text-primary);padding:.6rem .8rem;outline:none;box-shadow:none" />
```

## 6) Layout skeletons

- Always wrap pages with theme-content; principal panels are theme-card.
- Two/Three section rule for Login/Welcome/Settings.

## 7) Tooling guardrails

Add lint rules to prevent drift:

Stylelint quick start (.stylelintrc.json)

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

ESLint template rule (extend your root ESLint):

- Forbid inline style color with hex.
- Forbid classes not matching ^theme- or whitelisted layout names.

## 8) Deprecated

- Legacy Button Pattern (Avoid) and classes action-btn, login-btn-*, welcome-btn-*.
- Mixed Tailwind + bespoke palette classes; prefer tokens + theme-shells.

## 9) Migration checklist

- Replace bespoke classes with theme-* equivalents.
- Remove hardcoded hex; switch to CSS vars.
- Ensure DaisyUI components sit inside theme shells.
- Add any missing tokens to theme.scss and bind in tailwind.config.js.
