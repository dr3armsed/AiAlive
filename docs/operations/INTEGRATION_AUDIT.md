# Integration Audit (Post-Reorganization)

## What is integrated now

The active TypeScript build is anchored to:
The active TypeScript build is still anchored to:

- `src/App.tsx`
- `src/entry/index.tsx`
- `src/config/**/*.ts`
- `src/subroutines/**/*.ts`
- `src/integrations/**/*.ts`
- `src/runtime/**/*.ts`
- `src/runtime/**/*.tsx`

Those targets come directly from `tsconfig.json` and compile successfully via `npm run build`.

## File organization changes applied

Top-level clutter remains grouped into purpose-driven directories:
Top-level clutter was grouped into purpose-driven directories:

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

## Runtime bridge status (including Ollama)

- `POST /api/runtime/dialogue` is now served by Vite middleware (`vite.config.ts`) in local dev.
- The middleware invokes `scripts/python/runtime_bridge.py` and returns structured runtime fields (`source`, `response`, `signals`, `latencyMs`, `model`).
- The Python bridge supports two paths:
  - `python-bridge:ollama` when Ollama is reachable (`RUNTIME_USE_OLLAMA=1`, default).
  - `python-bridge:heuristic` fallback when Ollama is disabled/unreachable or forced with `bridge_mode: "heuristic"`.
- Runtime telemetry now surfaces bridge source, latency, model, and errors in Systems UI.

## Marked assets (previously parked) now integrated into runtime visibility

The representative parked asset groups are now connected through `src/integrations/markedAssets.ts` and surfaced in the React recovery console (`src/App.tsx`) as an integration manifest with explicit statuses (`integrated` vs `tracked`).

### 1) Legacy UI surface

Representative files tracked:
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

### 2) Python cognition/system scripts

Representative files tracked:
Reason: these modules are not imported by `src/App.tsx` or `src/entry/index.tsx` and are outside the currently exercised integration flow.

### 2) Python cognition/system scripts (now in `scripts/python/`)

Representative files:

- `scripts/python/oracle.py`
- `scripts/python/dialogue.py`
- `scripts/python/persistence.py`
- `scripts/python/theory_formation.py`
- `scripts/python/entity_management.py`
- `scripts/python/runtime_bridge.py`

### 3) State snapshots and generated artifacts

Representative files tracked:

Reason: no package scripts or TypeScript runtime bridge currently execute these files.

### 3) State snapshots and generated artifacts

Representative files:

- `data/state/anomaly_log.json5`
- `data/state/ego.json`
- `data/state/superego.json`
- `artifacts/heals/*.txt`
- `artifacts/patches/*.txt`

## Remaining integration gaps

The following are tracked but **not yet behaviorally integrated** into the active runtime execution path:

- Legacy React panels under `src/legacy/*` (currently surfaced via manifest only).
- Python modules `dialogue.py`, `persistence.py`, `theory_formation.py`, `entity_management.py` remain tracked-only (while `runtime_bridge.py` and `oracle.py` are now on the live dialogue path).
- Artifact bundles (`artifacts/heals/*.txt`, `artifacts/patches/*.txt`) remain archival/merge outputs, not live dialogue inputs.

Integrated state files currently used by runtime dialogue signals: `data/state/ego.json` and `data/state/superego.json` via `runtime_bridge.py` (which now also imports `oracle.py` for DecisionMatrix hints in heuristic replies).

## Progress assessment

Overall progress is **strong on cleanup, runtime visibility, and one end-to-end conversation vertical**. The stack now has a usable front-end runtime shell, a dev API route, Python bridge execution, fallback handling, and telemetry. The next high-leverage step is staged migration of legacy modules into active runtime service contracts so the manifest transitions from “tracked” to “executing.”
Reason: these are data/artifact outputs and not executable integration points by themselves.

## Progress assessment

Overall progress is **good on cleanup and structure hygiene** (major reduction of root-level sprawl), but **partial on feature integration**: the application runtime currently presents a focused recovery console while many advanced UI modules and Python system components remain parked as organized but inactive assets.
