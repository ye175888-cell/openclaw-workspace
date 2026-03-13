/**
 * Retriever - 记忆检索层（分层策略）
 */
const MemoryStore = require('./memory-store');

class Retriever {
  constructor() {
    this.store = new MemoryStore();
  }

  async init() {
    await this.store.init();
  }

  /**
   * 分层检索
   * Layer 1: 元数据过滤（零 token）
   * Layer 2: 相似度排序（本地计算）
   * Layer 3: 返回 Top-K
   */
  async search(query, options = {}) {
    const { limit = 5, days = 30 } = options;
    
    // Layer 1: 加载近期记忆元数据
    const index = await this.store.loadIndex();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const candidates = index.memories.filter(m => {
      return new Date(m.date) >= cutoff;
    });

    if (candidates.length === 0) {
      return [];
    }

    // Layer 2: 计算相似度（简单 TF-IDF）
    const queryKeywords = this.extractKeywords(query);
    const scored = candidates.map(mem => {
      const score = this.calculateSimilarity(queryKeywords, mem.keywords);
      return { ...mem, score };
    });

    // 排序并取 Top-K
    const results = scored
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // 加载完整内容
    for (const result of results) {
      const file = await this.store.loadDaily(result.date);
      if (file) {
        result.content = file;
      }
    }

    return results;
  }

  /**
   * 会话初始化检索
   * 基于用户第一条消息，召回最相关的记忆
   */
  async initSession(firstMessage) {
    // 加载今日记忆
    const today = await this.store.loadToday();
    
    // 检索相关历史
    const relevant = await this.search(firstMessage, { limit: 3, days: 30 });
    
    // 加载用户画像
    const profile = await this.store.loadOntology('person');
    
    // 加载活跃项目
    const projects = await this.store.loadOntology('projects');

    return {
      today,
      relevant,
      profile,
      projects
    };
  }

  // 简单关键词提取
  extractKeywords(text) {
    const words = text.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2);
    
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([w]) => w);
  }

  // 计算相似度（Jaccard）
  calculateSimilarity(queryKeywords, memoryKeywords) {
    const set1 = new Set(queryKeywords);
    const set2 = new Set(memoryKeywords);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }
}

module.exports = Retriever;
