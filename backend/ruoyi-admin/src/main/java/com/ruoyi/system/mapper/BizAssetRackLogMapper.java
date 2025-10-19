package com.ruoyi.system.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Param;
import com.ruoyi.system.domain.BizAssetRackLog;

/**
 * 机柜变更日志Mapper接口
 *
 * @author ruoyi
 * @date 2025-01-20
 */
public interface BizAssetRackLogMapper
{
    /**
     * 查询机柜变更日志列表
     *
     * @param rackId 机柜ID
     * @return 机柜变更日志集合
     */
    public List<BizAssetRackLog> selectRackLogsByRackId(@Param("rackId") Long rackId);

    /**
     * 新增机柜变更日志
     *
     * @param bizAssetRackLog 机柜变更日志
     * @return 结果
     */
    public int insertRackLog(BizAssetRackLog bizAssetRackLog);

    /**
     * 批量新增机柜变更日志
     *
     * @param logs 机柜变更日志列表
     * @return 结果
     */
    public int batchInsertRackLog(List<BizAssetRackLog> logs);

    /**
     * 删除机柜变更日志（根据机柜ID）
     *
     * @param rackId 机柜ID
     * @return 结果
     */
    public int deleteRackLogByRackId(@Param("rackId") Long rackId);
}
