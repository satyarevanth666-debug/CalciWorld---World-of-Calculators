# CalciWorld

CalciWorld is a lightweight, client-side collection of 100+ calculators for finance, education, health, engineering, and daily life. It runs entirely in the browser — no server or signup required — and focuses on privacy, speed, and ease of use.

---

## Rating
Overall score: **8 / 10**

Rationale: Well-structured and feature-rich single-page app with a flexible calculator registry and good UX. Small improvements remain around accessibility, test coverage, and modularization.

---

## Features
- 100+ calculators across categories (Finance, Education, Math, Health, Engineering, Unit Converters).
- Input-driven calculators (declarative `inputs` + `compute(v)` handler).
- Custom calculators via `custom(body, setResult)` for interactive flows (e.g., matrix calculator).
- Local favorites, recent history, and lightweight persistence using `localStorage`.
- Theme-aware UI (light/dark) using CSS variables.
- Resource modal for About / Contact / Privacy / Terms content.

---

## Quick Start
1. Open `index.html` in a modern browser (Chrome, Edge, Firefox).
2. Use the search box or browse categories to open a calculator.
3. Fill fields and click `Compute` or use keyboard shortcuts where supported.
4. Use the footer `Resources` links to view About/Contact/Privacy/Terms in the modal.

No build or dependencies required.

---

## Project Structure
- `index.html` — Main HTML markup and modal container.
- `style.css` — All styling, theme variables, and modal styles.
- `script.js` — The application logic: calculator registry, modal rendering, event handlers.

---

## How the App Works
- The `CALCS` array in `script.js` defines all calculators. Each entry contains fields such as:
  - `id`, `name`, `icon`, `category`, `desc`
  - `inputs` (array) - for simple calculators
  - `compute(v)` - function that computes and returns a string result
  - or `custom(body, setResult)` - for interactive calculators that build their own UI inside the modal

- `openCalc(id)` renders the modal for a calculator. If `custom` is present it calls it; otherwise it builds fields with `createFieldGroup()` and runs `recompute()`.
- `setResult(text, empty)` updates the modal result area.

---

## Adding a New Calculator
- Simple input calculator example:
```js
{
  category: "Finance",
  # CalciWorld

  ## About CalciWorld
  CalciWorld is a small, privacy-first collection of calculators that run entirely inside the browser. It's designed to give users immediate, accurate answers for everyday problems without requiring accounts or sending data to external servers.

  Key principles:
  - Privacy-first: computations happen locally in the user's browser.
  - Offline-capable: no server dependency for core calculations.
  - Minimal and practical: easy-to-use inputs and clear results.

  ## Uses
  CalciWorld is useful for:
  - Personal finance calculations (EMI, SIP, ROI, tax estimates)
  - Academic tasks (GPA/CGPA, grade conversions, percentage calculations)
  - Engineering & math helpers (determinant, matrix ops, unit conversions)
  - Health & daily utilities (BMI, BMR, unit converters, percentage change)
  - Quick decision support — compare loan options, compute returns, convert units.

  ## Count & Categories of Calculators
  - Approximate total: **70+ calculators** (collection grows as new entries are added to `CALCS`).
  - Categories include:
    - Education
    - Finance
    - Mathematics
    - Health
    - Engineering
    - Unit Converters
    - Time & Date
    - Daily Life / Utilities

  Exact counts are driven by the `CALCS` array in `script.js` — you can tally categories there programmatically if needed.

  ## How CalciWorld Is Made (Implementation Details)
  - Tech stack: plain HTML (`index.html`), CSS (`style.css`) and JavaScript (`script.js`). No external frameworks or build tools are required.
  - Calculator registry: all calculators are declared in the `CALCS` array within `script.js`. Each entry follows one of two patterns:
    - Declarative input calculators: provide an `inputs` array and a `compute(v)` function that consumes input values and returns a string result.
    - Custom calculators: provide `custom(body, setResult)` to build bespoke UI and logic inside the modal (used for interactive flows like matrix operations).
  - Modal UI: a single modal (`#calcModal`) is reused for all calculators and for informational Resources content. `openCalc(id)` switches the modal into calculator mode; `openResource(key)` renders plain informational content and hides calculator controls.
  - Theming: CSS variables in `:root` and `[data-theme="dark"]` control colors. The modal uses theme-aware gradient variables to remain readable in both light and dark modes.
  - Persistence: lightweight `STORE` object persists favorites, recent calculators, and history to `localStorage`.
  - Extensibility: adding new calculators is done by adding entries to `CALCS`. The app auto-generates inputs for input-driven calculators and supports fully custom UIs for advanced interactions.

  ## Where to Look in the Code
  - `index.html` — page layout, modal container, footer links
  - `style.css` — theme variables, layout and modal styles
  - `script.js` — `CALCS` registry, modal rendering, event handlers, `openCalc`, `openResource`, `recompute`, `setResult`

  ---

