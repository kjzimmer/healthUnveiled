# Site Design — Health Unveiled
*CSS approach, design system, component conventions.*

---

## Design Reference

The original static teaser is archived at `docs/archive/health-unveiled-teaser.html`. The live teaser (`client/src/teaser/TeaserApp.tsx`) is a pixel-perfect React port of that reference. The CSS variables and typography defined in `client/src/teaser/teaser.css` are the canonical source of truth for the site's design tokens.

---

## CSS Approach

**Plain CSS with CSS custom properties.** No external framework (no Tailwind, no CSS Modules, no styled-components).

Two stylesheets:

| File | Scope | Notes |
|------|-------|-------|
| `client/src/teaser/teaser.css` | Teaser landing page | Canonical token source; EB Garamond + Inter |
| `client/src/admin.css` | Admin SPA | Same token palette; sans-serif only; no Garamond |

---

## Typography

| Role | Font | Source |
|------|------|--------|
| Serif body (teaser only) | EB Garamond | Google Fonts — `ital,wght@0,400;0,500;1,400` |
| Sans-serif UI | Inter | Google Fonts — `wght@300;400;500` |

Base font size: 18px (teaser) / 14px (admin).

---

## Color Palette

Design tokens defined in `client/src/teaser/teaser.css` `:root`. Admin imports the same values.

| Token | Value | Use |
|-------|-------|-----|
| `--ink` | `#1a1917` | Primary text, dark backgrounds |
| `--ink-mid` | `#1f1d1b` / `#3a3835` | Body paragraphs (teaser / admin) |
| `--ink-light` | `#6b6764` | Secondary text, labels |
| `--paper` | `#eeeae0` | Page background (teaser) |
| `--paper-warm` | `#ede9e0` | Warm background variant |
| `--accent` | `#3a2a1a` | Primary accent — buttons, nav active |
| `--accent-warm` | `#7a4a20` | Warm accent — hover states, borders, unread dots |
| `--accent-light` | `#f2ebe0` | Light accent — callout backgrounds, selected rows |
| `--rule` | `rgba(26,25,23,0.12)` | Divider lines, borders |

Admin-only tokens:

| Token | Value | Use |
|-------|-------|-----|
| `--sidebar-bg` | `#1a1917` | Sidebar background |
| `--sidebar-w` | `220px` | Sidebar width (spec: 240px; implemented: 220px) |
| `--content-bg` | `#f5f3ee` | Main content area background |
| `--card-bg` | `#ffffff` | Card/panel background |
| `--border` | `rgba(26,25,23,0.1)` | Card borders |
| `--radius` | `4px` | Border radius |

---

## Admin Layout

Per `shared/SHARED_ADMIN_MODULES.md` §6. Two-column shell: fixed left nav + scrollable main content.

```
.admin-shell  (display: flex; height: 100%)
├── .sidebar  (220px fixed; flex-direction: column)
│   ├── .sidebar-brand  → links to public site (new tab)
│   ├── .sidebar-nav    → nav links
│   └── .sidebar-footer → Sign out button
└── .main-content  (flex: 1; overflow-y: auto)
    └── page content
```

**Nav order (standard module order per spec):** Dashboard → People → Inbox

**Page structure:** page title top-left, action buttons top-right, content below. No mock data — empty states use `.empty-state` messaging.

---

## Component Conventions

### Stat Cards (`.stat-card`)

Used on the Dashboard (analytics). Solid border, white background. Label (uppercase, small) → value (large, bold) → source/meta line.

### Pro Notice Cards (`.pro-card`)

Same size as stat cards, dashed border. Used for RUM metrics that require Cloudflare Pro. Always shown alongside stat cards in the same grid — never hidden.

### Person Cards (`.person-card`)

In the People list panel. Click to load detail. Shows email, optional name, badges (Subscriber, Admin, message count). Selected state uses `--accent-light` background.

### Inbox Items (`.inbox-item`)

Expandable. Unread: orange dot + bold sender name. Expanding auto-marks-read. Body shown below header with left indent.

### Badges (`.badge`)

Three variants: `.badge-subscriber` (green), `.badge-admin` (teal), `.badge-contact` (amber).

---

## Teaser Page Structure

```
<header class="masthead">   ← sticky; dark background; site name + ecosystem links
<section class="hero">      ← title + thesis quote (bordered left)
<main class="content">
  <section class="section"> ← The Argument
  <section class="section"> ← What This Site Explores
  <section class="section"> ← Part of a Larger Project
  <section class="follow-section"> ← email capture form
<footer class="footer">     ← brand + ecosystem links
```
