package com.ruoyi.system.service;

import java.util.List;
import com.ruoyi.system.domain.BizAssetRack;

/**
 * 资产机柜Service接口
 *
 * @author ruoyi
 * @date 2025-01-17
 */
public interface IBizAssetRackService
{
    /**
     * 查询资产机柜
     *
     * @param rackId 资产机柜主键
     * @return 资产机柜
     */
    public BizAssetRack selectBizAssetRackByRackId(Long rackId);

    /**
     * 查询资产机柜列表
     *
     * @param bizAssetRack 资产机柜
     * @return 资产机柜集合
     */
    public List<BizAssetRack> selectBizAssetRackList(BizAssetRack bizAssetRack);

    /**
     * 新增资产机柜
     *
     * @param bizAssetRack 资产机柜
     * @return 结果
     */
    public int insertBizAssetRack(BizAssetRack bizAssetRack);

    /**
     * 修改资产机柜
     *
     * @param bizAssetRack 资产机柜
     * @return 结果
     */
    public int updateBizAssetRack(BizAssetRack bizAssetRack);

    /**
     * 批量删除资产机柜
     *
     * @param rackIds 需要删除的资产机柜主键集合
     * @return 结果
     */
    public int deleteBizAssetRackByRackIds(Long[] rackIds);

    /**
     * 删除资产机柜信息
     *
     * @param rackId 资产机柜主键
     * @return 结果
     */
    public int deleteBizAssetRackByRackId(Long rackId);

    /**
     * 检查机柜编号是否唯一
     *
     * @param bizAssetRack 资产机柜
     * @return 唯一性校验结果（0-唯一，1-不唯一）
     */
    public String checkRackNoUnique(BizAssetRack bizAssetRack);
}
