package com.ruoyi.system.service;

import java.util.List;
import com.ruoyi.system.domain.BizMaintenance;

/**
 * 维保计划Service接口
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
public interface IBizMaintenanceService 
{
    /**
     * 查询维保计划
     * 
     * @param planId 维保计划主键
     * @return 维保计划
     */
    public BizMaintenance selectBizMaintenanceByPlanId(Long planId);

    /**
     * 查询维保计划列表
     * 
     * @param bizMaintenance 维保计划
     * @return 维保计划集合
     */
    public List<BizMaintenance> selectBizMaintenanceList(BizMaintenance bizMaintenance);

    /**
     * 新增维保计划
     * 
     * @param bizMaintenance 维保计划
     * @return 结果
     */
    public int insertBizMaintenance(BizMaintenance bizMaintenance);

    /**
     * 修改维保计划
     * 
     * @param bizMaintenance 维保计划
     * @return 结果
     */
    public int updateBizMaintenance(BizMaintenance bizMaintenance);

    /**
     * 批量删除维保计划
     * 
     * @param planIds 需要删除的维保计划主键集合
     * @return 结果
     */
    public int deleteBizMaintenanceByPlanIds(Long[] planIds);

    /**
     * 删除维保计划信息
     * 
     * @param planId 维保计划主键
     * @return 结果
     */
    public int deleteBizMaintenanceByPlanId(Long planId);
}
