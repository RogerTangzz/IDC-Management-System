package com.ruoyi.system.domain;

import com.ruoyi.common.core.domain.BaseEntity;

public class DcRack extends BaseEntity {
    private Long rackId;
    private Long roomId;
    private String code;
    private Integer uTotal;
    private Integer powerRated;
    private Integer powerCurrent;
    private String status;
    private String delFlag;
    public Long getRackId(){return rackId;} public void setRackId(Long v){this.rackId=v;}
    public Long getRoomId(){return roomId;} public void setRoomId(Long v){this.roomId=v;}
    public String getCode(){return code;} public void setCode(String v){this.code=v;}
    public Integer getUTotal(){return uTotal;} public void setUTotal(Integer v){this.uTotal=v;}
    public Integer getPowerRated(){return powerRated;} public void setPowerRated(Integer v){this.powerRated=v;}
    public Integer getPowerCurrent(){return powerCurrent;} public void setPowerCurrent(Integer v){this.powerCurrent=v;}
    public String getStatus(){return status;} public void setStatus(String v){this.status=v;}
    public String getDelFlag(){return delFlag;} public void setDelFlag(String v){this.delFlag=v;}
}

