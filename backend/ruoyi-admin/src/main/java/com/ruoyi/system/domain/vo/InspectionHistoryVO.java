package com.ruoyi.system.domain.vo;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;

/**
 * 巡检操作历史VO
 *
 * @author ruoyi
 * @date 2025-10-17
 */
public class InspectionHistoryVO
{
    /** 历史记录ID (唯一标识) */
    private Long id;

    /** 时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date time;

    /** 动作类型: create, update, copy, generate_ticket, delete */
    private String action;

    /** 操作人ID */
    private Long operatorId;

    /** 操作人姓名 */
    private String operatorName;

    /** 详情描述 */
    private String detail;

    /** 关联ID (如工单ID) */
    private Long relatedId;

    public InspectionHistoryVO() {}

    public InspectionHistoryVO(Long id, Date time, String action, Long operatorId, String operatorName, String detail, Long relatedId) {
        this.id = id;
        this.time = time;
        this.action = action;
        this.operatorId = operatorId;
        this.operatorName = operatorName;
        this.detail = detail;
        this.relatedId = relatedId;
    }

    // Builder pattern for convenience
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Date time;
        private String action;
        private Long operatorId;
        private String operatorName;
        private String detail;
        private Long relatedId;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder time(Date time) { this.time = time; return this; }
        public Builder action(String action) { this.action = action; return this; }
        public Builder operatorId(Long operatorId) { this.operatorId = operatorId; return this; }
        public Builder operatorName(String operatorName) { this.operatorName = operatorName; return this; }
        public Builder detail(String detail) { this.detail = detail; return this; }
        public Builder relatedId(Long relatedId) { this.relatedId = relatedId; return this; }

        public InspectionHistoryVO build() {
            return new InspectionHistoryVO(id, time, action, operatorId, operatorName, detail, relatedId);
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Date getTime() { return time; }
    public void setTime(Date time) { this.time = time; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public Long getOperatorId() { return operatorId; }
    public void setOperatorId(Long operatorId) { this.operatorId = operatorId; }

    public String getOperatorName() { return operatorName; }
    public void setOperatorName(String operatorName) { this.operatorName = operatorName; }

    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }

    public Long getRelatedId() { return relatedId; }
    public void setRelatedId(Long relatedId) { this.relatedId = relatedId; }
}
