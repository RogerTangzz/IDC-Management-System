package com.ruoyi.system.service.impl;

import com.ruoyi.common.utils.DateUtils;
import com.ruoyi.system.domain.BizMessage;
import com.ruoyi.system.mapper.BizMessageMapper;
import com.ruoyi.system.service.IBizMessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BizMessageServiceImpl implements IBizMessageService {
    @Autowired private BizMessageMapper mapper;

    @Override
    public void send(Long receiverId, String receiverName, String type, String title, String content) {
        send(receiverId, receiverName, type, title, content, null, null);
    }

    @Override
    public void send(Long receiverId, String receiverName, String type, String title, String content, String bizType, Long bizId) {
        if (receiverId == null) return;
        BizMessage m = new BizMessage();
        m.setReceiverId(receiverId); m.setReceiverName(receiverName);
        m.setType(type); m.setTitle(title); m.setContent(content);
        m.setBizType(bizType); m.setBizId(bizId);
        m.setReadFlag("N"); m.setCreateTime(DateUtils.getNowDate());
        mapper.insert(m);
    }

    @Override
    public List<BizMessage> unread(Long userId) { return mapper.selectUnreadByUser(userId); }

    @Override
    public Long countUnread(Long userId) { return mapper.countUnread(userId); }

    @Override
    public void markRead(Long msgId) { mapper.markRead(msgId); }

    @Override
    public List<BizMessage> list(Long userId, String readFlag, String type) {
        BizMessage c = new BizMessage();
        c.setReceiverId(userId); c.setReadFlag(readFlag); c.setType(type);
        return mapper.selectByUser(c);
    }

    @Override
    public void markAllRead(Long userId) { mapper.markAllRead(userId); }
}
