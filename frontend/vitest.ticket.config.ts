import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

// 独立的 ticket-only 配置（不与 base 合并），严格限制测试选择器
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  test: {
    include: [
      // 仅限列表页相关用例，避免引入 template.* 的 P2 用例
      'src/__tests__/ticket.list.*.test.{ts,js}',
      'src/__tests__/ticket.list.functions*.test.{ts,js}',
      'src/__tests__/ticket.list.component.functions.test.{ts,js}',
      'src/__tests__/ticket.list.callAllFinal.test.{ts,js}'
    ],
    environment: 'jsdom',
    setupFiles: ['src/__tests__/setup.ts'],
    globals: true,
    pool: 'threads',
    poolOptions: { threads: { singleThread: true, maxThreads: 1, minThreads: 1 } },
    sequence: { concurrent: false },
    coverage: {
      // 扩大统计范围到 index.vue，分阶段抬阈值（由 coverage-check.mjs 控制）
      include: [
        'src/views/business/ticket/index.util.ts',
        'src/views/business/ticket/index.vue'
      ],
      thresholds: { lines: 0, functions: 0, statements: 0, branches: 0 }
    }
  }
})
