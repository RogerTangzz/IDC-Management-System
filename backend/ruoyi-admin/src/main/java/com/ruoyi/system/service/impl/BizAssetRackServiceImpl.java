package com.ruoyi.system.service.impl;

import java.util.List;
import com.ruoyi.common.utils.DateUtils;
import com.ruoyi.common.utils.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.system.mapper.BizAssetRackMapper;
import com.ruoyi.system.domain.BizAssetRack;
import com.ruoyi.system.service.IBizAssetRackService;

/**
 * 资产机柜Service业务层处理
 *
 * @author ruoyi
 * @date 2025-01-17
 */
@Service
public class BizAssetRackServiceImpl implements IBizAssetRackService
{
    @Autowired
    private BizAssetRackMapper bizAssetRackMapper;

    /**
     * 查询资产机柜
     *
     * @param rackId 资产机柜主键
     * @return 资产机柜
     */
    @Override
    public BizAssetRack selectBizAssetRackByRackId(Long rackId)
    {
        return bizAssetRackMapper.selectBizAssetRackByRackId(rackId);
    }

    /**
     * 查询资产机柜列表
     *
     * @param bizAssetRack 资产机柜
     * @return 资产机柜
     */
    @Override
    public List<BizAssetRack> selectBizAssetRackList(BizAssetRack bizAssetRack)
    {
        return bizAssetRackMapper.selectBizAssetRackList(bizAssetRack);
    }

    /**
     * 新增资产机柜
     *
     * @param bizAssetRack 资产机柜
     * @return 结果
     */
    @Override
    public int insertBizAssetRack(BizAssetRack bizAssetRack)
    {
        bizAssetRack.setCreateTime(DateUtils.getNowDate());
        return bizAssetRackMapper.insertBizAssetRack(bizAssetRack);
    }

    /**
     * 修改资产机柜
     *
     * @param bizAssetRack 资产机柜
     * @return 结果
     */
    @Override
    public int updateBizAssetRack(BizAssetRack bizAssetRack)
    {
        bizAssetRack.setUpdateTime(DateUtils.getNowDate());
        return bizAssetRackMapper.updateBizAssetRack(bizAssetRack);
    }

    /**
     * 批量删除资产机柜
     *
     * @param rackIds 需要删除的资产机柜主键
     * @return 结果
     */
    @Override
    public int deleteBizAssetRackByRackIds(Long[] rackIds)
    {
        return bizAssetRackMapper.deleteBizAssetRackByRackIds(rackIds);
    }

    /**
     * 删除资产机柜信息
     *
     * @param rackId 资产机柜主键
     * @return 结果
     */
    @Override
    public int deleteBizAssetRackByRackId(Long rackId)
    {
        return bizAssetRackMapper.deleteBizAssetRackByRackId(rackId);
    }

    /**
     * 检查机柜编号是否唯一
     *
     * @param bizAssetRack 资产机柜
     * @return 唯一性校验结果（0-唯一，1-不唯一）
     */
    @Override
    public String checkRackNoUnique(BizAssetRack bizAssetRack)
    {
        Long rackId = StringUtils.isNull(bizAssetRack.getRackId()) ? -1L : bizAssetRack.getRackId();
        BizAssetRack info = bizAssetRackMapper.checkRackNoUnique(bizAssetRack.getRackNo());
        if (StringUtils.isNotNull(info) && info.getRackId().longValue() != rackId.longValue())
        {
            return "1"; // 不唯一
        }
        return "0"; // 唯一
    }
}
