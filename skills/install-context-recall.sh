#!/bin/bash
# ContextRecall 一键安装脚本
# Usage: curl -fsSL https://raw.githubusercontent.com/ye175888-cell/openclaw-workspace/main/skills/install-context-recall.sh | bash

set -e

REPO_URL="https://github.com/ye175888-cell/openclaw-workspace"
VERSION="1.0.0"
INSTALL_DIR="/mnt/skills"
MEMORY_DIR="/mnt/memory"

echo "🧠 ContextRecall v${VERSION} 一键安装"
echo "================================"
echo ""

# 检查目录
if [ ! -d "$INSTALL_DIR" ]; then
  echo "❌ 未找到 $INSTALL_DIR 目录"
  echo "   请确保 OpenClaw 工作目录正确设置"
  exit 1
fi

# 下载
echo "📥 下载安装包..."
cd /tmp
if command -v curl &> /dev/null; then
  curl -fsSL "${REPO_URL}/raw/main/skills/context-recall-v${VERSION}.tar.gz" -o context-recall.tar.gz
elif command -v wget &> /dev/null; then
  wget -q "${REPO_URL}/raw/main/skills/context-recall-v${VERSION}.tar.gz" -O context-recall.tar.gz
else
  echo "❌ 需要 curl 或 wget"
  exit 1
fi

# 解压
echo "📦 解压安装包..."
cd "$INSTALL_DIR"
tar -xzf /tmp/context-recall.tar.gz

# 运行配置
echo "🔧 配置环境..."
bash "${INSTALL_DIR}/context-recall/scripts/post-install.sh"

# 清理
rm -f /tmp/context-recall.tar.gz

echo ""
echo "✅ 安装完成！"
echo ""
echo "快速开始:"
echo "  recall init --query=\"你好\"    # 初始化会话"
echo "  recall search \"记忆\"          # 搜索记忆"
echo "  recall remind                 # 查看提醒"
echo "  recall viz                    # 生成可视化"
echo ""
echo "查看文档:"
echo "  cat ${INSTALL_DIR}/context-recall/README-zh.md"
