# Project Structure and Organization

## Current top-level state

The repository is now grouped by role: executable app code, legacy UI/code, runtime data, generated artifacts, docs, and scripts.

## Implemented structure

```text
AiAlive/
├── artifacts/
│   ├── archive/
│   ├── heals/
│   ├── logs/
│   └── patches/
├── archive/
│   └── backups/
├── data/
│   └── state/
├── docs/
│   ├── architecture/
│   ├── notes/
│   └── operations/
├── scripts/
│   └── python/
├── src/
│   ├── agent/
│   ├── biology/
│   ├── cognition/
│   ├── config/
│   ├── core/
│   ├── emotion/
│   ├── entry/
│   ├── legacy/
│   ├── models/
│   ├── subroutines/
│   └── systems/
├── index.html
├── index.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Ongoing conventions

- Keep active TypeScript application modules under `src/` domain folders.
- Keep inactive/older UI modules in `src/legacy/` until integrated.
- Keep generated recovery artifacts in `artifacts/` by artifact type.
- Keep runtime JSON/JSON5 state dumps in `data/state/`.
- Keep standalone Python orchestration/research scripts in `scripts/python/`.
- Keep architecture and operational references under `docs/`.

- Keep archived one-off backups under `archive/backups/` grouped by file type.
- Keep ad-hoc planning/reference notes under `docs/notes/`.
