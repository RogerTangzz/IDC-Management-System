type FlagName = string
type Listener = (enabled: boolean) => void

const STORAGE_PREFIX = 'idc:flag:'

class FeatureFlagsImpl {
  public readonly flags = new Map<FlagName, boolean>()
  private listeners = new Map<FlagName, Set<Listener>>()

  isEnabled(name: FlagName) { return this.getFlag(name) }
  getFlag(name: FlagName) { return !!this.flags.get(name) }

  setFlag(name: FlagName, enabled: boolean) {
    const prev = this.flags.get(name)
    if (prev === enabled) return
    this.flags.set(name, enabled)
    this.persist(name, enabled)
    this.listeners.get(name)?.forEach((cb) => { try { cb(enabled) } catch {} })
  }

  toggle(name: FlagName) { this.setFlag(name, !this.getFlag(name)) }

  onChange(name: FlagName, cb: Listener) {
    if (!this.listeners.has(name)) this.listeners.set(name, new Set())
    this.listeners.get(name)!.add(cb)
    return () => this.listeners.get(name)!.delete(cb)
  }

  snapshot(): Record<FlagName, boolean> {
    const out: Record<string, boolean> = {}
    this.flags.forEach((v, k) => (out[k] = v))
    return out
  }

  bulkSet(flags: Record<string, boolean>) {
    Object.entries(flags).forEach(([n, v]) => this.setFlag(n, v))
  }

  reset() {
    this.flags.clear()
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i)!
        if (k?.startsWith(STORAGE_PREFIX)) localStorage.removeItem(k)
      }
    } catch {}
  }

  private persist(name: FlagName, v: boolean) {
    try { localStorage.setItem(STORAGE_PREFIX + name, v ? '1' : '0') } catch {}
  }

  constructor() {
    // load persisted
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)!
        if (!key.startsWith(STORAGE_PREFIX)) continue
        const name = key.substring(STORAGE_PREFIX.length)
        const val = localStorage.getItem(key) === '1'
        this.flags.set(name, val)
      }
    } catch {}
  }
}

const FeatureFlags = new FeatureFlagsImpl()
export default FeatureFlags
export type { FlagName }

