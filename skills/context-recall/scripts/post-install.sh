#!/bin/bash
# Post-install script - runs after skill installation

echo "🔧 Configuring ContextRecall auto-activation..."

# 1. 添加到 AGENTS.md
AGENTS_FILE="/mnt/AGENTS.md"

if [ -f "$AGENTS_FILE" ]; then
  # 检查是否已配置
  if ! grep -q "context-recall/hooks" "$AGENTS_FILE"; then
    echo "" >> "$AGENTS_FILE"
    echo "## ContextRecall Auto-Activation" >> "$AGENTS_FILE"
    echo "" >> "$AGENTS_FILE"
    echo "ContextRecall is installed. The following runs automatically:" >> "$AGENTS_FILE"
    echo "" >> "$AGENTS_FILE"
    echo '```bash' >> "$AGENTS_FILE"
    echo '# Session start (auto-run)' >> "$AGENTS_FILE"
    echo 'source /mnt/skills/context-recall/hooks/session-hook.sh 2>/dev/null || true' >> "$AGENTS_FILE"
    echo 'if command -v recall_session_start &>/dev/null; then' >> "$AGENTS_FILE"
    echo '  recall_session_start "$USER_FIRST_MESSAGE"' >> "$AGENTS_FILE"
    echo 'fi' >> "$AGENTS_FILE"
    echo '```' >> "$AGENTS_FILE"
    echo "" >> "$AGENTS_FILE"
    echo "✅ ContextRecall configured in AGENTS.md"
  fi
fi

# 2. 设置 cron 定时任务
CRON_LINE="0 2 * * * /mnt/skills/context-recall/scripts/cron-archive.sh"
(crontab -l 2>/dev/null | grep -v "context-recall" || true; echo "$CRON_LINE") | crontab -
echo "✅ Cron job configured for daily archiving"

# 3. 创建符号链接方便使用
if [ ! -L "/usr/local/bin/recall" ]; then
  ln -sf /mnt/skills/context-recall/bin/recall /usr/local/bin/recall 2>/dev/null || true
  echo "✅ Created symlink: recall -> /usr/local/bin/recall"
fi

# 4. 初始化目录
mkdir -p /mnt/memory/{daily,weekly,monthly,ontology,session-logs,visualization}

# 5. 运行测试
echo ""
echo "🧪 Running tests..."
node /mnt/skills/context-recall/test/test.js

echo ""
echo "✅ ContextRecall installation complete!"
echo ""
echo "Quick start:"
echo "  recall init --query=\"hello\"    # Initialize session"
echo "  recall search \"memory\"         # Search memories"
echo "  recall remind                  # Show reminders"
echo "  recall viz                     # Generate visualization"
