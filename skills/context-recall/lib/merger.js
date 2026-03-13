/**
 * Merger - 记忆合并与去重
 * 检测相似记忆并合并
 */
const fs = require('fs').promises;
const path = require('path');

const MEMORY_DIR = process.env.MEMORY_DIR || '/mnt/memory';

class Merger {
  constructor() {
    this.dailyDir = path.join(MEMORY_DIR, 'daily');
    this.similarityThreshold = 0.8;
  }

  /**
   * 查找相似记忆
   */
  async findSimilar() {
    const files = await fs.readdir(this.dailyDir);
    const memories = [];
    
    // 加载所有记忆
    for (const file of files.filter(f => f.endsWith('.md'))) {
      const content = await fs.readFile(path.join(this.dailyDir, file), 'utf8');
      memories.push({
        date: file.replace('.md', ''),
        content,
        keywords: this.extractKeywords(content)
      });
    }
    
    // 查找相似对
    const similarPairs = [];
    for (let i = 0; i < memories.length; i++) {
      for (let j = i + 1; j < memories.length; j++) {
        const sim = this.calculateSimilarity(memories[i], memories[j]);
        if (sim >= this.similarityThreshold) {
          similarPairs.push({
            mem1: memories[i],
            mem2: memories[j],
            similarity: sim
          });
        }
      }
    }
    
    return similarPairs.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * 合并相似记忆
   */
  async merge(similarPairs, dryRun = true) {
    const results = [];
    
    for (const pair of similarPairs) {
      const { mem1, mem2, similarity } = pair;
      
      // 选择保留较新的记忆
      const keep = mem1.date > mem2.date ? mem1 : mem2;
      const remove = mem1.date > mem2.date ? mem2 : mem1;
      
      if (!dryRun) {
        // 合并内容
        const mergedContent = this.mergeContent(keep, remove);
        
        // 保存合并后的记忆
        await fs.writeFile(
          path.join(this.dailyDir, `${keep.date}.md`),
          mergedContent,
          'utf8'
        );
        
        // 删除旧记忆（移动到 archive）
        const archiveDir = path.join(MEMORY_DIR, 'archive', 'merged');
        await fs.mkdir(archiveDir, { recursive: true });
        await fs.rename(
          path.join(this.dailyDir, `${remove.date}.md`),
          path.join(archiveDir, `${remove.date}.md`)
        );
      }
      
      results.push({
        kept: keep.date,
        removed: remove.date,
        similarity,
        action: dryRun ? 'would_merge' : 'merged'
      });
    }
    
    return results;
  }

  /**
   * 提取关键词
   */
  extractKeywords(content) {
    const words = [];
    const cleaned = content.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, ' ');
    
    // 中文
    const chinese = cleaned.match(/[\u4e00-\u9fa5]{2,8}/g) || [];
    chinese.forEach(c => words.push(c));
    
    // 英文
    const english = cleaned.match(/[a-z0-9]{2,}/g) || [];
    words.push(...english);
    
    return [...new Set(words)];
  }

  /**
   * 计算相似度
   */
  calculateSimilarity(mem1, mem2) {
    const set1 = new Set(mem1.keywords);
    const set2 = new Set(mem2.keywords);
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  /**
   * 合并内容
   */
  mergeContent(keep, remove) {
    return `# ${keep.date} - Merged Memory

> 合并自 ${remove.date}（相似度: ${(this.calculateSimilarity({keywords: keep.keywords}, {keywords: remove.keywords}) * 100).toFixed(1)}%）

## 主要内容

${keep.content}

## 合并内容（来自 ${remove.date}）

${remove.content.slice(0, 500)}...

---
*Merged on ${new Date().toISOString()}*
`;
  }

  /**
   * 运行合并检查
   */
  async run(dryRun = true) {
    console.log(dryRun ? '🔍 检查相似记忆（试运行）...\n' : '🔄 合并相似记忆...\n');
    
    const similar = await this.findSimilar();
    
    if (similar.length === 0) {
      console.log('✅ 没有发现相似记忆');
      return [];
    }
    
    console.log(`发现 ${similar.length} 对相似记忆：\n`);
    
    similar.forEach((pair, i) => {
      console.log(`${i + 1}. [${(pair.similarity * 100).toFixed(1)}% 相似]`);
      console.log(`   ${pair.mem1.date} ↔ ${pair.mem2.date}`);
      console.log(`   关键词: ${pair.mem1.keywords.slice(0, 5).join(', ')}`);
    });
    
    if (!dryRun) {
      const results = await this.merge(similar, false);
      console.log(`\n✅ 已合并 ${results.length} 对记忆`);
      return results;
    }
    
    console.log(`\n💡 使用 --apply 参数执行合并`);
    return similar;
  }
}

module.exports = Merger;
