/**
 * Tagger - 智能标签系统
 * 自动为记忆打标签
 */
const fs = require('fs').promises;
const path = require('path');

const MEMORY_DIR = process.env.MEMORY_DIR || '/mnt/memory';

// 预定义标签规则
const TAG_RULES = {
  '工作': ['项目', '工作', '任务', '会议', '代码', '开发', '部署', 'PR', 'review'],
  '学习': ['学习', '研究', '了解', '掌握', '教程', '文档', '看书'],
  '生活': ['购物', '吃饭', '电影', '旅行', '健康', '运动', '家庭'],
  '决策': ['决定', '选择', '方案', '决策', '确定', '采用'],
  '问题': ['问题', 'bug', '错误', '故障', '修复', '解决'],
  '想法': ['想法', '灵感', '创意', '构思', '设想'],
  '人': ['张三', '李四', '王五', '团队', '同事', '客户']
};

class Tagger {
  constructor() {
    this.tagsFile = path.join(MEMORY_DIR, 'ontology', 'tags.json');
  }

  /**
   * 为内容自动打标签
   */
  async autoTag(content) {
    const tags = new Set();
    const contentLower = content.toLowerCase();
    
    for (const [tag, keywords] of Object.entries(TAG_RULES)) {
      for (const keyword of keywords) {
        if (contentLower.includes(keyword.toLowerCase())) {
          tags.add(tag);
          break;
        }
      }
    }
    
    // 提取潜在的项目名（大写驼峰或引号内容）
    const projectMatches = content.match(/["']([^"']+?项目)["']/g);
    if (projectMatches) {
      projectMatches.forEach(m => {
        const project = m.replace(/["']/g, '');
        tags.add(`项目:${project}`);
      });
    }
    
    return [...tags];
  }

  /**
   * 为记忆文件打标签
   */
  async tagMemory(date, content) {
    const tags = await this.autoTag(content);
    
    // 保存标签索引
    const tagIndex = await this.loadTagIndex();
    
    tagIndex[date] = {
      tags,
      updated: new Date().toISOString()
    };
    
    await this.saveTagIndex(tagIndex);
    return tags;
  }

  /**
   * 按标签搜索记忆
   */
  async searchByTag(tag) {
    const tagIndex = await this.loadTagIndex();
    const results = [];
    
    for (const [date, data] of Object.entries(tagIndex)) {
      if (data.tags.includes(tag) || data.tags.some(t => t.includes(tag))) {
        results.push({ date, tags: data.tags });
      }
    }
    
    return results.sort((a, b) => b.date.localeCompare(a.date));
  }

  /**
   * 获取所有标签统计
   */
  async getTagStats() {
    const tagIndex = await this.loadTagIndex();
    const stats = {};
    
    for (const data of Object.values(tagIndex)) {
      for (const tag of data.tags) {
        stats[tag] = (stats[tag] || 0) + 1;
      }
    }
    
    return Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [tag, count]) => {
        obj[tag] = count;
        return obj;
      }, {});
  }

  /**
   * 获取热门标签
   */
  async getTopTags(limit = 10) {
    const stats = await this.getTagStats();
    return Object.entries(stats).slice(0, limit);
  }

  async loadTagIndex() {
    try {
      const content = await fs.readFile(this.tagsFile, 'utf8');
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  async saveTagIndex(index) {
    await fs.mkdir(path.dirname(this.tagsFile), { recursive: true });
    await fs.writeFile(this.tagsFile, JSON.stringify(index, null, 2), 'utf8');
  }
}

module.exports = Tagger;
