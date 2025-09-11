package com.ruoyi.system.service;

import java.util.List;
import com.ruoyi.system.domain.BizTicket;

/**
 * 工单Service接口
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
public interface IBizTicketService 
{
    /**
     * 查询工单
     * 
     * @param ticketId 工单主键
     * @return 工单
     */
    public BizTicket selectBizTicketByTicketId(Long ticketId);

    /**
     * 查询工单列表
     * 
     * @param bizTicket 工单
     * @return 工单集合
     */
    public List<BizTicket> selectBizTicketList(BizTicket bizTicket);

    /**
     * 新增工单
     * 
     * @param bizTicket 工单
     * @return 结果
     */
    public int insertBizTicket(BizTicket bizTicket);

    /**
     * 修改工单
     * 
     * @param bizTicket 工单
     * @return 结果
     */
    public int updateBizTicket(BizTicket bizTicket);

    /**
     * 批量删除工单
     * 
     * @param ticketIds 需要删除的工单主键集合
     * @return 结果
     */
    public int deleteBizTicketByTicketIds(Long[] ticketIds);

    /**
     * 删除工单信息
     * 
     * @param ticketId 工单主键
     * @return 结果
     */
    public int deleteBizTicketByTicketId(Long ticketId);

    /* ================== 业务动作（服务层统一校验/记录） ================== */
    /** 批量指派 */
    void assignTickets(Long[] ticketIds, Long assigneeId, String assigneeName, Long operatorId, String operatorName);

    /** 开始处理 */
    void startTicket(Long ticketId, Long operatorId, String operatorName);

    /** 完成工单 */
    void completeTicket(Long ticketId, String solution, String result, Long operatorId, String operatorName);

    /** 关闭工单 */
    void closeTicket(Long ticketId, Long operatorId, String operatorName);

    /** 重新打开 */
    void reopenTicket(Long ticketId, Long operatorId, String operatorName);
}
