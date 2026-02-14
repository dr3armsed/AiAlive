export interface GenesisLegacyAdapterInput {
  legacyPath: 'src/legacy/GenesisAltar.tsx';
  originStorySeed: string;
  personaAnchor: string;
}

export interface GenesisLegacyAdapterOutput {
  adapterVersion: 'v1';
  target: 'GenesisAltar';
  contractId: string;
  normalizedSeed: string;
  normalizedPersonaAnchor: string;
  routeHint: 'genesis-adapter';
}

function normalize(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function deterministicContractId(seed: string, personaAnchor: string) {
  const source = `${normalize(seed)}|${normalize(personaAnchor)}`;
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) % 2147483647;
  }
  return `genesis-adapter-${hash.toString(16)}`;
}

export function buildGenesisLegacyAdapterPayload(input: GenesisLegacyAdapterInput): GenesisLegacyAdapterOutput {
  const normalizedSeed = normalize(input.originStorySeed);
  const normalizedPersonaAnchor = normalize(input.personaAnchor);

  return {
    adapterVersion: 'v1',
    target: 'GenesisAltar',
    contractId: deterministicContractId(normalizedSeed, normalizedPersonaAnchor),
    normalizedSeed,
    normalizedPersonaAnchor,
    routeHint: 'genesis-adapter',
  };
}
