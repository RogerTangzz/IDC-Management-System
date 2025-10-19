package com.ruoyi.system.domain;

import java.util.Date;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 机柜U位管理对象 biz_rack_u_slot
 *
 * @author ruoyi
 * @date 2025-01-18
 */
public class BizRackUSlot extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** U位ID */
    private Long slotId;

    /** 机柜ID */
    @Excel(name = "机柜ID")
    private Long rackId;

    /** U位编号(1-100) */
    @Excel(name = "U位编号")
    private Integer uNumber;

    /** 状态: free=空闲, occupied=已占用, reserved=预留, disabled=禁用 */
    @Excel(name = "状态", dictType = "u_slot_status")
    private String status;

    /** 设备ID(关联设备表) */
    @Excel(name = "设备ID")
    private Long deviceId;

    /** 设备名称 */
    @Excel(name = "设备名称")
    private String deviceName;

    /** 设备类型 */
    @Excel(name = "设备类型")
    private String deviceType;

    /** 起始U位(多U设备使用) */
    @Excel(name = "起始U位")
    private Integer startU;

    /** 占用U位数(默认1U) */
    @Excel(name = "占用U位数")
    private Integer uCount;

    /** 分配时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "分配时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date allocationDate;

    /** 分配人 */
    @Excel(name = "分配人")
    private String allocatedBy;

    /** 释放时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "释放时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date releaseDate;

    /** 释放人 */
    @Excel(name = "释放人")
    private String releasedBy;

    /** 删除标志 */
    private String delFlag;

    // ============= 扩展字段(用于关联查询) =============
    /** 机柜编号 */
    private String rackNo;

    /** 机柜名称 */
    private String rackName;

    public void setSlotId(Long slotId)
    {
        this.slotId = slotId;
    }

    public Long getSlotId()
    {
        return slotId;
    }

    public void setRackId(Long rackId)
    {
        this.rackId = rackId;
    }

    public Long getRackId()
    {
        return rackId;
    }

    public void setUNumber(Integer uNumber)
    {
        this.uNumber = uNumber;
    }

    public Integer getUNumber()
    {
        return uNumber;
    }

    public void setStatus(String status)
    {
        this.status = status;
    }

    public String getStatus()
    {
        return status;
    }

    public void setDeviceId(Long deviceId)
    {
        this.deviceId = deviceId;
    }

    public Long getDeviceId()
    {
        return deviceId;
    }

    public void setDeviceName(String deviceName)
    {
        this.deviceName = deviceName;
    }

    public String getDeviceName()
    {
        return deviceName;
    }

    public void setDeviceType(String deviceType)
    {
        this.deviceType = deviceType;
    }

    public String getDeviceType()
    {
        return deviceType;
    }

    public void setStartU(Integer startU)
    {
        this.startU = startU;
    }

    public Integer getStartU()
    {
        return startU;
    }

    public void setUCount(Integer uCount)
    {
        this.uCount = uCount;
    }

    public Integer getUCount()
    {
        return uCount;
    }

    public void setAllocationDate(Date allocationDate)
    {
        this.allocationDate = allocationDate;
    }

    public Date getAllocationDate()
    {
        return allocationDate;
    }

    public void setAllocatedBy(String allocatedBy)
    {
        this.allocatedBy = allocatedBy;
    }

    public String getAllocatedBy()
    {
        return allocatedBy;
    }

    public void setReleaseDate(Date releaseDate)
    {
        this.releaseDate = releaseDate;
    }

    public Date getReleaseDate()
    {
        return releaseDate;
    }

    public void setReleasedBy(String releasedBy)
    {
        this.releasedBy = releasedBy;
    }

    public String getReleasedBy()
    {
        return releasedBy;
    }

    public void setDelFlag(String delFlag)
    {
        this.delFlag = delFlag;
    }

    public String getDelFlag()
    {
        return delFlag;
    }

    public void setRackNo(String rackNo)
    {
        this.rackNo = rackNo;
    }

    public String getRackNo()
    {
        return rackNo;
    }

    public void setRackName(String rackName)
    {
        this.rackName = rackName;
    }

    public String getRackName()
    {
        return rackName;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this,ToStringStyle.MULTI_LINE_STYLE)
            .append("slotId", getSlotId())
            .append("rackId", getRackId())
            .append("uNumber", getUNumber())
            .append("status", getStatus())
            .append("deviceId", getDeviceId())
            .append("deviceName", getDeviceName())
            .append("deviceType", getDeviceType())
            .append("startU", getStartU())
            .append("uCount", getUCount())
            .append("allocationDate", getAllocationDate())
            .append("allocatedBy", getAllocatedBy())
            .append("releaseDate", getReleaseDate())
            .append("releasedBy", getReleasedBy())
            .append("remark", getRemark())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("rackNo", getRackNo())
            .append("rackName", getRackName())
            .toString();
    }
}
