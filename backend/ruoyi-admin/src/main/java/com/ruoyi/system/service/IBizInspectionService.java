package com.ruoyi.system.service;

import java.util.List;
import com.ruoyi.system.domain.BizInspection;

/**
 * 巡检记录Service接口
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
public interface IBizInspectionService 
{
    /**
     * 查询巡检记录
     * 
     * @param inspectionId 巡检记录主键
     * @return 巡检记录
     */
    public BizInspection selectBizInspectionByInspectionId(Long inspectionId);

    /**
     * 查询巡检记录列表
     * 
     * @param bizInspection 巡检记录
     * @return 巡检记录集合
     */
    public List<BizInspection> selectBizInspectionList(BizInspection bizInspection);

    /**
     * 新增巡检记录
     * 
     * @param bizInspection 巡检记录
     * @return 结果
     */
    public int insertBizInspection(BizInspection bizInspection);

    /**
     * 修改巡检记录
     * 
     * @param bizInspection 巡检记录
     * @return 结果
     */
    public int updateBizInspection(BizInspection bizInspection);

    /**
     * 批量删除巡检记录
     * 
     * @param inspectionIds 需要删除的巡检记录主键集合
     * @return 结果
     */
    public int deleteBizInspectionByInspectionIds(Long[] inspectionIds);

    /**
     * 删除巡检记录信息
     * 
     * @param inspectionId 巡检记录主键
     * @return 结果
     */
    public int deleteBizInspectionByInspectionId(Long inspectionId);
}
