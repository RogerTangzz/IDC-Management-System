package com.ruoyi.framework.task;

import com.ruoyi.system.domain.BizTicket;
import com.ruoyi.system.mapper.BizTicketMapper;
import com.ruoyi.system.service.IBizTicketLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.slf4j.Logger; import org.slf4j.LoggerFactory;

import java.util.List;

/**
 * 工单自动升级任务：超过 deadline 未完成的工单提升优先级为 urgent（若尚未urgent）。
 */
@Component
public class TicketEscalationTask {
    private static final Logger log = LoggerFactory.getLogger(TicketEscalationTask.class);

    @Autowired private BizTicketMapper bizTicketMapper;
    @Autowired private IBizTicketLogService bizTicketLogService;

    // 每小时执行一次
    @Scheduled(cron = "0 0 * * * ?")
    public void escalate(){
        try {
            // 选择已逾期但未完成/未关闭的工单
            List<BizTicket> overdue = bizTicketMapper.selectOverdueList(new BizTicket());
            int cnt = 0;
            for (BizTicket t : overdue){
                if (t == null) continue;
                String p = t.getPriority()==null?"":t.getPriority();
                if (!"urgent".equals(p)){
                    String remark = "SLA逾期自动升级: "+p+" -> urgent";
                    t.setPriority("urgent");
                    try { bizTicketMapper.updateBizTicket(t); cnt++; } catch (Exception ignore) {}
                    try { bizTicketLogService.log(t.getTicketId(), "update", t.getStatus(), t.getStatus(), remark, null, null); } catch (Exception ignore) {}
                }
            }
            if (cnt>0) log.info("TicketEscalationTask 升级 {} 条工单为 urgent", cnt);
        } catch (Exception e){
            log.error("TicketEscalationTask 执行失败", e);
        }
    }
}

