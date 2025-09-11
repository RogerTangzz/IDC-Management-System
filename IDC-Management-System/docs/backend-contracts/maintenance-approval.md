# Maintenance Approval & Execution API Contract (Stage B · M1)

Version: 0.9 (2025-09-06)
Scope: Maintenance Plan approval/execution workflow, import feedback, and data-permission alignment.
Applies to: RuoYi-Boot backend, RuoYi-Vue3 frontend

## 1. Goal & Principles

- Align maintenance plan lifecycle and permissions with project-wide conventions (CLAUDE / CLAUDE-IDC / DC V2.0).
- Provide clear, stable APIs and payloads for frontend integration and automated tests.
- Enforce data-permission and sorting safety at controller and mapper (double-guard).
- Avoid encoding changes to existing files; this spec is additive.

## 2. Status Machine

Plan status fields (two dimensions):
- approvalStatus: `draft` | `pending` | `approved` | `rejected`
- executionStatus: `idle` | `executing` | `completed`

Allowed transitions:
- draft → pending (submit)
- pending → approved | rejected
- approved → executing (start)
- executing → completed (complete)

Guard rails:
- Reject invalid transitions with `code=400` and friendly `msg`.
- Side-effects: write approval/execution logs, update `lastStatusTime` and `lastAction`.

## 3. Data Contract (DTOs)

### 3.1 Plan DTO (response)
```
{
  "planId": 123,
  "title": "V1 Floor 3 HVAC",
  "version": "V1.0",
  "floorId": "3F",
  "mopNo": "MOP-202509-001",
  "ownerId": 1001,
  "ownerName": "Alice",
  "approvalStatus": "pending",
  "executionStatus": "idle",
  "lastStatusTime": "2025-09-06 11:20:00",
  "lastAction": "submit",
  "createdBy": 1001,
  "createdTime": "2025-09-01 10:00:00",
  "updateTime": "2025-09-06 11:20:00"
}
```

### 3.2 Approval Log DTO
```
{
  "id": 555,
  "planId": 123,
  "operatorId": 1001,
  "operatorName": "Alice",
  "action": "submit" | "approve" | "reject",
  "remark": "...",
  "nextAssigneeId": 1002,
  "nextAssigneeName": "Bob",
  "time": "2025-09-06 11:20:00"
}
```

### 3.3 Execution Log DTO
```
{
  "executionId": 777,
  "planId": 123,
  "operatorId": 2001,
  "operatorName": "Charlie",
  "startTime": "2025-09-06 14:00:00",
  "completeTime": null,
  "result": null,
  "attachments": ["/profile/upload/..../a.jpg", "/profile/upload/.../b.pdf"]
}
```

## 4. REST Endpoints

All time formats are `yyyy-MM-dd HH:mm:ss` unless specified. All list endpoints return `TableDataInfo` (`{ code, rows, total }`). Non-list endpoints return `AjaxResult` (`{ code, msg, data }`).

### 4.1 Plan list
`GET /business/maintenance/plan/list`

Query params:
- keyword?: string (title/mopNo)
- approvalStatus?: `draft|pending|approved|rejected`
- executionStatus?: `idle|executing|completed`
- beginTime?: `yyyy-MM-dd`
- endTime?: `yyyy-MM-dd`
- orderByColumn?: one of [planId,title,version,approvalStatus,executionStatus,lastStatusTime,createdTime]
- isAsc?: `asc|desc`
- mineOnly or alias (see 5. Data-Permission)

Returns: `TableDataInfo<PlanDTO>`

### 4.2 Plan detail
`GET /business/maintenance/plan/{planId}` → `AjaxResult<PlanDTO>`

### 4.3 Submit (draft → pending)
`POST /business/maintenance/plan/{planId}/submit`

Body:
```
{
  "remark": "Ready for approval",
  "nextAssigneeId": 1002
}
```
Permission: `business:maintenance:submit`
Side-effects: add approval log (action=submit), set `approvalStatus=pending`, set `lastAction=submit`.

### 4.4 Approve / Reject
`POST /business/maintenance/plan/{planId}/approve`
`POST /business/maintenance/plan/{planId}/reject`

Body (approve):
```
{
  "remark": "OK",
  "nextAssigneeId": 2001
}
```
Body (reject):
```
{ "remark": "Need fix" }
```
Permission: `business:maintenance:approve`
Side-effects: add approval log (action=approve|reject), set `approvalStatus=approved|rejected`, update `lastAction`.

### 4.5 Start execution (approved → executing)
`POST /business/maintenance/execution/start`

Body:
```
{
  "planId": 123,
  "operatorId": 2001,
  "remark": "Start now"
}
```
Permission: `business:maintenance:execute`
Side-effects: create execution record with `startTime=now`, set `executionStatus=executing`, `lastAction=start`.

### 4.6 Complete execution (executing → completed)
`POST /business/maintenance/execution/complete`

Body:
```
{
  "planId": 123,
  "result": "All tasks done",
  "attachments": ["/profile/upload/.../a.jpg"]
}
```
Permission: `business:maintenance:execute`
Side-effects: set `completeTime=now`, store `result` and `attachments`, set `executionStatus=completed`, `lastAction=complete`.

### 4.7 Approval & execution logs (unified)
Preferred: `GET /business/maintenance/plan/{planId}/logs?type=approval|execution|all`

Query params: `type` filters log category. Returns a combined array in chronological order.
Frontend mapping: `getPlanLogs(planId, { type })` (used by detail timeline)

### 4.8 Approver candidates
`GET /business/maintenance/plan/{planId}/approvers`
Returns: `AjaxResult<Array<{ userId:number; nickName:string }>>`

### 4.9 Import & template & error report
- `POST /business/maintenance/plan/import` (multipart/form-data `file`)
  - Returns: `AjaxResult<{ total:number; success:number; failed:number; errors:Array<{row:number; message:string}>; taskId?:string }>`
- `GET /business/maintenance/plan/import/template` → Excel template (blob)
- `GET /business/maintenance/plan/import/errors?taskId=xxx` → Excel (blob) of failed rows

## 5. Data-Permission (mineOnly alias)

- Frontend injects a boolean parameter indicating “only my data”. Default key is `mineOnly`, but during backend alias migration (e.g., `selfOnly`) the frontend sends both (`mineOnly=true` and `selfOnly=true`).
- Backend controller MUST recognize both keys and normalize into a single flag for mapper to consume.
- Semantics for maintenance plan: “my data” = createdBy = currentUserId OR ownerId = currentUserId (configurable; default: createdBy).
- Controller also injects data-scope (dept/role) if required by org policy.

## 6. Sorting Whitelist & Safety

- `orderByColumn` MUST be validated against whitelist: `[planId,title,version,approvalStatus,executionStatus,lastStatusTime,createdTime]`.
- `isAsc` must be `asc|desc`.
- Mapper reads safe `params.orderBy` only after controller validation.

## 7. Permissions (RuoYi)

- List/Detail: `business:maintenance:list`
- Submit: `business:maintenance:submit`
- Approve/Reject: `business:maintenance:approve`
- Execute (start/complete): `business:maintenance:execute`
- Import/Template/Errors: `business:maintenance:import`
- Export (optional): `business:maintenance:export`

## 8. Minimal Backend Skeleton (signatures)

Controller `BizMaintenanceController` (package example: `com.ruoyi.web.controller.business`):
```java
@RestController
@RequestMapping("/business/maintenance")
public class BizMaintenanceController extends BaseController {
  @Autowired private IBizMaintenanceService maintenanceService;

  @GetMapping("/plan/list")
  public TableDataInfo list(BizPlanQuery query) { /* validate sort, inject data-perm, return */ }

  @GetMapping("/plan/{planId}")
  public AjaxResult getInfo(@PathVariable Long planId) { /* ... */ }

  @PostMapping("/plan/{planId}/submit")
  @PreAuthorize("@ss.hasPermi('business:maintenance:submit')")
  public AjaxResult submit(@PathVariable Long planId, @RequestBody SubmitDTO body) { /* ... */ }

  @PostMapping("/plan/{planId}/approve")
  @PreAuthorize("@ss.hasPermi('business:maintenance:approve')")
  public AjaxResult approve(@PathVariable Long planId, @RequestBody ApproveDTO body) { /* ... */ }

  @PostMapping("/plan/{planId}/reject")
  @PreAuthorize("@ss.hasPermi('business:maintenance:approve')")
  public AjaxResult reject(@PathVariable Long planId, @RequestBody RejectDTO body) { /* ... */ }

  @PostMapping("/execution/start")
  @PreAuthorize("@ss.hasPermi('business:maintenance:execute')")
  public AjaxResult start(@RequestBody StartExecDTO body) { /* ... */ }

  @PostMapping("/execution/complete")
  @PreAuthorize("@ss.hasPermi('business:maintenance:execute')")
  public AjaxResult complete(@RequestBody CompleteExecDTO body) { /* ... */ }

  @GetMapping("/plan/{planId}/logs")
  public TableDataInfo logs(@PathVariable Long planId, String type) { /* ... */ }

  @GetMapping("/plan/{planId}/approvers")
  public AjaxResult approvers(@PathVariable Long planId) { /* ... */ }
}
```

Service `IBizMaintenanceService` (package: `com.ruoyi.system.service` or `...business`):
```java
public interface IBizMaintenanceService {
  TableDataInfo selectPlanList(BizPlanQuery query);
  BizPlanDTO selectPlanById(Long planId);
  void submit(Long planId, SubmitDTO body, Long userId);
  void approve(Long planId, ApproveDTO body, Long userId);
  void reject(Long planId, RejectDTO body, Long userId);
  void start(StartExecDTO body, Long userId);
  void complete(CompleteExecDTO body, Long userId);
  TableDataInfo selectLogs(Long planId, String type);
  List<UserDTO> selectApprovers(Long planId);
}
```

Notes:
- Validate transitions in service; throw `ServiceException` with friendly messages.
- Write approval/execution logs atomically with status updates (transactional).
- Mapper should support filtering by `createdBy` or `ownerId` when `mineOnly`.

## 9. Frontend Mapping (for `frontend/src/api/business/maintenance.js`)

Functions to be provided/verified:
```js
export function listPlans(query) { /* GET /business/maintenance/plan/list */ }
export function getPlan(planId) { /* GET /business/maintenance/plan/{id} */ }
export function submitApproval(planId, data) { /* POST /plan/{id}/submit */ }
export function approvePlan(planId, data) { /* POST /plan/{id}/approve */ }
export function rejectPlan(planId, data) { /* POST /plan/{id}/reject */ }
export function startExecution(data) { /* POST /execution/start */ }
export function completeExecution(data) { /* POST /execution/complete */ }
export function getPlanLogs(planId, params) { /* GET /plan/{id}/logs?type=... */ }
export function getApprovers(planId) { /* GET /plan/{id}/approvers */ }
export function importMaintenance(file) { /* POST /plan/import */ }
export function downloadMaintenanceTemplate() { /* GET /plan/import/template */ }
export function downloadMaintenanceImportErrors(taskId) { /* GET /plan/import/errors?taskId=... */ }
```

TypeScript types can be placed under `frontend/src/types/api/maintenance.ts` and `frontend/src/types/domain/maintenance.ts`.

## 10. Validation & Acceptance

- Unit/Integration tests cover: approve/reject/start/complete (positive & invalid transitions), logs recorded, permissions enforced.
- Data-permission flag works for non-admin users (mineOnly or alias recognized) and is absent for admins.
- Sorting whitelist prevents SQL injection; mapper uses only validated `orderBy`.
- Import returns `{ total, success, failed, errors[], taskId? }`; error report download respects `taskId` when provided.

M2 addenda:
- Added `GET /business/maintenance/execution/list` for list views (planId filter, data-permission applied).
- Frontend detail page consumes `getPlanLogs(type=execution)` and `getApprovalHistory(type=approval)`.

## 11. Open Questions (to confirm)

1) Data-permission scope for maintenance: `createdBy` vs `ownerId` (default: `createdBy`).
2) Whether approver candidates depend on role/department or a configured workflow.
3) Attachment value type: file URLs vs file IDs (recommended: URLs from RuoYi upload module).
4) Whether export endpoints are required for Stage B (out-of-scope for this M1 unless requested).

## Optional: Approval Log Table (extension)

- Table: `biz_maintenance_approval_log`
  - Columns: `id (pk)`, `plan_id`, `operator_id`, `operator_name`, `action (submit|approve|reject)`, `remark`, `next_assignee_id`, `next_assignee_name`, `time (datetime)`
- Endpoints:
  - `GET /business/maintenance/plan/{id}/logs?type=approval` → read rows from this table
  - POST hooks on `submit/approve/reject` to insert a row (transactional with plan status update)
- Rationale: persist multi-step decisions beyond latest status fields; enables auditability & analytics.
