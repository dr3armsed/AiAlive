# Integration Audit (Current)

## Active runtime surface

The active TypeScript runtime is compiled from:

- `src/App.tsx`
- `src/entry/index.tsx`
- `src/config/**/*.ts`
- `src/subroutines/**/*.ts`
- `src/integrations/**/*.ts`
- `src/runtime/**/*.ts`
- `src/runtime/**/*.tsx`

These paths are defined in `tsconfig.json`.

## What is behaviorally integrated now

### Frontend runtime shell

- Multi-tab runtime console in `src/App.tsx`.
- Runtime state and orchestration are driven by `src/runtime/hooks/useMetacosmRuntime.ts`.
- Systems telemetry is surfaced in `src/runtime/components/SystemsPanel.tsx`.

### Dialogue bridge path (live)

- `POST /api/runtime/dialogue` is served by Vite middleware in `vite.config.ts`.
- The route executes `scripts/python/runtime_bridge.py`.
- Bridge response fields currently include:
  - `source`
  - `response`
  - `signals`
  - `latencyMs`
  - `model`

### Python modules on the active bridge path

Runtime bridge now imports and uses:

- `scripts/python/dialogue.py`
- `scripts/python/entity_management.py`
- `scripts/python/persistence.py`
- `scripts/python/oracle.py` (DecisionMatrix hinting when available)
- `scripts/python/theory_formation.py` (theory-hint cue generation)

### State files read during runtime dialogue

- `data/state/id.json`
- `data/state/ego.json`
- `data/state/superego.json`
- `data/state/anomaly_log.json5` (loaded as part of consolidated state)

## What remains tracked-only

The following are organized and visible in the integration manifest but not on an active behavior path:

- Legacy React modules under `src/legacy/*`.
- Some Python subsystems (for example `scripts/python/entity_management.py` extension flows) still run in limited mode and are not yet full feature routes.
- Artifact bundles now provide lightweight retrieval context (latest patch/heal excerpt) in addition to heal/patch counts for bridge-level dialogue hints.

## Progress summary

Project status is now **stable on core runtime execution** (UI + middleware + Python bridge + telemetry), with recent upgrades adding theory + artifact context into live bridge responses. Remaining work is concentrated on:

1. staged reactivation/migration of legacy UI modules into executable views,
2. deeper behavioral activation for additional Python subsystems beyond hint-level integration,
3. expanding artifact retrieval from latest-entry excerpts into ranked memory retrieval and writeback policies.
