import TicketPriority from '../value-objects/TicketPriority'

export abstract class DomainEvent {
  readonly occurredAt: Date = new Date()
  constructor(public readonly aggregateId: string) {}
}

export class TicketCreated extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly title: string,
    public readonly priority: TicketPriority,
    public readonly reporterId: string
  ) { super(aggregateId) }
}

export class TicketAssigned extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly assigneeId: string,
    public readonly assignedBy: string
  ) { super(aggregateId) }
}

export class TicketEscalated extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly oldPriority: TicketPriority,
    public readonly newPriority: TicketPriority,
    public readonly reason: string
  ) { super(aggregateId) }
}

export class TicketCompleted extends DomainEvent {
  constructor(
    aggregateId: string,
    public readonly resolution: string,
    public readonly completedBy: string
  ) { super(aggregateId) }
}

export default { DomainEvent, TicketCreated, TicketAssigned, TicketEscalated, TicketCompleted }

