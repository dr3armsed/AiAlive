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

export interface SystemConverseLegacyAdapterInput {
  legacyPath: 'src/legacy/SystemConverseView.tsx';
  focusAgentId: string;
  sessionObjective: string;
}

export interface SystemConverseLegacyAdapterOutput {
  adapterVersion: 'v1';
  target: 'SystemConverseView';
  contractId: string;
  normalizedFocusAgentId: string;
  normalizedSessionObjective: string;
  routeHint: 'system-converse-adapter';
}

export interface WorldViewLegacyAdapterInput {
  legacyPath: 'src/legacy/WorldView.tsx';
  worldSeed: string;
  zoneFocus: string;
}

export interface WorldViewLegacyAdapterOutput {
  adapterVersion: 'v1';
  target: 'WorldView';
  contractId: string;
  normalizedWorldSeed: string;
  normalizedZoneFocus: string;
  routeHint: 'worldview-adapter';
}

function normalize(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function deterministicHash(parts: string[]) {
  const source = parts.map((part) => normalize(part)).join('|');
  let hash = 0;
  for (let i = 0; i < source.length; i += 1) {
    hash = (hash * 31 + source.charCodeAt(i)) % 2147483647;
  }
  return hash.toString(16);
}

export function buildGenesisLegacyAdapterPayload(input: GenesisLegacyAdapterInput): GenesisLegacyAdapterOutput {
  const normalizedSeed = normalize(input.originStorySeed);
  const normalizedPersonaAnchor = normalize(input.personaAnchor);

  return {
    adapterVersion: 'v1',
    target: 'GenesisAltar',
    contractId: `genesis-adapter-${deterministicHash([normalizedSeed, normalizedPersonaAnchor])}`,
    normalizedSeed,
    normalizedPersonaAnchor,
    routeHint: 'genesis-adapter',
  };
}

export function buildSystemConverseLegacyAdapterPayload(
  input: SystemConverseLegacyAdapterInput,
): SystemConverseLegacyAdapterOutput {
  const normalizedFocusAgentId = normalize(input.focusAgentId);
  const normalizedSessionObjective = normalize(input.sessionObjective);

  return {
    adapterVersion: 'v1',
    target: 'SystemConverseView',
    contractId: `system-converse-adapter-${deterministicHash([normalizedFocusAgentId, normalizedSessionObjective])}`,
    normalizedFocusAgentId,
    normalizedSessionObjective,
    routeHint: 'system-converse-adapter',
  };
}

export function buildWorldViewLegacyAdapterPayload(input: WorldViewLegacyAdapterInput): WorldViewLegacyAdapterOutput {
  const normalizedWorldSeed = normalize(input.worldSeed);
  const normalizedZoneFocus = normalize(input.zoneFocus);

  return {
    adapterVersion: 'v1',
    target: 'WorldView',
    contractId: `worldview-adapter-${deterministicHash([normalizedWorldSeed, normalizedZoneFocus])}`,
    normalizedWorldSeed,
    normalizedZoneFocus,
    routeHint: 'worldview-adapter',
  };
}
