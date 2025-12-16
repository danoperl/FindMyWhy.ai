Authoritative FMY State v61-baseline

Tag: v61-baseline-re-established
Status: Canonical / Trustworthy Baseline

1. What This State Is

This tag represents the re-established, stable foundation of FindMyWhy.ai (v61).

It is the reference point for:

all future development

regressions checks

“did we break something?” comparisons

If something looks wrong later, compare against this state first.

2. Runtime Authority (Non-Negotiable)
Entry Point

src/App.jsx must mount:

FindMyWhy-v61_0-SliceB.jsx

Legacy shells (e.g. v60_7a) are not runtime targets.

Navigation Model

Single shell owns routing between:

HOME (Entry Hatch)

IC (Instant Clarity)

DM (Deeper Meaning, DM0–DM6 stepper)

No parallel shells. No alternate DM render paths.

3. Entry Hatch Doctrine (HOME)

Purpose: Orientation, not engagement

Surface-only onboarding

Clear mission brief

Optional name + 4-digit passcode (session only)

Two direct entry buttons:

Quick Clarity (IC)

Deeper Meaning (DM)

Explicitly not:

a feature

a funnel

a place for cleverness

If HOME starts “meaning-making,” drift has begun.

4. Mode Boundaries
Instant Clarity (IC)

Lightweight, 3-question flow

No persistence

Optional IC → DM bridge allowed

IC must never mutate DM rules or ownership

Deeper Meaning (DM)

Step-gated DM0 → DM6

Light mode UI

Single step visible at a time

Exit points only at DM0 and DM6

DM state recomputes from canonical inputs

If DM becomes stacked, dark, or multi-card → wrong shell is mounted.

5. Styling Authority (Critical)
Tailwind Version

Tailwind v4

Required CSS Entry

src/index.css must contain only:

@import "tailwindcss";


Do not revert to @tailwind base/components/utilities.

PostCSS

postcss.config.js must use:

@tailwindcss/postcss

autoprefixer

If styling looks “browser default,” check CSS import chain before touching components.

6. Asset Rules (SVGs)

Do not overwrite known-good assets

New assets get versioned filenames (e.g. *-v2.svg)

SVGs must:

have a viewBox

NOT define physical units (in, cm, px)

CSS controls size, not the SVG file

7. Recovery Rule (When Things Go Weird)

Check the Git tag:

v61-baseline-re-established

Verify App.jsx mount

Verify Tailwind v4 pipeline

Compare visuals to HOME + DM0 screenshots

Fix wiring before fixing styling

Never “fix forward” from a broken baseline.

8. Guiding Principle

Execute, don’t ideate.
Checklist first, code second.
If it doesn’t flip a ❌ to ✅, it’s out of scope.