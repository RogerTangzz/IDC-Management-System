import defaultSettings from '@/settings'
import { useDark, useToggle } from '@vueuse/core'
import { useDynamicTitle } from '@/utils/dynamicTitle'

const isDark = useDark()
const toggleDark = useToggle(isDark)

// 从默认配置解构（提供初始值）
const { sideTheme, showSettings, topNav, tagsView, tagsIcon, fixedHeader, sidebarLogo, dynamicTitle, footerVisible, footerContent } = defaultSettings

export interface SettingsState {
    title: string
    theme: string
    sideTheme: string
    showSettings: boolean
    topNav: boolean
    tagsView: boolean
    tagsIcon: boolean
    fixedHeader: boolean
    sidebarLogo: boolean
    dynamicTitle: boolean
    footerVisible: boolean
    footerContent: string
    isDark: boolean
}

type SettingKey = keyof SettingsState

const storageSetting: Partial<Record<SettingKey, any>> = JSON.parse(localStorage.getItem('layout-setting') || 'null') || {}

const useSettingsStore = defineStore('settings', {
    state: (): SettingsState => ({
        title: '',
        theme: (storageSetting.theme as string) || '#409EFF',
        sideTheme: (storageSetting.sideTheme as string) || sideTheme,
        showSettings: (storageSetting.showSettings as boolean) ?? showSettings,
        topNav: (storageSetting.topNav as boolean) ?? topNav,
        tagsView: (storageSetting.tagsView as boolean) ?? tagsView,
        tagsIcon: (storageSetting.tagsIcon as boolean) ?? tagsIcon,
        fixedHeader: (storageSetting.fixedHeader as boolean) ?? fixedHeader,
        sidebarLogo: (storageSetting.sidebarLogo as boolean) ?? sidebarLogo,
        dynamicTitle: (storageSetting.dynamicTitle as boolean) ?? dynamicTitle,
        footerVisible: (storageSetting.footerVisible as boolean) ?? footerVisible,
        footerContent: footerContent,
        isDark: isDark.value
    }),
    actions: {
        changeSetting<K extends SettingKey>({ key, value }: { key: K; value: SettingsState[K] }) {
            ; (this as unknown as SettingsState)[key] = value as SettingsState[K]
        },
        setTitle(title: string) {
            this.title = title
            useDynamicTitle()
        },
        toggleTheme() {
            this.isDark = !this.isDark
            toggleDark()
        }
    }
})

export default useSettingsStore
