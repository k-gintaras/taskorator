# Taskorator Theme Guide (Aligned with DSC)

This guide explains how to use the Design System Contract (DSC) in day‑to‑day code.

Key rules:

- Tokens only (CSS variables). No raw hex/rgb/hsl in components.
- Start with theme-* shells; add Tailwind utilities as needed.
- DaisyUI is bound to tokens (theme: taskorator) for consistent components.

## Tokens Overview

See `src/styles/theme.scss` for the full token list and variants. Core tokens include:

- Backgrounds: `--bg-primary`, `--bg-surface`, `--card-bg`, `--card-border`, `--card-shadow`
- Text: `--text-primary`, `--text-secondary`, `--text-muted`
- Brand: `--purple-primary`, `--purple-hover`, `--purple-light`
- Inputs: `--input-bg`, `--input-border`, `--input-focus`
- Nav: `--nav-item-hover`, `--nav-item-active`, `--nav-item-active-text`

## Theme Shells

```css
.theme-content { background: var(--bg-primary); color: var(--text-secondary); }
.theme-card    { background: var(--card-bg); border:1px solid var(--card-border); box-shadow: var(--card-shadow); border-radius:12px; }
.theme-text-primary   { color: var(--text-primary); }
.theme-text-secondary { color: var(--text-secondary); }
.theme-text-muted     { color: var(--text-muted); }
.theme-btn-primary { background: var(--purple-primary); color:#fff; border-radius:10px; padding:.625rem 1rem; }
.theme-btn-primary:hover { background: var(--purple-hover); }
.theme-btn-secondary{ background: var(--nav-item-hover); color: var(--text-secondary); border-radius:10px; padding:.625rem 1rem; }
.theme-nav-item:hover { background: var(--nav-item-hover); }
```

## DaisyUI Binding

DaisyUI is configured in `tailwind.config.js` with the custom `taskorator` theme mapping to tokens. Use DaisyUI components inside theme shells.

Example:

```html
<div class="theme-card p-4">
  <button class="btn">Daisy Button</button>
</div>
```

## Canonical Patterns

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

## Do / Don't

Do

- Wrap pages in `theme-content`; use `theme-card` for elevated panels.
- Use only CSS variables for colors/borders/shadows.
- Prefer DaisyUI components inside theme shells for consistent affordances.

Don't

- Add new visual classes not starting with `theme-`.
- Hard-code hex/rgb/hsl colors.
- Mix multiple unrelated button patterns.

## Migration Notes

- Replace `action-btn`, `login-btn-*`, `welcome-btn-*` with `theme-btn-*`.
- Remove hardcoded colors; switch to tokens.
- If a needed token is missing, add it to `theme.scss` and map in `tailwind.config.js`.
