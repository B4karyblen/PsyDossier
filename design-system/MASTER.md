# PsyDossier Design System: MASTER

Source of truth for UI. Tokens live in `src/index.css` (`@theme` + `@layer components`).
Generated with the UI UX Pro Max skill (`.agent/skills/ui-ux-pro-max`):
query `healthcare SaaS dashboard clinical records professional minimal` → style **Accessible & Ethical**,
supplemented by **Data-Dense Dashboard** (BI/Analytics) and the **B2B Service** palette (navy primary).

## Principles

1. **Neutral first.** Slate surfaces, 1px borders, almost no shadow. Content carries the color.
2. **Navy means "act".** Every primary button, selected state, focus ring and checkbox uses the navy `primary` scale.
3. **Teal means "PsyDossier".** The brand teal is an identity color, not an interaction color (see below).
4. **One primary action per view.** Everything else is secondary (white, bordered) or ghost.
5. **Density for clinicians.** 14px body, 36px controls, compact tables. Clinicians scan many records per day.
6. **Status by shape + color.** Badges always pair a dot and a label; color is never the only signal.

## Color

### Primary · Navy (actions)
| Token | Hex | Use |
|---|---|---|
| primary-50 | #F2F4F8 | selected-row tint, info boxes |
| primary-100 | #E4E8F0 | subtle selected chip |
| primary-200 | #CAD2E0 | selected chip border |
| primary-500 | #4A5B80 | focus border / outline |
| primary-600 | #34456B | link text on white (9:1) |
| primary-700 | #283757 | emphasized text in info boxes |
| primary-800 | #1F2B45 | **primary button hover** |
| primary-900 | #172033 | **primary button**, selected pills, avatars |

### Brand · Teal (identity only)
`brand-500 #14B39B`, with 50–950 kept for tints.

Teal is allowed in exactly these places:
- Logo mark (sidebar)
- Active-nav indicator bar (3px, left edge of the sidebar)
- Progress bars (`.progress`) and the completeness ring
- "Rubrique complete" check dots

**Never** use teal for buttons, links, focus rings, selected tabs, form accents or chip backgrounds.

### Ink · Neutral gray (contrast on white)
| Token | Hex | Contrast | Use |
|---|---|---|---|
| ink-50 / sunken | #F6F7F9 | — | level-2 sub-container, table header |
| ink-100 | #EDEFF3 | — | hover / selected on white, readonly input |
| ink-150 | #E3E6EB | — | card borders, dividers |
| ink-200 | #D3D8DF | — | input borders |
| ink-300 | #B4BCC7 | — | hover borders, separators (never text) |
| ink-400 | #6B7280 | 4.8:1 | icons, placeholders, tertiary text (floor) |
| ink-500 | #4B5563 | 7.5:1 | secondary text |
| ink-700 | #2A3241 | 12:1 | labels |
| ink-900 | #111827 | 17:1 | primary text |

## Surface ladder (gray ↔ white)

| Level | Surface | Color | Examples |
|---|---|---|---|
| 0 | Canvas | gray `#EEF0F4` | page background |
| 1 | Main container | **white** | `.clinical-card`, sidebar, top bar, modal |
| 2 | Sub-container | **gray** `--color-sunken` | `.clinical-subcard`, table header, segmented track, sidebar search, pagination footer |
| 3 | Control | **white** | `.clinical-input`, chips (`.chip-neutral`), segmented thumb, list items inside a sub-container |

Rule: a surface is never the same color as its parent. Gray sits on white, white sits on gray.
Hover/selected on white = `ink-100`; on gray = white.

### Semantic
Tailwind `emerald` (validated), `amber` (in progress / pending), `rose` (danger, coercive care, archived), `sky`/`violet` for neutral categories.
Badge recipe: `bg-{c}-50 text-{c}-700 ring-1 ring-inset ring-{c}-200` + `.dot`.

## Typography
From the UI UX Pro Max UX guidelines: 16px body minimum, modular scale, line height 1.5+, contrast ≥ 4.5:1.
Tailwind's built-in sizes are remapped in `@theme`, so `text-xs` can never render below 13px.

| Class | Size / line | Use |
|---|---|---|
| `text-xs` | 13 / 20 | captions, badges, meta (floor; never body copy) |
| `text-sm` | 15 / 22 | secondary text, table cells, nav, buttons |
| `text-base` | 16 / 24 | body, inputs, descriptions |
| `text-lg` | 18 / 26 | card titles (`.card-title`) |
| `text-xl` / `.text-h2` | 20 / 28 | section titles |
| `.page-title` | 26 / 34 | page titles |
| KPI | 32 | dashboard numbers |

- Family: **Manrope** (self-hosted brand font), tabular figures for IDs and numbers.
- Weights: 500 body · 600 labels, secondary buttons, table names · 700 titles, active nav, selected tabs.
- **White text on navy is always bold (700).** Enforced in CSS for `.btn-primary` and any `.text-white` on a `bg-primary-*` element.
- Arbitrary pixel sizes (`text-[11px]`, etc.) are banned.

## Shape & elevation
| Token | Value | Use |
|---|---|---|
| `--radius-control` | 8px | buttons, inputs, nav items |
| `--radius-card` | 12px | cards, tables |
| `--radius-dialog` | 16px | modals |
| `--shadow-soft` | 1px | inputs, secondary buttons |
| `--shadow-card` | ~1–3px | cards |
| `--shadow-float` | 16–32px | modals, popovers, palette |
| `--shadow-focus` | 3px navy @18% | input focus ring |

## Components (`src/index.css`)
| Class | Purpose |
|---|---|
| `.btn-primary` / `.clinical-btn-primary` | navy fill, **bold** white text, 40px; disabled = gray fill + gray text (no opacity) |
| `.btn-secondary` | white, `ink-200` border, soft shadow |
| `.btn-ghost` | text-only, hover `ink-100` |
| `.btn-danger` | destructive confirm (archive) |
| `.btn-icon` | 40px square icon button (needs `aria-label`) |
| `.btn-sm` / `.btn-lg` | 36px / 44px size modifiers |
| `.clinical-card` | white, 12px radius, hairline border |
| `.clinical-subcard` | level-2 gray section inside a card |
| `.clinical-input` | white, full-width, 16px, 44px tall, navy focus ring |
| `.field-label` / `.field-hint` | 15px semibold label / 13px hint |
| `.chip-neutral` | white chip with ring — readable on white and gray |
| `.card-header` / `.card-title` | card title strip, 18px bold |
| `.data-table` | sticky `ink-50` header, 1px row dividers, hover row |
| `.tab` + `[aria-selected]` | underline tabs, navy 2px indicator |
| `.segmented` | compact toggle group (view mode) |
| `.chip` + `.dot` | 6px-radius badge with status dot |
| `.progress > span` | 6px teal progress bar |
| `.icon-tile` + `.tile-*` | 32px muted icon squares (`tile-ink` default) |
| `.kbd` | keyboard hint |
| `.page-header` | title/description left, actions right |
| `StatusBadge` (`src/components/ui`) | dossier status → badge |

## Layout
- **Sidebar** 280px (72px collapsed), white, `ink-150` right border. Sections: logo · search · nav groups · user. Active item = `ink-100` bg + teal 3px edge bar. Badges are plain counts.
- **Top bar** 64px, white/90 + blur, breadcrumb › page title on one line, ⌘K search, user avatar. No CTA in the top bar: page CTAs live in the page header.
- **Content** `max-w-[1400px]` (dossier 1600px), `px-4 sm:px-6 lg:px-8`, `py-6 lg:py-8`, 24px between sections.
- **Dashboard**: page header (date, greeting, CTA) → KPI strip (one card, 4 cells) → list cards with divided rows → diagnostics table-list.
- **Registry**: page header → underline status tabs with counts → toolbar (search, filters, sort) → table card with pagination footer.
- **Dossier**: patient card (avatar, status, meta, completeness, actions) → 256px rubrique stepper + form card.
- **Modals**: white header (icon tile, title, subtitle, close), body, footer with secondary left / primary right.

## Status mapping
| Statut | Badge |
|---|---|
| VALIDÉ | emerald |
| EN_COURS | amber |
| BROUILLON | ink |
| ARCHIVÉ | rose |

Rubrique completeness: complete = teal dot + check · partial = amber ring + dot · empty = `ink-300` ring.

## Rules
- Contrast: text ≥ 4.5:1. `ink-400` is for icons and placeholders only.
- Focus: visible 2px navy outline (`:focus-visible`), inputs use `--shadow-focus`.
- Targets: 40px minimum for every control; inputs 44px.
- Motion: 150ms color/border transitions; no scale-on-hover; `prefers-reduced-motion` respected.
- Icons: Lucide only, 16px in controls, 18px in nav and card headers. No emoji.
- No raw hex in JSX; use tokens.
