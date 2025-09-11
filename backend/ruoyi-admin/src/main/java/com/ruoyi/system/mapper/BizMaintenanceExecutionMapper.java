package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.BizMaintenanceExecution;

/**
 * 维保执行记录Mapper接口
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
public interface BizMaintenanceExecutionMapper 
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
     * 删除维保执行记录
     * 
     * @param executionId 维保执行记录主键
     * @return 结果
     */
    public int deleteBizMaintenanceExecutionByExecutionId(Long executionId);

    /**
     * 批量删除维保执行记录
     * 
     * @param executionIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteBizMaintenanceExecutionByExecutionIds(Long[] executionIds);
}
