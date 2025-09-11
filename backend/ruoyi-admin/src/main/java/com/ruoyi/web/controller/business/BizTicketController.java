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
 * 宸ュ崟鎺ュ彛
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

    /** 鍒楄〃 */
    @PreAuthorize("@ss.hasPermi('business:ticket:list')")
    @GetMapping("/list")
    public TableDataInfo list(BizTicket query, @RequestParam(required = false) String mode, @RequestParam(required = false) Integer warnBeforeMinutes, @RequestParam(required = false) Integer warnBeforeHours) {
        startPage();
        // 鏁版嵁鏉冮檺锛氶潪绠＄悊鍛樹粎鑳芥煡鐪嬩笌鑷繁鐩稿叧鐨勫伐鍗曪紙鎸囨淳/鎶ヤ慨/鍒涘缓锛?
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
        // 鐜板湪 lastAction/lastStatusTime 宸叉寔涔呭寲锛岀洿鎺ユ煡璇?
        List<BizTicket> list = bizTicketService.selectBizTicketList(query);
        return getDataTable(list);
    }

    /** 璇︽儏 */
    @PreAuthorize("@ss.hasPermi('business:ticket:query')")
    @GetMapping("/{id}")
    public AjaxResult getInfo(@PathVariable Long id) {
    BizTicket ticket = bizTicketService.selectBizTicketByTicketId(id);
        return AjaxResult.success(ticket);
    }

    /** 鏂板 */
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
        return rows > 0 ? AjaxResult.success(ticket) : AjaxResult.error("鏂板澶辫触");
    }

    /** 淇敼 */
    @PreAuthorize("@ss.hasPermi('business:ticket:edit')")
    @PutMapping
    public AjaxResult edit(@RequestBody BizTicket ticket) {
        BizTicket old = bizTicketService.selectBizTicketByTicketId(ticket.getTicketId());
        if (old == null) return AjaxResult.error("宸ュ崟涓嶅瓨鍦?);
        // 鏁版嵁鏉冮檺锛氶潪绠＄悊鍛樹粎鍏佽淇敼涓庤嚜宸辩浉鍏筹紙鎸囨淳缁欒嚜宸?鑷繁鎶ヤ慨/鑷繁鍒涘缓锛夌殑宸ュ崟
        Long uid = currentUserId(); String uname = currentUserName();
        if (uid != null && !com.ruoyi.common.utils.SecurityUtils.isAdmin(uid)){
            boolean related = (old.getAssigneeId()!=null && uid.equals(old.getAssigneeId()))
                    || (old.getReporterId()!=null && uid.equals(old.getReporterId()))
                    || (uname!=null && uname.equals(old.getCreateBy()));
            if (!related) return AjaxResult.error("鏃犳潈淇敼璇ュ伐鍗?);
        }
        String oldStatus = old==null?null:old.getStatus();
        if (old != null && ticket.getStatus()!=null && !old.getStatus().equals(ticket.getStatus())) {
            // 鍚堟硶鐘舵€佹祦杞牎楠?
            if (!isValidTransition(old.getStatus(), ticket.getStatus())) {
                return AjaxResult.error("闈炴硶鐘舵€佹祦杞? "+old.getStatus()+" -> "+ticket.getStatus());
            }
        }
        // 璁＄畻鍔ㄤ綔骞朵竴娆℃€ф洿鏂?
        String action = (oldStatus==null || !oldStatus.equals(ticket.getStatus())) ? "update" : "edit";
        ticket.setLastAction(action);
        ticket.setLastStatusTime(new Date());
        int rows = bizTicketService.updateBizTicket(ticket);
        if (rows>0) {
            bizTicketLogService.log(ticket.getTicketId(), action, oldStatus, ticket.getStatus(), null, currentUserId(), currentUserName());
        }
        return rows > 0 ? AjaxResult.success(ticket) : AjaxResult.error("淇敼澶辫触");
    }

    /** 鍒犻櫎 */
    @PreAuthorize("@ss.hasPermi('business:ticket:remove')")
    @DeleteMapping("/{id}")
    public AjaxResult remove(@PathVariable Long id) {
        int rows = bizTicketService.deleteBizTicketByTicketId(id);
        return rows > 0 ? AjaxResult.success() : AjaxResult.error("鍒犻櫎澶辫触");
    }

    /** 鍗?澶氬伐鍗曟寚娲?*/
    @PreAuthorize("@ss.hasPermi('business:ticket:assign')")
    @PostMapping("/assign")
    public AjaxResult assign(@RequestBody AssignBody body){
        if (body == null || body.getTicketIds()==null || body.getTicketIds().length==0) {
            return AjaxResult.error("ticketIds 涓嶈兘涓虹┖");
        }
        bizTicketService.assignTickets(body.getTicketIds(), body.getAssigneeId(), body.getAssigneeName(), currentUserId(), currentUserName());
        return AjaxResult.success();
    }

    /** 鎵归噺鎸囨淳蹇嵎锛堝吋瀹规棫鍓嶇鏂规硶锛?*/
    @PreAuthorize("@ss.hasPermi('business:ticket:assign')")
    @PostMapping("/batchAssign")
    public AjaxResult batchAssign(@RequestBody AssignBody body){
        return assign(body);
    }

    /** 寮€濮嬪鐞?*/
    @PreAuthorize("@ss.hasPermi('business:ticket:start')")
    @PostMapping("/start/{id}")
    public AjaxResult start(@PathVariable Long id){
        try {
            BizTicket t0 = bizTicketService.selectBizTicketByTicketId(id);
            if (t0 == null) return AjaxResult.error("宸ュ崟涓嶅瓨鍦?);
            Long uid = currentUserId();
            if (uid != null && !com.ruoyi.common.utils.SecurityUtils.isAdmin(uid)){
                if (t0.getAssigneeId()==null || !uid.equals(t0.getAssigneeId())) return AjaxResult.error("浠呮寚娲惧鐞嗕汉鍙紑濮嬪鐞?);
            }
            bizTicketService.startTicket(id, uid, currentUserName());
            BizTicket t = bizTicketService.selectBizTicketByTicketId(id);
            return AjaxResult.success(t);
        } catch (Exception e){
            return AjaxResult.error(e.getMessage());
        }
    }

    /** 瀹屾垚宸ュ崟 */
    @PreAuthorize("@ss.hasPermi('business:ticket:complete')")
    @PostMapping("/complete")
    public AjaxResult complete(@RequestBody CompleteBody body){
        if (body == null || body.getTicketId()==null) return AjaxResult.error("缂哄皯 ticketId");
        try {
            BizTicket t0 = bizTicketService.selectBizTicketByTicketId(body.getTicketId());
            if (t0 == null) return AjaxResult.error("宸ュ崟涓嶅瓨鍦?);
            Long uid = currentUserId();
            if (uid != null && !com.ruoyi.common.utils.SecurityUtils.isAdmin(uid)){
                if (t0.getAssigneeId()==null || !uid.equals(t0.getAssigneeId())) return AjaxResult.error("浠呮寚娲惧鐞嗕汉鍙畬鎴愬伐鍗?);
            }
            bizTicketService.completeTicket(body.getTicketId(), body.getSolution(), body.getResult(), uid, currentUserName());
            BizTicket t = bizTicketService.selectBizTicketByTicketId(body.getTicketId());
            return AjaxResult.success(t);
        } catch (Exception e){
            return AjaxResult.error(e.getMessage());
        }
    }

    /** 鍏抽棴宸ュ崟 */
    @PreAuthorize("@ss.hasPermi('business:ticket:close')")
    @PostMapping("/close/{id}")
    public AjaxResult close(@PathVariable Long id){
        try {
            BizTicket t0 = bizTicketService.selectBizTicketByTicketId(id);
            if (t0 == null) return AjaxResult.error("宸ュ崟涓嶅瓨鍦?);
            Long uid = currentUserId();
            if (uid != null && !com.ruoyi.common.utils.SecurityUtils.isAdmin(uid)){
                if (t0.getAssigneeId()==null || !uid.equals(t0.getAssigneeId())) return AjaxResult.error("浠呮寚娲惧鐞嗕汉鎴栫鐞嗗憳鍙叧闂?);
            }
            bizTicketService.closeTicket(id, uid, currentUserName());
            BizTicket t = bizTicketService.selectBizTicketByTicketId(id);
            return AjaxResult.success(t);
        } catch (Exception e){
            return AjaxResult.error(e.getMessage());
        }
    }

    /** reopen 宸ュ崟锛氫粎 closed 鍙?reopen锛屽洖鍒?processing锛堣嫢鏈夋寚娲撅級锛屽惁鍒?assigned */
    @PreAuthorize("@ss.hasPermi('business:ticket:reopen')")
    @PostMapping("/reopen/{id}")
    public AjaxResult reopen(@PathVariable Long id){
        try {
            BizTicket t0 = bizTicketService.selectBizTicketByTicketId(id);
            if (t0 == null) return AjaxResult.error("宸ュ崟涓嶅瓨鍦?);
            Long uid = currentUserId(); String uname = currentUserName();
            if (uid != null && !com.ruoyi.common.utils.SecurityUtils.isAdmin(uid)){
                boolean related = (t0.getAssigneeId()!=null && uid.equals(t0.getAssigneeId()))
                        || (t0.getReporterId()!=null && uid.equals(t0.getReporterId()))
                        || (uname!=null && uname.equals(t0.getCreateBy()));
                if (!related) return AjaxResult.error("鏃犳潈閲嶆柊鎵撳紑璇ュ伐鍗?);
            }
            bizTicketService.reopenTicket(id, uid, uname);
            BizTicket t = bizTicketService.selectBizTicketByTicketId(id);
            return AjaxResult.success(t);
        } catch (Exception e){
            return AjaxResult.error(e.getMessage());
        }
    }

    /** 閫炬湡宸ュ崟鍒楄〃 */
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

    /** 杩戝埌鏈熷伐鍗曞垪琛紙hours 榛樿鍙?SLA 閰嶇疆 warnBeforeHours锛?*/
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

    /** 鏌ヨ鎸囧畾宸ュ崟鏃ュ織 */
    @PreAuthorize("@ss.hasPermi('business:ticket:log:list')")
    @GetMapping("/{id}/logs")
    public TableDataInfo logs(@PathVariable Long id, BizTicketLog query){
        // 鏀寔鍒嗛〉
        startPage();
        query.setTicketId(id);
        List<BizTicketLog> logs = bizTicketLogService.listByTicket(id);
        return getDataTable(logs);
    }

    /** 绠€鏄撶粺璁℃姤琛細鐘舵€?浼樺厛绾?浠婃棩鏂板/浠婃棩瀹屾垚 */
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
            return AjaxResult.error("缁熻澶辫触:"+e.getMessage());
        }
    }

    /** 楂樼骇鍒嗘瀽锛氬鐞嗘椂闀垮垎甯?& SLA */
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
            return AjaxResult.error("鍒嗘瀽澶辫触:"+e.getMessage());
        }
    }

    /** 瓒嬪娍锛氳繎7鏃ユ垨鎸囧畾鑼冨洿鐨?鏂板/瀹屾垚 */
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
            return AjaxResult.error("瓒嬪娍澶辫触:"+e.getMessage());
        }
    }

    /** 鎶ヨ〃瀵煎嚭锛堝崰浣嶏級 */
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
            // 蹇界暐瀵煎嚭寮傚父锛岄伩鍏嶆墦鏂姹?
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

    /** 鍒楄〃瀵煎嚭锛堜笌鍒楄〃鏌ヨ绛涢€?鎺掑簭/鏃堕棿鑼冨洿/鏁版嵁鏉冮檺淇濇寔涓€鑷达級 */
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
        // 鏁版嵁鏉冮檺锛氶潪绠＄悊鍛樹粎鏈汉锛涘吋瀹?mineOnly/selfOnly 鐏板害
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

        // 鏃堕棿鑼冨洿
        if (beginTime != null && endTime != null) {
            if (query.getParams() == null) query.setParams(new java.util.HashMap<>());
            query.getParams().put("beginTime", beginTime);
            query.getParams().put("endTime", endTime);
        }
        // 鎺掑簭锛堢櫧鍚嶅崟閬垮厤 SQL 娉ㄥ叆锛?        if (orderByColumn != null && !orderByColumn.isEmpty()) {
            java.util.Set<String> whitelist = new java.util.HashSet<>(java.util.Arrays.asList(
                    "ticket_no","title","status","priority","reporter_name","assignee_name","last_status_time","create_time","completion_time"
            ));
            if (whitelist.contains(orderByColumn)) {
                String order = ("desc".equalsIgnoreCase(isAsc) ? "desc" : "asc");
                if (query.getParams() == null) query.setParams(new java.util.HashMap<>());
                query.getParams().put("orderBy", orderByColumn + " " + order);
            }
        }
        // 涓嬮捇妯″紡锛堝彲閫夛級锛涜繎鍒版湡鏀寔鍒嗛挓/灏忔椂绮掑害绐楀彛锛堜紭鍏堝垎閽燂級锛岄粯璁?2 灏忔椂
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

        // 鏌ヨ鏁版嵁锛堜笉鍒嗛〉锛?        java.util.List<BizTicket> list = bizTicketService.selectBizTicketList(query);

        // 瀵煎嚭 Excel
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

    /** 璇锋眰浣?*/
    public static class AssignBody {
        private Long[] ticketIds; private Long assigneeId; private String assigneeName; public Long[] getTicketIds(){return ticketIds;} public void setTicketIds(Long[] a){this.ticketIds=a;} public Long getAssigneeId(){return assigneeId;} public void setAssigneeId(Long a){this.assigneeId=a;} public String getAssigneeName(){return assigneeName;} public void setAssigneeName(String n){this.assigneeName=n;}
    }

    public static class CompleteBody {
        private Long ticketId; private String solution; private String result; // result 棰勭暀
        public Long getTicketId(){return ticketId;} public void setTicketId(Long id){this.ticketId=id;}
        public String getSolution(){return solution;} public void setSolution(String s){this.solution=s;}
        public String getResult(){return result;} public void setResult(String r){this.result=r;}
    }

    /** 绠€鍗?ticketNo 鐢熸垚锛歍K + yyyyMMddHHmmssSSS */
    private String generateTicketNo() {
        return "TK" + DateUtils.dateTimeNow("yyyyMMddHHmmssSSS");
    }

    // 鏃х殑 findLatestLog 宸蹭笉鍐嶉渶瑕侊紙last* 宸叉寔涔呭寲锛?
    private boolean isValidTransition(String from, String to){
        if (from==null) return true;
        if (from.equals(to)) return true;
        switch(from){
            case "pending": return to.equals("assigned") || to.equals("closed");
            case "assigned": return to.equals("processing") || to.equals("closed");
            case "processing": return to.equals("completed") || to.equals("closed");
            case "completed": return to.equals("closed") || to.equals("processing"); // 鍏佽鍥為€€(閲嶆柊澶勭悊)
            case "closed": return to.equals("processing") || to.equals("assigned"); // reopen 鎯呭喌
            default: return false;
        }
    }
}
