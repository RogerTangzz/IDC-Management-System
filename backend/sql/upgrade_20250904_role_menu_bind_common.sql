-- 为普通角色(common)授予“消息中心”“SLA设置”菜单及权限（若不存在则先创建 common 角色）

-- 1) 确保 common 角色存在
INSERT INTO sys_role(role_name, role_key, role_sort, data_scope, status, del_flag, create_by, create_time, remark)
SELECT '普通角色', 'common', '2', '1', '0', '0', 'system', NOW(), '自动创建的普通角色'
WHERE NOT EXISTS (SELECT 1 FROM sys_role WHERE role_key='common');

-- 2) 绑定消息中心菜单及权限
INSERT INTO sys_role_menu(role_id, menu_id)
SELECT r.role_id, m.menu_id
FROM (SELECT role_id FROM sys_role WHERE role_key='common' LIMIT 1) r,
     (SELECT menu_id FROM sys_menu WHERE (path='message' AND menu_type='C') OR perms IN ('business:message:list','business:message:read')) m
WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu rm WHERE rm.role_id=r.role_id AND rm.menu_id=m.menu_id);

-- 3) 绑定 SLA 设置菜单及其“保存”权限
INSERT INTO sys_role_menu(role_id, menu_id)
SELECT r.role_id, m.menu_id
FROM (SELECT role_id FROM sys_role WHERE role_key='common' LIMIT 1) r,
     (SELECT menu_id FROM sys_menu WHERE (path='settings/sla' AND menu_type='C') OR perms IN ('system:config:edit')) m
WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu rm WHERE rm.role_id=r.role_id AND rm.menu_id=m.menu_id);

