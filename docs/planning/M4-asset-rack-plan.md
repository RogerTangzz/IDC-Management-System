# M4「资产机柜」开发计划

## 目标与范围

**目标**：补建"资产机柜"能力，完成标准 CRUD + 导出功能

**核心原则**：
- ✅ 与 M2/M3 口径统一（筛选/排序/导出/i18n）
- ✅ 字典加载失败有可见回退
- ✅ 复用现有组件和工具函数
- ✅ 遵循 RuoYi 架构规范

## 数据模型

### 表名
`biz_asset_rack`

### 核心字段
- **主键**: `rack_id` (BIGINT, AUTO_INCREMENT)
- **唯一标识**: `rack_no` (VARCHAR(50), UNIQUE) - 机柜编号
- **基本信息**: `rack_name` (VARCHAR(100)) - 机柜名称
- **位置信息**:
  - `floor` (VARCHAR(20)) - 楼层（字典：idc_floor）
  - `room` (VARCHAR(50)) - 房间/区域
  - `location` (VARCHAR(200)) - 具体位置
- **容量规格**:
  - `u_count` (INT, DEFAULT 42) - 总U数
  - `u_used` (INT, DEFAULT 0) - 已用U数
  - `power_capacity` (DECIMAL(10,2)) - 额定功率(kW)
  - `network_ports` (INT, DEFAULT 0) - 网络端口数
- **状态**: `status` (VARCHAR(20)) - active/disabled/retired
- **附加**: `attachments` (TEXT), `remark` (VARCHAR(500))
- **审计**: `del_flag`, `create_by`, `create_time`, `update_by`, `update_time`

### 索引设计
- PRIMARY KEY: `rack_id`
- UNIQUE KEY: `uk_rack_no` (rack_no)
- INDEX: `idx_floor`, `idx_room`, `idx_status`, `idx_create_time`

## API 契约

| 端点 | 方法 | 说明 | 权限 |
|------|------|------|------|
| `/business/asset/rack/list` | GET | 查询列表（分页/筛选/排序） | `business:assetRack:list` |
| `/business/asset/rack/{id}` | GET | 查询详情 | `business:assetRack:query` |
| `/business/asset/rack` | POST | 新增机柜 | `business:assetRack:add` |
| `/business/asset/rack` | PUT | 修改机柜 | `business:assetRack:edit` |
| `/business/asset/rack/{id}` | DELETE | 删除机柜 | `business:assetRack:remove` |
| `/business/asset/rack/export` | POST | 导出Excel | `business:assetRack:export` |

### 排序白名单
`rackNo`, `rackName`, `floor`, `room`, `status`, `createTime`, `updateTime`, `uCount`, `uUsed`

## 阶段划分

### Phase 1: 数据层 (D1 上午)
- [x] 创建规划文档
- [ ] 数据库表设计与迁移脚本
- [ ] 后端 Domain/Mapper/Service
- [ ] 基础 CRUD API

### Phase 2: 控制器与安全 (D1 下午)
- [ ] Controller 实现（白名单排序）
- [ ] 权限点定义
- [ ] 导出功能
- [ ] 后端联调测试

### Phase 3: 前端基础 (D2 上午)
- [ ] API 封装
- [ ] 路由与菜单配置
- [ ] i18n 语言包
- [ ] 列表页框架

### Phase 4: 前端交互 (D2 下午)
- [ ] 列表页完整功能（筛选/排序/分页）
- [ ] 表单页（新增/编辑）
- [ ] 字典兜底处理
- [ ] 导出集成

### Phase 5: 集成测试 (D3)
- [ ] 全链路功能测试
- [ ] 边界条件验证
- [ ] Windows 环境健康检查
- [ ] 文档完善

## 数据校验规则

| 字段 | 约束 | 校验规则 |
|------|------|---------|
| rack_no | 必填、唯一 | 长度 3-50，建议格式 `RACK-{FLOOR}-{序号}` |
| rack_name | 必填 | 长度 2-100 |
| floor | 必填 | 字典值 `idc_floor` |
| u_count | 可选，默认 42 | 范围 1-100 |
| u_used | 可选，默认 0 | 0 ≤ u_used ≤ u_count |
| power_capacity | 可选 | ≥ 0，小数点后 2 位 |
| network_ports | 可选，默认 0 | ≥ 0 |
| status | 必填，默认 active | 枚举值 `active/disabled/retired` |

## 技术选型

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 前端表单形式 | 抽屉 (Drawer) | 与 M2 Ticket 保持一致 |
| 排序实现 | 服务端排序 + 白名单 | 安全且与 M3 口径统一 |
| 字典处理 | `useDict` + 失败回退 | 已验证有效 |
| 导出参数 | 复用列表查询 payload | 避免不一致 |
| 权限模式 | 无 mineOnly | 机柜属于公共资源 |

## DoD (Definition of Done)

### 后端
- [ ] 所有 API 返回正确状态码
- [ ] 白名单排序生效
- [ ] 编号唯一性校验
- [ ] 导出 Excel 正常

### 前端
- [ ] 列表/表单功能完整
- [ ] 字典失败回退
- [ ] 中英文完整支持
- [ ] 权限按钮可见性正确

## 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| SQL 注入 | 白名单 + 参数化查询 |
| 字典加载失败 | fallback 参数 + 原值显示 |
| 编号重复冲突 | 唯一索引 + 友好提示 |
| 导出参数不一致 | 强制复用 buildQueryPayload |

## 时间安排

- **D1**: 后端开发（本日）
- **D2**: 前端开发
- **D3**: 集成测试与文档

---

**版本**: v1.0
**创建日期**: 2025-01-17
**作者**: Claude AI Assistant
