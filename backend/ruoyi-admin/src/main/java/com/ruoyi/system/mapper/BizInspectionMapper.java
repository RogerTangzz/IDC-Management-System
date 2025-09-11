package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.BizInspection;
import org.apache.ibatis.annotations.Param;

/**
 * 巡检记录Mapper接口
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
public interface BizInspectionMapper 
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
     * 删除巡检记录
     * 
     * @param inspectionId 巡检记录主键
     * @return 结果
     */
    public int deleteBizInspectionByInspectionId(Long inspectionId);

    /**
     * 批量删除巡检记录
     * 
     * @param inspectionIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteBizInspectionByInspectionIds(Long[] inspectionIds);

    /** 查询当日最新巡检编号 (prefix 形如 INS20250901) */
    String selectLatestInspectionNo(@Param("prefix") String prefix);
}
