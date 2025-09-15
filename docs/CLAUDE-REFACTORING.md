# CLAUDE 重构补充（代码规范）

## 1. 目录与依赖
- 视图 → Adapter → Domain → Service → API 单向依赖
- 禁止视图直接依赖 Service/API
- Domain 不做 IO；Service 不做业务判断

## 2. Feature Flags
- 新增功能必须由 `FeatureFlags` 守护，可随时回退
- 预设：dev/stage 打开、prod 关闭；快照与一键回滚参考 REFACTORING.md

## 3. 测试
- 单元：domain/service 独立可测；adapter 路径切换可测
- 视图：优先 Ticket-only，逐步扩展到其他域
- 覆盖率：遵循 `docs/重构文档/覆盖率标准.md`

## 4. 代码风格
- 明确边界：模块只暴露必要 API；避免跨边界导出内部实现
- 错误处理：兜底提示与 graceful degrade，避免未捕获异常
- 类型：TS First，外部接口定义在 `src/types`，避免 any 链式穿透

