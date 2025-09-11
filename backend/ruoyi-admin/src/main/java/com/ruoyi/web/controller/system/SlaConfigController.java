package com.ruoyi.web.controller.system;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.framework.config.SlaConfigService;
import com.ruoyi.system.domain.SysConfig;
import com.ruoyi.system.service.ISysConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/system/sla")
public class SlaConfigController extends BaseController {
    private static final String K_ENABLED = "idc.sla.enabled";
    private static final String K_WARN_BEFORE = "idc.sla.warnBeforeHours";
    private static final String K_LOW = "idc.sla.lowHours";
    private static final String K_MEDIUM = "idc.sla.mediumHours";
    private static final String K_HIGH = "idc.sla.highHours";

    @Autowired private ISysConfigService configService;
    @Autowired private SlaConfigService slaConfig;

    @PreAuthorize("@ss.hasPermi('system:config:query')")
    @GetMapping
    public AjaxResult get(){
        Map<String,Object> data = new HashMap<>();
        data.put("enabled", slaConfig.isEnabled());
        data.put("warnBeforeHours", slaConfig.warnBeforeHours());
        data.put("lowHours", slaConfig.lowHours());
        data.put("mediumHours", slaConfig.mediumHours());
        data.put("highHours", slaConfig.highHours());
        return AjaxResult.success(data);
    }

    @PreAuthorize("@ss.hasPermi('system:config:edit')")
    @PutMapping
    public AjaxResult update(@RequestBody Map<String,Object> body){
        try {
            upsert(K_ENABLED, trueToYN(booleanVal(body.get("enabled"))));
            upsert(K_WARN_BEFORE, str(body.get("warnBeforeHours")));
            upsert(K_LOW, str(body.get("lowHours")));
            upsert(K_MEDIUM, str(body.get("mediumHours")));
            upsert(K_HIGH, str(body.get("highHours")));
            configService.resetConfigCache();
            return AjaxResult.success();
        } catch (Exception e){
            return AjaxResult.error("更新失败:"+e.getMessage());
        }
    }

    private void upsert(String key, String value){
        String existed = configService.selectConfigByKey(key);
        if (existed == null){
            SysConfig c = new SysConfig();
            c.setConfigKey(key); c.setConfigValue(value);
            c.setConfigName(key);
            c.setConfigType("Y");
            configService.insertConfig(c);
        } else {
            SysConfig c = new SysConfig();
            c.setConfigKey(key); c.setConfigValue(value);
            configService.updateConfig(c);
        }
    }
    private String str(Object o){ return o==null?null:String.valueOf(o); }
    private boolean booleanVal(Object o){
        if (o == null) return false; String v = String.valueOf(o).toLowerCase();
        return "1".equals(v) || "true".equals(v) || "y".equals(v) || "yes".equals(v);
    }
    private String trueToYN(boolean b){ return b?"Y":"N"; }
}

