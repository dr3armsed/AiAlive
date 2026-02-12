# Project Structure and Organization

## Current top-level state

The repository has been organized into domain-oriented folders for docs, source modules, data, and archives.

## Implemented structure

```text
AiAlive/
├── archive/
│   └── src.zip
├── data/
│   ├── metadata.json
│   └── the log.txt
├── docs/
│   ├── architecture/
│   │   ├── BRAIN_SYSTEM_INTEGRATION.md
│   │   ├── ORACLE_SYSTEM_INTEGRATED.md
│   │   ├── THEORY_FORMATION_INTEGRATION.md
│   │   ├── TRI_SPHERE_ARCHITECTURE.md
│   │   └── TRI_SPHERE_INTEGRATION.md
│   ├── biology-model/
│   │   ├── DNA_SUBSTRATE_ANALYSIS.md
│   │   └── NCRNA_IMPLEMENTATION_SUMMARY.md
│   ├── operations/
│   │   ├── ARCHITECTURE_RECOVERY_USAGE.md
│   │   ├── EXTERNAL_DRIVE_PORTABLE_GUIDE.md
│   │   └── PYTHON_BACKEND_SETUP.md
│   ├── plans/
│   │   └── DISTRIBUTED_SYNAPTIC_HARVEST_PLAN.md
│   └── product/
│       ├── CONTENT_CREATION_CAPABILITIES.md
│       └── CONTENT_CREATION_COMPLETE.md
├── src/
│   ├── agent/
│   ├── biology/
│   ├── cognition/
│   ├── config/
│   ├── core/
│   ├── emotion/
│   ├── entry/
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

- Keep TypeScript modules under `src/` by domain.
- Keep architecture/product/ops references under `docs/`.
- Keep generated or historical artifacts in `archive/` and `data/`.
- When adding new folders, update `src/config/architectureBlueprint.ts` as needed.
