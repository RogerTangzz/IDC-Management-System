package com.ruoyi.system.service.impl;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.system.mapper.BizAssetRackLogMapper;
import com.ruoyi.system.domain.BizAssetRackLog;
import com.ruoyi.system.service.IBizAssetRackLogService;

/**
 * 机柜变更日志Service业务层处理
 *
 * @author ruoyi
 * @date 2025-01-20
 */
@Service
public class BizAssetRackLogServiceImpl implements IBizAssetRackLogService
{
    @Autowired
    private BizAssetRackLogMapper bizAssetRackLogMapper;

    /**
     * 查询机柜变更日志列表
     *
     * @param rackId 机柜ID
     * @return 机柜变更日志
     */
    @Override
    public List<BizAssetRackLog> selectRackLogsByRackId(Long rackId)
    {
        return bizAssetRackLogMapper.selectRackLogsByRackId(rackId);
    }

    /**
     * 新增机柜变更日志
     *
     * @param log 机柜变更日志
     * @return 结果
     */
    @Override
    public int insertRackLog(BizAssetRackLog log)
    {
        return bizAssetRackLogMapper.insertRackLog(log);
    }

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
    @Override
    public int logUSlotAllocation(Long rackId, Integer startU, Integer uCount, String deviceName, String operator)
    {
        BizAssetRackLog log = new BizAssetRackLog();
        log.setRackId(rackId);
        log.setOperationType("U_ALLOCATE");

        // 构建操作描述
        String desc = String.format("分配U位: U%d-U%d (%d个U位) 给设备 [%s]",
            startU, startU + uCount - 1, uCount, deviceName);
        log.setOperationDesc(desc);

        // 记录新值（JSON格式）
        String newValue = String.format("{\"startU\":%d,\"uCount\":%d,\"deviceName\":\"%s\"}",
            startU, uCount, deviceName);
        log.setNewValue(newValue);

        log.setOperator(operator);

        return bizAssetRackLogMapper.insertRackLog(log);
    }

    /**
     * 记录U位释放日志
     *
     * @param rackId 机柜ID
     * @param startU 起始U位
     * @param uCount U位数量
     * @param operator 操作人
     * @return 结果
     */
    @Override
    public int logUSlotRelease(Long rackId, Integer startU, Integer uCount, String operator)
    {
        BizAssetRackLog log = new BizAssetRackLog();
        log.setRackId(rackId);
        log.setOperationType("U_RELEASE");

        // 构建操作描述
        String desc = String.format("释放U位: U%d-U%d (%d个U位)",
            startU, startU + uCount - 1, uCount);
        log.setOperationDesc(desc);

        // 记录旧值（JSON格式）
        String oldValue = String.format("{\"startU\":%d,\"uCount\":%d}", startU, uCount);
        log.setOldValue(oldValue);

        log.setOperator(operator);

        return bizAssetRackLogMapper.insertRackLog(log);
    }
}
