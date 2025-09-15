type Handler = (payload: any) => void | Promise<void>

export class SimpleEventBus {
  private handlers = new Map<string, Set<Handler>>()
  on(event: string, fn: Handler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set())
    this.handlers.get(event)!.add(fn)
  }
  off(event: string, fn: Handler) { this.handlers.get(event)?.delete(fn) }
  emit(event: string, payload?: any) {
    const set = this.handlers.get(event)
    if (!set) return
    for (const fn of set) {
      try { fn(payload) } catch {}
    }
  }
}

export const EventBus = new SimpleEventBus()
export type EventBusType = SimpleEventBus
export default EventBus

