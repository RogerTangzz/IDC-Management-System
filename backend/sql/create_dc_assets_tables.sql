-- 机房/机柜/U位使用表结构（首版）

DROP TABLE IF EXISTS `dc_room`;
CREATE TABLE `dc_room` (
  `room_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '机房ID',
  `name` varchar(100) NOT NULL COMMENT '机房名称',
  `floor` varchar(20) DEFAULT NULL COMMENT '楼层',
  `area` varchar(50) DEFAULT NULL COMMENT '区域',
  `status` varchar(20) DEFAULT 'normal' COMMENT '状态(normal,disabled)',
  `del_flag` char(1) DEFAULT '0' COMMENT '删除标志',
  `create_by` varchar(64) DEFAULT '' COMMENT '创建者',
  `create_time` datetime DEFAULT NULL COMMENT '创建时间',
  `update_by` varchar(64) DEFAULT '' COMMENT '更新者',
  `update_time` datetime DEFAULT NULL COMMENT '更新时间',
  `remark` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`room_id`),
  UNIQUE KEY `uk_room_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='机房';

DROP TABLE IF EXISTS `dc_rack`;
CREATE TABLE `dc_rack` (
  `rack_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '机柜ID',
  `room_id` bigint(20) NOT NULL COMMENT '机房ID',
  `code` varchar(50) NOT NULL COMMENT '机柜编号',
  `u_total` int DEFAULT 42 COMMENT '总U数',
  `power_rated` int DEFAULT NULL COMMENT '额定功率(W)',
  `power_current` int DEFAULT NULL COMMENT '当前功率(W)',
  `status` varchar(20) DEFAULT 'normal' COMMENT '状态(normal,reserved,fault,offline)',
  `del_flag` char(1) DEFAULT '0',
  `create_by` varchar(64) DEFAULT '',
  `create_time` datetime DEFAULT NULL,
  `update_by` varchar(64) DEFAULT '',
  `update_time` datetime DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`rack_id`),
  UNIQUE KEY `uk_room_rack` (`room_id`,`code`),
  KEY `idx_room` (`room_id`),
  CONSTRAINT `fk_rack_room` FOREIGN KEY (`room_id`) REFERENCES `dc_room` (`room_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='机柜';

DROP TABLE IF EXISTS `dc_rack_unit`;
CREATE TABLE `dc_rack_unit` (
  `unit_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'U位ID',
  `rack_id` bigint(20) NOT NULL COMMENT '机柜ID',
  `u_index` int NOT NULL COMMENT 'U位序号(1..u_total)',
  `occupied` char(1) DEFAULT 'N' COMMENT '是否占用(Y/N)',
  `label` varchar(100) DEFAULT NULL COMMENT '设备/用途',
  `owner` varchar(100) DEFAULT NULL COMMENT '客户/业务方',
  `power_w` int DEFAULT NULL COMMENT '功耗(W)',
  `remark` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`unit_id`),
  UNIQUE KEY `uk_rack_u` (`rack_id`,`u_index`),
  KEY `idx_rack` (`rack_id`),
  CONSTRAINT `fk_unit_rack` FOREIGN KEY (`rack_id`) REFERENCES `dc_rack` (`rack_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='机柜U位';

