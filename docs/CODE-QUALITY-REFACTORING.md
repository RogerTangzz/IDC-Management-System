# 质量门禁（重构补充）

## 1. 覆盖率门槛
- 见 `docs/重构文档/覆盖率标准.md`（Ticket 视图 90/85/90/90 等）

## 2. 工具与脚本
- ticket-only 配置：`frontend/vitest.ticket.config.ts`
- 覆盖率校验：`frontend/scripts/coverage-check.mjs`

## 3. 审查清单
- 是否受 FeatureFlags 保护、可回退
- 是否遵循 Adapter→Domain→Service→API 单向依赖
- 是否具备失败兜底与错误提示
- 是否具备独立可测用例

