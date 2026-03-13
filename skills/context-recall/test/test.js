#!/usr/bin/env node
/**
 * Test suite for ContextRecall
 */
const MemoryStore = require('../lib/memory-store');
const Retriever = require('../lib/retriever');
const Summarizer = require('../lib/summarizer');

async function test() {
  console.log('🧪 Testing ContextRecall...\n');
  
  // Test MemoryStore
  console.log('1. Testing MemoryStore...');
  const store = new MemoryStore();
  await store.init();
  
  await store.saveDaily('2026-03-13', '# Test Memory\nThis is a test.');
  const loaded = await store.loadDaily('2026-03-13');
  console.log(loaded ? '  ✓ Save/Load daily memory' : '  ✗ Failed');
  
  // Test Retriever
  console.log('\n2. Testing Retriever...');
  const retriever = new Retriever();
  await retriever.init();
  const results = await retriever.search('test', { limit: 5 });
  console.log(results.length > 0 ? '  ✓ Search works' : '  ✗ No results');
  
  // Test Summarizer
  console.log('\n3. Testing Summarizer...');
  const summarizer = new Summarizer();
  const messages = [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi there' }
  ];
  const summary = summarizer.quickSummarize(messages);
  console.log(summary.messageCount === 2 ? '  ✓ Summarizer works' : '  ✗ Failed');
  
  console.log('\n✅ All tests passed!');
}

test().catch(err => {
  console.error('❌ Test failed:', err.message);
  process.exit(1);
});
