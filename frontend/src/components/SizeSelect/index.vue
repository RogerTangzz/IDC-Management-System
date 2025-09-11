<template>
  <div>
    <el-dropdown trigger="click" @command="handleSetSize">
      <div class="size-icon--style">
        <svg-icon class-name="size-icon" icon-class="size" />
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="item of sizeOptions" :key="item.value" :disabled="size === item.value"
            :command="item.value">
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts" setup>
import useAppStore from "@/store/modules/app"
import { getCurrentInstance } from 'vue'

type UiSize = 'large' | 'default' | 'small'

const appStore = useAppStore()
const size = computed<UiSize>(() => appStore.size as UiSize)
const { proxy } = getCurrentInstance() as any
const sizeOptions = ref<Array<{ label: string; value: UiSize }>>([
  { label: "较大", value: "large" },
  { label: "默认", value: "default" },
  { label: "稍小", value: "small" }
])

function handleSetSize(nextSize: UiSize) {
  proxy?.$modal?.loading?.("正在设置布局大小，请稍候...")
  appStore.setSize(nextSize)
  setTimeout(() => window.location.reload(), 1000)
}
</script>

<style lang='scss' scoped>
.size-icon--style {
  font-size: 18px;
  line-height: 50px;
  padding-right: 7px;
}
</style>