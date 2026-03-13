#!/usr/bin/env node
/**
 * Install script - 技能安装时执行
 */
const fs = require('fs').promises;
const path = require('path');

const MEMORY_DIR = process.env.MEMORY_DIR || '/mnt/memory';

async function install() {
  console.log('🔧 Installing ContextRecall...\n');
  
  // 创建记忆目录结构
  const dirs = [
    MEMORY_DIR,
    path.join(MEMORY_DIR, 'daily'),
    path.join(MEMORY_DIR, 'weekly'),
    path.join(MEMORY_DIR, 'monthly'),
    path.join(MEMORY_DIR, 'ontology'),
    path.join(MEMORY_DIR, 'session-logs')
  ];
  
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
    console.log(`  ✓ Created: ${dir}`);
  }
  
  // 初始化索引
  const indexFile = path.join(MEMORY_DIR, 'index.json');
  try {
    await fs.access(indexFile);
    console.log(`  ✓ Index exists: ${indexFile}`);
  } catch {
    await fs.writeFile(indexFile, JSON.stringify({
      memories: [],
      version: '1.0',
      created: new Date().toISOString()
    }, null, 2));
    console.log(`  ✓ Created index: ${indexFile}`);
  }
  
  // 初始化配置
  const configFile = path.join(MEMORY_DIR, 'context-recall', 'config.yaml');
  try {
    await fs.access(configFile);
  } catch {
    await fs.mkdir(path.join(MEMORY_DIR, 'context-recall'), { recursive: true });
    await fs.writeFile(configFile, `# ContextRecall Configuration
retrieval:
  max_results: 5
  similarity_threshold: 0.7
  
storage:
  compress_after_days: 7
  archive_after_days: 30
  
auto_capture:
  decisions: true
  preferences: true
  tasks: true
`);
    console.log(`  ✓ Created config: ${configFile}`);
  }
  
  console.log('\n✅ ContextRecall installed successfully!');
  console.log('\nUsage:');
  console.log('  recall-init --query="..."    # Initialize session');
  console.log('  recall-search "..."          # Search memories');
  console.log('  recall-capture --type=...    # Capture important info');
  console.log('  recall-end --log=...         # End session with summary');
}

install().catch(err => {
  console.error('❌ Install failed:', err.message);
  process.exit(1);
});
