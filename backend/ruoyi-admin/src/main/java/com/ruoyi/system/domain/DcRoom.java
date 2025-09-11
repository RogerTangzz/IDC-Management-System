package com.ruoyi.system.domain;

import com.ruoyi.common.core.domain.BaseEntity;

public class DcRoom extends BaseEntity {
    private Long roomId;
    private String name;
    private String floor;
    private String area;
    private String status;
    private String delFlag;
    public Long getRoomId(){return roomId;} public void setRoomId(Long v){this.roomId=v;}
    public String getName(){return name;} public void setName(String v){this.name=v;}
    public String getFloor(){return floor;} public void setFloor(String v){this.floor=v;}
    public String getArea(){return area;} public void setArea(String v){this.area=v;}
    public String getStatus(){return status;} public void setStatus(String v){this.status=v;}
    public String getDelFlag(){return delFlag;} public void setDelFlag(String v){this.delFlag=v;}
}

