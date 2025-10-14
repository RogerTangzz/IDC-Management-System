-- upgrade_20251014_add_maintenance_planned_fields_mysql.sql
-- Align maintenance plan table with planned_* dates and item_count persistence.

ALTER TABLE biz_maintenance
    ADD COLUMN IF NOT EXISTS planned_start_date DATETIME NULL COMMENT ''Planned start date (persisted fallback)'';

ALTER TABLE biz_maintenance
    ADD COLUMN IF NOT EXISTS planned_end_date DATETIME NULL COMMENT ''Planned end date (persisted fallback)'';

ALTER TABLE biz_maintenance
    ADD COLUMN IF NOT EXISTS item_count INT NULL COMMENT ''Estimated maintenance item count'';

-- Helpful index for queries that sort or filter by planned start date.
CREATE INDEX IF NOT EXISTS idx_biz_maintenance_planned_start_date ON biz_maintenance (planned_start_date);
