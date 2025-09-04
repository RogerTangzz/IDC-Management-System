package com.ruoyi.system.service.impl;

import java.util.List;
import com.ruoyi.common.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ruoyi.system.mapper.BizTicketMapper;
import com.ruoyi.system.domain.BizTicket;
import com.ruoyi.system.service.IBizTicketService;
import com.ruoyi.system.service.IBizTicketLogService;
import com.ruoyi.system.service.IBizMessageService;
import com.ruoyi.framework.config.SlaConfigService;

/**
 * 工单Service业务层处理
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
@Service
public class BizTicketServiceImpl implements IBizTicketService 
{
    @Autowired
    private BizTicketMapper bizTicketMapper;

    @Autowired
    private IBizTicketLogService bizTicketLogService;

    @Autowired(required = false)
    private SlaConfigService slaConfig;

    @Autowired(required = false)
    private IBizMessageService bizMessageService;

    /**
     * 查询工单
     * 
     * @param ticketId 工单主键
     * @return 工单
     */
    @Override
    public BizTicket selectBizTicketByTicketId(Long ticketId)
    {
        return bizTicketMapper.selectBizTicketByTicketId(ticketId);
    }

    /**
     * 查询工单列表
     * 
     * @param bizTicket 工单
     * @return 工单
     */
    @Override
    public List<BizTicket> selectBizTicketList(BizTicket bizTicket)
    {
        return bizTicketMapper.selectBizTicketList(bizTicket);
    }

    /**
     * 新增工单
     * 
     * @param bizTicket 工单
     * @return 结果
     */
    @Override
    public int insertBizTicket(BizTicket bizTicket)
    {
        bizTicket.setCreateTime(DateUtils.getNowDate());
        // 自动设置 deadline（若未传）
        try {
            if (bizTicket.getDeadline() == null && bizTicket.getPriority() != null && slaConfig != null) {
                int hours = 0;
                switch (String.valueOf(bizTicket.getPriority())){
                    case "low": hours = slaConfig.lowHours(); break;
                    case "medium": hours = slaConfig.mediumHours(); break;
                    case "high": hours = slaConfig.highHours(); break;
                    default: hours = 0; break;
                }
                if (hours > 0) {
                    bizTicket.setDeadline(DateUtils.addHours(DateUtils.getNowDate(), hours));
                }
            }
        } catch (Exception ignore) {}
        return bizTicketMapper.insertBizTicket(bizTicket);
    }

    /**
     * 修改工单
     * 
     * @param bizTicket 工单
     * @return 结果
     */
    @Override
    public int updateBizTicket(BizTicket bizTicket)
    {
        bizTicket.setUpdateTime(DateUtils.getNowDate());
        return bizTicketMapper.updateBizTicket(bizTicket);
    }

    /**
     * 批量删除工单
     * 
     * @param ticketIds 需要删除的工单主键
     * @return 结果
     */
    @Override
    public int deleteBizTicketByTicketIds(Long[] ticketIds)
    {
        return bizTicketMapper.deleteBizTicketByTicketIds(ticketIds);
    }

    /**
     * 删除工单信息
     * 
     * @param ticketId 工单主键
     * @return 结果
     */
    @Override
    public int deleteBizTicketByTicketId(Long ticketId)
    {
        return bizTicketMapper.deleteBizTicketByTicketId(ticketId);
    }

    /* ================== 业务动作 ================== */
    private boolean isValidTransition(String from, String to){
        if (from==null) return true;
        if (from.equals(to)) return true;
        switch(from){
            case "pending": return to.equals("assigned") || to.equals("closed");
            case "assigned": return to.equals("processing") || to.equals("closed");
            case "processing": return to.equals("completed") || to.equals("closed");
            case "completed": return to.equals("closed") || to.equals("processing");
            case "closed": return to.equals("processing") || to.equals("assigned");
            default: return false;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assignTickets(Long[] ticketIds, Long assigneeId, String assigneeName, Long operatorId, String operatorName){
        if (ticketIds == null || ticketIds.length == 0) return;
        for (Long id : ticketIds){
            BizTicket t = bizTicketMapper.selectBizTicketByTicketId(id);
            if (t == null) continue;
            String oldStatus = t.getStatus();
            t.setAssigneeId(assigneeId);
            t.setAssigneeName(assigneeName);
            if (t.getStatus()==null || "pending".equals(t.getStatus())) t.setStatus("assigned");
            t.setLastAction("assign");
            t.setLastStatusTime(DateUtils.getNowDate());
            bizTicketMapper.updateBizTicket(t);
            bizTicketLogService.log(id, "assign", oldStatus, t.getStatus(), null, operatorId, operatorName);
            if (bizMessageService != null && t.getAssigneeId()!=null){
                bizMessageService.send(t.getAssigneeId(), t.getAssigneeName(), "assign",
                        "工单指派: "+t.getTicketNo(), t.getTitle(), "ticket", t.getTicketId());
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void startTicket(Long ticketId, Long operatorId, String operatorName){
        BizTicket t = bizTicketMapper.selectBizTicketByTicketId(ticketId);
        if (t == null) throw new IllegalArgumentException("工单不存在");
        if (!isValidTransition(t.getStatus(), "processing")) throw new IllegalStateException("当前状态不允许开始处理");
        String oldStatus = t.getStatus();
        t.setStatus("processing");
        t.setLastAction("start");
        t.setLastStatusTime(DateUtils.getNowDate());
        bizTicketMapper.updateBizTicket(t);
        bizTicketLogService.log(ticketId, "start", oldStatus, t.getStatus(), null, operatorId, operatorName);
        if (bizMessageService != null && t.getReporterId()!=null){
            bizMessageService.send(t.getReporterId(), t.getReporterName(), "start",
                    "工单开始处理: "+t.getTicketNo(), t.getTitle(), "ticket", t.getTicketId());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void completeTicket(Long ticketId, String solution, String result, Long operatorId, String operatorName){
        BizTicket t = bizTicketMapper.selectBizTicketByTicketId(ticketId);
        if (t == null) throw new IllegalArgumentException("工单不存在");
        if (!isValidTransition(t.getStatus(), "completed")) throw new IllegalStateException("当前状态不允许完成");
        String oldStatus = t.getStatus();
        t.setStatus("completed");
        if (solution != null) t.setSolution(solution);
        t.setCompletionTime(DateUtils.getNowDate());
        t.setLastAction("complete");
        t.setLastStatusTime(DateUtils.getNowDate());
        bizTicketMapper.updateBizTicket(t);
        bizTicketLogService.log(ticketId, "complete", oldStatus, t.getStatus(), result, operatorId, operatorName);
        if (bizMessageService != null && t.getReporterId()!=null){
            bizMessageService.send(t.getReporterId(), t.getReporterName(), "complete",
                    "工单已完成: "+t.getTicketNo(), t.getTitle(), "ticket", t.getTicketId());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void closeTicket(Long ticketId, Long operatorId, String operatorName){
        BizTicket t = bizTicketMapper.selectBizTicketByTicketId(ticketId);
        if (t == null) throw new IllegalArgumentException("工单不存在");
        if (!isValidTransition(t.getStatus(), "closed")) throw new IllegalStateException("当前状态不允许关闭");
        String oldStatus = t.getStatus();
        t.setStatus("closed");
        t.setLastAction("close");
        t.setLastStatusTime(DateUtils.getNowDate());
        bizTicketMapper.updateBizTicket(t);
        bizTicketLogService.log(ticketId, "close", oldStatus, t.getStatus(), null, operatorId, operatorName);
        if (bizMessageService != null && t.getReporterId()!=null){
            bizMessageService.send(t.getReporterId(), t.getReporterName(), "close",
                    "工单已关闭: "+t.getTicketNo(), t.getTitle(), "ticket", t.getTicketId());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reopenTicket(Long ticketId, Long operatorId, String operatorName){
        BizTicket t = bizTicketMapper.selectBizTicketByTicketId(ticketId);
        if (t == null) throw new IllegalArgumentException("工单不存在");
        if (!"closed".equals(t.getStatus())) throw new IllegalStateException("当前状态不允许 reopen");
        String oldStatus = t.getStatus();
        if (t.getAssigneeId()!=null){
            if (!isValidTransition("closed", "processing")) throw new IllegalStateException("非法流转");
            t.setStatus("processing");
        } else {
            if (!isValidTransition("closed", "assigned")) throw new IllegalStateException("非法流转");
            t.setStatus("assigned");
        }
        t.setLastAction("reopen");
        t.setLastStatusTime(DateUtils.getNowDate());
        bizTicketMapper.updateBizTicket(t);
        bizTicketLogService.log(ticketId, "reopen", oldStatus, t.getStatus(), null, operatorId, operatorName);
        if (bizMessageService != null && t.getAssigneeId()!=null){
            bizMessageService.send(t.getAssigneeId(), t.getAssigneeName(), "reopen",
                    "工单重新打开: "+t.getTicketNo(), t.getTitle(), "ticket", t.getTicketId());
        }
    }
}
