-- =======================================================
-- M4 机柜管理 - 查询性能优化索引
-- 用途：添加复合索引，优化常见查询模式
-- 创建时间：2025-01-18
-- =======================================================

USE idc_clean;

-- ======================================================
-- 1. 分析现有索引
-- ======================================================
SHOW INDEX FROM biz_asset_rack;

-- ======================================================
-- 2. 添加复合索引（优化常见查询模式）
-- ======================================================

-- 复合索引：删除标记 + 楼层 + 状态 + 创建时间
-- 覆盖最常见的查询场景：WHERE del_flag='0' AND floor=? AND status=? ORDER BY create_time
-- 注意：仅在索引不存在时创建（幂等性）
SELECT '添加复合索引: idx_del_floor_status_time' AS '操作';

-- 检查索引是否存在
SET @index_exists = (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = 'idc_clean'
    AND table_name = 'biz_asset_rack'
    AND index_name = 'idx_del_floor_status_time'
);

-- 如果不存在则创建
SET @sql_create_index = IF(
    @index_exists = 0,
    'CREATE INDEX idx_del_floor_status_time ON biz_asset_rack (del_flag, floor, status, create_time DESC)',
    'SELECT "索引 idx_del_floor_status_time 已存在，跳过创建" AS 提示'
);

PREPARE stmt FROM @sql_create_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ======================================================
-- 3. 查询性能测试
-- ======================================================

SELECT '=== 查询性能测试 ===' AS '';

-- 测试 1：按楼层和状态筛选 + 排序
SELECT '测试 1: 楼层+状态筛选+时间排序' AS 测试场景;
EXPLAIN SELECT rack_id, rack_no, rack_name, floor, status, create_time
FROM biz_asset_rack
WHERE del_flag='0' AND floor='1F' AND status='active'
ORDER BY create_time DESC
LIMIT 10;

-- 测试 2：只按楼层筛选
SELECT '测试 2: 只按楼层筛选' AS 测试场景;
EXPLAIN SELECT rack_id, rack_no, rack_name, floor
FROM biz_asset_rack
WHERE del_flag='0' AND floor='2F'
LIMIT 10;

-- 测试 3：按机柜编号查询（唯一索引）
SELECT '测试 3: 按机柜编号查询' AS 测试场景;
EXPLAIN SELECT *
FROM biz_asset_rack
WHERE rack_no='RACK-001' AND del_flag='0';

-- 测试 4：全表扫描（只按删除标记）
SELECT '测试 4: 全表查询+排序' AS 测试场景;
EXPLAIN SELECT *
FROM biz_asset_rack
WHERE del_flag='0'
ORDER BY create_time DESC
LIMIT 10;

-- ======================================================
-- 4. 索引统计信息
-- ======================================================

SELECT '=== 索引统计信息 ===' AS '';

SELECT
    INDEX_NAME AS 索引名称,
    NON_UNIQUE AS 是否唯一,
    SEQ_IN_INDEX AS 列顺序,
    COLUMN_NAME AS 列名,
    CARDINALITY AS 基数,
    INDEX_TYPE AS 索引类型
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'idc_clean'
  AND TABLE_NAME = 'biz_asset_rack'
ORDER BY INDEX_NAME, SEQ_IN_INDEX;

-- ======================================================
-- 5. 表统计信息
-- ======================================================

SELECT
    TABLE_NAME AS 表名,
    TABLE_ROWS AS 行数估算,
    AVG_ROW_LENGTH AS 平均行长度,
    DATA_LENGTH AS 数据大小,
    INDEX_LENGTH AS 索引大小,
    ROUND(DATA_LENGTH / 1024, 2) AS '数据大小(KB)',
    ROUND(INDEX_LENGTH / 1024, 2) AS '索引大小(KB)',
    ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024, 2) AS '总大小(KB)'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'idc_clean'
  AND TABLE_NAME = 'biz_asset_rack';

-- ======================================================
-- 6. 性能优化建议
-- ======================================================

SELECT '=== 性能优化建议 ===' AS '';

SELECT
    '1. 定期执行 ANALYZE TABLE biz_asset_rack 更新统计信息' AS 建议
UNION ALL
SELECT
    '2. 监控慢查询日志，识别未优化的查询'
UNION ALL
SELECT
    '3. 当数据量超过10000时，考虑添加分区表'
UNION ALL
SELECT
    '4. 定期清理 del_flag=1 的数据（物理删除）'
UNION ALL
SELECT
    '5. 考虑使用 Redis 缓存热点数据（如字典数据）';

-- 更新统计信息
ANALYZE TABLE biz_asset_rack;
