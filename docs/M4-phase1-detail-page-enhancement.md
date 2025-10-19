# Phase 1.1: 机柜详情页增强

## 📌 需求背景
当前详情页功能较简单，需要增强以下功能：
1. 显示机柜的完整信息
2. 显示机柜内设备列表（未来扩展）
3. 显示U位占用可视化图
4. 显示历史变更记录

## 🎨 页面设计

### 布局结构
```
┌─────────────────────────────────────────┐
│  【返回列表】 机柜详情 - RACK-001        │
├─────────────────────────────────────────┤
│  【基本信息卡片】                        │
│  - 机柜编号、名称                        │
│  - 楼层、房间、位置                      │
│  - 状态、创建时间、更新时间               │
├─────────────────────────────────────────┤
│  【容量信息卡片】                        │
│  - 总U数、已用U数、剩余U数               │
│  - 占用率环形图                          │
│  - U位可视化图（42个格子，已用/空闲）    │
├─────────────────────────────────────────┤
│  【电力信息卡片】                        │
│  - 额定功率、当前功率                    │
│  - 网络端口数                            │
├─────────────────────────────────────────┤
│  【设备列表】（未来扩展）                 │
│  - 暂无设备 / 设备列表表格                │
├─────────────────────────────────────────┤
│  【变更历史】                            │
│  - 时间轴组件显示历史修改记录             │
└─────────────────────────────────────────┘
```

## 💻 开发任务

### Task 1: 优化详情页布局
**文件：** `frontend/src/views/business/asset/rack/detail.vue`

**功能点：**
1. 使用 Element Plus 的 `el-descriptions` 组件展示基本信息
2. 使用 `el-card` 分组展示不同类别的信息
3. 添加返回按钮

**代码示例：**
```vue
<template>
  <div class="app-container">
    <el-page-header @back="goBack" content="机柜详情">
      <template #extra>
        <el-button type="primary" @click="handleEdit">编辑</el-button>
      </template>
    </el-page-header>

    <el-row :gutter="20" class="mt20">
      <!-- 基本信息 -->
      <el-col :span="12">
        <el-card header="基本信息">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="机柜编号">{{ rackInfo.rackNo }}</el-descriptions-item>
            <el-descriptions-item label="机柜名称">{{ rackInfo.rackName }}</el-descriptions-item>
            <el-descriptions-item label="楼层">{{ formatFloor(rackInfo.floor) }}</el-descriptions-item>
            <!-- 更多字段... -->
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 容量信息 -->
      <el-col :span="12">
        <el-card header="容量信息">
          <el-row>
            <el-col :span="12">
              <el-statistic title="总U数" :value="rackInfo.uCount" suffix="U" />
            </el-col>
            <el-col :span="12">
              <el-statistic title="已用U数" :value="rackInfo.uUsed" suffix="U" />
            </el-col>
          </el-row>
          <!-- 占用率环形图 -->
          <div ref="chartContainer" style="height: 200px; margin-top: 20px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- U位可视化图 -->
    <el-card header="U位占用图" class="mt20">
      <div class="u-slot-visualization">
        <div
          v-for="u in rackInfo.uCount"
          :key="u"
          :class="['u-slot', u <= rackInfo.uUsed ? 'occupied' : 'free']"
          :title="`U${u}: ${u <= rackInfo.uUsed ? '已占用' : '空闲'}`"
        >
          {{ u }}
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.u-slot-visualization {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.u-slot {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.u-slot.occupied {
  background-color: #f56c6c;
  color: white;
  border-color: #f56c6c;
}

.u-slot.free {
  background-color: #67c23a;
  color: white;
  border-color: #67c23a;
}

.u-slot:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
</style>
```

**预计时间：** 4 小时

---

### Task 2: 添加占用率图表（ECharts）
**依赖：** 安装 ECharts

**步骤：**
```bash
cd frontend
pnpm install echarts
```

**代码示例：**
```typescript
import * as echarts from 'echarts'

const initChart = () => {
  const chart = echarts.init(chartContainer.value)

  const option = {
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: true,
        position: 'center',
        formatter: '{d}%\n占用率',
        fontSize: 20
      },
      data: [
        { value: rackInfo.value.uUsed, name: '已用U数', itemStyle: { color: '#f56c6c' } },
        { value: rackInfo.value.uCount - rackInfo.value.uUsed, name: '剩余U数', itemStyle: { color: '#67c23a' } }
      ]
    }]
  }

  chart.setOption(option)
}

onMounted(() => {
  initChart()
})
```

**预计时间：** 2 小时

---

### Task 3: 添加变更历史（时间轴）
**后端需求：** 创建操作日志表

**SQL：**
```sql
CREATE TABLE biz_asset_rack_log (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    rack_id BIGINT NOT NULL COMMENT '机柜ID',
    operation_type VARCHAR(20) NOT NULL COMMENT '操作类型：CREATE/UPDATE/DELETE',
    operation_desc VARCHAR(500) COMMENT '操作描述',
    old_value TEXT COMMENT '旧值（JSON）',
    new_value TEXT COMMENT '新值（JSON）',
    operator VARCHAR(50) COMMENT '操作人',
    operation_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_rack_id (rack_id),
    INDEX idx_operation_time (operation_time)
) COMMENT '机柜变更日志表';
```

**前端组件：**
```vue
<el-timeline>
  <el-timeline-item
    v-for="log in changeHistory"
    :key="log.logId"
    :timestamp="log.operationTime"
    placement="top"
  >
    <el-card>
      <h4>{{ log.operationDesc }}</h4>
      <p>操作人：{{ log.operator }}</p>
      <el-tag v-if="log.operationType === 'CREATE'" type="success">新增</el-tag>
      <el-tag v-else-if="log.operationType === 'UPDATE'" type="warning">修改</el-tag>
      <el-tag v-else type="danger">删除</el-tag>
    </el-card>
  </el-timeline-item>
</el-timeline>
```

**预计时间：** 6 小时（含后端）

---

## ✅ 验收标准
1. 详情页包含4个主要卡片（基本信息、容量、电力、设备列表）
2. U位可视化图正确显示占用状态
3. 占用率环形图正确显示百分比
4. 变更历史按时间倒序显示
5. 响应式布局，手机端正常显示

## 📊 总预计时间
- Task 1: 4 小时
- Task 2: 2 小时
- Task 3: 6 小时
- **总计：12 小时（1.5 个工作日）**
