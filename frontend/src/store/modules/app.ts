import Cookies from 'js-cookie'

export interface SidebarState {
    opened: boolean
    withoutAnimation: boolean
    hide: boolean
}
export type DeviceType = 'desktop' | 'mobile'

export interface AppState {
    sidebar: SidebarState
    device: DeviceType
    size: string
}

const useAppStore = defineStore('app', {
    state: (): AppState => ({
        sidebar: {
            opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus')! : true,
            withoutAnimation: false,
            hide: false
        },
        device: 'desktop',
        size: Cookies.get('size') || 'default'
    }),
    actions: {
        toggleSideBar(withoutAnimation?: boolean) {
            if (this.sidebar.hide) return false
            this.sidebar.opened = !this.sidebar.opened
            this.sidebar.withoutAnimation = !!withoutAnimation
            Cookies.set('sidebarStatus', this.sidebar.opened ? '1' : '0')
        },
        closeSideBar({ withoutAnimation }: { withoutAnimation?: boolean }) {
            Cookies.set('sidebarStatus', '0')
            this.sidebar.opened = false
            this.sidebar.withoutAnimation = !!withoutAnimation
        },
        toggleDevice(device: DeviceType) {
            this.device = device
        },
        setSize(size: string) {
            this.size = size
            Cookies.set('size', size)
        },
        toggleSideBarHide(status: boolean) {
            this.sidebar.hide = status
        }
    }
})

export default useAppStore
