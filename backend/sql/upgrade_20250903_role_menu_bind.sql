-- 将“消息中心”和“SLA 阈值设置”菜单授予管理员角色(admin)

-- 绑定消息中心菜单及其按钮权限
INSERT INTO sys_role_menu(role_id, menu_id)
SELECT r.role_id, m.menu_id
FROM (SELECT role_id FROM sys_role WHERE role_key='admin' LIMIT 1) r,
     (SELECT menu_id FROM sys_menu WHERE (path='message' AND menu_type='C') OR perms IN ('business:message:list','business:message:read')) m
WHERE NOT EXISTS (
    SELECT 1 FROM sys_role_menu rm WHERE rm.role_id=r.role_id AND rm.menu_id=m.menu_id
);

-- 绑定 SLA 设置菜单及其“保存”按钮（使用 system:config:edit）
INSERT INTO sys_role_menu(role_id, menu_id)
SELECT r.role_id, m.menu_id
FROM (SELECT role_id FROM sys_role WHERE role_key='admin' LIMIT 1) r,
     (SELECT menu_id FROM sys_menu WHERE (path='settings/sla' AND menu_type='C') OR perms IN ('system:config:edit')) m
WHERE NOT EXISTS (
    SELECT 1 FROM sys_role_menu rm WHERE rm.role_id=r.role_id AND rm.menu_id=m.menu_id
);

