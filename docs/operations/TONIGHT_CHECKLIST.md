# Tonight Sprint Checklist

## Goal
Keep the platform stable while making forward progress on legacy reactivation and deeper runtime integration.

## 1) Baseline health gate
Run these checks before and after any implementation changes:

```bash
npm run build
npm run test:runtime
npm run test:integration
npm run test:bridge
npm run test:recovery
```

## 2) P0 implementation target (single-threaded)
Choose exactly one tracked legacy surface and wire a runtime-safe adapter for it:

- `src/legacy/GenesisAltar.tsx`
- `src/legacy/SystemConverseView.tsx`
- `src/legacy/WorldView.tsx`

Acceptance criteria:

- No compile regressions.
- New adapter has a deterministic input/output contract.
- Adapter can be rendered from the runtime shell behind an explicit tab/flag.

## 3) Bridge depth target
Improve behavior without changing route shape:

- Keep `POST /api/runtime/dialogue` response fields stable (`source`, `response`, `signals`, `latencyMs`, `model`).
- Add one retrieval-backed context source for responses (beyond count-only hints).

## 4) Artifact pipeline target
Move one step from archival hints toward operational memory:

- Add a minimal retrieval helper over `artifacts/heals/*.txt` and `artifacts/patches/*.txt`.
- Feed the top result into the dialogue hint path with bounded token length.

## 5) Exit criteria for tonight
- Build passes.
- All runtime tests pass.
- Changes are documented in integration notes.
- Legacy migration scope remains intentionally narrow (no broad rewrites).
