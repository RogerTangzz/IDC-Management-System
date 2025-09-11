-- 升级脚本：持久化 last_status_time / last_action 并新增 reopen 动作
-- 1. 表结构变更（若已存在请忽略报错）
ALTER TABLE biz_ticket ADD COLUMN IF NOT EXISTS last_status_time DATETIME NULL AFTER attachments;
ALTER TABLE biz_ticket ADD COLUMN IF NOT EXISTS last_action VARCHAR(32) NULL AFTER last_status_time;

-- 2. 现有数据回填：取最新一条日志
UPDATE biz_ticket t
JOIN (
  SELECT l.ticket_id, l.action, l.create_time
  FROM biz_ticket_log l
  INNER JOIN (
    SELECT ticket_id, MAX(log_id) AS max_id FROM biz_ticket_log GROUP BY ticket_id
  ) m ON l.ticket_id = m.ticket_id AND l.log_id = m.max_id
) lg ON t.ticket_id = lg.ticket_id
SET t.last_action = lg.action,
    t.last_status_time = lg.create_time
WHERE t.last_action IS NULL OR t.last_status_time IS NULL;

-- 3. 新增 reopen 字典（若不存在）
INSERT INTO sys_dict_data(dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, remark)
SELECT NULL,8,'重新打开','reopen','ticket_action',NULL,'warning','N','0','system',NOW(),'重新打开工单'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='ticket_action' AND dict_value='reopen');

-- 4. 权限菜单（示例，需根据实际菜单结构调整 parent_id）
-- INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
-- SELECT '工单重新打开', <PARENT_ID>, '9', 'reopen', NULL, 1, 0, 'F', '0', '0', 'business:ticket:reopen', '#', 'system', NOW()
-- WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE perms='business:ticket:reopen');
