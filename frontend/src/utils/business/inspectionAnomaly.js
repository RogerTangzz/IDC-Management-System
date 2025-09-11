// src/utils/business/inspectionAnomaly.js
import { addTicket } from '@/api/business/ticket'
import {
  INSPECTION_ITEMS,
  ANOMALY_RULES,
  getAnomalyPriority
} from '@/views/business/inspection/constants'

export class InspectionAnomalyService {
  /**
   * 检测单次巡检的所有异常项
   * @param {Object} inspectionData - 后端返回的巡检记录，需包含 floor、items(JSON字符串/对象)
   * @returns {Array<Object>} 异常项数组
   */
  /**
   * @param {{floor:any,items:any}} inspectionData
   */
  detectAnomalies(inspectionData) {
    const anomalies = []
    const items = typeof inspectionData.items === 'string'
      ? (JSON.parse(inspectionData.items || '{}') || {})
      : (inspectionData.items || {})
    const floor = inspectionData.floor

    // 获取该楼层的检查项配置
    const floorItems = INSPECTION_ITEMS[floor] || []

    floorItems.forEach(itemCfg => {
      const value = items[itemCfg.id]
      // 跳过未填写
      if (value === undefined || value === null || value === '') return

      if (this.isAnomaly(itemCfg, value)) {
        anomalies.push({
          floor,
          itemId: itemCfg.id,
          itemName: itemCfg.label,
          value,
          unit: itemCfg.unit || '',
          expectedRange: this.getExpectedRange(itemCfg),
          priority: getAnomalyPriority(itemCfg.label),
          severity: this.calculateSeverity(itemCfg, value)
        })
      }
    })

    return anomalies
  }

  /**
   * 是否异常：布尔项 false 为异常；数值项超 min/max 为异常
   * constants.js 已提供 ANOMALY_RULES：boolean(value) 与 number(item, value)
   */
  /** 判断是否异常 */
  isAnomaly(itemCfg, value) {
    if (itemCfg.type === 'boolean') {
      return ANOMALY_RULES.boolean(value)
    }
    if (itemCfg.type === 'number') {
      return ANOMALY_RULES.number(itemCfg, Number(value))
    }
    return false
  }

  /** 期望范围展示 */
  /** 获取期望范围展示字符串 */
  getExpectedRange(itemCfg) {
    if (itemCfg.type === 'boolean') return '正常'
    if (itemCfg.type === 'number' && itemCfg.min !== undefined && itemCfg.max !== undefined) {
      return `${itemCfg.min}-${itemCfg.max} ${itemCfg.unit || ''}`.trim()
    }
    return '-'
  }

  /**
   * 严重度：按偏离区间比例判定
   * critical > major > minor > normal
   */
  /** 计算严重度 */
  calculateSeverity(itemCfg, valueRaw) {
    if (itemCfg.type !== 'number' || itemCfg.min === undefined || itemCfg.max === undefined) {
      return 'normal'
    }
    const value = Number(valueRaw)
    if (Number.isNaN(value)) return 'normal'

    const range = Number(itemCfg.max) - Number(itemCfg.min)
    if (range <= 0) return 'normal'

    let deviation = 0
    if (value < itemCfg.min) deviation = itemCfg.min - value
    else if (value > itemCfg.max) deviation = value - itemCfg.max

    const rate = deviation / range
    if (rate > 0.5) return 'critical'
    if (rate > 0.3) return 'major'
    if (rate > 0.1) return 'minor'
    return 'normal'
  }

  /**
   * 批量生成工单
   * @param {string|number} inspectionId
   * @param {Array<Object>} anomalies
   * @param {any} proxy - Vue 实例 proxy，用于 $modal 与 parseTime
   */
  /**
   * 批量生成工单
   * @param {string|number} inspectionId 
   * @param {Array<any>} anomalies 
   * @param {any} proxy
   */
  async generateTickets(inspectionId, anomalies, proxy) {
    const tickets = []

    for (const anomaly of anomalies) {
      const ticketData = {
        title: `[巡检异常] ${this.getFloorLabel(anomaly.floor)} - ${anomaly.itemName}`,
        description: this.generateDescription(anomaly),
        priority: anomaly.priority,
        source: 'inspection',
        sourceId: inspectionId,
        equipment: anomaly.itemName,
        location: this.getFloorLabel(anomaly.floor),
        specialty: this.detectSpecialty(anomaly.itemName),
        status: 'pending',
        deadline: this.calculateDeadline(anomaly.priority, proxy)
      }

      try {
        const resp = await addTicket(ticketData)
        tickets.push(resp?.data ?? resp)
        proxy?.$modal?.msgSuccess?.(`已为「${anomaly.itemName}」生成工单`)
      } catch (err) {
        console.error('生成工单失败:', err)
        proxy?.$modal?.msgError?.(`无法为「${anomaly.itemName}」生成工单`)
      }
    }

    return tickets
  }

  /** 工单描述 */
  /** 生成工单描述 */
  generateDescription(anomaly) {
    const time =
      (this._proxyParseTime?.(new Date())) ||
      new Date().toLocaleString()
    return [
      '巡检发现异常：',
      `- 检查项目：${anomaly.itemName}`,
      `- 所在位置：${this.getFloorLabel(anomaly.floor)}`,
      `- 异常值：${anomaly.value}${anomaly.unit || ''}`,
      `- 正常范围：${anomaly.expectedRange}`,
      `- 异常等级：${this.getPriorityLabel(anomaly.priority)}`,
      `- 严重程度：${this.getSeverityLabel(anomaly.severity)}`,
      `- 发现时间：${time}`,
      '',
      '处理建议：',
      this.getHandlingSuggestion(anomaly),
      '',
      '请及时处理！'
    ].join('\n')
  }

  /** 建议（根据关键词） */
  /** 获取处理建议 */
  getHandlingSuggestion(anomaly) {
    const suggestions = {
      '氢气': '请立即检查氢气监测系统，确认是否存在泄漏风险，必要时启动应急预案',
      '漏水': '请立即前往现场查看漏水情况，关闭相关阀门，防止设备损坏',
      '温度': '请检查空调系统运行状态，调整温度设置或检修空调设备',
      '压力': '请检查相关泵组和管道系统，调整压力参数或排查故障',
      'UPS': '请检查UPS系统运行状态，查看告警日志，必要时切换至旁路供电',
      '消防': '请立即检查消防系统，确认是否存在真实火警，排查误报原因',
      '油': '请检查油罐油位和供油系统，确保供油正常',
      '电': '请检查配电系统，测量电压电流是否正常'
    }

    for (const [kw, tip] of Object.entries(suggestions)) {
      if (anomaly.itemName.includes(kw)) return tip
    }
    return '请尽快前往现场检查，确认异常情况并进行处理'
  }

  /** 归属专业 */
  detectSpecialty(itemName) {
    if (itemName.includes('电') || itemName.includes('UPS') || itemName.includes('配电')) return 'power'
    if (itemName.includes('空调') || itemName.includes('温度') || itemName.includes('冷')) return 'hvac'
    if (itemName.includes('消防') || itemName.includes('水') || itemName.includes('钢瓶')) return 'fire'
    if (itemName.includes('监控') || itemName.includes('门禁') || itemName.includes('弱电')) return 'weak'
    return 'other'
  }

  /** 处理时限 */
  calculateDeadline(priority, proxy) {
    const now = new Date()
    const hours = { high: 4, medium: 8, low: 24 }
    now.setHours(now.getHours() + (hours[priority] ?? 24))
    const format = proxy?.parseTime || this._proxyParseTime
    return format ? format(now, '{y}-{m}-{d} {h}:{i}:{s}') : now.toISOString()
  }

  /** 楼层/标签映射 */
  getFloorLabel(floor) {
    const map = { floor1: '1楼', floor2: '2楼', floor3: '3楼', floor4: '4楼', '1': '1楼', '2': '2楼', '3': '3楼', '4': '4楼' }
    return map[floor] || floor
  }

  getPriorityLabel(p) {
    return ({ high: '高', medium: '中', low: '低' }[p]) || p
  }

  getSeverityLabel(s) {
    return ({ critical: '严重', major: '重要', minor: '轻微', normal: '一般' }[s]) || s
  }

  // 供 generateDescription 使用的兜底格式化
  _proxyParseTime() {
    // 占位：返回 null 表示无格式化器
    return null
  }
}

// 导出单例
export default new InspectionAnomalyService()
// 文件末尾确保无额外不可达代码（保留此注释）
