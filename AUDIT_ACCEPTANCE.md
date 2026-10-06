# Aria UI audit acceptance gates

This checklist separates implementation from acceptance. A feature is not marked accepted only because its control or label exists.

## Status meanings

- **Implemented:** code and fixture behavior exist.
- **Verified:** the scenario was executed and evidence was recorded.
- **Accepted:** the assigned reviewer approved the verified behavior.
- **Pending:** evidence or reviewer approval is still required.

## G1 — Visual concept and information architecture

Status: **Pending review**

- [ ] Compare two high-fidelity concepts using the same Home and Result scenarios.
- [ ] Record the selected visual direction and reviewer.
- [ ] Confirm Ask, Saved Insights, Data Guide, Evidence, and Admin/Research placement.
- [ ] Confirm that business views do not expose SQL/schema/pipeline details by default.

Evidence to attach: concept screenshots, decision note, reviewer and date.

## G2 — Result and state review

Status: **Pending browser verification**

Verify these six successful-result patterns:

- [ ] KPI
- [ ] Ranking
- [ ] Trend
- [ ] Record list
- [ ] Entity detail
- [ ] Comparison

Verify these decision states:

- [ ] Clarification or interpretation confirmation
- [ ] Access denied/restricted
- [ ] No matching records
- [ ] Unsupported question
- [ ] Service error
- [ ] Partial result
- [ ] Cancelled

For every scenario, capture question, applied scope, result/state, data freshness, available actions, viewport, and screenshot.

## G3 — Clickable task scripts

Status: **Pending execution**

- [ ] Ask a supported question, confirm interpretation, and inspect Evidence.
- [ ] Edit scope and confirm that both displayed question and answer use the new scope.
- [ ] Run a follow-up and verify that the previous period/domain are inherited but remain editable before Ask.
- [ ] Save a query, rename it, open it, refresh it, save a snapshot, and remove it.
- [ ] Submit feedback on two answers in one conversation; edit one response and verify the other is unchanged.
- [ ] Filter a table and export both filtered rows and all rows with scope/freshness metadata.
- [ ] Use only the keyboard for onboarding, Ask, clarification, Evidence, Save, modal close, and focus restoration.

Evidence to attach: pass/fail, screen recording or screenshots, browser, viewport, tester, and date.

## G4 — Representative usability review

Status: **Pending research**

- [ ] Recruit 3–5 representative users and record persona/context.
- [ ] Test five core tasks without coaching.
- [ ] Record completion, time, observed issue, severity, and quote/paraphrased feedback.
- [ ] Target at least 80% task completion, explicitly described as a small-sample prototype result rather than a statistical conclusion.
- [ ] Record follow-up changes and reviewer sign-off.

## Required responsive viewports

- [ ] 1440px desktop
- [ ] 1280px laptop
- [ ] 768px tablet
- [ ] 390px mobile

At each viewport verify no page-level horizontal scrolling, no clipped modal, readable table overflow, visible focus, and unobstructed actions. Interactive controls should target a minimum height of 44px.

## Clarification product decision

The current clarification modal intentionally uses predefined options and number-key selection. Free-text clarification was removed by the latest product decision. If the original R2-16 acceptance still requires “type another answer,” record this as an accepted deviation or reopen that requirement.
