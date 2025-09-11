-- H2 schema for minimal bootstrapping during tests
CREATE TABLE IF NOT EXISTS sys_config (
  config_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  config_name VARCHAR(100),
  config_key VARCHAR(100),
  config_value VARCHAR(500),
  config_type CHAR(1),
  create_by VARCHAR(64),
  create_time TIMESTAMP,
  update_by VARCHAR(64),
  update_time TIMESTAMP,
  remark VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS sys_dict_type (
  dict_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  dict_name VARCHAR(100),
  dict_type VARCHAR(100),
  status CHAR(1),
  create_by VARCHAR(64),
  create_time TIMESTAMP,
  update_by VARCHAR(64),
  update_time TIMESTAMP,
  remark VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS sys_dict_data (
  dict_code BIGINT AUTO_INCREMENT PRIMARY KEY,
  dict_sort INT,
  dict_label VARCHAR(100),
  dict_value VARCHAR(100),
  dict_type VARCHAR(100),
  css_class VARCHAR(100),
  list_class VARCHAR(100),
  is_default CHAR(1),
  status CHAR(1),
  create_by VARCHAR(64),
  create_time TIMESTAMP,
  remark VARCHAR(500)
);
