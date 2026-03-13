#!/bin/bash
# Session end hook - 会话结束时调用

SESSION_LOG="${1:-}"

echo "📝 ContextRecall: Generating session summary..."

if [ -z "$SESSION_LOG" ]; then
  echo "⚠️  No session log provided, skipping summary"
  exit 0
fi

# 运行结束摘要
node "$(dirname "$0")/../bin/recall-end" --log="$SESSION_LOG"

echo "✅ ContextRecall: Session summary saved"
