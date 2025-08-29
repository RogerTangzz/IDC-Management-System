package com.ruoyi.system.domain;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 维保计划对象 biz_maintenance
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
public class BizMaintenance extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 计划ID */
    private Long planId;

    /** 计划编号 */
    @Excel(name = "计划编号")
    private String planNo;

    /** 计划标题 */
    @Excel(name = "计划标题")
    private String title;

    /** 楼层(1,2,3,4,all) */
    @Excel(name = "楼层(1,2,3,4,all)")
    private String floor;

    /** 版本号 */
    @Excel(name = "版本号")
    private String version;

    /** MOP类别(daily,regular,annual,emergency) */
    @Excel(name = "MOP类别(daily,regular,annual,emergency)")
    private String mopCategory;

    /** MOP名称 */
    @Excel(name = "MOP名称")
    private String mopName;

    /** MOP目的 */
    @Excel(name = "MOP目的")
    private String mopPurpose;

    /** 执行周期 */
    @Excel(name = "执行周期")
    private String executionCycle;

    /** 执行频次 */
    @Excel(name = "执行频次")
    private Long executionFrequency;

    /** 频次单位 */
    @Excel(name = "频次单位")
    private String executionUnit;

    /** 审核人ID */
    @Excel(name = "审核人ID")
    private Long approverId;

    /** 审核人姓名 */
    @Excel(name = "审核人姓名")
    private String approverName;

    /** 审核状态(draft,pending,approved,rejected) */
    @Excel(name = "审核状态(draft,pending,approved,rejected)")
    private String approvalStatus;

    /** 审核时间 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Excel(name = "审核时间", width = 30, dateFormat = "yyyy-MM-dd")
    private Date approvalTime;

    /** 审核意见 */
    @Excel(name = "审核意见")
    private String approvalComment;

    /** 执行状态(pending,executing,completed,cancelled) */
    @Excel(name = "执行状态(pending,executing,completed,cancelled)")
    private String executionStatus;

    /** 下次执行时间 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Excel(name = "下次执行时间", width = 30, dateFormat = "yyyy-MM-dd")
    private Date nextExecutionTime;

    /** 上次执行时间 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Excel(name = "上次执行时间", width = 30, dateFormat = "yyyy-MM-dd")
    private Date lastExecutionTime;

    /** 通知人员ID列表 */
    @Excel(name = "通知人员ID列表")
    private String notifyUsers;

    /** 执行审核人ID */
    @Excel(name = "执行审核人ID")
    private Long executorId;

    /** 工具仪表 */
    @Excel(name = "工具仪表")
    private String tools;

    /** 材料 */
    @Excel(name = "材料")
    private String materials;

    /** 安全PPE */
    @Excel(name = "安全PPE")
    private String safety;

    /** 特殊工具 */
    @Excel(name = "特殊工具")
    private String specialTools;

    /** 执行步骤 */
    @Excel(name = "执行步骤")
    private String steps;

    /** 巡检结果 */
    @Excel(name = "巡检结果")
    private String inspectionResult;

    /** 提交时间 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Excel(name = "提交时间", width = 30, dateFormat = "yyyy-MM-dd")
    private Date submitTime;

    /** 申请人ID */
    @Excel(name = "申请人ID")
    private Long applicantId;

    /** 申请人姓名 */
    @Excel(name = "申请人姓名")
    private String applicantName;

    /** 删除标志（0代表存在 2代表删除） */
    private String delFlag;

    public void setPlanId(Long planId) 
    {
        this.planId = planId;
    }

    public Long getPlanId() 
    {
        return planId;
    }

    public void setPlanNo(String planNo) 
    {
        this.planNo = planNo;
    }

    public String getPlanNo() 
    {
        return planNo;
    }

    public void setTitle(String title) 
    {
        this.title = title;
    }

    public String getTitle() 
    {
        return title;
    }

    public void setFloor(String floor) 
    {
        this.floor = floor;
    }

    public String getFloor() 
    {
        return floor;
    }

    public void setVersion(String version) 
    {
        this.version = version;
    }

    public String getVersion() 
    {
        return version;
    }

    public void setMopCategory(String mopCategory) 
    {
        this.mopCategory = mopCategory;
    }

    public String getMopCategory() 
    {
        return mopCategory;
    }

    public void setMopName(String mopName) 
    {
        this.mopName = mopName;
    }

    public String getMopName() 
    {
        return mopName;
    }

    public void setMopPurpose(String mopPurpose) 
    {
        this.mopPurpose = mopPurpose;
    }

    public String getMopPurpose() 
    {
        return mopPurpose;
    }

    public void setExecutionCycle(String executionCycle) 
    {
        this.executionCycle = executionCycle;
    }

    public String getExecutionCycle() 
    {
        return executionCycle;
    }

    public void setExecutionFrequency(Long executionFrequency) 
    {
        this.executionFrequency = executionFrequency;
    }

    public Long getExecutionFrequency() 
    {
        return executionFrequency;
    }

    public void setExecutionUnit(String executionUnit) 
    {
        this.executionUnit = executionUnit;
    }

    public String getExecutionUnit() 
    {
        return executionUnit;
    }

    public void setApproverId(Long approverId) 
    {
        this.approverId = approverId;
    }

    public Long getApproverId() 
    {
        return approverId;
    }

    public void setApproverName(String approverName) 
    {
        this.approverName = approverName;
    }

    public String getApproverName() 
    {
        return approverName;
    }

    public void setApprovalStatus(String approvalStatus) 
    {
        this.approvalStatus = approvalStatus;
    }

    public String getApprovalStatus() 
    {
        return approvalStatus;
    }

    public void setApprovalTime(Date approvalTime) 
    {
        this.approvalTime = approvalTime;
    }

    public Date getApprovalTime() 
    {
        return approvalTime;
    }

    public void setApprovalComment(String approvalComment) 
    {
        this.approvalComment = approvalComment;
    }

    public String getApprovalComment() 
    {
        return approvalComment;
    }

    public void setExecutionStatus(String executionStatus) 
    {
        this.executionStatus = executionStatus;
    }

    public String getExecutionStatus() 
    {
        return executionStatus;
    }

    public void setNextExecutionTime(Date nextExecutionTime) 
    {
        this.nextExecutionTime = nextExecutionTime;
    }

    public Date getNextExecutionTime() 
    {
        return nextExecutionTime;
    }

    public void setLastExecutionTime(Date lastExecutionTime) 
    {
        this.lastExecutionTime = lastExecutionTime;
    }

    public Date getLastExecutionTime() 
    {
        return lastExecutionTime;
    }

    public void setNotifyUsers(String notifyUsers) 
    {
        this.notifyUsers = notifyUsers;
    }

    public String getNotifyUsers() 
    {
        return notifyUsers;
    }

    public void setExecutorId(Long executorId) 
    {
        this.executorId = executorId;
    }

    public Long getExecutorId() 
    {
        return executorId;
    }

    public void setTools(String tools) 
    {
        this.tools = tools;
    }

    public String getTools() 
    {
        return tools;
    }

    public void setMaterials(String materials) 
    {
        this.materials = materials;
    }

    public String getMaterials() 
    {
        return materials;
    }

    public void setSafety(String safety) 
    {
        this.safety = safety;
    }

    public String getSafety() 
    {
        return safety;
    }

    public void setSpecialTools(String specialTools) 
    {
        this.specialTools = specialTools;
    }

    public String getSpecialTools() 
    {
        return specialTools;
    }

    public void setSteps(String steps) 
    {
        this.steps = steps;
    }

    public String getSteps() 
    {
        return steps;
    }

    public void setInspectionResult(String inspectionResult) 
    {
        this.inspectionResult = inspectionResult;
    }

    public String getInspectionResult() 
    {
        return inspectionResult;
    }

    public void setSubmitTime(Date submitTime) 
    {
        this.submitTime = submitTime;
    }

    public Date getSubmitTime() 
    {
        return submitTime;
    }

    public void setApplicantId(Long applicantId) 
    {
        this.applicantId = applicantId;
    }

    public Long getApplicantId() 
    {
        return applicantId;
    }

    public void setApplicantName(String applicantName) 
    {
        this.applicantName = applicantName;
    }

    public String getApplicantName() 
    {
        return applicantName;
    }

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
            .append("planId", getPlanId())
            .append("planNo", getPlanNo())
            .append("title", getTitle())
            .append("floor", getFloor())
            .append("version", getVersion())
            .append("mopCategory", getMopCategory())
            .append("mopName", getMopName())
            .append("mopPurpose", getMopPurpose())
            .append("executionCycle", getExecutionCycle())
            .append("executionFrequency", getExecutionFrequency())
            .append("executionUnit", getExecutionUnit())
            .append("approverId", getApproverId())
            .append("approverName", getApproverName())
            .append("approvalStatus", getApprovalStatus())
            .append("approvalTime", getApprovalTime())
            .append("approvalComment", getApprovalComment())
            .append("executionStatus", getExecutionStatus())
            .append("nextExecutionTime", getNextExecutionTime())
            .append("lastExecutionTime", getLastExecutionTime())
            .append("notifyUsers", getNotifyUsers())
            .append("executorId", getExecutorId())
            .append("tools", getTools())
            .append("materials", getMaterials())
            .append("safety", getSafety())
            .append("specialTools", getSpecialTools())
            .append("steps", getSteps())
            .append("inspectionResult", getInspectionResult())
            .append("submitTime", getSubmitTime())
            .append("applicantId", getApplicantId())
            .append("applicantName", getApplicantName())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .toString();
    }
}
