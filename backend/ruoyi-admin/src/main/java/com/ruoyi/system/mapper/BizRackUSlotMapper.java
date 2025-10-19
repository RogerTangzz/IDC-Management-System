package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.BizRackUSlot;
import org.apache.ibatis.annotations.Param;

/**
 * 机柜U位管理Mapper接口
 *
 * @author ruoyi
 * @date 2025-01-18
 */
public interface BizRackUSlotMapper
{
    /**
     * 查询机柜U位管理
     *
     * @param slotId 机柜U位管理主键
     * @return 机柜U位管理
     */
    public BizRackUSlot selectBizRackUSlotBySlotId(Long slotId);

    /**
     * 查询机柜U位管理列表
     *
     * @param bizRackUSlot 机柜U位管理
     * @return 机柜U位管理集合
     */
    public List<BizRackUSlot> selectBizRackUSlotList(BizRackUSlot bizRackUSlot);

    /**
     * 根据机柜ID查询U位列表
     *
     * @param rackId 机柜ID
     * @return U位列表
     */
    public List<BizRackUSlot> selectUSlotsByRackId(Long rackId);

    /**
     * 检查U位冲突(用于分配前检测)
     *
     * @param rackId 机柜ID
     * @param startU 起始U位
     * @param uCount 占用U位数
     * @return 冲突的U位数量
     */
    public int checkUSlotConflict(@Param("rackId") Long rackId,
                                   @Param("startU") Integer startU,
                                   @Param("uCount") Integer uCount);

    /**
     * 新增机柜U位管理
     *
     * @param bizRackUSlot 机柜U位管理
     * @return 结果
     */
    public int insertBizRackUSlot(BizRackUSlot bizRackUSlot);

    /**
     * 修改机柜U位管理
     *
     * @param bizRackUSlot 机柜U位管理
     * @return 结果
     */
    public int updateBizRackUSlot(BizRackUSlot bizRackUSlot);

    /**
     * 删除机柜U位管理
     *
     * @param slotId 机柜U位管理主键
     * @return 结果
     */
    public int deleteBizRackUSlotBySlotId(Long slotId);

    /**
     * 批量删除机柜U位管理
     *
     * @param slotIds 需要删除的数据主键集合
     * @return 结果
     */
    public int deleteBizRackUSlotBySlotIds(Long[] slotIds);

    /**
     * 批量分配U位(将指定范围的U位标记为已占用)
     *
     * @param rackId 机柜ID
     * @param startU 起始U位
     * @param uCount 占用U位数
     * @param deviceName 设备名称
     * @param deviceType 设备类型
     * @param allocatedBy 分配人
     * @return 影响行数
     */
    public int allocateUSlots(@Param("rackId") Long rackId,
                              @Param("startU") Integer startU,
                              @Param("uCount") Integer uCount,
                              @Param("deviceName") String deviceName,
                              @Param("deviceType") String deviceType,
                              @Param("allocatedBy") String allocatedBy);

    /**
     * 批量释放U位(将指定范围的U位标记为空闲)
     *
     * @param rackId 机柜ID
     * @param startU 起始U位
     * @param uCount 占用U位数
     * @param releasedBy 释放人
     * @return 影响行数
     */
    public int releaseUSlots(@Param("rackId") Long rackId,
                             @Param("startU") Integer startU,
                             @Param("uCount") Integer uCount,
                             @Param("releasedBy") String releasedBy);

    /**
     * 统计机柜的U位使用情况
     *
     * @param rackId 机柜ID
     * @return Map包含: total_slots, free_slots, occupied_slots, reserved_slots
     */
    public java.util.Map<String, Object> countUSlotsByRackId(Long rackId);
}
