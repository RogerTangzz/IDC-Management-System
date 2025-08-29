package com.ruoyi.system.service.impl;

import java.util.List;
import com.ruoyi.common.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.system.mapper.BizTicketMapper;
import com.ruoyi.system.domain.BizTicket;
import com.ruoyi.system.service.IBizTicketService;

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
}
