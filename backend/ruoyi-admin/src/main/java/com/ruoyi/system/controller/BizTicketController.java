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
import com.ruoyi.system.domain.BizTicket;
import com.ruoyi.system.service.IBizTicketService;
import com.ruoyi.common.utils.poi.ExcelUtil;
import com.ruoyi.common.core.page.TableDataInfo;

/**
 * 工单Controller
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
@RestController
@RequestMapping("/system/ticket")
public class BizTicketController extends BaseController
{
    @Autowired
    private IBizTicketService bizTicketService;

    /**
     * 查询工单列表
     */
    @PreAuthorize("@ss.hasPermi('system:ticket:list')")
    @GetMapping("/list")
    public TableDataInfo list(BizTicket bizTicket)
    {
        startPage();
        List<BizTicket> list = bizTicketService.selectBizTicketList(bizTicket);
        return getDataTable(list);
    }

    /**
     * 导出工单列表
     */
    @PreAuthorize("@ss.hasPermi('system:ticket:export')")
    @Log(title = "工单", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(HttpServletResponse response, BizTicket bizTicket)
    {
        List<BizTicket> list = bizTicketService.selectBizTicketList(bizTicket);
        ExcelUtil<BizTicket> util = new ExcelUtil<BizTicket>(BizTicket.class);
        util.exportExcel(response, list, "工单数据");
    }

    /**
     * 获取工单详细信息
     */
    @PreAuthorize("@ss.hasPermi('system:ticket:query')")
    @GetMapping(value = "/{ticketId}")
    public AjaxResult getInfo(@PathVariable("ticketId") Long ticketId)
    {
        return success(bizTicketService.selectBizTicketByTicketId(ticketId));
    }

    /**
     * 新增工单
     */
    @PreAuthorize("@ss.hasPermi('system:ticket:add')")
    @Log(title = "工单", businessType = BusinessType.INSERT)
    @PostMapping
    public AjaxResult add(@RequestBody BizTicket bizTicket)
    {
        return toAjax(bizTicketService.insertBizTicket(bizTicket));
    }

    /**
     * 修改工单
     */
    @PreAuthorize("@ss.hasPermi('system:ticket:edit')")
    @Log(title = "工单", businessType = BusinessType.UPDATE)
    @PutMapping
    public AjaxResult edit(@RequestBody BizTicket bizTicket)
    {
        return toAjax(bizTicketService.updateBizTicket(bizTicket));
    }

    /**
     * 删除工单
     */
    @PreAuthorize("@ss.hasPermi('system:ticket:remove')")
    @Log(title = "工单", businessType = BusinessType.DELETE)
	@DeleteMapping("/{ticketIds}")
    public AjaxResult remove(@PathVariable Long[] ticketIds)
    {
        return toAjax(bizTicketService.deleteBizTicketByTicketIds(ticketIds));
    }
}
