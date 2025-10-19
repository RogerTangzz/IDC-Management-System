package com.ruoyi.web.controller.business;

import java.util.List;
import java.util.Map;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.system.domain.BizRackUSlot;
import com.ruoyi.system.service.IBizRackUSlotService;
import com.ruoyi.common.utils.poi.ExcelUtil;
import com.ruoyi.common.core.page.TableDataInfo;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;

/**
 * 机柜U位管理Controller
 *
 * @author ruoyi
 * @date 2025-01-18
 */
@Api(tags = "机柜U位管理")
@RestController
@RequestMapping("/business/rack/uslot")
public class BizRackUSlotController extends BaseController
{
    @Autowired
    private IBizRackUSlotService bizRackUSlotService;

    /**
     * 查询机柜U位管理列表
     */
    @ApiOperation("查询U位列表")
    @PreAuthorize("@ss.hasPermi('business:rackUSlot:list')")
    @GetMapping("/list")
    public TableDataInfo list(BizRackUSlot bizRackUSlot)
    {
        startPage();
        List<BizRackUSlot> list = bizRackUSlotService.selectBizRackUSlotList(bizRackUSlot);
        return getDataTable(list);
    }

    /**
     * 根据机柜ID查询U位列表
     */
    @ApiOperation("根据机柜ID查询U位列表")
    @PreAuthorize("@ss.hasPermi('business:rackUSlot:list')")
    @GetMapping("/rack/{rackId}")
    public AjaxResult getUSlotsByRackId(@ApiParam("机柜ID") @PathVariable Long rackId)
    {
        List<BizRackUSlot> list = bizRackUSlotService.selectUSlotsByRackId(rackId);
        return success(list);
    }

    /**
     * 统计机柜U位使用情况
     */
    @ApiOperation("统计机柜U位使用情况")
    @PreAuthorize("@ss.hasPermi('business:rackUSlot:list')")
    @GetMapping("/stats/{rackId}")
    public AjaxResult getUSlotStats(@ApiParam("机柜ID") @PathVariable Long rackId)
    {
        Map<String, Object> stats = bizRackUSlotService.countUSlotsByRackId(rackId);
        return success(stats);
    }

    /**
     * 检查U位冲突
     */
    @ApiOperation("检查U位冲突")
    @PreAuthorize("@ss.hasPermi('business:rackUSlot:list')")
    @GetMapping("/checkConflict")
    public AjaxResult checkConflict(
        @ApiParam("机柜ID") @RequestParam Long rackId,
        @ApiParam("起始U位") @RequestParam Integer startU,
        @ApiParam("占用U位数") @RequestParam Integer uCount)
    {
        boolean hasConflict = bizRackUSlotService.checkUSlotConflict(rackId, startU, uCount);
        return success(Map.of(
            "hasConflict", hasConflict,
            "message", hasConflict ? "该U位范围存在冲突" : "该U位范围可用"
        ));
    }

    /**
     * 导出机柜U位管理列表
     */
    @ApiOperation("导出U位数据到Excel")
    @PreAuthorize("@ss.hasPermi('business:rackUSlot:export')")
    @Log(title = "机柜U位管理", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, BizRackUSlot bizRackUSlot)
    {
        List<BizRackUSlot> list = bizRackUSlotService.selectBizRackUSlotList(bizRackUSlot);
        ExcelUtil<BizRackUSlot> util = new ExcelUtil<BizRackUSlot>(BizRackUSlot.class);
        util.exportExcel(response, list, "Rack U-Slot Data");
    }

    /**
     * 获取机柜U位管理详细信息
     */
    @ApiOperation("获取U位详情")
    @PreAuthorize("@ss.hasPermi('business:rackUSlot:query')")
    @GetMapping(value = "/{slotId}")
    public AjaxResult getInfo(@ApiParam("U位ID") @PathVariable("slotId") Long slotId)
    {
        return success(bizRackUSlotService.selectBizRackUSlotBySlotId(slotId));
    }

    /**
     * 新增机柜U位管理
     */
    @ApiOperation("新增U位")
    @PreAuthorize("@ss.hasPermi('business:rackUSlot:add')")
    @Log(title = "机柜U位管理", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@ApiParam("U位信息") @RequestBody BizRackUSlot bizRackUSlot)
    {
        bizRackUSlot.setCreateBy(getUsername());
        return toAjax(bizRackUSlotService.insertBizRackUSlot(bizRackUSlot));
    }

    /**
     * 修改机柜U位管理
     */
    @ApiOperation("修改U位")
    @PreAuthorize("@ss.hasPermi('business:rackUSlot:edit')")
    @Log(title = "机柜U位管理", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@ApiParam("U位信息") @RequestBody BizRackUSlot bizRackUSlot)
    {
        bizRackUSlot.setUpdateBy(getUsername());
        return toAjax(bizRackUSlotService.updateBizRackUSlot(bizRackUSlot));
    }

    /**
     * 删除机柜U位管理
     */
    @ApiOperation("删除U位")
    @PreAuthorize("@ss.hasPermi('business:rackUSlot:remove')")
    @Log(title = "机柜U位管理", businessType = BusinessType.DELETE)
    @DeleteMapping("/{slotIds}")
    public AjaxResult remove(@ApiParam("U位ID数组") @PathVariable Long[] slotIds)
    {
        return toAjax(bizRackUSlotService.deleteBizRackUSlotBySlotIds(slotIds));
    }

    /**
     * 分配U位
     */
    @ApiOperation("分配U位")
    @PreAuthorize("@ss.hasPermi('business:rackUSlot:allocate')")
    @Log(title = "分配U位", businessType = BusinessType.UPDATE)
    @PostMapping("/allocate")
    public AjaxResult allocate(@RequestBody Map<String, Object> params)
    {
        Long rackId = Long.valueOf(params.get("rackId").toString());
        Integer startU = Integer.valueOf(params.get("startU").toString());
        Integer uCount = Integer.valueOf(params.get("uCount").toString());
        String deviceName = (String) params.get("deviceName");
        String deviceType = (String) params.get("deviceType");
        String allocatedBy = getUsername();

        int rows = bizRackUSlotService.allocateUSlots(rackId, startU, uCount, deviceName, deviceType, allocatedBy);

        return success(Map.of(
            "affectedRows", rows,
            "message", "成功分配 " + rows + " 个U位"
        ));
    }

    /**
     * 释放U位
     */
    @ApiOperation("释放U位")
    @PreAuthorize("@ss.hasPermi('business:rackUSlot:release')")
    @Log(title = "释放U位", businessType = BusinessType.UPDATE)
    @PostMapping("/release")
    public AjaxResult release(@RequestBody Map<String, Object> params)
    {
        Long rackId = Long.valueOf(params.get("rackId").toString());
        Integer startU = Integer.valueOf(params.get("startU").toString());
        Integer uCount = Integer.valueOf(params.get("uCount").toString());
        String releasedBy = getUsername();

        int rows = bizRackUSlotService.releaseUSlots(rackId, startU, uCount, releasedBy);

        return success(Map.of(
            "affectedRows", rows,
            "message", "成功释放 " + rows + " 个U位"
        ));
    }
}
