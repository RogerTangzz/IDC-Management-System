# IDC-Management-System 文档索引（Docs Index）

目的：统一导航规范、契约、质量指南、重构计划与进度，明确各文档职责与更新策略。

## 重构概览（2025-01）
- 当前状态：前端 Ticket 域进行 P0 基线搭建（FeatureFlags + Adapter + Domain/Service）
- 重构指南：docs/REFACTORING.md
- 进度追踪：docs/refactoring-progress.md

## 核心文档
- 业务规范：`DC系统-业务与逻辑规范 V2.0.md`（端到端蓝图、KPIs、查询与错误处理）
- 前端规范：`CLAUDE.md`（项目结构、API 约定、TS 迁移策略、可视化）
- IDC 扩展：`CLAUDE-IDC.md`（业务到 RuoYi 的映射、mineOnly、报表下钻、维保导入）
- 代码质量：`CODE-QUALITY.md`（可读性/可维护性/可测试性/性能/安全）
- 重构门槛：`重构文档/覆盖率标准.md`（各分组覆盖率目标与 CI 门禁）
 - 重构补充：`CLAUDE-REFACTORING.md`、`CLAUDE-IDC-REFACTORING.md`、`agent-REFACTORING.md`、`CODE-QUALITY-REFACTORING.md`

## 快速开始
- 后端：8088（固定）
- 前端：`cd frontend && pnpm i && pnpm dev`
- Ticket-only 测试：`pnpm dlx vitest run -c vitest.ticket.config.ts --coverage`

## 变更与约定
- 新旧路径通过 `FeatureFlags` 受控（默认：dev/stage 开启 `USE_NEW_TICKET`，prod 关闭）。
- 统一适配层 `src/adapters/TicketAdapter.ts`，视图不直接依赖底层 API。
- 允许一键回滚：预留关闭开关的回退指引（见 REFACTORING.md）。
