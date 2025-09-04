-- 资产管理菜单与权限，授权给 admin/common（幂等）

-- 1) 在业务模块下新增“资产管理”父菜单
INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
SELECT '资产管理', p.menu_id, '60', 'asset', 'ParentView', 1, 0, 'M', '0', '0', NULL, 'tool', 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='business' AND menu_type='M' LIMIT 1) p
WHERE NOT EXISTS (
  SELECT 1 FROM sys_menu m WHERE m.path='asset' AND m.menu_type='M' AND m.parent_id = p.menu_id
);

-- 2) 子菜单：机柜使用（列表/详情页前端路由）
INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
SELECT '机柜使用', m.menu_id, '10', 'rack', 'business/asset/rack/index', 1, 0, 'C', '0', '0', NULL, 'list', 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='asset' AND menu_type='M' LIMIT 1) m
WHERE NOT EXISTS (
  SELECT 1 FROM sys_menu s WHERE s.path='rack' AND s.menu_type='C' AND s.parent_id=m.menu_id
);

-- 3) 子菜单：机房管理（可选）
INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
SELECT '机房管理', m.menu_id, '20', 'room', 'business/asset/room/index', 1, 0, 'C', '0', '0', NULL, 'home-filled', 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='asset' AND menu_type='M' LIMIT 1) m
WHERE NOT EXISTS (
  SELECT 1 FROM sys_menu s WHERE s.path='room' AND s.menu_type='C' AND s.parent_id=m.menu_id
);

-- 4) 权限按钮（机房）
INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, menu_type, visible, status, perms, create_by, create_time)
SELECT '机房查询', r.menu_id, '1', '#', NULL, 'F', '0', '0', 'business:asset:room:list', 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='room' AND menu_type='C' LIMIT 1) r
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE perms='business:asset:room:list');

INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, menu_type, visible, status, perms, create_by, create_time)
SELECT '机房新增', r.menu_id, '2', '#', NULL, 'F', '0', '0', 'business:asset:room:add', 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='room' AND menu_type='C' LIMIT 1) r
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE perms='business:asset:room:add');

INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, menu_type, visible, status, perms, create_by, create_time)
SELECT '机房编辑', r.menu_id, '3', '#', NULL, 'F', '0', '0', 'business:asset:room:edit', 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='room' AND menu_type='C' LIMIT 1) r
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE perms='business:asset:room:edit');

INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, menu_type, visible, status, perms, create_by, create_time)
SELECT '机房删除', r.menu_id, '4', '#', NULL, 'F', '0', '0', 'business:asset:room:remove', 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='room' AND menu_type='C' LIMIT 1) r
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE perms='business:asset:room:remove');

-- 5) 权限按钮（机柜）
INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, menu_type, visible, status, perms, create_by, create_time)
SELECT '机柜查询', r.menu_id, '1', '#', NULL, 'F', '0', '0', 'business:asset:rack:list', 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='rack' AND menu_type='C' LIMIT 1) r
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE perms='business:asset:rack:list');

INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, menu_type, visible, status, perms, create_by, create_time)
SELECT '机柜新增', r.menu_id, '2', '#', NULL, 'F', '0', '0', 'business:asset:rack:add', 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='rack' AND menu_type='C' LIMIT 1) r
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE perms='business:asset:rack:add');

INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, menu_type, visible, status, perms, create_by, create_time)
SELECT '机柜编辑', r.menu_id, '3', '#', NULL, 'F', '0', '0', 'business:asset:rack:edit', 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='rack' AND menu_type='C' LIMIT 1) r
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE perms='business:asset:rack:edit');

INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, menu_type, visible, status, perms, create_by, create_time)
SELECT '机柜删除', r.menu_id, '4', '#', NULL, 'F', '0', '0', 'business:asset:rack:remove', 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='rack' AND menu_type='C' LIMIT 1) r
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE perms='business:asset:rack:remove');

INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, menu_type, visible, status, perms, create_by, create_time)
SELECT '机柜U位查询', r.menu_id, '5', '#', NULL, 'F', '0', '0', 'business:asset:rack:query', 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='rack' AND menu_type='C' LIMIT 1) r
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE perms='business:asset:rack:query');

INSERT INTO sys_menu(menu_name, parent_id, order_num, path, component, menu_type, visible, status, perms, create_by, create_time)
SELECT '机柜U位占用', r.menu_id, '6', '#', NULL, 'F', '0', '0', 'business:asset:rack:occupy', 'system', NOW()
FROM (SELECT menu_id FROM sys_menu WHERE path='rack' AND menu_type='C' LIMIT 1) r
WHERE NOT EXISTS (SELECT 1 FROM sys_menu WHERE perms='business:asset:rack:occupy');

-- 6) 授权给 admin 与 common
INSERT INTO sys_role_menu(role_id, menu_id)
SELECT r.role_id, m.menu_id
FROM (SELECT role_id FROM sys_role WHERE role_key in ('admin','common')) r,
     (SELECT menu_id FROM sys_menu WHERE parent_id IN (SELECT menu_id FROM sys_menu WHERE path='asset' AND menu_type='M') OR path='asset' OR perms LIKE 'business:asset:%') m
WHERE NOT EXISTS (SELECT 1 FROM sys_role_menu rm WHERE rm.role_id=r.role_id AND rm.menu_id=m.menu_id);

