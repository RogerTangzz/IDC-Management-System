import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    include: [
      'src/__tests__/telemetry.health.test.{ts,js}'
    ],
    environment: 'jsdom',
    setupFiles: ['src/__tests__/setup.ts'],
    globals: true,
    pool: 'threads',
    poolOptions: { threads: { singleThread: true, maxThreads: 1, minThreads: 1 } },
    sequence: { concurrent: false },
    coverage: { enabled: false }
  }
})

