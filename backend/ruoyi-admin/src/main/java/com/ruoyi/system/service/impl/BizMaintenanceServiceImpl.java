package com.ruoyi.system.service.impl;

import java.util.List;
import java.util.Date;
import com.ruoyi.common.utils.DateUtils;
import com.ruoyi.common.utils.StringUtils;
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
        BizMaintenance plan = bizMaintenanceMapper.selectBizMaintenanceByPlanId(planId);
        applyDerivedFields(plan);
        return plan;
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
        List<BizMaintenance> list = bizMaintenanceMapper.selectBizMaintenanceList(bizMaintenance);
        applyDerivedFields(list);
        return list;
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

    private void applyDerivedFields(List<BizMaintenance> plans)
    {
        if (plans == null || plans.isEmpty())
        {
            return;
        }
        for (BizMaintenance plan : plans)
        {
            applyDerivedFields(plan);
        }
    }

    private void applyDerivedFields(BizMaintenance plan)
    {
        if (plan == null)
        {
            return;
        }
        if (plan.getPlannedStartDate() == null)
        {
            plan.setPlannedStartDate(coalesce(
                    plan.getNextExecutionTime(),
                    plan.getLastExecutionTime(),
                    plan.getCreateTime()));
        }
        if (plan.getPlannedEndDate() == null)
        {
            plan.setPlannedEndDate(coalesce(
                    plan.getNextExecutionTime(),
                    plan.getLastExecutionTime(),
                    plan.getCreateTime()));
        }
        if (plan.getItemCount() == null)
        {
            Integer derived = deriveItemCount(plan.getSteps());
            if (derived != null)
            {
                plan.setItemCount(derived);
            }
        }
    }

    private Date coalesce(Date... candidates)
    {
        if (candidates == null)
        {
            return null;
        }
        for (Date candidate : candidates)
        {
            if (candidate != null)
            {
                return candidate;
            }
        }
        return null;
    }

    private Integer deriveItemCount(String steps)
    {
        if (StringUtils.isBlank(steps))
        {
            return null;
        }
        String normalized = steps
                .replace("\r", "\n")
                .replaceAll("(?i)</li>", "\n")
                .replaceAll("(?i)<li[^>]*>", "\n")
                .replaceAll("(?i)<br\\s*/?>", "\n")
                .replaceAll("(?i)&nbsp;", " ")
                .replaceAll("<[^>]+>", " ");
        String[] segments = normalized.split("\n");
        int count = 0;
        for (String segment : segments)
        {
            String compact = segment.replaceAll("\\s+", "");
            if (StringUtils.isNotEmpty(compact))
            {
                count++;
            }
        }
        return count > 0 ? count : null;
    }

}
