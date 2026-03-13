#!/bin/bash
# Session start hook - 会话启动时调用

echo "🔍 ContextRecall: Initializing session memory..."

# 获取用户第一条消息（从环境变量或参数）
QUERY="${1:-}"

# 运行初始化
node "$(dirname "$0")/../bin/recall-init" --query="$QUERY"

echo "✅ ContextRecall: Session initialized"
