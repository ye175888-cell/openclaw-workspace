# ContextRecall 智能记忆系统

🧠 解决 OpenClaw 会话上下文丢失问题

## 功能特性

- **自动捕获**：会话结束时自动生成摘要
- **智能检索**：基于查询召回相关记忆，零 token 浪费
- **分层存储**：日/周/月三级存储，自动归档
- **待办提取**：自动从对话中提取任务和承诺
- **任务提醒**：到期前自动提醒
- **导入导出**：支持 JSON/Markdown 格式备份
- **智能标签**：自动分类记忆
- **可视化**：生成美观的时间线网页
- **零依赖**：纯本地运行，隐私安全

## 快速安装

```bash
cd /mnt/skills
tar -xzf context-recall-v1.0.0.tar.gz
bash context-recall/scripts/post-install.sh
```

## 快速开始

```bash
# 初始化会话
recall init --query="你好"

# 搜索记忆
recall search "我们讨论过的内容"

# 查看待办提醒
recall remind

# 生成可视化时间线
recall viz
```

## 完整命令列表

| 命令 | 说明 |
|------|------|
| `recall init` | 初始化会话，加载相关记忆 |
| `recall end` | 结束会话，生成摘要 |
| `recall search <查询>` | 搜索记忆 |
| `recall capture` | 捕获决策/偏好/任务 |
| `recall log` | 记录单条消息 |
| `recall tasks` | 列出待办 |
| `recall extract` | 智能提取待办 |
| `recall remind` | 显示任务提醒 |
| `recall export` | 导出记忆 |
| `recall import` | 导入记忆 |
| `recall tags` | 标签管理 |
| `recall viz` | 生成可视化 |
| `recall archive` | 归档旧记忆 |

## 自动功能

安装后自动启用：

1. **会话记录**：自动记录所有对话
2. **摘要生成**：会话结束自动生成摘要
3. **待办提取**：自动识别任务和承诺
4. **定时归档**：每天凌晨自动归档旧记忆
5. **任务提醒**：启动时显示即将到期任务

## 文档

- [使用指南](SKILL.md)
- [English README](README.md)

## 贡献

欢迎提交 Issue 和 PR！

## 许可证

MIT
