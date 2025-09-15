import { addTicket, listTicket, getTicket, updateTicket, delTicket, ticketAnalytics, ticketSummary, getOverdueTickets, getNearDueTickets } from '@/api/business/ticket'

export class TicketService {
  async create(data: any) { return addTicket(data) }
  async list(query: any) { return listTicket(query) }
  async get(id: number | string) { return getTicket(id) }
  async update(data: any) { return updateTicket(data) }
  async remove(id: number | string) { return delTicket(id) }

  async analytics(params?: any) { return ticketAnalytics(params) }
  async summary() { return ticketSummary() }
  async listOverdue(params?: any) { return getOverdueTickets(params) }
  async listNearDue(params?: any) { return getNearDueTickets(params) }
}

export default TicketService

