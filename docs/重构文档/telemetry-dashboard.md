# Telemetry 看板与告警配置（模板模块）

## 事件模型
- 事件：dialog_open / submit / cancel / validate_false / success / error / busy / abort / flag_switched / enter_press
- 公共字段：
  - ts：ISO 时间戳（系统注入）
  - scene：'ticket_template'
  - version：'v2'
  - env：'dev'|'stage'|'prod'（由 setTelemetryContext 注入）
  - userId / roles / flags（由 user.getInfo() 注入）
- 载荷拓展：
  - type：'add'|'update'（submit/success/error/validate_false）
  - durationMs：提交耗时（success/error）
  - errorCode / errorMessage（error）
  - firstInvalidField（validate_false）
  - isReentry / isAborted（busy/abort/cancel）

## Provider 注入
- Console（本地/Stage 调试）：`src/main.js` 自动注入 `ConsoleTelemetry`
- Sentry（示例）：
  - 初始化 Sentry 后，设置 `VITE_SENTRY_DSN` 环境，并确保 `window.Sentry` 可用；
  - `src/main.js` 将优先注入 `createSentryProvider(DSN)`；
  - 若无 SDK，可在 `src/infra/telemetry.providers.ts` 上扩展自有 Provider。

## 看板建议（Sentry 示例）
- 成功率：`count(success) / count(submit)` 分段（env, type, 7d）
- 错误率：`count(error) / count(submit)` 分段（env, type, 7d; 按 errorCode topN）
- 平均耗时：`avg(durationMs where event in [success,error])`（env, type, 7d）
- P95 耗时：`p95(durationMs)`（env, type, 7d）
- 取消/重入：`count(cancel) / count(submit)`、`count(busy)`（env, 7d）
- 首错字段：`top(firstInvalidField where event=validate_false)`（env, 7d）

## 告警阈值（建议）
- 错误率 > 1%（持续 30 分钟，env=prod）→ 告警 + 触发回滚预案
- 成功率 < 98.5%（持续 30 分钟，env=prod）→ 告警
- 平均耗时 > 1500ms 且 P95 > 3000ms（持续 30 分钟，env=prod）→ 告警
- busy 异常：`count(busy) / count(submit) > 2%`（env=prod）→ 告警（提示防抖/并发重入异常）

## 回滚联动
- 触发策略：
  - 人工执行 `applySafeRollback()`（FlagPresets.ts）
  - 或平台告警 → 自动调用回滚 API（需后端支持）
- 回滚验证：模板对话框“打开→校验失败→取消”轻量 smoke 通过；错误日志无新增

## 数据出口（自研/ELK/ClickHouse 示例）
- 存储字段：event, ts, env, scene, version, userId, roles, flagsSnapshot, type, durationMs, errorCode, errorMessage, firstInvalidField, isReentry, isAborted
- 建表建议：ts 列分区 + env 分桶 + event/type 维度列索引；
- 查询样例（伪 SQL）：
  - 成功率：`select env, type, countIf(event='success')/countIf(event in ('submit','success','error')) as success_rate from telemetry where scene='ticket_template' and ts>=now()-7d group by env,type;`
  - P95 耗时：`select env, type, quantile(0.95)(durationMs) from telemetry where event in ('success','error') and ts>=now()-7d group by env,type;`

