# IDC Management Testing Guide

This guide provides a practical checklist and smoke tests for Tickets, SLA, and Messages.

Prerequisites
- Backend running locally at `http://localhost:8080` (adjust `baseUrl` if different).
- A user with permissions:
  - `business:ticket:list`, `business:ticket:report`
  - `business:message:list`, `business:message:read`
  - `system:config:query`, `system:config:edit`

Postman Collection
- Import `test/postman/IDC-Management.postman_collection.json` and `test/postman/Local.postman_environment.json`.
- Set `token` variable manually from an authenticated session (Authorization: Bearer <token>), or run the optional Login request if captcha is disabled.

Smoke Test Checklist
1) Ticket list and filters
   - GET `/business/ticket/list?pageNum=1&pageSize=10` returns 200 and page structure `{ total, rows }`.
   - Verify sorting/filters in UI (prop camelCase -> snake_case; order -> asc/desc) and date range.

2) Overdue and NearDue
   - GET `/business/ticket/overdue?pageNum=1&pageSize=10` returns overdue items only.
   - GET `/business/ticket/nearDue?hours=2&pageNum=1&pageSize=10` returns items due within 2h.
   - On Home, validate `overdue` and `nearDue` numbers align with above.

3) Report APIs
   - GET `/business/ticket/report/summary` returns `byStatus`, `byPriority`, `todayNew`, `todayCompleted`, `overdue`, `nearDue`.
   - GET `/business/ticket/report/analytics` returns `duration` buckets and `sla` with `timeoutRate`.
   - GET `/business/ticket/report/trend` returns `created` and `completed` arrays with `d` and `v`.
   - UI report page renders bar, pie, and trend without errors; export endpoint returns an `.xlsx` file.

4) SLA configuration
   - GET `/system/sla` returns current values including `warnBeforeHours`.
   - PUT `/system/sla` with updated values (e.g., `warnBeforeHours=3`) returns success; GET reflects new values.
   - Verify NearDue endpoint defaults to new hours when `hours` query omitted.

5) Message center
   - GET `/business/message/countUnread` returns a number; Home shows the same under "未读消息".
   - GET `/business/message/unread` returns page result; capture `msgId`.
   - POST `/business/message/read/{msgId}` returns success; unread count decreases.
   - POST `/business/message/readAll` returns success; unread count becomes 0.
   - GET `/business/message/list?readFlag=ALL&pageNum=1&pageSize=10` lists both read and unread.

6) Scheduling and logs (manual)
   - Ensure `@EnableScheduling` present (it is). Observe logs for:
     - `SlaReminderTask: warn=..., overdue=...`
     - `TicketEscalationTask 升级 ... 条工单为 urgent`
   - Confirm relevant `BizTicketLog` entries are created for `sla_warn` and `sla_overdue`.

Edge Cases
- State transitions: ensure illegal transitions are rejected and logged appropriately.
- Permissions: try requests without Authorization header or with insufficient perms; expect 401/403.
- Idempotency: running readAll multiple times should be safe; scheduled tasks should not duplicate daily logs.

Notes
- If captcha is enabled, obtain the token from the UI login and set it into the Postman `token` variable.
- Timezone: ensure backend uses consistent time semantics; UI displays local time.

