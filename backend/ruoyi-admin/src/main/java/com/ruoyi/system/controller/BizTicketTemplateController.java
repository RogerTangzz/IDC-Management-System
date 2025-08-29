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
import com.ruoyi.system.domain.BizTicketTemplate;
import com.ruoyi.system.service.IBizTicketTemplateService;
import com.ruoyi.common.utils.poi.ExcelUtil;
import com.ruoyi.common.core.page.TableDataInfo;

/**
 * 工单模板Controller
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
@RestController
@RequestMapping("/system/template")
public class BizTicketTemplateController extends BaseController
{
    @Autowired
    private IBizTicketTemplateService bizTicketTemplateService;

    /**
     * 查询工单模板列表
     */
    @PreAuthorize("@ss.hasPermi('system:template:list')")
    @GetMapping("/list")
    public TableDataInfo list(BizTicketTemplate bizTicketTemplate)
    {
        startPage();
        List<BizTicketTemplate> list = bizTicketTemplateService.selectBizTicketTemplateList(bizTicketTemplate);
        return getDataTable(list);
    }

    /**
     * 导出工单模板列表
     */
    @PreAuthorize("@ss.hasPermi('system:template:export')")
    @Log(title = "工单模板", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, BizTicketTemplate bizTicketTemplate)
    {
        List<BizTicketTemplate> list = bizTicketTemplateService.selectBizTicketTemplateList(bizTicketTemplate);
        ExcelUtil<BizTicketTemplate> util = new ExcelUtil<BizTicketTemplate>(BizTicketTemplate.class);
        util.exportExcel(response, list, "工单模板数据");
    }

    /**
     * 获取工单模板详细信息
     */
    @PreAuthorize("@ss.hasPermi('system:template:query')")
    @GetMapping(value = "/{templateId}")
    public AjaxResult getInfo(@PathVariable("templateId") Long templateId)
    {
        return success(bizTicketTemplateService.selectBizTicketTemplateByTemplateId(templateId));
    }

    /**
     * 新增工单模板
     */
    @PreAuthorize("@ss.hasPermi('system:template:add')")
    @Log(title = "工单模板", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@RequestBody BizTicketTemplate bizTicketTemplate)
    {
        return toAjax(bizTicketTemplateService.insertBizTicketTemplate(bizTicketTemplate));
    }

    /**
     * 修改工单模板
     */
    @PreAuthorize("@ss.hasPermi('system:template:edit')")
    @Log(title = "工单模板", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@RequestBody BizTicketTemplate bizTicketTemplate)
    {
        return toAjax(bizTicketTemplateService.updateBizTicketTemplate(bizTicketTemplate));
    }

    /**
     * 删除工单模板
     */
    @PreAuthorize("@ss.hasPermi('system:template:remove')")
    @Log(title = "工单模板", businessType = BusinessType.DELETE)
	@DeleteMapping("/{templateIds}")
    public AjaxResult remove(@PathVariable Long[] templateIds)
    {
        return toAjax(bizTicketTemplateService.deleteBizTicketTemplateByTemplateIds(templateIds));
    }
}
