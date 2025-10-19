-- =============================================
-- 初始化机柜U位数据
-- 为每个现有机柜创建对应数量的U位记录
-- =============================================

-- 清空现有数据(如果有)
TRUNCATE TABLE biz_rack_u_slot;

-- 为每个机柜生成U位记录
-- 使用存储过程批量生成

DELIMITER $$

DROP PROCEDURE IF EXISTS init_rack_u_slots$$

CREATE PROCEDURE init_rack_u_slots()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE v_rack_id BIGINT;
    DECLARE v_u_count INT;
    DECLARE v_u INT;

    -- 声明游标
    DECLARE rack_cursor CURSOR FOR
        SELECT rack_id, u_count
        FROM biz_asset_rack
        WHERE del_flag = '0';

    -- 声明当游标结束时设置done=1
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    -- 打开游标
    OPEN rack_cursor;

    -- 循环每个机柜
    read_loop: LOOP
        FETCH rack_cursor INTO v_rack_id, v_u_count;

        IF done THEN
            LEAVE read_loop;
        END IF;

        -- 为当前机柜创建U位记录(从1到u_count)
        SET v_u = 1;
        WHILE v_u <= v_u_count DO
            INSERT INTO biz_rack_u_slot (
                rack_id,
                u_number,
                status,
                del_flag,
                create_by,
                create_time
            ) VALUES (
                v_rack_id,
                v_u,
                'free',
                '0',
                'system',
                NOW()
            );

            SET v_u = v_u + 1;
        END WHILE;

    END LOOP;

    -- 关闭游标
    CLOSE rack_cursor;

END$$

DELIMITER ;

-- 执行存储过程
CALL init_rack_u_slots();

-- 查看统计结果
SELECT
    '初始化完成' AS status,
    COUNT(*) AS total_u_slots,
    COUNT(DISTINCT rack_id) AS rack_count,
    SUM(CASE WHEN status='free' THEN 1 ELSE 0 END) AS free_slots,
    SUM(CASE WHEN status='occupied' THEN 1 ELSE 0 END) AS occupied_slots
FROM biz_rack_u_slot;

-- 按机柜统计
SELECT
    r.rack_no,
    r.rack_name,
    r.u_count AS total_u,
    COUNT(s.slot_id) AS initialized_u
FROM biz_asset_rack r
LEFT JOIN biz_rack_u_slot s ON r.rack_id = s.rack_id AND s.del_flag='0'
WHERE r.del_flag='0'
GROUP BY r.rack_id, r.rack_no, r.rack_name, r.u_count
ORDER BY r.rack_no
LIMIT 10;

-- 删除存储过程(清理)
DROP PROCEDURE IF EXISTS init_rack_u_slots;
