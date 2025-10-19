package com.ruoyi.system.service;

import java.util.List;
import com.ruoyi.system.domain.BizAssetRackLog;

/**
 * 机柜变更日志Service接口
 *
 * @author ruoyi
 * @date 2025-01-20
 */
public interface IBizAssetRackLogService
{
    /**
     * 查询机柜变更日志列表
     *
     * @param rackId 机柜ID
     * @return 机柜变更日志集合
     */
    public List<BizAssetRackLog> selectRackLogsByRackId(Long rackId);

    /**
     * 新增机柜变更日志
     *
     * @param log 机柜变更日志
     * @return 结果
     */
    public int insertRackLog(BizAssetRackLog log);

    /**
     * 记录U位分配日志
     *
     * @param rackId 机柜ID
     * @param startU 起始U位
     * @param uCount U位数量
     * @param deviceName 设备名称
     * @param operator 操作人
     * @return 结果
     */
    public int logUSlotAllocation(Long rackId, Integer startU, Integer uCount, String deviceName, String operator);

    /**
     * 记录U位释放日志
     *
     * @param rackId 机柜ID
     * @param startU 起始U位
     * @param uCount U位数量
     * @param operator 操作人
     * @return 结果
     */
    public int logUSlotRelease(Long rackId, Integer startU, Integer uCount, String operator);
}
