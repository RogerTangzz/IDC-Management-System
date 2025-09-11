package com.ruoyi.framework.task;

import com.ruoyi.common.utils.DateUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.slf4j.Logger; import org.slf4j.LoggerFactory;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSession;
import java.util.Date;
import java.util.Calendar;

/**
 * 工单日志清理任务：每日 02:30 清理 90 天前日志
 */
@Component
public class TicketLogCleanupTask {
    private static final Logger log = LoggerFactory.getLogger(TicketLogCleanupTask.class);

    @Autowired
    private SqlSessionFactory sqlSessionFactory;

    // cron: 秒 分 时 日 月 星期
    @Scheduled(cron = "0 30 2 * * ?")
    public void cleanup() {
        SqlSession session = null;
        try {
            session = sqlSessionFactory.openSession();
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.DAY_OF_YEAR, -90);
            Date threshold = cal.getTime();
            int rows = session.update("com.ruoyi.system.mapper.dynamic.TicketLogCleanupMapper.cleanup", threshold);
            session.commit();
            log.info("TicketLogCleanupTask 执行完成, 清理 {} 条 90 天前日志", rows);
        } catch (Exception e) {
            log.error("TicketLogCleanupTask 执行失败", e);
            if (session != null) session.rollback();
        } finally {
            if (session != null) session.close();
        }
    }
}
