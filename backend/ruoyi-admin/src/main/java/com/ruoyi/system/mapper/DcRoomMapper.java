package com.ruoyi.system.mapper;

import com.ruoyi.system.domain.DcRoom;
import java.util.List;

public interface DcRoomMapper {
    DcRoom selectById(Long roomId);
    List<DcRoom> selectList(DcRoom q);
    int insert(DcRoom r);
    int update(DcRoom r);
    int deleteById(Long roomId);
}

