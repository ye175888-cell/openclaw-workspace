/**
 * Session Logger - 自动记录会话消息
 */
const fs = require('fs').promises;
const path = require('path');

const MEMORY_DIR = process.env.MEMORY_DIR || '/mnt/memory';
const SESSION_LOGS_DIR = path.join(MEMORY_DIR, 'session-logs');

class SessionLogger {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.messages = [];
    this.startTime = new Date().toISOString();
    this.logFile = path.join(SESSION_LOGS_DIR, `${this.sessionId}.json`);
  }

  generateSessionId() {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const random = Math.random().toString(36).substring(2, 6);
    return `${date}_${time}_${random}`;
  }

  async init() {
    await fs.mkdir(SESSION_LOGS_DIR, { recursive: true });
    
    // 写入初始状态
    await this.save();
    
    return {
      sessionId: this.sessionId,
      logFile: this.logFile,
      startTime: this.startTime
    };
  }

  // 记录用户消息
  logUser(content, metadata = {}) {
    this.messages.push({
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      ...metadata
    });
    this.save();
  }

  // 记录助手消息
  logAssistant(content, metadata = {}) {
    this.messages.push({
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      ...metadata
    });
    this.save();
  }

  // 记录系统事件
  logEvent(event, data = {}) {
    this.messages.push({
      role: 'system',
      event,
      data,
      timestamp: new Date().toISOString()
    });
    this.save();
  }

  // 保存到文件
  async save() {
    const sessionData = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      lastUpdate: new Date().toISOString(),
      messageCount: this.messages.length,
      messages: this.messages
    };
    
    await fs.writeFile(this.logFile, JSON.stringify(sessionData, null, 2), 'utf8');
  }

  // 结束会话
  async end() {
    this.logEvent('session_end', { totalMessages: this.messages.length });
    await this.save();
    return this.logFile;
  }

  // 加载历史会话
  static async load(sessionId) {
    const logFile = path.join(SESSION_LOGS_DIR, `${sessionId}.json`);
    try {
      const content = await fs.readFile(logFile, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  // 列出最近会话
  static async listRecent(limit = 10) {
    try {
      const files = await fs.readdir(SESSION_LOGS_DIR);
      const sorted = files
        .filter(f => f.endsWith('.json'))
        .sort()
        .reverse()
        .slice(0, limit);
      
      const sessions = [];
      for (const file of sorted) {
        const content = await fs.readFile(path.join(SESSION_LOGS_DIR, file), 'utf8');
        const data = JSON.parse(content);
        sessions.push({
          sessionId: data.sessionId,
          startTime: data.startTime,
          messageCount: data.messageCount
        });
      }
      return sessions;
    } catch {
      return [];
    }
  }
}

module.exports = SessionLogger;
