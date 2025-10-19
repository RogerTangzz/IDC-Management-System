package com.ruoyi.system.domain;

import java.math.BigDecimal;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 资产机柜对象 biz_asset_rack
 *
 * @author ruoyi
 * @date 2025-01-17
 */
public class BizAssetRack extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 机柜ID */
    private Long rackId;

    /** 机柜编号 */
    @Excel(name = "机柜编号")
    private String rackNo;

    /** 机柜名称 */
    @Excel(name = "机柜名称")
    private String rackName;

    /** 楼层 */
    @Excel(name = "楼层", dictType = "idc_floor")
    private String floor;

    /** 房间/区域 */
    @Excel(name = "房间/区域")
    private String room;

    /** 具体位置 */
    @Excel(name = "具体位置")
    private String location;

    /** 总U数 */
    @Excel(name = "总U数")
    private Integer uCount;

    /** 已用U数 */
    @Excel(name = "已用U数")
    private Integer uUsed;

    /** 额定功率(kW) */
    @Excel(name = "额定功率(kW)")
    private BigDecimal powerCapacity;

    /** 网络端口数量 */
    @Excel(name = "网络端口数")
    private Integer networkPorts;

    /** 状态 */
    @Excel(name = "状态", dictType = "asset_rack_status")
    private String status;

    /** 附件 */
    private String attachments;

    /** 删除标志 */
    private String delFlag;

    public void setRackId(Long rackId)
    {
        this.rackId = rackId;
    }

    public Long getRackId()
    {
        return rackId;
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

    public void setFloor(String floor)
    {
        this.floor = floor;
    }

    public String getFloor()
    {
        return floor;
    }

    public void setRoom(String room)
    {
        this.room = room;
    }

    public String getRoom()
    {
        return room;
    }

    public void setLocation(String location)
    {
        this.location = location;
    }

    public String getLocation()
    {
        return location;
    }

    public void setUCount(Integer uCount)
    {
        this.uCount = uCount;
    }

    public Integer getUCount()
    {
        return uCount;
    }

    public void setUUsed(Integer uUsed)
    {
        this.uUsed = uUsed;
    }

    public Integer getUUsed()
    {
        return uUsed;
    }

    public void setPowerCapacity(BigDecimal powerCapacity)
    {
        this.powerCapacity = powerCapacity;
    }

    public BigDecimal getPowerCapacity()
    {
        return powerCapacity;
    }

    public void setNetworkPorts(Integer networkPorts)
    {
        this.networkPorts = networkPorts;
    }

    public Integer getNetworkPorts()
    {
        return networkPorts;
    }

    public void setStatus(String status)
    {
        this.status = status;
    }

    public String getStatus()
    {
        return status;
    }

    public void setAttachments(String attachments)
    {
        this.attachments = attachments;
    }

    public String getAttachments()
    {
        return attachments;
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
            .append("rackId", getRackId())
            .append("rackNo", getRackNo())
            .append("rackName", getRackName())
            .append("floor", getFloor())
            .append("room", getRoom())
            .append("location", getLocation())
            .append("uCount", getUCount())
            .append("uUsed", getUUsed())
            .append("powerCapacity", getPowerCapacity())
            .append("networkPorts", getNetworkPorts())
            .append("status", getStatus())
            .append("attachments", getAttachments())
            .append("remark", getRemark())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .toString();
    }
}
