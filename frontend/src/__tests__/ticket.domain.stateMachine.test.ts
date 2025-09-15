import { describe, it, expect } from 'vitest'
import Ticket from '@/domain/ticket/entities/Ticket'
import TicketStatus from '@/domain/ticket/value-objects/TicketStatus'
import TicketPriority from '@/domain/ticket/value-objects/TicketPriority'
import TicketStateMachine from '@/domain/ticket/TicketStateMachine'

describe('TicketStateMachine', () => {
  it('computes available actions correctly', () => {
    const t = new Ticket({ title: 'task', reporterId: 'u1', status: TicketStatus.PENDING, priority: TicketPriority.MEDIUM, assigneeId: 'a1' })
    const sm = new TicketStateMachine()
    expect(sm.getAvailableActions(t)).toContain('assign')
  })
  it('prevents invalid transitions', () => {
    const t = new Ticket({ title: 'task', reporterId: 'u1', status: TicketStatus.PENDING, priority: TicketPriority.MEDIUM })
    const sm = new TicketStateMachine()
    expect(sm.canTransition(t, 'start')).toBe(false)
  })
})
