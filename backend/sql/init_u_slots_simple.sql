-- 使用 numbers 表技巧批量生成U位记录

-- 第一步:创建临时numbers表(1-100的数字)
DROP TEMPORARY TABLE IF EXISTS numbers;
CREATE TEMPORARY TABLE numbers (n INT);

INSERT INTO numbers VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10),
(11),(12),(13),(14),(15),(16),(17),(18),(19),(20),
(21),(22),(23),(24),(25),(26),(27),(28),(29),(30),
(31),(32),(33),(34),(35),(36),(37),(38),(39),(40),
(41),(42),(43),(44),(45),(46),(47),(48),(49),(50),
(51),(52),(53),(54),(55),(56),(57),(58),(59),(60),
(61),(62),(63),(64),(65),(66),(67),(68),(69),(70),
(71),(72),(73),(74),(75),(76),(77),(78),(79),(80),
(81),(82),(83),(84),(85),(86),(87),(88),(89),(90),
(91),(92),(93),(94),(95),(96),(97),(98),(99),(100);

-- 第二步:批量插入U位数据
INSERT INTO biz_rack_u_slot (rack_id, u_number, status, del_flag, create_by, create_time)
SELECT
    r.rack_id,
    n.n AS u_number,
    'free' AS status,
    '0' AS del_flag,
    'system' AS create_by,
    NOW() AS create_time
FROM biz_asset_rack r
CROSS JOIN numbers n
WHERE r.del_flag = '0'
  AND n.n <= r.u_count;

-- 第三步:查看统计结果
SELECT
    COUNT(*) AS total_u_slots,
    COUNT(DISTINCT rack_id) AS rack_count,
    SUM(CASE WHEN status='free' THEN 1 ELSE 0 END) AS free_slots
FROM biz_rack_u_slot;
