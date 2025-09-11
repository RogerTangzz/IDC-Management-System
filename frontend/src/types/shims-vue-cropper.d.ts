import type { DefineComponent } from 'vue'

declare module 'vue-cropper' {
    const component: DefineComponent<Record<string, any>, Record<string, any>, any>
    export default component
}

declare module 'vue-cropper/lib/vue-cropper.vue' {
    const component: DefineComponent<Record<string, any>, Record<string, any>, any>
    export default component
}
