INSERT INTO sys_config (config_name, config_key, config_value, config_type, create_by, create_time, remark)
VALUES ('Captcha On', 'sys.account.captchaEnabled', 'true', 'Y', 'test', CURRENT_TIMESTAMP(), 'enable captcha for tests');

INSERT INTO sys_dict_type (dict_name, dict_type, status, create_by, create_time, remark)
VALUES ('Yes/No', 'sys_yes_no', '0', 'test', CURRENT_TIMESTAMP(), 'yes no dict');

INSERT INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, remark)
VALUES (1, 'Yes', 'Y', 'sys_yes_no', NULL, NULL, 'Y', '0', 'test', CURRENT_TIMESTAMP(), 'yes value');

INSERT INTO sys_dict_data (dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, remark)
VALUES (2, 'No', 'N', 'sys_yes_no', NULL, NULL, 'N', '0', 'test', CURRENT_TIMESTAMP(), 'no value');
