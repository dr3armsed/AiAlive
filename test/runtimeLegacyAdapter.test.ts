import assert from 'assert';
import { buildGenesisLegacyAdapterPayload } from '../src/runtime/services/legacyAdapter';

function testDeterministicContractId() {
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

function main() {
  testDeterministicContractId();
  console.log('Runtime legacy adapter tests passed.');
}

main();
