package com.ruoyi.system.service.impl;

import java.util.List;
import com.ruoyi.common.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.system.mapper.BizMaintenanceExecutionMapper;
import com.ruoyi.system.domain.BizMaintenanceExecution;
import com.ruoyi.system.service.IBizMaintenanceExecutionService;

/**
 * 维保执行记录Service业务层处理
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
@Service
public class BizMaintenanceExecutionServiceImpl implements IBizMaintenanceExecutionService 
{
    @Autowired
    private BizMaintenanceExecutionMapper bizMaintenanceExecutionMapper;

    /**
     * 查询维保执行记录
     * 
     * @param executionId 维保执行记录主键
     * @return 维保执行记录
     */
    @Override
    public BizMaintenanceExecution selectBizMaintenanceExecutionByExecutionId(Long executionId)
    {
        return bizMaintenanceExecutionMapper.selectBizMaintenanceExecutionByExecutionId(executionId);
    }

    /**
     * 查询维保执行记录列表
     * 
     * @param bizMaintenanceExecution 维保执行记录
     * @return 维保执行记录
     */
    @Override
    public List<BizMaintenanceExecution> selectBizMaintenanceExecutionList(BizMaintenanceExecution bizMaintenanceExecution)
    {
        return bizMaintenanceExecutionMapper.selectBizMaintenanceExecutionList(bizMaintenanceExecution);
    }

    /**
     * 新增维保执行记录
     * 
     * @param bizMaintenanceExecution 维保执行记录
     * @return 结果
     */
    @Override
    public int insertBizMaintenanceExecution(BizMaintenanceExecution bizMaintenanceExecution)
    {
        bizMaintenanceExecution.setCreateTime(DateUtils.getNowDate());
        return bizMaintenanceExecutionMapper.insertBizMaintenanceExecution(bizMaintenanceExecution);
    }

    /**
     * 修改维保执行记录
     * 
     * @param bizMaintenanceExecution 维保执行记录
     * @return 结果
     */
    @Override
    public int updateBizMaintenanceExecution(BizMaintenanceExecution bizMaintenanceExecution)
    {
        bizMaintenanceExecution.setUpdateTime(DateUtils.getNowDate());
        return bizMaintenanceExecutionMapper.updateBizMaintenanceExecution(bizMaintenanceExecution);
    }

    /**
     * 批量删除维保执行记录
     * 
     * @param executionIds 需要删除的维保执行记录主键
     * @return 结果
     */
    @Override
    public int deleteBizMaintenanceExecutionByExecutionIds(Long[] executionIds)
    {
        return bizMaintenanceExecutionMapper.deleteBizMaintenanceExecutionByExecutionIds(executionIds);
    }

    /**
     * 删除维保执行记录信息
     * 
     * @param executionId 维保执行记录主键
     * @return 结果
     */
    @Override
    public int deleteBizMaintenanceExecutionByExecutionId(Long executionId)
    {
        return bizMaintenanceExecutionMapper.deleteBizMaintenanceExecutionByExecutionId(executionId);
    }
}
