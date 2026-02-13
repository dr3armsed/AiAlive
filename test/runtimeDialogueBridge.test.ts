import assert from 'assert';
import { spawnSync } from 'child_process';

function runBridge(payload: Record<string, unknown>) {
  return spawnSync('python3', ['scripts/python/runtime_bridge.py'], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env: { ...process.env, RUNTIME_USE_OLLAMA: '0' },
  });
}

function testPythonBridgeRespondsForUnknown() {
  const run = runBridge({
    prompt: 'Unknown, what is your strategic stance?',
    egregore: { id: 'egregore_unknown', name: 'Unknown' },
  });

  assert.strictEqual(run.status, 0, run.stderr);
  const parsed = JSON.parse(run.stdout);
  assert.strictEqual(parsed.source, 'python-bridge:heuristic');
  assert.ok(typeof parsed.response === 'string' && parsed.response.includes('Unknown['));
  assert.ok(parsed.response.includes('Oracle'));
  assert.ok(parsed.signals && typeof parsed.signals.emotion === 'string');
  assert.ok(typeof parsed.latencyMs === 'number');
}

function testForcedHeuristicMode() {
  const run = runBridge({
    prompt: 'Test forced mode',
    bridge_mode: 'heuristic',
    egregore: { id: 'egregore_custom', name: 'Custom' },
  });

  assert.strictEqual(run.status, 0, run.stderr);
  const parsed = JSON.parse(run.stdout);
  assert.strictEqual(parsed.source, 'python-bridge:heuristic');
  assert.strictEqual(parsed.model, null);
  assert.ok(parsed.response.includes('Custom'));
}

function testUnknownHeuristicVariesAcrossPrompts() {
  const a = runBridge({
    prompt: 'I am exploring paradox and wonder',
    egregore: { id: 'egregore_unknown', name: 'Unknown' },
  });
  const b = runBridge({
    prompt: 'I sense risk and threat in the system',
    egregore: { id: 'egregore_unknown', name: 'Unknown' },
  });

  assert.strictEqual(a.status, 0, a.stderr);
  assert.strictEqual(b.status, 0, b.stderr);
  const ra = JSON.parse(a.stdout);
  const rb = JSON.parse(b.stdout);
  assert.notStrictEqual(ra.response, rb.response);
}

function testExplicitChaosArchetype() {
  const run = runBridge({
    prompt: 'Talk to me about mirrors and gossip',
    unknown_archetype: 'chaos',
    egregore: { id: 'egregore_unknown', name: 'Unknown' },
  });

  assert.strictEqual(run.status, 0, run.stderr);
  const parsed = JSON.parse(run.stdout);
  assert.ok(parsed.response.includes('Unknown[chaos]'));
  assert.ok(parsed.response.includes('Oracle gossip'));
}

function main() {
  testPythonBridgeRespondsForUnknown();
  testForcedHeuristicMode();
  testUnknownHeuristicVariesAcrossPrompts();
  testExplicitChaosArchetype();
  console.log('Runtime dialogue bridge tests passed.');
}

main();
