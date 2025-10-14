-- upgrade_20251014_add_maintenance_planned_fields_pg.sql
-- Align maintenance plan table with planned_* dates and item_count persistence (PostgreSQL version).

ALTER TABLE IF EXISTS biz_maintenance
    ADD COLUMN IF NOT EXISTS planned_start_date TIMESTAMP NULL;

ALTER TABLE IF EXISTS biz_maintenance
    ADD COLUMN IF NOT EXISTS planned_end_date TIMESTAMP NULL;

ALTER TABLE IF EXISTS biz_maintenance
    ADD COLUMN IF NOT EXISTS item_count INTEGER NULL;

CREATE INDEX IF NOT EXISTS idx_biz_maintenance_planned_start_date ON biz_maintenance (planned_start_date);
