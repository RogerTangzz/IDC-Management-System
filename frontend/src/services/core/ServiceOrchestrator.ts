import { EventBus } from '@/services/core/EventBus'
import TicketPriority from '@/domain/ticket/value-objects/TicketPriority'

export class ServiceOrchestrator {
  constructor() {
    // minimal no-op orchestrations to avoid runtime side effects
    EventBus.on('inspection.anomaly.detected', (e: any) => {
      // map severity to priority, emit a follow-up event for upstream to handle
      const map: Record<string, TicketPriority> = { critical: TicketPriority.URGENT, high: TicketPriority.HIGH, medium: TicketPriority.MEDIUM, low: TicketPriority.LOW }
      EventBus.emit('ticket.request.create', { title: `[巡检异常] ${e?.floor || ''} - ${e?.item || ''}`, description: e?.description, priority: map[String(e?.severity || '').toLowerCase()] || TicketPriority.MEDIUM, sourceType: 'inspection', sourceId: e?.inspectionId, reporterId: e?.inspectorId })
    })
  }
}

export default ServiceOrchestrator

