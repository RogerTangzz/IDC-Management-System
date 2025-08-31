# TypeScript 渐进式迁移说明

基线：当前 ESLint 0 error / 0 warning，已启用 tsconfig 严格模式，allowJs 允许 JS 与 TS 混用。

## 目标阶段
1. 核心工具与业务算法 (utils/business/*) TS 化 ✅ (inspectionAnomaly / maintenanceReminder)
2. 新增全局通用类型 (src/types/global.d.ts, ruoyi.d.ts) ✅
3. 渐进迁移字典、权限、自定义指令与 store；为 JS 文件添加 JSDoc 以提升推断
4. 组件按“基础无复杂泛型”→“表单/表格”→“路由页面”顺序转换 <script lang="ts">
5. 移除 allowJs=true（最终阶段）

## 现有配置要点
- strict: true 强约束
- skipLibCheck: true 加快编译
- incremental: true 增量编译
- paths @/* 指向 src/*
- 全局分页/响应类型 PageResult / ApiResult 可扩展

## 建议工作流
1. 每次迁移：重命名 .vue 内 <script> → <script lang="ts">
2. 为新增/不确定字段补充临时 any，然后再细化
3. 通过 `npm run type-check` 保持无错误；遇到第三方缺失声明可添加 *.d.ts stub
4. 修改完成后运行 `npm run lint` 确认无新增告警

## 命名与约定
- 内部暂未使用命名空间，统一使用 interface + type
- 响应体字段遵循后端 code/msg/data/rows/total 既有格式
- 可选字段使用 `?`，禁止滥用 `!` 非空断言

## 后续可拓展
- 引入 Zod/Valibot 做运行时校验并生成 TS 类型
- 依据后端 swagger/openapi 自动生成接口类型

（此文档会随迁移进度更新）
