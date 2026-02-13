import assert from 'assert';
import { countByIntegration, listUnintegratedAssets, markedAssets } from '../src/integrations/markedAssets';

function testIntegrationManifestStatusModel() {
  const counts = countByIntegration();
  assert.ok(counts.integrated > 0, 'Expected at least one integrated asset');
  assert.ok(counts.tracked > 0, 'Expected tracked assets still pending integration');

  const unintegrated = listUnintegratedAssets();
  assert.strictEqual(unintegrated.length, counts.tracked);
  assert.ok(unintegrated.some((a) => a.path === 'scripts/python/dialogue.py'));

  const bridgeAsset = markedAssets.find((a) => a.path === 'scripts/python/runtime_bridge.py');
  assert.ok(bridgeAsset);
  assert.strictEqual(bridgeAsset?.integration, 'integrated');

  const oracleAsset = markedAssets.find((a) => a.path === 'scripts/python/oracle.py');
  assert.ok(oracleAsset);
  assert.strictEqual(oracleAsset?.integration, 'integrated');
}

function main() {
  testIntegrationManifestStatusModel();
  console.log('Integration manifest tests passed.');
}

main();
