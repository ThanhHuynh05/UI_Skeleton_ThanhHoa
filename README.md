# Aria - Enterprise Natural Language Query Assistant (Frontend UI Skeleton)

> **Capstone Project 1**: Natural Language Query Agent for Enterprise Data  
> **Industry Client**: Cloud Kinetics  
> **Architecture Focus**: Layer 1 (User & Experience Layer) and Layer 8 (Observability & Monitoring)

---

## 1. Overview

**Aria** is an enterprise-grade AI query assistant that enables non-technical business users (across Sales, Finance, Procurement, Construction, and Property Management) to ask questions about enterprise data in plain natural language and receive grounded, reliable answers with interactive tabular breakdowns, visual charts, and verifiable SQL lineage.

This prototype implements the **User & Experience Layer** of the agent architecture with **zero frameworks, zero build steps, and zero external CDN dependencies**.

---

## 2. Quick Start

Simply open `index.html` directly in any modern web browser:

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

Or open `admin.html` directly to inspect the Observability & Agent Tracing dashboard.

---

## 3. File Structure

```text
UI_Skeleton/
├── index.html        # Main query assistant UI (header, sidebar, chat feed, input bar)
├── admin.html        # Observability & telemetry dashboard (KPIs, recent query traces, AST guards)
├── styles.css        # Clean, flat, enterprise design system (Light/Dark themes, CSS bar charts)
├── app.js            # Frontend orchestrator (chat flow, thinking animation, table sorting)
├── mock-data.js      # Enterprise data catalog, simulated pipeline stages, isolated askAgent()
└── README.md         # Architecture mapping and demonstration guide
```

---

## 4. Key Screens & Interactive States

### 1. Idle State
- Empty state with a welcoming hero banner explaining Aria's connection to 100+ raw tables.
- **6 clickable example prompts** that populate the chat input across different enterprise domains (Finance, Construction, Procurement, Commercial Leasing, Contracts, and Error Testing).
- Persistent header with user context badge (`Signed in as: Sales Manager`) and light/dark theme toggle.

### 2. Thinking State
- Dynamic animated execution pipeline reflecting the 5 stages of the agent architecture:
  1. *Understanding intent*
  2. *Retrieving schema & metadata*
  3. *Generating SQL query*
  4. *Validating AST & security policy*
  5. *Fetching data from read-only replica*
- Once finished, smoothly collapses into a compact status line:  
  `✓ Understood intent, retrieved schema, generated and validated query (1.7s)` with an expandable details drawer.

### 3. Clarification State (Ambiguity Handling)
- **Test Query 1**: *"What is our current occupancy rate and lease renewal forecast for commercial properties?"*
- **Test Query 2**: *"List all supplier contracts expiring soon"*
- The agent detects ambiguous scope and presents interactive quick-reply chips:
  - *By Property Asset Class (Office vs Retail)*
  - *By Geographic Zone (North, Central, South)*
  - *Show Entire Portfolio Summary*
- Selecting a chip automatically triggers the pipeline with the clarified context and renders the detailed results.

### 4. Results State
- **Right-aligned user bubble** displaying the submitted question.
- **Grounded Natural-Language Answer**: Plain-English executive summary highlighting key figures.
- **Interactive Sortable Data Table**: Click any column header to sort ascending (`▲`) or descending (`▼`) across numeric amounts, dates, or textual entities.
- **Inline Bar Chart**: Built with pure CSS bars—zero external library or SVG overhead.
- **Source Badges**: Displays the underlying relational tables used (`finance_receivables_ledger`, `dim_projects`, `sales_contracts`, etc.).
- **Collapsible `<details>` SQL Section**: View the exact generated SQL query in clean monospace with a 1-click **Copy SQL** button.
- **Feedback & Follow-up Chips**: Thumbs up / Thumbs down buttons with instant toast feedback, plus clickable suggested follow-up questions that immediately branch into drilldown queries.

### 5. Error & Retry State
- **Test Query**: *"Show total internal marketing headcount budget variance for FY2021"*
- Triggers the automated error recovery loop:
  - `Attempt 1`: Searches schema coverage.
  - `Retrying (1/2)`: Checks historical archived tables.
  - `Retrying (2/2)`: Attempts semantic synonyms in business glossary.
- Ends with a friendly, plain-language explanation (no raw stack trace):
  - Informs the user that marketing headcount and pre-2023 payroll reside in Workday HRIS rather than the enterprise real estate data mart.
  - Provides actionable next steps.

### 6. Conversation History Sidebar
- Keeps track of all queries asked in the current session with timestamps.
- Clicking any history item smoothly scrolls the viewport directly to that interaction.
- Collapsible on mobile and tablet screens via the header hamburger toggle.
- **"New Query"** button resets the chat view back to the Idle state without losing session logs.

### 7. Observability Dashboard (`admin.html`)
- Directly accessible from the header link.
- Displays live KPI summary cards:
  - **Average Pipeline Latency** (e.g., `1.74s`)
  - **Query Success Rate** (e.g., `94.2%`)
  - **Total Queries Processed**
  - **Retries & Recovery Count**
  - **Schema Coverage** (`98 / 104 Tables`)
- Live **Query Traces Table** synchronized with user queries executed during the session.
- **"Inspect" Modal**: Shows execution duration, stages passed, tables accessed, and Layer 3 Security Guardrail checks (AST read-only enforcement, PII masking active, AST complexity score).

---

## 5. Connecting a Real Backend API

The agent interaction is completely isolated inside a single function in `mock-data.js`:

```javascript
window.askAgent(question, onProgress, options)
```

To replace the mock pipeline with a real backend agent:
1. Open `mock-data.js`.
2. Replace `askAgent()` with an `async fetch()` or WebSocket call to your API Gateway (e.g. `POST /api/v1/query`).
3. Stream the pipeline events (`understanding`, `retrieving`, `generating`, `validating`, `executing`) into `onProgress()`.
4. Resolve the returned JSON matching the schema `{ type, answer, table, chart, sources, sql, followUps }`.
