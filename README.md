# Aria Enterprise Assistant

Aria is a browser-based prototype for asking governed business questions in plain English. It demonstrates conversational analytics, inline clarification, role-aware access controls, evidence inspection, evaluation, and observability using synthetic enterprise data.

The project is implemented with HTML, CSS, and vanilla JavaScript. It has no build step, package manager, frontend framework, backend service, or external charting dependency.

> All people, records, metrics, answers, traces, and benchmark results in this repository are synthetic demo data. They must not be treated as production information or measured model performance.

## Run locally

Open the main page directly in a modern browser:

```bash
open index.html
```

Other entry points:

- `admin.html` — role-gated Observability and Evaluation workspace.
- `eval.html` — standalone legacy evaluation view retained for compatibility.

Because the application is buildless, no dependency installation is required.

## Current experience

### Workspace and navigation

- Responsive Aria sidebar with expanded and collapsed icon-only states.
- New Chat, Search Chats, Ask, Saved Insights, and Data Guide navigation.
- A single Recents list without Today, Yesterday, or Earlier groupings.
- Persona information and settings controls in the sidebar footer.
- Conversation actions in a three-dot menu at the top-right of the page:
  - Pin or unpin
  - Rename
  - Export to Docs
  - Download PDF
  - Delete
- Per-user conversation history stored in the browser.

### Asking questions

- Plain-English question composer with optional business-area boundaries.
- Time scope is inferred from the question; there is no separate composer time selector.
- Voice input where the browser supports Web Speech Recognition.
- Suggested questions backed by deterministic synthetic fixtures.
- Multi-turn conversations with searchable history.

### Inline clarification

Before running a clear question, Aria presents its proposed interpretation inside the conversation. Ambiguous questions and scope conflicts also resolve inline—no clarification modal is used.

- A three-second “Aria is thinking…” state appears before clarification.
- The interpretation preview can show metric, breakdown, inferred period, business area, project scope, unit, and assumptions.
- Clarification choices are numbered.
- Option 1 receives default focus.
- Use Up and Down Arrow keys to move between choices.
- Press `1`, `2`, or `3` to activate the matching option.
- Option 3, **Adjust question**, opens the revision workflow.
- Confirmed clarification cards disappear after selection because the applied context remains available in the answer and Evidence Desk.

### Answers and evidence

- Answer-first response cards with a direct conclusion and primary value.
- Intent-aware table and SVG chart presentations.
- Supporting evidence appears before data freshness and business sources.
- Evidence Desk contains:
  - Applied interpretation
  - Business sources and definitions
  - Technical trace and generated SQL
- Copy answer, copy records, CSV export, saved insights, rerun, and feedback actions.
- Distinct states for denied requests, unsupported questions, no data, partial results, errors, and cancellation.
- Edited interpretations create updated runs while retaining historical context.

### Security and governance

- Demo personas with different business roles and data boundaries.
- Role-aware column masking and access-denied responses.
- Blocking of destructive write requests and prompt-injection examples.
- Traceable source definitions and generated SQL.
- Browser-local audit and telemetry records.

### Observability and evaluation

`admin.html` uses the same Aria sidebar shell and visual system as the main workspace. It is restricted to the Data / Admin persona.

The sidebar separates two views:

- **Observability**
  - Request totals and successful-outcome rate
  - Average latency and guardrail activity
  - Latency history and feedback signals
  - Searchable, filtered, paginated activity records
  - Request inspection details
- **Evaluation**
  - Simulated strategy selection
  - Run metadata and fixture-level results
  - Category pass-rate visualization
  - Configured latency, context, and cost estimates
  - CSV export

Evaluation results are predefined fixture outcomes. The prototype does not execute or compare live language models.

## Demo personas

The first-access flow provides representative roles such as:

- Sales Manager
- Finance Analyst
- Project Manager
- Procurement Officer
- Executive
- Data / Admin team

The selected profile, preferences, conversations, saved insights, telemetry, and audit events are stored in `localStorage`. Resetting demo data removes this browser-local state.

## Keyboard controls

| Shortcut | Action |
| --- | --- |
| `Enter` | Send the current question |
| `Shift + Enter` | Insert a new line |
| `/` | Focus the question composer |
| `Ctrl + K` / `Cmd + K` | Open conversation search |
| `Esc` | Close the active menu, drawer, or dialog |
| `Up Arrow` / `Down Arrow` | Move through active clarification choices |
| `1`, `2`, `3` | Select the corresponding clarification choice |

Number shortcuts do not override text entry when the user has already typed in a form field.

## Project structure

```text
.
├── index.html              # Main Aria conversation workspace
├── admin.html              # Unified Observability and Evaluation workspace
├── eval.html               # Standalone legacy evaluation page
├── styles.css              # Shared design system and responsive layouts
├── app.js                  # Workspace state, rendering, and interactions
├── mock-data.js            # Agent simulator, scenarios, telemetry, and benchmarks
├── ck1-schema-data.js      # CK1 synthetic schema catalog
├── ck1-mock-data.js        # Relational CK1 synthetic fixture records
├── AUDIT_ACCEPTANCE.md     # Acceptance and audit notes
├── DESIGN_HANDOFF.md       # UI and implementation handoff notes
└── README.md               # Project documentation
```

## Architecture

The application runs entirely in the browser:

1. `index.html` and `admin.html` provide semantic page structure.
2. `styles.css` supplies shared themes, layout tokens, responsive behavior, and component styling.
3. `app.js` manages personas, conversations, clarification, answers, evidence, exports, and accessibility behavior.
4. `mock-data.js` supplies deterministic question handling, security decisions, telemetry, and evaluation fixtures.
5. CK1 files provide a synthetic relational schema and records for supported business scenarios.
6. `localStorage` provides browser-local persistence.

There is no network database, production identity provider, real model call, or server-side authorization layer.

## Supported demo domains

- Sales and contracts
- Finance and receivables
- Procurement and suppliers
- Construction progress and milestones
- Projects and portfolio delivery
- Property and lease operations
- Governance, access policy, and audit activity

Supported answers are intentionally limited to represented fixtures and deterministic fallback behavior.

## Validation checklist

After making changes, verify at least the following:

1. Open `index.html` and select a persona.
2. Submit a supported question and confirm the three-second thinking state.
3. Confirm option 1 is focused in the inline clarification.
4. Navigate choices with Arrow keys and select them with number keys.
5. Confirm the clarification card disappears after resolution.
6. Verify the answer, evidence, freshness, sources, and Evidence Desk.
7. Collapse and expand the sidebar; confirm navigation icons remain usable.
8. Search, rename, pin, export, and delete a conversation.
9. Switch to the Data / Admin persona and open `admin.html`.
10. Switch between Observability and Evaluation from the sidebar.
11. Run the simulated benchmark and export its CSV.
12. Check narrow viewport layouts for contained tables and no page-level horizontal scrolling.

For static source validation:

```bash
git diff --check
```

## Known limitations

- Data and model behavior are simulated.
- Persistence is limited to the current browser profile.
- Export to Docs generates a local document-compatible export; it does not connect to Google Docs or Microsoft Word.
- Download PDF uses the browser print workflow.
- Voice input depends on browser support and permission.
- Role checks are prototype client-side controls, not production security boundaries.
- Directly opening local files may behave differently across browsers; use a simple static server if a browser restricts local-file features.

## License and usage

This repository is an educational enterprise-interface prototype. Review project or client requirements before redistributing any branded material.
