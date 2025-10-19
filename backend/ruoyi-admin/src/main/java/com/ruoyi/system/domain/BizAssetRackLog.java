package com.ruoyi.system.domain;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;

/**
 * 机柜变更日志对象 biz_asset_rack_log
 *
 * @author ruoyi
 * @date 2025-01-20
 */
public class BizAssetRackLog
{
    private static final long serialVersionUID = 1L;

    /** 日志ID */
    private Long logId;

    /** 机柜ID */
    @Excel(name = "机柜ID")
    private Long rackId;

    /** 操作类型：CREATE/UPDATE/DELETE/U_ALLOCATE/U_RELEASE */
    @Excel(name = "操作类型")
    private String operationType;

    /** 操作描述 */
    @Excel(name = "操作描述")
    private String operationDesc;

    /** 旧值（JSON） */
    private String oldValue;

    /** 新值（JSON） */
    private String newValue;

    /** 操作人 */
    @Excel(name = "操作人")
    private String operator;

    /** 操作时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "操作时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date operationTime;

    // 扩展字段（用于关联查询）
    private String rackNo;
    private String rackName;

    public void setLogId(Long logId)
    {
        this.logId = logId;
    }

    public Long getLogId()
    {
        return logId;
    }

    public void setRackId(Long rackId)
    {
        this.rackId = rackId;
    }

    public Long getRackId()
    {
        return rackId;
    }

    public void setOperationType(String operationType)
    {
        this.operationType = operationType;
    }

    public String getOperationType()
    {
        return operationType;
    }

    public void setOperationDesc(String operationDesc)
    {
        this.operationDesc = operationDesc;
    }

    public String getOperationDesc()
    {
        return operationDesc;
    }

    public void setOldValue(String oldValue)
    {
        this.oldValue = oldValue;
    }

    public String getOldValue()
    {
        return oldValue;
    }

    public void setNewValue(String newValue)
    {
        this.newValue = newValue;
    }

    public String getNewValue()
    {
        return newValue;
    }

    public void setOperator(String operator)
    {
        this.operator = operator;
    }

    public String getOperator()
    {
        return operator;
    }

    public void setOperationTime(Date operationTime)
    {
        this.operationTime = operationTime;
    }

    public Date getOperationTime()
    {
        return operationTime;
    }

    public String getRackNo()
    {
        return rackNo;
    }

    public void setRackNo(String rackNo)
    {
        this.rackNo = rackNo;
    }

    public String getRackName()
    {
        return rackName;
    }

    public void setRackName(String rackName)
    {
        this.rackName = rackName;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("logId", getLogId())
            .append("rackId", getRackId())
            .append("operationType", getOperationType())
            .append("operationDesc", getOperationDesc())
            .append("oldValue", getOldValue())
            .append("newValue", getNewValue())
            .append("operator", getOperator())
            .append("operationTime", getOperationTime())
            .toString();
    }
}
