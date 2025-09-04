package com.ruoyi.system.mapper;

import com.ruoyi.system.domain.DcRack;
import java.util.List;

public interface DcRackMapper {
    DcRack selectById(Long rackId);
    List<DcRack> selectList(DcRack q);
    int insert(DcRack r);
    int update(DcRack r);
    int deleteById(Long rackId);
    Long countOccupiedUnits(Long rackId);
    Long countTotalUnits(Long rackId);
}

