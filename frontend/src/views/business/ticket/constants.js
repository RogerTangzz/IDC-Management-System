// src/views/ticket/constants.js
export const TICKET_STATUS = {
  PENDING: { value: 'pending', label: '待处理' },
  ASSIGNED: { value: 'assigned', label: '已指派' },
  PROCESSING: { value: 'processing', label: '处理中' },
  COMPLETED: { value: 'completed', label: '已完成' },
  CLOSED: { value: 'closed', label: '已关闭' }
}

export const TICKET_PRIORITY = {
  HIGH: { value: 'high', label: '高', color: 'danger' },
  MEDIUM: { value: 'medium', label: '中', color: 'warning' },
  LOW: { value: 'low', label: '低', color: 'info' }
}

export const EQUIPMENT_SPECIALTY = [
  { value: 'hvac', label: '暖通' },
  { value: 'power', label: '配电' },
  { value: 'fire', label: '消防' },
  { value: 'weak', label: '弱电' }
]