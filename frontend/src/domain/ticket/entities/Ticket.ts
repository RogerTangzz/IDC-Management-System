import TicketStatus from '../value-objects/TicketStatus'
import TicketPriority from '../value-objects/TicketPriority'

export type TicketProps = {
  id?: string
  title: string
  description?: string
  status: TicketStatus
  priority: TicketPriority
  assigneeId?: string
  reporterId: string
  deadline?: Date
  lastStatusTime?: Date
  lastAction?: string
  escalationCount?: number
  resolution?: string
  createdAt?: Date
  sourceType?: string
  sourceId?: string | number
}

export class ValidationError extends Error {}

export class Ticket {
  private _id: string = ''
  private _title: string
  private _description: string = ''
  private _status: TicketStatus
  private _priority: TicketPriority
  private _assigneeId?: string
  private _reporterId: string
  private _deadline?: Date
  private _lastStatusTime: Date = new Date()
  private _lastAction: string = ''
  private _escalationCount: number = 0
  private _resolution?: string
  private _createdAt: Date = new Date()
  private _sourceType?: string
  private _sourceId?: string | number

  constructor(props: TicketProps) {
    this.validate(props)
    this._id = String(props.id || '')
    this._title = props.title
    this._description = props.description || ''
    this._status = props.status
    this._priority = props.priority
    this._assigneeId = props.assigneeId
    this._reporterId = props.reporterId
    this._deadline = props.deadline
    this._lastStatusTime = props.lastStatusTime || new Date()
    this._lastAction = props.lastAction || ''
    this._escalationCount = props.escalationCount || 0
    this._resolution = props.resolution
    this._createdAt = props.createdAt || new Date()
    this._sourceType = props.sourceType
    this._sourceId = props.sourceId
  }

  assign(assigneeId: string): void {
    if (this._status !== TicketStatus.PENDING) throw new ValidationError('只能分配待处理的工单')
    this._assigneeId = assigneeId
    this._status = TicketStatus.ASSIGNED
    this.updateStatusTime('assign')
  }

  start(): void {
    if (this._status !== TicketStatus.ASSIGNED) throw new ValidationError('只能开始已分配的工单')
    this._status = TicketStatus.PROCESSING
    this.updateStatusTime('start')
  }

  complete(resolution: string): void {
    if (this._status !== TicketStatus.PROCESSING) throw new ValidationError('只能完成处理中的工单')
    this._status = TicketStatus.COMPLETED
    this._resolution = resolution
    this.updateStatusTime('complete')
  }

  close(): void {
    if (this._status !== TicketStatus.COMPLETED) throw new ValidationError('只能关闭已完成的工单')
    this._status = TicketStatus.CLOSED
    this.updateStatusTime('close')
  }

  reopen(): void {
    if (this._status !== TicketStatus.CLOSED) throw new ValidationError('只能重开已关闭的工单')
    this._status = TicketStatus.PENDING
    this._assigneeId = undefined
    this.updateStatusTime('reopen')
  }

  escalate(): void {
    const next = this.getNextPriority()
    if (next === this._priority) throw new ValidationError('工单已达最高优先级')
    this._priority = next
    this._escalationCount++
    this.updateStatusTime('escalate')
  }

  private getNextPriority(): TicketPriority {
    const order = [TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH, TicketPriority.URGENT]
    const idx = order.indexOf(this._priority)
    return order[Math.min(idx + 1, order.length - 1)]
  }

  private updateStatusTime(action: string): void {
    this._lastStatusTime = new Date()
    this._lastAction = action
  }

  private validate(props: TicketProps) {
    if (!props.title || props.title.trim().length < 3) throw new ValidationError('工单标题至少3个字符')
    if (!props.reporterId) throw new ValidationError('必须指定报告人')
  }

  // getters
  get id() { return this._id }
  get title() { return this._title }
  get description() { return this._description }
  get status() { return this._status }
  get priority() { return this._priority }
  get assigneeId() { return this._assigneeId }
  get reporterId() { return this._reporterId }
  get deadline() { return this._deadline }
  get lastStatusTime() { return this._lastStatusTime }
  get lastAction() { return this._lastAction }
  get escalationCount() { return this._escalationCount }
  get resolution() { return this._resolution }
  get createdAt() { return this._createdAt }
  get sourceType() { return this._sourceType }
  get sourceId() { return this._sourceId }

  get isOverdue(): boolean { return !!this._deadline && new Date() > this._deadline }
  get isNearDue(): boolean {
    if (!this._deadline) return false
    const hours = (this._deadline.getTime() - Date.now()) / 36e5
    return hours > 0 && hours < 2
  }
  get canEscalate(): boolean { return this._priority !== TicketPriority.URGENT }
}

export default Ticket

