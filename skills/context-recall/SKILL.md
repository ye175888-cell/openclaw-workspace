---
name: context-recall
description: Smart memory system for OpenClaw agents. Auto-captures session summaries, retrieves relevant context based on queries, and manages tiered memory storage (daily/weekly/monthly). Zero external dependencies, local-first design.
triggers:
  - session start
  - session end
  - "remember"
  - "what did we discuss"
  - "find memory"
---

# ContextRecall

智能记忆系统，解决 OpenClaw 会话上下文丢失问题。

## 核心功能

| 功能 | 命令 | 说明 |
|------|------|------|
| 会话初始化 | `recall-init` | 启动时加载相关记忆 |
| 实时捕获 | `recall-capture` | 保存重要决策/偏好 |
| 会话摘要 | `recall-end` | 结束时生成摘要 |
| 记忆检索 | `recall-search <query>` | 基于查询召回记忆 |
| 待办提取 | `recall-tasks` | 扫描待办事项 |

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
│   ├── person.json           # 用户画像
│   ├── projects.json         # 项目列表
│   └── preferences.json      # 偏好设置
├── index.json                # 记忆索引
└── context-recall/
    └── config.yaml           # 配置
```

## 检索策略（分层）

1. **元数据过滤**（零 token）
   - 时间范围、标签、关键词匹配
   
2. **向量相似度**（本地计算）
   - TF-IDF / 简单 embedding
   
3. **LLM 精排**（仅 Top-5）
   - 最终相关性判断

## 使用方式

### 会话启动（AGENTS.md 调用）

```bash
# 加载今日记忆 + 检索相关历史
recall-init --query "$USER_FIRST_MESSAGE"
```

### 实时保存决策

```bash
# 用户说"记住..."
recall-capture --type decision --content "..."
```

### 会话结束摘要

```bash
# 自动生成摘要并保存
recall-end --session-id "xxx"
```

### 主动检索

```bash
# 搜索相关记忆
recall-search "API密钥放在哪"
```

## 配置

```yaml
# memory/context-recall/config.yaml
retrieval:
  max_results: 5
  similarity_threshold: 0.7
  
storage:
  compress_after_days: 7      # 7天后压缩
  archive_after_days: 30      # 30天后归档
  
auto_capture:
  decisions: true             # 自动捕获决策
  preferences: true           # 自动捕获偏好
  tasks: true                 # 自动提取待办
```

## 安装

```bash
cd /mnt/skills/context-recall
npm install  # 或 pip install -r requirements.txt
```

## 依赖

- Node.js >= 18（或 Python 3.9+）
- 纯本地运行，无外部 API
