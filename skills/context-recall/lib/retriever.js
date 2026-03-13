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

  // 简单关键词提取（支持中文分词）
  extractKeywords(text) {
    // 中文：按字符分割，保留2-4字词组
    // 英文：按空格分割
    const words = [];
    
    // 清理文本
    const cleaned = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, ' ');
    
    // 提取中文词组（滑动窗口）
    const chineseMatches = cleaned.match(/[\u4e00-\u9fa5]{2,8}/g) || [];
    chineseMatches.forEach(match => {
      // 添加完整词组
      words.push(match);
      // 添加2字子串
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
