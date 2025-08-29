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
}
