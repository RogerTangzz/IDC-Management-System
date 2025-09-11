// src/views/inspection/constants.js

// 巡检项目配置（按楼层）
export const INSPECTION_ITEMS = {
  floor1: [
    { id: 'oil_tank', label: '地埋油罐及蓄冷罐是否正常', type: 'boolean', seq: 1 },
    { id: 'electric_room', label: '南侧电气间环境设施是否正常', type: 'boolean', seq: 2 },
    { id: 'water_pump', label: '高压细水泵房环境及设施是否正常', type: 'boolean', seq: 3 },
    { id: 'oil_machine', label: '高压油机室是否漏水漏油环境是否正常', type: 'boolean', seq: 4 },
    { id: 'oil_gas', label: '油箱间最高柴油气体浓度', type: 'number', unit: 'ppm', min: 0, max: 100, seq: 5 },
    { id: 'cylinder_room', label: '钢瓶间环境设施及压力表是否正常', type: 'boolean', seq: 6 },
    { id: 'warehouse', label: '一楼库房环境是否正常', type: 'boolean', seq: 7 },
    { id: 'water_pump_leak', label: '水泵房管道是否漏水设施是否正常', type: 'boolean', seq: 8 },
    { id: 'freeze_station', label: '冷冻站环境设施是否正常', type: 'boolean', seq: 9 },
    { id: 'freeze_pump_pressure', label: '冷冻泵回水压力', type: 'number', unit: 'MPa', min: 0.2, max: 0.6, seq: 10 },
    { id: 'cold_pump_pressure', label: '冷却泵回水压力', type: 'number', unit: 'MPa', min: 0.2, max: 0.6, seq: 11 },
    { id: 'board_pump_pressure', label: '板换泵回水压力', type: 'number', unit: 'MPa', min: 0.2, max: 0.6, seq: 12 },
    { id: 'west_electric', label: '一楼西侧电气间设施及环境是否正常', type: 'boolean', seq: 13 },
    { id: 'ba_room', label: '一楼BA机房设施环境及温度是否正常', type: 'boolean', seq: 14 },
    { id: 'north_electric', label: '一楼北侧电气间设施及环境是否正常', type: 'boolean', seq: 15 },
    { id: 'battery_room', label: '电池间氢气浓度监测是否正常', type: 'boolean', seq: 16 },
    { id: 'hydrogen_concentration', label: '氢气浓度值', type: 'number', unit: 'ppm', min: 0, max: 40, seq: 17 },
    { id: 'cooling_tower', label: '楼顶冷却塔运行及补水是否正常', type: 'boolean', seq: 18 },
    { id: 'fire_pool', label: '消防水池水位是否正常', type: 'boolean', seq: 19 },
    { id: 'domestic_water_tank', label: '生活水箱间水位是否正常', type: 'boolean', seq: 20 },
    { id: 'chilled_water_tank', label: '空调冷冻水箱水位是否正常', type: 'boolean', seq: 21 },
    { id: 'cooling_water_tank', label: '空调冷却补水箱水位是否正常', type: 'boolean', seq: 22 }
  ],
  floor2: [
    { id: 'floor2_temp', label: '2楼机房温度', type: 'number', unit: '°C', min: 18, max: 28, seq: 1 },
    { id: 'floor2_humidity', label: '2楼机房湿度', type: 'number', unit: '%', min: 30, max: 70, seq: 2 },
    { id: 'floor2_power_room1', label: '2楼强电间1环境是否正常', type: 'boolean', seq: 3 },
    { id: 'floor2_power_room2', label: '2楼强电间2环境是否正常', type: 'boolean', seq: 4 },
    { id: 'floor2_weak_room1', label: '2楼弱电间1环境是否正常', type: 'boolean', seq: 5 },
    { id: 'floor2_weak_room2', label: '2楼弱电间2环境是否正常', type: 'boolean', seq: 6 },
    { id: 'floor2_air_condition', label: '2楼空调运行是否正常', type: 'boolean', seq: 7 },
    { id: 'floor2_ups_status', label: '2楼UPS运行状态是否正常', type: 'boolean', seq: 8 },
    { id: 'floor2_ups_load', label: '2楼UPS负载率', type: 'number', unit: '%', min: 0, max: 80, seq: 9 },
    { id: 'floor2_battery_temp', label: '2楼电池间温度', type: 'number', unit: '°C', min: 15, max: 25, seq: 10 },
    { id: 'floor2_cable_well', label: '2楼电缆井是否正常', type: 'boolean', seq: 11 },
    { id: 'floor2_water_leak', label: '2楼是否有漏水', type: 'boolean', seq: 12 },
    { id: 'floor2_fire_system', label: '2楼消防系统是否正常', type: 'boolean', seq: 13 },
    { id: 'floor2_access_control', label: '2楼门禁系统是否正常', type: 'boolean', seq: 14 },
    { id: 'floor2_monitoring', label: '2楼监控系统是否正常', type: 'boolean', seq: 15 },
    { id: 'floor2_lighting', label: '2楼照明是否正常', type: 'boolean', seq: 16 },
    { id: 'floor2_cleanliness', label: '2楼卫生环境是否正常', type: 'boolean', seq: 17 },
    { id: 'floor2_noise', label: '2楼噪音是否正常', type: 'boolean', seq: 18 }
  ],
  floor3: [
    { id: 'floor3_temp', label: '3楼机房温度', type: 'number', unit: '°C', min: 18, max: 28, seq: 1 },
    { id: 'floor3_humidity', label: '3楼机房湿度', type: 'number', unit: '%', min: 30, max: 70, seq: 2 },
    { id: 'floor3_power_room', label: '3楼强电间环境是否正常', type: 'boolean', seq: 3 },
    { id: 'floor3_weak_room', label: '3楼弱电间环境是否正常', type: 'boolean', seq: 4 },
    { id: 'floor3_air_condition', label: '3楼空调运行是否正常', type: 'boolean', seq: 5 },
    { id: 'floor3_ups_status', label: '3楼UPS运行状态是否正常', type: 'boolean', seq: 6 },
    { id: 'floor3_ups_load', label: '3楼UPS负载率', type: 'number', unit: '%', min: 0, max: 80, seq: 7 },
    { id: 'floor3_water_leak', label: '3楼是否有漏水', type: 'boolean', seq: 8 },
    { id: 'floor3_fire_system', label: '3楼消防系统是否正常', type: 'boolean', seq: 9 },
    { id: 'floor3_monitoring', label: '3楼监控系统是否正常', type: 'boolean', seq: 10 },
    { id: 'floor3_lighting', label: '3楼照明是否正常', type: 'boolean', seq: 11 },
    { id: 'floor3_cleanliness', label: '3楼卫生环境是否正常', type: 'boolean', seq: 12 },
    { id: 'floor3_cable_organize', label: '3楼线缆整理是否规范', type: 'boolean', seq: 13 }
  ],
  floor4: [
    { id: 'floor4_equipment_room', label: '4楼设备间环境是否正常', type: 'boolean', seq: 1 },
    { id: 'floor4_roof_waterproof', label: '屋面防水是否正常', type: 'boolean', seq: 2 },
    { id: 'floor4_drainage', label: '排水系统是否正常', type: 'boolean', seq: 3 }
  ]
}

// 楼层配置
export const FLOORS = [
  { value: 'floor1', label: '1楼', itemCount: 22 },
  { value: 'floor2', label: '2楼', itemCount: 18 },
  { value: 'floor3', label: '3楼', itemCount: 13 },
  { value: 'floor4', label: '4楼', itemCount: 3 }
]

// 异常检测规则
export const ANOMALY_RULES = {
  // 布尔类型：false即为异常
  boolean: (value) => value === false,
  
  // 数值类型：超出阈值为异常
  number: (item, value) => {
    if (item.min !== undefined && value < item.min) return true
    if (item.max !== undefined && value > item.max) return true
    return false
  }
}

// 异常优先级判定
export const ANOMALY_PRIORITY = {
  // 关键词匹配高优先级
  high: ['氢气', '消防', '漏水', '漏油', 'UPS'],
  // 中优先级
  medium: ['温度', '湿度', '压力', '电气间'],
  // 低优先级
  low: ['卫生', '照明', '噪音']
}

// 判断异常优先级
export function getAnomalyPriority(itemLabel) {
  for (const keyword of ANOMALY_PRIORITY.high) {
    if (itemLabel.includes(keyword)) return 'high'
  }
  for (const keyword of ANOMALY_PRIORITY.medium) {
    if (itemLabel.includes(keyword)) return 'medium'
  }
  return 'low'
}