-- 工单动作字典
INSERT INTO sys_dict_type(dict_id, dict_name, dict_type, status, create_by, create_time, remark) VALUES
 (NULL, '工单动作', 'ticket_action', '0', 'system', NOW(), '工单操作动作');

-- 具体数据（若 dict_type 已存在请只插入数据行）
INSERT INTO sys_dict_data(dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, remark) VALUES
 (NULL,1,'创建','create','ticket_action',NULL,'primary','N','0','system',NOW(),'创建工单'),
 (NULL,2,'更新','update','ticket_action',NULL,'info','N','0','system',NOW(),'更新字段/状态'),
 (NULL,3,'编辑','edit','ticket_action',NULL,'info','N','0','system',NOW(),'非状态变化编辑'),
 (NULL,4,'指派','assign','ticket_action',NULL,'info','N','0','system',NOW(),'指派处理人'),
 (NULL,5,'开始处理','start','ticket_action',NULL,'warning','N','0','system',NOW(),'开始处理'),
 (NULL,6,'完成','complete','ticket_action',NULL,'success','N','0','system',NOW(),'处理完成'),
 (NULL,7,'关闭','close','ticket_action',NULL,'danger','N','0','system',NOW(),'关闭工单');
-- 新增：reopen
INSERT INTO sys_dict_data(dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, remark)
SELECT NULL,8,'重新打开','reopen','ticket_action',NULL,'warning','N','0','system',NOW(),'重新打开工单'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='ticket_action' AND dict_value='reopen');
-- 新增：SLA 预警/超时
INSERT INTO sys_dict_data(dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, remark)
SELECT NULL,9,'超时预警','sla_warn','ticket_action',NULL,'warning','N','0','system',NOW(),'SLA 即将超时预警'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='ticket_action' AND dict_value='sla_warn');
INSERT INTO sys_dict_data(dict_code, dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, remark)
SELECT NULL,10,'已超时','sla_overdue','ticket_action',NULL,'danger','N','0','system',NOW(),'SLA 已超时'
WHERE NOT EXISTS (SELECT 1 FROM sys_dict_data WHERE dict_type='ticket_action' AND dict_value='sla_overdue');
