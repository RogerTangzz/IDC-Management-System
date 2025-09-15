# CLAUDE-IDC 重构补充（2025-01）

## 1. 架构切换与回滚
- 主开关：`USE_NEW_TICKET`（dev/stage 开启、prod 关闭）
- 适配/领域/服务：`src/adapters/TicketAdapter.ts` → `src/domain/ticket/TicketDomain.ts` → `src/services/ticket.service.ts`
- 回滚：关闭开关并刷新页面；必要时保留一键函数用于紧急回退（见 REFACTORING.md）

示例：
```ts
import FeatureFlags from '@/config/FeatureFlags'
import { TicketAdapter } from '@/adapters/TicketAdapter'

export async function submitTicket(data:any){
  return FeatureFlags.isEnabled('USE_NEW_TICKET')
    ? TicketAdapter.create(data)
    : (await import('@/api/business/ticket')).addTicket(data)
}
```

## 2. 实施要点
- 视图只依赖 Adapter，不直接依赖 API
- domain 层仅做规则编排，禁止网络访问
- service 层只做 API/IO 封装，保持幂等
- 避免跨层耦合，保留 `FeatureFlags` 用例与快照

## 3. 验收
- 覆盖率门槛：见 `docs/重构文档/覆盖率标准.md`
- Ticket-only 必须可独立运行并通过门禁脚本

