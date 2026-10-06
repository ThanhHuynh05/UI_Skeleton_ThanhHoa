# Aria visual design handoff

## Direction decision

Two directions were assessed against the same Home and Result tasks:

1. **Navy + teal enterprise workspace** — light grey application background, navy navigation structure, teal primary actions, white result surfaces. Strong conventional analytics identity, but visually close to common enterprise dashboards.
2. **Ivory + oxblood editorial intelligence workspace** — warm ivory background, oxblood actions and focus, serif answer hierarchy, restrained surfaces. Better separates business conclusions from technical tooling and matches the current implemented product identity.

**Selected implementation:** Direction 2. The current UI is the selected high-fidelity direction. Direction 1 remains a reviewed alternative, not an unfinished theme toggle. Final stakeholder sign-off is tracked in `AUDIT_ACCEPTANCE.md` G1.

## Tokens

- Type scale: 14 / 16 / 20 / 28 / 36px; supporting labels never below 12px.
- Spacing: 8px base grid; common values 8 / 16 / 24 / 32 / 48px.
- Radius: 8px controls, 12px containers.
- Interactive target: minimum 44px height.
- Icons: stroke-based SVG using `.ui-icon`; emoji are not action icons.
- Focus: visible two-pixel outline with offset; state meaning is always accompanied by text.

## Component variants

- Button: primary, secondary, quiet/action, danger, submitted status.
- Input: text, search, textarea, select, date; default/error/disabled/focus.
- Card: question, answer, task suggestion, source definition, saved query/snapshot, state card.
- Drawer: History, Evidence Desk, Data Guide, Settings.
- Table: business result, technical schema, responsive horizontal region.
- Status: success, warning, restricted, partial, cancelled, service error.
- Modal: clarification, interpretation confirmation, feedback, export, destructive confirmation.

## Responsive contract

- 1440/1280: full rail, content and optional Evidence panel.
- 768: navigation drawer, one-column task cards, Evidence as overlay sheet.
- 390: full-width modal/sheet, stacked actions, local table scrolling, no page-level horizontal scroll.

Implementation tokens and final overrides live at the end of `styles.css` so legacy selectors cannot reduce the minimum readable/control sizes.
