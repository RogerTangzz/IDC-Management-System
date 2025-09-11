<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.path">
        <span v-if="item.redirect === 'noRedirect' || index == levelList.length - 1" class="no-redirect">{{
          item.meta.title }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script lang="ts" setup>
import usePermissionStore from '@/store/modules/permission'

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()
// 面包屑每级路由项类型（简化）
interface BreadcrumbMeta { title: string; breadcrumb?: boolean }
interface BreadcrumbRouteLike { path: string; name?: string; redirect?: string; meta: BreadcrumbMeta; children?: BreadcrumbRouteLike[] }
const levelList = ref<BreadcrumbRouteLike[]>([])

function getBreadcrumb(): void {
  let matched: BreadcrumbRouteLike[] = []
  const pathNum = findPathNum(route.path)
  if (pathNum > 2) {
    const reg = /\/\w+/gi
    const raw = route.path.match(reg) || []
    const pathList = raw.map((seg, idx) => (idx !== 0 ? seg.slice(1) : seg))
    getMatched(pathList, permissionStore.defaultRoutes as any, matched)
  } else {
    matched = (route.matched as any as BreadcrumbRouteLike[]).filter(r => r.meta && r.meta.title)
  }
  if (!isDashboard(matched[0])) {
    matched = [{ path: '/index', meta: { title: '首页' } } as BreadcrumbRouteLike].concat(matched)
  }
  levelList.value = matched.filter(r => r.meta && r.meta.title && r.meta.breadcrumb !== false)
}
function findPathNum(str: string, char = '/'): number {
  let index = str.indexOf(char)
  let num = 0
  while (index !== -1) {
    num++
    index = str.indexOf(char, index + 1)
  }
  return num
}
function getMatched(pathList: string[], routeList: BreadcrumbRouteLike[], matched: BreadcrumbRouteLike[]): void {
  if (!pathList.length) return
  const first = pathList[0]
  const data = routeList.find(item => item.path === first || (item.name || '').toLowerCase() === first)
  if (data) {
    matched.push(data)
    if (data.children && pathList.length > 1) {
      pathList.shift()
      getMatched(pathList, data.children, matched)
    }
  }
}
function isDashboard(routeLike: BreadcrumbRouteLike | undefined): boolean {
  const name = routeLike && routeLike.name
  return !!name && name.trim() === 'Index'
}
function handleLink(item: BreadcrumbRouteLike): void {
  const { redirect, path } = item as any
  if (redirect) {
    router.push(redirect)
    return
  }
  router.push(path)
}

watchEffect(() => {
  // if you go to the redirect page, do not update the breadcrumbs
  if (route.path.startsWith('/redirect/')) {
    return
  }
  getBreadcrumb()
})
getBreadcrumb()
</script>

<style lang='scss' scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>