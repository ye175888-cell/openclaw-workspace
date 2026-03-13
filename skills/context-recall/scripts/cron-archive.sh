#!/bin/bash
# Cron job for daily archiving
# Add to crontab: 0 2 * * * /mnt/skills/context-recall/scripts/cron-archive.sh

export MEMORY_DIR="/mnt/memory"
export CONTEXT_RECALL_DIR="/mnt/skills/context-recall"

LOG_FILE="$MEMORY_DIR/archive-cron.log"

echo "[$(date)] Starting daily archive..." >> "$LOG_FILE"

# 运行归档
node "$CONTEXT_RECALL_DIR/bin/recall-archive" >> "$LOG_FILE" 2>&1

# 生成可视化
node "$CONTEXT_RECALL_DIR/bin/recall-visualize" timeline >> "$LOG_FILE" 2>&1

echo "[$(date)] Archive complete" >> "$LOG_FILE"
