package com.ruoyi.framework.task;

import com.ruoyi.framework.config.SlaConfigService;
import com.ruoyi.system.domain.BizTicket;
import com.ruoyi.system.mapper.BizTicketMapper;
import com.ruoyi.system.mapper.BizTicketLogMapper;
import com.ruoyi.system.service.IBizTicketLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.slf4j.Logger; import org.slf4j.LoggerFactory;

import java.util.List;

/**
 * SLA 提醒任务：周期扫描即将超时/已超时工单，写入提醒日志（避免重复）。
 */
@Component
public class SlaReminderTask {
    private static final Logger log = LoggerFactory.getLogger(SlaReminderTask.class);

    @Autowired private SlaConfigService slaConfig;
    @Autowired private BizTicketMapper bizTicketMapper;
    @Autowired private IBizTicketLogService bizTicketLogService;
    @Autowired private BizTicketLogMapper bizTicketLogMapper;
    @Autowired(required = false) private com.ruoyi.system.service.IBizMessageService bizMessageService;

    // 固定cron：默认每15分钟；若需动态cron，可改用 SchedulingConfigurer
    @Scheduled(cron = "0 0/15 * * * ?")
    public void scan(){
        if (!slaConfig.isEnabled()) return;
        int hours = Math.max(1, slaConfig.warnBeforeHours());
        try {
            // 即将超时
            List<BizTicket> nearList = bizTicketMapper.selectNearDueList(hours);
            int warnCnt = 0;
            for (BizTicket t : nearList){
                try {
                    if (bizTicketLogMapper.countTodayByAction(t.getTicketId(), "sla_warn") == 0){
                        bizTicketLogService.log(t.getTicketId(), "sla_warn", t.getStatus(), t.getStatus(), "SLA即将超时(<="+hours+"h)", null, null);
                        if (bizMessageService != null && t.getAssigneeId()!=null){
                            bizMessageService.send(t.getAssigneeId(), t.getAssigneeName(), "sla_warn",
                                    "工单即将超时: "+t.getTicketNo(), t.getTitle(), "ticket", t.getTicketId());
                        }
                        warnCnt++;
                    }
                } catch (Exception ignore) {}
            }
            // 已超时
            List<BizTicket> overdue = bizTicketMapper.selectOverdueList(new BizTicket());
            int oCnt = 0;
            for (BizTicket t : overdue){
                try {
                    if (bizTicketLogMapper.countTodayByAction(t.getTicketId(), "sla_overdue") == 0){
                        bizTicketLogService.log(t.getTicketId(), "sla_overdue", t.getStatus(), t.getStatus(), "SLA已超时", null, null);
                        if (bizMessageService != null && t.getAssigneeId()!=null){
                            bizMessageService.send(t.getAssigneeId(), t.getAssigneeName(), "sla_overdue",
                                    "工单已超时: "+t.getTicketNo(), t.getTitle(), "ticket", t.getTicketId());
                        }
                        oCnt++;
                    }
                } catch (Exception ignore) {}
            }
            if (warnCnt>0 || oCnt>0) log.info("SlaReminderTask: warn={} overdue={}", warnCnt, oCnt);
        } catch (Exception e){
            log.error("SlaReminderTask 执行失败", e);
        }
    }
}
