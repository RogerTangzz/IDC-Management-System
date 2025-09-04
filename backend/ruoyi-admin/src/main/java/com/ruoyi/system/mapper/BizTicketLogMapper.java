package com.ruoyi.system.mapper;

import com.ruoyi.system.domain.BizTicketLog;
import java.util.List;

public interface BizTicketLogMapper {
    int insertBizTicketLog(BizTicketLog log);
    List<BizTicketLog> selectBizTicketLogList(BizTicketLog criteria);
    List<BizTicketLog> selectByTicketId(Long ticketId);
    List<BizTicketLog> selectTicketLogPage(BizTicketLog criteria);
    /** 今日是否已有该动作记录（避免重复提醒） */
    int countTodayByAction(Long ticketId, String action);
}
