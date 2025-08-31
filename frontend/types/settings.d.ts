declare module '@/settings' {
    interface DefaultSettings {
        title: string
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
    }
    const value: DefaultSettings
    export default value
}

declare module '@/utils/dynamicTitle' {
    export function useDynamicTitle(): void
}
