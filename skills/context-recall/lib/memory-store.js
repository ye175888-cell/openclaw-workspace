/**
 * Memory Store - 文件系统存储层
 */
const fs = require('fs').promises;
const path = require('path');

const MEMORY_DIR = process.env.MEMORY_DIR || '/mnt/memory';

class MemoryStore {
  constructor() {
    this.dailyDir = path.join(MEMORY_DIR, 'daily');
    this.weeklyDir = path.join(MEMORY_DIR, 'weekly');
    this.monthlyDir = path.join(MEMORY_DIR, 'monthly');
    this.ontologyDir = path.join(MEMORY_DIR, 'ontology');
    this.indexFile = path.join(MEMORY_DIR, 'index.json');
  }

  async init() {
    await fs.mkdir(this.dailyDir, { recursive: true });
    await fs.mkdir(this.weeklyDir, { recursive: true });
    await fs.mkdir(this.monthlyDir, { recursive: true });
    await fs.mkdir(this.ontologyDir, { recursive: true });
    
    // 初始化索引
    try {
      await fs.access(this.indexFile);
    } catch {
      await this.saveIndex({ memories: [], version: '1.0' });
    }
  }

  // 保存每日记忆
  async saveDaily(date, content) {
    const file = path.join(this.dailyDir, `${date}.md`);
    await fs.writeFile(file, content, 'utf8');
    await this.updateIndex(date, 'daily', content);
  }

  // 读取指定日期记忆
  async loadDaily(date) {
    const file = path.join(this.dailyDir, `${date}.md`);
    try {
      return await fs.readFile(file, 'utf8');
    } catch {
      return null;
    }
  }

  // 读取今日记忆
  async loadToday() {
    const today = new Date().toISOString().split('T')[0];
    return await this.loadDaily(today);
  }

  // 加载最近 N 天记忆
  async loadRecentDays(days = 7) {
    const files = await fs.readdir(this.dailyDir);
    const sorted = files
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .slice(0, days);
    
    const memories = [];
    for (const file of sorted) {
      const content = await fs.readFile(path.join(this.dailyDir, file), 'utf8');
      memories.push({ date: file.replace('.md', ''), content });
    }
    return memories;
  }

  // 保存结构化数据
  async saveOntology(type, data) {
    const file = path.join(this.ontologyDir, `${type}.json`);
    await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
  }

  // 读取结构化数据
  async loadOntology(type) {
    const file = path.join(this.ontologyDir, `${type}.json`);
    try {
      const content = await fs.readFile(file, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  // 索引操作
  async loadIndex() {
    try {
      const content = await fs.readFile(this.indexFile, 'utf8');
      return JSON.parse(content);
    } catch {
      return { memories: [], version: '1.0' };
    }
  }

  async saveIndex(index) {
    await fs.writeFile(this.indexFile, JSON.stringify(index, null, 2), 'utf8');
  }

  async updateIndex(date, type, content) {
    const index = await this.loadIndex();
    const existing = index.memories.find(m => m.date === date);
    
    // 提取关键词（简单实现）
    const keywords = this.extractKeywords(content);
    
    if (existing) {
      existing.keywords = [...new Set([...existing.keywords, ...keywords])];
      existing.updated = new Date().toISOString();
    } else {
      index.memories.push({
        id: `mem_${Date.now()}`,
        date,
        type,
        keywords,
        summary: content.slice(0, 200) + '...',
        created: new Date().toISOString()
      });
    }
    
    await this.saveIndex(index);
  }

  // 简单关键词提取（支持中文分词）
  extractKeywords(text) {
    const words = [];
    const cleaned = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, ' ');
    
    // 提取中文词组（滑动窗口）
    const chineseMatches = cleaned.match(/[\u4e00-\u9fa5]{2,8}/g) || [];
    chineseMatches.forEach(match => {
      words.push(match);
      for (let i = 0; i < match.length - 1; i++) {
        words.push(match.slice(i, i + 2));
      }
    });
    
    // 提取英文单词
    const englishWords = cleaned.match(/[a-z0-9]{2,}/g) || [];
    words.push(...englishWords);
    
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([w]) => w);
  }
}

module.exports = MemoryStore;
