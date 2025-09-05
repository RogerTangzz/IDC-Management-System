# AGENT.md — Codex CLI 工作规则 / Agent Rules (IDC 运维系统)
**版本 / Version**: 1.0.0  
**目的 / Goal**: 让 Codex 在实现、重构与迁移任务时，先统一“读规则→做计划→出改动→补测试→自检→给指令”的标准流程，确保生成代码与业务/框架/质量规范一致。

> **来源 / Sources**  
> - 技术规范：`docs/CLAUDE.md`（RuoYi-Vue3 目录边界、API 模板、TS 迁移策略、Mock 开关）  
> - 质量规范：`docs/CODE-QUALITY.md`（质量五维度、评审清单、CI 门禁、指标阈值）  
> - 业务扩展：`docs/CLAUDE-IDC.md`（状态机、模块 API、索引/字典、数据权限）  
> - 需求底稿：`docs/IDC_系统开发功能业务逻辑.md`（模块字段/流程与页面清单）

---

## 0. 行为准则 / Behavior Charter (MUST)
1. **先读再写**：开始任何实现前，**必须**读取本文件与 4 份引用文档；若信息冲突，以 `CLAUDE.md` 为技术落地、`CLAUDE-IDC.md` 为业务落地的裁决基准。  
2. **对齐 RuoYi 规范**：HTTP 交互放在 `src/api/business/*`，页面在 `src/views/business/*`，状态在 `src/store/modules/*`，工具在 `src/utils/business/*`。**API 函数导出**、分页/排序参数适配 RuoYi（字段**驼峰→下划线**，方向 `asc/desc`）。  
3. **TypeScript 渐进迁移**：优先迁 `types/ → api/ → store/ → 复用组件 → 页面`；严禁大面积 `as any` 与 `@ts-ignore`。  
4. **登录与用户信息响应兼容**：`/login` 既可能返回顶层 `token`，也可能 `data.token`；`/getInfo` 既可能顶层 `user/roles`，也可能在 `data`。前端必须兼容解析。  
5. **工单/SLA/报表口径**：实现 `nearDue/overdue`、`summary/analytics`、`last_action/last_status_time` 等业务要求，并支持首页卡片和下钻。  
6. **数据权限**：**非管理员**仅能查看/操作与自己相关的工单；`start/complete/close` 仅被指派处理人可操作；`reopen` 权限单列。  
7. **Mock 策略**：以环境变量 `VITE_ENABLE_MOCK` 控制是否导入 Mock，仅在开发/特定测试场景开启，**生产禁用**。  
8. **质量门禁**：  
   - 全局基线：lines/functions/statements ≥ **60%**，branches ≥ **50%**；  
   - PR 差异覆盖率（变更文件）≥ **80%**；  
   - CI 通过 ESLint/Prettier、复杂度与安全审计（高危失败）。  
9. **错误处理与权限指令**：消息提示/确认统一走 `proxy.$modal`；字典/下载/日期范围使用 RuoYi 既定助手；权限指令 `v-hasPermi` 按 `business:{module}:{action}`。  
10. **不可做**：新建不必要的全局状态；绕开 API 层直连后端；随意新增返回结构；在视图里声明后端实体类型；一次性大迁移破坏可回归性。

> 以上 10 条硬约束出自本项目已有规范与扩展文档，请严格执行。  
> Technical sources encoded in: `CLAUDE.md` (RuoYi patterns, TS plan, Mock), `CODE-QUALITY.md` (CI gates), `CLAUDE-IDC.md` (domain invariants), `IDC_*` (feature lists).

---

## 1. 任务工作流 / Task Working Loop
**每个任务必须按以下步骤输出：**

**Step 1 — 摘要与影响域**  
- 用 5-8 行说明需求/缺陷与影响模块（api/store/view/utils/types/router/permission）。  
- 标注**数据契约变化**，是否涉及 `login/getInfo` 兼容、分页/排序字段映射、或报表口径。

**Step 2 — 方案草图**  
- 目录与文件清单（新增/修改/删除）；  
- API 变更（RuoYi 函数导出范式）；  
- TS 类型增改位置（`src/types/api/*`/`domain/*`/`dto/*`）；  
- 权限点与路由；  
- Mock 需求与 `VITE_ENABLE_MOCK` 设置。

**Step 3 — 补丁与代码**  
- 遵循 `src/` 目录边界与命名规范；  
- 列表排序：`prop(order)` → `field_under_score` + `asc/desc`；  
- 登录兼容：`token = raw.token ?? raw.data?.token`；`getInfo` 顶层/包裹双解析；  
- 工单：写入/展示 `last_action/last_status_time`；实现 `nearDue/overdue` 列表；`summary/analytics` 报表组件与导出；  
- 权限：精确到 `business:module:action`，按钮与路由均校验。

**Step 4 — 测试**  
- Vitest 单测：核心逻辑与异常分支必测；  
- 覆盖率：全局达基线，变更文件覆盖 ≥80%；  
- Mock：仅必要用例启用，默认对接真实类型定义。

**Step 5 — 自检清单（DoD）**  
- ✅ ESLint/Prettier 通过；✅ `npx tsc --noEmit` 0 错；  
- ✅ 覆盖率阈值达标；✅ 权限与路由可用；  
- ✅ 报表口径与近/逾期逻辑正确；  
- ✅ 中文界面文案/字典对齐业务；  
- ✅ 更新/追加文档（变更日志与使用说明）。

**Step 6 — 输出**  
- **变更摘要**（要点列表）；  
- **命令**：如何运行/测试（含 Mock 开关）；  
- **后续风险**与**回滚点**。

---

## 2. 放置与命名 / Placement & Naming
- **API** → `src/api/business/{module}.(ts|js)`（函数导出：list/get/add/update/del/export + 特殊动作）  
- **视图** → `src/views/business/{module}/`（`index.vue`/`detail.vue`/`form.vue`）  
- **状态** → `src/store/modules/{domain}.(ts|js)`（Composition 优先）  
- **工具** → `src/utils/business/{service}.(ts|js)`（含服务管理器）  
- **类型** → `src/types/{api|domain|dto|shim}`（杜绝在视图内声明后端返回结构）  
- **命名**：组件 `PascalCase`；模块 `camelCase`；业务页面 `index/detail/form`；常量 `UPPER_SNAKE_CASE`。

---

## 3. RuoYi API 范式 / RuoYi API Pattern (CR/UD & Specials)
- **CRUD 模板**：`list/get/add/update/del/export` 一律函数导出；分页/排序经 `params` 传递；  
- **特殊动作**（示例）：`assignTickets`、`start/complete/close/reopen`（工单）；`generateTickets`（巡检）；`approve/submit/reject/execute`（维保）。  
- **排序适配**：前端 `prop` 驼峰 → 后端 `under_score`；`order` → `asc/desc`。  
- **登录链路**：兼容两类响应字段；缺 `token` 必抛错。

---

## 4. 业务约束 / Domain Invariants (必须满足)
- **工单流转**：`pending → assigned → processing → completed → closed`，支持 `reopen`；记录 `last_action/last_status_time`；  
- **SLA/超时**：按优先级默认时限；支持 `nearDue`（警戒窗口）与 `overdue`（逾期）；首页卡片与报表一致；  
- **巡检联动**：异常可一键生成工单，标题与优先级按规则；  
- **数据权限**：非管理员仅查看/操作与己相关工单；按钮/接口双重校验；  
- **字典/索引**：`ticket_action` 含 `sla_warn/sla_overdue`；建议为状态/截止时间/指派/最近状态变更等字段建索引；  
- **维保**：审批流/执行流与计划复制/版本递增逻辑。

> 本节口径由 `CLAUDE-IDC.md` 与需求底稿统一落地；若画面与统计口径冲突，以此为准。

---

## 5. TypeScript 迁移与构建 / TS Migration & Build
- **优先级**：`types → api → store → 复用组件 → 视图`；保持“最小闭环”迁移粒度；  
- **声明位置**：`types/api/*.ts` 存放 `ApiResult/PageResult/DTO/枚举`；  
- **构建检查**：`npx tsc --noEmit`、`npm run lint`、`npm run test`；  
- **Mock 开关**：`VITE_ENABLE_MOCK=true|false`，生产/常规单测默认 `false`。

---

## 6. 质量与 CI / Quality & CI Gates
- **维度**：清晰/健壮/扩展/高效/美观（见质量指南）；  
- **门禁**：  
  - 覆盖率全局 ≥60%（分支 ≥50%），**变更文件 ≥80%**；  
  - ESLint 复杂度/参数个数/函数长度门禁；  
  - 安全审计（高危失败）；  
- **评审清单**：功能正确/无明显 Bug/安全/错误处理/测试/文档为 MUST；命名/风格/性能/重复度 SHOULD；设计模式等 NICE-TO-HAVE。

---

## 7. 交付模板 / Delivery Template（让 Codex 直接按此格式回答）
**Plan**  
- 概要与影响域（模块/类型/接口/权限/路由/报表口径）  
- 目录与文件改动清单

**Patch (Unified Diff)**  
- 每个文件的最小变更集

**Tests**  
- 用例列表与断言重点（含异常/边界）

**Run**  
- 本地验证命令（含 `VITE_ENABLE_MOCK` 说明）

**Docs**  
- 哪些文档已更新（或为何不需要）

**Risks & Rollback**  
- 潜在影响与快速回退点

---

## 8. 常见陷阱 / Pitfalls
- 忽略排序字段下划线映射；  
- 在视图里声明/推测后端实体；  
- 大面积 `@ts-ignore`；  
- 用 Mock 替代真实类型导致线上差异；  
- 登录/用户信息响应未做双结构兼容；  
- 报表统计与列表口径不一致。

---

## 9. 首次加载自检 / First-Load Self Check
启动后请先回答：  
- 你已阅读并理解本 `AGENT.md` 与 4 份规范；  
- 列出你将强制执行的 10 条规则要点；  
- 说明你将如何在实现中落实 nearDue/overdue、登录兼容与差异覆盖率门禁。

