package com.ruoyi.system.domain;

import com.ruoyi.common.core.domain.BaseEntity;

public class DcRackUnit extends BaseEntity {
    private Long unitId;
    private Long rackId;
    private Integer uIndex;
    private String occupied; // Y/N
    private String label;
    private String owner;
    private Integer powerW;
    public Long getUnitId(){return unitId;} public void setUnitId(Long v){this.unitId=v;}
    public Long getRackId(){return rackId;} public void setRackId(Long v){this.rackId=v;}
    public Integer getUIndex(){return uIndex;} public void setUIndex(Integer v){this.uIndex=v;}
    public String getOccupied(){return occupied;} public void setOccupied(String v){this.occupied=v;}
    public String getLabel(){return label;} public void setLabel(String v){this.label=v;}
    public String getOwner(){return owner;} public void setOwner(String v){this.owner=v;}
    public Integer getPowerW(){return powerW;} public void setPowerW(Integer v){this.powerW=v;}
}

