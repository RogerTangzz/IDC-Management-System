package com.ruoyi.system.service.impl;

import com.ruoyi.common.utils.DateUtils;
import com.ruoyi.system.domain.BizTicketLog;
import com.ruoyi.system.mapper.BizTicketLogMapper;
import com.ruoyi.system.service.IBizTicketLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BizTicketLogServiceImpl implements IBizTicketLogService {
    @Autowired
    private BizTicketLogMapper bizTicketLogMapper;

    @Override
    public void log(Long ticketId, String action, String oldStatus, String newStatus, String remark, Long operatorId, String operatorName) {
        BizTicketLog l = new BizTicketLog();
        l.setTicketId(ticketId);
        l.setAction(action);
        l.setOldStatus(oldStatus);
        l.setNewStatus(newStatus);
        l.setRemark(remark);
        l.setOperatorId(operatorId);
        l.setOperatorName(operatorName);
        l.setCreateTime(DateUtils.getNowDate());
        bizTicketLogMapper.insertBizTicketLog(l);
    }

    @Override
    public List<BizTicketLog> listByTicket(Long ticketId) {
        BizTicketLog q = new BizTicketLog();
        q.setTicketId(ticketId);
        // PageHelper 在 Controller startPage 后生效
        try {
            return bizTicketLogMapper.selectTicketLogPage(q);
        } catch (Exception e) {
            // 兼容旧方法
            return bizTicketLogMapper.selectByTicketId(ticketId);
        }
    }
}
