// 基础 ESLint Flat Config
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import fs from 'fs'

// Merge auto-import generated globals if present
let autoImportGlobals = {}
try {
    if (fs.existsSync('./.eslintrc-auto-import.json')) {
        const cfg = JSON.parse(fs.readFileSync('./.eslintrc-auto-import.json', 'utf-8'))
        autoImportGlobals = cfg.globals || {}
    }
} catch {
    // silent
}

export default [
    // 忽略输出/依赖/生成产物（合并原 .eslintignore 内容）
    { ignores: ['dist', 'node_modules', 'public/icons', '**/generated/**'] },
    js.configs.recommended,
    ...pluginVue.configs['flat/essential'],
    {
        files: ['src/**/*.{js,vue}'],
        languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: { ...autoImportGlobals } },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            // 暂时关闭多词组件名与 prop 直接修改以便逐步重构
            'vue/multi-word-component-names': 'off',
            'vue/no-mutating-props': 'off'
        }
    },
    // Node 环境（构建脚本 / 配置文件）
    {
        files: ['vite.config.js', 'auto-import.config.mjs', 'fix-errors.cjs', 'eslint.config.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: { ...autoImportGlobals, process: 'readonly', __dirname: 'readonly', module: 'readonly', require: 'readonly' }
        },
        rules: {
            'no-undef': 'off'
        }
    }
]
