export interface MarkedAsset {
  path: string;
  category: 'legacy-ui' | 'python-subsystems' | 'state-artifacts';
  integration: 'integrated' | 'tracked';
  notes: string;
}

/**
 * Integration manifest for staged runtime reactivation.
 * - integrated: behavior is on an active execution path.
 * - tracked: listed for visibility but not yet behaviorally wired.
 */
export const markedAssets: MarkedAsset[] = [
  {
    path: 'src/legacy/GenesisAltar.tsx',
    category: 'legacy-ui',
    integration: 'tracked',
    notes: 'Legacy component preserved and inventoried; pending runtime adapter wiring.',
  },
  {
    path: 'src/legacy/MemoryExplorerView.tsx',
    category: 'legacy-ui',
    integration: 'tracked',
    notes: 'Legacy component preserved and inventoried; pending runtime adapter wiring.',
  },
  {
    path: 'src/legacy/SystemConverseView.tsx',
    category: 'legacy-ui',
    integration: 'tracked',
    notes: 'Legacy component preserved and inventoried; pending runtime adapter wiring.',
  },
  {
    path: 'src/legacy/WorldView.tsx',
    category: 'legacy-ui',
    integration: 'tracked',
    notes: 'Legacy component preserved and inventoried; pending runtime adapter wiring.',
  },
  {
    path: 'src/legacy/OracleAI_925.ts',
    category: 'legacy-ui',
    integration: 'tracked',
    notes: 'Legacy logic preserved and inventoried; pending typed service extraction.',
  },
  {
    path: 'scripts/python/oracle.py',
    category: 'python-subsystems',
    integration: 'integrated',
    notes: 'Imported by runtime bridge for dialogue hint generation.'
  },
  {
    path: 'scripts/python/dialogue.py',
    category: 'python-subsystems',
    integration: 'integrated',
    notes: 'Imported on the runtime bridge execution path.',
  },
  {
    path: 'scripts/python/persistence.py',
    category: 'python-subsystems',
    integration: 'integrated',
    notes: 'Imported on the runtime bridge execution path.',
  },
  {
    path: 'scripts/python/theory_formation.py',
    category: 'python-subsystems',
    integration: 'integrated',
    notes: 'Imported by runtime bridge to derive theory-formation hints.',
  },
  {
    path: 'scripts/python/entity_management.py',
    category: 'python-subsystems',
    integration: 'integrated',
    notes: 'Imported on the runtime bridge execution path.',
  },
  {
    path: 'scripts/python/runtime_bridge.py',
    category: 'python-subsystems',
    integration: 'integrated',
    notes: 'Live dialogue execution path via /api/runtime/dialogue middleware.',
  },
  {
    path: 'data/state/anomaly_log.json5',
    category: 'state-artifacts',
    integration: 'tracked',
    notes: 'Indexed as artifact/state inventory; no active writeback path yet.',
  },
  {
    path: 'data/state/ego.json',
    category: 'state-artifacts',
    integration: 'integrated',
    notes: 'Read by runtime_bridge signal derivation during dialogue turns.',
  },
  {
    path: 'data/state/superego.json',
    category: 'state-artifacts',
    integration: 'integrated',
    notes: 'Read by runtime_bridge signal derivation during dialogue turns.',
  },
  {
    path: 'artifacts/heals/*.txt',
    category: 'state-artifacts',
    integration: 'integrated',
    notes: 'Counted by persistence artifact context for runtime bridge hints.',
  },
  {
    path: 'artifacts/patches/*.txt',
    category: 'state-artifacts',
    integration: 'integrated',
    notes: 'Counted by persistence artifact context for runtime bridge hints.',
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

export function countByIntegration() {
  return markedAssets.reduce<Record<MarkedAsset['integration'], number>>(
    (acc, asset) => {
      acc[asset.integration] += 1;
      return acc;
    },
    {
      integrated: 0,
      tracked: 0,
    },
  );
}

export function listUnintegratedAssets() {
  return markedAssets.filter((asset) => asset.integration === 'tracked');
}
