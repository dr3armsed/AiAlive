import assert from 'assert';
import { createMemoryPipeline, RuntimeMemoryStorage } from '../src/runtime/services/memoryPipeline';

class TestStorage implements RuntimeMemoryStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

function testPipelineStoresConversationEvents() {
  const pipeline = createMemoryPipeline(new TestStorage(), 'test.runtime.memory.v1');

  pipeline.appendEvent({
    egregoreId: 'egregore_unknown',
    egregoreName: 'Unknown',
    userMessage: 'What is our trajectory?',
    egregoreMessage: 'We progress through reinforced constraints.',
    source: 'python-bridge:heuristic',
    signals: {
      emotion: 'curious',
      id_desire_count: 2,
      superego_rule_count: 4,
      ego_filter_strength: 0.5,
    },
    styleMode: 'adaptive',
    sourceMode: 'auto',
    memoryDepth: 3,
  });

  const events = pipeline.listEvents();
  assert.strictEqual(events.length, 1);
  assert.strictEqual(events[0].egregoreName, 'Unknown');
  assert.ok(events[0].traceId.startsWith('trace_'));
}

function testPipelineBuildsPendingDatasetExamples() {
  const pipeline = createMemoryPipeline(new TestStorage(), 'test.runtime.memory.v2');

  pipeline.appendEvent({
    egregoreId: 'egregore_unknown',
    egregoreName: 'Unknown',
    userMessage: 'Summarize this path.',
    egregoreMessage: 'Path summarized.',
    source: 'python-bridge:ollama',
    signals: {
      emotion: 'focused',
      id_desire_count: 1,
      superego_rule_count: 2,
      ego_filter_strength: 0.45,
    },
    styleMode: 'tactical',
    sourceMode: 'local-first',
    memoryDepth: 5,
  });

  const dataset = pipeline.buildPendingDataset();
  assert.strictEqual(dataset.length, 1);
  assert.strictEqual(dataset[0].input.sourceMode, 'local-first');
  assert.strictEqual(dataset[0].metadata.approvalState, 'pending');
  assert.strictEqual(dataset[0].output.emotion, 'focused');
}

function testPipelineStatsAndClear() {
  const pipeline = createMemoryPipeline(new TestStorage(), 'test.runtime.memory.v3');

  pipeline.appendEvent({
    egregoreId: 'eg-1',
    egregoreName: 'Unknown',
    userMessage: 'one',
    egregoreMessage: 'two',
    source: 'python-bridge:error',
    signals: null,
    styleMode: 'adaptive',
    sourceMode: 'external-first',
    memoryDepth: 2,
  });

  const stats = pipeline.getStats();
  assert.strictEqual(stats.eventCount, 1);
  assert.strictEqual(stats.pendingDatasetExampleCount, 1);
  assert.ok(stats.lastTraceId);

  pipeline.clear();
  const cleared = pipeline.getStats();
  assert.strictEqual(cleared.eventCount, 0);
  assert.strictEqual(cleared.pendingDatasetExampleCount, 0);
  assert.strictEqual(cleared.lastTraceId, null);
}

function main() {
  testPipelineStoresConversationEvents();
  testPipelineBuildsPendingDatasetExamples();
  testPipelineStatsAndClear();
  console.log('Runtime memory pipeline tests passed.');
}

main();
