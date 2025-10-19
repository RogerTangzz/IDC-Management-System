package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.BizTicket;

/**
 * 工单Mapper接口
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
public interface BizTicketMapper 
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
     * 删除工单
     * 
     * @param ticketId 工单主键
     * @return 结果
     */
    public int deleteBizTicketByTicketId(Long ticketId);

    /**
     * 批量删除工单
     * 
     * @param ticketIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteBizTicketByTicketIds(Long[] ticketIds);

    /* ================== 扩展统计 ================== */
    /** 按状态分组计数 */
    List<java.util.Map<String,Object>> countGroupByStatus();
    /** 按优先级分组计数 */
    List<java.util.Map<String,Object>> countGroupByPriority();
    /** 今日新增/今日完成 */
    java.util.Map<String,Object> countToday();
    /** 处理时长分布（已完成工单） */
    java.util.Map<String,Object> durationDistribution();
    /** SLA 超时统计 */
    java.util.Map<String,Object> slaStats();
    /** 逾期（有deadline 且 未完成/未关闭 且 当前时间>deadline） */
    Long countOverdue();

    /** 逾期工单列表 */
    List<BizTicket> selectOverdueList(BizTicket criteria);

    /** 近即将超时计数（传 warnBeforeHours） */
    Long countNearDue(int warnBeforeHours);

    /** 近即将超时列表（传 warnBeforeHours） */
    List<BizTicket> selectNearDueList(int warnBeforeHours);

    /* ===== 报表增强（时间范围与趋势） ===== */
    /** 处理时长分布（支持时间范围） */
    java.util.Map<String,Object> durationAnalytics(java.util.Map<String,Object> params);
    /** SLA 统计（支持时间范围） */
    java.util.Map<String,Object> slaAnalytics(java.util.Map<String,Object> params);
    /** 趋势：按创建日期统计新增 */
    java.util.List<java.util.Map<String,Object>> trendCreated(java.util.Map<String,Object> params);
    /** 趋势：按完成日期统计完成 */
    java.util.List<java.util.Map<String,Object>> trendCompleted(java.util.Map<String,Object> params);

    /**
     * 查询来源于指定巡检的工单
     *
     * @param sourceId 来源ID (inspectionId)
     * @param source 来源类型 ('inspection')
     * @return 工单列表
     */
    List<BizTicket> selectTicketsBySourceIdAndType(Long sourceId, String source);
}
