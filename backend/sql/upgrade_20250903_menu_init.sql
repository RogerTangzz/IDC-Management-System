-- 初始化菜单与权限：消息中心 / SLA 设置

-- 1) 消息中心（业务：/business/message）
INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
SELECT '消息中心', p.menu_id, '90', 'message', 'business/message/index', 1, 0, 'C', '0', '0', NULL, 'bell', 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='business' AND menu_type='M' LIMIT 1) p
WHERE NOT EXISTS (
  SELECT 1 FROM sys_menu m WHERE m.path='message' AND m.menu_type='C' AND m.parent_id = p.menu_id
);

-- 权限按钮：business:message:list
INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
SELECT '消息查询', m.menu_id, '1', '#', NULL, 1, 0, 'F', '0', '0', 'business:message:list', NULL, 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='message' AND menu_type='C' LIMIT 1) m
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE perms='business:message:list');

-- 权限按钮：business:message:read
INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
SELECT '标记已读', m.menu_id, '2', '#', NULL, 1, 0, 'F', '0', '0', 'business:message:read', NULL, 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='message' AND menu_type='C' LIMIT 1) m
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE perms='business:message:read');

-- 2) SLA 设置（业务：/business/settings/sla）
INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
SELECT 'SLA 阈值设置', p.menu_id, '91', 'settings/sla', 'business/settings/sla', 1, 0, 'C', '0', '0', NULL, 'setting', 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='business' AND menu_type='M' LIMIT 1) p
WHERE NOT EXISTS (
  SELECT 1 FROM sys_menu m WHERE m.path='settings/sla' AND m.menu_type='C' AND m.parent_id = p.menu_id
);

-- 可选：为 SLA 设置添加“编辑”权限（沿用系统参数的权限编码）
INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
SELECT 'SLA 保存', m.menu_id, '1', '#', NULL, 1, 0, 'F', '0', '0', 'system:config:edit', NULL, 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='settings/sla' AND menu_type='C' LIMIT 1) m
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE perms='system:config:edit');

