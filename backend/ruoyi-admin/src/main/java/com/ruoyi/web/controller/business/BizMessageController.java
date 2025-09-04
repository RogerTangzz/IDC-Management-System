package com.ruoyi.web.controller.business;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.system.domain.BizMessage;
import com.ruoyi.system.service.IBizMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/business/message")
public class BizMessageController extends BaseController {
    @Autowired private IBizMessageService messageService;

    @PreAuthorize("@ss.hasPermi('business:message:list')")
    @GetMapping("/unread")
    public TableDataInfo unread(){
        startPage();
        Long uid = SecurityUtils.getUserId();
        List<BizMessage> list = messageService.unread(uid);
        return getDataTable(list);
    }

    @PreAuthorize("@ss.hasPermi('business:message:list')")
    @GetMapping("/countUnread")
    public AjaxResult countUnread(){
        Long uid = SecurityUtils.getUserId();
        Long c = messageService.countUnread(uid);
        return AjaxResult.success(c);
    }

    @PreAuthorize("@ss.hasPermi('business:message:read')")
    @PostMapping("/read/{id}")
    public AjaxResult markRead(@PathVariable Long id){
        messageService.markRead(id);
        return AjaxResult.success();
    }

    /** 全量分页+筛选 */
    @PreAuthorize("@ss.hasPermi('business:message:list')")
    @GetMapping("/list")
    public TableDataInfo list(@RequestParam(value = "readFlag", required = false) String readFlag,
                              @RequestParam(value = "type", required = false) String type){
        startPage();
        Long uid = SecurityUtils.getUserId();
        java.util.List<BizMessage> list = messageService.list(uid, readFlag, type);
        return getDataTable(list);
    }

    /** 一键已读 */
    @PreAuthorize("@ss.hasPermi('business:message:read')")
    @PostMapping("/readAll")
    public AjaxResult readAll(){
        Long uid = SecurityUtils.getUserId();
        messageService.markAllRead(uid);
        return AjaxResult.success();
    }
}
