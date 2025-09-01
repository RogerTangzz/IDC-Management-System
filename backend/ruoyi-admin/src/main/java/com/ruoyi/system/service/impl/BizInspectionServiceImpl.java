package com.ruoyi.system.service.impl;

import java.util.List;
import com.ruoyi.common.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.system.mapper.BizInspectionMapper;
import com.ruoyi.system.domain.BizInspection;
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
}
