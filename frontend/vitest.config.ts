import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@/store/modules/permission': path.resolve(__dirname, 'src/store/modules/permission.ts')
        }
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['src/__tests__/**/*.test.{ts,js}'],
        setupFiles: ['src/__tests__/setup.ts'],
        mockReset: true,
        restoreMocks: true
    }
})