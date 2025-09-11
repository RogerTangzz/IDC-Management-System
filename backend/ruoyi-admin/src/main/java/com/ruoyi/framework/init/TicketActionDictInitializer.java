package com.ruoyi.framework.init;

import com.ruoyi.common.utils.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import javax.annotation.PostConstruct;
import java.util.List;

/**
 * 启动时确保 ticket_action 字典存在，避免忘记执行 SQL 脚本。
 */
@Component
public class TicketActionDictInitializer {

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init(){
        if (jdbcTemplate == null) return; // 若未配置数据源
        try {
            Integer cnt = jdbcTemplate.queryForObject("select count(1) from sys_dict_type where dict_type='ticket_action'", Integer.class);
            if (cnt == null || cnt == 0) {
                jdbcTemplate.update("insert into sys_dict_type(dict_name, dict_type, status, create_by, create_time, remark) values('工单动作','ticket_action','0','system',now(),'工单操作动作')");
            }
            // 需要的值
        String[][] rows = {
            {"1","创建","create","primary","创建工单"},
            {"2","更新","update","info","更新字段/状态"},
            {"3","编辑","edit","info","非状态变化编辑"},
            {"4","指派","assign","info","指派处理人"},
            {"5","开始处理","start","warning","开始处理"},
            {"6","完成","complete","success","处理完成"},
            {"7","关闭","close","danger","关闭工单"},
            {"8","重新打开","reopen","warning","重新打开工单"},
            {"9","超时预警","sla_warn","warning","SLA 即将超时预警"},
            {"10","已超时","sla_overdue","danger","SLA 已超时"}
        };
            List<String> existing = jdbcTemplate.query("select dict_value from sys_dict_data where dict_type='ticket_action'", (rs, i)-> rs.getString(1));
            for (String[] r : rows) {
                if (existing.contains(r[2])) continue;
                jdbcTemplate.update("insert into sys_dict_data(dict_sort, dict_label, dict_value, dict_type, css_class, list_class, is_default, status, create_by, create_time, remark) values(?,?,?,?,?,'', 'N','0','system',now(),?)",
                        Integer.valueOf(r[0]), r[1], r[2], "ticket_action", null, r[3], r[4]);
            }
        } catch (Exception ignore) { }
    }
}
