-- 升级脚本：给 biz_message 增加业务关联字段（如工单）
ALTER TABLE biz_message ADD COLUMN IF NOT EXISTS biz_type varchar(30) NULL COMMENT '业务类型(ticket等)' AFTER read_flag;
ALTER TABLE biz_message ADD COLUMN IF NOT EXISTS biz_id bigint(20) NULL COMMENT '业务ID' AFTER biz_type;

