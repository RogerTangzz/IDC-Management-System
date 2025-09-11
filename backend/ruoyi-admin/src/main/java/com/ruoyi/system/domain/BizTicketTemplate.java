package com.ruoyi.system.domain;

import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 工单模板对象 biz_ticket_template
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
public class BizTicketTemplate extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 模板ID */
    private Long templateId;

    /** 模板编号 */
    @Excel(name = "模板编号")
    private String templateNo;

    /** 模板名称 */
    @Excel(name = "模板名称")
    private String templateName;

    /** 故障类型 */
    @Excel(name = "故障类型")
    private String faultType;

    /** 默认优先级 */
    @Excel(name = "默认优先级")
    private String priority;

    /** 设备专业 */
    @Excel(name = "设备专业")
    private String specialty;

    /** 默认标题 */
    @Excel(name = "默认标题")
    private String defaultTitle;

    /** 默认描述 */
    @Excel(name = "默认描述")
    private String defaultDescription;

    /** 默认应急处置 */
    @Excel(name = "默认应急处置")
    private String defaultEmergencyAction;

    /** 默认处理方案 */
    @Excel(name = "默认处理方案")
    private String defaultSolution;

    /** 使用次数 */
    @Excel(name = "使用次数")
    private Long useCount;

    /** 状态（0正常 1停用） */
    @Excel(name = "状态", readConverterExp = "0=正常,1=停用")
    private String status;

    /** 删除标志（0代表存在 2代表删除） */
    private String delFlag;

    public void setTemplateId(Long templateId) 
    {
        this.templateId = templateId;
    }

    public Long getTemplateId() 
    {
        return templateId;
    }

    public void setTemplateNo(String templateNo) 
    {
        this.templateNo = templateNo;
    }

    public String getTemplateNo() 
    {
        return templateNo;
    }

    public void setTemplateName(String templateName) 
    {
        this.templateName = templateName;
    }

    public String getTemplateName() 
    {
        return templateName;
    }

    public void setFaultType(String faultType) 
    {
        this.faultType = faultType;
    }

    public String getFaultType() 
    {
        return faultType;
    }

    public void setPriority(String priority) 
    {
        this.priority = priority;
    }

    public String getPriority() 
    {
        return priority;
    }

    public void setSpecialty(String specialty) 
    {
        this.specialty = specialty;
    }

    public String getSpecialty() 
    {
        return specialty;
    }

    public void setDefaultTitle(String defaultTitle) 
    {
        this.defaultTitle = defaultTitle;
    }

    public String getDefaultTitle() 
    {
        return defaultTitle;
    }

    public void setDefaultDescription(String defaultDescription) 
    {
        this.defaultDescription = defaultDescription;
    }

    public String getDefaultDescription() 
    {
        return defaultDescription;
    }

    public void setDefaultEmergencyAction(String defaultEmergencyAction) 
    {
        this.defaultEmergencyAction = defaultEmergencyAction;
    }

    public String getDefaultEmergencyAction() 
    {
        return defaultEmergencyAction;
    }

    public void setDefaultSolution(String defaultSolution) 
    {
        this.defaultSolution = defaultSolution;
    }

    public String getDefaultSolution() 
    {
        return defaultSolution;
    }

    public void setUseCount(Long useCount) 
    {
        this.useCount = useCount;
    }

    public Long getUseCount() 
    {
        return useCount;
    }

    public void setStatus(String status) 
    {
        this.status = status;
    }

    public String getStatus() 
    {
        return status;
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
            .append("templateId", getTemplateId())
            .append("templateNo", getTemplateNo())
            .append("templateName", getTemplateName())
            .append("faultType", getFaultType())
            .append("priority", getPriority())
            .append("specialty", getSpecialty())
            .append("defaultTitle", getDefaultTitle())
            .append("defaultDescription", getDefaultDescription())
            .append("defaultEmergencyAction", getDefaultEmergencyAction())
            .append("defaultSolution", getDefaultSolution())
            .append("useCount", getUseCount())
            .append("status", getStatus())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .toString();
    }
}
