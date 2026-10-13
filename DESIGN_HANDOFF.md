# Aria visual design handoff

## Direction decision

Four directions were assessed against the same Home and Result tasks:

1. **Navy + teal enterprise workspace** — light grey application background, navy navigation structure, teal primary actions, white result surfaces. Strong conventional analytics identity, but visually close to common enterprise dashboards.
2. **Ivory + oxblood editorial intelligence workspace** — warm ivory background, oxblood actions and focus, serif answer hierarchy, restrained surfaces. Better separates business conclusions from technical tooling and matches the current implemented product identity.

3. **Neutral + cobalt analytical workspace** — cool neutral surfaces, one sans-serif family, a single cobalt accent for interaction and selection, and status colours reserved for meaning. Answers lead with the key figure; evidence and provenance follow.

4. **Conversational assistant workspace** — the interaction model of mainstream chat assistants: a centred greeting and composer on a new chat, answers as plain prose with one embedded result block (key figure, chart or table, provenance), an icon toolbar under each answer, a slim title bar and a minimal sidebar. Monochrome chrome (black/white primary actions); blue only for links, selection, focus and data.

**Selected implementation:** Direction 4. It replaced Direction 3, which kept the dashboard-style card layout and only changed the visual treatment. Direction 3 had in turn replaced Direction 2. Direction 2 used oxblood for primary actions, which is almost the same hue as the danger colour, so "Restricted" and "Blocked" states could not be told apart from ordinary actions. Its serif answer typography also read as editorial rather than analytical. Directions 1 and 2 remain reviewed alternatives, not unfinished theme toggles. Final stakeholder sign-off is tracked in `AUDIT_ACCEPTANCE.md` G1.

## Tokens

- Type scale: 12 / 14 / 16 / 18 / 24 / 32px; supporting labels never below 12px. Labels use sentence case, not uppercase tracking.
- Colour: `--button-primary-*` (black in light, white in dark) for primary actions; `--accent-*` for links, selection and focus only; `--success-*`, `--warning-*` and `--danger-*` for meaning only; `--chart-1…5` for data series.
- Spacing: 8px base grid; common values 8 / 16 / 24 / 32 / 48px.
- Radius: 10px controls, 16px containers, 22px question bubble, 26px composer.
- Thread: 768px reading column (`--thread-width`); answer prose 16px / 1.75.
- Interactive target: minimum 44px height.
- Icons: stroke-based SVG using `.ui-icon`; emoji are not action icons.
- Focus: visible two-pixel outline with offset (the composer darkens its border while typing); state meaning is always accompanied by text.

## Component variants

- Button: primary, secondary, quiet/action, danger, submitted status.
- Input: text, search, textarea, select, date; default/error/disabled/focus.
- Card: question, answer, task suggestion, source definition, saved query/snapshot, state card.
- Drawer: History, Evidence Desk, Data Guide, Settings.
- Table: business result, technical schema, responsive horizontal region.
- Status: success, warning, restricted, partial, cancelled, service error.
- Modal: clarification, interpretation confirmation, feedback, export, destructive confirmation.

## Responsive contract

- 1440/1280: full rail, content and optional Evidence panel, which narrows the conversation instead of covering it.
- 768: navigation drawer, one-column task cards, Evidence as overlay sheet.
- 390: full-width modal/sheet, stacked actions, local table scrolling, no page-level horizontal scroll.

Tokens live at the top of `styles.css`. Section 20, "Workspace design layer", at the end of the file owns the final look of shared surfaces and ends with the interaction-state guard. Change components there rather than appending another override pass.
