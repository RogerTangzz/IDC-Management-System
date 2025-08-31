// src/utils/mockControl.js
/** 全局 Mock 配置，逐模块控制 */
export const mockConfig = {
  enabled: true,  // 总开关
  modules: {
    ticket: true,      // 工单模块Mock
    inspection: true,  // 巡检模块Mock
    maintenance: true  // 维保模块Mock
  }
}

// 使用时判断
if (mockConfig.enabled && mockConfig.modules.ticket) {
  // 使用Mock
}