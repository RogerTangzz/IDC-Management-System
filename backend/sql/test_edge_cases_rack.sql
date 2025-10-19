-- =====================================================
-- M4 机柜管理 - 边缘场景测试数据
-- 用途：测试空数据、大量数据、异常输入等边缘场景
-- 创建时间：2025-01-18
-- =====================================================

USE idc_clean;

-- =====================================================
-- 场景 1：清空所有数据测试（测试空列表）
-- =====================================================
-- 注意：仅用于测试，正式环境请勿执行
-- UPDATE biz_asset_rack SET del_flag = '1' WHERE del_flag = '0';

-- =====================================================
-- 场景 2：极端值测试
-- =====================================================

-- 2.1 最小U数机柜（1U）
INSERT INTO biz_asset_rack (
    rack_no, rack_name, floor, room, location,
    u_count, u_used, power_capacity, network_ports,
    status, remark, del_flag, create_by, create_time
) VALUES (
    'EDGE-MIN-001', '最小1U机柜', '1F', '测试区', '边缘测试位置1',
    1, 0, 0.5, 0,
    'active', '边缘测试：最小U数', '0', 'admin', NOW()
);

-- 2.2 最大U数机柜（100U）
INSERT INTO biz_asset_rack (
    rack_no, rack_name, floor, room, location,
    u_count, u_used, power_capacity, network_ports,
    status, remark, del_flag, create_by, create_time
) VALUES (
    'EDGE-MAX-001', '最大100U机柜', '1F', '测试区', '边缘测试位置2',
    100, 0, 50.0, 96,
    'active', '边缘测试：最大U数', '0', 'admin', NOW()
);

-- 2.3 满载机柜（占用率100%）
INSERT INTO biz_asset_rack (
    rack_no, rack_name, floor, room, location,
    u_count, u_used, power_capacity, network_ports,
    status, remark, del_flag, create_by, create_time
) VALUES (
    'EDGE-FULL-001', '满载机柜', '2F', '测试区', '边缘测试位置3',
    42, 42, 10.0, 24,
    'active', '边缘测试：100%占用率', '0', 'admin', NOW()
);

-- 2.4 零功率机柜
INSERT INTO biz_asset_rack (
    rack_no, rack_name, floor, room, location,
    u_count, u_used, power_capacity, network_ports,
    status, remark, del_flag, create_by, create_time
) VALUES (
    'EDGE-ZERO-001', '零功率机柜', '3F', '测试区', '边缘测试位置4',
    42, 10, 0, 0,
    'active', '边缘测试：零额定功率', '0', 'admin', NOW()
);

-- 2.5 超长名称机柜（接近字段上限）
INSERT INTO biz_asset_rack (
    rack_no, rack_name, floor, room, location,
    u_count, u_used, power_capacity, network_ports,
    status, remark, del_flag, create_by, create_time
) VALUES (
    'EDGE-LONG-001',
    '超长名称测试机柜-这是一个非常非常长的机柜名称用于测试系统对长名称的处理能力-ABCDEFGHIJ1234567890',
    '4F', '测试区', '边缘测试位置5',
    42, 5, 10.0, 24,
    'active', '边缘测试：超长名称（接近100字符上限）', '0', 'admin', NOW()
);

-- 2.6 特殊字符机柜
INSERT INTO biz_asset_rack (
    rack_no, rack_name, floor, room, location,
    u_count, u_used, power_capacity, network_ports,
    status, remark, del_flag, create_by, create_time
) VALUES (
    'EDGE-SPECIAL-001',
    '特殊字符测试<>&"''机柜',
    '1F', '测试区-A&B', '位置：C<D>E',
    42, 10, 10.0, 24,
    'active', '边缘测试：特殊字符<>&"''', '0', 'admin', NOW()
);

-- 2.7 不同状态机柜
INSERT INTO biz_asset_rack (
    rack_no, rack_name, floor, room, location,
    u_count, u_used, power_capacity, network_ports,
    status, remark, del_flag, create_by, create_time
) VALUES
('EDGE-STATUS-001', '停用状态机柜', '2F', '测试区', '状态测试位置1', 42, 0, 10.0, 24, 'disabled', '边缘测试：停用状态', '0', 'admin', NOW()),
('EDGE-STATUS-002', '退役状态机柜', '2F', '测试区', '状态测试位置2', 42, 0, 10.0, 24, 'retired', '边缘测试：退役状态', '0', 'admin', NOW());

-- =====================================================
-- 场景 3：性能压测数据（批量插入 100 条）
-- =====================================================

-- 创建临时变量用于循环
SET @counter = 1;

-- 批量插入 100 条数据
INSERT INTO biz_asset_rack (
    rack_no, rack_name, floor, room, location,
    u_count, u_used, power_capacity, network_ports,
    status, remark, del_flag, create_by, create_time
)
SELECT
    CONCAT('PERF-', LPAD(@counter := @counter + 1, 5, '0')) AS rack_no,
    CONCAT('性能测试机柜-', LPAD(@counter, 5, '0')) AS rack_name,
    CASE
        WHEN @counter % 4 = 1 THEN '1F'
        WHEN @counter % 4 = 2 THEN '2F'
        WHEN @counter % 4 = 3 THEN '3F'
        ELSE '4F'
    END AS floor,
    CONCAT('房间-', FLOOR(@counter / 10)) AS room,
    CONCAT('位置-', @counter, '号') AS location,
    42 AS u_count,
    FLOOR(RAND() * 42) AS u_used,
    ROUND(RAND() * 20 + 5, 2) AS power_capacity,
    FLOOR(RAND() * 48) AS network_ports,
    CASE
        WHEN @counter % 10 = 0 THEN 'disabled'
        WHEN @counter % 20 = 0 THEN 'retired'
        ELSE 'active'
    END AS status,
    CONCAT('性能测试数据-', @counter) AS remark,
    '0' AS del_flag,
    'admin' AS create_by,
    DATE_ADD(NOW(), INTERVAL -@counter DAY) AS create_time
FROM
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
     SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t1,
    (SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
     SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10) t2
LIMIT 100;

-- =====================================================
-- 场景 4：NULL 值测试
-- =====================================================

-- 4.1 可选字段全为 NULL
INSERT INTO biz_asset_rack (
    rack_no, rack_name, floor, room, location,
    u_count, u_used, power_capacity, network_ports,
    status, remark, del_flag, create_by, create_time
) VALUES (
    'EDGE-NULL-001', '可选字段NULL测试', '1F', NULL, NULL,
    42, 0, NULL, NULL,
    'active', NULL, '0', 'admin', NOW()
);

-- =====================================================
-- 验证查询
-- =====================================================

-- 统计总记录数
SELECT
    '总记录数' AS 描述,
    COUNT(*) AS 数量
FROM biz_asset_rack
WHERE del_flag = '0';

-- 按状态统计
SELECT
    status AS 状态,
    COUNT(*) AS 数量
FROM biz_asset_rack
WHERE del_flag = '0'
GROUP BY status;

-- 按楼层统计
SELECT
    floor AS 楼层,
    COUNT(*) AS 数量
FROM biz_asset_rack
WHERE del_flag = '0'
GROUP BY floor
ORDER BY floor;

-- 占用率统计
SELECT
    '占用率区间' AS 类型,
    SUM(CASE WHEN (u_used / u_count) < 0.5 THEN 1 ELSE 0 END) AS '低于50%',
    SUM(CASE WHEN (u_used / u_count) >= 0.5 AND (u_used / u_count) < 0.7 THEN 1 ELSE 0 END) AS '50%-70%',
    SUM(CASE WHEN (u_used / u_count) >= 0.7 AND (u_used / u_count) < 0.9 THEN 1 ELSE 0 END) AS '70%-90%',
    SUM(CASE WHEN (u_used / u_count) >= 0.9 THEN 1 ELSE 0 END) AS '90%以上'
FROM biz_asset_rack
WHERE del_flag = '0';

-- =====================================================
-- 清理测试数据（测试完成后执行）
-- =====================================================

/*
-- 删除所有边缘测试数据
UPDATE biz_asset_rack
SET del_flag = '1', update_time = NOW(), update_by = 'admin'
WHERE rack_no LIKE 'EDGE-%'
   OR rack_no LIKE 'PERF-%';

-- 验证清理结果
SELECT COUNT(*) AS '剩余有效记录'
FROM biz_asset_rack
WHERE del_flag = '0';
*/
