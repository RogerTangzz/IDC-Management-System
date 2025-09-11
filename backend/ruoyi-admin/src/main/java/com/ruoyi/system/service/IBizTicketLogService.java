package com.ruoyi.system.service;

import com.ruoyi.system.domain.BizTicketLog;
import java.util.List;

public interface IBizTicketLogService {
    void log(Long ticketId, String action, String oldStatus, String newStatus, String remark, Long operatorId, String operatorName);
    List<BizTicketLog> listByTicket(Long ticketId);
}
