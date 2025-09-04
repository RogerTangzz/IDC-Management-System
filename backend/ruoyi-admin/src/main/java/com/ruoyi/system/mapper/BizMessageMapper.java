package com.ruoyi.system.mapper;

import com.ruoyi.system.domain.BizMessage;
import java.util.List;

public interface BizMessageMapper {
    int insert(BizMessage msg);
    int markRead(Long msgId);
    List<BizMessage> selectUnreadByUser(Long userId);
    Long countUnread(Long userId);
    List<BizMessage> selectByUser(BizMessage criteria);
    int markAllRead(Long userId);
}
