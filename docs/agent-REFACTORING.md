# Agent 重构补充

## 角色与职责
- 解释器（Adapter）：翻译视图需求为稳定的领域调用
- 调度器（Domain）：业务编排、规则与校验
- 执行器（Service）：薄封装 API/IO

## 工作流
- 在 `USE_NEW_TICKET` 打开时，优先走 Adapter→Domain→Service
- 关闭时回退到旧 API（import 动态加载，减少耦合）

## 测试与回滚
- 提供开关的 on/off 用例；在 CI 中验证两条路径都可用
- 出问题先关开关，再分析修复

