# Integration Audit (Post-Reorganization)

## What is integrated now

The active TypeScript build is still anchored to:

- `src/App.tsx`
- `src/entry/index.tsx`
- `src/config/**/*.ts`
- `src/subroutines/**/*.ts`

Those targets come directly from `tsconfig.json` and compile successfully via `npm run build`.

## File organization changes applied

Top-level clutter was grouped into purpose-driven directories:

- `artifacts/heals/` for auto-generated healing text dumps.
- `artifacts/patches/` for generated patch logs.
- `artifacts/logs/` for runtime/process logs.
- `artifacts/archive/` for archived binary/backup outputs.
- `data/state/` for runtime state JSON/JSON5 snapshots.
- `scripts/python/` for standalone/orchestration Python scripts.
- `src/legacy/` for older React/TypeScript UI modules not in the active compile path.

## Files not yet integrated with the current app runtime

The following groups are organized but still not wired into the actively compiled app:

### 1) Legacy UI surface (now in `src/legacy/`)

Representative files:

- `src/legacy/GenesisAltar.tsx`
- `src/legacy/MemoryExplorerView.tsx`
- `src/legacy/SystemConverseView.tsx`
- `src/legacy/WorldView.tsx`
- `src/legacy/OracleAI_925.ts`

Reason: these modules are not imported by `src/App.tsx` or `src/entry/index.tsx` and are outside the currently exercised integration flow.

### 2) Python cognition/system scripts (now in `scripts/python/`)

Representative files:

- `scripts/python/oracle.py`
- `scripts/python/dialogue.py`
- `scripts/python/persistence.py`
- `scripts/python/theory_formation.py`
- `scripts/python/entity_management.py`

Reason: no package scripts or TypeScript runtime bridge currently execute these files.

### 3) State snapshots and generated artifacts

Representative files:

- `data/state/anomaly_log.json5`
- `data/state/ego.json`
- `data/state/superego.json`
- `artifacts/heals/*.txt`
- `artifacts/patches/*.txt`

Reason: these are data/artifact outputs and not executable integration points by themselves.

## Progress assessment

Overall progress is **good on cleanup and structure hygiene** (major reduction of root-level sprawl), but **partial on feature integration**: the application runtime currently presents a focused recovery console while many advanced UI modules and Python system components remain parked as organized but inactive assets.
