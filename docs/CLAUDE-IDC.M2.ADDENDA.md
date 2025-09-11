# CLAUDE-IDC · M2 Addenda (2025-09-06)

This addendum complements the existing `CLAUDE-IDC.md` without changing its encoding.

## Detail Page (Approval/Execution)
- Review dialog (approve/reject + comment); refresh timelines after submit
- Start/Complete flow; Complete supports attachments via `FileUpload`
- Timelines unified via `getPlanLogs(planId, { type: 'approval'|'execution' })`
- Empty-state and error-with-retry messages (English placeholders)

## Backend Alignment
- `GET /business/maintenance/plan/{id}/logs?type=approval|execution|all` — unified source for timelines (chronological order)
- `GET /business/maintenance/execution/list` — planId filter, data-permission, pagination
- `GET /business/maintenance/list` — sort whitelist + `mineOnly/selfOnly` alias

## Frontend API Summary
- `getPlanLogs`, `approvePlan`, `rejectPlan`, `startExecution`, `completeExecution`

## Tests (Vitest)
- `src/__tests__/maintenance.detail.flow.test.ts` — start/complete + attachments
- `src/__tests__/maintenance.detail.approve.test.ts` — approve/reject with comment

## Encoding Policy
- Do not re-encode legacy files. New files use UTF-8. This addendum is UTF-8 by design.

