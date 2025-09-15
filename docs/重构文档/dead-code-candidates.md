# 可疑死代码/冗余路径清单（候选）

目的：列出短期内未发现引用、功能已被替代或冗余的实现，供 GA 观察期后清理。所有条目默认“最低侵入”，暂不删除，仅加注释标记与文档记录。

候选列表：

- frontend/src/views/business/ticket/components/AssignDialog.vue
  - 现状：未被 import；Ticket 列表页（index.vue）与详情页（detail.vue）均内嵌了指派对话框。
  - 建议：若 1–2 周内无引用恢复，则删除该组件。

- frontend/src/views/business/ticket/components/TicketForm.vue
  - 现状：未被 import；模板页（template.vue）与工单表单（form.vue）各自实现，未复用该组件。
  - 建议：若 1–2 周内无引用恢复，则删除该组件。

注意：
- 删除前请全局检索确认无新引用；
- 若未来需要统一表单，可考虑将现有表单实现抽象为复用组件后再删除旧件；
- 删除应附带 changelog 与测试验证（基础渲染/指派流程仍可用）。

