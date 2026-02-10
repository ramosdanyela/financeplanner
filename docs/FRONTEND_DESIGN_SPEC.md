# Frontend Design Specification: Finance Planner / FinTrack

A single source of truth for UI style. Use this when building or refactoring frontend components.

---

## 1. Color System

### Backgrounds

| Token                   | Value                                   | Usage                                                                                                 |
| ----------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `--color-bg-main`       | `#1A1A1A`                               | Main app background                                                                                   |
| `--color-bg-sidebar`    | `#212121`                               | Sidebar background (slightly lighter than main)                                                       |
| `--color-bg-card`       | `#2C2C34` (or `#282828`)                | Cards, panels, transaction items, goal cards, user profile. Dark charcoal, optional faint purple tint |
| `--color-bg-nav-active` | `#3F3F4D` (or solid red `#FF4D4D`)      | Active nav item background                                                                            |
| `--color-bg-nav-hover`  | Slightly lighter than `--color-bg-card` | Nav item hover                                                                                        |

### Text

| Token                    | Value                         | Usage                                    |
| ------------------------ | ----------------------------- | ---------------------------------------- |
| `--color-text-primary`   | `#FFFFFF` / `#E0E0E0`         | Headings, main labels, important content |
| `--color-text-secondary` | `#A0A0A0` / `#E0E0E0` (muted) | Descriptions, dates, subtle hints        |
| `--color-text-link`      | `#BB86FC` (purple)            | Action links: "Ver todas", "+ Nova meta" |
| `--color-text-income`    | `#4CAF50` / `#2ECC71`         | Positive amounts (receitas, deposits)    |
| `--color-text-outcome`   | `#FF5252` / `#FF4D4D`         | Negative amounts (despesas, withdrawals) |

### Accents (branding & CTAs)

| Token                    | Value                             | Usage                                                                     |
| ------------------------ | --------------------------------- | ------------------------------------------------------------------------- |
| `--color-accent-primary` | `#FF4D4D` (red)                   | Primary CTA ("Nova Transação"), logo, negative values, Receitas in charts |
| `--color-accent-purple`  | `#BB86FC`                         | Active nav indicator (left border), links, one goal progress bar          |
| `--color-accent-orange`  | `#FF9800` / `#E76F51` / `#F4A261` | Charts (Despesas), goal progress bars                                     |
| `--color-accent-amber`   | `#E9C46A`                         | Chart categories                                                          |
| `--color-accent-blue`    | `#3498DB` / `#2980B9`             | Chart categories                                                          |

### UI Elements

| Token                    | Value                                            | Usage                                         |
| ------------------------ | ------------------------------------------------ | --------------------------------------------- |
| `--color-progress-track` | `#404048` or ~10% lighter than `--color-bg-card` | Progress bar track (unfilled)                 |
| Borders / separators     | Very dark grey, low contrast                     | Panel/section dividers; blend with background |

**Note:** Red is used as primary brand/CTA in one variant; purple for links/active nav in another. Prefer one primary accent (e.g. red for CTAs and brand) and use purple for secondary actions/links for consistency.

---

## 2. Typography Scale

### Font family

- Prefer: `Inter`, `system-ui`, or clean sans-serif (e.g. Lato, Open Sans).

### Weights

| Token                     | Value | Usage                                    |
| ------------------------- | ----- | ---------------------------------------- |
| `--font-weight-regular`   | 400   | Body, descriptions, secondary text       |
| `--font-weight-medium`    | 500   | Nav items, emphasis                      |
| `--font-weight-semi-bold` | 600   | Section headers, active nav, item titles |
| `--font-weight-bold`      | 700   | Main titles, key figures (e.g. balance)  |

### Sizes (base 16px)

| Token                    | Value                    | Example                                                       |
| ------------------------ | ------------------------ | ------------------------------------------------------------- |
| `--font-size-display`    | 2.25rem (36px)           | Page greeting: "Olá, João!"                                   |
| `--font-size-balance`    | 1.75rem (28px)           | Primary balance: "R$ 12.847,53"                               |
| `--font-size-h1`         | 1.25rem–1.5rem (20–24px) | Section titles: "Saldo Total", "Transações Recentes", "Metas" |
| `--font-size-h2`         | 1.125rem (18px)          | Panel titles: "Ações Rápidas", "Evolução Financeira"          |
| `--font-size-nav`        | 1rem (16px)              | Navigation labels                                             |
| `--font-size-item-title` | 1rem (16px)              | Transaction/goal titles (e.g. "Spotify Premium")              |
| `--font-size-body`       | 0.875rem (14px)          | Body, amounts, chart labels, links                            |
| `--font-size-small`      | 0.75rem (12px)           | Subtitles, dates, user email                                  |

### Other

- Letter-spacing: tight, modern.
- Line-height: ~1.5 for body text.

---

## 3. Spacing System

Base unit: **8px** (0.5rem).

| Token           | Value   | Usage                                              |
| --------------- | ------- | -------------------------------------------------- |
| `--spacing-xs`  | 4px     | Minimal gaps                                       |
| `--spacing-sm`  | 8px     | Icon + text, small padding                         |
| `--spacing-md`  | 12px    | Icon padding in list items                         |
| `--spacing-lg`  | 16px    | Between list items, card padding, nav item spacing |
| `--spacing-xl`  | 20–24px | Section padding, nav horizontal padding            |
| `--spacing-2xl` | 24–32px | Between major panels                               |
| `--spacing-3xl` | 30–40px | Large gutters between content blocks               |

Use these for margin, padding, and gap so the layout stays on a consistent grid.

---

## 4. Layout Rules

### Overall structure

- **Sidebar (left):** Fixed width ~200–280px. Contains logo, nav, settings, user profile at bottom.
- **Main content:** Remaining width, full height; scrolls independently.

### Main content header

- Full width; contains greeting, date, search (right), primary button ("+ Nova Transação"), notification icon.
- Greeting and date on left; search, button, and icon on right (flex/space-between).

### Content area

- **Panels/cards:** Rectangular cards with rounded corners (8–12px), `--color-bg-card`, consistent padding (`--spacing-xl`).
- **Grid:** Panels can be full width (e.g. "Saldo Total") or multi-column (e.g. "Ações Rápidas" + "Gastos por Categoria"; "Transações Recentes" + "Metas").
- **Responsiveness:** Panels stack or reflow on small screens; keep spacing and hierarchy.

### Alignment

- Text: Left-aligned in sidebar and content; numbers (amounts, percentages) right-aligned in lists/tables.
- Icons: Vertically centered with labels; consistent gap (`--spacing-sm`).

---

## 5. Component Patterns

### Navigation sidebar

- **Logo:** Brand name (e.g. "FinTrack") in accent color; optional tagline in small primary text.
- **Nav items:** Icon + label; vertical list with even spacing (`--spacing-lg`).
  - Default: secondary text, no background.
  - Active: `--color-bg-nav-active` (or red), optional left border (e.g. 4px `--color-accent-purple` or red), primary text and icon.
  - Hover: Slight background or border change.
- **User profile (footer):** Card with avatar (initials or image), name, email; `--color-bg-card`, rounded corners.

### Header (main content)

- **Greeting:** `--font-size-display`, primary text.
- **Search:** Dark input, prefix icon (e.g. magnifying glass), low-contrast border/background.
- **Primary button:** Solid `--color-accent-primary`, white text, leading "+" icon, rounded corners.
- **Notification:** Bell icon, same row as search and button.

### Cards / panels

- Background: `--color-bg-card`.
- Border-radius: 8–12px.
- Padding: `--spacing-xl` (e.g. 24px).
- Title at top; content below with clear hierarchy.

### Quick actions

- Row of icon + label buttons.
- Default: dark background (`--color-bg-card`), white icon and text.
- Primary action (e.g. "Nova Transação"): same style as header CTA (red).

### List items (transactions, goals)

- **Layout:** Flex; icon left, title + subtitle center, value + date right.
- **Container:** Card-style (`--color-bg-card`), rounded, padding `--spacing-lg`.
- **Icon:** Circular container, optional category-colored accent.
- **Amounts:** Income green (`--color-text-income`), outcome red (`--color-text-outcome`); right-aligned.

### Section header with action

- Flex: title (left), link (right).
- Title: `--font-size-h1`, primary text.
- Link: `--color-text-link`, `--font-size-body`; optional leading icon (e.g. "+" for "Nova meta").

### Progress bar

- **Track:** Height 6–8px, full border-radius, `--color-progress-track`.
- **Fill:** Same height/radius; width by percentage; color from accents (red, orange, purple).

### Charts

- **Line chart:** Two lines (e.g. Receitas / Despesas) with distinct colors and optional area fill; clear axis labels and legend (color dot + label).
- **Donut:** Center total; legend beside with colored dots and right-aligned values.
- Reuse accent palette for series (red, orange, yellow, purple, blue).

---

## Quick reference (CSS variables)

```css
:root {
  /* Backgrounds */
  --color-bg-main: #1a1a1a;
  --color-bg-sidebar: #212121;
  --color-bg-card: #2c2c34;
  --color-bg-nav-active: #3f3f4d;

  /* Text */
  --color-text-primary: #e0e0e0;
  --color-text-secondary: #a0a0a0;
  --color-text-link: #bb86fc;
  --color-text-income: #4caf50;
  --color-text-outcome: #ff5252;

  /* Accents */
  --color-accent-primary: #ff4d4d;
  --color-accent-purple: #bb86fc;
  --color-accent-orange: #ff9800;

  /* Typography */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semi-bold: 600;
  --font-weight-bold: 700;
  --font-size-display: 2.25rem;
  --font-size-balance: 1.75rem;
  --font-size-h1: 1.25rem;
  --font-size-body: 0.875rem;
  --font-size-small: 0.75rem;

  /* Spacing (8px base) */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;
  --spacing-2xl: 32px;
}
```

Use this spec when implementing or reviewing UI so the app stays consistent with the intended dark theme, typography, spacing, and components.
