import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  test: {
    include: [
      'src/__tests__/ticket.domain.*.test.{ts,js}'
    ],
    environment: 'node',
    globals: true,
    pool: 'threads',
    poolOptions: { threads: { singleThread: true, maxThreads: 1, minThreads: 1 } },
    sequence: { concurrent: false },
    coverage: { enabled: false }
  }
})

