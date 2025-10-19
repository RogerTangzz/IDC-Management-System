# Phase 1.2: 机柜U位管理功能

## 📌 需求背景
运维人员需要详细管理每个U位的占用情况，记录哪些U位被哪些设备占用。

## 🎯 功能目标
1. 精确记录每个U位的占用状态
2. 支持设备与U位的关联
3. 可视化U位分配图
4. U位冲突检测

## 📊 数据库设计

### 新增表：biz_rack_u_slot（机柜U位表）
```sql
CREATE TABLE biz_rack_u_slot (
    slot_id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT 'U位ID',
    rack_id BIGINT NOT NULL COMMENT '机柜ID',
    u_number INT NOT NULL COMMENT 'U位编号（1-100）',
    status VARCHAR(20) DEFAULT 'free' COMMENT '状态：free-空闲/occupied-占用/reserved-预留',
    device_id BIGINT COMMENT '占用设备ID（外键，未来扩展）',
    device_name VARCHAR(100) COMMENT '设备名称',
    start_u INT COMMENT '起始U位（设备占用多个U时使用）',
    u_count INT DEFAULT 1 COMMENT '占用U数',
    allocation_date DATETIME COMMENT '分配日期',
    allocated_by VARCHAR(50) COMMENT '分配人',
    remark VARCHAR(500) COMMENT '备注',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    del_flag CHAR(1) DEFAULT '0' COMMENT '删除标志',

    UNIQUE KEY uk_rack_u (rack_id, u_number, del_flag),
    INDEX idx_rack_id (rack_id),
    INDEX idx_status (status),
    FOREIGN KEY (rack_id) REFERENCES biz_asset_rack(rack_id)
) COMMENT '机柜U位管理表';

-- 初始化U位数据（为现有机柜生成U位）
INSERT INTO biz_rack_u_slot (rack_id, u_number, status)
SELECT
    rack_id,
    u_num,
    CASE
        WHEN u_num <= u_used THEN 'occupied'
        ELSE 'free'
    END AS status
FROM biz_asset_rack
CROSS JOIN (
    SELECT 1 AS u_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION
    SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION
    SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
    SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
    SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION
    SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30 UNION
    SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35 UNION
    SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40 UNION
    SELECT 41 UNION SELECT 42
) AS u_numbers
WHERE del_flag = '0'
  AND u_num <= u_count;
```

## 💻 后端开发

### Task 1: 创建 U位 实体和 Mapper
**文件：** `BizRackUSlot.java`

```java
public class BizRackUSlot extends BaseEntity {
    private Long slotId;
    private Long rackId;
    private Integer uNumber;
    private String status;
    private Long deviceId;
    private String deviceName;
    private Integer startU;
    private Integer uCount;
    private Date allocationDate;
    private String allocatedBy;
    private String remark;
    // getters and setters...
}
```

### Task 2: Service 层方法
```java
public interface IBizRackUSlotService {

    /**
     * 查询机柜的所有U位
     */
    List<BizRackUSlot> selectUSlotsByRackId(Long rackId);

    /**
     * 分配U位（单个或多个连续U位）
     */
    int allocateUSlots(Long rackId, Integer startU, Integer uCount, String deviceName);

    /**
     * 释放U位
     */
    int releaseUSlots(Long rackId, Integer startU, Integer uCount);

    /**
     * 检查U位冲突
     */
    boolean checkUSlotConflict(Long rackId, Integer startU, Integer uCount);

    /**
     * 批量初始化机柜U位
     */
    int initRackUSlots(Long rackId, Integer totalU);
}
```

### Task 3: Controller API
```java
@Api(tags = "机柜U位管理")
@RestController
@RequestMapping("/business/asset/rack/uslot")
public class BizRackUSlotController extends BaseController {

    @ApiOperation("查询机柜U位列表")
    @GetMapping("/list/{rackId}")
    public AjaxResult list(@PathVariable Long rackId) {
        List<BizRackUSlot> slots = uSlotService.selectUSlotsByRackId(rackId);
        return success(slots);
    }

    @ApiOperation("分配U位")
    @PostMapping("/allocate")
    public AjaxResult allocate(@RequestBody USlotAllocationDTO dto) {
        // 检查冲突
        if (uSlotService.checkUSlotConflict(dto.getRackId(), dto.getStartU(), dto.getUCount())) {
            return error("U位范围冲突，已被占用");
        }

        int result = uSlotService.allocateUSlots(
            dto.getRackId(), dto.getStartU(), dto.getUCount(), dto.getDeviceName()
        );

        return toAjax(result);
    }

    @ApiOperation("释放U位")
    @DeleteMapping("/release")
    public AjaxResult release(@RequestBody USlotReleaseDTO dto) {
        return toAjax(uSlotService.releaseUSlots(
            dto.getRackId(), dto.getStartU(), dto.getUCount()
        ));
    }
}
```

## 🎨 前端开发

### Task 4: U位可视化组件
**文件：** `frontend/src/components/USlotVisualization.vue`

```vue
<template>
  <div class="u-slot-container">
    <!-- 机柜外框 -->
    <div class="rack-frame">
      <!-- 标题 -->
      <div class="rack-header">
        <span>{{ rackName }}</span>
        <span>总U数: {{ totalU }}U</span>
      </div>

      <!-- U位列表 -->
      <div class="u-slot-list">
        <div
          v-for="slot in uSlots"
          :key="slot.uNumber"
          :class="['u-slot-item', `status-${slot.status}`]"
          @click="handleSlotClick(slot)"
          @mouseenter="showTooltip(slot, $event)"
          @mouseleave="hideTooltip"
        >
          <span class="u-number">U{{ slot.uNumber }}</span>
          <span v-if="slot.deviceName" class="device-name">{{ slot.deviceName }}</span>
        </div>
      </div>

      <!-- 图例 -->
      <div class="legend">
        <div class="legend-item">
          <div class="color-box status-free"></div>
          <span>空闲</span>
        </div>
        <div class="legend-item">
          <div class="color-box status-occupied"></div>
          <span>占用</span>
        </div>
        <div class="legend-item">
          <div class="color-box status-reserved"></div>
          <span>预留</span>
        </div>
      </div>
    </div>

    <!-- U位分配对话框 -->
    <el-dialog v-model="dialogVisible" title="分配U位">
      <el-form :model="allocationForm" :rules="rules">
        <el-form-item label="起始U位" prop="startU">
          <el-input-number v-model="allocationForm.startU" :min="1" :max="totalU" />
        </el-form-item>
        <el-form-item label="占用U数" prop="uCount">
          <el-input-number v-model="allocationForm.uCount" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="设备名称" prop="deviceName">
          <el-input v-model="allocationForm.deviceName" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="allocationForm.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAllocation">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { allocateUSlot, getUSlotList } from '@/api/business/rack/uslot'

const props = defineProps({
  rackId: {
    type: Number,
    required: true
  },
  rackName: {
    type: String,
    default: ''
  }
})

const uSlots = ref([])
const totalU = ref(42)
const dialogVisible = ref(false)

const allocationForm = ref({
  startU: 1,
  uCount: 1,
  deviceName: '',
  remark: ''
})

// 加载U位列表
const loadUSlots = async () => {
  const res = await getUSlotList(props.rackId)
  uSlots.value = res.data
}

// 点击U位
const handleSlotClick = (slot) => {
  if (slot.status === 'free') {
    // 空闲U位，打开分配对话框
    allocationForm.value.startU = slot.uNumber
    dialogVisible.value = true
  } else {
    // 已占用U位，显示详情或释放选项
    ElMessageBox.confirm(
      `U${slot.uNumber} 已被 ${slot.deviceName} 占用，是否释放？`,
      '确认释放',
      {
        confirmButtonText: '释放',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      releaseSlot(slot)
    })
  }
}

// 提交分配
const submitAllocation = async () => {
  try {
    await allocateUSlot({
      rackId: props.rackId,
      ...allocationForm.value
    })
    ElMessage.success('分配成功')
    dialogVisible.value = false
    loadUSlots()
  } catch (error) {
    ElMessage.error(error.message || '分配失败')
  }
}

onMounted(() => {
  loadUSlots()
})
</script>

<style scoped>
.rack-frame {
  border: 3px solid #333;
  border-radius: 8px;
  padding: 20px;
  background: linear-gradient(to bottom, #f5f5f5, #e8e8e8);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.rack-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ddd;
}

.u-slot-list {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 4px;
}

.u-slot-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  padding: 0 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.u-slot-item:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.status-free {
  background-color: #67c23a;
  color: white;
  border-color: #67c23a;
}

.status-occupied {
  background-color: #f56c6c;
  color: white;
  border-color: #f56c6c;
}

.status-reserved {
  background-color: #e6a23c;
  color: white;
  border-color: #e6a23c;
}

.u-number {
  font-weight: bold;
  font-size: 14px;
}

.device-name {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 150px;
}

.legend {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 2px solid #ddd;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid #ddd;
}
</style>
```

## ✅ 验收标准
1. 每个机柜自动生成对应数量的U位记录
2. U位可视化图正确显示占用状态（绿色-空闲/红色-占用/黄色-预留）
3. 点击空闲U位可分配给设备
4. 点击占用U位可查看详情或释放
5. 分配时自动检测U位冲突
6. 分配/释放后机柜的 u_used 字段自动更新

## 📊 开发时间预估
- 数据库设计：2 小时
- 后端开发（Entity/Mapper/Service/Controller）：6 小时
- 前端组件开发：8 小时
- 集成测试：4 小时
- **总计：20 小时（2.5 个工作日）**

## 🔄 后续扩展
1. 与设备管理模块集成（关联 device_id）
2. U位预留功能（为即将上架的设备预留）
3. U位变更历史记录
4. 导出U位分配图（PDF）
