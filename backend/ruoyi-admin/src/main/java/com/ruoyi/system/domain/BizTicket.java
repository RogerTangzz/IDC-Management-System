package com.ruoyi.system.domain;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 工单对象 biz_ticket
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
public class BizTicket extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 工单ID */
    private Long ticketId;

    /** 工单编号 */
    @Excel(name = "工单编号")
    private String ticketNo;

    /** 工单标题 */
    @Excel(name = "工单标题")
    private String title;

    /** 故障描述 */
    @Excel(name = "故障描述")
    private String description;

    /** 优先级(low,medium,high,urgent) */
    @Excel(name = "优先级(low,medium,high,urgent)")
    private String priority;

    /** 状态(pending,assigned,processing,completed,closed) */
    @Excel(name = "状态(pending,assigned,processing,completed,closed)")
    private String status;

    /** 故障设备 */
    @Excel(name = "故障设备")
    private String equipment;

    /** 设备位置 */
    @Excel(name = "设备位置")
    private String location;

    /** 设备专业(hvac,power,fire,weak,other) */
    @Excel(name = "设备专业(hvac,power,fire,weak,other)")
    private String specialty;

    /** 故障类型 */
    @Excel(name = "故障类型")
    private String faultType;

    /** 报修人ID */
    @Excel(name = "报修人ID")
    private Long reporterId;

    /** 报修人姓名 */
    @Excel(name = "报修人姓名")
    private String reporterName;

    /** 报修人电话 */
    @Excel(name = "报修人电话")
    private String reporterPhone;

    /** 指派给用户ID */
    @Excel(name = "指派给用户ID")
    private Long assigneeId;

    /** 指派给用户姓名 */
    @Excel(name = "指派给用户姓名")
    private String assigneeName;

    /** 来源(manual,inspection,maintenance) */
    @Excel(name = "来源(manual,inspection,maintenance)")
    private String source;

    /** 来源ID */
    @Excel(name = "来源ID")
    private Long sourceId;

    /** 发现时间 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Excel(name = "发现时间", width = 30, dateFormat = "yyyy-MM-dd")
    private Date discoveryTime;

    /** 处理时限 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Excel(name = "处理时限", width = 30, dateFormat = "yyyy-MM-dd")
    private Date deadline;

    /** 完成时间 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Excel(name = "完成时间", width = 30, dateFormat = "yyyy-MM-dd")
    private Date completionTime;

    /** 解决方案 */
    @Excel(name = "解决方案")
    private String solution;

    /** 升级历史JSON */
    @Excel(name = "升级历史JSON")
    private String escalationHistory;

    /** 附件路径 */
    @Excel(name = "附件路径")
    private String attachments;

    /** 最近状态变更时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date lastStatusTime;
    /** 最近动作 */
    private String lastAction;

    /** 删除标志（0代表存在 2代表删除） */
    private String delFlag;

    public void setTicketId(Long ticketId) 
    {
        this.ticketId = ticketId;
    }

    public Long getTicketId() 
    {
        return ticketId;
    }

    public void setTicketNo(String ticketNo) 
    {
        this.ticketNo = ticketNo;
    }

    public String getTicketNo() 
    {
        return ticketNo;
    }

    public void setTitle(String title) 
    {
        this.title = title;
    }

    public String getTitle() 
    {
        return title;
    }

    public void setDescription(String description) 
    {
        this.description = description;
    }

    public String getDescription() 
    {
        return description;
    }

    public void setPriority(String priority) 
    {
        this.priority = priority;
    }

    public String getPriority() 
    {
        return priority;
    }

    public void setStatus(String status) 
    {
        this.status = status;
    }

    public String getStatus() 
    {
        return status;
    }

    public void setEquipment(String equipment) 
    {
        this.equipment = equipment;
    }

    public String getEquipment() 
    {
        return equipment;
    }

    public void setLocation(String location) 
    {
        this.location = location;
    }

    public String getLocation() 
    {
        return location;
    }

    public void setSpecialty(String specialty) 
    {
        this.specialty = specialty;
    }

    public String getSpecialty() 
    {
        return specialty;
    }

    public void setFaultType(String faultType) 
    {
        this.faultType = faultType;
    }

    public String getFaultType() 
    {
        return faultType;
    }

    public void setReporterId(Long reporterId) 
    {
        this.reporterId = reporterId;
    }

    public Long getReporterId() 
    {
        return reporterId;
    }

    public void setReporterName(String reporterName) 
    {
        this.reporterName = reporterName;
    }

    public String getReporterName() 
    {
        return reporterName;
    }

    public void setReporterPhone(String reporterPhone) 
    {
        this.reporterPhone = reporterPhone;
    }

    public String getReporterPhone() 
    {
        return reporterPhone;
    }

    public void setAssigneeId(Long assigneeId) 
    {
        this.assigneeId = assigneeId;
    }

    public Long getAssigneeId() 
    {
        return assigneeId;
    }

    public void setAssigneeName(String assigneeName) 
    {
        this.assigneeName = assigneeName;
    }

    public String getAssigneeName() 
    {
        return assigneeName;
    }

    public void setSource(String source) 
    {
        this.source = source;
    }

    public String getSource() 
    {
        return source;
    }

    public void setSourceId(Long sourceId) 
    {
        this.sourceId = sourceId;
    }

    public Long getSourceId() 
    {
        return sourceId;
    }

    public void setDiscoveryTime(Date discoveryTime) 
    {
        this.discoveryTime = discoveryTime;
    }

    public Date getDiscoveryTime() 
    {
        return discoveryTime;
    }

    public void setDeadline(Date deadline) 
    {
        this.deadline = deadline;
    }

    public Date getDeadline() 
    {
        return deadline;
    }

    public void setCompletionTime(Date completionTime) 
    {
        this.completionTime = completionTime;
    }

    public Date getCompletionTime() 
    {
        return completionTime;
    }

    public void setSolution(String solution) 
    {
        this.solution = solution;
    }

    public String getSolution() 
    {
        return solution;
    }

    public void setEscalationHistory(String escalationHistory) 
    {
        this.escalationHistory = escalationHistory;
    }

    public String getEscalationHistory() 
    {
        return escalationHistory;
    }

    public void setAttachments(String attachments) 
    {
        this.attachments = attachments;
    }

    public String getAttachments() 
    {
        return attachments;
    }

    public Date getLastStatusTime() { return lastStatusTime; }
    public void setLastStatusTime(Date lastStatusTime) { this.lastStatusTime = lastStatusTime; }
    public String getLastAction() { return lastAction; }
    public void setLastAction(String lastAction) { this.lastAction = lastAction; }

    public void setDelFlag(String delFlag) 
    {
        this.delFlag = delFlag;
    }

    public String getDelFlag() 
    {
        return delFlag;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("ticketId", getTicketId())
            .append("ticketNo", getTicketNo())
            .append("title", getTitle())
            .append("description", getDescription())
            .append("priority", getPriority())
            .append("status", getStatus())
            .append("equipment", getEquipment())
            .append("location", getLocation())
            .append("specialty", getSpecialty())
            .append("faultType", getFaultType())
            .append("reporterId", getReporterId())
            .append("reporterName", getReporterName())
            .append("reporterPhone", getReporterPhone())
            .append("assigneeId", getAssigneeId())
            .append("assigneeName", getAssigneeName())
            .append("source", getSource())
            .append("sourceId", getSourceId())
            .append("discoveryTime", getDiscoveryTime())
            .append("deadline", getDeadline())
            .append("completionTime", getCompletionTime())
            .append("solution", getSolution())
            .append("escalationHistory", getEscalationHistory())
            .append("attachments", getAttachments())
            .append("lastStatusTime", getLastStatusTime())
            .append("lastAction", getLastAction())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .toString();
    }
}
