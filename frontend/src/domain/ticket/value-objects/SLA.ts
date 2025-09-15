import TicketPriority from './TicketPriority'

export class SLA {
  private static readonly HOURS_BY_PRIORITY: Record<TicketPriority, number> = {
    [TicketPriority.LOW]: 48,
    [TicketPriority.MEDIUM]: 24,
    [TicketPriority.HIGH]: 12,
    [TicketPriority.URGENT]: 2
  }

  constructor(private priority: TicketPriority) {}

  get hours(): number {
    return SLA.HOURS_BY_PRIORITY[this.priority]
  }

  get deadline(): Date {
    const deadline = new Date()
    deadline.setHours(deadline.getHours() + this.hours)
    return deadline
  }

  calculateOverdueHours(createdAt: Date): number {
    const now = new Date()
    const deadline = new Date(createdAt)
    deadline.setHours(deadline.getHours() + this.hours)
    if (now <= deadline) return 0
    return (now.getTime() - deadline.getTime()) / (1000 * 60 * 60)
  }
}

export default SLA

