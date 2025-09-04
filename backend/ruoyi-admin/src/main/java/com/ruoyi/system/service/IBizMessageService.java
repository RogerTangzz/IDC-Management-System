package com.ruoyi.system.service;

import com.ruoyi.system.domain.BizMessage;
import java.util.List;

public interface IBizMessageService {
    void send(Long receiverId, String receiverName, String type, String title, String content);
    void send(Long receiverId, String receiverName, String type, String title, String content, String bizType, Long bizId);
    List<BizMessage> unread(Long userId);
    Long countUnread(Long userId);
    void markRead(Long msgId);
    List<BizMessage> list(Long userId, String readFlag, String type);
    void markAllRead(Long userId);
}
