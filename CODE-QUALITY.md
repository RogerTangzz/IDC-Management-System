# CODE-QUALITY.md — 代码质量与工程规范（对齐 IDC 业务规范 V2.0）

版本: 2.0.0  更新时间: 2025-09-03

## 基本原则
- 以“可维护、可回归”为最高优先；小步提交、语义清晰。
- 后端遵循分层：Controller 轻逻辑 → Service 事务/校验/编排 → Mapper SQL。
- 前端遵循单一职责：API 层统一封装、页面逻辑与展示解耦、逐步 TypeScript 化。

## 提交规范（Conventional Commits）
- feat: 新功能  fix: 修复  refactor: 重构  docs: 文档  chore: 构建/脚手架
- scope 推荐模块前缀：ticket/inspection/maintenance/security/sql/ui
  
示例：`feat(ticket): add nearDue summary and list entry`

## 后端规范（Java + SpringBoot + MyBatis）
- Controller：
  - 只做参数接收、权限校验、组装分页与轻量转换；禁止重复 update。
  - 受限动作必须结合 `SecurityUtils.isAdmin()` 与“与自己相关”校验。
- Service：
  - 统一承接业务动作（assign/start/complete/close/reopen），加 `@Transactional(rollbackFor=Exception.class)`。
  - 变更实体时一次性设置 `lastAction/lastStatusTime`，再 `update`，然后写 BizTicketLog。
- Mapper / XML：
  - 动态 SQL 使用 `<where>` 与 `<trim>`，避免硬编码 `and` 前导。
  - 模糊查询统一用 `like concat('%', #{kw}, '%')`。
  - 排序：仅允许白名单字段（前端传下划线字段名 + asc/desc）。
- SQL 与迁移：
  - 所有 `ALTER` 使用 `IF NOT EXISTS` 以保证幂等。
  - 主键/唯一键/常用筛选字段必须加索引：`status/deadline/assignee_id/create_time/last_status_time`。
- 调度任务：
  - 启用 `@EnableScheduling`；任务异常必须 catch + 记录日志；避免长事务。
- 安全：
  - 禁止全局放行业务接口；使用 `@PreAuthorize` 与后端数据权限双保险。
  - 过滤参数注入风险（MyBatis 动态 SQL 字段名不可直传）。

## 前端规范（Vue3 + Element Plus）
- API 层：
  - 全部放在 `src/api/business/`；函数语义化：`listX/getX/addX/updateX/delX/...`。
  - 字段命名与后端保持一致（如 `reporterName/assigneeName/completionTime`）。
- 视图与交互：
  - 列表排序：`prop` 驼峰转下划线、`order` 转 `asc/desc` 传后端。
  - 表单重置使用 `proxy.resetForm`；字典用 `proxy.useDict`。
  - 消息/确认统一使用 `proxy.$modal`。
- TypeScript：
  - 优先迁移 API/Store，保持 API 返回类型；视图后迁移。
  - 类型定义集中在 `src/types/api/`；禁止在视图内定义接口结构。

## 日志与审计
- 业务动作写入表 `biz_ticket_log`：`action/old_status/new_status/operator/remark/create_time`。
- SLA 提醒：使用 `sla_warn/sla_overdue` action，使用“今日去重”避免重复日志。

## 性能与可观测性
- 分页查询必须 `startPage()`；Mapper 不允许无分页的大表全量查询。
- 组合索引按常用过滤顺序设计：如 `(status, assignee_id)`、`(deadline)`、`(create_time)`。
- 慢 SQL 统计开启（Druid：log-slow-sql=true，threshold=1000ms）。

## 安全与数据权限
- 非管理员只能查看/操作与自己相关的数据：assignee_id=自己 或 reporter_id=自己 或 create_by=自己。
- 在 Controller 注入 `query.params.selfOnly/userId/username`，Mapper 动态 where 过滤。
- 敏感操作必须 `@PreAuthorize` 与服务层二次校验并记录日志。

## 测试与发布
- 本地验证：接口 401/403、分页/排序/过滤、常见边界（空字段/超长/非法流转）。
- 数据脚本：先在测试库执行验证幂等，再发布到生产。
- 监控：观察定时任务日志（SLA 提醒/升级）与数据库相关索引命中情况。

