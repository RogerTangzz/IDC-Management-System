package com.ruoyi.web.controller.business;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.core.domain.AjaxResult;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/business/ticket")
public class BizTicketController extends BaseController {

    /** 
     * 查询工单列表（临时实现：返回空表） 
     * 支持前端传入的 query：status, pageNum, pageSize 等
     */
    @GetMapping("/list")
    public TableDataInfo list(@RequestParam Map<String, String> query) {
        startPage(); // 复用 RuoYi 分页
        List<Object> rows = new ArrayList<>();
        return getDataTable(rows);
    }

    /** （占位）查询详情 */
    @GetMapping("/{id}")
    public AjaxResult getInfo(@PathVariable Long id) {
        return AjaxResult.success();
    }

    /** （占位）新增 */
    @PostMapping
    public AjaxResult add(@RequestBody Map<String, Object> data) {
        return AjaxResult.success();
    }

    /** （占位）修改 */
    @PutMapping
    public AjaxResult edit(@RequestBody Map<String, Object> data) {
        return AjaxResult.success();
    }

    /** （占位）删除 */
    @DeleteMapping("/{id}")
    public AjaxResult remove(@PathVariable Long id) {
        return AjaxResult.success();
    }
}
