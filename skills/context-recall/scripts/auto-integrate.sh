#!/bin/bash
# Auto-integration script for AGENTS.md
# Source this file in AGENTS.md to enable automatic session logging

export CONTEXT_RECALL_DIR="/mnt/skills/context-recall"
export MEMORY_DIR="/mnt/memory"

# Generate session ID
export SESSION_ID=$(date +%Y%m%d_%H%M%S)_$(openssl rand -hex 2)
export SESSION_LOG="$MEMORY_DIR/session-logs/$SESSION_ID.json"

# Initialize session log
mkdir -p "$MEMORY_DIR/session-logs"
echo "{
  \"sessionId\": \"$SESSION_ID\",
  \"startTime\": \"$(date -Iseconds)\",
  \"messages\": []
}" > "$SESSION_LOG"

# Function to log messages
recall_log() {
  local role="$1"
  local content="$2"
  local timestamp=$(date -Iseconds)
  
  # Read current log
  local tmp=$(mktemp)
  jq ".messages += [{\"role\": \"$role\", \"content\": $(echo "$content" | jq -Rs .), \"timestamp\": \"$timestamp\"}]" "$SESSION_LOG" > "$tmp"
  mv "$tmp" "$SESSION_LOG"
}

# Function to log user message
recall_log_user() {
  recall_log "user" "$1"
}

# Function to log assistant message
recall_log_assistant() {
  recall_log "assistant" "$1"
}

# Function to end session
recall_end_session() {
  node "$CONTEXT_RECALL_DIR/bin/recall-end" --log="$SESSION_LOG"
}

echo "✅ ContextRecall auto-integration loaded"
echo "   Session ID: $SESSION_ID"
echo "   Log file: $SESSION_LOG"
