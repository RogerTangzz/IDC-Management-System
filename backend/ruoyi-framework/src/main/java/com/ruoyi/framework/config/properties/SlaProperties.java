package com.ruoyi.framework.config.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * SLA 配置
 */
@Component
@ConfigurationProperties(prefix = "idc.sla")
public class SlaProperties {
    /** 是否开启SLA提醒 */
    private boolean enabled = true;
    /** 提前提醒的小时数（即将超时判定） */
    private int warnBeforeHours = 2;
    /** 扫描Cron（缺省每15分钟） */
    private String scanCron = "0 0/15 * * * ?";
    /** 低/中/高优先级的默认时限（小时），用于自动设定 deadline */
    private int lowHours = 24;
    private int mediumHours = 8;
    private int highHours = 4;

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public int getWarnBeforeHours() { return warnBeforeHours; }
    public void setWarnBeforeHours(int warnBeforeHours) { this.warnBeforeHours = warnBeforeHours; }
    public String getScanCron() { return scanCron; }
    public void setScanCron(String scanCron) { this.scanCron = scanCron; }
    public int getLowHours() { return lowHours; }
    public void setLowHours(int lowHours) { this.lowHours = lowHours; }
    public int getMediumHours() { return mediumHours; }
    public void setMediumHours(int mediumHours) { this.mediumHours = mediumHours; }
    public int getHighHours() { return highHours; }
    public void setHighHours(int highHours) { this.highHours = highHours; }
}
