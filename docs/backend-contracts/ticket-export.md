# 工单列表导出接口契约样例（后端）

适用模块：工单管理（RuoYi-Boot + Spring Boot）

## 1. 接口说明
- 方法与路径：POST `/business/ticket/export`
- Content-Type：`application/x-www-form-urlencoded`
- 权限：`business:ticket:export`
- 描述：按与列表查询相同的筛选/排序/时间范围/数据权限参数导出 Excel（.xlsx）

说明：前端默认使用 `proxy.download('business/ticket/export', params, filename)` 发起导出，请求为 POST 且参数 form-url-encoded（见前端 `utils/request.ts` 的 download 实现）。

## 2. 请求参数
与列表保持一致，并新增/约定以下点：
- 分页参数：可忽略 `pageNum/pageSize`（导出全量）
- 时间范围：`beginTime`、`endTime`（格式 `YYYY-MM-DD HH:mm:ss`）
- 排序：`orderByColumn`、`isAsc`（`asc|desc`）
- 下钻模式：`mode`（`overdue|neardue`）可选；后端可据此切换逾期/近到期的数据口径
- 数据权限：`mineOnly=true` 或别名（例如 `selfOnly=true`）
  - 灰度期：前端会同时发送 `mineOnly=true` 与别名参数（若配置了 `VITE_API_MINE_ONLY_PARAM`），后端任选其一识别即可
- 其他筛选：与列表一致（如 `status`、`priority`、`ticketNo`、`title`、`reporterName`、`specialty` 等）

## 3. 响应
- 成功：200，`Content-Disposition: attachment; filename=ticket_yyyyMMddHHmm.xlsx`
- 失败：返回 JSON（统一 `AjaxResult`），或直接 500；前端会尝试解析 blob 中的 JSON 错误消息

## 4. 控制器参考实现（示例）
```java
// BizTicketExportController.java（或合并至 BizTicketController）
@RestController
@RequestMapping("/business/ticket")
public class BizTicketExportController extends BaseController {

    @Autowired private IBizTicketService bizTicketService;

    @PreAuthorize("@ss.hasPermi('business:ticket:export')")
    @PostMapping("/export")
    public void export(HttpServletResponse response, BizTicket query,
                       @RequestParam(required=false) String beginTime,
                       @RequestParam(required=false) String endTime,
                       @RequestParam(required=false) String orderByColumn,
                       @RequestParam(required=false) String isAsc,
                       @RequestParam(required=false) String mode,
                       @RequestParam(required=false) String mineOnly,
                       @RequestParam(required=false) String selfOnly
    ) {
        // 数据权限：非管理员仅本人
        try {
            Long uid = SecurityUtils.getUserId();
            if (uid != null && !SecurityUtils.isAdmin(uid)) {
                if (query.getParams() == null) query.setParams(new java.util.HashMap<>());
                // 灰度期兼容 mineOnly / selfOnly
                boolean onlySelf = "1".equals(selfOnly) || "true".equalsIgnoreCase(selfOnly)
                                 || "1".equals(mineOnly) || "true".equalsIgnoreCase(mineOnly);
                if (onlySelf) {
                    query.getParams().put("userId", uid);
                    query.getParams().put("selfOnly", "1");
                }
            }
        } catch (Exception ignore) {}

        // 时间范围与排序（与列表口径一致）
        if (beginTime != null && endTime != null) {
            if (query.getParams() == null) query.setParams(new java.util.HashMap<>());
            query.getParams().put("beginTime", beginTime);
            query.getParams().put("endTime", endTime);
        }
        if (orderByColumn != null && !orderByColumn.isEmpty()) {
            String order = ("desc".equalsIgnoreCase(isAsc) ? "desc" : "asc");
            // 可在 Service/Mapper 层进行列名白名单校验，避免 SQL 注入
            query.getParams().put("orderBy", orderByColumn + " " + order);
        }
        if (mode != null) {
            if (query.getParams() == null) query.setParams(new java.util.HashMap<>());
            query.getParams().put("mode", mode); // service/mapper 根据 mode 切数据集
        }

        // 查询数据
        List<BizTicket> list = bizTicketService.selectBizTicketList(query);

        // 生成 Excel（Apache POI 简例，可替换为项目统一导出工具）
        try (org.apache.poi.xssf.usermodel.XSSFWorkbook wb = new org.apache.poi.xssf.usermodel.XSSFWorkbook()) {
            org.apache.poi.ss.usermodel.Sheet sheet = wb.createSheet("Tickets");
            int r = 0; // header
            org.apache.poi.ss.usermodel.Row h = sheet.createRow(r++);
            write(h, "ticketNo","title","status","priority","reporterName","assigneeName","lastAction","lastStatusTime");
            for (BizTicket t : list) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(r++);
                write(row,
                    t.getTicketNo(), t.getTitle(), t.getStatus(), t.getPriority(),
                    t.getReporterName(), t.getAssigneeName(), t.getLastAction(),
                    t.getLastStatusTime() == null ? "" : new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(t.getLastStatusTime())
                );
            }
            String filename = "ticket_" + com.ruoyi.common.utils.DateUtils.dateTimeNow("yyyyMMddHHmm") + ".xlsx";
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment;filename=" + filename);
            wb.write(response.getOutputStream());
        } catch (Exception e) {
            // 可按需记录日志并返回错误 JSON（此处简化为静默）
        }
    }

    private void write(org.apache.poi.ss.usermodel.Row r, Object... vals){
        for (int i=0;i<vals.length;i++){ r.createCell(i).setCellValue(vals[i]==null?"":String.valueOf(vals[i])); }
    }
}
```

## 5. Mapper/Service 提示
- 列表与导出共用 `selectBizTicketList`，通过 `params.mode`、`params.orderBy`、`params.beginTime/endTime` 实现切换
- 注意列名白名单，避免排序字段注入
- `nearDue/overdue` 口径：
  - nearDue：`deadline` 在未来且剩余时间小于 `warnBeforeHours`
  - overdue：当前时间已超过 `deadline`

## 6. 前端调用示例（已就绪）
- 组件：`frontend/src/views/business/ticket/index.vue`
- 行为：点击“导出”按钮 → 组装参数（含筛选/时间/排序/`mode` 与数据权限）→ `proxy.download('business/ticket/export', params, filename)`

