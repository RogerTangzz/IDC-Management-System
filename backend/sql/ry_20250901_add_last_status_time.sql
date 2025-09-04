-- 增量脚本: 添加 last_status_time, last_action 字段 (如果不存在)
ALTER TABLE biz_ticket 
  ADD COLUMN IF NOT EXISTS `last_status_time` datetime DEFAULT NULL COMMENT '最近状态变更时间';
ALTER TABLE biz_ticket 
  ADD COLUMN IF NOT EXISTS `last_action` varchar(50) DEFAULT NULL COMMENT '最近动作';

-- 对老数据初始化 last_status_time = create_time (仅当为空)
UPDATE biz_ticket SET last_status_time = create_time WHERE last_status_time IS NULL;
