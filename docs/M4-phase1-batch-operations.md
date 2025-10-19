# Phase 1.3: 批量操作功能

## 📌 需求背景
运维人员经常需要批量修改机柜状态、批量导入机柜数据，提高工作效率。

## 🎯 功能清单
1. ✅ 批量删除（已实现）
2. 🆕 批量修改状态
3. 🆕 批量导入（Excel）
4. 🆕 批量分配楼层/房间

---

## 💻 Task 1: 批量修改状态

### 前端实现
**文件：** `frontend/src/views/business/asset/rack/index.vue`

```vue
<template>
  <!-- 添加多选列 -->
  <el-table @selection-change="handleSelectionChange">
    <el-table-column type="selection" width="55" />
    <!-- 其他列... -->
  </el-table>

  <!-- 添加批量操作按钮 -->
  <el-button
    type="warning"
    :disabled="selectedIds.length === 0"
    @click="handleBatchStatus"
  >
    批量修改状态
  </el-button>

  <!-- 批量状态修改对话框 -->
  <el-dialog v-model="batchStatusDialogVisible" title="批量修改状态">
    <el-alert
      title="提示"
      :description="`已选择 ${selectedIds.length} 条记录`"
      type="info"
      show-icon
      :closable="false"
    />
    <el-form style="margin-top: 20px;">
      <el-form-item label="目标状态">
        <el-radio-group v-model="batchStatusForm.targetStatus">
          <el-radio label="active">在用</el-radio>
          <el-radio label="disabled">停用</el-radio>
          <el-radio label="retired">退役</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="修改原因">
        <el-input
          v-model="batchStatusForm.reason"
          type="textarea"
          placeholder="请输入修改原因（可选）"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="batchStatusDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitBatchStatus">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
const selectedIds = ref([])
const batchStatusDialogVisible = ref(false)
const batchStatusForm = ref({
  targetStatus: 'active',
  reason: ''
})

// 多选变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.rackId)
}

// 打开批量状态修改对话框
const handleBatchStatus = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要修改的记录')
    return
  }
  batchStatusDialogVisible.value = true
}

// 提交批量修改
const submitBatchStatus = async () => {
  try {
    await batchUpdateStatus({
      rackIds: selectedIds.value,
      status: batchStatusForm.value.targetStatus,
      reason: batchStatusForm.value.reason
    })
    ElMessage.success(`成功修改 ${selectedIds.value.length} 条记录`)
    batchStatusDialogVisible.value = false
    getList() // 刷新列表
  } catch (error) {
    ElMessage.error('批量修改失败')
  }
}
</script>
```

### 后端实现
**Controller：**
```java
@ApiOperation("批量修改机柜状态")
@PutMapping("/batch/status")
public AjaxResult batchUpdateStatus(@RequestBody BatchStatusUpdateDTO dto) {
    // 验证参数
    if (dto.getRackIds() == null || dto.getRackIds().length == 0) {
        return error("请选择要修改的机柜");
    }

    if (!Arrays.asList("active", "disabled", "retired").contains(dto.getStatus())) {
        return error("无效的状态值");
    }

    // 批量更新
    int count = bizAssetRackService.batchUpdateStatus(dto.getRackIds(), dto.getStatus());

    // 记录日志
    for (Long rackId : dto.getRackIds()) {
        logService.insertLog(new BizAssetRackLog(
            rackId,
            "BATCH_UPDATE_STATUS",
            "批量修改状态为: " + dto.getStatus() + ", 原因: " + dto.getReason(),
            getUsername()
        ));
    }

    return success("成功修改 " + count + " 条记录");
}
```

**Service：**
```java
@Override
public int batchUpdateStatus(Long[] rackIds, String status) {
    return bizAssetRackMapper.batchUpdateStatus(rackIds, status);
}
```

**Mapper XML：**
```xml
<update id="batchUpdateStatus">
    UPDATE biz_asset_rack
    SET status = #{status},
        update_time = NOW(),
        update_by = #{updateBy}
    WHERE rack_id IN
    <foreach collection="rackIds" item="id" open="(" separator="," close=")">
        #{id}
    </foreach>
    AND del_flag = '0'
</update>
```

**预计时间：** 4 小时

---

## 📥 Task 2: 批量导入（Excel）

### 前端实现
```vue
<template>
  <el-button type="success" icon="Upload" @click="handleImport">
    导入
  </el-button>

  <!-- 导入对话框 -->
  <el-dialog v-model="importDialogVisible" title="批量导入机柜">
    <el-steps :active="importStep" finish-status="success">
      <el-step title="下载模板" />
      <el-step title="上传文件" />
      <el-step title="数据预览" />
      <el-step title="导入完成" />
    </el-steps>

    <!-- 步骤1：下载模板 -->
    <div v-if="importStep === 0" class="step-content">
      <el-alert type="info" :closable="false">
        <p>请先下载 Excel 模板，按照模板格式填写数据后上传。</p>
      </el-alert>
      <el-button type="primary" @click="downloadTemplate" style="margin-top: 20px;">
        下载模板
      </el-button>
    </div>

    <!-- 步骤2：上传文件 -->
    <div v-if="importStep === 1" class="step-content">
      <el-upload
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
        accept=".xlsx,.xls"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 xlsx/xls 文件，且不超过 5MB
          </div>
        </template>
      </el-upload>
    </div>

    <!-- 步骤3：数据预览 -->
    <div v-if="importStep === 2" class="step-content">
      <el-alert type="success" :closable="false">
        <p>共解析 {{ previewData.length }} 条数据，其中：</p>
        <p>✅ 有效数据：{{ validCount }} 条</p>
        <p>❌ 无效数据：{{ invalidCount }} 条</p>
      </el-alert>

      <el-table :data="previewData" max-height="400" style="margin-top: 20px;">
        <el-table-column prop="rackNo" label="机柜编号" width="120" />
        <el-table-column prop="rackName" label="机柜名称" width="150" />
        <el-table-column prop="floor" label="楼层" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag v-if="scope.row.valid" type="success">有效</el-tag>
            <el-tag v-else type="danger">无效</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="errorMsg" label="错误信息" show-overflow-tooltip />
      </el-table>
    </div>

    <!-- 步骤4：导入完成 -->
    <div v-if="importStep === 3" class="step-content">
      <el-result
        icon="success"
        title="导入成功"
        :sub-title="`成功导入 ${importResult.successCount} 条数据，失败 ${importResult.failCount} 条`"
      >
        <template #extra>
          <el-button type="primary" @click="importDialogVisible = false">
            完成
          </el-button>
        </template>
      </el-result>
    </div>

    <template #footer>
      <el-button v-if="importStep > 0" @click="importStep--">上一步</el-button>
      <el-button v-if="importStep < 2" type="primary" @click="importStep++">
        下一步
      </el-button>
      <el-button v-if="importStep === 2" type="primary" @click="confirmImport">
        确认导入
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import * as XLSX from 'xlsx'

const importDialogVisible = ref(false)
const importStep = ref(0)
const previewData = ref([])
const validCount = ref(0)
const invalidCount = ref(0)
const importResult = ref({ successCount: 0, failCount: 0 })

// 下载模板
const downloadTemplate = () => {
  const template = [
    {
      '机柜编号*': 'RACK-001',
      '机柜名称*': '核心机柜-A1',
      '楼层*': '1F',
      '房间': 'A区',
      '具体位置': '北侧靠窗',
      '总U数*': 42,
      '已用U数': 20,
      '额定功率(kW)': 10.5,
      '网络端口数': 24,
      '状态*': 'active',
      '备注': '新购置设备'
    }
  ]

  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '机柜导入模板')
  XLSX.writeFile(wb, '机柜导入模板.xlsx')
}

// 文件变化
const handleFileChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result)
    const workbook = XLSX.read(data, { type: 'array' })
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
    const jsonData = XLSX.utils.sheet_to_json(firstSheet)

    // 数据验证和转换
    previewData.value = jsonData.map(row => {
      const item = {
        rackNo: row['机柜编号*'],
        rackName: row['机柜名称*'],
        floor: row['楼层*'],
        room: row['房间'],
        location: row['具体位置'],
        uCount: row['总U数*'],
        uUsed: row['已用U数'] || 0,
        powerCapacity: row['额定功率(kW)'],
        networkPorts: row['网络端口数'],
        status: row['状态*'],
        remark: row['备注'],
        valid: true,
        errorMsg: ''
      }

      // 验证必填字段
      if (!item.rackNo || !item.rackName || !item.floor || !item.uCount || !item.status) {
        item.valid = false
        item.errorMsg = '缺少必填字段'
      }

      // 验证数据类型
      if (item.uCount && (item.uCount < 1 || item.uCount > 100)) {
        item.valid = false
        item.errorMsg = '总U数必须在1-100之间'
      }

      if (item.uUsed > item.uCount) {
        item.valid = false
        item.errorMsg = '已用U数不能超过总U数'
      }

      return item
    })

    validCount.value = previewData.value.filter(item => item.valid).length
    invalidCount.value = previewData.value.filter(item => !item.valid).length

    importStep.value = 2 // 跳转到预览步骤
  }

  reader.readAsArrayBuffer(file.raw)
}

// 确认导入
const confirmImport = async () => {
  const validData = previewData.value.filter(item => item.valid)

  try {
    const res = await batchImportRacks(validData)
    importResult.value = res.data
    importStep.value = 3
    getList() // 刷新列表
  } catch (error) {
    ElMessage.error('导入失败')
  }
}
</script>
```

### 后端实现
```java
@ApiOperation("批量导入机柜")
@PostMapping("/batch/import")
public AjaxResult batchImport(@RequestBody List<BizAssetRack> racks) {
    int successCount = 0;
    int failCount = 0;

    for (BizAssetRack rack : racks) {
        try {
            // 检查机柜编号唯一性
            if (!"0".equals(bizAssetRackService.checkRackNoUnique(rack))) {
                failCount++;
                continue;
            }

            // 设置创建人
            rack.setCreateBy(getUsername());

            // 插入数据
            bizAssetRackService.insertBizAssetRack(rack);
            successCount++;

        } catch (Exception e) {
            logger.error("导入机柜失败: {}", rack.getRackNo(), e);
            failCount++;
        }
    }

    Map<String, Integer> result = new HashMap<>();
    result.put("successCount", successCount);
    result.put("failCount", failCount);

    return success(result);
}
```

**预计时间：** 8 小时

---

## ✅ 验收标准
1. 批量修改状态：可同时修改多条记录的状态
2. 批量导入：支持 Excel 导入，包含数据预览和验证
3. 导入模板：符合实际字段要求
4. 错误处理：导入失败时有明确的错误提示

## 📊 总预计时间
- Task 1（批量修改状态）：4 小时
- Task 2（批量导入）：8 小时
- **总计：12 小时（1.5 个工作日）**
