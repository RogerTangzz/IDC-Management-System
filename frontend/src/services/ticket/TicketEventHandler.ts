import { EventBus } from '@/services/core/EventBus'
import { TicketAssigned, TicketCompleted, TicketCreated, TicketEscalated } from '@/domain/ticket/events/TicketEvents'

// Interfaces kept loose to avoid coupling. Provide adapters as needed.
export type TicketEventHandlerDeps = {
  notification?: { notifyAssignee?: (assigneeId: string, ticketId: string) => Promise<void>; broadcast?: (recipients: string[], payload: any) => Promise<void>; sendUrgentTicketNotification?: (ticketId: string) => Promise<void> }
  audit?: { log?: (entry: any) => Promise<void> }
  repository?: { saveAssignmentHistory?: (entry: any) => Promise<void>; findManagers?: () => Promise<string[]>; findById?: (id: string) => Promise<any> }
}

export class TicketEventHandler {
  constructor(private deps: TicketEventHandlerDeps = {}) {}

  register() {
    EventBus.on('ticket.created', async (e: TicketCreated) => {
      await this.deps.audit?.log?.({ action: 'TICKET_CREATED', entityId: e.aggregateId, userId: e.reporterId, details: { title: e.title, priority: e.priority }, timestamp: e.occurredAt })
      if (e.priority === 'urgent') await this.deps.notification?.sendUrgentTicketNotification?.(e.aggregateId)
    })
    EventBus.on('ticket.assigned', async (e: TicketAssigned) => {
      await this.deps.notification?.notifyAssignee?.(e.assigneeId, e.aggregateId)
      await this.deps.repository?.saveAssignmentHistory?.({ ticketId: e.aggregateId, assigneeId: e.assigneeId, assignedBy: e.assignedBy, assignedAt: e.occurredAt })
    })
    EventBus.on('ticket.escalated', async (e: TicketEscalated) => {
      const managers = (await this.deps.repository?.findManagers?.()) || []
      await this.deps.notification?.broadcast?.(managers, { type: 'ticket_escalated', ticketId: e.aggregateId, oldPriority: e.oldPriority, newPriority: e.newPriority, reason: e.reason })
      await this.deps.audit?.log?.({ action: 'TICKET_ESCALATED', entityId: e.aggregateId, details: e })
    })
    EventBus.on('ticket.completed', async (e: TicketCompleted) => {
      const ticket = await this.deps.repository?.findById?.(e.aggregateId)
      const createdAt = (ticket && ticket.createdAt) ? new Date(ticket.createdAt) : new Date(Date.now() - 60_000)
      const duration = e.occurredAt.getTime() - createdAt.getTime()
      await this.deps.audit?.log?.({ action: 'TICKET_COMPLETED', entityId: e.aggregateId, details: { duration, resolution: e.resolution, completedBy: e.completedBy } })
    })
  }
}

export default TicketEventHandler

