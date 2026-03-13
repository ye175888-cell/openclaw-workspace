/**
 * Task Extractor - LLM 驱动的待办提取
 * 从对话中自动识别任务、承诺、截止日期
 */
const fs = require('fs').promises;
const path = require('path');

const MEMORY_DIR = process.env.MEMORY_DIR || '/mnt/memory';

class TaskExtractor {
  constructor() {
    this.tasksFile = path.join(MEMORY_DIR, 'ontology', 'tasks.json');
  }

  /**
   * 从消息中提取待办
   * 使用规则 + 简单启发式（避免调用 LLM 太频繁）
   */
  async extractFromMessage(message) {
    const tasks = [];
    const content = message.content || message;
    
    // 模式 1: 显式待办标记
    const todoPatterns = [
      /(?:待办|TODO|todo)[:：]\s*(.+?)(?=\n|$)/gi,
      /(?:记住|记得)[:：]\s*(.+?)(?=\n|$)/gi,
      /(?:别忘了|不要忘记)[:：]\s*(.+?)(?=\n|$)/gi
    ];
    
    for (const pattern of todoPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        tasks.push({
          title: match[1].trim(),
          source: 'explicit',
          confidence: 0.95,
          extractedFrom: content.slice(0, 50)
        });
      }
    }
    
    // 模式 2: 承诺/意图表达
    const commitmentPatterns = [
      { pattern: /我(?:会|要|打算|计划)(.+?)(?:明天|后天|下周|下周一|这周末|月底前)/gi, due: 'relative' },
      { pattern: /(?:明天|后天|下周|下周一)(?:要|得|需要)(.+?)/gi, due: 'relative' },
      { pattern: /(?:记得|别忘了)(?:明天|后天|下周)(.+?)/gi, due: 'relative' }
    ];
    
    for (const { pattern, due } of commitmentPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        tasks.push({
          title: match[1].trim(),
          source: 'commitment',
          due: this.parseDueDate(match[0]),
          confidence: 0.8,
          extractedFrom: content.slice(0, 50)
        });
      }
    }
    
    // 模式 3: 疑问/需求 → 待办
    const questionPatterns = [
      /(?:需要|应该|得)(.+?)(?:吗|么)\?/gi,
      /(?:是不是|是否)(?:应该|需要)(.+?)/gi
    ];
    
    for (const pattern of questionPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        // 只有用户消息才转为待办
        if (message.role === 'user') {
          tasks.push({
            title: `考虑: ${match[1].trim()}`,
            source: 'question',
            confidence: 0.6,
            extractedFrom: content.slice(0, 50)
          });
        }
      }
    }
    
    return tasks;
  }

  /**
   * 从整个会话中提取所有待办
   */
  async extractFromSession(messages) {
    const allTasks = [];
    
    for (const msg of messages) {
      const tasks = await this.extractFromMessage(msg);
      allTasks.push(...tasks.map(t => ({
        ...t,
        messageRole: msg.role,
        timestamp: msg.timestamp || new Date().toISOString()
      })));
    }
    
    // 去重（相似标题）
    return this.deduplicateTasks(allTasks);
  }

  /**
   * 解析截止日期
   */
  parseDueDate(text) {
    const now = new Date();
    const date = new Date(now);
    
    if (text.includes('明天')) {
      date.setDate(now.getDate() + 1);
    } else if (text.includes('后天')) {
      date.setDate(now.getDate() + 2);
    } else if (text.includes('下周一')) {
      date.setDate(now.getDate() + (8 - now.getDay()));
    } else if (text.includes('下周')) {
      date.setDate(now.getDate() + 7);
    } else if (text.includes('这周末')) {
      date.setDate(now.getDate() + (6 - now.getDay()));
    } else if (text.includes('月底')) {
      date.setMonth(now.getMonth() + 1, 0);
    }
    
    return date.toISOString().split('T')[0];
  }

  /**
   * 待办去重
   */
  deduplicateTasks(tasks) {
    const seen = new Set();
    return tasks.filter(t => {
      const key = t.title.toLowerCase().slice(0, 20);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * 保存待办到存储
   */
  async saveTasks(tasks) {
    // 加载现有待办
    let existing = [];
    try {
      const content = await fs.readFile(this.tasksFile, 'utf8');
      existing = JSON.parse(content);
    } catch {
      // 文件不存在
    }
    
    // 合并并去重
    const merged = [...existing];
    for (const task of tasks) {
      const isDuplicate = existing.some(e => 
        e.title.toLowerCase() === task.title.toLowerCase()
      );
      if (!isDuplicate) {
        merged.push({
          ...task,
          id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          status: 'pending',
          created: new Date().toISOString()
        });
      }
    }
    
    // 保存
    await fs.mkdir(path.dirname(this.tasksFile), { recursive: true });
    await fs.writeFile(this.tasksFile, JSON.stringify(merged, null, 2), 'utf8');
    
    return merged.filter(m => !existing.some(e => e.title === m.title));
  }

  /**
   * 获取待办列表
   */
  async getTasks(filter = 'pending') {
    try {
      const content = await fs.readFile(this.tasksFile, 'utf8');
      const tasks = JSON.parse(content);
      
      if (filter === 'all') return tasks;
      return tasks.filter(t => t.status === filter);
    } catch {
      return [];
    }
  }

  /**
   * 更新待办状态
   */
  async updateTaskStatus(taskId, status) {
    const tasks = await this.getTasks('all');
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      task.status = status;
      task.updated = new Date().toISOString();
      await fs.writeFile(this.tasksFile, JSON.stringify(tasks, null, 2), 'utf8');
      return true;
    }
    return false;
  }

  /**
   * 获取即将到期的待办
   */
  async getUpcomingTasks(days = 3) {
    const tasks = await this.getTasks('pending');
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    
    return tasks.filter(t => {
      if (!t.due) return false;
      const due = new Date(t.due);
      return due <= cutoff;
    }).sort((a, b) => new Date(a.due) - new Date(b.due));
  }
}

module.exports = TaskExtractor;
