# 阶段B · M2 对接报告（2025-09-06）

## 一、摘要
- 维保计划详情页已完成“审批/执行”闭环能力：支持审批（通过/驳回+意见）、开始执行、完成执行（含附件）。
- 时间线数据源统一：前端统一通过 `getPlanLogs(planId, { type })` 获取“审批/执行”时间线，支持空态与错误重试。
- 后端新增执行列表接口并对列表接口加强安全：维保列表支持“排序白名单 + 数据权限别名（mineOnly/selfOnly）”；新增执行记录列表接口。
- 新增单测覆盖关键流转：审批提交流程、执行开始与完成（含附件）。

## 二、范围与目标
- 范围：维保（maintenance）模块详情页联动、接口统一与安全策略、测试与质量门禁。
- 目标：对齐 CLAUDE/CLAUDE-IDC 规范，保证前后端契约一致、可观测性与可回归性达标，形成可交接的 M2 基线。

## 三、前端改动（文件与要点）
- 文件：frontend/src/views/business/maintenance/plan/detail.vue:1
  - 审批：新增 Review 弹窗（Approve/Reject + Comment）；`onSubmitApproval()` 调用 `approvePlan/rejectPlan`，成功后刷新时间线与状态。
  - 执行：保留 Start/Complete；Complete 对话框支持 `FileUpload` 附件，`onComplete()` 调用 `completeExecution(planId, { result, attachments })`。
  - 时间线：统一通过 `getPlanLogs(planId, { type: 'approval'|'execution' })` 获取；为空显示英文空态；加载失败显示错误提示与“Retry”。
  - 可见状态：`canReview`（pending 可审）、`canStart`（approved 且 pending 执行）、`canComplete`（executing）。
- 文件：frontend/src/api/business/maintenance.js:1
  - 提供 `getPlanLogs(planId, { type })`（详情页时间线统一使用）。
  - `getApprovalHistory` 兼容传递 `type=approval`（建议逐步统一到 `getPlanLogs`）。
- 类型：
  - frontend/src/types/domain/maintenance.ts:1（Plan/ApprovalLog/ExecutionLog 与状态别名）。
  - frontend/src/types/api/maintenance.ts:1（ApiResult/PageResult/ImportResult）。

## 四、后端接口与安全策略
- 列表（带数据权限与排序白名单）
  - 路径：`GET /business/maintenance/list`
  - 数据权限：当请求参数包含 `mineOnly=true` 或别名 `selfOnly=true` 且用户非管理员时，仅返回“当前用户创建”的计划（controller 注入，mapper 兜底）。
  - 排序白名单：仅允许 `planId,title,version,approvalStatus,executionStatus,lastStatusTime,createTime`（驼峰转下划线后拼接，`SqlUtil.escapeOrderBySql` 过滤）。
  - 实现：backend/ruoyi-admin/src/main/java/com/ruoyi/web/controller/business/BizMaintenanceController.java:20
- 执行列表（用于详情或其他视图）
  - 路径：`GET /business/maintenance/execution/list`
  - 能力：支持 `planId` 过滤、分页 `startPage()`、mineOnly/selfOnly 数据权限。
  - 实现：同上控制器文件（新增方法）。
- 时间线（统一接口）
  - 路径：`GET /business/maintenance/plan/{id}/logs?type=approval|execution|all`
  - 能力：返回审批/执行/合并的时间线数据，按时间升序；审批由主表字段推导，执行来自执行记录表。
  - 实现：同上控制器文件（history 方法）。

## 五、环境与配置
- 数据权限别名：`VITE_API_MINE_ONLY_PARAM`（默认 `mineOnly`；若后端期望 `selfOnly`，可配置并在灰度期双写）。
- 配置示例：frontend/.env.example:1（已包含注释说明）。

## 六、测试与验证
- 单元/集成测试（Vitest）
  - 新增：
    - frontend/src/__tests__/maintenance.detail.flow.test.ts:1（执行开始/完成含附件、执行时间线）
    - frontend/src/__tests__/maintenance.detail.approve.test.ts:1（审批通过/驳回 + 意见）
  - 运行：
    - `cd frontend && npm run test:run -- -t "maintenance plan detail"`
    - 门禁建议：`npm run type-check` + 目标用例（detail.* 与 maintenance.*）。
- 手工验收（建议步骤）
  - 以“非管理员”登录，进入维保计划详情：
    - 当 `approvalStatus=pending`：显示 Review 按钮；提交通过/驳回后刷新时间线与状态。
    - 当 `approvalStatus=approved` 且 `executionStatus=pending`：显示 Start；确认后刷新详情。
    - 当 `executionStatus=executing`：显示 Complete；填写结果与附件后提交并刷新时间线。
  - 时间线错误兜底：断网或接口失败时，显示错误告警 + Retry 按钮；重试后恢复。

## 七、已知问题（不在本次 M2 范围）
- Sidebar 相关的用例在 Vitest 中解析路径失败（legacy 问题）；建议在 CI 中临时过滤或后续单独修复。
- ticket/index.vue 存在编码残片导致 SFC 解析告警；遵循“仅片段手工修复，不做仓库级重新编码”。

## 八、下一步计划（建议）
- 审批日志表（可选）：持久化多次审批历史，增强审计与统计；已在契约文档追加“可选扩展”方案（表结构与写入时机）。
- 维保报表：对齐工单报表的下钻能力（近到期/逾期 → 维保列表）；完善导出能力与口径。
- CI 稳定性：对 Sidebar 路径与编码残片相关用例进行 targeted fix 或临时过滤，确保主线变更不受干扰。

## 九、对接问题清单（待确认）
- 审批状态机：节点与合法流转（是否存在驳回后再次提交的二次流转），是否需要补充“撤回/重提”。
- 数据权限口径：维保“我的数据”是否仅限 `createBy`，是否需要扩展 `ownerId` 或部门维度。
- 附件存储形态：详情页完成执行上传的附件，后端采用 URL 还是文件ID（建议：RuoYi 上传模块 URL）。
- 报表范围：M3 是否纳入维保报表的下钻/导出，口径与接口定义。

## 十、验收清单（Checklist）
- 列表：非管理员携带 `mineOnly/selfOnly` 时，仅返回本用户范围数据；排序仅接受白名单列。
- 详情：审批/执行操作后，时间线与状态按预期更新；空态与错误时行为一致、可重试。
- 契约：`/business/maintenance/plan/{id}/logs?type=...` 返回数据满足前端渲染需求（时间升序、字段齐全）。
- 测试：本轮新增用例通过；门禁包含类型检查与目标用例。

## 附录A：关键文件
- 前端页面：frontend/src/views/business/maintenance/plan/detail.vue:1
- 前端 API：frontend/src/api/business/maintenance.js:1
- 前端类型：frontend/src/types/domain/maintenance.ts:1、frontend/src/types/api/maintenance.ts:1
- 后端控制器：backend/ruoyi-admin/src/main/java/com/ruoyi/web/controller/business/BizMaintenanceController.java:20
- 契约文档：docs/backend-contracts/maintenance-approval.md:1、IDC-Management-System/docs/backend-contracts/maintenance-approval.md:1
- 质量规范：docs/CODE-QUALITY.md:1
- 补充说明：docs/CLAUDE-IDC.M2.ADDENDA.md:1、docs/CLAUDE.md:1

## 附录B：接口示例（简）
- 查询时间线：
  - `GET /business/maintenance/plan/123/logs?type=approval`
  - `GET /business/maintenance/plan/123/logs?type=execution`
- 执行列表（按计划）：
  - `GET /business/maintenance/execution/list?planId=123&pageNum=1&pageSize=10`
- 维保列表（数据权限 + 白名单排序）：
  - `GET /business/maintenance/list?mineOnly=true&orderByColumn=lastStatusTime&isAsc=desc&pageNum=1&pageSize=10`
