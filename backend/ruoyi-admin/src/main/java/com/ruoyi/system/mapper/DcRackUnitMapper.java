package com.ruoyi.system.mapper;

import com.ruoyi.system.domain.DcRackUnit;
import java.util.List;

public interface DcRackUnitMapper {
    List<DcRackUnit> selectByRackId(Long rackId);
    int batchUpsert(java.util.List<DcRackUnit> list);
    int clearByRackId(Long rackId);
}

