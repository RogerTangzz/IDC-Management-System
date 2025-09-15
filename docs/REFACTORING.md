# 重构指南（Refactoring Guide）

本指南定义 P0–P5 的重构路径、开关策略与回滚方式，确保在可控范围内平滑切换至新架构。

## 阶段
- P0：基线搭建（FeatureFlags + Adapter + Domain/Service + ticket-only 测试与覆盖率脚本）
- P1：Ticket 列表（index.vue）抽象/回退/监听收敛，函数≥85%、语句≥90
- P2：模板（template.vue）提交状态机（validate false/add/update）与失败/取消链路
- P3：详情（detail.vue）生命周期与日志加载 fallback
- P4：报表（report.vue）导出失败兜底、趋势健壮性
- P5：目录归一与预检（移除多重嵌套目录、接入 preflight）

## 开关与回滚
- 主开关：`USE_NEW_TICKET`（dev/stage 默认开，prod 默认关）
- 使用示例：
```ts
import FeatureFlags from '@/config/FeatureFlags'
import { TicketAdapter } from '@/adapters/TicketAdapter'

export async function createTicket(data:any){
  return FeatureFlags.isEnabled('USE_NEW_TICKET')
    ? TicketAdapter.create(data)
    : (await import('@/api/business/ticket')).addTicket(data)
}
```
- 回滚：关闭 `USE_NEW_TICKET` 后刷新页面即可回退到旧路径。

## 测试与覆盖率
- ticket-only：`vitest.ticket.config.ts` 单线程降低 OOM
- 覆盖率门槛：见 `docs/重构文档/覆盖率标准.md`
- CI 建议：`vitest --coverage` → `scripts/coverage-check.mjs`

## 约束
- 视图不直接依赖 API，统一经 `TicketAdapter`
- 领域规则进入 `TicketDomain`，服务访问经 `TicketService`
- 所有新增代码需具备可回退能力（FeatureFlags 保护）

