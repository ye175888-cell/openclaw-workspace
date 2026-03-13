/**
 * Natural Query - 自然语言查询
 * 用中文直接提问，自动解析意图
 */
const Retriever = require('./retriever');

class NaturalQuery {
  constructor() {
    this.retriever = new Retriever();
    this.patterns = this.initPatterns();
  }

  async init() {
    await this.retriever.init();
  }

  initPatterns() {
    return {
      // 时间查询
      time: {
        patterns: [
          /(?:上周|上星期|上个星期)[我们]*[讨论|说|聊|提到]*[了]*(.+)/,
          /(?:昨天|前天|前几天)[我们]*[讨论|说|聊|提到]*[了]*(.+)/,
          /(?:最近|近来|近期)[我们]*[讨论|说|聊|提到]*[了]*(.+)/,
          /(\d{4}年\d{1,2}月[\d{1,2}日]*)[我们]*[讨论|说|聊|提到]*[了]*(.+)/,
          /(\d{1,2}月\d{1,2}日)[我们]*[讨论|说|聊|提到]*[了]*(.+)/
        ],
        handler: this.handleTimeQuery.bind(this)
      },
      
      // 内容查询
      content: {
        patterns: [
          /(.+)(?:放|存|放在|存在|记|记得)[在]*[哪|哪里|什么地方]/,
          /(?:找|查找|搜索)(.+)/,
          /(?:关于|有关)(.+)的[记忆|记录|内容]/,
          /(.+)(?:是什么|怎么做|如何解决)/
        ],
        handler: this.handleContentQuery.bind(this)
      },
      
      // 统计查询
      stats: {
        patterns: [
          /(?:我们|我)[一共|总共]*[讨论|说|聊][了]*[多少|几]次(.+)/,
          /(?:最近|近来)[一共|总共]*[有|完成]*[多少|几]个(.+)/,
          /(?:关于|有关)(.+)[有|一共|总共]*[多少|几]条/
        ],
        handler: this.handleStatsQuery.bind(this)
      },
      
      // 待办查询
      todo: {
        patterns: [
          /(?:我|我们)[还|还欠]*[有]*[多少|几]*个[待办|任务|事情|工作]*/,
          /(?:什么|哪些)[待办|任务|事情][需要|要][做|完成]/,
          /(?:今天|明天|这周)[要|需要][做|完成][什么|哪些]/,
          /(?:截止|到期)[日期|时间][是]*[什么|哪天]*[的]*[待办|任务]*/
        ],
        handler: this.handleTodoQuery.bind(this)
      }
    };
  }

  /**
   * 解析自然语言查询
   */
  async query(question) {
    const normalized = question.toLowerCase().trim();
    
    // 尝试匹配各种模式
    for (const [type, config] of Object.entries(this.patterns)) {
      for (const pattern of config.patterns) {
        const match = normalized.match(pattern);
        if (match) {
          return await config.handler(match, question);
        }
      }
    }
    
    // 默认：直接搜索
    return await this.defaultSearch(question);
  }

  /**
   * 处理时间查询
   */
  async handleTimeQuery(match, original) {
    const keyword = match[1] || match[2] || '';
    
    // 解析时间范围
    let days = 30; // 默认30天
    if (original.includes('昨天')) days = 2;
    else if (original.includes('前天')) days = 3;
    else if (original.includes('上周') || original.includes('上个星期')) days = 14;
    else if (original.includes('最近') || original.includes('近来')) days = 7;
    
    const results = await this.retriever.search(keyword, { days, limit: 10 });
    
    return {
      type: 'time',
      question: original,
      keyword,
      days,
      results,
      answer: this.formatTimeAnswer(results, keyword, days)
    };
  }

  /**
   * 处理内容查询
   */
  async handleContentQuery(match, original) {
    const keyword = match[1] || '';
    const results = await this.retriever.search(keyword, { limit: 5 });
    
    return {
      type: 'content',
      question: original,
      keyword,
      results,
      answer: this.formatContentAnswer(results, keyword)
    };
  }

  /**
   * 处理统计查询
   */
  async handleStatsQuery(match, original) {
    const keyword = match[1] || '';
    const results = await this.retriever.search(keyword, { limit: 100 });
    
    return {
      type: 'stats',
      question: original,
      keyword,
      count: results.length,
      answer: `关于"${keyword}"的记忆共有 ${results.length} 条`
    };
  }

  /**
   * 处理待办查询
   */
  async handleTodoQuery(match, original) {
    const TaskExtractor = require('./task-extractor');
    const extractor = new TaskExtractor();
    
    let tasks = [];
    
    if (original.includes('今天') || original.includes('明天')) {
      tasks = await extractor.getUpcomingTasks(2);
    } else {
      tasks = await extractor.getTasks('pending');
    }
    
    return {
      type: 'todo',
      question: original,
      tasks,
      answer: this.formatTodoAnswer(tasks)
    };
  }

  /**
   * 默认搜索
   */
  async defaultSearch(question) {
    const results = await this.retriever.search(question, { limit: 5 });
    
    return {
      type: 'search',
      question,
      results,
      answer: this.formatSearchAnswer(results)
    };
  }

  /**
   * 格式化时间查询答案
   */
  formatTimeAnswer(results, keyword, days) {
    if (results.length === 0) {
      return `最近${days}天内没有找到关于"${keyword}"的记忆。`;
    }
    
    let answer = `最近${days}天内关于"${keyword}"的记忆：\n\n`;
    results.slice(0, 5).forEach((r, i) => {
      answer += `${i + 1}. [${r.date}] ${r.summary.slice(0, 100)}...\n`;
    });
    
    if (results.length > 5) {
      answer += `\n...还有 ${results.length - 5} 条相关记忆`;
    }
    
    return answer;
  }

  /**
   * 格式化内容查询答案
   */
  formatContentAnswer(results, keyword) {
    if (results.length === 0) {
      return `没有找到关于"${keyword}"的记忆。`;
    }
    
    const top = results[0];
    return `关于"${keyword}"，${top.date}的记录显示：\n\n${top.content.slice(0, 300)}...`;
  }

  /**
   * 格式化待办答案
   */
  formatTodoAnswer(tasks) {
    if (tasks.length === 0) {
      return '当前没有待办事项。';
    }
    
    let answer = `你有 ${tasks.length} 个待办事项：\n\n`;
    tasks.slice(0, 10).forEach((t, i) => {
      const due = t.due ? ` (${t.due})` : '';
      answer += `${i + 1}. ${t.title}${due}\n`;
    });
    
    return answer;
  }

  /**
   * 格式化搜索答案
   */
  formatSearchAnswer(results) {
    if (results.length === 0) {
      return '没有找到相关记忆。';
    }
    
    let answer = `找到 ${results.length} 条相关记忆：\n\n`;
    results.forEach((r, i) => {
      answer += `${i + 1}. [${r.date}] ${r.summary.slice(0, 80)}...\n`;
    });
    
    return answer;
  }
}

module.exports = NaturalQuery;
