/**
 * Archiver - 记忆压缩与归档
 */
const fs = require('fs').promises;
const path = require('path');

const MEMORY_DIR = process.env.MEMORY_DIR || '/mnt/memory';

class Archiver {
  constructor() {
    this.dailyDir = path.join(MEMORY_DIR, 'daily');
    this.weeklyDir = path.join(MEMORY_DIR, 'weekly');
    this.monthlyDir = path.join(MEMORY_DIR, 'monthly');
  }

  async init() {
    await fs.mkdir(this.weeklyDir, { recursive: true });
    await fs.mkdir(this.monthlyDir, { recursive: true });
  }

  async run() {
    console.log('🗄️  Running memory archive...\n');
    
    const results = { compressed: 0, archived: 0 };
    
    // 生成周汇总
    await this.generateWeeklySummary();
    console.log('✅ Weekly summary generated');
    
    // 生成月汇总
    await this.generateMonthlySummary();
    console.log('✅ Monthly summary generated');
    
    console.log('\n🎉 Archive complete');
    return results;
  }

  async generateWeeklySummary() {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekKey = `${weekStart.getFullYear()}-W${this.getWeekNumber(weekStart)}`;
    
    const files = await fs.readdir(this.dailyDir);
    const weekMemories = [];
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const date = file.replace('.md', '');
      const fileDate = new Date(date);
      
      if (this.isSameWeek(fileDate, now)) {
        const content = await fs.readFile(path.join(this.dailyDir, file), 'utf8');
        weekMemories.push({ date, content });
      }
    }
    
    if (weekMemories.length === 0) return;
    
    const summary = `# ${weekKey} - Weekly Summary

## Overview
- Days recorded: ${weekMemories.length}

## Daily Summaries
${weekMemories.map(m => `### ${m.date}`).join('\n')}
`;
    
    await fs.writeFile(path.join(this.weeklyDir, `${weekKey}.md`), summary, 'utf8');
  }

  async generateMonthlySummary() {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    const files = await fs.readdir(this.dailyDir);
    const monthMemories = [];
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      const date = file.replace('.md', '');
      
      if (date.startsWith(monthKey)) {
        monthMemories.push({ date });
      }
    }
    
    if (monthMemories.length === 0) return;
    
    const summary = `# ${monthKey} - Monthly Summary

## Overview
- Days recorded: ${monthMemories.length}
`;
    
    await fs.writeFile(path.join(this.monthlyDir, `${monthKey}.md`), summary, 'utf8');
  }

  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  isSameWeek(d1, d2) {
    const week1 = this.getWeekNumber(d1);
    const week2 = this.getWeekNumber(d2);
    return d1.getFullYear() === d2.getFullYear() && week1 === week2;
  }
}

module.exports = Archiver;
