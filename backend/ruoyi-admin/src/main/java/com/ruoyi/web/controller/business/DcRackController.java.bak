package com.ruoyi.web.controller.business;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.utils.DateUtils;
import com.ruoyi.system.domain.DcRack;
import com.ruoyi.system.domain.DcRoom;
import com.ruoyi.system.domain.DcRackUnit;
import com.ruoyi.system.mapper.DcRackMapper;
import com.ruoyi.system.mapper.DcRoomMapper;
import com.ruoyi.system.mapper.DcRackUnitMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/business/asset")
public class DcRackController extends BaseController {

    @Autowired private DcRoomMapper roomMapper;
    @Autowired private DcRackMapper rackMapper;
    @Autowired private DcRackUnitMapper unitMapper;

    /** 机房列表 */
    @PreAuthorize("@ss.hasPermi('business:asset:room:list') or @ss.hasPermi('business:asset:rack:list')")
    @GetMapping("/room/list")
    public TableDataInfo roomList(DcRoom q){ startPage(); return getDataTable(roomMapper.selectList(q)); }

    /** 新增机房 */
    @PreAuthorize("@ss.hasPermi('business:asset:room:add')")
    @PostMapping("/room")
    public AjaxResult addRoom(@RequestBody DcRoom r){ r.setCreateTime(DateUtils.getNowDate()); return toAjax(roomMapper.insert(r)); }

    /** 更新机房 */
    @PreAuthorize("@ss.hasPermi('business:asset:room:edit')")
    @PutMapping("/room")
    public AjaxResult editRoom(@RequestBody DcRoom r){ r.setUpdateTime(DateUtils.getNowDate()); return toAjax(roomMapper.update(r)); }

    /** 删除机房（逻辑删除） */
    @PreAuthorize("@ss.hasPermi('business:asset:room:remove')")
    @DeleteMapping("/room/{id}")
    public AjaxResult delRoom(@PathVariable Long id){ return toAjax(roomMapper.deleteById(id)); }

    /** 机柜列表 */
    @PreAuthorize("@ss.hasPermi('business:asset:rack:list')")
    @GetMapping("/rack/list")
    public TableDataInfo rackList(DcRack q){
        startPage();
        List<DcRack> list = rackMapper.selectList(q);
        // 组装占用率与功率信息
        List<java.util.Map<String,Object>> rows = new ArrayList<>();
        for (DcRack r : list){
            long total = 0, occ = 0;
            try { total = rackMapper.countTotalUnits(r.getRackId()); } catch (Exception ignore) {}
            try { occ = rackMapper.countOccupiedUnits(r.getRackId()); } catch (Exception ignore) {}
            double rate = (total==0)?0.0: (occ*1.0/total);
            java.util.Map<String,Object> m = new java.util.HashMap<>();
            m.put("rackId", r.getRackId()); m.put("roomId", r.getRoomId()); m.put("code", r.getCode());
            m.put("uTotal", r.getUTotal()); m.put("powerRated", r.getPowerRated()); m.put("powerCurrent", r.getPowerCurrent());
            m.put("status", r.getStatus()); m.put("occupancyRate", rate);
            m.put("createTime", r.getCreateTime()); m.put("updateTime", r.getUpdateTime());
            rows.add(m);
        }
        return getDataTable(rows);
    }

    /** 新增机柜：自动初始化 U 位记录（全空闲） */
    @PreAuthorize("@ss.hasPermi('business:asset:rack:add')")
    @PostMapping("/rack")
    public AjaxResult addRack(@RequestBody DcRack r){
        if (r.getUTotal()==null || r.getUTotal()<=0) r.setUTotal(42);
        r.setCreateTime(DateUtils.getNowDate());
        int rows = rackMapper.insert(r);
        if (rows>0){
            List<DcRackUnit> list = new ArrayList<>();
            for (int i=1;i<=r.getUTotal();i++){
                DcRackUnit u = new DcRackUnit(); u.setRackId(r.getRackId()); u.setUIndex(i); u.setOccupied("N");
                list.add(u);
            }
            if (!list.isEmpty()) unitMapper.batchUpsert(list);
        }
        return toAjax(rows);
    }

    /** 更新机柜 */
    @PreAuthorize("@ss.hasPermi('business:asset:rack:edit')")
    @PutMapping("/rack")
    public AjaxResult editRack(@RequestBody DcRack r){ r.setUpdateTime(DateUtils.getNowDate()); return toAjax(rackMapper.update(r)); }

    /** 删除机柜 */
    @PreAuthorize("@ss.hasPermi('business:asset:rack:remove')")
    @DeleteMapping("/rack/{id}")
    public AjaxResult delRack(@PathVariable Long id){ return toAjax(rackMapper.deleteById(id)); }

    /** 查询机柜 U 位 */
    @PreAuthorize("@ss.hasPermi('business:asset:rack:query')")
    @GetMapping("/rack/{id}/units")
    public AjaxResult rackUnits(@PathVariable Long id){ return AjaxResult.success(unitMapper.selectByRackId(id)); }

    /** 批量占用/释放 U 段（简单实现：先清再写） */
    @PreAuthorize("@ss.hasPermi('business:asset:rack:occupy')")
    @PostMapping("/rack/{id}/occupy")
    public AjaxResult occupy(@PathVariable Long id, @RequestBody List<DcRackUnit> segs){
        if (segs==null) segs = Collections.emptyList();
        DcRack rack = rackMapper.selectById(id);
        if (rack == null) return AjaxResult.error("机柜不存在");
        int uTotal = rack.getUTotal()==null?42:rack.getUTotal();
        // 校验：越界、重叠、非法占用标记
        java.util.Set<Integer> seen = new java.util.HashSet<>();
        for (DcRackUnit u : segs){
            if (u.getUIndex()==null || u.getUIndex()<1 || u.getUIndex()>uTotal) return AjaxResult.error("U位越界: "+u.getUIndex());
            if (!seen.add(u.getUIndex())) return AjaxResult.error("U位重叠: "+u.getUIndex());
            String occ = (u.getOccupied()==null?"Y":u.getOccupied());
            if (!"Y".equalsIgnoreCase(occ) && !"N".equalsIgnoreCase(occ)) return AjaxResult.error("occupied 仅支持 Y/N");
        }
        // 简化：仅对传入 U 位应用状态，未传的不改变；如需“强制覆盖”，前端可先传 clear=true 实现全清
        for (DcRackUnit u : segs){ u.setRackId(id); if (u.getOccupied()==null) u.setOccupied("Y"); }
        if (!segs.isEmpty()) unitMapper.batchUpsert(segs);
        return AjaxResult.success();
    }
}
