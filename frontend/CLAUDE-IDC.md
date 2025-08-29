CLAUDE-IDC.md — IDC运维管理系统开发扩展规范 v2.0

版本: 2.0.0
基础规范: CLAUDE.md v2.1
适用项目: IDC运维管理系统（基于RuoYi-Vue3）
核心目标: 将业务逻辑精准映射到RuoYi规范的技术实现


0. 快速导航与开发状态
0.1 模块开发优先级与状态
javascriptconst moduleStatus = {
  // P0 核心模块
  ticket: {
    priority: 'P0',
    api: '✅ 已转换为RuoYi规范',
    list: '✅ index.vue已完成',
    form: '⏳ 待修改',
    detail: '⏳ 待修改',
    template: '⏳ 待修改'
  },
  inspection: {
    priority: 'P0',
    api: '✅ 接口规范已定义',
    create: '✅ create.vue已完成',
    list: '⏳ 待修改',
    detail: '⏳ 待修改',
    constants: '✅ 56项配置完整'
  },
  // P1 重要模块
  maintenance: {
    priority: 'P1',
    api: '⏳ 待转换',
    list: '⏳ 待修改',
    form: '⏳ 待修改',
    approval: '⏳ 待修改',
    execution: '⏳ 待修改'
  },
  asset: {
    priority: 'P1',
    api: '❌ 未开始',
    list: '❌ 未开始',
    form: '❌ 未开始'
  },
  // P2 支撑模块
  knowledge: { priority: 'P2', status: '❌ 未开始' },
  notification: { priority: 'P2', status: '❌ 未开始' },
  report: { priority: 'P2', status: '❌ 未开始' }
}
0.2 业务功能映射表（RuoYi规范）
业务模块前端路由API前缀实际位置权限标识前缀工单管理/business/ticket/business/ticketviews/business/ticketbusiness:ticket:巡检管理/business/inspection/business/inspectionviews/business/inspectionbusiness:inspection:维保计划/business/maintenance/business/maintenanceviews/business/maintenancebusiness:maintenance:资产管理/business/asset/business/assetviews/business/assetbusiness:asset:知识库/business/knowledge/business/knowledgeviews/business/knowledgebusiness:knowledge:

1. 业务领域模型定义
1.1 核心实体关系
javascript// 实体关系图
const entityRelations = {
  User: {
    hasMany: ['Ticket', 'Inspection', 'MaintenancePlan'],
    belongsTo: ['Role', 'Dept']
  },
  Ticket: {
    belongsTo: ['User', 'Asset', 'Inspection'],
    hasMany: ['TicketLog', 'Attachment'],
    hasOne: ['TicketTemplate']
  },
  Inspection: {
    belongsTo: ['User'],
    hasMany: ['InspectionItem', 'Ticket'], // 异常自动生成工单
    data: {
      floor1: '22项',
      floor2: '18项',
      floor3: '13项',
      floor4: '3项'
    }
  },
  MaintenancePlan: {
    belongsTo: ['User'],
    hasMany: ['MaintenanceExecution', 'Notification'],
    fields: ['floor', 'mopCategory', 'approvalStatus']
  }
}
1.2 状态机定义
javascript// 工单状态流转
export const TICKET_STATUS = {
  PENDING: { value: 'pending', label: '待处理', color: 'warning' },
  ASSIGNED: { value: 'assigned', label: '已指派', color: 'primary' },
  PROCESSING: { value: 'processing', label: '处理中', color: '' },
  COMPLETED: { value: 'completed', label: '已完成', color: 'success' },
  CLOSED: { value: 'closed', label: '已关闭', color: 'info' }
}

// 维保计划审核状态
export const MAINTENANCE_STATUS = {
  DRAFT: { value: 'draft', label: '草稿', color: 'info' },
  PENDING: { value: 'pending', label: '待审核', color: 'warning' },
  APPROVED: { value: 'approved', label: '已批准', color: 'success' },
  REJECTED: { value: 'rejected', label: '已拒绝', color: 'danger' },
  EXECUTING: { value: 'executing', label: '执行中', color: 'primary' },
  COMPLETED: { value: 'completed', label: '已完成', color: 'success' }
}

2. RuoYi规范API实现
2.1 工单模块API（已完成）
javascript// src/api/business/ticket.js
import request from '@/utils/request'

// 查询工单列表
export function listTicket(query) {
  return request({
    url: '/business/ticket/list',
    method: 'get',
    params: query
  })
}

// 查询工单详细
export function getTicket(ticketId) {
  return request({
    url: '/business/ticket/' + ticketId,
    method: 'get'
  })
}

// 新增工单
export function addTicket(data) {
  return request({
    url: '/business/ticket',
    method: 'post',
    data: data
  })
}

// 修改工单
export function updateTicket(data) {
  return request({
    url: '/business/ticket',
    method: 'put',
    data: data
  })
}

// 删除工单
export function delTicket(ticketId) {
  return request({
    url: '/business/ticket/' + ticketId,
    method: 'delete'
  })
}

// 批量指派工单
export function assignTickets(ticketIds, userId) {
  return request({
    url: '/business/ticket/assign',
    method: 'post',
    data: { ticketIds, userId }
  })
}

// 更新工单状态
export function changeTicketStatus(ticketId, status) {
  return request({
    url: '/business/ticket/' + ticketId + '/status',
    method: 'put',
    data: { status }
  })
}
2.2 巡检模块API（已完成）
javascript// src/api/business/inspection.js
import request from '@/utils/request'

// 查询巡检列表
export function listInspection(query) {
  return request({
    url: '/business/inspection/list',
    method: 'get',
    params: query
  })
}

// 查询巡检详细
export function getInspection(inspectionId) {
  return request({
    url: '/business/inspection/' + inspectionId,
    method: 'get'
  })
}

// 新增巡检
export function addInspection(data) {
  return request({
    url: '/business/inspection',
    method: 'post',
    data: data
  })
}

// 获取最近一次巡检（用于复制）
export function getLatestInspection() {
  return request({
    url: '/business/inspection/latest',
    method: 'get'
  })
}

// 生成异常工单
export function generateTickets(inspectionId, anomalies) {
  return request({
    url: '/business/inspection/generateTickets',
    method: 'post',
    data: { inspectionId, anomalies }
  })
}
2.3 维保模块API（待转换）
javascript// src/api/business/maintenance.js
import request from '@/utils/request'

// 查询维保计划列表
export function listMaintenance(query) {
  return request({
    url: '/business/maintenance/list',
    method: 'get',
    params: query
  })
}

// 复制上次计划
export function copyLastPlan(planId) {
  return request({
    url: '/business/maintenance/' + planId + '/copy',
    method: 'post'
  })
}

// 提交审核
export function submitApproval(planId, approverId) {
  return request({
    url: '/business/maintenance/' + planId + '/submit',
    method: 'post',
    data: { approverId }
  })
}

3. 巡检核心配置（56项完整配置）
3.1 巡检项目常量定义
javascript// src/views/business/inspection/constants.js
export const INSPECTION_ITEMS = {
  floor1: [
    // 1楼 - 22项
    { id: 'oil_tank', label: '地埋油罐及蓄冷罐是否正常', type: 'boolean' },
    { id: 'electric_room', label: '南侧电气间环境设施是否正常', type: 'boolean' },
    { id: 'water_pump', label: '高压细水泵房环境及设施是否正常', type: 'boolean' },
    { id: 'oil_machine', label: '高压油机室是否漏水漏油环境是否正常', type: 'boolean' },
    { id: 'oil_gas', label: '油箱间最高柴油气体浓度', type: 'number', unit: 'ppm', min: 0, max: 200 },
    { id: 'steel_bottle', label: '钢瓶间环境设施及压力表是否正常', type: 'boolean' },
    { id: 'warehouse', label: '一楼库房环境是否正常', type: 'boolean' },
    { id: 'pump_room', label: '水泵房管道是否漏水设施是否正常', type: 'boolean' },
    { id: 'freeze_station', label: '冷冻站环境设施是否正常', type: 'boolean' },
    { id: 'freeze_pump_pressure', label: '冷冻泵回水压力', type: 'number', unit: 'MPa', min: 0.2, max: 0.6 },
    { id: 'cold_pump_pressure', label: '冷却泵供水压力', type: 'number', unit: 'MPa', min: 0.2, max: 0.6 },
    { id: 'expansion_valve', label: '膨胀阀阀前温度', type: 'number', unit: '℃', min: 5, max: 15 },
    { id: 'cold_water_supply', label: '冷冻水供水温度', type: 'number', unit: '℃', min: 5, max: 12 },
    { id: 'cold_water_return', label: '冷冻水回水温度', type: 'number', unit: '℃', min: 12, max: 18 },
    { id: 'hydrogen_concentration', label: '氢气间氢气最高浓度', type: 'number', unit: '%', min: 0, max: 4 },
    { id: 'battery_room', label: '电池间环境设施是否正常', type: 'boolean' },
    { id: 'operation_duty', label: '运行值班室环境是否正常', type: 'boolean' },
    { id: 'spare_parts', label: '备品备件库环境是否正常', type: 'boolean' },
    { id: 'fire_cylinder', label: '消防钢瓶间设施是否正常', type: 'boolean' },
    { id: 'north_electric', label: '北侧高压电气室环境设施是否正常', type: 'boolean' },
    { id: 'power_meter', label: '市电电能表当前表数', type: 'number', unit: 'kWh', min: 0, max: 999999 },
    { id: 'low_voltage', label: '低压配电室及电容柜环境设备是否正常', type: 'boolean' }
  ],
  floor2: [
    // 2楼 - 18项
    { id: 'it_office', label: 'IT办公室环境是否正常', type: 'boolean' },
    { id: 'meeting_room', label: '小会议室环境是否正常', type: 'boolean' },
    { id: 'power_room_2a', label: '2-A动力室环境设备是否正常', type: 'boolean' },
    { id: 'battery_room_2a', label: '2-A电池室环境设施是否正常', type: 'boolean' },
    { id: 'ups_room_2a', label: '2-AUPS室环境设备是否正常', type: 'boolean' },
    { id: 'precision_ac_2a1', label: '2-A1精密空调间漏水温湿度是否正常', type: 'boolean' },
    { id: 'precision_ac_2a2', label: '2-A2精密空调间漏水温湿度是否正常', type: 'boolean' },
    { id: 'new_air_unit_2a', label: '2-A新风机组间环境设施是否正常', type: 'boolean' },
    { id: 'weak_current_2', label: '弱电间环境是否正常', type: 'boolean' },
    { id: 'corridor_2', label: '走廊过道及安全出口是否正常', type: 'boolean' },
    { id: 'data_room_2a', label: '2-A数据机房环境温湿度是否正常', type: 'boolean' },
    { id: 'power_room_2b', label: '2-B动力室环境设备是否正常', type: 'boolean' },
    { id: 'battery_room_2b', label: '2-B电池室环境设施是否正常', type: 'boolean' },
    { id: 'ups_room_2b', label: '2-BUPS室环境设备是否正常', type: 'boolean' },
    { id: 'precision_ac_2b1', label: '2-B1精密空调间漏水温湿度是否正常', type: 'boolean' },
    { id: 'precision_ac_2b2', label: '2-B2精密空调间漏水温湿度是否正常', type: 'boolean' },
    { id: 'new_air_unit_2b', label: '2-B新风机组间环境设施是否正常', type: 'boolean' },
    { id: 'data_room_2b', label: '2-B数据机房环境温湿度是否正常', type: 'boolean' }
  ],
  floor3: [
    // 3楼 - 13项
    { id: 'cylinder_room_3', label: '钢瓶间环境设施是否正常', type: 'boolean' },
    { id: 'canteen_3', label: '3楼食堂就餐环境卫生是否正常', type: 'boolean' },
    { id: 'power_room_3a', label: '3-A动力室环境设备是否正常', type: 'boolean' },
    { id: 'battery_room_3', label: '3电池室环境设施是否正常', type: 'boolean' },
    { id: 'ups_room_3a', label: '3-AUPS室环境设备是否正常', type: 'boolean' },
    { id: 'precision_ac_3a', label: '3-A精密空调间漏水温湿度是否正常', type: 'boolean' },
    { id: 'new_air_unit_3a', label: '3-A新风机组间环境设施是否正常', type: 'boolean' },
    { id: 'data_room_3a', label: '3-A数据机房环境温湿度是否正常', type: 'boolean' },
    { id: 'corridor_3', label: '走廊过道及安全出口是否正常', type: 'boolean' },
    { id: 'power_room_3b', label: '3-B动力室环境设备是否正常', type: 'boolean' },
    { id: 'ups_room_3b', label: '3-BUPS室环境设备是否正常', type: 'boolean' },
    { id: 'precision_ac_3b', label: '3-B精密空调间漏水温湿度是否正常', type: 'boolean' },
    { id: 'new_air_unit_3b', label: '3-B新风机组间环境设施是否正常', type: 'boolean' }
  ],
  floor4: [
    // 4楼 - 3项
    { id: 'cooling_tower', label: '屋顶冷却塔及水泵是否正常', type: 'boolean' },
    { id: 'oil_tank_4', label: '屋顶日用油罐油位', type: 'number', unit: 'L', min: 0, max: 1000 },
    { id: 'expansion_tank', label: '屋顶膨胀水箱是否漏水', type: 'boolean' }
  ]
};

// 异常检测规则
export const anomalyDetectionRules = {
  boolean: (value) => value === false,
  number: {
    oil_gas: (value) => value > 100,
    hydrogen_concentration: (value) => value > 2,
    freeze_pump_pressure: (value) => value < 0.2 || value > 0.6,
    cold_pump_pressure: (value) => value < 0.2 || value > 0.6,
    expansion_valve: (value) => value < 5 || value > 15,
    cold_water_supply: (value) => value < 5 || value > 12,
    cold_water_return: (value) => value < 12 || value > 18,
    oil_tank_4: (value) => value < 100
  }
};

// 异常优先级判定
export const anomalyPriorityRules = {
  high: ['氢气', '消防', '漏水', '漏油', '高压'],
  medium: ['设备故障', '压力异常', '温度异常', 'UPS'],
  low: ['环境异常', '卫生问题']
};

4. 数据模型定义
4.1 数据库表结构
sql-- 工单表
CREATE TABLE `biz_ticket` (
  `ticket_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '工单ID',
  `ticket_no` varchar(50) COMMENT '工单编号',
  `title` varchar(200) COMMENT '标题',
  `priority` varchar(20) COMMENT '优先级',
  `status` varchar(20) COMMENT '状态',
  `equipment` varchar(100) COMMENT '故障设备',
  `specialty` varchar(20) COMMENT '设备专业',
  `description` text COMMENT '故障描述',
  `reporter` varchar(50) COMMENT '报修人',
  `assignee_id` bigint(20) COMMENT '指派给',
  `discovery_time` datetime COMMENT '发现时间',
  `deadline` datetime COMMENT '处理时限',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志',
  `create_by` varchar(64) COMMENT '创建者',
  `create_time` datetime COMMENT '创建时间',
  `update_by` varchar(64) COMMENT '更新者',
  `update_time` datetime COMMENT '更新时间',
  PRIMARY KEY (`ticket_id`)
) ENGINE=InnoDB COMMENT='工单表';

-- 巡检记录表
CREATE TABLE `biz_inspection` (
  `inspection_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '巡检ID',
  `inspection_no` varchar(50) COMMENT '巡检编号',
  `inspection_date` date COMMENT '巡检日期',
  `inspector_name` varchar(50) COMMENT '巡检人',
  `items` json COMMENT '巡检项JSON',
  `progress` int(3) COMMENT '完成进度',
  `anomaly_count` int COMMENT '异常数',
  `ticket_count` int COMMENT '生成工单数',
  `is_copied` char(1) DEFAULT 'N' COMMENT '是否复制',
  `relay_person` varchar(50) COMMENT '接力人员',
  `photos` varchar(1000) COMMENT '现场照片',
  `remark` varchar(500) COMMENT '备注',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志',
  `create_time` datetime COMMENT '创建时间',
  PRIMARY KEY (`inspection_id`)
) ENGINE=InnoDB COMMENT='巡检记录表';

-- 维保计划表
CREATE TABLE `biz_maintenance` (
  `plan_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '计划ID',
  `title` varchar(200) COMMENT '标题',
  `floor` varchar(20) COMMENT '楼层',
  `version` varchar(20) COMMENT '版本',
  `mop_category` varchar(20) COMMENT 'MOP类别',
  `mop_name` varchar(100) COMMENT 'MOP名称',
  `mop_purpose` text COMMENT 'MOP目的',
  `execution_cycle` varchar(50) COMMENT '执行周期',
  `approver_id` bigint(20) COMMENT '审核人ID',
  `approval_status` varchar(20) COMMENT '审核状态',
  `execution_status` varchar(20) COMMENT '执行状态',
  `next_execution_time` datetime COMMENT '下次执行时间',
  `notify_users` varchar(500) COMMENT '通知人员',
  `tools` text COMMENT '工具仪表',
  `materials` text COMMENT '材料',
  `safety` text COMMENT '安全PPE',
  `special_tools` text COMMENT '特殊工具',
  `steps` text COMMENT '步骤内容',
  `inspection_result` text COMMENT '巡检结果',
  `remark` varchar(500) COMMENT '备注',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志',
  `create_time` datetime COMMENT '创建时间',
  PRIMARY KEY (`plan_id`)
) ENGINE=InnoDB COMMENT='维保计划表';
4.2 数据字典配置
javascript// 需要在系统管理-字典管理中添加
const dictionaries = {
  // 工单状态
  'ticket_status': [
    { dictLabel: '待处理', dictValue: 'pending', dictSort: 1 },
    { dictLabel: '已指派', dictValue: 'assigned', dictSort: 2 },
    { dictLabel: '处理中', dictValue: 'processing', dictSort: 3 },
    { dictLabel: '已完成', dictValue: 'completed', dictSort: 4 },
    { dictLabel: '已关闭', dictValue: 'closed', dictSort: 5 }
  ],
  // 工单优先级
  'ticket_priority': [
    { dictLabel: '高', dictValue: 'high', dictSort: 1 },
    { dictLabel: '中', dictValue: 'medium', dictSort: 2 },
    { dictLabel: '低', dictValue: 'low', dictSort: 3 }
  ],
  // 设备专业
  'equipment_specialty': [
    { dictLabel: '暖通', dictValue: 'hvac', dictSort: 1 },
    { dictLabel: '配电', dictValue: 'power', dictSort: 2 },
    { dictLabel: '消防', dictValue: 'fire', dictSort: 3 },
    { dictLabel: '弱电', dictValue: 'weak', dictSort: 4 }
  ],
  // MOP类别
  'mop_category': [
    { dictLabel: '日常维护', dictValue: 'daily', dictSort: 1 },
    { dictLabel: '定期保养', dictValue: 'regular', dictSort: 2 },
    { dictLabel: '年度检修', dictValue: 'annual', dictSort: 3 },
    { dictLabel: '应急维修', dictValue: 'emergency', dictSort: 4 }
  ]
}

5. 业务服务实现
5.1 工单自动升级服务
javascript// src/utils/business/ticketEscalation.js
import { getOverdueTickets, updateTicket } from '@/api/business/ticket';

class TicketEscalationService {
  constructor() {
    this.checkInterval = 60 * 60 * 1000; // 每小时检查
    this.timer = null;
  }
  
  start() {
    this.timer = setInterval(() => {
      this.checkAndEscalate();
    }, this.checkInterval);
    this.checkAndEscalate(); // 立即执行一次
  }
  
  async checkAndEscalate() {
    try {
      const response = await getOverdueTickets();
      const overdueTickets = response.rows;
      
      for (const ticket of overdueTickets) {
        const hoursOverdue = this.calculateOverdueHours(ticket);
        const newPriority = this.determineNewPriority(ticket.priority, hoursOverdue);
        
        if (newPriority !== ticket.priority) {
          await this.escalateTicket(ticket, newPriority);
        }
      }
    } catch (error) {
      console.error('工单升级检查失败:', error);
    }
  }
  
  calculateOverdueHours(ticket) {
    const deadline = new Date(ticket.deadline);
    const now = new Date();
    return Math.floor((now - deadline) / (1000 * 60 * 60));
  }
  
  determineNewPriority(currentPriority, overdueHours) {
    const rules = {
      low: { threshold: 24, next: 'medium' },
      medium: { threshold: 8, next: 'high' },
      high: { threshold: 4, next: 'critical' }
    };
    
    const rule = rules[currentPriority];
    return overdueHours >= rule.threshold ? rule.next : currentPriority;
  }
  
  async escalateTicket(ticket, newPriority) {
    await updateTicket({
      ticketId: ticket.ticketId,
      priority: newPriority
    });
  }
}

export default new TicketEscalationService();
5.2 巡检异常检测服务
javascript// src/utils/business/inspectionAnomaly.js
import { INSPECTION_ITEMS, anomalyDetectionRules, anomalyPriorityRules } from '@/views/business/inspection/constants';
import { addTicket } from '@/api/business/ticket';

export class InspectionAnomalyService {
  // 检测异常项
  detectAnomalies(inspectionData) {
    const anomalies = [];
    
    Object.keys(INSPECTION_ITEMS).forEach(floor => {
      const items = INSPECTION_ITEMS[floor];
      const values = inspectionData.items[floor];
      
      items.forEach(item => {
        const value = values[item.id];
        if (value === undefined || value === null) return;
        
        let isAnomaly = false;
        if (item.type === 'boolean') {
          isAnomaly = anomalyDetectionRules.boolean(value);
        } else if (item.type === 'number' && anomalyDetectionRules.number[item.id]) {
          isAnomaly = anomalyDetectionRules.number[item.id](value);
        }
        
        if (isAnomaly) {
          anomalies.push({
            floor: floor.replace('floor', '') + '楼',
            itemId: item.id,
            itemName: item.label,
            value: value,
            priority: this.determinePriority(item.label)
          });
        }
      });
    });
    
    return anomalies;
  }
  
  // 确定优先级
  determinePriority(itemName) {
    for (const [priority, keywords] of Object.entries(anomalyPriorityRules)) {
      if (keywords.some(keyword => itemName.includes(keyword))) {
        return priority;
      }
    }
    return 'low';
  }
  
  // 批量生成工单
  async generateTickets(inspectionId, anomalies) {
    const tickets = [];
    
    for (const anomaly of anomalies) {
      const ticket = await addTicket({
        title: `[巡检异常] ${anomaly.floor} - ${anomaly.itemName}`,
        description: this.generateDescription(anomaly),
        priority: anomaly.priority,
        source: 'inspection',
        sourceId: inspectionId,
        equipment: anomaly.itemName,
        location: anomaly.floor
      });
      
      tickets.push(ticket);
    }
    
    return tickets;
  }
  
  generateDescription(anomaly) {
    return `巡检发现异常：
- 检查项目：${anomaly.itemName}
- 所在位置：${anomaly.floor}
- 异常值：${anomaly.value}
- 异常等级：${anomaly.priority}
- 发现时间：${new Date().toLocaleString()}

请及时处理！`;
  }
}

export default new InspectionAnomalyService();

6. 菜单权限配置
6.1 菜单结构
javascript// 在系统管理-菜单管理中配置
const menuStructure = {
  name: 'IDC运维管理',
  path: 'business',
  icon: 'monitor',
  children: [
    {
      name: '工单管理',
      path: 'ticket',
      component: 'business/ticket/index',
      perms: 'business:ticket:list'
    },
    {
      name: '巡检管理',
      path: 'inspection',
      component: 'business/inspection/index',
      perms: 'business:inspection:list'
    },
    {
      name: '维保计划',
      path: 'maintenance',
      component: 'business/maintenance/index',
      perms: 'business:maintenance:list'
    }
  ]
}
6.2 角色权限矩阵
javascriptconst rolePermissions = {
  // 管理员
  admin: [
    'business:ticket:*',
    'business:inspection:*',
    'business:maintenance:*',
    'business:asset:*'
  ],
  // 运维工程师
  engineer: [
    'business:ticket:list',
    'business:ticket:query',
    'business:ticket:add',
    'business:ticket:edit',
    'business:inspection:list',
    'business:inspection:add',
    'business:maintenance:list',
    'business:maintenance:query'
  ],
  // 巡检员
  inspector: [
    'business:inspection:list',
    'business:inspection:add',
    'business:inspection:edit',
    'business:ticket:list',
    'business:ticket:add'
  ]
}

7. 开发任务清单
7.1 立即需要完成的任务
javascriptconst urgentTasks = [
  {
    module: 'inspection',
    task: '修改index.vue为RuoYi规范',
    priority: 'P0',
    status: '⏳'
  },
  {
    module: 'ticket',
    task: '修改form.vue和detail.vue',
    priority: 'P0',
    status: '⏳'
  },
  {
    module: 'maintenance',
    task: '转换API为函数导出',
    priority: 'P1',
    status: '⏳'
  },
  {
    module: 'database',
    task: '创建业务表',
    priority: 'P0',
    status: '❌'
  },
  {
    module: 'dict',
    task: '配置字典数据',
    priority: 'P0',
    status: '❌'
  }
]
7.2 后端接口开发
java// 需要在后端创建的Controller
@RestController
@RequestMapping("/business/ticket")
public class BizTicketController extends BaseController {
    // CRUD接口
}

@RestController
@RequestMapping("/business/inspection") 
public class BizInspectionController extends BaseController {
    // CRUD接口 + 特殊业务接口
}

@RestController
@RequestMapping("/business/maintenance")
public class BizMaintenanceController extends BaseController {
    // CRUD接口 + 审批流程接口
}

8. 测试验证清单
8.1 功能测试点
javascriptconst testPoints = {
  ticket: [
    '创建工单',
    '批量指派',
    '状态流转',
    '自动升级',
    '导出功能'
  ],
  inspection: [
    '创建巡检',
    '复制上次巡检',
    '异常检测',
    '自动生成工单',
    '进度计算'
  ],
  maintenance: [
    '创建计划',
    '复制计划',
    '提交审核',
    '审批流程',
    '执行记录'
  ]
}

9. 部署配置
9.1 环境变量
bash# .env.production
VITE_APP_TITLE=IDC运维管理系统
VITE_APP_BASE_API=https://idc-api.company.com
VITE_WS_URL=wss://idc-ws.company.com
9.2 Nginx配置
nginxlocation /business/ {
    proxy_pass http://backend:8080/business/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}

更新日志
v2.0.0 (2024-08)

全面适配RuoYi-Vue3规范
API改为函数导出格式
更新所有路径为business模块
添加完整的56项巡检配置
更新权限标识格式

v1.0.0 (2024-01)

初始版本发布



注意: 本文档为IDC运维管理系统专用扩展，必须配合CLAUDE.md v2.1主规范使用
维护: 实时跟踪开发进度，确保文档与代码同步