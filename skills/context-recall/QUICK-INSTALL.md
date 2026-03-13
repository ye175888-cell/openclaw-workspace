# ContextRecall 快速安装

## 一行命令安装（推荐）

```bash
curl -fsSL https://raw.githubusercontent.com/ye175888-cell/openclaw-workspace/main/skills/install-context-recall.sh | bash
```

或

```bash
wget -qO- https://raw.githubusercontent.com/ye175888-cell/openclaw-workspace/main/skills/install-context-recall.sh | bash
```

## 手动安装

```bash
# 1. 下载
cd /mnt/skills
wget https://github.com/ye175888-cell/openclaw-workspace/raw/main/skills/context-recall-v1.0.0.tar.gz

# 2. 解压
tar -xzf context-recall-v1.0.0.tar.gz

# 3. 配置
bash context-recall/scripts/post-install.sh
```

## 验证安装

```bash
recall --version
```

## 卸载

```bash
rm -rf /mnt/skills/context-recall
rm -f /usr/local/bin/recall
```
