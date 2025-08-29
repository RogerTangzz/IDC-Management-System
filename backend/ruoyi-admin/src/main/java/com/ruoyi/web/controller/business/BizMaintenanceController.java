package com.ruoyi.web.controller.business;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.core.domain.AjaxResult;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/business/maintenance")
public class BizMaintenanceController extends BaseController {

    /** 查询维保计划列表（临时实现：返回空表） */
    @GetMapping("/list")
    public TableDataInfo list(@RequestParam Map<String, String> query) {
        // 支持 approvalStatus / executionStatus / pageSize 等筛选参数
        startPage();
        List<Object> rows = new ArrayList<>();
        return getDataTable(rows);
    }

    /** 占位：复制计划 */
    @PostMapping("/{id}/copy")
    public AjaxResult copy(@PathVariable Long id) {
        return AjaxResult.success();
    }

    /** 占位：提交审核 */
    @PostMapping("/{id}/submit")
    public AjaxResult submit(@PathVariable Long id) {
        return AjaxResult.success();
    }

    /** 占位：开始执行 */
    @PostMapping("/execution/start")
    public AjaxResult startExecution(@RequestBody Map<String, Object> body) {
        return AjaxResult.success();
    }

    /** 占位：完成执行 */
    @PostMapping("/execution/complete")
    public AjaxResult completeExecution(@RequestBody Map<String, Object> body) {
        return AjaxResult.success();
    }
}
