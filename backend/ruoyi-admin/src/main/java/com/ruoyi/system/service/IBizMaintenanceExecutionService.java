package com.ruoyi.system.service;

import java.util.List;
import com.ruoyi.system.domain.BizMaintenanceExecution;

/**
 * 维保执行记录Service接口
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
public interface IBizMaintenanceExecutionService 
{
    /**
     * 查询维保执行记录
     * 
     * @param executionId 维保执行记录主键
     * @return 维保执行记录
     */
    public BizMaintenanceExecution selectBizMaintenanceExecutionByExecutionId(Long executionId);

    /**
     * 查询维保执行记录列表
     * 
     * @param bizMaintenanceExecution 维保执行记录
     * @return 维保执行记录集合
     */
    public List<BizMaintenanceExecution> selectBizMaintenanceExecutionList(BizMaintenanceExecution bizMaintenanceExecution);

    /**
     * 新增维保执行记录
     * 
     * @param bizMaintenanceExecution 维保执行记录
     * @return 结果
     */
    public int insertBizMaintenanceExecution(BizMaintenanceExecution bizMaintenanceExecution);

    /**
     * 修改维保执行记录
     * 
     * @param bizMaintenanceExecution 维保执行记录
     * @return 结果
     */
    public int updateBizMaintenanceExecution(BizMaintenanceExecution bizMaintenanceExecution);

    /**
     * 批量删除维保执行记录
     * 
     * @param executionIds 需要删除的维保执行记录主键集合
     * @return 结果
     */
    public int deleteBizMaintenanceExecutionByExecutionIds(Long[] executionIds);

    /**
     * 删除维保执行记录信息
     * 
     * @param executionId 维保执行记录主键
     * @return 结果
     */
    public int deleteBizMaintenanceExecutionByExecutionId(Long executionId);
}
