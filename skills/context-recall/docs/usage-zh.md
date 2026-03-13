# ContextRecall 使用指南

## 目录

1. [基础使用](#基础使用)
2. [会话管理](#会话管理)
3. [记忆检索](#记忆检索)
4. [待办管理](#待办管理)
5. [标签系统](#标签系统)
6. [导入导出](#导入导出)
7. [可视化](#可视化)
8. [故障排除](#故障排除)

---

## 基础使用

### 启动会话

```bash
# 方式1：使用统一入口
recall init --query="用户的第一条消息"

# 方式2：使用完整命令
node /mnt/skills/context-recall/bin/recall-init --query="..."
```

输出包含：
- 今日记忆
- 相关历史记忆
- 即将到期的待办

### 结束会话

```bash
# 自动生成摘要并保存
recall end --log=/path/to/session-log.json
```

---

## 会话管理

### 自动记录（推荐）

在 AGENTS.md 中配置后，以下自动执行：

```bash
# 会话启动
source /mnt/skills/context-recall/hooks/session-hook.sh
recall_session_start "$USER_FIRST_MESSAGE"

# 记录消息
recall_log_user "$用户消息"
recall_log_assistant "$助手回复"

# 会话结束
recall_session_end
```

### 手动记录

```bash
# 记录单条消息
recall log user "用户说的话"
recall log assistant "助手的回复"
```

---

## 记忆检索

### 基本搜索

```bash
# 搜索关键词
recall search "记忆系统"

# 搜索结果
# 1. [2026-03-13] 相关度: 85%
#    摘要: 今天我们讨论记忆系统的设计...
```

### 高级搜索

```bash
# 按时间范围搜索（最近7天）
recall search "项目" --days=7

# 限制结果数量
recall search "API" --limit=3
```

---

## 待办管理

### 自动提取

系统会自动从对话中提取：

| 类型 | 示例 | 提取结果 |
|------|------|---------|
| 显式 | `待办：完成文档` | ✅ 完成文档 |
| 承诺 | `明天要 review PR` | ✅ review PR (截止: 明天) |
| 疑问 | `是否需要测试？` | ⚠️ 考虑: 是否需要测试 |

### 手动管理

```bash
# 列出待办
recall tasks

# 提取待办（从会话日志）
recall extract --log=session.json

# 查看即将到期
recall extract upcoming

# 标记完成
recall extract done --id=task_xxx
```

### 任务提醒

```bash
# 显示提醒
recall remind

# 输出示例：
# ⏰ 即将到期 (2):
#   1. [今天] review PR (2026-03-13)
#   2. [明天] 完成文档 (2026-03-14)
```

---

## 标签系统

### 自动标签

系统会自动为记忆打上以下标签：

- **工作**：项目、代码、会议、PR
- **学习**：学习、研究、教程、文档
- **生活**：购物、吃饭、旅行、健康
- **决策**：决定、选择、方案
- **问题**：bug、错误、修复
- **想法**：想法、灵感、创意

### 手动管理

```bash
# 自动为所有记忆打标签
recall tags auto

# 按标签搜索
recall tags search 工作

# 查看标签统计
recall tags stats

# 热门标签
recall tags top
```

---

## 导入导出

### 导出

```bash
# 导出为 JSON
recall export json backup-2026-03-13.json

# 导出为 Markdown（便于阅读）
recall export markdown backup-2026-03-13.md
```

导出内容包含：
- 所有记忆
- 待办任务
- 偏好设置

### 导入

```bash
# 从 JSON 导入
recall import backup-2026-03-13.json

# 从 Markdown 导入
recall import backup-2026-03-13.md
```

---

## 可视化

### 生成时间线

```bash
recall viz

# 输出：memory/visualization/timeline.html
```

在浏览器中打开查看美观的记忆时间线。

---

## 故障排除

### 问题1：搜索无结果

**原因**：索引未生成

**解决**：
```bash
# 手动触发归档生成索引
recall archive
```

### 问题2：钩子不生效

**原因**：jq 未安装或语法错误

**解决**：
```bash
# 检查 jq
which jq

# 测试钩子
source /mnt/skills/context-recall/hooks/session-hook.sh
echo "test" | recall_log_user
cat /tmp/context-recall-session-*.json
```

### 问题3：定时任务不运行

**原因**：cron 未配置

**解决**：
```bash
# 检查 cron
crontab -l | grep context-recall

# 重新配置
bash /mnt/skills/context-recall/scripts/post-install.sh
```

### 问题4：中文搜索不准确

**原因**：分词问题

**解决**：已内置中文分词，如仍有问题，尝试：
```bash
# 使用更简单的关键词
recall search "记忆"  # 而不是 "记忆系统的设计"
```

---

## 最佳实践

1. **每天查看提醒**：启动时自动显示，养成查看习惯
2. **定期归档**：已配置自动归档，无需手动操作
3. **及时标记完成**：完成任务后标记，保持待办清洁
4. **使用标签**：搜索标签比全文搜索更快
5. **定期备份**：每月导出一次备份

---

## 高级配置

编辑 `memory/context-recall/config.yaml`：

```yaml
retrieval:
  max_results: 10              # 增加返回结果
  similarity_threshold: 0.5    # 降低相似度阈值

storage:
  compress_after_days: 3       # 3天后压缩
  archive_after_days: 14       # 14天后归档
```

---

## 获取帮助

```bash
# 查看命令帮助
recall

# 查看具体命令帮助
recall search --help
```
