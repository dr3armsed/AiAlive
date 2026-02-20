import assert from 'assert';
import { countByIntegration, listUnintegratedAssets, markedAssets } from '../src/integrations/markedAssets';

function testIntegrationManifestStatusModel() {
  const counts = countByIntegration();
  assert.ok(counts.integrated > 0, 'Expected at least one integrated asset');
  assert.ok(counts.tracked > 0, 'Expected tracked assets still pending integration');

  const unintegrated = listUnintegratedAssets();
  assert.strictEqual(unintegrated.length, counts.tracked);

  const bridgeAsset = markedAssets.find((a) => a.path === 'scripts/python/runtime_bridge.py');
  assert.ok(bridgeAsset);
  assert.strictEqual(bridgeAsset?.integration, 'integrated');

  const oracleAsset = markedAssets.find((a) => a.path === 'scripts/python/oracle.py');
  assert.ok(oracleAsset);
  assert.strictEqual(oracleAsset?.integration, 'integrated');

  const dialogueAsset = markedAssets.find((a) => a.path === 'scripts/python/dialogue.py');
  assert.ok(dialogueAsset);
  assert.strictEqual(dialogueAsset?.integration, 'integrated');

  const persistenceAsset = markedAssets.find((a) => a.path === 'scripts/python/persistence.py');
  assert.ok(persistenceAsset);
  assert.strictEqual(persistenceAsset?.integration, 'integrated');
}

function main() {
  testIntegrationManifestStatusModel();
  console.log('Integration manifest tests passed.');
}

main();
