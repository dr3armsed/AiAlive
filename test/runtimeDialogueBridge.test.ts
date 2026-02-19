import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';

function runBridge(payload: Record<string, unknown>, envOverride: Record<string, string> = {}) {
  return spawnSync('python3', ['scripts/python/runtime_bridge.py'], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env: { ...process.env, RUNTIME_USE_OLLAMA: '0', ...envOverride },
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
  assert.ok(typeof parsed.response === 'string' && parsed.response.includes('Unknown'));
  assert.ok(parsed.response.includes('Oracle-hint='));
  assert.ok(parsed.response.includes('Theory-hint='));
  assert.ok(parsed.response.includes('Artifact-context='));
  assert.ok(parsed.response.includes('retrieval='));
  assert.ok(parsed.signals && typeof parsed.signals.emotion === 'string');
  assert.ok(typeof parsed.latencyMs === 'number');
  assert.strictEqual(parsed.model, null);
}

function testPythonBridgeRespondsForCustomEgregore() {
  const run = runBridge({
    prompt: 'Test strategic mode',
    egregore: { id: 'egregore_custom', name: 'Custom' },
  });

  assert.strictEqual(run.status, 0, run.stderr);
  const parsed = JSON.parse(run.stdout);
  assert.strictEqual(parsed.source, 'python-bridge:heuristic');
  assert.ok(typeof parsed.response === 'string' && parsed.response.includes('Custom'));
  assert.ok(parsed.response.includes('Oracle-hint='));
  assert.ok(parsed.response.includes('Theory-hint='));
  assert.ok(parsed.response.includes('Artifact-context='));
  assert.ok(parsed.response.includes('retrieval='));
  assert.ok(parsed.signals && typeof parsed.signals.emotion === 'string');
}

function testPythonBridgeOllamaSourceSelection() {
  const run = runBridge(
    {
      prompt: 'Check source selection',
      egregore: { id: 'egregore_custom', name: 'Custom' },
    },
    { RUNTIME_USE_OLLAMA: '1' },
  );

  assert.strictEqual(run.status, 0, run.stderr);
  const parsed = JSON.parse(run.stdout);
  assert.strictEqual(parsed.source, 'python-bridge:ollama');
}

function testPythonBridgeRespectsSteeringModes() {
  const run = runBridge({
    prompt: '[style=poetic;source=local-first;memoryDepth=7] Unknown, report your status',
    egregore: { id: 'egregore_unknown', name: 'Unknown' },
  });

  assert.strictEqual(run.status, 0, run.stderr);
  const parsed = JSON.parse(run.stdout);
  assert.strictEqual(parsed.source, 'python-bridge:ollama');
  assert.ok(parsed.response.includes('Style=poetic'));
  assert.ok(parsed.response.includes('Memory-depth=7'));
  assert.ok(!parsed.response.includes('[style='));
}

function testPythonBridgeSteeringOverridesEnvSelection() {
  const externalFirst = runBridge(
    {
      prompt: '[style=tactical;source=external-first;memoryDepth=4] Route check',
      egregore: { id: 'egregore_custom', name: 'Custom' },
    },
    { RUNTIME_USE_OLLAMA: '1' },
  );

  assert.strictEqual(externalFirst.status, 0, externalFirst.stderr);
  const externalParsed = JSON.parse(externalFirst.stdout);
  assert.strictEqual(externalParsed.source, 'python-bridge:heuristic');
  assert.ok(externalParsed.response.includes('Style=tactical'));

  const invalidSteering = runBridge({
    prompt: '[style=unknown;source=mystery;memoryDepth=999] Unknown, normalize this',
    egregore: { id: 'egregore_unknown', name: 'Unknown' },
  });

  assert.strictEqual(invalidSteering.status, 0, invalidSteering.stderr);
  const invalidParsed = JSON.parse(invalidSteering.stdout);
  assert.ok(invalidParsed.response.includes('Style=adaptive'));
  assert.ok(invalidParsed.response.includes('Memory-depth=10'));
}

function testPythonBridgeUsesPortableDataOverride() {
  const portableDataRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'genmeta-portable-data-'));
  const stateDir = path.join(portableDataRoot, 'state');
  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(path.join(stateDir, 'id.json'), JSON.stringify({ desires: ['a', 'b', 'c', 'd'] }));
  fs.writeFileSync(path.join(stateDir, 'ego.json'), JSON.stringify({ filter_strength: 0.9 }));
  fs.writeFileSync(path.join(stateDir, 'superego.json'), JSON.stringify({ moral_constraints: ['x', 'y'] }));

  const run = runBridge(
    {
      prompt: 'portable state test',
      egregore: { id: 'egregore_custom', name: 'Custom' },
    },
    { GENMETA_PORTABLE_DATA: portableDataRoot },
  );

  assert.strictEqual(run.status, 0, run.stderr);
  const parsed = JSON.parse(run.stdout);
  assert.strictEqual(parsed.signals.id_desire_count, 4);
  assert.strictEqual(parsed.signals.superego_rule_count, 2);
  assert.strictEqual(parsed.signals.ego_filter_strength, 0.9);
}

function testPythonBridgeHandlesInvalidJsonInput() {
  const run = spawnSync('python3', ['scripts/python/runtime_bridge.py'], {
    input: '{bad-json',
    encoding: 'utf8',
  });

  assert.strictEqual(run.status, 0, run.stderr);
  const parsed = JSON.parse(run.stdout);
  assert.strictEqual(parsed.source, 'python-bridge:error');
  assert.strictEqual(parsed.error, 'invalid_json');
  assert.ok(parsed.signals && typeof parsed.signals.emotion === 'string');
}

function main() {
  testPythonBridgeRespondsForUnknown();
  testPythonBridgeRespondsForCustomEgregore();
  testPythonBridgeOllamaSourceSelection();
  testPythonBridgeRespectsSteeringModes();
  testPythonBridgeSteeringOverridesEnvSelection();
  testPythonBridgeUsesPortableDataOverride();
  testPythonBridgeHandlesInvalidJsonInput();
  console.log('Runtime dialogue bridge tests passed.');
}

main();
