import TicketService from '@/services/ticket.service'

export class TicketDomain {
  constructor(private readonly svc: TicketService) {}
  async create(data: any) { return this.svc.create(data) }
  async list(query: any) { return this.svc.list(query) }
  async get(id: number | string) { return this.svc.get(id) }
  async update(data: any) { return this.svc.update(data) }
  async remove(id: number | string) { return this.svc.remove(id) }
  async analytics(params?: any) { return this.svc.analytics(params) }
  async summary() { return this.svc.summary() }
  async listOverdue(params?: any) { return this.svc.listOverdue(params) }
  async listNearDue(params?: any) { return this.svc.listNearDue(params) }
}

export default TicketDomain

