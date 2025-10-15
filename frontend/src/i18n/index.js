// src/i18n/index.js
import { createI18n } from 'vue-i18n'

// 显式导入根级别的翻译文件（使用绝对路径）
import zhCNAction from '@/../locales/zh-CN/action.json'
import zhCNCommon from '@/../locales/zh-CN/common.json'
import zhCNCore from '@/../locales/zh-CN/core.json'
import zhCNSystem from '@/../locales/zh-CN/system.json'

import enUSAction from '@/../locales/en-US/action.json'
import enUSCommon from '@/../locales/en-US/common.json'
import enUSCore from '@/../locales/en-US/core.json'
import enUSSystem from '@/../locales/en-US/system.json'

// 动态导入嵌套的业务模块文件
const nestedLocaleModules = import.meta.glob('@/../locales/*/*/*.json', { eager: true })

console.log('[i18n] Nested locale files:', Object.keys(nestedLocaleModules))

// 初始化 messages 对象并手动添加根级别翻译
const messages = {
  'zh-CN': {
    action: zhCNAction,
    common: zhCNCommon,
    core: zhCNCore,
    system: zhCNSystem
  },
  'en-US': {
    action: enUSAction,
    common: enUSCommon,
    core: enUSCore,
    system: enUSSystem
  }
}

console.log('[i18n] Manually loaded root modules for zh-CN:', Object.keys(messages['zh-CN']))
console.log('[i18n] Manually loaded root modules for en-US:', Object.keys(messages['en-US']))

// 解析嵌套的业务模块文件
for (const path in nestedLocaleModules) {
  console.log('[i18n] Processing path:', path)

  // 匹配三级路径，支持多种格式:
  // - '@/../locales/zh-CN/business/ticket.json'
  // - '/locales/zh-CN/business/ticket.json'
  // - 'locales/zh-CN/business/ticket.json'
  const matched = path.match(/(?:@\/\.\.\/)?locales\/([^/]+)\/([^/]+)\/([^/]+)\.json$/)
  if (matched) {
    const locale = matched[1] // 'zh-CN' or 'en-US'
    const category = matched[2] // 'business'
    const module = matched[3] // 'ticket'

    if (!messages[locale]) {
      messages[locale] = {}
    }
    if (!messages[locale][category]) {
      messages[locale][category] = {}
    }

    const moduleContent = nestedLocaleModules[path].default || nestedLocaleModules[path]
    messages[locale][category][module] = moduleContent

    console.log(`[i18n] ✓ Loaded nested module: ${locale}.${category}.${module}`)
    console.log(`[i18n]   Keys in module:`, Object.keys(moduleContent).slice(0, 5).join(', '))
  } else {
    console.warn(`[i18n] ✗ Failed to parse path: ${path}`)
  }
}

console.log('[i18n] Final message structure:', JSON.stringify(Object.keys(messages), null, 2))
console.log('[i18n] zh-CN structure:', JSON.stringify(Object.keys(messages['zh-CN']), null, 2))
if (messages['zh-CN'] && messages['zh-CN'].business) {
  console.log('[i18n] zh-CN.business modules:', Object.keys(messages['zh-CN'].business))
}

// 从 localStorage 读取保存的语言设置
const savedLocale = localStorage.getItem('locale') || 'zh-CN'

// 标准化 locale（将 'zh' 映射到 'zh-CN'，'en' 映射到 'en-US'）
function normalizeLocale(locale) {
  if (locale === 'zh' || locale.startsWith('zh-')) return 'zh-CN'
  if (locale === 'en' || locale.startsWith('en-')) return 'en-US'
  return locale
}

const normalizedLocale = normalizeLocale(savedLocale)

// 为 'zh' 和 'en' 创建别名，指向 'zh-CN' 和 'en-US'
if (messages['zh-CN']) {
  messages['zh'] = messages['zh-CN']
}
if (messages['en-US']) {
  messages['en'] = messages['en-US']
}

// 创建i18n实例
const i18n = createI18n({
  legacy: false, // 使用Composition API模式
  locale: normalizedLocale, // 默认语言（标准化后的 locale）
  fallbackLocale: 'en-US', // 回退语言
  messages,
  globalInjection: true // 全局注入$t方法
})

console.log('[i18n] Locale:', normalizedLocale)
console.log('[i18n] Available locales:', Object.keys(messages))

export default i18n
