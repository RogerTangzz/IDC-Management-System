import FeatureFlags from '@/config/FeatureFlags'
import TicketDomain from '@/domain/ticket/TicketDomain'
import TicketService from '@/services/ticket.service'
import { addTicket, listTicket, getTicket, updateTicket, delTicket, ticketAnalytics, ticketSummary, getOverdueTickets, getNearDueTickets } from '@/api/business/ticket'

const domain = new TicketDomain(new TicketService())

export const TicketAdapter = {
  async create(data: any) { return FeatureFlags.isEnabled('USE_NEW_TICKET') ? domain.create(data) : addTicket(data) },
  async list(query: any) { return FeatureFlags.isEnabled('USE_NEW_TICKET') ? domain.list(query) : listTicket(query) },
  async get(id: number | string) { return FeatureFlags.isEnabled('USE_NEW_TICKET') ? domain.get(id) : getTicket(id) },
  async update(data: any) { return FeatureFlags.isEnabled('USE_NEW_TICKET') ? domain.update(data) : updateTicket(data) },
  async remove(id: number | string) { return FeatureFlags.isEnabled('USE_NEW_TICKET') ? domain.remove(id) : delTicket(id) },
  async analytics(params?: any) { return FeatureFlags.isEnabled('USE_NEW_TICKET') ? domain.analytics(params) : ticketAnalytics(params) },
  async summary() { return FeatureFlags.isEnabled('USE_NEW_TICKET') ? domain.summary() : ticketSummary() },
  async listOverdue(params?: any) { return FeatureFlags.isEnabled('USE_NEW_TICKET') ? domain.listOverdue(params) : getOverdueTickets(params) },
  async listNearDue(params?: any) { return FeatureFlags.isEnabled('USE_NEW_TICKET') ? domain.listNearDue(params) : getNearDueTickets(params) }
}

export default TicketAdapter

