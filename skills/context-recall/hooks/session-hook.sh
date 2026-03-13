#!/bin/bash
# ContextRecall Session Hook
# 由 AGENTS.md 或 OpenClaw 调用

export CONTEXT_RECALL_DIR="/mnt/skills/context-recall"
export MEMORY_DIR="/mnt/memory"

# 会话状态文件
export CR_SESSION_FILE="/tmp/context-recall-session-$$.json"

# 初始化会话记录
recall_session_start() {
  local query="$1"
  local session_id=$(date +%Y%m%d_%H%M%S)_$$
  
  # 创建会话日志
  cat > "$CR_SESSION_FILE" << EOF
{
  "sessionId": "$session_id",
  "startTime": "$(date -Iseconds)",
  "query": "$query",
  "messages": []
}
EOF
  
  # 运行 recall-init
  echo "🔍 ContextRecall: 初始化会话记忆..."
  node "$CONTEXT_RECALL_DIR/bin/recall-init" --query="$query" 2>/dev/null
  
  # 检查待办提醒
  echo ""
  node "$CONTEXT_RECALL_DIR/bin/recall-remind" 2>/dev/null
  
  echo ""
  echo "✅ ContextRecall: 会话记录已启动 ($session_id)"
}

# 记录用户消息
recall_log_user() {
  local content="$1"
  local timestamp=$(date -Iseconds)
  
  if [ -f "$CR_SESSION_FILE" ]; then
    local tmp=$(mktemp)
    local escaped=$(echo "$content" | jq -Rs '.[:-1]')
    jq ".messages += [{\"role\": \"user\", \"content\": $escaped, \"timestamp\": \"$timestamp\"}]" "$CR_SESSION_FILE" > "$tmp"
    mv "$tmp" "$CR_SESSION_FILE"
  fi
}

# 记录助手消息
recall_log_assistant() {
  local content="$1"
  local timestamp=$(date -Iseconds)
  
  if [ -f "$CR_SESSION_FILE" ]; then
    local tmp=$(mktemp)
    local escaped=$(echo "$content" | jq -Rs '.[:-1]')
    jq ".messages += [{\"role\": \"assistant\", \"content\": $escaped, \"timestamp\": \"$timestamp\"}]" "$CR_SESSION_FILE" > "$tmp"
    mv "$tmp" "$CR_SESSION_FILE"
  fi
}

# 结束会话
recall_session_end() {
  if [ -f "$CR_SESSION_FILE" ]; then
    echo "📝 ContextRecall: 生成会话摘要..."
    node "$CONTEXT_RECALL_DIR/bin/recall-end" --log="$CR_SESSION_FILE" 2>/dev/null
    
    # 提取待办
    node "$CONTEXT_RECALL_DIR/bin/recall-extract-tasks" extract --log="$CR_SESSION_FILE" 2>/dev/null
    
    # 清理
    rm -f "$CR_SESSION_FILE"
    echo "✅ ContextRecall: 会话已归档"
  fi
}

# 检查是否是直接执行
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
  case "$1" in
    start)
      recall_session_start "$2"
      ;;
    log-user)
      recall_log_user "$2"
      ;;
    log-assistant)
      recall_log_assistant "$2"
      ;;
    end)
      recall_session_end
      ;;
    *)
      echo "Usage: $0 <start|log-user|log-assistant|end>"
      exit 1
      ;;
  esac
fi
