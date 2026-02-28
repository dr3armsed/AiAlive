import assert from 'assert';
import {
  buildGenesisLegacyAdapterPayload,
  buildSystemConverseLegacyAdapterPayload,
  buildWorldViewLegacyAdapterPayload,
} from '../src/runtime/services/legacyAdapter';

function testDeterministicGenesisContractId() {
  const one = buildGenesisLegacyAdapterPayload({
    legacyPath: 'src/legacy/GenesisAltar.tsx',
    originStorySeed: '  A Spark  Awakens ',
    personaAnchor: 'Steady Curiosity',
  });

  const two = buildGenesisLegacyAdapterPayload({
    legacyPath: 'src/legacy/GenesisAltar.tsx',
    originStorySeed: 'a spark awakens',
    personaAnchor: 'steady   curiosity',
  });

  assert.strictEqual(one.contractId, two.contractId);
  assert.strictEqual(one.routeHint, 'genesis-adapter');
  assert.strictEqual(one.target, 'GenesisAltar');
  assert.strictEqual(one.adapterVersion, 'v1');
}

function testDeterministicSystemConverseContractId() {
  const one = buildSystemConverseLegacyAdapterPayload({
    legacyPath: 'src/legacy/SystemConverseView.tsx',
    focusAgentId: '  EGREGORE_UNKNOWN ',
    sessionObjective: 'Align  Strategic   Behaviors',
  });

  const two = buildSystemConverseLegacyAdapterPayload({
    legacyPath: 'src/legacy/SystemConverseView.tsx',
    focusAgentId: 'egregore_unknown',
    sessionObjective: 'align strategic behaviors',
  });

  assert.strictEqual(one.contractId, two.contractId);
  assert.strictEqual(one.routeHint, 'system-converse-adapter');
  assert.strictEqual(one.target, 'SystemConverseView');
  assert.strictEqual(one.adapterVersion, 'v1');
}

function testDeterministicWorldViewContractId() {
  const one = buildWorldViewLegacyAdapterPayload({
    legacyPath: 'src/legacy/WorldView.tsx',
    worldSeed: '  Liminal Sky Garden ',
    zoneFocus: 'OnoSphere-Core',
  });

  const two = buildWorldViewLegacyAdapterPayload({
    legacyPath: 'src/legacy/WorldView.tsx',
    worldSeed: 'liminal sky garden',
    zoneFocus: 'onosphere-core',
  });

  assert.strictEqual(one.contractId, two.contractId);
  assert.strictEqual(one.routeHint, 'worldview-adapter');
  assert.strictEqual(one.target, 'WorldView');
  assert.strictEqual(one.adapterVersion, 'v1');
}

function main() {
  testDeterministicGenesisContractId();
  testDeterministicSystemConverseContractId();
  testDeterministicWorldViewContractId();
  console.log('Runtime legacy adapter tests passed.');
}

main();
