# Integration Audit (Post-Reorganization)

## What is integrated now

The active TypeScript build is anchored to:

- `src/App.tsx`
- `src/entry/index.tsx`
- `src/config/**/*.ts`
- `src/subroutines/**/*.ts`
- `src/integrations/**/*.ts`

Those targets come directly from `tsconfig.json` and compile successfully via `npm run build`.

## File organization changes applied

Top-level clutter remains grouped into purpose-driven directories:

- `artifacts/heals/` for auto-generated healing text dumps.
- `artifacts/patches/` for generated patch logs.
- `artifacts/logs/` for runtime/process logs.
- `artifacts/archive/` for archived binary/backup outputs.
- `data/state/` for runtime state JSON/JSON5 snapshots.
- `scripts/python/` for standalone/orchestration Python scripts.
- `src/legacy/` for older React/TypeScript UI modules pending staged reactivation.

## Heal + patch consolidation

All heal and patch files are now mergable into one canonical bundle:

- Command: `npm run merge:recovery-artifacts`
- Output: `artifacts/patches/unified_recovery_patch.txt`

This enables a single-file export for historical recovery context.

## Marked assets (previously parked) now integrated into runtime visibility

The representative parked asset groups are now connected through `src/integrations/markedAssets.ts` and surfaced in the React recovery console (`src/App.tsx`) as an integration manifest.

### 1) Legacy UI surface

Representative files tracked:

- `src/legacy/GenesisAltar.tsx`
- `src/legacy/MemoryExplorerView.tsx`
- `src/legacy/SystemConverseView.tsx`
- `src/legacy/WorldView.tsx`
- `src/legacy/OracleAI_925.ts`

### 2) Python cognition/system scripts

Representative files tracked:

- `scripts/python/oracle.py`
- `scripts/python/dialogue.py`
- `scripts/python/persistence.py`
- `scripts/python/theory_formation.py`
- `scripts/python/entity_management.py`

### 3) State snapshots and generated artifacts

Representative files tracked:

- `data/state/anomaly_log.json5`
- `data/state/ego.json`
- `data/state/superego.json`
- `artifacts/heals/*.txt`
- `artifacts/patches/*.txt`

## Progress assessment

Overall progress is **good on cleanup and structure hygiene**, with improved visibility for previously parked assets via runtime manifest integration. Remaining work is **direct behavioral integration** (wiring legacy UI and Python subsystems into execution paths beyond manifest tracking).
