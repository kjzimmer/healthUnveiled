# Site Design — Health Unveiled
*CSS approach, design system, component conventions.*
*Stub — full content written when React client build begins (Phase 5).*

---

## Design Reference

The approved teaser design lives at `public/index.html`. This file is the pixel-perfect spec that the React teaser page component must replicate exactly before it is removed. The CSS variables and typography defined in its `<style>` block are the source of truth for the site's visual design until a formal design system is documented here.

---

## CSS Approach

**Undecided.** Chosen and documented here at the start of Phase 5 (React client build). Options under consideration: Tailwind CSS, CSS Modules, plain CSS custom properties. Decision documented in `docs/TECH_STACK.md` when made.

---

## Typography

*From `public/index.html` — to be formalized when the React design system is built.*

- Serif: EB Garamond (Google Fonts — `ital,wght@0,400;0,500;1,400`)
- Sans: Inter (Google Fonts — `wght@300;400;500`)
- Base font size: 18px

## Color Palette

*From the teaser CSS variables — canonical reference until design system is formalized.*

| Token | Value | Use |
|-------|-------|-----|
| `--ink` | `#1a1917` | Primary text, dark backgrounds |
| `--ink-mid` | `#1f1d1b` | Body paragraphs |
| `--ink-light` | `#6b6764` | Secondary text, labels |
| `--paper` | `#eeeae0` | Page background |
| `--paper-warm` | `#ede9e0` | Warm background variant |
| `--accent` | `#3a2a1a` | Primary accent (buttons, links) |
| `--accent-warm` | `#7a4a20` | Warm accent (hover states, borders) |
| `--accent-light` | `#f2ebe0` | Light accent (callout backgrounds) |
| `--rule` | `rgba(26,25,23,0.12)` | Divider lines, borders |
