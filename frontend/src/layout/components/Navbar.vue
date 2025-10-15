<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb v-if="!settingsStore.topNav" id="breadcrumb-container" class="breadcrumb-container" />
    <top-nav v-if="settingsStore.topNav" id="topmenu-container" class="topmenu-container" />

    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <header-search id="header-search" class="right-menu-item" />

        <el-popover placement="bottom" :width="360" trigger="click" @show="loadTopMessages">
          <template #reference>
            <div class="right-menu-item hover-effect">
              <el-badge :value="unread" :max="99" class="item">
                <svg-icon icon-class="bell" />
              </el-badge>
            </div>
          </template>
          <div class="msg-pop">
            <div class="msg-pop-header">
              <span>{{ t('core.navbar.message.unread') }}</span>
              <div>
                <el-button text type="primary" @click="goMessage">{{ t('core.navbar.message.more') }}</el-button>
                <el-button text type="primary" @click="readAllQuick" v-if="unread>0">{{ t('core.navbar.message.markAllRead') }}</el-button>
              </div>
            </div>
            <el-scrollbar height="240px">
              <el-skeleton v-if="msgLoading" :rows="3" animated />
              <div v-else>
                <div v-if="topMessages.length===0" class="msg-empty">{{ t('core.navbar.message.noUnread') }}</div>
                <div v-for="m in topMessages" :key="m.msgId" class="msg-item">
                  <div class="msg-title">{{ m.title }}</div>
                  <div class="msg-content">{{ m.content }}</div>
                  <div class="msg-meta">{{ parseTime(m.createTime) }}</div>
                  <el-button text type="primary" size="small" @click="readQuick(m.msgId)">{{ t('core.navbar.message.markRead') }}</el-button>
                </div>
              </div>
            </el-scrollbar>
          </div>
        </el-popover>

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip :content="t('core.navbar.tooltip.theme')" effect="dark" placement="bottom">
          <div class="right-menu-item hover-effect theme-switch-wrapper" @click="toggleTheme">
            <svg-icon v-if="settingsStore.isDark" icon-class="sunny" />
            <svg-icon v-if="!settingsStore.isDark" icon-class="moon" />
          </div>
        </el-tooltip>

        <el-tooltip :content="t('core.navbar.tooltip.size')" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

        <el-dropdown class="right-menu-item hover-effect" trigger="hover" @command="handleLocaleChange">
          <div style="display: flex; align-items: center;">
            <svg-icon icon-class="language" style="font-size: 20px;" />
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="zh-CN" :disabled="currentLocale === 'zh-CN'">简体中文</el-dropdown-item>
              <el-dropdown-item command="en-US" :disabled="currentLocale === 'en-US'">English</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>

      <el-dropdown @command="handleCommand" class="avatar-container right-menu-item hover-effect" trigger="hover">
        <div class="avatar-wrapper">
          <img :src="userStore.avatar" class="user-avatar" />
          <span class="user-nickname"> {{ userStore.nickName }} </span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <router-link to="/user/profile">
              <el-dropdown-item>{{ t('core.navbar.user.profile') }}</el-dropdown-item>
            </router-link>
            <el-dropdown-item command="setLayout" v-if="settingsStore.showSettings">
                <span>{{ t('core.navbar.user.layout') }}</span>
              </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <span>{{ t('core.navbar.user.logout') }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { getUnreadMessages, markAllRead, markRead } from '@/api/business/message'
import { parseTime } from '@/utils/ruoyi'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Breadcrumb from '@/components/Breadcrumb'
import TopNav from '@/components/TopNav'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import HeaderSearch from '@/components/HeaderSearch'
import useAppStore from '@/store/modules/app'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'

const appStore = useAppStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const router = useRouter()
const { locale, t } = useI18n()
const currentLocale = ref(locale.value)
const unread = ref(0)
const topMessages = ref([])
const msgLoading = ref(false)
let timer = null

function toggleSideBar() {
  appStore.toggleSideBar()
}

function handleCommand(command) {
  switch (command) {
    case "setLayout":
      setLayout()
      break
    case "logout":
      logout()
      break
    default:
      break
  }
}

function logout() {
  ElMessageBox.confirm(t('core.login.confirm.logout'), t('core.login.confirm.logoutTitle'), {
    confirmButtonText: t('core.navbar.confirm.ok'),
    cancelButtonText: t('core.navbar.confirm.cancel'),
    type: 'warning'
  }).then(() => {
    userStore.logOut().then(() => {
      location.href = '/index'
    })
  }).catch(() => { })
}

const emits = defineEmits(['setLayout'])
function setLayout() {
  emits('setLayout')
}

function toggleTheme() {
  settingsStore.toggleTheme()
}

function handleLocaleChange(lang) {
  locale.value = lang
  currentLocale.value = lang
  localStorage.setItem('locale', lang)
  location.reload()
}

function goMessage(){
  router.push('/business/message')
}

async function refreshUnread(){
  try { const r = await request({ url: '/business/message/countUnread', method:'get' }); unread.value = r.data || 0 } catch(e){ /* ignore */ }
}

async function loadTopMessages(){
  msgLoading.value = true
  try {
    const res = await getUnreadMessages({ pageNum:1, pageSize:5 })
    topMessages.value = res.rows || res.data || []
  } finally { msgLoading.value = false }
}

async function readAllQuick(){ await markAllRead(); await refreshUnread(); await loadTopMessages() }
async function readQuick(id){ await markRead(id); await refreshUnread(); await loadTopMessages() }

onMounted(()=>{
  refreshUnread();
  timer = setInterval(refreshUnread, 60000)
})
onBeforeUnmount(()=>{ if (timer) clearInterval(timer) })
import { onMounted, onBeforeUnmount, ref } from 'vue'
</script>

<style lang='scss' scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: var(--navbar-bg);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }

      &.theme-switch-wrapper {
        display: flex;
        align-items: center;

        svg {
          transition: transform 0.3s;
          
          &:hover {
            transform: scale(1.15);
          }
        }
      }
    }

    .avatar-container {
      margin-right: 0px;
      padding-right: 0px;

      .avatar-wrapper {
        margin-top: 10px;
        right: 8px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 30px;
          height: 30px;
          margin-right: 8px;
          border-radius: 50%;
        }

        .user-nickname{
          position: relative;
          left: 0px;
          bottom: 10px;
          font-size: 14px;
          font-weight: bold;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
