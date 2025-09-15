# Ticket Domain Overview

- Entities: `frontend/src/domain/ticket/entities/Ticket.ts`
- Value Objects: `TicketStatus`, `TicketPriority`, `SLA`
- State Machine: `frontend/src/domain/ticket/TicketStateMachine.ts`
- Events: `frontend/src/domain/ticket/events/TicketEvents.ts`

Scope & Principles:
- Encapsulate core business rules (assign/start/complete/close/reopen/escalate)
- Validate invariants at the entity level; throw `ValidationError` for violations
- Provide read-only getters; mutate via domain behaviors

Testing:
- Unit specs under `src/__tests__/ticket.domain.*.test.ts`
- Run: `npm run test:ci:p3:domain`

