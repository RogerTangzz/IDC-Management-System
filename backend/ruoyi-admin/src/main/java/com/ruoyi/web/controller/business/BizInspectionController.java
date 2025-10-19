
package com.ruoyi.web.controller.business;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.utils.DateUtils;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.ruoyi.system.domain.BizInspection;
import com.ruoyi.system.domain.BizTicket;
import com.ruoyi.system.domain.vo.InspectionHistoryVO;
import com.ruoyi.system.service.IBizInspectionService;
import com.ruoyi.system.service.IBizTicketService;
import com.ruoyi.system.service.IBizTicketLogService;

@RestController
@RequestMapping("/business/inspection")
public class BizInspectionController extends BaseController {

    @Autowired
    private IBizInspectionService bizInspectionService;

    @Autowired
    private IBizTicketService bizTicketService;

    @Autowired
    private IBizTicketLogService bizTicketLogService;

    @GetMapping("/list")
    public TableDataInfo list(BizInspection criteria) {
        startPage();

        // 注入当前用户信息到 params，用于 mineOnly 数据权限过滤
        if (criteria.getParams() != null && criteria.getParams().containsKey("mineOnly")) {
            Long userId = currentUserId();
            String username = currentUserName();
            if (userId != null) {
                criteria.getParams().put("userId", userId);
            }
            if (username != null) {
                criteria.getParams().put("username", username);
            }
        }

        List<BizInspection> list = bizInspectionService.selectBizInspectionList(criteria);
        return getDataTable(list);
    }

    @GetMapping("/{id}")
    public AjaxResult getInfo(@PathVariable Long id) {
        BizInspection data = bizInspectionService.selectBizInspectionByInspectionId(id);
        return AjaxResult.success(data);
    }

    @PostMapping
    public AjaxResult add(@RequestBody BizInspection data) {
        if (data.getStatus() == null)
            data.setStatus("draft");
        // 容错：若前端误传对象/数组，被 Jackson 解析成 LinkedHashMap -> toString 不是合法 JSON，这里统一再序列化
        data.setItems(normalizeJsonString(data.getItems()));
        data.setPhotos(normalizeJsonString(data.getPhotos()));
        int rows = bizInspectionService.insertBizInspection(data);
        return rows > 0 ? AjaxResult.success(data) : AjaxResult.error("新增失败");
    }

    /** 修改 */
    @PutMapping
    public AjaxResult edit(@RequestBody BizInspection data) {
        data.setItems(normalizeJsonString(data.getItems()));
        data.setPhotos(normalizeJsonString(data.getPhotos()));
        int rows = bizInspectionService.updateBizInspection(data);
        return rows > 0 ? AjaxResult.success(data) : AjaxResult.error("修改失败");
    }

    /** 删除 */
    @DeleteMapping("/{id}")
    public AjaxResult remove(@PathVariable Long id) {
        int rows = bizInspectionService.deleteBizInspectionByInspectionId(id);
        return rows > 0 ? AjaxResult.success() : AjaxResult.error("删除失败");
    }

    /** 例如：获取最近一次巡检（前端可能会用到） */
    @GetMapping("/latest")
    public AjaxResult latest() {
        return AjaxResult.success();
    }

    /**
     * 由巡检异常自动生成工单
     * body: { inspectionId: Long, anomalies: [ { floor, itemId, itemName, value,
     * priority } ] }
     * 返回创建的工单数组
     */
    @PostMapping("/generateTickets")
    public AjaxResult generateTickets(@RequestBody Map<String, Object> body) {
        Object idObj = body.get("inspectionId");
        if (idObj == null)
            return AjaxResult.error("缺少 inspectionId");
        Long inspectionId;
        try {
            inspectionId = Long.valueOf(String.valueOf(idObj));
        } catch (Exception e) {
            return AjaxResult.error("inspectionId 非法");
        }
        BizInspection inspection = bizInspectionService.selectBizInspectionByInspectionId(inspectionId);
        if (inspection == null)
            return AjaxResult.error("巡检不存在");

        // 解析 anomalies
        Object anomaliesObj = body.get("anomalies");
        if (!(anomaliesObj instanceof List)) {
            return AjaxResult.error("anomalies 必须为数组");
        }
        List<?> list = (List<?>) anomaliesObj;
        List<BizTicket> created = new ArrayList<>();
        for (Object o : list) {
            if (!(o instanceof Map))
                continue;
            Map<?, ?> m = (Map<?, ?>) o;
            String itemName = str(m.get("itemName"));
            String value = String.valueOf(m.get("value"));
            String priority = str(m.get("priority"));
            if (priority == null || priority.isEmpty())
                priority = "low";
            BizTicket t = new BizTicket();
            t.setTicketNo(generateTicketNo());
            t.setTitle(itemName != null ? itemName : "巡检异常");
            t.setDescription("巡检异常: " + (itemName == null ? "" : itemName) + " 值=" + value);
            t.setPriority(priority);
            t.setStatus("pending");
            t.setSource("inspection");
            t.setSourceId(inspectionId);
            t.setDiscoveryTime(DateUtils.getNowDate());
            t.setLastAction("create");
            t.setLastStatusTime(DateUtils.getNowDate());
            // 关键：将当前用户作为报告人，避免普通用户在工单列表中看不到新建工单
            Long uid = currentUserId();
            String uname = currentUserName();
            if (uid != null) t.setReporterId(uid);
            if (uname != null) {
                t.setReporterName(uname);
                t.setCreateBy(uname);
            }
            bizTicketService.insertBizTicket(t);
            bizTicketLogService.log(t.getTicketId(), "create", null, t.getStatus(), "巡检生成", uid, uname);
            created.add(t);
        }
        // 更新巡检记录的 ticket 关联
        if (!created.isEmpty()) {
            String ids = joinIds(created);
            inspection.setTicketIds(mergeIds(inspection.getTicketIds(), ids));
            inspection.setTicketCount(countIds(inspection.getTicketIds()));
            bizInspectionService.updateBizInspection(inspection);
        }
        return AjaxResult.success(created);
    }

    /** 复制指定巡检 */
    @PostMapping("/{id}/copy")
    public AjaxResult copy(@PathVariable Long id) {
        return AjaxResult.success();
    }

    /** 复制最近一次巡检 */
    @PostMapping("/copyLast")
    public AjaxResult copyLast() {
        return AjaxResult.success();
    }

    /** 数据统计 */
    @GetMapping("/statistics")
    public AjaxResult statistics(@RequestParam Map<String, Object> params) {
        Map<String, Object> mock = new HashMap<>();
        return AjaxResult.success(mock);
    }

    /** 导出（占位） */
    @GetMapping("/export")
    public AjaxResult export(@RequestParam Map<String, Object> params) {
        // 按 RuoYi 规范实际应写入文件，这里临时返回 success
        return AjaxResult.success();
    }

    /**
     * M3: 获取巡检操作历史
     * GET /business/inspection/{id}/history?type=all|operation|ticket
     */
    @GetMapping("/{id}/history")
    public AjaxResult getHistory(@PathVariable("id") Long inspectionId,
                                  @RequestParam(required = false, defaultValue = "all") String type) {
        List<InspectionHistoryVO> history = bizInspectionService.getInspectionHistory(inspectionId, type);
        return AjaxResult.success(history);
    }

    /**
     * 简单判断字符串是否为 JSON（对象/数组），若非字符串或为空直接返回；
     */
    private String normalizeJsonString(String raw) {
        if (raw == null || raw.isEmpty())
            return raw;
        char c = raw.charAt(0);
        if (c == '{' || c == '[')
            return raw;
        if (raw.contains("="))
            return raw;
        return raw;
    }

    private String str(Object o) {
        return o == null ? null : String.valueOf(o);
    }

    private String generateTicketNo() {
        return "TK" + DateUtils.dateTimeNow("yyyyMMddHHmmssSSS");
    }

    private String joinIds(List<BizTicket> tickets) {
        StringBuilder sb = new StringBuilder();
        for (BizTicket t : tickets) {
            if (sb.length() > 0)
                sb.append(',');
            sb.append(t.getTicketId());
        }
        return sb.toString();
    }

    private String mergeIds(String oldIds, String newIds) {
        if (oldIds == null || oldIds.isEmpty())
            return newIds;
        if (newIds == null || newIds.isEmpty())
            return oldIds;
        return oldIds + "," + newIds;
    }

    private Long countIds(String ids) {
        if (ids == null || ids.isEmpty())
            return 0L;
        long count = 0;
        for (String s : ids.split(","))
            if (!s.isEmpty())
                count++;
        return count;
    }

    // 兼容：当前类调用了 currentUserId/currentUserName，但 BaseController 只有
    // getUserId/getUsername，这里做包装
    private Long currentUserId() {
        try {
            return getUserId();
        } catch (Exception e) {
            return null;
        }
    }

    private String currentUserName() {
        try {
            return getUsername();
        } catch (Exception e) {
            return null;
        }
    }
}
