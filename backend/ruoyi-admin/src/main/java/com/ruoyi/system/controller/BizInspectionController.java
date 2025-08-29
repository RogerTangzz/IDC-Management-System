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
import com.ruoyi.system.domain.BizInspection;
import com.ruoyi.system.service.IBizInspectionService;
import com.ruoyi.common.utils.poi.ExcelUtil;
import com.ruoyi.common.core.page.TableDataInfo;

/**
 * 巡检记录Controller
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
@RestController
@RequestMapping("/system/inspection")
public class BizInspectionController extends BaseController
{
    @Autowired
    private IBizInspectionService bizInspectionService;

    /**
     * 查询巡检记录列表
     */
    @PreAuthorize("@ss.hasPermi('system:inspection:list')")
    @GetMapping("/list")
    public TableDataInfo list(BizInspection bizInspection)
    {
        startPage();
        List<BizInspection> list = bizInspectionService.selectBizInspectionList(bizInspection);
        return getDataTable(list);
    }

    /**
     * 导出巡检记录列表
     */
    @PreAuthorize("@ss.hasPermi('system:inspection:export')")
    @Log(title = "巡检记录", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, BizInspection bizInspection)
    {
        List<BizInspection> list = bizInspectionService.selectBizInspectionList(bizInspection);
        ExcelUtil<BizInspection> util = new ExcelUtil<BizInspection>(BizInspection.class);
        util.exportExcel(response, list, "巡检记录数据");
    }

    /**
     * 获取巡检记录详细信息
     */
    @PreAuthorize("@ss.hasPermi('system:inspection:query')")
    @GetMapping(value = "/{inspectionId}")
    public AjaxResult getInfo(@PathVariable("inspectionId") Long inspectionId)
    {
        return success(bizInspectionService.selectBizInspectionByInspectionId(inspectionId));
    }

    /**
     * 新增巡检记录
     */
    @PreAuthorize("@ss.hasPermi('system:inspection:add')")
    @Log(title = "巡检记录", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@RequestBody BizInspection bizInspection)
    {
        return toAjax(bizInspectionService.insertBizInspection(bizInspection));
    }

    /**
     * 修改巡检记录
     */
    @PreAuthorize("@ss.hasPermi('system:inspection:edit')")
    @Log(title = "巡检记录", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@RequestBody BizInspection bizInspection)
    {
        return toAjax(bizInspectionService.updateBizInspection(bizInspection));
    }

    /**
     * 删除巡检记录
     */
    @PreAuthorize("@ss.hasPermi('system:inspection:remove')")
    @Log(title = "巡检记录", businessType = BusinessType.DELETE)
	@DeleteMapping("/{inspectionIds}")
    public AjaxResult remove(@PathVariable Long[] inspectionIds)
    {
        return toAjax(bizInspectionService.deleteBizInspectionByInspectionIds(inspectionIds));
    }
}
