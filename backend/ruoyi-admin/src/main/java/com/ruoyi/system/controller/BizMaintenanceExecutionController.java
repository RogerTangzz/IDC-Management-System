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
import com.ruoyi.system.domain.BizMaintenanceExecution;
import com.ruoyi.system.service.IBizMaintenanceExecutionService;
import com.ruoyi.common.utils.poi.ExcelUtil;
import com.ruoyi.common.core.page.TableDataInfo;

/**
 * 维保执行记录Controller
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
@RestController
@RequestMapping("/system/execution")
public class BizMaintenanceExecutionController extends BaseController
{
    @Autowired
    private IBizMaintenanceExecutionService bizMaintenanceExecutionService;

    /**
     * 查询维保执行记录列表
     */
    @PreAuthorize("@ss.hasPermi('system:execution:list')")
    @GetMapping("/list")
    public TableDataInfo list(BizMaintenanceExecution bizMaintenanceExecution)
    {
        startPage();
        List<BizMaintenanceExecution> list = bizMaintenanceExecutionService.selectBizMaintenanceExecutionList(bizMaintenanceExecution);
        return getDataTable(list);
    }

    /**
     * 导出维保执行记录列表
     */
    @PreAuthorize("@ss.hasPermi('system:execution:export')")
    @Log(title = "维保执行记录", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, BizMaintenanceExecution bizMaintenanceExecution)
    {
        List<BizMaintenanceExecution> list = bizMaintenanceExecutionService.selectBizMaintenanceExecutionList(bizMaintenanceExecution);
        ExcelUtil<BizMaintenanceExecution> util = new ExcelUtil<BizMaintenanceExecution>(BizMaintenanceExecution.class);
        util.exportExcel(response, list, "维保执行记录数据");
    }

    /**
     * 获取维保执行记录详细信息
     */
    @PreAuthorize("@ss.hasPermi('system:execution:query')")
    @GetMapping(value = "/{executionId}")
    public AjaxResult getInfo(@PathVariable("executionId") Long executionId)
    {
        return success(bizMaintenanceExecutionService.selectBizMaintenanceExecutionByExecutionId(executionId));
    }

    /**
     * 新增维保执行记录
     */
    @PreAuthorize("@ss.hasPermi('system:execution:add')")
    @Log(title = "维保执行记录", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@RequestBody BizMaintenanceExecution bizMaintenanceExecution)
    {
        return toAjax(bizMaintenanceExecutionService.insertBizMaintenanceExecution(bizMaintenanceExecution));
    }

    /**
     * 修改维保执行记录
     */
    @PreAuthorize("@ss.hasPermi('system:execution:edit')")
    @Log(title = "维保执行记录", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@RequestBody BizMaintenanceExecution bizMaintenanceExecution)
    {
        return toAjax(bizMaintenanceExecutionService.updateBizMaintenanceExecution(bizMaintenanceExecution));
    }

    /**
     * 删除维保执行记录
     */
    @PreAuthorize("@ss.hasPermi('system:execution:remove')")
    @Log(title = "维保执行记录", businessType = BusinessType.DELETE)
	@DeleteMapping("/{executionIds}")
    public AjaxResult remove(@PathVariable Long[] executionIds)
    {
        return toAjax(bizMaintenanceExecutionService.deleteBizMaintenanceExecutionByExecutionIds(executionIds));
    }
}
