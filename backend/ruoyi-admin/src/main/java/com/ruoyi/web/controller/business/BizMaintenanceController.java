package com.ruoyi.web.controller.business;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.PageDomain;
import com.ruoyi.common.core.page.TableSupport;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.common.utils.ServletUtils;
import com.ruoyi.common.utils.sql.SqlUtil;
import com.ruoyi.common.utils.poi.ExcelUtil;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.common.utils.DateUtils;
import com.github.pagehelper.PageHelper;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.BeanUtils;

import javax.servlet.http.HttpServletResponse;
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

    /** 查询维保计划列表 */
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

    /** 导出维保计划列表 */
    @Log(title = "维保计划", businessType = BusinessType.EXPORT)
    @PreAuthorize("@ss.hasPermi('business:maintenance:export')")
    @PostMapping("/export")
    public void export(HttpServletResponse response, BizMaintenance criteria) {
        // 数据权限：复用列表逻辑
        Boolean mineOnly = Boolean.TRUE.equals(ServletUtils.getParameterToBool("mineOnly"))
                || Boolean.TRUE.equals(ServletUtils.getParameterToBool("selfOnly"));
        if (Boolean.TRUE.equals(mineOnly) && !com.ruoyi.common.utils.SecurityUtils.isAdmin(getUserId())) {
            criteria.setCreateBy(getUsername());
        }

        // 排序白名单（复用列表逻辑）
        PageDomain pd = TableSupport.buildPageRequest();
        String obc = pd.getOrderByColumn();
        String isAsc = pd.getIsAsc();
        java.util.Set<String> whitelist = new java.util.HashSet<>(java.util.Arrays.asList(
                "planId", "planNo", "title", "version", "approvalStatus", "executionStatus", "lastExecutionTime", "nextExecutionTime", "createTime", "updateTime"));
        String safeOrderBy = "";
        if (StringUtils.isNotEmpty(obc) && whitelist.contains(obc)) {
            safeOrderBy = com.ruoyi.common.utils.StringUtils.toUnderScoreCase(obc) + " " + (StringUtils.isEmpty(isAsc) ? "asc" : isAsc);
            safeOrderBy = SqlUtil.escapeOrderBySql(safeOrderBy);
        }

        // 不分页查询（导出全部数据，限制最大10000条）
        PageHelper.startPage(1, 10000, safeOrderBy);
        List<BizMaintenance> list = bizMaintenanceService.selectBizMaintenanceList(criteria);

        // 使用 RuoYi ExcelUtil 导出
        ExcelUtil<BizMaintenance> util = new ExcelUtil<>(BizMaintenance.class);
        util.exportExcel(response, list, "维保计划");
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
    @Log(title = "维保计划", businessType = BusinessType.INSERT)
    @PreAuthorize("@ss.hasPermi('business:maintenance:add')")
    @PostMapping("/{id}/copy")
    public AjaxResult copy(@PathVariable Long id) {
        BizMaintenance source = bizMaintenanceService.selectBizMaintenanceByPlanId(id);
        if (source == null) {
            return AjaxResult.error("源计划不存在");
        }

        BizMaintenance newPlan = new BizMaintenance();
        // 复制字段（排除主键、编号、状态、审核信息等）
        BeanUtils.copyProperties(source, newPlan, "planId", "planNo", "approvalStatus", "executionStatus",
                "approverId", "approverName", "approvalTime", "approvalComment", "submitTime",
                "createBy", "createTime", "updateBy", "updateTime");

        // 重置为草稿状态
        newPlan.setApprovalStatus("draft");
        newPlan.setExecutionStatus("pending");

        // 备注中附加复制来源信息
        String remark = source.getRemark() != null ? source.getRemark() : "";
        newPlan.setRemark(remark + "\n[复制自计划 " + source.getPlanNo() + ", " + DateUtils.dateTimeNow() + "]");

        // 插入新计划（自动生成 planNo）
        int rows = bizMaintenanceService.insertBizMaintenance(newPlan);
        return rows > 0 ? AjaxResult.success(newPlan) : AjaxResult.error("复制失败");
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
    @Log(title = "维保计划", businessType = BusinessType.UPDATE)
    @PreAuthorize("@ss.hasPermi('business:maintenance:edit')")
    @PostMapping("/{id}/submit")
    public AjaxResult submit(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        BizMaintenance plan = bizMaintenanceService.selectBizMaintenanceByPlanId(id);
        if (plan == null) {
            return AjaxResult.error("计划不存在");
        }
        if (!"draft".equals(plan.getApprovalStatus())) {
            return AjaxResult.error("只能提交草稿状态的计划");
        }

        // 更新状态
        plan.setApprovalStatus("pending");
        plan.setSubmitTime(new Date());
        if (body.containsKey("approverId")) {
            plan.setApproverId(Long.valueOf(body.get("approverId").toString()));
        }

        int rows = bizMaintenanceService.updateBizMaintenance(plan);
        return rows > 0 ? AjaxResult.success() : AjaxResult.error("提交失败");
    }

    /** 审批通过 */
    @Log(title = "维保计划", businessType = BusinessType.UPDATE)
    @PreAuthorize("@ss.hasPermi('business:maintenance:approve')")
    @PostMapping("/{id}/approve")
    public AjaxResult approve(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        BizMaintenance plan = bizMaintenanceService.selectBizMaintenanceByPlanId(id);
        if (plan == null) {
            return AjaxResult.error("计划不存在");
        }
        if (!"pending".equals(plan.getApprovalStatus())) {
            return AjaxResult.error("只能审批待审核的计划");
        }

        plan.setApprovalStatus("approved");
        plan.setApprovalTime(new Date());
        if (body.containsKey("comment")) {
            plan.setApprovalComment(body.get("comment").toString());
        }

        int rows = bizMaintenanceService.updateBizMaintenance(plan);
        return rows > 0 ? AjaxResult.success() : AjaxResult.error("审批失败");
    }

    /** 审批拒绝 */
    @Log(title = "维保计划", businessType = BusinessType.UPDATE)
    @PreAuthorize("@ss.hasPermi('business:maintenance:approve')")
    @PostMapping("/{id}/reject")
    public AjaxResult reject(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        BizMaintenance plan = bizMaintenanceService.selectBizMaintenanceByPlanId(id);
        if (plan == null) {
            return AjaxResult.error("计划不存在");
        }
        if (!"pending".equals(plan.getApprovalStatus())) {
            return AjaxResult.error("只能拒绝待审核的计划");
        }

        plan.setApprovalStatus("rejected");
        plan.setApprovalTime(new Date());
        if (body.containsKey("reason")) {
            plan.setApprovalComment(body.get("reason").toString());
        }

        int rows = bizMaintenanceService.updateBizMaintenance(plan);
        return rows > 0 ? AjaxResult.success() : AjaxResult.error("拒绝失败");
    }

    /** 生成工单 */
    @PostMapping("/{id}/generateTicket")
    public AjaxResult generateTicket(@PathVariable Long id) {
        // TODO: 实现生成工单逻辑
        return AjaxResult.success();
    }

    /** 开始执行 */
    @Log(title = "维保计划", businessType = BusinessType.UPDATE)
    @PreAuthorize("@ss.hasPermi('business:maintenance:execute')")
    @PostMapping("/{id}/start")
    public AjaxResult start(@PathVariable Long id) {
        BizMaintenance plan = bizMaintenanceService.selectBizMaintenanceByPlanId(id);
        if (plan == null) {
            return AjaxResult.error("计划不存在");
        }
        if (!"approved".equals(plan.getApprovalStatus())) {
            return AjaxResult.error("只能执行已审批的计划");
        }
        if (!"pending".equals(plan.getExecutionStatus())) {
            return AjaxResult.error("计划已在执行中或已完成");
        }

        plan.setExecutionStatus("executing");
        plan.setLastExecutionTime(new Date());

        int rows = bizMaintenanceService.updateBizMaintenance(plan);
        return rows > 0 ? AjaxResult.success() : AjaxResult.error("开始执行失败");
    }

    /** 完成执行 */
    @Log(title = "维保计划", businessType = BusinessType.UPDATE)
    @PreAuthorize("@ss.hasPermi('business:maintenance:execute')")
    @PostMapping("/{id}/complete")
    public AjaxResult complete(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        BizMaintenance plan = bizMaintenanceService.selectBizMaintenanceByPlanId(id);
        if (plan == null) {
            return AjaxResult.error("计划不存在");
        }
        if (!"executing".equals(plan.getExecutionStatus())) {
            return AjaxResult.error("计划未在执行中");
        }

        plan.setExecutionStatus("completed");

        // 插入执行记录
        BizMaintenanceExecution execution = new BizMaintenanceExecution();
        execution.setPlanId(id);
        if (body.containsKey("result")) {
            execution.setExecutionResult(body.get("result").toString());
        }
        execution.setActualExecutionTime(new Date());
        execution.setExecutionStatus("completed");
        maintenanceExecutionService.insertBizMaintenanceExecution(execution);

        int rows = bizMaintenanceService.updateBizMaintenance(plan);
        return rows > 0 ? AjaxResult.success() : AjaxResult.error("完成执行失败");
    }

    /** 撤销 */
    @PostMapping("/{id}/revoke")
    public AjaxResult revoke(@PathVariable Long id) {
        // TODO: 实现撤销逻辑
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
                    m.put("operatorName", plan.getApplicantName() != null ? plan.getApplicantName() : plan.getCreateBy());
                    m.put("time", plan.getSubmitTime());
                    m.put("comment", null);
                    result.add(m);
                }
                if (plan.getApprovalTime() != null && StringUtils.isNotEmpty(plan.getApprovalStatus())) {
                    Map<String, Object> m = new HashMap<>();
                    String status = plan.getApprovalStatus();
                    m.put("action", "approved".equalsIgnoreCase(status) ? "approve" : ("rejected".equalsIgnoreCase(status) ? "reject" : status));
                    m.put("operatorName", plan.getApproverName() != null ? plan.getApproverName() : "系统");
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
                    String action = it.getExecutionStatus();
                    if ("executing".equalsIgnoreCase(action)) {
                        action = "start";
                    } else if ("completed".equalsIgnoreCase(action)) {
                        action = "complete";
                    }
                    m.put("action", action);
                    m.put("operatorName", it.getExecutorName() != null ? it.getExecutorName() : it.getCreateBy());
                    m.put("result", it.getExecutionResult());
                    m.put("time", it.getActualExecutionTime() != null ? it.getActualExecutionTime() : it.getPlanExecutionTime());
                    result.add(m);
                }
            }
        }

        // 按时间升序排序
        result.sort((a, b) -> {
            Object t1 = a.get("time");
            Object t2 = b.get("time");
            if (t1 == null && t2 == null) return 0;
            if (t1 == null) return 1;
            if (t2 == null) return -1;
            long v1 = (t1 instanceof java.util.Date) ? ((java.util.Date) t1).getTime() : 0L;
            long v2 = (t2 instanceof java.util.Date) ? ((java.util.Date) t2).getTime() : 0L;
            return Long.compare(v1, v2);
        });

        return AjaxResult.success(result);
    }
}
