-- 为 biz_ticket 增加常用索引（若不存在）
ALTER TABLE biz_ticket ADD INDEX IF NOT EXISTS idx_deadline (deadline);
ALTER TABLE biz_ticket ADD INDEX IF NOT EXISTS idx_last_status_time (last_status_time);

