// Auto Import configuration for unplugin-auto-import
export default {
    dts: 'src/auto-imports.d.ts',
    eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true
    },
    imports: [
        'vue',
        'vue-router',
        {
            pinia: [
                'defineStore',
                'storeToRefs'
            ]
        }
    ],
    dirs: [
        // auto import composables if needed later e.g. 'src/composables'
    ]
}
