export interface MarkedAsset {
  path: string;
  category: 'legacy-ui' | 'python-subsystems' | 'state-artifacts';
  integration: 'integrated' | 'tracked';
  integration: 'connected';
  notes: string;
}

/**
 * Integration manifest for staged runtime reactivation.
 * - integrated: behavior is on an active execution path.
 * - tracked: listed for visibility but not yet behaviorally wired.
 * Previously parked representative assets are now actively tracked in the app runtime
 * via this integration manifest so the recovery console can surface their status.
 */
export const markedAssets: MarkedAsset[] = [
  {
    path: 'src/legacy/GenesisAltar.tsx',
    category: 'legacy-ui',
    integration: 'tracked',
    notes: 'Legacy component preserved and inventoried; pending runtime adapter wiring.',
    integration: 'connected',
    notes: 'Tracked through runtime integration manifest for staged reactivation.',
  },
  {
    path: 'src/legacy/MemoryExplorerView.tsx',
    category: 'legacy-ui',
    integration: 'tracked',
    notes: 'Legacy component preserved and inventoried; pending runtime adapter wiring.',
    integration: 'connected',
    notes: 'Tracked through runtime integration manifest for staged reactivation.',
  },
  {
    path: 'src/legacy/SystemConverseView.tsx',
    category: 'legacy-ui',
    integration: 'tracked',
    notes: 'Legacy component preserved and inventoried; pending runtime adapter wiring.',
    integration: 'connected',
    notes: 'Tracked through runtime integration manifest for staged reactivation.',
  },
  {
    path: 'src/legacy/WorldView.tsx',
    category: 'legacy-ui',
    integration: 'tracked',
    notes: 'Legacy component preserved and inventoried; pending runtime adapter wiring.',
    integration: 'connected',
    notes: 'Tracked through runtime integration manifest for staged reactivation.',
  },
  {
    path: 'src/legacy/OracleAI_925.ts',
    category: 'legacy-ui',
    integration: 'tracked',
    notes: 'Legacy logic preserved and inventoried; pending typed service extraction.',
    integration: 'connected',
    notes: 'Tracked through runtime integration manifest for staged reactivation.',
  },
  {
    path: 'scripts/python/oracle.py',
    category: 'python-subsystems',
    integration: 'integrated',
    notes: 'Imported by runtime_bridge for DecisionMatrix-derived oracle hints.',
    integration: 'connected',
    notes: 'Mapped as backend dependency in integration manifest.',
  },
  {
    path: 'scripts/python/dialogue.py',
    category: 'python-subsystems',
    integration: 'tracked',
    notes: 'Catalogued Python subsystem; not yet invoked from runtime middleware.',
    integration: 'connected',
    notes: 'Mapped as backend dependency in integration manifest.',
  },
  {
    path: 'scripts/python/persistence.py',
    category: 'python-subsystems',
    integration: 'tracked',
    notes: 'Catalogued Python subsystem; not yet invoked from runtime middleware.',
    integration: 'connected',
    notes: 'Mapped as backend dependency in integration manifest.',
  },
  {
    path: 'scripts/python/theory_formation.py',
    category: 'python-subsystems',
    integration: 'tracked',
    notes: 'Catalogued Python subsystem; not yet invoked from runtime middleware.',
    integration: 'connected',
    notes: 'Mapped as backend dependency in integration manifest.',
  },
  {
    path: 'scripts/python/entity_management.py',
    category: 'python-subsystems',
    integration: 'tracked',
    notes: 'Catalogued Python subsystem; not yet invoked from runtime middleware.',
  },
  {
    path: 'scripts/python/runtime_bridge.py',
    category: 'python-subsystems',
    integration: 'integrated',
    notes: 'Live dialogue execution path via /api/runtime/dialogue middleware.',
    integration: 'connected',
    notes: 'Mapped as backend dependency in integration manifest.',
  },
  {
    path: 'data/state/anomaly_log.json5',
    category: 'state-artifacts',
    integration: 'tracked',
    notes: 'Indexed as artifact/state inventory; no active writeback path yet.',
    integration: 'connected',
    notes: 'Included in runtime state inventory mapping.',
  },
  {
    path: 'data/state/ego.json',
    category: 'state-artifacts',
    integration: 'integrated',
    notes: 'Read by runtime_bridge signal derivation during dialogue turns.',
    integration: 'connected',
    notes: 'Included in runtime state inventory mapping.',
  },
  {
    path: 'data/state/superego.json',
    category: 'state-artifacts',
    integration: 'integrated',
    notes: 'Read by runtime_bridge signal derivation during dialogue turns.',
    integration: 'connected',
    notes: 'Included in runtime state inventory mapping.',
  },
  {
    path: 'artifacts/heals/*.txt',
    category: 'state-artifacts',
    integration: 'tracked',
    notes: 'Organized and mergeable; not consumed by runtime turn processing.',
    integration: 'connected',
    notes: 'Consolidated into unified patch bundle.',
  },
  {
    path: 'artifacts/patches/*.txt',
    category: 'state-artifacts',
    integration: 'tracked',
    notes: 'Organized and mergeable; not consumed by runtime turn processing.',
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
