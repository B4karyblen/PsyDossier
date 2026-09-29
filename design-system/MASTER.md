# PsyDossier Design System — MASTER

Source of truth for UI. Tokens live in `src/index.css` (`@theme` + `@layer components`).
Derived from the brand screenshots in `Design_branding_screenshot/` (teal + navy health-app kit).

## Brand analysis (from screenshots)

| Trait | Observed | Applied |
|---|---|---|
| Signature color | Bright medical teal (`#14B39B`) on CTAs, active states, hero header | `brand-*` scale |
| Anchor color | Deep navy (bottom nav, "Go Pro" button, AI dark screens) | `ink-900` for dark accents (profile card, rubrique progress, addendum button) |
| Accents | Pastel tiles — mint, rose, violet, amber, sky — with saturated icon | `.icon-tile` + `.tile-*` |
| Shape | Large radii (16–24px), pill segmented controls | cards 20px, controls 12px, hero 24px |
| Surfaces | White cards on cool light grey, almost no borders, soft shadows | `canvas` bg, hairline `ink-150` border, `--shadow-card` |
| Type | Geometric sans, heavy headings, sentence case | Manrope 800 headings, no uppercase labels |
| Hero | Teal gradient greeting header with stat chips and ring decoration | `.hero-brand` |

## Color tokens

### Brand (teal)
| Token | Hex | Use |
|---|---|---|
| brand-50 | #EDFAF7 | active nav bg, hover tint |
| brand-100 | #D3F4EC | chips, avatar bg |
| brand-300 | #6FD6C2 | text on dark |
| brand-500 | #14B39B | fills, icons, progress, check dots (not for text on white: 2.6:1) |
| brand-600 | #0A8474 | **primary buttons** (white text 4.6:1) |
| brand-700 | #0B7468 | **teal text on light** (5.7:1) |
| brand-800 | #0D5E56 | text on brand-50/100 |

### Ink (navy slate)
`ink-25 #FAFBFC` · `50 #F5F7F9` · `100 #EEF2F5` · `150 #E6EBF0` (borders) · `200 #DDE3EA` (input borders) · `300 #C5CED8` · `400 #94A1B2` (icons/meta only) · `500 #64748B` (muted text, min for body) · `600 #4B5A6E` · `700 #334155` · `800 #1F2A3C` · `900 #172033` (primary text) · `950 #0D1424`

`canvas #F2F5F8` = app background.

### Semantic
Tailwind built-ins: `emerald` (validé/success), `amber` (en cours/pending), `rose` (sans consentement/danger/archivé), `violet`, `sky`. Use 100 bg + 700/800 text for chips.

## Typography
- Family: Manrope (self-hosted). `font-mono` is remapped to Manrope + tabular figures — no monospace face in UI.
- Page title 24px/800 · section title 15–20px/700–800 · body 14px/500 · meta 12–13px/600 · micro-label 11px/700 sentence case.
- Numbers: `tabular-nums`.
- No `uppercase tracking-wider` labels (except print export).

## Components (`src/index.css`)
| Class | Purpose |
|---|---|
| `.clinical-card` | white, 20px radius, hairline border, soft shadow |
| `.clinical-subcard` | nested section, ink-25 bg, 16px radius |
| `.clinical-input` | 12px radius, teal focus ring (4px, 16%) |
| `.btn-primary` / `.clinical-btn-primary` | teal-600 CTA with brand shadow |
| `.btn-secondary` | white, bordered |
| `.btn-dark` | navy (addendum, strong secondary) |
| `.btn-ghost` | text button |
| `.icon-tile` + `.tile-brand/rose/amber/violet/sky/ink` | pastel icon squares |
| `.chip` | pill status/badge |
| `.segmented` | pill tab group (active = white + soft shadow) |
| `.hero-brand` | teal gradient hero with ring decoration |

Component classes sit in `@layer components`, so Tailwind utilities override them (e.g. `clinical-input pl-10`).

## Layout
- Sidebar: white, 288px (80px collapsed). Active item = brand-50 row + solid teal icon square. Navy profile card at bottom.
- Header: 64px, translucent canvas + blur, breadcrumb over page title, search, primary CTA, avatar.
- Content: `max-w-[1600px]`, `px-4 sm:px-6 lg:px-8`, `py-6 lg:py-8`.
- Dossier: light patient card (avatar, status chip, completion ring) + 288px rubrique stepper; stepper collapses to a picker under `lg`.

## Status mapping
| Statut | Chip |
|---|---|
| VALIDÉ | emerald-100 / emerald-800 |
| EN_COURS | amber-100 / amber-800 |
| BROUILLON | ink-100 / ink-700 |
| ARCHIVÉ | rose-100 / rose-700 |

Rubrique completeness: complete = solid teal dot + check · partial = amber ring + dot · empty = ink-200 ring.

## Rules
- Accessibility: text ≥ 4.5:1 (never brand-500 or ink-400 for body text), visible focus ring (teal 3px), 44px min targets (checkbox/radio 18px inside labels), aria-label on icon-only buttons.
- Motion: color/shadow transitions 150–200ms; no scale-on-hover; `prefers-reduced-motion` respected.
- No emojis as icons — Lucide only.
- Don't hardcode hex in JSX; use tokens.
