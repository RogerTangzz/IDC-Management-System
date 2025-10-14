package com.ruoyi.web.controller.business;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.PageDomain;
import com.ruoyi.common.core.page.TableSupport;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.common.utils.ServletUtils;
import com.ruoyi.common.utils.sql.SqlUtil;
import com.github.pagehelper.PageHelper;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.ruoyi.system.domain.BizMaintenance;
import com.ruoyi.system.service.IBizMaintenanceService;
import com.ruoyi.system.service.IBizMaintenanceExecutionService;
import com.ruoyi.system.domain.BizMaintenanceExecution;

@RestController
@RequestMapping("/business/maintenance")
public class BizMaintenanceController extends BaseController {

    @Autowired
    private IBizMaintenanceService bizMaintenanceService;
    @Autowired
    private IBizMaintenanceExecutionService maintenanceExecutionService;

    /** 查询维保计划列表（临时实现：返回空表） */
    @GetMapping("/list")
    public TableDataInfo list(BizMaintenance criteria) {
        // 数据权限：mineOnly/selfOnly 且非管理员 => 仅本人创建
        Boolean mineOnly = Boolean.TRUE.equals(ServletUtils.getParameterToBool("mineOnly"))
                || Boolean.TRUE.equals(ServletUtils.getParameterToBool("selfOnly"));
        if (Boolean.TRUE.equals(mineOnly) && !com.ruoyi.common.utils.SecurityUtils.isAdmin(getUserId())) {
            criteria.setCreateBy(getUsername());
        }

        // 分页与排序白名单
        PageDomain pd = TableSupport.buildPageRequest();
        Integer pageNum = pd.getPageNum();
        Integer pageSize = pd.getPageSize();
        String obc = pd.getOrderByColumn();
        String isAsc = pd.getIsAsc();
        java.util.Set<String> whitelist = new java.util.HashSet<>(java.util.Arrays.asList(
                "planId", "planNo", "title", "version", "approvalStatus", "executionStatus", "lastExecutionTime", "nextExecutionTime", "createTime", "updateTime"));
        String safeOrderBy = "";
        if (StringUtils.isNotEmpty(obc) && whitelist.contains(obc)) {
            safeOrderBy = com.ruoyi.common.utils.StringUtils.toUnderScoreCase(obc) + " " + (StringUtils.isEmpty(isAsc) ? "asc" : isAsc);
            safeOrderBy = SqlUtil.escapeOrderBySql(safeOrderBy);
        }
        PageHelper.startPage(pageNum, pageSize, safeOrderBy).setReasonable(pd.getReasonable());

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

    /** 执行记录列表（支持按 planId 过滤），含数据权限（mineOnly/selfOnly） */
    @GetMapping("/execution/list")
    public TableDataInfo executionList(BizMaintenanceExecution criteria) {
        Boolean mineOnly = Boolean.TRUE.equals(ServletUtils.getParameterToBool("mineOnly"))
                || Boolean.TRUE.equals(ServletUtils.getParameterToBool("selfOnly"));
        if (Boolean.TRUE.equals(mineOnly) && !com.ruoyi.common.utils.SecurityUtils.isAdmin(getUserId())) {
            criteria.setCreateBy(getUsername());
        }
        startPage();
        List<BizMaintenanceExecution> list = maintenanceExecutionService.selectBizMaintenanceExecutionList(criteria);
        return getDataTable(list);
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

    /**
     * 审批/执行历史记录（合并返回）
     * type: approval | execution | all (default)
     */
    @GetMapping("/{id}/history")
    public AjaxResult history(@PathVariable Long id, @RequestParam(required = false) String type) {
        List<Map<String, Object>> result = new ArrayList<>();
        // 审批历史：由主表字段推导
        if (!"execution".equalsIgnoreCase(type)) {
            BizMaintenance plan = bizMaintenanceService.selectBizMaintenanceByPlanId(id);
            if (plan != null) {
                if (plan.getSubmitTime() != null) {
                    Map<String, Object> m = new HashMap<>();
                    m.put("action", "submit");
                    m.put("operatorName", plan.getCreateBy());
                    m.put("time", plan.getSubmitTime());
                    result.add(m);
                }
                if (plan.getApprovalTime() != null && StringUtils.isNotEmpty(plan.getApprovalStatus())) {
                    Map<String, Object> m = new HashMap<>();
                    String status = plan.getApprovalStatus();
                    m.put("action", "approved".equalsIgnoreCase(status) ? "approve" : ("rejected".equalsIgnoreCase(status) ? "reject" : status));
                    m.put("operatorName", plan.getApproverName());
                    m.put("comment", plan.getApprovalComment());
                    m.put("time", plan.getApprovalTime());
                    result.add(m);
                }
            }
        }
        // 执行历史：来源执行记录表
        if (!"approval".equalsIgnoreCase(type)) {
            BizMaintenanceExecution query = new BizMaintenanceExecution();
            query.setPlanId(id);
            List<BizMaintenanceExecution> items = maintenanceExecutionService.selectBizMaintenanceExecutionList(query);
            if (items != null) {
                for (BizMaintenanceExecution it : items) {
                    Map<String, Object> m = new HashMap<>();
                    m.put("action", it.getExecutionStatus());
                    m.put("operatorName", it.getExecutorName());
                    m.put("result", it.getExecutionResult());
                    m.put("time", it.getActualExecutionTime() != null ? it.getActualExecutionTime() : it.getPlanExecutionTime());
                    result.add(m);
                }
            }
        }
        // 简单时间排序
        result.sort((a, b) -> {
            Object t1 = a.get("time");
            Object t2 = b.get("time");
            long v1 = (t1 instanceof java.util.Date) ? ((java.util.Date) t1).getTime() : 0L;
            long v2 = (t2 instanceof java.util.Date) ? ((java.util.Date) t2).getTime() : 0L;
            return Long.compare(v1, v2);
        });
        return AjaxResult.success(result);
    }
}
