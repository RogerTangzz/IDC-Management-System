package com.ruoyi.system.service.impl;

import java.util.List;
import com.ruoyi.common.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.system.mapper.BizMaintenanceMapper;
import com.ruoyi.system.domain.BizMaintenance;
import com.ruoyi.system.service.IBizMaintenanceService;

/**
 * 维保计划Service业务层处理
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
@Service
public class BizMaintenanceServiceImpl implements IBizMaintenanceService 
{
    @Autowired
    private BizMaintenanceMapper bizMaintenanceMapper;

    /**
     * 查询维保计划
     * 
     * @param planId 维保计划主键
     * @return 维保计划
     */
    @Override
    public BizMaintenance selectBizMaintenanceByPlanId(Long planId)
    {
        return bizMaintenanceMapper.selectBizMaintenanceByPlanId(planId);
    }

    /**
     * 查询维保计划列表
     * 
     * @param bizMaintenance 维保计划
     * @return 维保计划
     */
    @Override
    public List<BizMaintenance> selectBizMaintenanceList(BizMaintenance bizMaintenance)
    {
        return bizMaintenanceMapper.selectBizMaintenanceList(bizMaintenance);
    }

    /**
     * 新增维保计划
     * 
     * @param bizMaintenance 维保计划
     * @return 结果
     */
    @Override
    public int insertBizMaintenance(BizMaintenance bizMaintenance)
    {
        // 自动编号：MP + yyyyMMdd + 4位序号
        if (bizMaintenance.getPlanNo() == null || bizMaintenance.getPlanNo().isEmpty()) {
            String datePart = DateUtils.dateTimeNow("yyyyMMdd");
            String prefix = "MP" + datePart;
            String latest = bizMaintenanceMapper.selectLatestPlanNo(prefix);
            int nextSeq = 1;
            if (latest != null && latest.length() >= prefix.length()) {
                String suffix = latest.substring(prefix.length());
                try { nextSeq = Integer.parseInt(suffix) + 1; } catch (NumberFormatException ignored) {}
            }
            bizMaintenance.setPlanNo(prefix + String.format("%04d", nextSeq));
        }
        bizMaintenance.setCreateTime(DateUtils.getNowDate());
        return bizMaintenanceMapper.insertBizMaintenance(bizMaintenance);
    }

    /**
     * 修改维保计划
     * 
     * @param bizMaintenance 维保计划
     * @return 结果
     */
    @Override
    public int updateBizMaintenance(BizMaintenance bizMaintenance)
    {
        bizMaintenance.setUpdateTime(DateUtils.getNowDate());
        return bizMaintenanceMapper.updateBizMaintenance(bizMaintenance);
    }

    /**
     * 批量删除维保计划
     * 
     * @param planIds 需要删除的维保计划主键
     * @return 结果
     */
    @Override
    public int deleteBizMaintenanceByPlanIds(Long[] planIds)
    {
        return bizMaintenanceMapper.deleteBizMaintenanceByPlanIds(planIds);
    }

    /**
     * 删除维保计划信息
     * 
     * @param planId 维保计划主键
     * @return 结果
     */
    @Override
    public int deleteBizMaintenanceByPlanId(Long planId)
    {
        return bizMaintenanceMapper.deleteBizMaintenanceByPlanId(planId);
    }
}
