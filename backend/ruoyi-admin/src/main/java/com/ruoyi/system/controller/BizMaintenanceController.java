package com.ruoyi.system.controller;

import java.util.List;
import javax.servlet.http.HttpServletResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.system.domain.BizMaintenance;
import com.ruoyi.system.service.IBizMaintenanceService;
import com.ruoyi.common.utils.poi.ExcelUtil;
import com.ruoyi.common.core.page.TableDataInfo;

/**
 * 维保计划Controller
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
@RestController
@RequestMapping("/system/maintenance")
public class BizMaintenanceController extends BaseController
{
    @Autowired
    private IBizMaintenanceService bizMaintenanceService;

    /**
     * 查询维保计划列表
     */
    @PreAuthorize("@ss.hasPermi('system:maintenance:list')")
    @GetMapping("/list")
    public TableDataInfo list(BizMaintenance bizMaintenance)
    {
        startPage();
        List<BizMaintenance> list = bizMaintenanceService.selectBizMaintenanceList(bizMaintenance);
        return getDataTable(list);
    }

    /**
     * 导出维保计划列表
     */
    @PreAuthorize("@ss.hasPermi('system:maintenance:export')")
    @Log(title = "维保计划", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, BizMaintenance bizMaintenance)
    {
        List<BizMaintenance> list = bizMaintenanceService.selectBizMaintenanceList(bizMaintenance);
        ExcelUtil<BizMaintenance> util = new ExcelUtil<BizMaintenance>(BizMaintenance.class);
        util.exportExcel(response, list, "维保计划数据");
    }

    /**
     * 获取维保计划详细信息
     */
    @PreAuthorize("@ss.hasPermi('system:maintenance:query')")
    @GetMapping(value = "/{planId}")
    public AjaxResult getInfo(@PathVariable("planId") Long planId)
    {
        return success(bizMaintenanceService.selectBizMaintenanceByPlanId(planId));
    }

    /**
     * 新增维保计划
     */
    @PreAuthorize("@ss.hasPermi('system:maintenance:add')")
    @Log(title = "维保计划", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@RequestBody BizMaintenance bizMaintenance)
    {
        return toAjax(bizMaintenanceService.insertBizMaintenance(bizMaintenance));
    }

    /**
     * 修改维保计划
     */
    @PreAuthorize("@ss.hasPermi('system:maintenance:edit')")
    @Log(title = "维保计划", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@RequestBody BizMaintenance bizMaintenance)
    {
        return toAjax(bizMaintenanceService.updateBizMaintenance(bizMaintenance));
    }

    /**
     * 删除维保计划
     */
    @PreAuthorize("@ss.hasPermi('system:maintenance:remove')")
    @Log(title = "维保计划", businessType = BusinessType.DELETE)
	@DeleteMapping("/{planIds}")
    public AjaxResult remove(@PathVariable Long[] planIds)
    {
        return toAjax(bizMaintenanceService.deleteBizMaintenanceByPlanIds(planIds));
    }
}
