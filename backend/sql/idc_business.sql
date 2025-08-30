-- IDC运维管理系统业务表
-- 适用于MySQL 5.7+
-- 字符集：utf8mb4

-- ----------------------------
-- 1. 工单表
-- ----------------------------
DROP TABLE IF EXISTS `biz_ticket`;
CREATE TABLE `biz_ticket` (
  `ticket_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '工单ID',
  `ticket_no` varchar(50) NOT NULL COMMENT '工单编号',
  `title` varchar(200) NOT NULL COMMENT '工单标题',
  `description` text COMMENT '故障描述',
  `priority` varchar(20) DEFAULT 'medium' COMMENT '优先级(low,medium,high,urgent)',
  `status` varchar(20) DEFAULT 'pending' COMMENT '状态(pending,assigned,processing,completed,closed)',
  `equipment` varchar(100) COMMENT '故障设备',
  `location` varchar(100) COMMENT '设备位置',
  `specialty` varchar(20) COMMENT '设备专业(hvac,power,fire,weak,other)',
  `fault_type` varchar(20) COMMENT '故障类型',
  `reporter_id` bigint(20) COMMENT '报修人ID',
  `reporter_name` varchar(50) COMMENT '报修人姓名',
  `reporter_phone` varchar(20) COMMENT '报修人电话',
  `assignee_id` bigint(20) COMMENT '指派给用户ID',
  `assignee_name` varchar(50) COMMENT '指派给用户姓名',
  `source` varchar(20) COMMENT '来源(manual,inspection,maintenance)',
  `source_id` bigint(20) COMMENT '来源ID',
  `discovery_time` datetime COMMENT '发现时间',
  `deadline` datetime COMMENT '处理时限',
  `completion_time` datetime COMMENT '完成时间',
  `solution` text COMMENT '解决方案',
  `escalation_history` text COMMENT '升级历史JSON',
  `attachments` varchar(1000) COMMENT '附件路径',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`ticket_id`),
  UNIQUE KEY `idx_ticket_no` (`ticket_no`),
  KEY `idx_status` (`status`),
  KEY `idx_assignee` (`assignee_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='工单表';

-- ----------------------------
-- 2. 巡检记录表
-- ----------------------------
DROP TABLE IF EXISTS `biz_inspection`;
CREATE TABLE `biz_inspection` (
  `inspection_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '巡检ID',
  `inspection_no` varchar(50) NOT NULL COMMENT '巡检编号',
  `inspection_date` date NOT NULL COMMENT '巡检日期',
  `floor` varchar(20) NOT NULL COMMENT '巡检楼层(floor1,floor2,floor3,floor4)',
  `inspector_id` bigint(20) COMMENT '巡检人ID',
  `inspector_name` varchar(50) COMMENT '巡检人姓名',
  `relay_person` varchar(50) COMMENT '接力人员',
  `items` text COMMENT '巡检项JSON数据',
  `progress` int(3) DEFAULT '0' COMMENT '完成进度(0-100)',
  `anomaly_count` int DEFAULT '0' COMMENT '异常数量',
  `ticket_count` int DEFAULT '0' COMMENT '生成工单数',
  `ticket_ids` varchar(500) COMMENT '关联工单ID列表',
  `ticket_map` text COMMENT '工单映射JSON',
  `is_copied` char(1) DEFAULT 'N' COMMENT '是否复制(Y/N)',
  `photos` text COMMENT '现场照片JSON',
  `status` varchar(20) DEFAULT 'draft' COMMENT '状态(draft,completed)',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`inspection_id`),
  UNIQUE KEY `idx_inspection_no` (`inspection_no`),
  KEY `idx_date` (`inspection_date`),
  KEY `idx_floor` (`floor`),
  KEY `idx_inspector` (`inspector_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='巡检记录表';

-- ----------------------------
-- 3. 维保计划表
-- ----------------------------
DROP TABLE IF EXISTS `biz_maintenance`;
CREATE TABLE `biz_maintenance` (
  `plan_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '计划ID',
  `plan_no` varchar(50) NOT NULL COMMENT '计划编号',
  `title` varchar(200) NOT NULL COMMENT '计划标题',
  `floor` varchar(20) COMMENT '楼层(1,2,3,4,all)',
  `version` varchar(20) DEFAULT 'V1.0' COMMENT '版本号',
  `mop_category` varchar(20) COMMENT 'MOP类别(daily,regular,annual,emergency)',
  `mop_name` varchar(100) COMMENT 'MOP名称',
  `mop_purpose` text COMMENT 'MOP目的',
  `execution_cycle` varchar(50) COMMENT '执行周期',
  `execution_frequency` int COMMENT '执行频次',
  `execution_unit` varchar(20) COMMENT '频次单位',
  `approver_id` bigint(20) COMMENT '审核人ID',
  `approver_name` varchar(50) COMMENT '审核人姓名',
  `approval_status` varchar(20) DEFAULT 'draft' COMMENT '审核状态(draft,pending,approved,rejected)',
  `approval_time` datetime COMMENT '审核时间',
  `approval_comment` varchar(500) COMMENT '审核意见',
  `execution_status` varchar(20) DEFAULT 'pending' COMMENT '执行状态(pending,executing,completed,cancelled)',
  `next_execution_time` datetime COMMENT '下次执行时间',
  `last_execution_time` datetime COMMENT '上次执行时间',
  `notify_users` varchar(500) COMMENT '通知人员ID列表',
  `executor_id` bigint(20) COMMENT '执行审核人ID',
  `tools` text COMMENT '工具仪表',
  `materials` text COMMENT '材料',
  `safety` text COMMENT '安全PPE',
  `special_tools` text COMMENT '特殊工具',
  `steps` text COMMENT '执行步骤',
  `inspection_result` text COMMENT '巡检结果',
  `submit_time` datetime COMMENT '提交时间',
  `applicant_id` bigint(20) COMMENT '申请人ID',
  `applicant_name` varchar(50) COMMENT '申请人姓名',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`plan_id`),
  UNIQUE KEY `idx_plan_no` (`plan_no`),
  KEY `idx_approval_status` (`approval_status`),
  KEY `idx_execution_status` (`execution_status`),
  KEY `idx_next_execution` (`next_execution_time`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='维保计划表';

-- ----------------------------
-- 4. 工单模板表
-- ----------------------------
DROP TABLE IF EXISTS `biz_ticket_template`;
CREATE TABLE `biz_ticket_template` (
  `template_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '模板ID',
  `template_no` varchar(50) NOT NULL COMMENT '模板编号',
  `template_name` varchar(100) NOT NULL COMMENT '模板名称',
  `fault_type` varchar(20) COMMENT '故障类型',
  `priority` varchar(20) DEFAULT 'medium' COMMENT '默认优先级',
  `specialty` varchar(20) COMMENT '设备专业',
  `default_title` varchar(200) COMMENT '默认标题',
  `default_description` text COMMENT '默认描述',
  `default_emergency_action` text COMMENT '默认应急处置',
  `default_solution` text COMMENT '默认处理方案',
  `use_count` int DEFAULT '0' COMMENT '使用次数',
  `status` char(1) DEFAULT '0' COMMENT '状态（0正常 1停用）',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`template_id`),
  UNIQUE KEY `idx_template_no` (`template_no`),
  KEY `idx_fault_type` (`fault_type`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='工单模板表';

-- ----------------------------
-- 5. 维保执行记录表
-- ----------------------------
DROP TABLE IF EXISTS `biz_maintenance_execution`;
CREATE TABLE `biz_maintenance_execution` (
  `execution_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '执行ID',
  `execution_no` varchar(50) NOT NULL COMMENT '执行编号',
  `plan_id` bigint(20) NOT NULL COMMENT '计划ID',
  `title` varchar(200) COMMENT '计划标题',
  `floor` varchar(20) COMMENT '楼层',
  `version` varchar(20) COMMENT '版本',
  `mop_category` varchar(20) COMMENT 'MOP类别',
  `executor_id` bigint(20) COMMENT '执行人ID',
  `executor_name` varchar(50) COMMENT '执行人姓名',
  `plan_execution_time` datetime COMMENT '计划执行时间',
  `actual_execution_time` datetime COMMENT '实际执行时间',
  `execution_status` varchar(20) DEFAULT 'pending' COMMENT '执行状态',
  `execution_result` varchar(20) COMMENT '执行结果(normal,abnormal)',
  `execution_record` text COMMENT '执行记录',
  `abnormal_description` text COMMENT '异常描述',
  `photos` text COMMENT '现场照片JSON',
  `attachments` text COMMENT '附件JSON',
  `check_list` text COMMENT '检查清单JSON',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志（0代表存在 2代表删除）',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime COMMENT '更新时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`execution_id`),
  UNIQUE KEY `idx_execution_no` (`execution_no`),
  KEY `idx_plan_id` (`plan_id`),
  KEY `idx_execution_status` (`execution_status`),
  KEY `idx_execution_time` (`actual_execution_time`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COMMENT='维保执行记录表';

-- ----------------------------
-- 6. 插入初始测试数据
-- ----------------------------
-- 插入工单模板数据
INSERT INTO `biz_ticket_template` VALUES 
(1, 'TPL202501001', '空调漏水处理', 'hvac', 'low', 'hvac', '空调内机漏水', '空调内机出现漏水现象，水滴落到地面', '立即放置接水容器，防止水损坏其他设备', '1.检查排水管是否堵塞\n2.清理排水管\n3.检查内机安装是否水平', 0, '0', '0', 'admin', NOW(), 'admin', NOW(), NULL),
(2, 'TPL202501002', 'UPS电池故障', 'power', 'high', 'power', 'UPS电池告警', 'UPS系统显示电池故障告警', '检查UPS运行状态，必要时切换至旁路模式', '1.检查电池组电压\n2.测试单体电池\n3.更换故障电池', 0, '0', '0', 'admin', NOW(), 'admin', NOW(), NULL),
(3, 'TPL202501003', '温度过高告警', 'hvac', 'high', 'hvac', '机房温度超标', '机房温度超过预设阈值，触发高温告警', '立即检查空调运行状态，开启备用空调', '1.检查空调运行状态\n2.清洗空调滤网\n3.检查制冷剂', 0, '0', '0', 'admin', NOW(), 'admin', NOW(), NULL),
(4, 'TPL202501004', '配电柜跳闸', 'power', 'urgent', 'power', '配电柜断路器跳闸', '配电柜内断路器跳闸，导致部分设备断电', '立即检查跳闸原因，确认无短路后尝试合闸', '1.检查跳闸原因\n2.排除故障点\n3.恢复供电', 0, '0', '0', 'admin', NOW(), 'admin', NOW(), NULL),
(5, 'TPL202501005', '消防报警误报', 'fire', 'medium', 'fire', '消防系统误报', '消防报警系统出现误报警', '确认现场无火情，消音并复位', '1.现场确认\n2.系统复位\n3.检查传感器', 0, '0', '0', 'admin', NOW(), 'admin', NOW(), NULL);

-- 插入示例巡检记录
INSERT INTO `biz_inspection` VALUES 
(1, 'INS202501001', '2025-01-20', 'floor1', 1, 'admin', NULL, '{"oil_tank":true,"electric_room":true,"water_pump":true}', 15, 0, 0, NULL, NULL, 'N', NULL, 'draft', '0', 'admin', NOW(), 'admin', NOW(), '1楼日常巡检');

-- 插入示例工单数据
INSERT INTO `biz_ticket` VALUES 
(1, 'TK202501001', '空调漏水处理', '2楼机房空调内机漏水', 'low', 'pending', '精密空调#01', '2楼机房', 'hvac', 'leak', 1, '张三', '13800138000', NULL, NULL, 'manual', NULL, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR), NULL, NULL, NULL, NULL, '0', 'admin', NOW(), 'admin', NOW(), NULL),
(2, 'TK202501002', 'UPS电池更换', 'UPS-A组电池老化需更换', 'high', 'assigned', 'UPS-A', '1楼配电室', 'power', 'battery', 1, '李四', '13900139000', 2, '王五', 'manual', NULL, NOW(), DATE_ADD(NOW(), INTERVAL 4 HOUR), NULL, NULL, NULL, NULL, '0', 'admin', NOW(), 'admin', NOW(), NULL);

-- 插入示例维保计划
INSERT INTO `biz_maintenance` VALUES 
(1, 'MP202501001', '1楼月度维保计划', '1', 'V1.0', 'monthly', '配电系统月检', '确保配电系统稳定运行', '每月一次', 1, 'month', 1, 'admin', 'draft', NULL, NULL, 'pending', DATE_ADD(NOW(), INTERVAL 1 MONTH), NULL, '1,2,3', NULL, '万用表、绝缘电阻测试仪', '清洁剂、抹布', '绝缘手套、护目镜', NULL, '1.检查配电柜\n2.测试绝缘电阻\n3.紧固接线端子', NULL, NULL, 1, 'admin', '0', 'admin', NOW(), 'admin', NOW(), NULL);