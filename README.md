# IDC-Management-System

DC/IDC 运维管理系统（前端 RuoYi-Vue3 + 后端 RuoYi-Boot）。聚焦工单、巡检、维保、资产等模块，支持 SLA、报表下钻与数据权限。

## 快速开始

- 前端
  - 进入 `frontend/`
  - 安装依赖：`npm i`
  - 开发：`npm run dev`
  - 测试：`npm test` / `npm run test:run`
  - 构建：`npm run build:prod`

- 后端
  - 进入 `backend/`
  - 启动：`mvn spring-boot:run`
  - 打包：`mvn clean package`

## 关键文档

- 业务与前端规范
  - `docs/agent.md`（Agent/前端协作规范与环境配置）
  - `docs/CLAUDE.md`（主规范）
  - `docs/CLAUDE-IDC.md`（IDC 扩展规范）
  - `docs/CODE-QUALITY.md`（代码质量与测试指南）
  - `docs/DC系统开发功能与业务逻辑设计规范 V2.0.md`（业务规格）

- 接口契约（后端）
  - 工单导出：`docs/backend-contracts/ticket-export.md`

## 配置要点

- 前端 `.env.*`
  - `VITE_APP_BASE_API`：后端网关前缀（开发 `/dev-api`、生产 `/prod-api`）
  - `VITE_API_MINE_ONLY_PARAM`：后端“仅本人数据”参数名（默认 `mineOnly`；若后端使用别名如 `selfOnly`，设置后前端灰度期会双写）

## 功能摘录

- SLA 报表下钻：饼图点击下钻到工单列表（`mode=neardue|overdue`）
- 工单导出：携带筛选/时间/排序/下钻与数据权限参数导出 xlsx
- 数据权限：非管理员自动注入“仅本人数据”参数（支持别名配置与双写灰度）
