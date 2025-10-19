package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.BizAssetRack;

/**
 * 资产机柜Mapper接口
 *
 * @author ruoyi
 * @date 2025-01-17
 */
public interface BizAssetRackMapper
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
     * 删除资产机柜
     *
     * @param rackId 资产机柜主键
     * @return 结果
     */
    public int deleteBizAssetRackByRackId(Long rackId);

    /**
     * 批量删除资产机柜
     *
     * @param rackIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteBizAssetRackByRackIds(Long[] rackIds);

    /**
     * 检查机柜编号是否唯一
     *
     * @param rackNo 机柜编号
     * @return 机柜对象
     */
    public BizAssetRack checkRackNoUnique(String rackNo);
}
