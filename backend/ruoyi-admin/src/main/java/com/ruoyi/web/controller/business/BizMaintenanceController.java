package com.ruoyi.web.controller.business;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.core.domain.AjaxResult;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.ruoyi.system.domain.BizMaintenance;
import com.ruoyi.system.service.IBizMaintenanceService;

@RestController
@RequestMapping("/business/maintenance")
public class BizMaintenanceController extends BaseController {

    @Autowired
    private IBizMaintenanceService bizMaintenanceService;

    /** 查询维保计划列表（临时实现：返回空表） */
    @GetMapping("/list")
    public TableDataInfo list(BizMaintenance criteria) {
        startPage();
        List<BizMaintenance> list = bizMaintenanceService.selectBizMaintenanceList(criteria);
        return getDataTable(list);
    }

    /** 兼容：GET /business/maintenance 直接等价于 /list */
    @GetMapping
    public TableDataInfo listRoot(BizMaintenance criteria) {
        return list(criteria);
    }

    /** 获取审批人占位 */
    @GetMapping("/approvers")
    public AjaxResult approvers() {
        List<Map<String, Object>> list = new ArrayList<>();
        return AjaxResult.success(list);
    }

    /** 获取通知人占位 */
    @GetMapping("/notifyUsers")
    public AjaxResult notifyUsers() {
        List<Map<String, Object>> list = new ArrayList<>();
        return AjaxResult.success(list);
    }

    /** 最近一次计划（示意） */
    @GetMapping("/latest")
    public AjaxResult latest() {
        return AjaxResult.success(new HashMap<>());
    }

    /** 详情 */
    @GetMapping("/{id}")
    public AjaxResult getInfo(@PathVariable Long id) {
        BizMaintenance data = bizMaintenanceService.selectBizMaintenanceByPlanId(id);
        return AjaxResult.success(data);
    }

    /** 新增 */
    @PostMapping
    public AjaxResult add(@RequestBody BizMaintenance body) {
        // 初始状态
        if (body.getApprovalStatus() == null) body.setApprovalStatus("draft");
        if (body.getExecutionStatus() == null) body.setExecutionStatus("pending");
        int rows = bizMaintenanceService.insertBizMaintenance(body);
        return rows > 0 ? AjaxResult.success(body) : AjaxResult.error("新增失败");
    }

    /** 修改 */
    @PutMapping
    public AjaxResult edit(@RequestBody BizMaintenance body) {
        int rows = bizMaintenanceService.updateBizMaintenance(body);
        return rows > 0 ? AjaxResult.success(body) : AjaxResult.error("修改失败");
    }

    /** 删除 */
    @DeleteMapping("/{id}")
    public AjaxResult remove(@PathVariable Long id) {
        int rows = bizMaintenanceService.deleteBizMaintenanceByPlanId(id);
        return rows > 0 ? AjaxResult.success() : AjaxResult.error("删除失败");
    }

    /** 复制计划 */
    @PostMapping("/{id}/copy")
    public AjaxResult copy(@PathVariable Long id) {
        return AjaxResult.success();
    }

    /** 提交审核 */
    @PostMapping("/{id}/submit")
    public AjaxResult submit(@PathVariable Long id) {
        return AjaxResult.success();
    }

    /** 审批通过 */
    @PostMapping("/{id}/approve")
    public AjaxResult approve(@PathVariable Long id) {
        return AjaxResult.success();
    }

    /** 审批拒绝 */
    @PostMapping("/{id}/reject")
    public AjaxResult reject(@PathVariable Long id) {
        return AjaxResult.success();
    }

    /** 生成工单 */
    @PostMapping("/{id}/generateTicket")
    public AjaxResult generateTicket(@PathVariable Long id) {
        return AjaxResult.success();
    }

    /** 开始执行 */
    @PostMapping("/{id}/start")
    public AjaxResult start(@PathVariable Long id) {
        return AjaxResult.success();
    }

    /** 完成执行 */
    @PostMapping("/{id}/complete")
    public AjaxResult complete(@PathVariable Long id) {
        return AjaxResult.success();
    }

    /** 撤销 */
    @PostMapping("/{id}/revoke")
    public AjaxResult revoke(@PathVariable Long id) {
        return AjaxResult.success();
    }

    /** 历史记录 */
    @GetMapping("/{id}/history")
    public AjaxResult history(@PathVariable Long id) {
        List<Map<String, Object>> list = new ArrayList<>();
        return AjaxResult.success(list);
    }
}
