<template>
  <el-menu :default-active="activeMenu" mode="horizontal" @select="handleSelect" :ellipsis="false">
    <template v-for="(item, index) in topMenus">
      <el-menu-item :style="{ '--theme': theme }" :index="item.path" :key="index" v-if="index < visibleNumber">
        <svg-icon v-if="item.meta && item.meta.icon && item.meta.icon !== '#'" :icon-class="item.meta.icon" />
        {{ item.meta.title }}
      </el-menu-item>
    </template>

    <!-- 顶部菜单超出数量折叠 -->
    <el-sub-menu :style="{ '--theme': theme }" index="more" v-if="topMenus.length > visibleNumber">
      <template #title>更多菜单</template>
      <template v-for="(item, index) in topMenus">
        <el-menu-item :index="item.path" :key="index" v-if="index >= visibleNumber">
          <svg-icon v-if="item.meta && item.meta.icon && item.meta.icon !== '#'" :icon-class="item.meta.icon" />
          {{ item.meta.title }}
        </el-menu-item>
      </template>
    </el-sub-menu>
  </el-menu>
</template>

<script lang="ts" setup>
import { constantRoutes } from "@/router"
import { isHttp } from '@/utils/validate'
import useAppStore from '@/store/modules/app'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

// 顶部栏初始数（保持为数字，避免模板中出现 null 比较类型错误）
const visibleNumber = ref<number>(0)
// 当前激活菜单的 index
const currentIndex = ref<string | null>(null)
// 隐藏侧边栏路由
const hideList: string[] = ['/index', '/user/profile']

const appStore = useAppStore()
const settingsStore = useSettingsStore()
const permissionStore = usePermissionStore()
const route = useRoute()
const router = useRouter()

// 主题颜色
const theme = computed<string>(() => settingsStore.theme as string)
// 菜单与元信息类型（局部定义，后续可抽离至全局 types）
interface MenuMeta { title: string; icon?: string; link?: string }
interface MenuItem { path: string; hidden?: boolean; children?: MenuItem[]; meta: MenuMeta; parentPath?: string; query?: string }
// 所有的路由信息
const routers = computed<MenuItem[]>(() => permissionStore.topbarRouters as unknown as MenuItem[])

// 顶部显示菜单
const topMenus = computed<MenuItem[]>(() => {
  const topMenus: MenuItem[] = []
  routers.value.forEach((menu: MenuItem) => {
    if (menu.hidden !== true) {
      // 兼容顶部栏一级菜单内部跳转
      if (menu.path === '/' && menu.children) {
        topMenus.push(menu.children[0])
      } else {
        topMenus.push(menu)
      }
    }
  })
  return topMenus
})

// 设置子路由
const childrenMenus = computed<MenuItem[]>(() => {
  const list: MenuItem[] = []
  routers.value.forEach((r: MenuItem) => {
    if (!r.children) return
    r.children.forEach((child: MenuItem) => {
      if (child.parentPath === undefined) {
        if (r.path === '/') {
          child.path = '/' + child.path
        } else if (!isHttp(child.path)) {
          child.path = r.path + '/' + child.path
        }
        child.parentPath = r.path
      }
      list.push(child)
    })
  })
  return (constantRoutes as any[]).concat(list)
})

// 默认激活的菜单
const activeMenu = computed<string>(() => {
  const path = route.path as string
  let activePath: string = path
  if (path !== undefined && path.lastIndexOf("/") > 0 && hideList.indexOf(path) === -1) {
    const tmpPath = path.substring(1, path.length)
    if (!route.meta.link) {
      activePath = "/" + tmpPath.substring(0, tmpPath.indexOf("/"))
      appStore.toggleSideBarHide(false)
    }
  } else if (!(route as any).children) { // Route 对象本身没有 children，使用断言保持原逻辑
    activePath = path
    appStore.toggleSideBarHide(true)
  }
  activeRoutes(activePath)
  return activePath
})

function setVisibleNumber() {
  const width = document.body.getBoundingClientRect().width / 3
  visibleNumber.value = Math.max(1, Math.floor(width / 85))
}

function handleSelect(key: string) {
  currentIndex.value = key
  const found = routers.value.find(item => item.path === key)
  if (isHttp(key)) {
    // http(s):// 路径新窗口打开
    window.open(key, "_blank")
  } else if (!found || !found.children) {
    // 没有子路由路径内部打开
    const routeMenu = childrenMenus.value.find(item => item.path === key)
    if (routeMenu && routeMenu.query) {
      let query = JSON.parse(routeMenu.query)
      router.push({ path: key, query: query })
    } else {
      router.push({ path: key })
    }
    appStore.toggleSideBarHide(true)
  } else {
    // 显示左侧联动菜单
    // 如果该顶栏菜单本身就有 children，直接用该节点 children；否则回退到 activeRoutes 逻辑
    if (found && Array.isArray(found.children) && found.children.length) {
      // 将 constantRoutes 头部保持，后接当前父节点（符合初始生成方式）
      permissionStore.setSidebarRouters((constantRoutes as any).concat([found] as any))
      appStore.toggleSideBarHide(false)
    } else {
      activeRoutes(key)
      appStore.toggleSideBarHide(false)
    }
  }
}

// A: 页面初始化或路由变化时，若已加载 routes 但 sidebarRouters 为空，自动填充并显示
function ensureSidebar() {
  if (permissionStore.routes.length && !permissionStore.sidebarRouters.length) {
    // 优先查找当前路由对应的顶层菜单
    const curTop = routers.value.find(r => r.path === route.path.split('/')[1] ? '/' + route.path.split('/')[1] : route.path)
    if (curTop && (curTop as any).children?.length) {
      permissionStore.setSidebarRouters((constantRoutes as any).concat([curTop] as any))
    } else {
      permissionStore.setSidebarRouters(permissionStore.routes as any)
    }
    appStore.toggleSideBarHide(false)
  }
}

onMounted(() => {
  ensureSidebar()
})

watch(() => route.path, () => {
  ensureSidebar()
})

function activeRoutes(key: string) {
  const norm = (s: string | undefined) => {
    if (!s) return ''
    return ('/' + s).replace(/\/+/g, '/').replace(/\/$/, '')
  }
  const target = norm(key)
  const routes: MenuItem[] = []
  if (childrenMenus.value?.length) {
    childrenMenus.value.forEach((item: MenuItem) => {
      const parent = norm(item.parentPath)
      if (target === parent || (target === '/index' && '' === item.path)) {
        routes.push(item)
      }
    })
  }
  if (routes.length > 0) {
    permissionStore.setSidebarRouters(routes as any)
    appStore.toggleSideBarHide(false)
  } else {
    // 如果暂时没匹配到且已有旧菜单，保持旧菜单，避免闪烁/清空；否则再隐藏
    if (!permissionStore.sidebarRouters.length) {
      appStore.toggleSideBarHide(true)
    } else {
      if (process.env.NODE_ENV !== 'production') console.debug('[TopNav] 暂无匹配子路由，保留现有 sidebarRouters')
    }
  }
  return routes
}

onMounted(() => {
  window.addEventListener('resize', setVisibleNumber)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', setVisibleNumber)
})

onMounted(() => {
  setVisibleNumber()
})
</script>

<style lang="scss">
.topmenu-container.el-menu--horizontal>.el-menu-item {
  float: left;
  height: 50px !important;
  line-height: 50px !important;
  color: #999093 !important;
  padding: 0 5px !important;
  margin: 0 10px !important;
}

.topmenu-container.el-menu--horizontal>.el-menu-item.is-active,
.el-menu--horizontal>.el-sub-menu.is-active .el-submenu__title {
  border-bottom: 2px solid #{'var(--theme)'} !important;
  color: #303133;
}

/* sub-menu item */
.topmenu-container.el-menu--horizontal>.el-sub-menu .el-sub-menu__title {
  float: left;
  height: 50px !important;
  line-height: 50px !important;
  color: #999093 !important;
  padding: 0 5px !important;
  margin: 0 10px !important;
}

/* 背景色隐藏 */
.topmenu-container.el-menu--horizontal>.el-menu-item:not(.is-disabled):focus,
.topmenu-container.el-menu--horizontal>.el-menu-item:not(.is-disabled):hover,
.topmenu-container.el-menu--horizontal>.el-submenu .el-submenu__title:hover {
  background-color: #ffffff;
}

/* 图标右间距 */
.topmenu-container .svg-icon {
  margin-right: 4px;
}

/* topmenu more arrow */
.topmenu-container .el-sub-menu .el-sub-menu__icon-arrow {
  position: static;
  vertical-align: middle;
  margin-left: 8px;
  margin-top: 0px;
}
</style>
