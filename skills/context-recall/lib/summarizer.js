/**
 * Summarizer - 会话摘要生成
 * 使用 LLM 生成结构化摘要
 */

class Summarizer {
  constructor() {
    this.llmProvider = process.env.LLM_PROVIDER || 'openclaw';
  }

  /**
   * 生成会话摘要
   * @param {Array} messages - 会话消息列表
   * @returns {Object} 结构化摘要
   */
  async summarizeSession(messages) {
    // 构建 prompt
    const conversation = messages.map(m => {
      const role = m.role === 'user' ? 'Human' : 'Agent';
      return `${role}: ${m.content}`;
    }).join('\n\n');

    const prompt = `请分析以下对话，生成结构化摘要：

${conversation}

请按以下格式输出（JSON）：
{
  "topics": ["主题1", "主题2"],
  "decisions": [{"what": "决策内容", "why": "原因"}],
  "preferences": [{"item": "偏好项", "value": "偏好值"}],
  "tasks": [{"title": "任务", "due": "截止日期或null"}],
  "openQuestions": ["未解决的问题"],
  "nextSteps": ["建议的下一步"]
}`;

    // 调用 LLM（通过 OpenClaw 工具）
    // 这里返回模拟结果，实际实现调用 LLM
    return this.mockSummarize(messages);
  }

  /**
   * 轻量级摘要（无 LLM，快速）
   */
  quickSummarize(messages) {
    const topics = this.extractTopics(messages);
    const tasks = this.extractTasks(messages);
    
    return {
      topics,
      tasks,
      messageCount: messages.length,
      timestamp: new Date().toISOString()
    };
  }

  // 简单主题提取
  extractTopics(messages) {
    const allText = messages.map(m => m.content).join(' ');
    const keywords = this.extractKeywords(allText);
    return keywords.slice(0, 5);
  }

  // 简单任务提取（关键词匹配）
  extractTasks(messages) {
    const taskPatterns = [
      /待办[:：]\s*(.+)/gi,
      /TODO[:：]\s*(.+)/gi,
      /记住[:：]\s*(.+)/gi,
      /需要[:：]\s*(.+)/gi,
      /下次[:：]\s*(.+)/gi
    ];
    
    const tasks = [];
    for (const msg of messages) {
      for (const pattern of taskPatterns) {
        const matches = msg.content.matchAll(pattern);
        for (const match of matches) {
          tasks.push({
            title: match[1].trim(),
            source: msg.role,
            created: new Date().toISOString()
          });
        }
      }
    }
    return tasks;
  }

  // 关键词提取
  extractKeywords(text) {
    const words = text.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2 && !this.isStopWord(w));
    
    const freq = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([w]) => w);
  }

  isStopWord(word) {
    const stops = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', '这个', '那个', '然后', '但是']);
    return stops.has(word);
  }

  // 模拟摘要（实际实现调用 LLM）
  mockSummarize(messages) {
    return {
      topics: this.extractTopics(messages),
      decisions: [],
      preferences: [],
      tasks: this.extractTasks(messages),
      openQuestions: [],
      nextSteps: [],
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = Summarizer;
