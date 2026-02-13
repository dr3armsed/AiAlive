import assert from 'assert';
import { spawnSync } from 'child_process';

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
  assert.strictEqual(parsed.source, 'python-bridge');
  assert.ok(typeof parsed.response === 'string' && parsed.response.includes('Unknown'));
  assert.ok(parsed.signals && typeof parsed.signals.emotion === 'string');
}

function main() {
  testPythonBridgeRespondsForUnknown();
  console.log('Runtime dialogue bridge tests passed.');
}

main();
