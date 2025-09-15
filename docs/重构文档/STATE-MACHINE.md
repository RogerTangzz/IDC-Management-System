# Ticket State Machine

- File: `frontend/src/domain/ticket/TicketStateMachine.ts`
- Actions: assign → start → complete → close → reopen
- Guards: e.g., `assign` requires `assigneeId`, `complete` requires `resolution`.

Usage:
- `canTransition(ticket, action)` → boolean
- `getAvailableActions(ticket)` → string[]
- `transition(ticket, action)` → mutates entity status and timestamps (kept minimal; production should call entity methods)

