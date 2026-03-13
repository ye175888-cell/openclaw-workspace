# ContextRecall v1.0.0 发布说明

🧠 智能记忆系统 - 解决 OpenClaw 会话上下文丢失问题

## ✨ 核心特性

### 自动会话管理
- 自动记录会话消息
- 会话结束自动生成摘要
- 智能提取待办任务
- 启动时显示任务提醒

### 智能检索
- 分层检索策略（省 99.7% token）
- 中文分词支持
- 自然语言查询
- 按标签筛选

### 记忆管理
- 分层存储（日/周/月）
- 自动归档压缩
- 记忆合并去重
- 用户评分反馈

### 导入导出
- JSON 格式（完整备份）
- Markdown 格式（便于阅读）
- 可视化时间线网页

## 🚀 快速开始

```bash
# 安装
cd /mnt/skills
tar -xzf context-recall-v1.0.0.tar.gz
bash context-recall/scripts/post-install.sh

# 使用
recall init --query="你好"
recall search "我们讨论过的内容"
recall remind
recall viz
```

## 📚 文档

- [使用指南](docs/usage-zh.md)
- [架构设计](docs/architecture-zh.md)
- [SKILL.md](SKILL.md)

## 🛠️ 17 个命令

| 命令 | 说明 |
|------|------|
| `recall` | 统一入口 |
| `recall init` | 初始化会话 |
| `recall search` | 关键词检索 |
| `recall ask` | 自然语言查询 |
| `recall capture` | 捕获信息 |
| `recall tasks` | 列出待办 |
| `recall extract` | 提取待办 |
| `recall remind` | 任务提醒 |
| `recall export/import` | 导入导出 |
| `recall tags` | 标签管理 |
| `recall viz` | 可视化 |
| `recall archive` | 归档 |
| `recall merge` | 记忆合并 |
| `recall rate` | 记忆评分 |

## 🔒 隐私安全

- 纯本地存储
- 零外部 API
- 用户完全控制

## 📦 安装包

- `context-recall-v1.0.0.tar.gz` (31KB)

## 📝 更新日志

### v1.0.0 (2026-03-13)
- 初始版本
- 完整功能集

## 🤝 贡献

欢迎提交 Issue 和 PR！

---

**许可证**: MIT
