---
name: context-recall
description: 智能记忆系统，自动捕获会话摘要、基于查询检索相关上下文、管理分层记忆存储（日/周/月）。零外部依赖，本地优先设计。
triggers:
  - session start
  - session end
  - "记住"
  - "我们讨论过什么"
  - "查找记忆"
---

# ContextRecall 智能记忆系统

解决 OpenClaw 会话上下文丢失问题。

## 核心功能

| 功能 | 命令 | 说明 |
|------|------|------|
| 会话初始化 | `recall init` | 启动时加载相关记忆 |
| 实时捕获 | `recall capture` | 保存重要决策/偏好 |
| 会话摘要 | `recall end` | 结束时生成摘要 |
| 记忆检索 | `recall search <查询>` | 基于查询召回记忆 |
| 待办提取 | `recall extract` | 扫描待办事项 |
| 任务提醒 | `recall remind` | 显示即将到期任务 |
| 导入导出 | `recall export/import` | 备份/恢复记忆 |
| 智能标签 | `recall tags` | 自动分类记忆 |
| 可视化 | `recall viz` | 生成时间线网页 |
| 归档整理 | `recall archive` | 压缩旧记忆 |

## 快速开始

```bash
# 初始化会话（自动加载今日记忆和相关历史）
recall init --query="用户的第一条消息"

# 搜索记忆
recall search "我们上周讨论的内容"

# 查看待办提醒
recall remind

# 生成可视化时间线
recall viz
```

## 存储结构

```
memory/
├── daily/                    # 每日摘要
│   └── 2026-03-13.md
├── weekly/                   # 周日聚合
│   └── 2026-W11.md
├── monthly/                  # 月末聚合
│   └── 2026-03.md
├── ontology/                 # 结构化知识
│   ├── tasks.json            # 待办任务
│   ├── tags.json             # 标签索引
│   └── preferences.json      # 偏好设置
├── session-logs/             # 会话日志
├── visualization/            # 可视化输出
│   └── timeline.html
└── index.json                # 记忆索引
```

## 检索策略（分层）

1. **元数据过滤**（零 token）
   - 时间范围、标签、关键词匹配
   
2. **向量相似度**（本地计算）
   - TF-IDF / 中文分词
   
3. **LLM 精排**（仅 Top-5）
   - 最终相关性判断

## 安装

### 自动安装（推荐）

```bash
cd /mnt/skills
tar -xzf context-recall-v1.0.0.tar.gz
bash context-recall/scripts/post-install.sh
```

自动配置：
- ✅ AGENTS.md 自动执行钩子
- ✅ Cron 定时归档（每天凌晨2点）
- ✅ `recall` 命令快捷方式
- ✅ 运行测试验证

### 手动安装

```bash
cd /mnt/skills
ln -s /path/to/context-recall context-recall
node context-recall/scripts/install.js
```

## 使用指南

### 1. 会话生命周期（自动）

```bash
# 会话启动 - 自动执行
source /mnt/skills/context-recall/hooks/session-hook.sh
recall_session_start "$用户第一条消息"

# 消息记录 - 自动执行
recall_log_user "$用户消息"
recall_log_assistant "$助手回复"

# 会话结束 - 自动执行
recall_session_end
```

### 2. 手动命令

```bash
# 搜索记忆
recall search "API密钥"

# 捕获重要信息
recall capture --type=decision --content="使用SQLite"
recall capture --type=preference --content="喜欢简洁风格"
recall capture --type=task --content="周五前完成"

# 列出待办
recall tasks

# 导出记忆
recall export json backup.json
recall export markdown backup.md

# 导入记忆
recall import backup.json

# 标签管理
recall tags auto      # 自动打标签
recall tags search 工作  # 按标签搜索
recall tags stats     # 标签统计

# 生成可视化
recall viz
```

### 3. 智能待办提取

系统自动从对话中提取：
- **显式标记**：`待办：xxx`、`TODO：xxx`
- **承诺表达**：`明天要xxx`、`下周需要xxx`
- **疑问转待办**：`是否需要xxx？`

```bash
# 从会话日志提取待办
recall extract --log=session-log.json

# 查看待办列表
recall extract list

# 查看即将到期
recall extract upcoming

# 标记完成
recall extract done --id=<任务ID>
```

### 4. 定时归档

自动任务（已配置 cron）：
- 每天凌晨 2 点运行归档
- 生成周汇总和月汇总
- 更新可视化时间线

手动运行：
```bash
recall archive
```

## 配置

```yaml
# memory/context-recall/config.yaml
retrieval:
  max_results: 5              # 最大返回结果
  similarity_threshold: 0.7   # 相似度阈值

storage:
  compress_after_days: 7      # 7天后压缩
  archive_after_days: 30      # 30天后归档

auto_capture:
  decisions: true             # 自动捕获决策
  preferences: true           # 自动捕获偏好
  tasks: true                 # 自动提取待办
```

## 依赖

- Node.js >= 18
- jq（用于钩子脚本）
- cron（用于定时任务）

## 隐私说明

- **纯本地运行**：所有数据存储在本地 `memory/` 目录
- **零外部 API**：不依赖任何云服务
- **用户控制**：完全由用户拥有和管理

## 故障排除

### 搜索无结果
```bash
# 检查索引是否存在
ls memory/index.json

# 重新生成索引
recall archive
```

### 钩子不生效
```bash
# 检查 jq 是否安装
which jq

# 手动测试钩子
source /mnt/skills/context-recall/hooks/session-hook.sh
echo '{"test": "message"}' | recall_log_user
```

### 定时任务不运行
```bash
# 检查 cron 配置
crontab -l | grep context-recall

# 手动运行测试
bash /mnt/skills/context-recall/scripts/cron-archive.sh
```

## 许可证

MIT
