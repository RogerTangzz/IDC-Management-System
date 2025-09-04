-- 新增“工单报表”菜单项与权限，并为 admin/common 角色授权（幂等）

-- 1) 在工单管理（ticket 模块）下新增“工单报表”菜单
INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
SELECT '工单报表', p.menu_id, '50', 'report', 'business/ticket/report', 1, 0, 'C', '0', '0', NULL, 'chart', 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='ticket' AND menu_type='M' LIMIT 1) p
WHERE NOT EXISTS (
  SELECT 1 FROM sys_menu m WHERE m.path='report' AND m.menu_type='C' AND m.parent_id = p.menu_id
);

-- 2) 新增按钮权限：business:ticket:report（报表查看/导出接口权限）
INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
SELECT '报表权限', m.menu_id, '1', '#', NULL, 1, 0, 'F', '0', '0', 'business:ticket:report', NULL, 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='report' AND menu_type='C' LIMIT 1) m
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE perms='business:ticket:report');

-- 3) 授权给 admin 角色
INSERT INTO sys_role_menu(role_id, menu_id)
SELECT r.role_id, m.menu_id
FROM (SELECT role_id FROM sys_role WHERE role_key='admin' LIMIT 1) r,
     (SELECT menu_id FROM sys_menu WHERE (path='report' AND menu_type='C') OR perms='business:ticket:report') m
WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu rm WHERE rm.role_id=r.role_id AND rm.menu_id=m.menu_id);

-- 4) 确保 common 角色存在
INSERT INTO sys_role(role_name, role_key, role_sort, data_scope, status, del_flag, create_by, create_time, remark)
SELECT '普通角色', 'common', '2', '1', '0', '0', 'system', NOW(), '自动创建的普通角色'
WHERE NOT EXISTS (SELECT 1 FROM sys_role WHERE role_key='common');

-- 5) 授权给 common 角色
INSERT INTO sys_role_menu(role_id, menu_id)
SELECT r.role_id, m.menu_id
FROM (SELECT role_id FROM sys_role WHERE role_key='common' LIMIT 1) r,
     (SELECT menu_id FROM sys_menu WHERE (path='report' AND menu_type='C') OR perms='business:ticket:report') m
WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu rm WHERE rm.role_id=r.role_id AND rm.menu_id=m.menu_id);

