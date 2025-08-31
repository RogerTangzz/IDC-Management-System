## IDC-Management-System

前后端分离的 IDC 运维管理系统（基于 RuoYi 3.9.0 + Vue3/Vite/Element Plus + TypeScript 渐进迁移中）。

### 目录结构
```
backend/   # RuoYi 后端（Spring Boot 2.5.x, JDK8）
frontend/  # Vue3 + Vite 前端
```

### 快速开始
Backend:
1. 导入数据库：执行 `sql/` 目录下初始化脚本（顺序：create_tables.sql → import.sql → 业务补充）。
2. 编译运行：`cd backend && mvn clean package -DskipTests`，运行 `ruoyi-admin/target/ruoyi-admin.jar`。
3. 默认配置：端口 8080（按需修改 `application.yml`）。

Frontend:
1. `cd frontend`
2. 安装依赖：`npm install`
3. 开发运行：`npm run dev`
4. 构建：`npm run build:prod`（产物生成 `dist/`）

### 环境变量（前端）
| 变量 | 说明 | 示例 |
|------|------|------|
| VITE_APP_BASE_API | 后端 API 基础路径 | /dev-api / /prod-api |
| VITE_ENABLE_MOCK  | 是否启用内置 Mock | development=true / production=false |

### Mock 策略
开发环境可使用内置 Mock（位于 `src/mock/`）。发布前端时应设置 `VITE_ENABLE_MOCK=false`（生产 `.env.production` 已配置）。

### TypeScript 迁移进度
| 模块 | 状态 |
|------|------|
| 请求封装(utils/request) | 已 TS 化 |
| 权限/用户 store | 已 TS 化 |
| 路由模块 | 部分 TS 化 |
| 业务 API | 待整体迁移 |
| 视图组件 | 逐步进行 |

详见 `CLAUDE.md v2.3` 与 `CLAUDE-IDC.md v2.2`。

### 测试
使用 Vitest：`npm test`。当前基线覆盖：权限过滤、动态视图加载。后续将新增登录/认证与业务服务测试。

### 发布前检查清单
1. 前端：`npm run type-check && npm run build:prod` 通过。
2. 后端：`mvn clean package` 通过且无快照依赖。
3. 环境变量：生产构建 `VITE_ENABLE_MOCK=false`。
4. 移除调试暴露：`window.__lastLoginResponse` / `__lastLoginError`（可在正式上线前清理）。
5. 确认无敏感信息（密码 / 内网地址）写入仓库。
6. 运行端到端冒烟：登录 → 获取菜单 → 路由切换。

### 许可证
后端目录内包含原始 LICENSE（保留 RuoYi 原版权说明）。

### 后续路线
- 统一后端登录 / 用户信息响应结构（统一 data 包裹）
- 引入前端 CI（lint + type-check + test + build）
- 抽离 api/ 领域类型至 `src/types/`
- 增加覆盖率门禁与差异文件校验

---
如需更多规范，参阅：`CLAUDE.md` 与 `CLAUDE-IDC.md`。
