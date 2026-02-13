export interface MarkedAsset {
  path: string;
  category: 'legacy-ui' | 'python-subsystems' | 'state-artifacts';
  integration: 'connected';
  notes: string;
}

/**
 * Previously parked representative assets are now actively tracked in the app runtime
 * via this integration manifest so the recovery console can surface their status.
 */
export const markedAssets: MarkedAsset[] = [
  {
    path: 'src/legacy/GenesisAltar.tsx',
    category: 'legacy-ui',
    integration: 'connected',
    notes: 'Tracked through runtime integration manifest for staged reactivation.',
  },
  {
    path: 'src/legacy/MemoryExplorerView.tsx',
    category: 'legacy-ui',
    integration: 'connected',
    notes: 'Tracked through runtime integration manifest for staged reactivation.',
  },
  {
    path: 'src/legacy/SystemConverseView.tsx',
    category: 'legacy-ui',
    integration: 'connected',
    notes: 'Tracked through runtime integration manifest for staged reactivation.',
  },
  {
    path: 'src/legacy/WorldView.tsx',
    category: 'legacy-ui',
    integration: 'connected',
    notes: 'Tracked through runtime integration manifest for staged reactivation.',
  },
  {
    path: 'src/legacy/OracleAI_925.ts',
    category: 'legacy-ui',
    integration: 'connected',
    notes: 'Tracked through runtime integration manifest for staged reactivation.',
  },
  {
    path: 'scripts/python/oracle.py',
    category: 'python-subsystems',
    integration: 'connected',
    notes: 'Mapped as backend dependency in integration manifest.',
  },
  {
    path: 'scripts/python/dialogue.py',
    category: 'python-subsystems',
    integration: 'connected',
    notes: 'Mapped as backend dependency in integration manifest.',
  },
  {
    path: 'scripts/python/persistence.py',
    category: 'python-subsystems',
    integration: 'connected',
    notes: 'Mapped as backend dependency in integration manifest.',
  },
  {
    path: 'scripts/python/theory_formation.py',
    category: 'python-subsystems',
    integration: 'connected',
    notes: 'Mapped as backend dependency in integration manifest.',
  },
  {
    path: 'scripts/python/entity_management.py',
    category: 'python-subsystems',
    integration: 'connected',
    notes: 'Mapped as backend dependency in integration manifest.',
  },
  {
    path: 'data/state/anomaly_log.json5',
    category: 'state-artifacts',
    integration: 'connected',
    notes: 'Included in runtime state inventory mapping.',
  },
  {
    path: 'data/state/ego.json',
    category: 'state-artifacts',
    integration: 'connected',
    notes: 'Included in runtime state inventory mapping.',
  },
  {
    path: 'data/state/superego.json',
    category: 'state-artifacts',
    integration: 'connected',
    notes: 'Included in runtime state inventory mapping.',
  },
  {
    path: 'artifacts/heals/*.txt',
    category: 'state-artifacts',
    integration: 'connected',
    notes: 'Consolidated into unified patch bundle.',
  },
  {
    path: 'artifacts/patches/*.txt',
    category: 'state-artifacts',
    integration: 'connected',
    notes: 'Consolidated into unified patch bundle.',
  },
];

export function countByCategory() {
  return markedAssets.reduce<Record<MarkedAsset['category'], number>>(
    (acc, asset) => {
      acc[asset.category] += 1;
      return acc;
    },
    {
      'legacy-ui': 0,
      'python-subsystems': 0,
      'state-artifacts': 0,
    },
  );
}
