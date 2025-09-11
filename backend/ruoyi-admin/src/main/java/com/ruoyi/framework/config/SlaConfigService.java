package com.ruoyi.framework.config;

import com.ruoyi.framework.config.properties.SlaProperties;
import com.ruoyi.system.service.ISysConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * SLA 配置读取：优先从 sys_config 读取，缺省使用 application.yml 的 SlaProperties。
 */
@Component
public class SlaConfigService {
    private static final String K_ENABLED = "idc.sla.enabled";
    private static final String K_WARN_BEFORE = "idc.sla.warnBeforeHours";
    private static final String K_LOW = "idc.sla.lowHours";
    private static final String K_MEDIUM = "idc.sla.mediumHours";
    private static final String K_HIGH = "idc.sla.highHours";

    @Autowired(required = false)
    private ISysConfigService configService;

    @Autowired(required = false)
    private SlaProperties props;

    private int parseInt(String s, int def){
        try { return Integer.parseInt(String.valueOf(s)); } catch (Exception e){ return def; }
    }
    private boolean parseBool(String s, boolean def){
        if (s == null) return def;
        String v = s.trim().toLowerCase();
        if ("y".equals(v) || "yes".equals(v) || "true".equals(v) || "1".equals(v)) return true;
        if ("n".equals(v) || "no".equals(v) || "false".equals(v) || "0".equals(v)) return false;
        return def;
    }

    public boolean isEnabled(){
        boolean def = props != null && props.isEnabled();
        if (configService == null) return def;
        String v = configService.selectConfigByKey(K_ENABLED);
        return parseBool(v, def);
    }

    public int warnBeforeHours(){
        int def = props != null ? props.getWarnBeforeHours() : 2;
        if (configService == null) return def;
        String v = configService.selectConfigByKey(K_WARN_BEFORE);
        return parseInt(v, def);
    }

    public int lowHours(){
        int def = props != null ? props.getLowHours() : 24;
        if (configService == null) return def;
        String v = configService.selectConfigByKey(K_LOW);
        return parseInt(v, def);
    }

    public int mediumHours(){
        int def = props != null ? props.getMediumHours() : 8;
        if (configService == null) return def;
        String v = configService.selectConfigByKey(K_MEDIUM);
        return parseInt(v, def);
    }

    public int highHours(){
        int def = props != null ? props.getHighHours() : 4;
        if (configService == null) return def;
        String v = configService.selectConfigByKey(K_HIGH);
        return parseInt(v, def);
    }
}

