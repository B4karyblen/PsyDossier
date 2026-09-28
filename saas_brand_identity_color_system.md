# SaaS Brand Identity --- Color System

> Premium healthcare/SaaS visual system inspired by the provided
> references. Design direction: **clean, clinical, modern, trustworthy,
> soft, high-contrast without harsh black/white extremes.**

------------------------------------------------------------------------

## 1. Brand Direction

### Core visual language

-   **Teal** → primary brand/action color
-   **Dark Navy** → authority, typography, navigation
-   **White** → primary content surfaces
-   **Soft Gray** → application backgrounds and visual separation
-   **Light Gray** → nested cards, inputs, secondary surfaces
-   **Purple / Orange / Red** → semantic or contextual accents

### Main principle

The interface should **not use white everywhere**.

Use layered surfaces:

``` text
Application Background
        ↓
     Main Card
        ↓
   Nested Sub-card
        ↓
       Input
```

Recommended hierarchy:

``` text
#F4F7F9  → page/application background
#FFFFFF  → main containers and cards
#F1F5F7  → nested cards and secondary surfaces
#F8FAFC  → inputs / very subtle surfaces
#D9E2E8  → borders and separators
```

This creates the soft contrast visible in the reference designs.

------------------------------------------------------------------------

# 2. Color Tokens

## Primary Brand

  -----------------------------------------------------------------------
  Token                   Hex                     Usage
  ----------------------- ----------------------- -----------------------
  `primary`               `#10B9A9`               Main CTA, active
                                                  states, links, brand
                                                  elements

  `primary-dark`          `#07988D`               Hover, pressed states,
                                                  stronger teal

  `primary-light`         `#D9F7F3`               Soft backgrounds,
                                                  badges, highlights

  `primary-subtle`        `#ECFBF9`               Very subtle teal
                                                  surfaces
  -----------------------------------------------------------------------

### Primary rule

Use `#10B9A9` as the **main action color**, not as a general background.

Examples:

-   Book / Confirm
-   Continue
-   Save
-   Add
-   Active navigation
-   Selected controls
-   Progress indicators
-   Important interactive elements

------------------------------------------------------------------------

# 3. Navy / Typography

  Token              Hex         Usage
  ------------------ ----------- ------------------------------------
  `navy`             `#18243A`   Primary text, headings, navigation
  `deep-navy`        `#111827`   Strong headings, dark UI elements
  `text-secondary`   `#64748B`   Supporting text
  `muted`            `#94A3B8`   Placeholder, disabled, metadata

### Typography hierarchy

``` text
Heading / Primary       #18243A
Body / Secondary        #64748B
Muted / Metadata        #94A3B8
White on dark/primary   #FFFFFF
```

Avoid pure `#000000` for normal interface text.

------------------------------------------------------------------------

# 4. Background System

## Application Background

``` css
background: #F4F7F9;
```

Use for:

-   Dashboard background
-   Main application canvas
-   Page backgrounds
-   Empty space around cards

The background should feel **cool, soft and almost white**, rather than
visibly gray.

------------------------------------------------------------------------

## Primary Surface

``` css
background: #FFFFFF;
```

Use for:

-   Main cards
-   Modal windows
-   Patient/doctor profiles
-   Tables
-   Large content containers
-   Forms
-   Main navigation panels

White represents the **primary content layer**.

------------------------------------------------------------------------

## Secondary Surface

``` css
background: #F1F5F7;
```

Use for:

-   Nested cards
-   Secondary information
-   Grouped form sections
-   Appointment details
-   Supporting statistics
-   Secondary panels

This is important for creating depth without shadows.

------------------------------------------------------------------------

## Input Surface

``` css
background: #F8FAFC;
```

Use for:

-   Text inputs
-   Search fields
-   Select fields
-   Textareas
-   Filters

------------------------------------------------------------------------

# 5. Border System

  Token            Hex         Usage
  ---------------- ----------- ------------------------
  `border`         `#D9E2E8`   Standard borders
  `border-light`   `#E8EEF2`   Very subtle separators
  `border-focus`   `#10B9A9`   Focused controls

### Border philosophy

Prefer:

``` css
border: 1px solid #D9E2E8;
```

over heavy borders.

The UI should feel **soft and spacious**, not boxed in.

------------------------------------------------------------------------

# 6. Semantic Colors

## Success

``` css
success: #10B981;
success-light: #DCFCE7;
```

Use for:

-   Successful actions
-   Completed appointments
-   Available status
-   Positive confirmation

------------------------------------------------------------------------

## Warning

``` css
warning: #F59E0B;
warning-light: #FEF3C7;
```

Use for:

-   Pending states
-   Warnings
-   Ratings
-   Attention-required information

------------------------------------------------------------------------

## Danger

``` css
danger: #F43F5E;
danger-light: #FFE4E6;
```

Use for:

-   Errors
-   Critical alerts
-   Delete actions
-   Failed states

------------------------------------------------------------------------

## Purple Accent

``` css
purple: #A855F7;
purple-light: #F3E8FF;
```

Use selectively for:

-   Selected appointment slots
-   AI features
-   Premium/PRO indicators
-   Secondary visual emphasis

Purple should remain an **accent**, not a second primary brand color.

------------------------------------------------------------------------

# 7. Full Color Palette

``` css
/* Brand */
--primary: #10B9A9;
--primary-dark: #07988D;
--primary-light: #D9F7F3;
--primary-subtle: #ECFBF9;

/* Navy */
--navy: #18243A;
--deep-navy: #111827;

/* Text */
--text-primary: #18243A;
--text-secondary: #64748B;
--text-muted: #94A3B8;

/* Surfaces */
--background: #F4F7F9;
--surface: #FFFFFF;
--surface-secondary: #F1F5F7;
--surface-input: #F8FAFC;

/* Borders */
--border: #D9E2E8;
--border-light: #E8EEF2;
--border-focus: #10B9A9;

/* Semantic */
--success: #10B981;
--success-light: #DCFCE7;

--warning: #F59E0B;
--warning-light: #FEF3C7;

--danger: #F43F5E;
--danger-light: #FFE4E6;

/* Accent */
--purple: #A855F7;
--purple-light: #F3E8FF;
```

------------------------------------------------------------------------

# 8. Surface Hierarchy

The frontend should follow this hierarchy consistently.

``` text
LEVEL 0
Application
#F4F7F9

    └── LEVEL 1
        Main Container
        #FFFFFF

            └── LEVEL 2
                Sub-card
                #F1F5F7

                    └── LEVEL 3
                        Input / Control
                        #F8FAFC
```

### Example

``` text
Dashboard
└── #F4F7F9

    Patient Overview Card
    └── #FFFFFF

        Medical Information
        └── #F1F5F7

            Input
            └── #F8FAFC
```

Do not use four different shades randomly.

Every surface must have a **clear hierarchy and purpose**.

------------------------------------------------------------------------

# 9. Cards

## Standard Card

``` css
background: #FFFFFF;
border: 1px solid #D9E2E8;
border-radius: 16px;
```

## Elevated Card

Use elevation sparingly.

``` css
background: #FFFFFF;
border: 1px solid #E8EEF2;
box-shadow: 0 8px 30px rgba(24, 36, 58, 0.06);
border-radius: 16px;
```

## Nested Card

``` css
background: #F1F5F7;
border-radius: 12px;
```

Avoid excessive shadows. **Surface contrast should do most of the visual
work.**

------------------------------------------------------------------------

# 10. Buttons

## Primary

``` css
background: #10B9A9;
color: #FFFFFF;
```

Hover:

``` css
background: #07988D;
```

Use for the primary action of a screen.

------------------------------------------------------------------------

## Secondary

``` css
background: #FFFFFF;
color: #18243A;
border: 1px solid #D9E2E8;
```

------------------------------------------------------------------------

## Soft Primary

``` css
background: #ECFBF9;
color: #07988D;
```

Use for secondary teal actions.

------------------------------------------------------------------------

## Dark Button

``` css
background: #18243A;
color: #FFFFFF;
```

Use sparingly for high-contrast utility actions.

------------------------------------------------------------------------

# 11. Inputs

Default:

``` css
background: #F8FAFC;
border: 1px solid #D9E2E8;
color: #18243A;
```

Focus:

``` css
border-color: #10B9A9;
box-shadow: 0 0 0 3px rgba(16, 185, 169, 0.12);
```

Placeholder:

``` css
color: #94A3B8;
```

Inputs should visually sit **inside** the surrounding white card.

------------------------------------------------------------------------

# 12. Navigation

## Sidebar

Recommended:

``` css
background: #FFFFFF;
border-right: 1px solid #E8EEF2;
```

Active navigation:

``` css
background: #ECFBF9;
color: #07988D;
```

Active icon:

``` css
color: #10B9A9;
```

Inactive:

``` css
color: #64748B;
```

------------------------------------------------------------------------

# 13. Status Badges

## Success

``` text
Background: #DCFCE7
Text:       #15803D
```

## Pending

``` text
Background: #FEF3C7
Text:       #B45309
```

## Error

``` text
Background: #FFE4E6
Text:       #BE123C
```

## Teal

``` text
Background: #ECFBF9
Text:       #07988D
```

## PRO / Premium

``` text
Background: #F3E8FF
Text:       #9333EA
```

Badges should generally use a **light background + darker text**, not
saturated solid backgrounds.

------------------------------------------------------------------------

# 14. Data Visualization

Recommended semantic mapping:

``` text
Primary data       #10B9A9
Secondary data     #18243A
Positive           #10B981
Warning            #F59E0B
Negative           #F43F5E
AI / Premium       #A855F7
Neutral            #94A3B8
```

Keep charts restrained. The interface should remain predominantly
**teal + navy + white + gray**.

------------------------------------------------------------------------

# 15. Accessibility & Contrast

Use dark navy rather than teal for long-form text.

``` text
Good:
#18243A on #FFFFFF

Good:
#FFFFFF on #10B9A9

Good:
#18243A on #F4F7F9
```

Do not use:

``` text
#10B9A9 for long paragraphs
#94A3B8 for important text
light teal text on white for critical information
```

Interactive elements must have clear hover, focus and disabled states.

------------------------------------------------------------------------

# 16. Tailwind Mapping

``` js
colors: {
  primary: {
    DEFAULT: "#10B9A9",
    dark: "#07988D",
    light: "#D9F7F3",
    subtle: "#ECFBF9",
  },

  navy: {
    DEFAULT: "#18243A",
    deep: "#111827",
  },

  background: "#F4F7F9",

  surface: {
    DEFAULT: "#FFFFFF",
    secondary: "#F1F5F7",
    input: "#F8FAFC",
  },

  border: {
    DEFAULT: "#D9E2E8",
    light: "#E8EEF2",
    focus: "#10B9A9",
  },

  text: {
    primary: "#18243A",
    secondary: "#64748B",
    muted: "#94A3B8",
  },

  success: "#10B981",
  warning: "#F59E0B",
  danger: "#F43F5E",
  purple: "#A855F7",
}
```

------------------------------------------------------------------------

# 17. Frontend Implementation Rules

### Rule 1 --- Use surface contrast before shadows

Prefer:

``` text
gray background → white card → light gray sub-card
```

instead of:

``` text
white background → white card → heavy shadow
```

------------------------------------------------------------------------

### Rule 2 --- Teal is the action color

When the user asks:

> "Where should I click?"

The primary interactive element should generally be obvious through
**teal**.

------------------------------------------------------------------------

### Rule 3 --- Navy is the structural color

Use navy for:

-   Headings
-   Navigation
-   Important numbers
-   Primary labels
-   Strong UI elements

------------------------------------------------------------------------

### Rule 4 --- Gray creates depth

Use gray to distinguish:

-   Application background
-   Secondary cards
-   Inputs
-   Disabled controls
-   Metadata

------------------------------------------------------------------------

### Rule 5 --- White represents the primary content layer

Major content should sit on white surfaces.

------------------------------------------------------------------------

### Rule 6 --- Accents are contextual

Purple, orange and red should communicate meaning.

Do not use them merely for decoration.

------------------------------------------------------------------------

# 18. Recommended Visual Formula

For most screens:

``` text
60–70%
White / soft surfaces

15–25%
Soft gray / secondary surfaces

5–10%
Navy

5–10%
Teal

<5%
Purple / orange / red accents
```

The exact ratio can change by screen, but the overall product should
remain visually dominated by **white, soft gray, navy and teal**.

------------------------------------------------------------------------

# 19. Design Personality

The final interface should feel:

-   Clinical
-   Premium
-   Trustworthy
-   Modern
-   Calm
-   Intelligent
-   Spacious
-   Professional
-   Human
-   Technology-forward

Avoid:

-   Excessive gradients
-   Excessive glassmorphism
-   Neon colors
-   Pure black backgrounds
-   Excessive shadows
-   Too many accent colors
-   Overly saturated UI
-   White-on-white card structures with no hierarchy

------------------------------------------------------------------------

# 20. One-Line Design Brief

> **Build a premium SaaS interface around teal `#10B9A9` and navy
> `#18243A`, using `#F4F7F9` as the application canvas, `#FFFFFF` for
> primary containers, `#F1F5F7` for nested cards, and `#F8FAFC` for
> inputs; use subtle `#D9E2E8` borders instead of heavy shadows, with
> purple/orange/red reserved for contextual accents.**
