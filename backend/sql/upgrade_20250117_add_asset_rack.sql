-- =============================================
-- 资产机柜表 - MySQL 版本
-- 创建日期: 2025-01-17
-- 说明: M4 模块 - 资产机柜管理
-- =============================================

-- 创建资产机柜表
CREATE TABLE IF NOT EXISTS biz_asset_rack (
    -- 主键与唯一标识
    rack_id         BIGINT          NOT NULL AUTO_INCREMENT COMMENT '机柜ID',
    rack_no         VARCHAR(50)     NOT NULL COMMENT '机柜编号（唯一）',
    rack_name       VARCHAR(100)    NOT NULL COMMENT '机柜名称',

    -- 位置信息（字典）
    floor           VARCHAR(20)     NULL COMMENT '楼层（字典：idc_floor）',
    room            VARCHAR(50)     NULL COMMENT '房间/区域',
    location        VARCHAR(200)    NULL COMMENT '具体位置描述',

    -- 容量与规格
    u_count         INT             DEFAULT 42 COMMENT '总U数',
    u_used          INT             DEFAULT 0 COMMENT '已用U数',
    power_capacity  DECIMAL(10,2)   NULL COMMENT '额定功率(kW)',
    network_ports   INT             DEFAULT 0 COMMENT '网络端口数量',

    -- 状态与附加
    status          VARCHAR(20)     DEFAULT 'active' COMMENT '状态：active-在用, disabled-停用, retired-退役',
    attachments     TEXT            NULL COMMENT '附件（JSON格式存储路径）',
    remark          VARCHAR(500)    NULL COMMENT '备注',

    -- 审计字段
    del_flag        CHAR(1)         DEFAULT '0' COMMENT '删除标志(0-正常,1-删除)',
    create_by       VARCHAR(64)     DEFAULT '' COMMENT '创建者',
    create_time     DATETIME        DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    update_by       VARCHAR(64)     DEFAULT '' COMMENT '更新者',
    update_time     DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    PRIMARY KEY (rack_id),
    UNIQUE KEY uk_rack_no (rack_no),
    KEY idx_floor (floor),
    KEY idx_room (room),
    KEY idx_status (status),
    KEY idx_create_time (create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产机柜表';

-- =============================================
-- 字典配置
-- =============================================

-- 检查并添加 IDC 楼层字典类型
INSERT INTO sys_dict_type (dict_name, dict_type, status, remark, create_by, create_time)
SELECT 'IDC楼层', 'idc_floor', '0', '数据中心楼层字典', 'admin', NOW()
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM sys_dict_type WHERE dict_type = 'idc_floor'
);

-- 添加楼层字典数据
INSERT INTO sys_dict_data (dict_type, dict_label, dict_value, dict_sort, status, create_by, create_time)
SELECT 'idc_floor', '一楼', '1F', 1, '0', 'admin', NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type = 'idc_floor' AND dict_value = '1F')
UNION ALL
SELECT 'idc_floor', '二楼', '2F', 2, '0', 'admin', NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type = 'idc_floor' AND dict_value = '2F')
UNION ALL
SELECT 'idc_floor', '三楼', '3F', 3, '0', 'admin', NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type = 'idc_floor' AND dict_value = '3F')
UNION ALL
SELECT 'idc_floor', '四楼', '4F', 4, '0', 'admin', NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type = 'idc_floor' AND dict_value = '4F');

-- 检查并添加机柜状态字典类型
INSERT INTO sys_dict_type (dict_name, dict_type, status, remark, create_by, create_time)
SELECT '机柜状态', 'asset_rack_status', '0', '机柜运行状态', 'admin', NOW()
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM sys_dict_type WHERE dict_type = 'asset_rack_status'
);

-- 添加机柜状态字典数据
INSERT INTO sys_dict_data (dict_type, dict_label, dict_value, dict_sort, status, list_class, create_by, create_time)
SELECT 'asset_rack_status', '在用', 'active', 1, '0', 'success', 'admin', NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type = 'asset_rack_status' AND dict_value = 'active')
UNION ALL
SELECT 'asset_rack_status', '停用', 'disabled', 2, '0', 'warning', 'admin', NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type = 'asset_rack_status' AND dict_value = 'disabled')
UNION ALL
SELECT 'asset_rack_status', '退役', 'retired', 3, '0', 'info', 'admin', NOW() FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type = 'asset_rack_status' AND dict_value = 'retired');

-- =============================================
-- 初始化测试数据
-- =============================================

INSERT INTO biz_asset_rack (rack_no, rack_name, floor, room, location, u_count, u_used, power_capacity, network_ports, status, remark, create_by) VALUES
('RACK-F1-001', 'A区1号机柜', '1F', 'A区', '靠近主入口左侧', 42, 28, 10.5, 48, 'active', '主要存放核心服务器', 'admin'),
('RACK-F1-002', 'A区2号机柜', '1F', 'A区', '靠近主入口右侧', 42, 15, 10.5, 48, 'active', NULL, 'admin'),
('RACK-F1-003', 'B区1号机柜', '1F', 'B区', '配电室旁边', 42, 35, 12.0, 96, 'active', '高功率机柜', 'admin'),
('RACK-F2-001', 'A区1号机柜', '2F', 'A区', '窗户旁边', 42, 42, 10.5, 48, 'active', '已满载，需扩容', 'admin'),
('RACK-F2-002', 'B区1号机柜', '2F', 'B区', '空调旁边', 42, 10, 10.5, 48, 'active', NULL, 'admin'),
('RACK-F3-001', 'C区1号机柜', '3F', 'C区', '楼梯间附近', 42, 0, 10.5, 48, 'disabled', '维护中，暂停使用', 'admin'),
('RACK-F3-002', 'C区2号机柜', '3F', 'C区', '消防通道旁', 42, 8, 8.0, 24, 'active', '小型机柜', 'admin'),
('RACK-F4-001', 'D区1号机柜', '4F', 'D区', '备用机房', 42, 0, 10.5, 48, 'retired', '已退役，待处理', 'admin');

-- =============================================
-- 权限菜单配置（手动配置或通过管理界面添加）
-- =============================================
-- 注意：以下 SQL 仅供参考，实际应通过系统管理界面配置菜单和权限

-- 父菜单：资产管理（如果不存在）
-- INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark)
-- VALUES ('资产管理', 0, 4, 'asset', NULL, 1, 0, 'M', '0', '0', NULL, 'server', 'admin', NOW(), '资产管理目录');

-- 子菜单：机柜管理
-- INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark)
-- VALUES ('机柜管理', [父菜单ID], 1, 'rack', 'business/asset/rack/index', 1, 0, 'C', '0', '0', 'business:assetRack:list', 'server', 'admin', NOW(), '机柜管理菜单');

-- 权限按钮
-- INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, remark) VALUES
-- ('机柜查询', [机柜管理菜单ID], 1, '#', '', 1, 0, 'F', '0', '0', 'business:assetRack:query', '#', 'admin', NOW(), ''),
-- ('机柜新增', [机柜管理菜单ID], 2, '#', '', 1, 0, 'F', '0', '0', 'business:assetRack:add', '#', 'admin', NOW(), ''),
-- ('机柜修改', [机柜管理菜单ID], 3, '#', '', 1, 0, 'F', '0', '0', 'business:assetRack:edit', '#', 'admin', NOW(), ''),
-- ('机柜删除', [机柜管理菜单ID], 4, '#', '', 1, 0, 'F', '0', '0', 'business:assetRack:remove', '#', 'admin', NOW(), ''),
-- ('机柜导出', [机柜管理菜单ID], 5, '#', '', 1, 0, 'F', '0', '0', 'business:assetRack:export', '#', 'admin', NOW(), '');

-- =============================================
-- 验证语句
-- =============================================
-- SELECT * FROM biz_asset_rack;
-- SELECT * FROM sys_dict_type WHERE dict_type IN ('idc_floor', 'asset_rack_status');
-- SELECT * FROM sys_dict_data WHERE dict_type IN ('idc_floor', 'asset_rack_status');

-- =============================================
-- 回滚脚本（如需要）
-- =============================================
-- DROP TABLE IF EXISTS biz_asset_rack;
-- DELETE FROM sys_dict_data WHERE dict_type IN ('idc_floor', 'asset_rack_status');
-- DELETE FROM sys_dict_type WHERE dict_type IN ('idc_floor', 'asset_rack_status');
