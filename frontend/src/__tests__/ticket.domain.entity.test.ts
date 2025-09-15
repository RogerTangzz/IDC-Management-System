import { describe, it, expect } from 'vitest'
import Ticket, { ValidationError } from '@/domain/ticket/entities/Ticket'
import TicketStatus from '@/domain/ticket/value-objects/TicketStatus'
import TicketPriority from '@/domain/ticket/value-objects/TicketPriority'

describe('Ticket entity domain behaviors', () => {
  it('validates title and reporter', () => {
    expect(() => new Ticket({ title: 'ab', reporterId: 'u1', status: TicketStatus.PENDING, priority: TicketPriority.MEDIUM })).toThrow(ValidationError)
    expect(() => new Ticket({ title: 'abc', reporterId: '', status: TicketStatus.PENDING, priority: TicketPriority.MEDIUM })).toThrow(ValidationError)
  })
  it('assign→start→complete→close→reopen works', () => {
    const t = new Ticket({ title: 'abc', reporterId: 'u1', status: TicketStatus.PENDING, priority: TicketPriority.LOW })
    t.assign('a1'); expect(t.status).toBe(TicketStatus.ASSIGNED)
    t.start(); expect(t.status).toBe(TicketStatus.PROCESSING)
    t.complete('ok'); expect(t.status).toBe(TicketStatus.COMPLETED)
    t.close(); expect(t.status).toBe(TicketStatus.CLOSED)
    t.reopen(); expect(t.status).toBe(TicketStatus.PENDING)
  })
  it('escalate raises priority sequentially', () => {
    const t = new Ticket({ title: 'abc', reporterId: 'u1', status: TicketStatus.PENDING, priority: TicketPriority.LOW })
    t.escalate(); expect(t.priority).toBe(TicketPriority.MEDIUM)
    t.escalate(); expect(t.priority).toBe(TicketPriority.HIGH)
    t.escalate(); expect(t.priority).toBe(TicketPriority.URGENT)
    expect(() => t.escalate()).toThrow()
  })
})

