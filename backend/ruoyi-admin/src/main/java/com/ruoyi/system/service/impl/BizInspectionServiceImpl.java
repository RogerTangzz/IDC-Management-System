package com.ruoyi.system.service.impl;

import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;
import com.ruoyi.common.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.system.mapper.BizInspectionMapper;
import com.ruoyi.system.mapper.BizTicketMapper;
import com.ruoyi.system.domain.BizInspection;
import com.ruoyi.system.domain.BizTicket;
import com.ruoyi.system.domain.vo.InspectionHistoryVO;
import com.ruoyi.system.service.IBizInspectionService;

/**
 * 巡检记录Service业务层处理
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
@Service
public class BizInspectionServiceImpl implements IBizInspectionService
{
    @Autowired
    private BizInspectionMapper bizInspectionMapper;

    @Autowired
    private BizTicketMapper bizTicketMapper;

    /**
     * 查询巡检记录
     * 
     * @param inspectionId 巡检记录主键
     * @return 巡检记录
     */
    @Override
    public BizInspection selectBizInspectionByInspectionId(Long inspectionId)
    {
        return bizInspectionMapper.selectBizInspectionByInspectionId(inspectionId);
    }

    /**
     * 查询巡检记录列表
     * 
     * @param bizInspection 巡检记录
     * @return 巡检记录
     */
    @Override
    public List<BizInspection> selectBizInspectionList(BizInspection bizInspection)
    {
        return bizInspectionMapper.selectBizInspectionList(bizInspection);
    }

    /**
     * 新增巡检记录
     * 
     * @param bizInspection 巡检记录
     * @return 结果
     */
    @Override
    public int insertBizInspection(BizInspection bizInspection)
    {
        // 自动编号：INS + yyyyMMdd + 4位序号
        if (bizInspection.getInspectionNo() == null || bizInspection.getInspectionNo().isEmpty()) {
            String datePart = DateUtils.dateTimeNow("yyyyMMdd");
            String prefix = "INS" + datePart;
            String latest = bizInspectionMapper.selectLatestInspectionNo(prefix);
            int nextSeq = 1;
            if (latest != null && latest.length() >= prefix.length()) {
                String suffix = latest.substring(prefix.length());
                try { nextSeq = Integer.parseInt(suffix) + 1; } catch (NumberFormatException ignored) {}
            }
            bizInspection.setInspectionNo(prefix + String.format("%04d", nextSeq));
        }
        if (bizInspection.getInspectionDate() == null) {
            // 设为当前日期
            bizInspection.setInspectionDate(DateUtils.getNowDate());
        }
        // 若前端是多楼层综合巡检，floor 可能未显式填写，DB 列为 NOT NULL，给默认值
        if (bizInspection.getFloor() == null || bizInspection.getFloor().isEmpty()) {
            bizInspection.setFloor("all");
        }
        bizInspection.setCreateTime(DateUtils.getNowDate());
        return bizInspectionMapper.insertBizInspection(bizInspection);
    }

    /**
     * 修改巡检记录
     * 
     * @param bizInspection 巡检记录
     * @return 结果
     */
    @Override
    public int updateBizInspection(BizInspection bizInspection)
    {
        bizInspection.setUpdateTime(DateUtils.getNowDate());
        return bizInspectionMapper.updateBizInspection(bizInspection);
    }

    /**
     * 批量删除巡检记录
     * 
     * @param inspectionIds 需要删除的巡检记录主键
     * @return 结果
     */
    @Override
    public int deleteBizInspectionByInspectionIds(Long[] inspectionIds)
    {
        return bizInspectionMapper.deleteBizInspectionByInspectionIds(inspectionIds);
    }

    /**
     * 删除巡检记录信息
     *
     * @param inspectionId 巡检记录主键
     * @return 结果
     */
    @Override
    public int deleteBizInspectionByInspectionId(Long inspectionId)
    {
        return bizInspectionMapper.deleteBizInspectionByInspectionId(inspectionId);
    }

    /**
     * 获取巡检操作历史
     *
     * @param inspectionId 巡检ID
     * @param type 类型过滤 (all/operation/ticket)
     * @return 历史记录列表
     */
    @Override
    public List<InspectionHistoryVO> getInspectionHistory(Long inspectionId, String type)
    {
        List<InspectionHistoryVO> history = new ArrayList<>();
        long autoIncrementId = 1;

        // 1. 从巡检表获取创建/修改记录
        if (!"ticket".equals(type)) {
            BizInspection inspection = bizInspectionMapper.selectBizInspectionByInspectionId(inspectionId);
            if (inspection != null) {
                // 创建记录
                history.add(InspectionHistoryVO.builder()
                    .id(autoIncrementId++)
                    .time(inspection.getCreateTime())
                    .action("create")
                    .operatorId(parseUserId(inspection.getCreateBy()))
                    .operatorName(inspection.getCreateBy() != null ? inspection.getCreateBy() : "系统")
                    .detail("创建巡检记录")
                    .build());

                // 修改记录(如果update_time != create_time)
                if (inspection.getUpdateTime() != null &&
                    !inspection.getUpdateTime().equals(inspection.getCreateTime())) {
                    history.add(InspectionHistoryVO.builder()
                        .id(autoIncrementId++)
                        .time(inspection.getUpdateTime())
                        .action("update")
                        .operatorId(parseUserId(inspection.getUpdateBy()))
                        .operatorName(inspection.getUpdateBy() != null ? inspection.getUpdateBy() : "系统")
                        .detail("修改巡检记录")
                        .build());
                }

                // 如果是复制的,添加复制记录
                if ("Y".equals(inspection.getIsCopied()) && inspection.getCreateTime() != null) {
                    history.add(InspectionHistoryVO.builder()
                        .id(autoIncrementId++)
                        .time(inspection.getCreateTime())
                        .action("copy")
                        .operatorId(parseUserId(inspection.getCreateBy()))
                        .operatorName(inspection.getCreateBy() != null ? inspection.getCreateBy() : "系统")
                        .detail("复制巡检记录")
                        .build());
                }
            }
        }

        // 2. 从工单表获取生成工单记录 (source='inspection' AND source_id=inspectionId)
        if (!"operation".equals(type)) {
            try {
                // 查询所有来源于该巡检的工单
                List<BizTicket> tickets = bizTicketMapper.selectTicketsBySourceIdAndType(inspectionId, "inspection");
                for (BizTicket ticket : tickets) {
                    history.add(InspectionHistoryVO.builder()
                        .id(autoIncrementId++)
                        .time(ticket.getCreateTime())
                        .action("generate_ticket")
                        .operatorId(ticket.getReporterId())
                        .operatorName(ticket.getReporterName() != null ? ticket.getReporterName() : ticket.getCreateBy())
                        .detail("生成工单: " + (ticket.getTitle() != null ? ticket.getTitle() : ticket.getTicketNo()))
                        .relatedId(ticket.getTicketId())
                        .build());
                }
            } catch (Exception e) {
                // 如果Mapper方法不存在,静默忽略(兼容性处理)
                System.err.println("Warning: selectTicketsBySourceIdAndType not available: " + e.getMessage());
            }
        }

        // 3. 按时间升序排序
        history.sort(Comparator.comparing(InspectionHistoryVO::getTime));

        return history;
    }

    /**
     * 解析用户ID (create_by字段可能是用户名字符串,需要转换)
     */
    private Long parseUserId(String userStr) {
        if (userStr == null || userStr.isEmpty()) {
            return null;
        }
        try {
            return Long.parseLong(userStr);
        } catch (NumberFormatException e) {
            // 如果是用户名而不是ID,返回null
            return null;
        }
    }
}
