-- import.sql
-- 主导入脚本
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET sql_mode = 'NO_ENGINE_SUBSTITUTION';

-- 导入表结构
SOURCE C:/Users/1/Downloads/IDC-Management-System/IDC-Management-System/backend/sql/create_tables.sql;

-- 导入数据
SOURCE C:/Users/1/Downloads/IDC-Management-System/IDC-Management-System/backend/sql/insert_data.sql;

-- 恢复设置
SET FOREIGN_KEY_CHECKS = 1;