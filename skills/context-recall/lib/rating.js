/**
 * Rating - 记忆评分系统
 * 用户反馈优化检索排序
 */
const fs = require('fs').promises;
const path = require('path');

const MEMORY_DIR = process.env.MEMORY_DIR || '/mnt/memory';

class Rating {
  constructor() {
    this.ratingsFile = path.join(MEMORY_DIR, 'ontology', 'ratings.json');
  }

  /**
   * 为记忆评分
   */
  async rate(memoryId, rating, feedback = '') {
    // rating: 1-5 星
    const ratings = await this.loadRatings();
    
    ratings[memoryId] = {
      rating,
      feedback,
      updated: new Date().toISOString()
    };
    
    await this.saveRatings(ratings);
    
    return {
      memoryId,
      rating,
      message: this.getRatingMessage(rating)
    };
  }

  /**
   * 获取评分
   */
  async getRating(memoryId) {
    const ratings = await this.loadRatings();
    return ratings[memoryId] || null;
  }

  /**
   * 获取所有评分
   */
  async getAllRatings() {
    return await this.loadRatings();
  }

  /**
   * 获取评分统计
   */
  async getStats() {
    const ratings = await this.loadRatings();
    const values = Object.values(ratings).map(r => r.rating);
    
    if (values.length === 0) {
      return { count: 0, average: 0, distribution: {} };
    }
    
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    values.forEach(r => distribution[r]++);
    
    return {
      count: values.length,
      average: avg.toFixed(2),
      distribution
    };
  }

  /**
   * 获取高评分记忆
   */
  async getTopRated(limit = 10) {
    const ratings = await this.loadRatings();
    
    return Object.entries(ratings)
      .sort((a, b) => b[1].rating - a[1].rating)
      .slice(0, limit)
      .map(([id, data]) => ({ memoryId: id, ...data }));
  }

  /**
   * 获取低评分记忆（可删除）
 */
  async getLowRated(threshold = 2) {
    const ratings = await this.loadRatings();
    
    return Object.entries(ratings)
      .filter(([_, data]) => data.rating <= threshold)
      .map(([id, data]) => ({ memoryId: id, ...data }));
  }

  /**
   * 删除评分
   */
  async deleteRating(memoryId) {
    const ratings = await this.loadRatings();
    delete ratings[memoryId];
    await this.saveRatings(ratings);
    return true;
  }

  /**
   * 应用评分优化检索
   * 返回加权后的记忆列表
   */
  async applyRatings(memories) {
    const ratings = await this.loadRatings();
    
    return memories.map(mem => {
      const rating = ratings[mem.id || mem.date];
      const weight = rating ? rating.rating / 5 : 0.5; // 默认权重 0.5
      
      return {
        ...mem,
        weightedScore: (mem.score || 0) * weight,
        userRating: rating?.rating || null
      };
    }).sort((a, b) => b.weightedScore - a.weightedScore);
  }

  async loadRatings() {
    try {
      const content = await fs.readFile(this.ratingsFile, 'utf8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  async saveRatings(ratings) {
    await fs.mkdir(path.dirname(this.ratingsFile), { recursive: true });
    await fs.writeFile(this.ratingsFile, JSON.stringify(ratings, null, 2), 'utf8');
  }

  getRatingMessage(rating) {
    const messages = {
      1: '已记录，将减少此类记忆的推荐',
      2: '已记录，会优化检索结果',
      3: '感谢反馈',
      4: '很高兴对您有帮助！',
      5: '太好了！这是最重要的记忆之一'
    };
    return messages[rating] || '感谢反馈';
  }
}

module.exports = Rating;
