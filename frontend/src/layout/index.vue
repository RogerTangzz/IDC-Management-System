<template>
  <div :class="classObj" class="app-wrapper" :style="{ '--current-color': theme }">
    <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <Sidebar v-if="!sidebarState.hide" class="sidebar-container" />
    <div :class="{ hasTagsView: needTagsView, sidebarHide: sidebarState.hide }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <navbar @setLayout="setLayout" />
        <tags-view v-if="needTagsView" />
      </div>
      <app-main />
      <settings ref="settingRef" />
    </div>
  </div>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core'
import { AppMain, Navbar, Settings, TagsView } from './components'
import Sidebar from './components/Sidebar'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
// 引入业务服务
import ticketEscalation from '@/utils/business/ticketEscalation'
import maintenanceReminder from '@/utils/business/maintenanceReminder'
import inspectionAnomaly from '@/utils/business/inspectionAnomaly'

const { proxy } = getCurrentInstance()
const settingsStore = useSettingsStore()
const theme = computed(() => settingsStore.theme)
const sidebarState = computed(() => useAppStore().sidebar)
const device = computed(() => useAppStore().device)
const needTagsView = computed(() => settingsStore.tagsView)
const fixedHeader = computed(() => settingsStore.fixedHeader)

const classObj = computed(() => ({
  hideSidebar: !sidebarState.value.opened,
  openSidebar: sidebarState.value.opened,
  withoutAnimation: sidebarState.value.withoutAnimation,
  mobile: device.value === 'mobile'
}))

const { width } = useWindowSize()
const WIDTH = 992 // refer to Bootstrap's responsive design

watch(() => device.value, () => {
  if (device.value === 'mobile' && sidebarState.value.opened) {
    useAppStore().closeSideBar({ withoutAnimation: false })
  }
})

watchEffect(() => {
  if (width.value - 1 < WIDTH) {
    useAppStore().toggleDevice('mobile')
    useAppStore().closeSideBar({ withoutAnimation: true })
  } else {
    useAppStore().toggleDevice('desktop')
  }
})

function handleClickOutside() {
  useAppStore().closeSideBar({ withoutAnimation: false })
}

const settingRef = ref(null)
function setLayout() {
  settingRef.value.openSetting()
}

// 初始化业务服务
onMounted(() => {
  // 检查用户权限，决定是否启动服务
  const userPermissions = proxy.$auth.getPermissions()

  // 工单自动升级服务（需要工单管理权限）
  if (userPermissions.includes('business:ticket:edit') || userPermissions.includes('*:*:*')) {
    ticketEscalation.init(proxy)
    ticketEscalation.start()
    console.log('[系统服务] 工单自动升级服务已启动')
  }

  // 维保提醒服务（需要维保管理权限）
  if (userPermissions.includes('business:maintenance:query') || userPermissions.includes('*:*:*')) {
    maintenanceReminder.init(proxy)
    maintenanceReminder.start()
    console.log('[系统服务] 维保提醒服务已启动')
  }

  // 导出巡检异常服务供全局使用
  window.$inspectionAnomaly = inspectionAnomaly
  console.log('[系统服务] 巡检异常检测服务已加载')

  // 在开发环境打印服务状态
  // 使用 Vite 环境变量
  if (import.meta.env.DEV) {
    window.$services = {
      ticketEscalation,
      maintenanceReminder,
      inspectionAnomaly
    }
    console.log('[开发模式] 可通过 window.$services 访问业务服务')
  }
})

// 停止业务服务
onBeforeUnmount(() => {
  // 停止工单升级服务
  if (ticketEscalation.getStatus().isRunning) {
    ticketEscalation.stop()
    console.log('[系统服务] 工单自动升级服务已停止')
  }

  // 停止维保提醒服务
  if (maintenanceReminder.getStatus().isRunning) {
    maintenanceReminder.stop()
    console.log('[系统服务] 维保提醒服务已停止')
  }

  // 清理全局服务引用
  if (window.$inspectionAnomaly) {
    delete window.$inspectionAnomaly
  }
  if (window.$services) {
    delete window.$services
  }
})

// 监听页面可见性变化，优化服务性能
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // 页面隐藏时暂停不必要的服务
    console.log('[系统服务] 页面已隐藏，服务进入待机模式')
  } else {
    // 页面显示时恢复服务
    console.log('[系统服务] 页面已显示，服务恢复正常')
    // 可以触发一次手动检查
    if (maintenanceReminder.getStatus().isRunning) {
      maintenanceReminder.manualCheck()
    }
  }
})
</script>

<style lang="scss" scoped>
@use "@/assets/styles/mixin.scss" as mix;
@use "@/assets/styles/variables.module.scss" as vars;

.app-wrapper {
  @include mix.clearfix;
  position: relative;
  height: 100%;
  width: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.sidebar-container {
  position: relative;
  width: 210px;
  float: left;
  height: 100%;
  transition: width 0.28s;
  z-index: 1001;
}

.sidebarHide .sidebar-container {
  width: 0 !important;
}

.main-container {
  min-height: 100%;
  transition: margin-left 0.28s;
  margin-left: 210px;
}

.hideSidebar .main-container {
  margin-left: 54px;
}

.sidebarHide .main-container {
  margin-left: 0;
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{vars.$base-sidebar-width});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.sidebarHide .fixed-header {
  width: 100%;
}

.mobile .fixed-header {
  width: 100%;
}
</style>