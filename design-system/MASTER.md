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

### Ink · Neutral slate
`ink-25 #FBFCFD` · `50 #F7F8FA` (canvas, table header) · `100 #F0F2F5` (active nav, avatar bg) · `150 #E7EAEE` (card borders, dividers) · `200 #DCE0E6` (input borders) · `300 #C3C9D2` (hover borders) · `400 #949DAB` (icons, placeholders only) · `500 #636D7E` (secondary text, min for text) · `600 #4A5466` · `700 #343D4D` (labels) · `800 #222A38` · `900 #151B27` (primary text)

### Semantic
Tailwind `emerald` (validated), `amber` (in progress / pending), `rose` (danger, coercive care, archived), `sky`/`violet` for neutral categories.
Badge recipe: `bg-{c}-50 text-{c}-700 ring-1 ring-inset ring-{c}-200` + `.dot`.

## Typography
- Family: **Manrope** (self-hosted brand font). `font-mono` maps to Manrope with tabular figures.
- Scale: 12 caption · 13 small · **14 body** · 16 · 18 h3 · 20 h2 · 24 h1 · 30 display.
- Weights: 500 body · 600 labels, buttons, table emphasis · 700 page titles only. No 800.
- Labels: sentence case, `text-sm font-medium text-ink-700`. No uppercase-tracking labels in the app (print export only).

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
| `.btn-primary` / `.clinical-btn-primary` | navy fill, white text, 36px |
| `.btn-secondary` | white, `ink-200` border, soft shadow |
| `.btn-ghost` | text-only, hover `ink-100` |
| `.btn-danger` | destructive confirm (archive) |
| `.btn-icon` | 36px square icon button (needs `aria-label`) |
| `.btn-sm` / `.btn-lg` | 32px / 40px size modifiers |
| `.clinical-card` | white, 12px radius, hairline border |
| `.clinical-subcard` | nested white section, 10px radius |
| `.clinical-input` | full-width, 14px, navy focus ring |
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
- **Sidebar** 256px (68px collapsed), white, `ink-150` right border. Sections: logo · search · nav groups · user. Active item = `ink-100` bg + teal 3px edge bar. Badges are plain counts.
- **Top bar** 56px, white/90 + blur, breadcrumb › page title on one line, ⌘K search, user avatar. No CTA in the top bar: page CTAs live in the page header.
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
- Targets: 40px minimum for standalone controls; dense controls (32–36px) only inside toolbars and tables.
- Motion: 150ms color/border transitions; no scale-on-hover; `prefers-reduced-motion` respected.
- Icons: Lucide only, 16px in controls, 18px in nav. No emoji.
- No raw hex in JSX; use tokens.
