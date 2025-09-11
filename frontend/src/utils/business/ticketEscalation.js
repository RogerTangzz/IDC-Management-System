// src/utils/business/ticketEscalation.js
import { listTicket, updateTicket /*, getOverdueTickets */ } from '@/api/business/ticket'

/**
 * 工单自动升级服务
 * - 定时检查未完成工单，若超过 deadline 则按规则自动升级 priority
 * - 依赖：
 *   - 接口：listTicket / updateTicket
 *   - UI：this.proxy.$modal（来自 app 实例），this.proxy.parseTime（RuoYi 工具）
 */
class TicketEscalationService {
  constructor() {
    // 每小时检查一次；需要更快可改小，如 15 * 60 * 1000（15 分钟）
    this.checkInterval = 60 * 60 * 1000
    this.timer = null
    this.isRunning = false
    this.proxy = null

    // 允许外部调整的筛选与阈值
    this.pendingStatuses = 'pending,assigned,processing'
    this.pageSize = 200 // 适当放大，避免漏查
    this.rules = {
      low:    { threshold: 24, next: 'medium' }, // 低 → 中（超 24h）
      medium: { threshold:  8, next: 'high'   }, // 中 → 高（超 8h）
      high:   { threshold:  4, next: 'urgent' }  // 高 → 紧（超 4h）
    }
  }

  // 注入 app proxy（用于通知、时间格式化等）
  init(proxy) {
    this.proxy = proxy
  }

  start() {
    if (this.isRunning) return
    this.isRunning = true
    // 先立即跑一次
    this.checkAndEscalate()
    // 定时任务
    this.timer = setInterval(() => this.checkAndEscalate(), this.checkInterval)
    console.log('[TicketEscalation] 服务已启动，间隔(ms)：', this.checkInterval)
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.isRunning = false
    console.log('[TicketEscalation] 服务已停止')
  }

  /**
   * 核心：拉取未完成工单 → 逐条判断是否逾期 → 升级/记录/通知
   */
  async checkAndEscalate() {
    try {
      // --- 方式A：前端本地判断逾期（稳妥，后端无依赖） ---
      const resp = await listTicket({
        status: this.pendingStatuses,
        pageNum: 1,
        pageSize: this.pageSize
      })

      const rows = Array.isArray(resp?.rows) ? resp.rows : []
      if (!rows.length) {
        this._log('暂无需要检查的工单')
        return
      }

      const now = new Date()
      for (const ticket of rows) {
        // 兼容不同字段命名：ticket.deadline / ticket.deadlineTime
        const rawDeadline = ticket.deadline ?? ticket.deadlineTime
        if (!rawDeadline) continue

        const deadline = new Date(rawDeadline)
        if (Number.isNaN(+deadline)) continue

        if (now > deadline) {
          const hoursOverdue = Math.floor((now - deadline) / (1000 * 60 * 60))
          const current = ticket.priority || 'low'
          const next = this._determineNewPriority(current, hoursOverdue)

          if (next !== current) {
            await this._escalateTicket(ticket, next, hoursOverdue)
            this._notifyEscalation(ticket, next, hoursOverdue)
          }
        }
      }

      // --- 方式B：如你后端实现了 /ticket/overdue，可改用（更省流量）---
      // const resp = await getOverdueTickets({ pageNum: 1, pageSize: this.pageSize })
      // const rows = Array.isArray(resp?.rows) ? resp.rows : []
      // for (const ticket of rows) { ... 与上同 ... }

    } catch (err) {
      console.error('[TicketEscalation] 检查失败：', err)
      this._notifyError(err)
    }
  }

  /**
   * 根据规则计算“新优先级”
   * @param {'low'|'medium'|'high'|'urgent'} currentPriority
   * @param {number} overdueHours
   */
  _determineNewPriority(currentPriority, overdueHours) {
    const rule = this.rules[currentPriority]
    if (!rule) return currentPriority
    return overdueHours >= rule.threshold ? rule.next : currentPriority
  }

  /**
   * 执行升级并记录历史
   */
  async _escalateTicket(ticket, newPriority, overdueHours) {
    // 兼容不同主键：ticketId / id
    const ticketId = ticket.ticketId ?? ticket.id
    if (ticketId == null) {
      this._log(`跳过：缺少 ticketId，工单号#${ticket.ticketNo ?? '-'} `)
      return
    }

    // 历史记录（合并旧记录）
    const oldHist = (() => {
      try {
        return ticket.escalationHistory
          ? (Array.isArray(ticket.escalationHistory)
              ? ticket.escalationHistory
              : JSON.parse(ticket.escalationHistory))
          : []
      } catch {
        return []
      }
    })()

    const log = {
      fromPriority: ticket.priority,
      toPriority: newPriority,
      escalationTime: this.proxy?.parseTime?.(new Date()) || new Date().toISOString(),
      reason: `自动升级：已逾期 ${overdueHours} 小时`,
      operator: 'system'
    }

    await updateTicket({
      ticketId,
      priority: newPriority,
      escalationHistory: JSON.stringify([...oldHist, log]),
      remark: `[系统自动升级] 工单已逾期 ${overdueHours} 小时，优先级 ${this._label(ticket.priority)} → ${this._label(newPriority)}`
    })
  }

  _label(p) {
    return ({ low: '低', medium: '中', high: '高', urgent: '紧急' }[p]) ?? p
  }

  _notifyEscalation(ticket, newPriority, overdueHours) {
    const no = ticket.ticketNo ?? ticket.ticketId ?? ticket.id ?? '-'
    const msg = `工单 #${no} 已自动升级：${this._label(ticket.priority)} → ${this._label(newPriority)}（逾期 ${overdueHours} 小时）`
    this.proxy?.$modal?.msgWarning?.(msg)
    this._log(msg)
  }

  _notifyError(error) {
    const text = '工单升级服务异常：' + (error?.message || '请检查系统日志/网络')
    this.proxy?.$modal?.msgError?.(text)
  }

  _log(...args) {
    console.log('[TicketEscalation]', ...args)
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      nextCheckTime: this.timer ? new Date(Date.now() + this.checkInterval) : null
    }
  }
}

// 导出单例
export default new TicketEscalationService()
