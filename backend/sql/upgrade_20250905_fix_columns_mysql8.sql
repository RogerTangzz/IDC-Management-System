-- 统一补丁：修复低版本/兼容性执行失败的 IF NOT EXISTS 语法，手动添加缺失列与索引
-- 执行说明：
--  1. 如果列已存在会报 1060 Duplicate column，可以忽略。
--  2. 如果索引已存在会报 1061 Duplicate key name，可以忽略。
--  3. 按顺序执行整文件即可。

-- 1. biz_ticket 补列
ALTER TABLE biz_ticket ADD COLUMN last_status_time DATETIME NULL COMMENT '最近状态变更时间' AFTER attachments;
ALTER TABLE biz_ticket ADD COLUMN last_action VARCHAR(50) NULL COMMENT '最近动作' AFTER last_status_time;

-- 2. 初始化空值（仅首次有效）
UPDATE biz_ticket SET last_status_time = create_time WHERE last_status_time IS NULL;

-- 3. 索引（若已存在忽略 1061）
ALTER TABLE biz_ticket ADD INDEX idx_last_status_time (last_status_time);

-- 4. biz_message 业务引用列（若之前脚本未成功）
ALTER TABLE biz_message ADD COLUMN biz_type varchar(30) NULL COMMENT '业务类型(ticket等)' AFTER read_flag;
ALTER TABLE biz_message ADD COLUMN biz_id bigint(20) NULL COMMENT '业务ID' AFTER biz_type;

-- 5. biz_message 可按需创建复合索引（示例，可选）
-- ALTER TABLE biz_message ADD INDEX idx_biz (biz_type, biz_id);

-- 6. 回填 reopen 字典（幂等）
INSERT INTO sys_dict_data(dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, remark)
SELECT NULL,8,'重新打开','reopen','ticket_action',NULL,'warning','N','0','system',NOW(),'重新打开工单'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='ticket_action' AND dict_value='reopen');

-- 7. 校验（可手动执行）
-- SHOW COLUMNS FROM biz_ticket LIKE 'last_status_time';
-- SHOW COLUMNS FROM biz_ticket LIKE 'last_action';
-- SHOW INDEX FROM biz_ticket WHERE Key_name='idx_last_status_time';
