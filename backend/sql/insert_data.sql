-- insert_data.sql
-- 插入测试数据
SET NAMES utf8mb4;

-- 插入工单模板数据
INSERT INTO `biz_ticket_template` (`template_no`, `template_name`, `fault_type`, `priority`, `specialty`, `default_title`, `default_description`, `default_emergency_action`, `default_solution`, `use_count`, `status`, `del_flag`, `create_by`, `create_time`, `update_by`, `update_time`) VALUES 
('TPL202501001', '空调漏水处理', 'hvac', 'low', 'hvac', '空调内机漏水', '空调内机出现漏水现象，水滴落到地面', '立即放置接水容器，防止水损坏其他设备', '1.检查排水管是否堵塞\n2.清理排水管\n3.检查内机安装是否水平', 0, '0', '0', 'admin', NOW(), 'admin', NOW()),
('TPL202501002', 'UPS电池故障', 'power', 'high', 'power', 'UPS电池告警', 'UPS系统显示电池故障告警', '检查UPS运行状态，必要时切换至旁路模式', '1.检查电池组电压\n2.测试单体电池\n3.更换故障电池', 0, '0', '0', 'admin', NOW(), 'admin', NOW());

-- 插入示例巡检记录
INSERT INTO `biz_inspection` (`inspection_no`, `inspection_date`, `floor`, `inspector_id`, `inspector_name`, `items`, `progress`, `anomaly_count`, `ticket_count`, `is_copied`, `status`, `del_flag`, `create_by`, `create_time`, `update_by`, `update_time`, `remark`) VALUES 
('INS202501001', '2025-01-20', 'floor1', 1, 'admin', '{"oil_tank":true,"electric_room":true,"water_pump":true}', 15, 0, 0, 'N', 'draft', '0', 'admin', NOW(), 'admin', NOW(), '1楼日常巡检');