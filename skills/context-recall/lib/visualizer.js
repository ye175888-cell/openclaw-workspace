/**
 * Visualizer - 记忆可视化
 */
const fs = require('fs').promises;
const path = require('path');

const MEMORY_DIR = process.env.MEMORY_DIR || '/mnt/memory';

class Visualizer {
  constructor() {
    this.dailyDir = path.join(MEMORY_DIR, 'daily');
    this.outputDir = path.join(MEMORY_DIR, 'visualization');
  }

  async init() {
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  async generateTimeline() {
    const memories = await this.loadMemories();
    const html = this.buildHTML(memories);
    const outputFile = path.join(this.outputDir, 'timeline.html');
    await fs.writeFile(outputFile, html, 'utf8');
    return outputFile;
  }

  async loadMemories() {
    const memories = [];
    try {
      const files = await fs.readdir(this.dailyDir);
      for (const file of files.filter(f => f.endsWith('.md'))) {
        const date = file.replace('.md', '');
        const content = await fs.readFile(path.join(this.dailyDir, file), 'utf8');
        memories.push({ date, content });
      }
    } catch {}
    return memories.sort((a, b) => b.date.localeCompare(a.date));
  }

  buildHTML(memories) {
    const items = memories.map(m => `
      <div class="item">
        <div class="date">${m.date}</div>
        <div class="content">${m.content.slice(0, 300)}...</div>
      </div>
    `).join('');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>记忆时间线</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; background: #f5f5f5; }
    h1 { text-align: center; color: #333; }
    .stats { text-align: center; margin: 20px 0; color: #666; }
    .item { background: white; margin: 20px 0; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .date { color: #667eea; font-weight: bold; margin-bottom: 10px; }
    .content { color: #333; white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>🧠 记忆时间线</h1>
  <div class="stats">共 ${memories.length} 条记忆</div>
  ${items || '<p style="text-align:center;color:#999;">暂无记忆</p>'}
</body>
</html>`;
  }
}

module.exports = Visualizer;
