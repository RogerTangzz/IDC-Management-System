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
