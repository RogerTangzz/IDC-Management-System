-- Upgrade: ensure Message Center menu and permissions
-- Idempotent: safe to run multiple times

-- 1) Ensure top-level Business menu exists (path 'business')
SET @business_id := (SELECT menu_id FROM sys_menu WHERE path = 'business' OR menu_name IN ('IDC运维管理','业务管理') ORDER BY menu_id LIMIT 1);
SET @need_business := IF(@business_id IS NULL, 1, 0);
SET @max_id := (SELECT IFNULL(MAX(menu_id), 0) FROM sys_menu);
SET @new_business_id := @max_id + 1;
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
SELECT @new_business_id, 'IDC运维管理', 0, 1, 'business', 'Layout', 1, 0, 'M', '0', '0', NULL, 'monitor', 'system', NOW() FROM DUAL WHERE @need_business = 1;
SET @business_id := COALESCE(@business_id, @new_business_id);

-- 2) Ensure Message Center page exists under Business
SET @message_menu_id := (SELECT menu_id FROM sys_menu WHERE (path = 'message' AND parent_id = @business_id) OR menu_name = '消息中心' ORDER BY menu_id LIMIT 1);
SET @need_message := IF(@message_menu_id IS NULL, 1, 0);
SET @max_id := (SELECT IFNULL(MAX(menu_id), 0) FROM sys_menu);
SET @new_message_id := @max_id + 1;
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
SELECT @new_message_id, '消息中心', @business_id, 99, 'message', 'business/message/index', 1, 0, 'C', '0', '0', NULL, 'bell', 'system', NOW() FROM DUAL WHERE @need_message = 1;
SET @message_menu_id := COALESCE(@message_menu_id, @new_message_id);

-- 3) Ensure function buttons (permissions)
-- 3.1 list
SET @btn_list_id := (SELECT menu_id FROM sys_menu WHERE parent_id = @message_menu_id AND perms = 'business:message:list' LIMIT 1);
SET @need_btn_list := IF(@btn_list_id IS NULL, 1, 0);
SET @max_id := (SELECT IFNULL(MAX(menu_id), 0) FROM sys_menu);
SET @new_btn_list_id := @max_id + 1;
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
SELECT @new_btn_list_id, '消息查询', @message_menu_id, 1, '#', NULL, 1, 0, 'F', '0', '0', 'business:message:list', NULL, 'system', NOW() FROM DUAL WHERE @need_btn_list = 1;
SET @btn_list_id := COALESCE(@btn_list_id, @new_btn_list_id);

-- 3.2 read
SET @btn_read_id := (SELECT menu_id FROM sys_menu WHERE parent_id = @message_menu_id AND perms = 'business:message:read' LIMIT 1);
SET @need_btn_read := IF(@btn_read_id IS NULL, 1, 0);
SET @max_id := (SELECT IFNULL(MAX(menu_id), 0) FROM sys_menu);
SET @new_btn_read_id := @max_id + 1;
INSERT INTO sys_menu (menu_id, menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
SELECT @new_btn_read_id, '标记已读', @message_menu_id, 2, '#', NULL, 1, 0, 'F', '0', '0', 'business:message:read', NULL, 'system', NOW() FROM DUAL WHERE @need_btn_read = 1;
SET @btn_read_id := COALESCE(@btn_read_id, @new_btn_read_id);

-- 4) Grant to admin role (role_id = 1)
INSERT INTO sys_role_menu (role_id, menu_id) SELECT 1, @business_id WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id = 1 AND menu_id = @business_id);
INSERT INTO sys_role_menu (role_id, menu_id) SELECT 1, @message_menu_id WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id = 1 AND menu_id = @message_menu_id);
INSERT INTO sys_role_menu (role_id, menu_id) SELECT 1, @btn_list_id WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id = 1 AND menu_id = @btn_list_id);
INSERT INTO sys_role_menu (role_id, menu_id) SELECT 1, @btn_read_id WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id = 1 AND menu_id = @btn_read_id);

-- 5) Optional: Grant to a normal role (role_id = 2) if exists
INSERT INTO sys_role_menu (role_id, menu_id) SELECT 2, @message_menu_id WHERE EXISTS (SELECT 1 FROM sys_role WHERE role_id = 2) AND NOT EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id = 2 AND menu_id = @message_menu_id);
INSERT INTO sys_role_menu (role_id, menu_id) SELECT 2, @btn_list_id WHERE EXISTS (SELECT 1 FROM sys_role WHERE role_id = 2) AND NOT EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id = 2 AND menu_id = @btn_list_id);
INSERT INTO sys_role_menu (role_id, menu_id) SELECT 2, @btn_read_id WHERE EXISTS (SELECT 1 FROM sys_role WHERE role_id = 2) AND NOT EXISTS (SELECT 1 FROM sys_role_menu WHERE role_id = 2 AND menu_id = @btn_read_id);

-- End of upgrade
