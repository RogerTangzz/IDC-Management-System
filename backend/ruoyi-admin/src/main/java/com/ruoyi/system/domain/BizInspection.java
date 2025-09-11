package com.ruoyi.system.domain;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 巡检记录对象 biz_inspection
 * 
 * @author ruoyi
 * @date 2025-08-29
 */
public class BizInspection extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    /** 巡检ID */
    private Long inspectionId;

    /** 巡检编号 */
    @Excel(name = "巡检编号")
    private String inspectionNo;

    /** 巡检日期 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Excel(name = "巡检日期", width = 30, dateFormat = "yyyy-MM-dd")
    private Date inspectionDate;

    /** 巡检楼层(floor1,floor2,floor3,floor4) */
    @Excel(name = "巡检楼层(floor1,floor2,floor3,floor4)")
    private String floor;

    /** 巡检人ID */
    @Excel(name = "巡检人ID")
    private Long inspectorId;

    /** 巡检人姓名 */
    @Excel(name = "巡检人姓名")
    private String inspectorName;

    /** 接力人员 */
    @Excel(name = "接力人员")
    private String relayPerson;

    /** 巡检项JSON数据 */
    @Excel(name = "巡检项JSON数据")
    private String items;

    /** 完成进度(0-100) */
    @Excel(name = "完成进度(0-100)")
    private Long progress;

    /** 异常数量 */
    @Excel(name = "异常数量")
    private Long anomalyCount;

    /** 生成工单数 */
    @Excel(name = "生成工单数")
    private Long ticketCount;

    /** 关联工单ID列表 */
    @Excel(name = "关联工单ID列表")
    private String ticketIds;

    /** 工单映射JSON */
    @Excel(name = "工单映射JSON")
    private String ticketMap;

    /** 是否复制(Y/N) */
    @Excel(name = "是否复制(Y/N)")
    private String isCopied;

    /** 现场照片JSON */
    @Excel(name = "现场照片JSON")
    private String photos;

    /** 状态(draft,completed) */
    @Excel(name = "状态(draft,completed)")
    private String status;

    /** 删除标志（0代表存在 2代表删除） */
    private String delFlag;

    public void setInspectionId(Long inspectionId) 
    {
        this.inspectionId = inspectionId;
    }

    public Long getInspectionId() 
    {
        return inspectionId;
    }

    public void setInspectionNo(String inspectionNo) 
    {
        this.inspectionNo = inspectionNo;
    }

    public String getInspectionNo() 
    {
        return inspectionNo;
    }

    public void setInspectionDate(Date inspectionDate) 
    {
        this.inspectionDate = inspectionDate;
    }

    public Date getInspectionDate() 
    {
        return inspectionDate;
    }

    public void setFloor(String floor) 
    {
        this.floor = floor;
    }

    public String getFloor() 
    {
        return floor;
    }

    public void setInspectorId(Long inspectorId) 
    {
        this.inspectorId = inspectorId;
    }

    public Long getInspectorId() 
    {
        return inspectorId;
    }

    public void setInspectorName(String inspectorName) 
    {
        this.inspectorName = inspectorName;
    }

    public String getInspectorName() 
    {
        return inspectorName;
    }

    public void setRelayPerson(String relayPerson) 
    {
        this.relayPerson = relayPerson;
    }

    public String getRelayPerson() 
    {
        return relayPerson;
    }

    public void setItems(String items) 
    {
        this.items = items;
    }

    public String getItems() 
    {
        return items;
    }

    public void setProgress(Long progress) 
    {
        this.progress = progress;
    }

    public Long getProgress() 
    {
        return progress;
    }

    public void setAnomalyCount(Long anomalyCount) 
    {
        this.anomalyCount = anomalyCount;
    }

    public Long getAnomalyCount() 
    {
        return anomalyCount;
    }

    public void setTicketCount(Long ticketCount) 
    {
        this.ticketCount = ticketCount;
    }

    public Long getTicketCount() 
    {
        return ticketCount;
    }

    public void setTicketIds(String ticketIds) 
    {
        this.ticketIds = ticketIds;
    }

    public String getTicketIds() 
    {
        return ticketIds;
    }

    public void setTicketMap(String ticketMap) 
    {
        this.ticketMap = ticketMap;
    }

    public String getTicketMap() 
    {
        return ticketMap;
    }

    public void setIsCopied(String isCopied) 
    {
        this.isCopied = isCopied;
    }

    public String getIsCopied() 
    {
        return isCopied;
    }

    public void setPhotos(String photos) 
    {
        this.photos = photos;
    }

    public String getPhotos() 
    {
        return photos;
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
            .append("inspectionId", getInspectionId())
            .append("inspectionNo", getInspectionNo())
            .append("inspectionDate", getInspectionDate())
            .append("floor", getFloor())
            .append("inspectorId", getInspectorId())
            .append("inspectorName", getInspectorName())
            .append("relayPerson", getRelayPerson())
            .append("items", getItems())
            .append("progress", getProgress())
            .append("anomalyCount", getAnomalyCount())
            .append("ticketCount", getTicketCount())
            .append("ticketIds", getTicketIds())
            .append("ticketMap", getTicketMap())
            .append("isCopied", getIsCopied())
            .append("photos", getPhotos())
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
