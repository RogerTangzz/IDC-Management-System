package com.ruoyi.web.controller.business;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.utils.DateUtils;
import com.ruoyi.system.domain.BizTicket;
import com.ruoyi.system.service.IBizTicketService;
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

    /** 列表 */
    @GetMapping("/list")
    public TableDataInfo list(BizTicket query) {
        startPage();
        List<BizTicket> list = bizTicketService.selectBizTicketList(query);
        return getDataTable(list);
    }

    /** 详情 */
    @GetMapping("/{id}")
    public AjaxResult getInfo(@PathVariable Long id) {
        BizTicket ticket = bizTicketService.selectBizTicketByTicketId(id);
        return AjaxResult.success(ticket);
    }

    /** 新增 */
    @PostMapping
    public AjaxResult add(@RequestBody BizTicket ticket) {
        if (ticket.getStatus() == null || ticket.getStatus().isEmpty()) {
            ticket.setStatus("pending");
        }
        if (ticket.getTicketNo() == null || ticket.getTicketNo().isEmpty()) {
            ticket.setTicketNo(generateTicketNo());
        }
        int rows = bizTicketService.insertBizTicket(ticket);
        return rows > 0 ? AjaxResult.success(ticket) : AjaxResult.error("新增失败");
    }

    /** 修改 */
    @PutMapping
    public AjaxResult edit(@RequestBody BizTicket ticket) {
        int rows = bizTicketService.updateBizTicket(ticket);
        return rows > 0 ? AjaxResult.success(ticket) : AjaxResult.error("修改失败");
    }

    /** 删除 */
    @DeleteMapping("/{id}")
    public AjaxResult remove(@PathVariable Long id) {
        int rows = bizTicketService.deleteBizTicketByTicketId(id);
        return rows > 0 ? AjaxResult.success() : AjaxResult.error("删除失败");
    }

    /** 单/多工单指派 */
    @PostMapping("/assign")
    public AjaxResult assign(@RequestBody AssignBody body){
        if (body == null || body.getTicketIds()==null || body.getTicketIds().length==0) {
            return AjaxResult.error("ticketIds 不能为空");
        }
        // 简化：这里只更新 assigneeId/assigneeName 及状态=assigned
        for (Long id : body.getTicketIds()) {
            BizTicket t = bizTicketService.selectBizTicketByTicketId(id);
            if (t == null) continue;
            t.setAssigneeId(body.getAssigneeId());
            t.setAssigneeName(body.getAssigneeName());
            if (t.getStatus()==null || t.getStatus().equals("pending")) t.setStatus("assigned");
            bizTicketService.updateBizTicket(t);
        }
        return AjaxResult.success();
    }

    /** 批量指派快捷（兼容旧前端方法） */
    @PostMapping("/batchAssign")
    public AjaxResult batchAssign(@RequestBody AssignBody body){
        return assign(body);
    }

    /** 请求体 */
    public static class AssignBody {
        private Long[] ticketIds; private Long assigneeId; private String assigneeName; public Long[] getTicketIds(){return ticketIds;} public void setTicketIds(Long[] a){this.ticketIds=a;} public Long getAssigneeId(){return assigneeId;} public void setAssigneeId(Long a){this.assigneeId=a;} public String getAssigneeName(){return assigneeName;} public void setAssigneeName(String n){this.assigneeName=n;}
    }

    /** 简单 ticketNo 生成：TK + yyyyMMddHHmmssSSS */
    private String generateTicketNo() {
        return "TK" + DateUtils.dateTimeNow("yyyyMMddHHmmssSSS");
    }
}
