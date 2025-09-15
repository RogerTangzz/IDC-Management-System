# Event-driven Services (Ticket)

- Bus: `frontend/src/services/core/EventBus.ts` (simple in-memory)
- Ticket Events: `frontend/src/domain/ticket/events/TicketEvents.ts`
- Handlers: `frontend/src/services/ticket/TicketEventHandler.ts`
- Orchestration: `frontend/src/services/core/ServiceOrchestrator.ts`
- Escalation: `frontend/src/services/ticket/TicketEscalationService.ts`

Wiring (suggested):
- Instantiate `TicketEventHandler().register()` at app bootstrap (when ready)
- Start `TicketEscalationService` in privileged contexts only (not tests)
- Replace `EventBus` with a shared implementation if using external broker later

