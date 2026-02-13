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
function testPythonBridgeRespondsForUnknown() {
  const payload = {
    prompt: 'Unknown, what is your strategic stance?',
    egregore: { id: 'egregore_unknown', name: 'Unknown' },
  };

  const run = spawnSync('python3', ['scripts/python/runtime_bridge.py'], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
  });

  assert.strictEqual(run.status, 0, run.stderr);
  const parsed = JSON.parse(run.stdout);
  assert.strictEqual(parsed.source, 'python-bridge:heuristic');
  assert.ok(typeof parsed.response === 'string' && parsed.response.includes('Unknown'));
  assert.ok(parsed.response.includes('Oracle-hint='));
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
  assert.strictEqual(parsed.source, 'python-bridge');
  assert.ok(typeof parsed.response === 'string' && parsed.response.includes('Unknown'));
  assert.ok(parsed.signals && typeof parsed.signals.emotion === 'string');
}

function main() {
  testPythonBridgeRespondsForUnknown();
  testForcedHeuristicMode();
  console.log('Runtime dialogue bridge tests passed.');
}

main();
