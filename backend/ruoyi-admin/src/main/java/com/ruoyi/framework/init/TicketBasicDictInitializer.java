package com.ruoyi.framework.init;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.List;

/**
 * 启动时确保工单常用字典存在：ticket_status / ticket_priority / equipment_specialty
 */
@Component
public class TicketBasicDictInitializer {

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init(){
        if (jdbcTemplate == null) return;
        try {
            ensureDictType("ticket_status", "工单状态");
            ensureDictData("ticket_status", new String[][]{
                    {"1","待处理","pending","","default"},
                    {"2","已指派","assigned","","info"},
                    {"3","处理中","processing","","warning"},
                    {"4","已完成","completed","","success"},
                    {"5","已关闭","closed","","danger"}
            });

            ensureDictType("ticket_priority", "工单优先级");
            ensureDictData("ticket_priority", new String[][]{
                    {"1","低","low","","info"},
                    {"2","中","medium","","warning"},
                    {"3","高","high","","danger"}
            });

            ensureDictType("equipment_specialty", "设备专业");
            ensureDictData("equipment_specialty", new String[][]{
                    {"1","暖通","hvac","",""},
                    {"2","配电","power","",""},
                    {"3","消防","fire","",""},
                    {"4","弱电","weak","",""},
                    {"5","其他","other","",""}
            });
        } catch (Exception ignore) { }
    }

    private void ensureDictType(String type, String name){
        Integer cnt = 0;
        try { cnt = jdbcTemplate.queryForObject("select count(1) from sys_dict_type where dict_type=?", Integer.class, type); } catch (Exception e) { cnt = 0; }
        if (cnt == null || cnt == 0){
            jdbcTemplate.update("insert into sys_dict_type(dict_name, dict_type, status, create_by, create_time, remark) values(?, ?, '0','system', now(), ?)",
                    name, type, name);
        }
    }

    private void ensureDictData(String dictType, String[][] rows){
        List<String> existing = jdbcTemplate.query("select dict_value from sys_dict_data where dict_type=?", (rs, i)-> rs.getString(1), dictType);
        for (String[] r : rows){
            String sort = r[0]; String label = r[1]; String value = r[2]; String css = r[3]; String list = r[4];
            if (existing.contains(value)) continue;
            jdbcTemplate.update("insert into sys_dict_data(dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, remark) values(?,?,?,?,?,?, 'N','0','system', now(), '')",
                    Integer.valueOf(sort), label, value, dictType, css, list);
        }
    }
}

