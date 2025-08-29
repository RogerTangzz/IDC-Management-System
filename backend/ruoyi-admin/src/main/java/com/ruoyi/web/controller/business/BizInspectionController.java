package com.ruoyi.web.controller.business;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.core.domain.AjaxResult;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/business/inspection")
public class BizInspectionController extends BaseController {

    @GetMapping("/list")
    public TableDataInfo list(@RequestParam Map<String, String> query) {
        startPage();
        List<Object> rows = new ArrayList<>();
        return getDataTable(rows);
    }

    @GetMapping("/{id}")
    public AjaxResult getInfo(@PathVariable Long id) {
        return AjaxResult.success();
    }

    @PostMapping
    public AjaxResult add(@RequestBody Map<String, Object> data) {
        return AjaxResult.success();
    }

    /** 例如：获取最近一次巡检（前端可能会用到） */
    @GetMapping("/latest")
    public AjaxResult latest() {
        return AjaxResult.success();
    }

    /** 例如：由巡检异常“自动生成工单”的入口 */
    @PostMapping("/generateTickets")
    public AjaxResult generateTickets(@RequestBody Map<String, Object> body) {
        return AjaxResult.success();
    }
}
