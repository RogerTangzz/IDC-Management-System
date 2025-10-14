package com.ruoyi.web.controller.business;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.utils.DateUtils;
import com.ruoyi.system.domain.BizTicket;
import com.ruoyi.system.service.IBizTicketService;
import com.ruoyi.system.service.IBizTicketLogService;
import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.system.domain.BizTicketLog;
import com.ruoyi.system.mapper.BizTicketMapper;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.Date;
import com.ruoyi.framework.config.properties.SlaProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 工单接口
 */
@RestController
@RequestMapping("/business/ticket")
public class BizTicketController extends BaseController {

    @Autowired
    private IBizTicketService bizTicketService;
    @Autowired
    private IBizTicketLogService bizTicketLogService;
    @Autowired
    private BizTicketMapper bizTicketMapper;
    @Autowired(required = false)
    private com.ruoyi.framework.config.SlaConfigService slaConfig;
    @Autowired(required = false)
    private SlaProperties slaProperties;

    /** 列表 */
    @PreAuthorize("@ss.hasPermi('business:ticket:list')")
    @GetMapping("/list")
    public TableDataInfo list(BizTicket query, @RequestParam(required = false) String mode, @RequestParam(required = false) Integer warnBeforeMinutes, @RequestParam(required = false) Integer warnBeforeHours) {
        startPage();
        // 数据权限:非管理员仅能查看与自己相关的工单(指派/报修/创建)
        try {
            Long uid = currentUserId(); String uname = currentUserName();
            if (uid != null && !com.ruoyi.common.utils.SecurityUtils.isAdmin(uid)){
                if (query.getParams() == null) query.setParams(new java.util.HashMap<>());
                query.getParams().put("selfOnly", "1");
                query.getParams().put("userId", uid);
                query.getParams().put("username", uname);
            }
        } catch (Exception ignore) {}        // 下钻模式 + 近到期窗口（分钟优先，其次小时，默认 2 小时）
        if (mode != null && !mode.isEmpty()) {
            if (query.getParams() == null) query.setParams(new java.util.HashMap<>());
            query.getParams().put("mode", mode);
            if ("neardue".equalsIgnoreCase(mode)) {
                if (warnBeforeMinutes != null && warnBeforeMinutes > 0) {
                    query.getParams().put("warnBeforeMinutes", warnBeforeMinutes);
                } else {
                    Integer hours = (warnBeforeHours != null && warnBeforeHours > 0) ? warnBeforeHours : null;
                    if (hours == null) {
                        try { if (slaConfig != null) hours = slaConfig.warnBeforeHours(); } catch (Exception ignore2) {}
                    }
                    if (hours == null) hours = 2;
                    query.getParams().put("warnBeforeHours", hours);
                }
            }
        }
        // 现在 lastAction/lastStatusTime 已持久化,直接查询
        List<BizTicket> list = bizTicketService.selectBizTicketList(query);
        return getDataTable(list);
    }

    /** 详情 */
    @PreAuthorize("@ss.hasPermi('business:ticket:query')")
    @GetMapping("/{id}")
    public AjaxResult getInfo(@PathVariable Long id) {
    BizTicket ticket = bizTicketService.selectBizTicketByTicketId(id);
        return AjaxResult.success(ticket);
    }

    /** 新增 */
    @PreAuthorize("@ss.hasPermi('business:ticket:add')")
    @PostMapping
    public AjaxResult add(@RequestBody BizTicket ticket) {
        if (ticket.getStatus() == null || ticket.getStatus().isEmpty()) {
            ticket.setStatus("pending");
        }
        if (ticket.getTicketNo() == null || ticket.getTicketNo().isEmpty()) {
            ticket.setTicketNo(generateTicketNo());
        }
    ticket.setLastAction("create");
    ticket.setLastStatusTime(new Date());
    int rows = bizTicketService.insertBizTicket(ticket);
    if (rows>0) {
        bizTicketLogService.log(ticket.getTicketId(), "create", null, ticket.getStatus(), null, currentUserId(), currentUserName());
    }
        return rows > 0 ? AjaxResult.success(ticket) : AjaxResult.error("新增失败");
    }

    /** 修改 */
    @PreAuthorize("@ss.hasPermi('business:ticket:edit')")
    @PutMapping
    public AjaxResult edit(@RequestBody BizTicket ticket) {
        BizTicket old = bizTicketService.selectBizTicketByTicketId(ticket.getTicketId());
        if (old == null) return AjaxResult.error("工单不存在");
        // 数据权限:非管理员仅允许修改与自己相关(指派给自己/自己报修/自己创建)的工单
        Long uid = currentUserId(); String uname = currentUserName();
        if (uid != null && !com.ruoyi.common.utils.SecurityUtils.isAdmin(uid)){
            boolean related = (old.getAssigneeId()!=null && uid.equals(old.getAssigneeId()))
                    || (old.getReporterId()!=null && uid.equals(old.getReporterId()))
                    || (uname!=null && uname.equals(old.getCreateBy()));
            if (!related) return AjaxResult.error("无权修改该工单");
        }
        String oldStatus = old==null?null:old.getStatus();
        if (old != null && ticket.getStatus()!=null && !old.getStatus().equals(ticket.getStatus())) {
            // 合法状态流转校验
            if (!isValidTransition(old.getStatus(), ticket.getStatus())) {
                return AjaxResult.error("非法状态流转: "+old.getStatus()+" -> "+ticket.getStatus());
            }
        }
        // 计算动作并一次性更新
        String action = (oldStatus==null || !oldStatus.equals(ticket.getStatus())) ? "update" : "edit";
        ticket.setLastAction(action);
        ticket.setLastStatusTime(new Date());
        int rows = bizTicketService.updateBizTicket(ticket);
        if (rows>0) {
            bizTicketLogService.log(ticket.getTicketId(), action, oldStatus, ticket.getStatus(), null, currentUserId(), currentUserName());
        }
        return rows > 0 ? AjaxResult.success(ticket) : AjaxResult.error("修改失败");
    }

    /** 删除 */
    @PreAuthorize("@ss.hasPermi('business:ticket:remove')")
    @DeleteMapping("/{id}")
    public AjaxResult remove(@PathVariable Long id) {
        int rows = bizTicketService.deleteBizTicketByTicketId(id);
        return rows > 0 ? AjaxResult.success() : AjaxResult.error("删除失败");
    }

    /** 单/多工单指派 */
    @PreAuthorize("@ss.hasPermi('business:ticket:assign')")
    @PostMapping("/assign")
    public AjaxResult assign(@RequestBody AssignBody body){
        if (body == null || body.getTicketIds()==null || body.getTicketIds().length==0) {
            return AjaxResult.error("ticketIds 不能为空");
        }
        bizTicketService.assignTickets(body.getTicketIds(), body.getAssigneeId(), body.getAssigneeName(), currentUserId(), currentUserName());
        return AjaxResult.success();
    }

    /** 批量指派快捷(兼容旧前端方法) */
    @PreAuthorize("@ss.hasPermi('business:ticket:assign')")
    @PostMapping("/batchAssign")
    public AjaxResult batchAssign(@RequestBody AssignBody body){
        return assign(body);
    }

    /** 开始处理 */
    @PreAuthorize("@ss.hasPermi('business:ticket:start')")
    @PostMapping("/start/{id}")
    public AjaxResult start(@PathVariable Long id){
        try {
            BizTicket t0 = bizTicketService.selectBizTicketByTicketId(id);
            if (t0 == null) return AjaxResult.error("工单不存在");
            Long uid = currentUserId();
            if (uid != null && !com.ruoyi.common.utils.SecurityUtils.isAdmin(uid)){
                if (t0.getAssigneeId()==null || !uid.equals(t0.getAssigneeId())) return AjaxResult.error("仅指派处理人可开始处理");
            }
            bizTicketService.startTicket(id, uid, currentUserName());
            BizTicket t = bizTicketService.selectBizTicketByTicketId(id);
            return AjaxResult.success(t);
        } catch (Exception e){
            return AjaxResult.error(e.getMessage());
        }
    }

    /** 完成工单 */
    @PreAuthorize("@ss.hasPermi('business:ticket:complete')")
    @PostMapping("/complete")
    public AjaxResult complete(@RequestBody CompleteBody body){
        if (body == null || body.getTicketId()==null) return AjaxResult.error("缺少 ticketId");
        try {
            BizTicket t0 = bizTicketService.selectBizTicketByTicketId(body.getTicketId());
            if (t0 == null) return AjaxResult.error("工单不存在");
            Long uid = currentUserId();
            if (uid != null && !com.ruoyi.common.utils.SecurityUtils.isAdmin(uid)){
                if (t0.getAssigneeId()==null || !uid.equals(t0.getAssigneeId())) return AjaxResult.error("仅指派处理人可完成工单");
            }
            bizTicketService.completeTicket(body.getTicketId(), body.getSolution(), body.getResult(), uid, currentUserName());
            BizTicket t = bizTicketService.selectBizTicketByTicketId(body.getTicketId());
            return AjaxResult.success(t);
        } catch (Exception e){
            return AjaxResult.error(e.getMessage());
        }
    }

    /** 关闭工单 */
    @PreAuthorize("@ss.hasPermi('business:ticket:close')")
    @PostMapping("/close/{id}")
    public AjaxResult close(@PathVariable Long id){
        try {
            BizTicket t0 = bizTicketService.selectBizTicketByTicketId(id);
            if (t0 == null) return AjaxResult.error("工单不存在");
            Long uid = currentUserId();
            if (uid != null && !com.ruoyi.common.utils.SecurityUtils.isAdmin(uid)){
                if (t0.getAssigneeId()==null || !uid.equals(t0.getAssigneeId())) return AjaxResult.error("仅指派处理人或管理员可关闭");
            }
            bizTicketService.closeTicket(id, uid, currentUserName());
            BizTicket t = bizTicketService.selectBizTicketByTicketId(id);
            return AjaxResult.success(t);
        } catch (Exception e){
            return AjaxResult.error(e.getMessage());
        }
    }

    /** reopen 工单:仅 closed 可 reopen,回到 processing(若有指派),否则 assigned */
    @PreAuthorize("@ss.hasPermi('business:ticket:reopen')")
    @PostMapping("/reopen/{id}")
    public AjaxResult reopen(@PathVariable Long id){
        try {
            BizTicket t0 = bizTicketService.selectBizTicketByTicketId(id);
            if (t0 == null) return AjaxResult.error("工单不存在");
            Long uid = currentUserId(); String uname = currentUserName();
            if (uid != null && !com.ruoyi.common.utils.SecurityUtils.isAdmin(uid)){
                boolean related = (t0.getAssigneeId()!=null && uid.equals(t0.getAssigneeId()))
                        || (t0.getReporterId()!=null && uid.equals(t0.getReporterId()))
                        || (uname!=null && uname.equals(t0.getCreateBy()));
                if (!related) return AjaxResult.error("无权重新打开该工单");
            }
            bizTicketService.reopenTicket(id, uid, uname);
            BizTicket t = bizTicketService.selectBizTicketByTicketId(id);
            return AjaxResult.success(t);
        } catch (Exception e){
            return AjaxResult.error(e.getMessage());
        }
    }

    /** 逾期工单列表 */
    @PreAuthorize("@ss.hasPermi('business:ticket:list')")
    @GetMapping("/overdue")
    public TableDataInfo overdue(BizTicket query){
        startPage();
        // 数据权限：非管理员仅能查看与自己相关的工单（双重保障，与 Mapper selfOnly 对齐）
        try {
            Long uid = currentUserId(); String uname = currentUserName();
            if (uid != null && !com.ruoyi.common.utils.SecurityUtils.isAdmin(uid)){
                if (query.getParams() == null) query.setParams(new java.util.HashMap<>());
                query.getParams().put("selfOnly", "1");
                query.getParams().put("userId", uid);
                query.getParams().put("username", uname);
            }
        } catch (Exception ignore) {}
        List<BizTicket> list = bizTicketMapper.selectOverdueList(query);
        return getDataTable(list);
    }

    /** 近到期工单列表(hours 默认取 SLA 配置 warnBeforeHours)*/
    @PreAuthorize("@ss.hasPermi('business:ticket:list')")
    @GetMapping("/nearDue")
    public TableDataInfo nearDue(
            @RequestParam(value = "warnBeforeMinutes", required = false) Integer warnBeforeMinutes,
            @RequestParam(value = "hours", required = false) Integer hours,
            @RequestParam(value = "warnBeforeHours", required = false) Integer warnBeforeHours
    ){
        startPage();
        BizTicket query = new BizTicket();
        java.util.Map<String,Object> p = new java.util.HashMap<>();
        p.put("mode", "neardue");
        try {
            Long uid = currentUserId(); String uname = currentUserName();
            if (uid != null && !com.ruoyi.common.utils.SecurityUtils.isAdmin(uid)){
                p.put("selfOnly", "1");
                p.put("userId", uid);
                p.put("username", uname);
            }
        } catch (Exception ignore) {}
        if (warnBeforeMinutes != null && warnBeforeMinutes > 0){
            p.put("warnBeforeMinutes", warnBeforeMinutes);
        } else {
            Integer h = (warnBeforeHours != null && warnBeforeHours > 0) ? warnBeforeHours
                    : (hours != null ? hours : (slaProperties!=null ? slaProperties.getWarnBeforeHours() : 2));
            p.put("warnBeforeHours", h);
        }
        query.setParams(p);
        List<BizTicket> list = bizTicketService.selectBizTicketList(query);
        return getDataTable(list);
    }

    /** 查询指定工单日志 */
    @PreAuthorize("@ss.hasPermi('business:ticket:log:list')")
    @GetMapping("/{id}/logs")
    public TableDataInfo logs(@PathVariable Long id, BizTicketLog query){
        // 支持分页
        startPage();
        query.setTicketId(id);
        List<BizTicketLog> logs = bizTicketLogService.listByTicket(id);
        return getDataTable(logs);
    }

    /** 简易统计报表:状态/优先级/今日新增/今日完成 */
    @PreAuthorize("@ss.hasPermi('business:ticket:report') or @ss.hasPermi('business:ticket:list')")
    @GetMapping("/report/summary")
    public AjaxResult summary(){
        try {
            java.util.Map<String,Object> result = new java.util.HashMap<>();
            java.util.Map<String,Long> byStatus = new java.util.HashMap<>();
            for (java.util.Map<String,Object> row : bizTicketMapper.countGroupByStatus()){
                if (row!=null && row.get("k")!=null) byStatus.put(String.valueOf(row.get("k")), ((Number)row.get("v")).longValue());
            }
            java.util.Map<String,Long> byPriority = new java.util.HashMap<>();
            for (java.util.Map<String,Object> row : bizTicketMapper.countGroupByPriority()){
                if (row!=null && row.get("k")!=null) byPriority.put(String.valueOf(row.get("k")), ((Number)row.get("v")).longValue());
            }
            java.util.Map<String,Object> today = bizTicketMapper.countToday();
            Long overdue = null; Long nearDue = null;
            try { overdue = bizTicketMapper.countOverdue(); } catch(Exception ignore) {}
            try { nearDue = bizTicketMapper.countNearDue(slaProperties!=null ? slaProperties.getWarnBeforeHours() : 2); } catch(Exception ignore) {}
            result.put("byStatus", byStatus);
            result.put("byPriority", byPriority);
            result.put("todayNew", today.get("todayNew"));
            result.put("todayCompleted", today.get("todayCompleted"));
            if (overdue!=null) result.put("overdue", overdue);
            if (nearDue!=null) result.put("nearDue", nearDue);
            return AjaxResult.success(result);
        } catch (Exception e){
            return AjaxResult.error("统计失败:"+e.getMessage());
        }
    }

    /** 高级分析:处理时长分布 & SLA */
    @PreAuthorize("@ss.hasPermi('business:ticket:report') or @ss.hasPermi('business:ticket:list')")
    @GetMapping("/report/analytics")
    public AjaxResult analytics(@RequestParam(required = false) String beginTime,
                                @RequestParam(required = false) String endTime){
        try {
            java.util.Map<String,Object> p = new java.util.HashMap<>();
            if (beginTime != null && !beginTime.isEmpty()) p.put("beginTime", beginTime);
            if (endTime != null && !endTime.isEmpty()) p.put("endTime", endTime);
            java.util.Map<String,Object> dist = bizTicketMapper.durationAnalytics(p);
            java.util.Map<String,Object> sla = bizTicketMapper.slaAnalytics(p);
            java.util.Map<String,Object> data = new java.util.HashMap<>();
            data.put("duration", dist);
            Number timeoutCount = (Number) sla.get("timeoutCount");
            Number withDeadline = (Number) sla.get("withDeadline");
            double rate = (withDeadline==null || withDeadline.longValue()==0)?0.0: timeoutCount.doubleValue()/withDeadline.doubleValue();
            sla.put("timeoutRate", rate);
            data.put("sla", sla);
            return AjaxResult.success(data);
        } catch (Exception e){
            return AjaxResult.error("分析失败:"+e.getMessage());
        }
    }

    /** 趋势:近7日或指定范围的 新增/完成 */
    @PreAuthorize("@ss.hasPermi('business:ticket:report') or @ss.hasPermi('business:ticket:list')")
    @GetMapping("/report/trend")
    public AjaxResult trend(@RequestParam(required = false) String beginTime,
                            @RequestParam(required = false) String endTime){
        try {
            java.util.Map<String,Object> p = new java.util.HashMap<>();
            if (beginTime == null || endTime == null){
                java.time.LocalDate end = java.time.LocalDate.now();
                java.time.LocalDate begin = end.minusDays(6);
                beginTime = begin.toString()+" 00:00:00";
                endTime = end.toString()+" 23:59:59";
            }
            p.put("beginTime", beginTime); p.put("endTime", endTime);
            java.util.List<java.util.Map<String,Object>> created = bizTicketMapper.trendCreated(p);
            java.util.List<java.util.Map<String,Object>> completed = bizTicketMapper.trendCompleted(p);
            java.util.Map<String,Object> data = new java.util.HashMap<>();
            data.put("created", created);
            data.put("completed", completed);
            data.put("beginTime", beginTime);
            data.put("endTime", endTime);
            return AjaxResult.success(data);
        } catch (Exception e){
            return AjaxResult.error("趋势失败:"+e.getMessage());
        }
    }

    /** 报表导出(占位) */
    @PreAuthorize("@ss.hasPermi('business:ticket:report')")
    @GetMapping("/report/export")
    public void exportReport(@RequestParam(required = false) String beginTime,
                             @RequestParam(required = false) String endTime,
                             javax.servlet.http.HttpServletResponse response){
        try {
            java.util.Map<String,Object> p = new java.util.HashMap<>();
            if (beginTime != null && !beginTime.isEmpty()) p.put("beginTime", beginTime);
            if (endTime != null && !endTime.isEmpty()) p.put("endTime", endTime);
            java.util.Map<String,Object> dist = bizTicketMapper.durationAnalytics(p);
            java.util.Map<String,Object> sla = bizTicketMapper.slaAnalytics(p);
            java.util.List<java.util.Map<String,Object>> created = bizTicketMapper.trendCreated(p);
            java.util.List<java.util.Map<String,Object>> completed = bizTicketMapper.trendCompleted(p);
            java.util.List<java.util.Map<String,Object>> byStatus = bizTicketMapper.countGroupByStatus();
            java.util.List<java.util.Map<String,Object>> byPriority = bizTicketMapper.countGroupByPriority();
            Long overdue = null, nearDue = null;
            try { overdue = bizTicketMapper.countOverdue(); } catch(Exception ignore) {}
            try { nearDue = bizTicketMapper.countNearDue(slaConfig!=null ? slaConfig.warnBeforeHours() : 2); } catch(Exception ignore) {}

            org.apache.poi.xssf.usermodel.XSSFWorkbook wb = new org.apache.poi.xssf.usermodel.XSSFWorkbook();

            // Summary sheet
            org.apache.poi.ss.usermodel.Sheet summary = wb.createSheet("Summary");
            org.apache.poi.ss.usermodel.Row r0 = summary.createRow(0);
            r0.createCell(0).setCellValue("Begin"); r0.createCell(1).setCellValue(beginTime==null?"":beginTime);
            org.apache.poi.ss.usermodel.Row r1 = summary.createRow(1);
            r1.createCell(0).setCellValue("End"); r1.createCell(1).setCellValue(endTime==null?"":endTime);
            org.apache.poi.ss.usermodel.Row r2 = summary.createRow(2);
            r2.createCell(0).setCellValue("Overdue"); r2.createCell(1).setCellValue(String.valueOf(overdue==null?0:overdue));
            org.apache.poi.ss.usermodel.Row r3 = summary.createRow(3);
            r3.createCell(0).setCellValue("NearDue"); r3.createCell(1).setCellValue(String.valueOf(nearDue==null?0:nearDue));

            // Duration sheet
            org.apache.poi.ss.usermodel.Sheet s1 = wb.createSheet("Duration");
            org.apache.poi.ss.usermodel.Row h1 = s1.createRow(0);
            writeRow(h1, "<1h","1-4h","4-8h","8-24h",">=24h","Total");
            org.apache.poi.ss.usermodel.Row d1 = s1.createRow(1);
            writeRow(d1, val(dist,"lt1h"), val(dist,"bt1to4h"), val(dist,"bt4to8h"), val(dist,"bt8to24h"), val(dist,"ge24h"), val(dist,"total"));

            // SLA sheet
            org.apache.poi.ss.usermodel.Sheet s2 = wb.createSheet("SLA");
            org.apache.poi.ss.usermodel.Row h2 = s2.createRow(0);
            writeRow(h2, "withDeadline","timeoutCount","ontimeCompleted","timeoutRate");
            double withDeadline = num(sla.get("withDeadline"));
            double timeoutCount = num(sla.get("timeoutCount"));
            double ontime = num(sla.get("ontimeCompleted"));
            double rate = withDeadline==0?0.0: timeoutCount/withDeadline;
            org.apache.poi.ss.usermodel.Row d2 = s2.createRow(1);
            writeRow(d2, (long)withDeadline, (long)timeoutCount, (long)ontime, String.format(java.util.Locale.ROOT, "%.2f%%", rate*100));

            // Trend sheet
            java.util.Map<String,Long> createdMap = new java.util.HashMap<>();
            for (java.util.Map<String,Object> m : created){ createdMap.put(String.valueOf(m.get("d")), ((Number)m.get("v")).longValue()); }
            java.util.Map<String,Long> completedMap = new java.util.HashMap<>();
            for (java.util.Map<String,Object> m : completed){ completedMap.put(String.valueOf(m.get("d")), ((Number)m.get("v")).longValue()); }
            org.apache.poi.ss.usermodel.Sheet s3 = wb.createSheet("Trend");
            org.apache.poi.ss.usermodel.Row h3 = s3.createRow(0);
            writeRow(h3, "date","created","completed");
            java.util.List<String> days = buildDays(beginTime, endTime);
            int rowIdx = 1;
            for (String day : days){
                org.apache.poi.ss.usermodel.Row r = s3.createRow(rowIdx++);
                writeRow(r, day, createdMap.getOrDefault(day,0L), completedMap.getOrDefault(day,0L));
            }

            // Status sheet
            org.apache.poi.ss.usermodel.Sheet s4 = wb.createSheet("Status");
            org.apache.poi.ss.usermodel.Row h4 = s4.createRow(0);
            writeRow(h4, "status","count");
            int idx4 = 1;
            for (java.util.Map<String,Object> m : byStatus){
                org.apache.poi.ss.usermodel.Row r = s4.createRow(idx4++);
                writeRow(r, String.valueOf(m.get("k")), String.valueOf(m.get("v")));
            }

            // Priority sheet
            org.apache.poi.ss.usermodel.Sheet s5 = wb.createSheet("Priority");
            org.apache.poi.ss.usermodel.Row h5 = s5.createRow(0);
            writeRow(h5, "priority","count");
            int idx5 = 1;
            for (java.util.Map<String,Object> m : byPriority){
                org.apache.poi.ss.usermodel.Row r = s5.createRow(idx5++);
                writeRow(r, String.valueOf(m.get("k")), String.valueOf(m.get("v")));
            }

            String filename = "ticket_report_" + com.ruoyi.common.utils.DateUtils.dateTimeNow("yyyyMMddHHmmss") + ".xlsx";
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment;filename=" + filename);
            wb.write(response.getOutputStream());
            response.getOutputStream().flush();
        } catch (Exception e){
            // 忽略导出异常,避免打断请求
        }
    }

    private String val(java.util.Map<String,Object> m, String k){ Object v = m==null?null:m.get(k); return v==null?"0":String.valueOf(v); }
    private double num(Object o){ if (o==null) return 0; if (o instanceof Number) return ((Number)o).doubleValue(); try { return Double.parseDouble(String.valueOf(o)); } catch(Exception e){ return 0; } }
    private void writeRow(org.apache.poi.ss.usermodel.Row r, Object... vals){
        for (int i=0;i<vals.length;i++){ r.createCell(i).setCellValue(String.valueOf(vals[i])); }
    }
    private java.util.List<String> buildDays(String begin, String end){
        java.util.List<String> days = new java.util.ArrayList<>();
        try {
            if (begin==null || begin.isEmpty() || end==null || end.isEmpty()) return days;
            java.time.LocalDate b = java.time.LocalDate.parse(begin.substring(0,10));
            java.time.LocalDate e = java.time.LocalDate.parse(end.substring(0,10));
            for (java.time.LocalDate d = b; !d.isAfter(e); d = d.plusDays(1)){
                days.add(d.toString());
            }
        } catch (Exception ignore) {}
        return days;
    }

    private java.time.LocalDate toLocalDate(java.util.Date d){
        return d.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
    }

    private Long currentUserId(){
        try { return SecurityUtils.getUserId(); } catch (Exception e){ return null; }
        }
    private String currentUserName(){
        try { return SecurityUtils.getUsername(); } catch (Exception e){ return null; }
    }

    /** 列表导出(与列表查询筛选/排序/时间范围/数据权限保持一致) */
    @PreAuthorize("@ss.hasPermi('business:ticket:export')")
    @PostMapping("/export")
    public void exportList(
            BizTicket query,
            @RequestParam(required = false) String beginTime,
            @RequestParam(required = false) String endTime,
            @RequestParam(required = false) String orderByColumn,
            @RequestParam(required = false) String isAsc,
            @RequestParam(required = false) String mode,
            @RequestParam(required = false) String mineOnly,
            @RequestParam(required = false) String selfOnly,
            @RequestParam(required = false) Integer warnBeforeMinutes,
            javax.servlet.http.HttpServletResponse response
    ){
        // 数据权限:非管理员仅本人;兼容 mineOnly/selfOnly 灰度
        try {
            Long uid = currentUserId(); String uname = currentUserName();
            if (uid != null && !com.ruoyi.common.utils.SecurityUtils.isAdmin(uid)){
                if (query.getParams() == null) query.setParams(new java.util.HashMap<>());
                boolean onlySelf = "1".equals(selfOnly) || "true".equalsIgnoreCase(String.valueOf(selfOnly))
                        || "1".equals(mineOnly) || "true".equalsIgnoreCase(String.valueOf(mineOnly));
                if (onlySelf) {
                    query.getParams().put("selfOnly", "1");
                    query.getParams().put("userId", uid);
                    query.getParams().put("username", uname);
                }
            }
        } catch (Exception ignore) {}

        // 时间范围
        if (beginTime != null && endTime != null) {
            if (query.getParams() == null) query.setParams(new java.util.HashMap<>());
            query.getParams().put("beginTime", beginTime);
            query.getParams().put("endTime", endTime);
        }
        // 排序(白名单避免 SQL 注入)
        if (orderByColumn != null && !orderByColumn.isEmpty()) {
            java.util.Set<String> whitelist = new java.util.HashSet<>(java.util.Arrays.asList(
                    "ticket_no","title","status","priority","reporter_name","assignee_name","last_status_time","create_time","completion_time"
            ));
            if (whitelist.contains(orderByColumn)) {
                String order = ("desc".equalsIgnoreCase(isAsc) ? "desc" : "asc");
                if (query.getParams() == null) query.setParams(new java.util.HashMap<>());
                query.getParams().put("orderBy", orderByColumn + " " + order);
            }
        }
        // 下钻模式(可选);近到期支持分钟/小时粒度窗口(优先分钟),默认 2 小时
        if (mode != null && !mode.isEmpty()){
            if (query.getParams() == null) query.setParams(new java.util.HashMap<>());
            query.getParams().put("mode", mode);
            if ("neardue".equalsIgnoreCase(mode)){
                if (warnBeforeMinutes != null && warnBeforeMinutes > 0) {
                    query.getParams().put("warnBeforeMinutes", warnBeforeMinutes);
                } else {
                    Integer warn = null;
                    try { if (slaConfig != null) warn = slaConfig.warnBeforeHours(); } catch (Exception ignore) {}
                    if (warn == null) warn = 2;
                    query.getParams().put("warnBeforeHours", warn);
                }
            }
        }

        // 查询数据(不分页)
        java.util.List<BizTicket> list = bizTicketService.selectBizTicketList(query);

        // 导出 Excel
        try (org.apache.poi.xssf.usermodel.XSSFWorkbook wb = new org.apache.poi.xssf.usermodel.XSSFWorkbook()){
            org.apache.poi.ss.usermodel.Sheet sheet = wb.createSheet("Tickets");
            int r = 0;
            org.apache.poi.ss.usermodel.Row header = sheet.createRow(r++);
            writeRow(header, "ticketNo","title","status","priority","reporterName","assigneeName","lastAction","lastStatusTime");
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            for (BizTicket t : list){
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(r++);
                writeRow(row,
                        t.getTicketNo(),
                        t.getTitle(),
                        t.getStatus(),
                        t.getPriority(),
                        t.getReporterName(),
                        t.getAssigneeName(),
                        t.getLastAction(),
                        t.getLastStatusTime()==null?"":sdf.format(t.getLastStatusTime())
                );
            }
            String filename = "ticket_" + com.ruoyi.common.utils.DateUtils.dateTimeNow("yyyyMMddHHmm") + ".xlsx";
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment;filename=" + filename);
            wb.write(response.getOutputStream());
            response.getOutputStream().flush();
        } catch (Exception ignore) {}
    }

    /** 请求体*/
    public static class AssignBody {
        private Long[] ticketIds; private Long assigneeId; private String assigneeName; public Long[] getTicketIds(){return ticketIds;} public void setTicketIds(Long[] a){this.ticketIds=a;} public Long getAssigneeId(){return assigneeId;} public void setAssigneeId(Long a){this.assigneeId=a;} public String getAssigneeName(){return assigneeName;} public void setAssigneeName(String n){this.assigneeName=n;}
    }

    public static class CompleteBody {
        private Long ticketId; private String solution; private String result; // result 预留
        public Long getTicketId(){return ticketId;} public void setTicketId(Long id){this.ticketId=id;}
        public String getSolution(){return solution;} public void setSolution(String s){this.solution=s;}
        public String getResult(){return result;} public void setResult(String r){this.result=r;}
    }

    /** 简单 ticketNo 生成:TK + yyyyMMddHHmmssSSS */
    private String generateTicketNo() {
        return "TK" + DateUtils.dateTimeNow("yyyyMMddHHmmssSSS");
    }

    // 旧的 findLatestLog 已不再需要(last* 已持久化)
    private boolean isValidTransition(String from, String to){
        if (from==null) return true;
        if (from.equals(to)) return true;
        switch(from){
            case "pending": return to.equals("assigned") || to.equals("closed");
            case "assigned": return to.equals("processing") || to.equals("closed");
            case "processing": return to.equals("completed") || to.equals("closed");
            case "completed": return to.equals("closed") || to.equals("processing"); // 允许回退(重新处理)
            case "closed": return to.equals("processing") || to.equals("assigned"); // reopen 情况
            default: return false;
        }
    }
}
