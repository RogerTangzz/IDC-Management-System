import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    include: [
      'src/__tests__/ticket.template.*.test.{ts,js}'
    ],
    environment: 'jsdom',
    setupFiles: ['src/__tests__/setup.ts'],
    globals: true,
    pool: 'threads',
    poolOptions: { threads: { singleThread: true, maxThreads: 1, minThreads: 1 } },
    sequence: { concurrent: false },
    coverage: {
      include: [
        'src/views/business/ticket/template.vue',
        'src/views/business/ticket/template.util.ts'
      ],
      thresholds: { lines: 0, functions: 0, statements: 0, branches: 0 }
    }
  }
})
