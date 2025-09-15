import { EventBus } from '@/services/core/EventBus'
import TicketPriority from '@/domain/ticket/value-objects/TicketPriority'

export type EscalationDeps = {
  listOverdue: () => Promise<Array<{ id: string; priority: TicketPriority; canEscalate?: boolean }>>
  escalate: (id: string) => Promise<void>
  logger?: { info?: (...a: any[]) => void; error?: (...a: any[]) => void }
  intervalMs?: number
}

export class TicketEscalationService {
  private timer: any = null
  private running = false
  constructor(private deps: EscalationDeps) {}

  start() {
    if (this.running) return
    const ms = Math.max(1000, Number(this.deps.intervalMs ?? 60000))
    this.timer = setInterval(() => { this.checkAndEscalate().catch(() => {}) }, ms)
    this.running = true
    this.deps.logger?.info?.('[TicketEscalation] started', { ms })
  }
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; this.running = false }
  isRunning() { return this.running }

  async checkAndEscalate() {
    try {
      const list = await this.deps.listOverdue()
      for (const t of list) {
        if (t.canEscalate === false) continue
        try { await this.deps.escalate(t.id) } catch (e) { this.deps.logger?.error?.('[TicketEscalation] escalate failed', { id: t.id, e }) }
      }
      EventBus.emit('escalation.check.completed', { count: list.length, ts: Date.now() })
    } catch (e) {
      this.deps.logger?.error?.('[TicketEscalation] check failed', e)
      EventBus.emit('escalation.check.failed', { error: String((e as any)?.message || e) })
    }
  }
}

export default TicketEscalationService

