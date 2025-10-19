<template>
  <el-tabs v-model="activeTab">
    <!-- 1楼 Tab -->
    <el-tab-pane
      :label="getFloorLabel('floor1', INSPECTION_ITEMS.floor1.length)"
      name="floor1"
    >
      <div :class="readonly ? 'inspection-items-readonly' : 'inspection-items'">
        <div
          v-for="(item, index) in INSPECTION_ITEMS.floor1"
          :key="item.id"
          :class="readonly ? 'inspection-item-readonly' : 'inspection-item'"
        >
          <div class="item-index">{{ index + 1 }}</div>
          <div class="item-content">
            <div class="item-label">
              {{ item.label }}
              <el-tag v-if="item.type === 'number'" size="small" type="info">
                {{ item.unit }}
              </el-tag>
            </div>
            <div class="item-input" v-if="!readonly">
              <el-radio-group v-if="item.type === 'boolean'" v-model="modelValue.floor1[item.id]">
                <el-radio :label="true">{{ $t('business.inspection.message.normal') }}</el-radio>
                <el-radio :label="false">{{ $t('business.inspection.message.abnormal') }}</el-radio>
              </el-radio-group>
              <el-input-number
                v-else-if="item.type === 'number'"
                v-model="modelValue.floor1[item.id]"
                :min="item.min"
                :max="item.max"
                :precision="2"
                :controls-position="'right'"
              />
              <span v-if="item.type === 'number'" class="ml10">{{ item.unit }}</span>
            </div>
            <div class="item-value" v-else>
              <template v-if="item.type === 'boolean'">
                <el-tag :type="modelValue.floor1?.[item.id] === true ? 'success' : 'danger'">
                  {{ modelValue.floor1?.[item.id] === true ? $t('business.inspection.message.normal') :
                     modelValue.floor1?.[item.id] === false ? $t('business.inspection.message.abnormal') : '-' }}
                </el-tag>
              </template>
              <template v-else-if="item.type === 'number'">
                <span>{{ modelValue.floor1?.[item.id] ?? '-' }} {{ item.unit || '' }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </el-tab-pane>

    <!-- 2楼 Tab -->
    <el-tab-pane
      :label="getFloorLabel('floor2', INSPECTION_ITEMS.floor2.length)"
      name="floor2"
    >
      <div :class="readonly ? 'inspection-items-readonly' : 'inspection-items'">
        <div
          v-for="(item, index) in INSPECTION_ITEMS.floor2"
          :key="item.id"
          :class="readonly ? 'inspection-item-readonly' : 'inspection-item'"
        >
          <div class="item-index">{{ index + 1 }}</div>
          <div class="item-content">
            <div class="item-label">{{ item.label }}</div>
            <div class="item-input" v-if="!readonly">
              <el-radio-group v-model="modelValue.floor2[item.id]">
                <el-radio :label="true">{{ $t('business.inspection.message.normal') }}</el-radio>
                <el-radio :label="false">{{ $t('business.inspection.message.abnormal') }}</el-radio>
              </el-radio-group>
            </div>
            <div class="item-value" v-else>
              <el-tag :type="modelValue.floor2?.[item.id] === true ? 'success' : 'danger'">
                {{ modelValue.floor2?.[item.id] === true ? $t('business.inspection.message.normal') :
                   modelValue.floor2?.[item.id] === false ? $t('business.inspection.message.abnormal') : '-' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-tab-pane>

    <!-- 3楼 Tab -->
    <el-tab-pane
      :label="getFloorLabel('floor3', INSPECTION_ITEMS.floor3.length)"
      name="floor3"
    >
      <div :class="readonly ? 'inspection-items-readonly' : 'inspection-items'">
        <div
          v-for="(item, index) in INSPECTION_ITEMS.floor3"
          :key="item.id"
          :class="readonly ? 'inspection-item-readonly' : 'inspection-item'"
        >
          <div class="item-index">{{ index + 1 }}</div>
          <div class="item-content">
            <div class="item-label">{{ item.label }}</div>
            <div class="item-input" v-if="!readonly">
              <el-radio-group v-model="modelValue.floor3[item.id]">
                <el-radio :label="true">{{ $t('business.inspection.message.normal') }}</el-radio>
                <el-radio :label="false">{{ $t('business.inspection.message.abnormal') }}</el-radio>
              </el-radio-group>
            </div>
            <div class="item-value" v-else>
              <el-tag :type="modelValue.floor3?.[item.id] === true ? 'success' : 'danger'">
                {{ modelValue.floor3?.[item.id] === true ? $t('business.inspection.message.normal') :
                   modelValue.floor3?.[item.id] === false ? $t('business.inspection.message.abnormal') : '-' }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </el-tab-pane>

    <!-- 4楼 Tab -->
    <el-tab-pane
      :label="getFloorLabel('floor4', INSPECTION_ITEMS.floor4.length)"
      name="floor4"
    >
      <div :class="readonly ? 'inspection-items-readonly' : 'inspection-items'">
        <div
          v-for="(item, index) in INSPECTION_ITEMS.floor4"
          :key="item.id"
          :class="readonly ? 'inspection-item-readonly' : 'inspection-item'"
        >
          <div class="item-index">{{ index + 1 }}</div>
          <div class="item-content">
            <div class="item-label">
              {{ item.label }}
              <el-tag v-if="item.type === 'number'" size="small" type="info">
                {{ item.unit }}
              </el-tag>
            </div>
            <div class="item-input" v-if="!readonly">
              <el-radio-group v-if="item.type === 'boolean'" v-model="modelValue.floor4[item.id]">
                <el-radio :label="true">{{ $t('business.inspection.message.normal') }}</el-radio>
                <el-radio :label="false">{{ $t('business.inspection.message.abnormal') }}</el-radio>
              </el-radio-group>
              <el-input-number
                v-else-if="item.type === 'number'"
                v-model="modelValue.floor4[item.id]"
                :min="item.min"
                :max="item.max"
                :precision="0"
              />
              <span v-if="item.type === 'number'" class="ml10">{{ item.unit }}</span>
            </div>
            <div class="item-value" v-else>
              <template v-if="item.type === 'boolean'">
                <el-tag :type="modelValue.floor4?.[item.id] === true ? 'success' : 'danger'">
                  {{ modelValue.floor4?.[item.id] === true ? $t('business.inspection.message.normal') :
                     modelValue.floor4?.[item.id] === false ? $t('business.inspection.message.abnormal') : '-' }}
                </el-tag>
              </template>
              <template v-else-if="item.type === 'number'">
                <span>{{ modelValue.floor4?.[item.id] ?? '-' }} {{ item.unit || '' }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup name="InspectionFloorTabs">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { INSPECTION_ITEMS } from '../constants'

const { t } = useI18n()

/**
 * Props 定义
 * @property {Object} modelValue - 楼层巡检项数据 { floor1: {...}, floor2: {...}, ... }
 * @property {Boolean} readonly - 只读模式（detail 页使用）
 * @property {Boolean} showProgress - 显示进度条（create 页使用，暂未实现）
 */
interface Props {
  modelValue: Record<string, Record<string, any>>
  readonly?: boolean
  showProgress?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  showProgress: false
})

// 当前激活的 Tab
const activeTab = ref('floor1')

/**
 * 获取楼层标签
 * @param {String} floorKey - 楼层 key (floor1/floor2/floor3/floor4)
 * @param {Number} itemCount - 该楼层的巡检项数量
 * @returns {String} 楼层标签文本
 */
function getFloorLabel(floorKey, itemCount) {
  const floorNumber = floorKey.replace('floor', '')
  return t('business.inspection.message.floorLabelWithCount', { floor: floorNumber, count: itemCount })
}
</script>

<style lang="scss" scoped>
.ml10 {
  margin-left: 10px;
}

/* 编辑模式样式 */
.inspection-items {
  .inspection-item {
    display: flex;
    padding: 15px;
    border-bottom: 1px solid #ebeef5;

    &:hover {
      background-color: #f5f7fa;
    }

    .item-index {
      width: 40px;
      height: 40px;
      background-color: #409eff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 20px;
      flex-shrink: 0;
    }

    .item-content {
      flex: 1;

      .item-label {
        margin-bottom: 10px;
        font-size: 14px;
        font-weight: 500;
      }

      .item-input {
        display: flex;
        align-items: center;
      }
    }
  }
}

/* 只读模式样式 */
.inspection-items-readonly {
  .inspection-item-readonly {
    display: flex;
    padding: 12px;
    border-bottom: 1px solid #ebeef5;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f5f7fa;
    }

    .item-index {
      width: 36px;
      height: 36px;
      background-color: #909399;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 16px;
      flex-shrink: 0;
      font-size: 13px;
    }

    .item-content {
      flex: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .item-label {
        font-size: 14px;
        color: #606266;
      }

      .item-value {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }
    }
  }
}
</style>
