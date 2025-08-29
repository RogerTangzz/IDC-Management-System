package com.ruoyi.system.domain;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 维保执行记录对象 biz_maintenance_execution
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
public class BizMaintenanceExecution extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 执行ID */
    private Long executionId;

    /** 执行编号 */
    @Excel(name = "执行编号")
    private String executionNo;

    /** 计划ID */
    @Excel(name = "计划ID")
    private Long planId;

    /** 计划标题 */
    @Excel(name = "计划标题")
    private String title;

    /** 楼层 */
    @Excel(name = "楼层")
    private String floor;

    /** 版本 */
    @Excel(name = "版本")
    private String version;

    /** MOP类别 */
    @Excel(name = "MOP类别")
    private String mopCategory;

    /** 执行人ID */
    @Excel(name = "执行人ID")
    private Long executorId;

    /** 执行人姓名 */
    @Excel(name = "执行人姓名")
    private String executorName;

    /** 计划执行时间 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Excel(name = "计划执行时间", width = 30, dateFormat = "yyyy-MM-dd")
    private Date planExecutionTime;

    /** 实际执行时间 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Excel(name = "实际执行时间", width = 30, dateFormat = "yyyy-MM-dd")
    private Date actualExecutionTime;

    /** 执行状态 */
    @Excel(name = "执行状态")
    private String executionStatus;

    /** 执行结果(normal,abnormal) */
    @Excel(name = "执行结果(normal,abnormal)")
    private String executionResult;

    /** 执行记录 */
    @Excel(name = "执行记录")
    private String executionRecord;

    /** 异常描述 */
    @Excel(name = "异常描述")
    private String abnormalDescription;

    /** 现场照片JSON */
    @Excel(name = "现场照片JSON")
    private String photos;

    /** 附件JSON */
    @Excel(name = "附件JSON")
    private String attachments;

    /** 检查清单JSON */
    @Excel(name = "检查清单JSON")
    private String checkList;

    /** 删除标志（0代表存在 2代表删除） */
    private String delFlag;

    public void setExecutionId(Long executionId) 
    {
        this.executionId = executionId;
    }

    public Long getExecutionId() 
    {
        return executionId;
    }

    public void setExecutionNo(String executionNo) 
    {
        this.executionNo = executionNo;
    }

    public String getExecutionNo() 
    {
        return executionNo;
    }

    public void setPlanId(Long planId) 
    {
        this.planId = planId;
    }

    public Long getPlanId() 
    {
        return planId;
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

    public void setExecutorId(Long executorId) 
    {
        this.executorId = executorId;
    }

    public Long getExecutorId() 
    {
        return executorId;
    }

    public void setExecutorName(String executorName) 
    {
        this.executorName = executorName;
    }

    public String getExecutorName() 
    {
        return executorName;
    }

    public void setPlanExecutionTime(Date planExecutionTime) 
    {
        this.planExecutionTime = planExecutionTime;
    }

    public Date getPlanExecutionTime() 
    {
        return planExecutionTime;
    }

    public void setActualExecutionTime(Date actualExecutionTime) 
    {
        this.actualExecutionTime = actualExecutionTime;
    }

    public Date getActualExecutionTime() 
    {
        return actualExecutionTime;
    }

    public void setExecutionStatus(String executionStatus) 
    {
        this.executionStatus = executionStatus;
    }

    public String getExecutionStatus() 
    {
        return executionStatus;
    }

    public void setExecutionResult(String executionResult) 
    {
        this.executionResult = executionResult;
    }

    public String getExecutionResult() 
    {
        return executionResult;
    }

    public void setExecutionRecord(String executionRecord) 
    {
        this.executionRecord = executionRecord;
    }

    public String getExecutionRecord() 
    {
        return executionRecord;
    }

    public void setAbnormalDescription(String abnormalDescription) 
    {
        this.abnormalDescription = abnormalDescription;
    }

    public String getAbnormalDescription() 
    {
        return abnormalDescription;
    }

    public void setPhotos(String photos) 
    {
        this.photos = photos;
    }

    public String getPhotos() 
    {
        return photos;
    }

    public void setAttachments(String attachments) 
    {
        this.attachments = attachments;
    }

    public String getAttachments() 
    {
        return attachments;
    }

    public void setCheckList(String checkList) 
    {
        this.checkList = checkList;
    }

    public String getCheckList() 
    {
        return checkList;
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
            .append("executionId", getExecutionId())
            .append("executionNo", getExecutionNo())
            .append("planId", getPlanId())
            .append("title", getTitle())
            .append("floor", getFloor())
            .append("version", getVersion())
            .append("mopCategory", getMopCategory())
            .append("executorId", getExecutorId())
            .append("executorName", getExecutorName())
            .append("planExecutionTime", getPlanExecutionTime())
            .append("actualExecutionTime", getActualExecutionTime())
            .append("executionStatus", getExecutionStatus())
            .append("executionResult", getExecutionResult())
            .append("executionRecord", getExecutionRecord())
            .append("abnormalDescription", getAbnormalDescription())
            .append("photos", getPhotos())
            .append("attachments", getAttachments())
            .append("checkList", getCheckList())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .toString();
    }
}
