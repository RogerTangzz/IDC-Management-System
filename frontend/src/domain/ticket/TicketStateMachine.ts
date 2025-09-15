import Ticket from './entities/Ticket'
import TicketStatus from './value-objects/TicketStatus'

export interface StateTransition {
  from: TicketStatus
  to: TicketStatus
  action: string
  guard?: (ticket: Ticket) => boolean
  effect?: (ticket: Ticket) => void
}

export class TicketStateMachine {
  private transitions: StateTransition[] = [
    { from: TicketStatus.PENDING, action: 'assign', to: TicketStatus.ASSIGNED, guard: (t) => !!t.assigneeId },
    { from: TicketStatus.ASSIGNED, action: 'start', to: TicketStatus.PROCESSING },
    { from: TicketStatus.PROCESSING, action: 'complete', to: TicketStatus.COMPLETED, guard: (t) => !!t.resolution },
    { from: TicketStatus.COMPLETED, action: 'close', to: TicketStatus.CLOSED },
    { from: TicketStatus.CLOSED, action: 'reopen', to: TicketStatus.PENDING }
  ]

  canTransition(ticket: Ticket, action: string): boolean {
    const tr = this.findTransition(ticket.status, action)
    if (!tr) return false
    return tr.guard ? !!tr.guard(ticket) : true
  }

  transition(ticket: Ticket, action: string): void {
    const tr = this.findTransition(ticket.status, action)
    if (!tr) throw new Error(`Invalid transition: ${action} from ${ticket.status}`)
    if (tr.guard && !tr.guard(ticket)) throw new Error(`Guard failed for transition: ${action}`)
    // perform transition by mutating entity's public methods
    switch (action) {
      case 'assign': /* entity handled via domain, here only fallback */ break
      case 'start': (ticket as any)._status = TicketStatus.PROCESSING; break
      case 'complete': (ticket as any)._status = TicketStatus.COMPLETED; break
      case 'close': (ticket as any)._status = TicketStatus.CLOSED; break
      case 'reopen': (ticket as any)._status = TicketStatus.PENDING; (ticket as any)._assigneeId = undefined; break
    }
    ;(ticket as any)._lastAction = action
    ;(ticket as any)._lastStatusTime = new Date()
    tr.effect?.(ticket)
  }

  getAvailableActions(ticket: Ticket): string[] {
    return this.transitions.filter(t => t.from === ticket.status).filter(t => !t.guard || t.guard(ticket)).map(t => t.action)
  }

  private findTransition(from: TicketStatus, action: string) {
    return this.transitions.find(t => t.from === from && t.action === action)
  }
}

export default TicketStateMachine

