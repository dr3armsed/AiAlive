# Project Structure and Organization

## Current top-level state

The repository is currently flat: nearly all source files (`*.ts`) and architecture documents (`*.md`) live in the root.

## Proposed structure

```text
AiAlive/
├── docs/
│   ├── architecture/
│   │   ├── TRI_SPHERE_ARCHITECTURE.md
│   │   ├── TRI_SPHERE_INTEGRATION.md
│   │   ├── BRAIN_SYSTEM_INTEGRATION.md
│   │   ├── ORACLE_SYSTEM_INTEGRATED.md
│   │   └── THEORY_FORMATION_INTEGRATION.md
│   ├── biology-model/
│   │   ├── DNA_SUBSTRATE_ANALYSIS.md
│   │   └── NCRNA_IMPLEMENTATION_SUMMARY.md
│   ├── operations/
│   │   ├── PYTHON_BACKEND_SETUP.md
│   │   └── EXTERNAL_DRIVE_PORTABLE_GUIDE.md
│   └── product/
│       ├── CONTENT_CREATION_CAPABILITIES.md
│       └── CONTENT_CREATION_COMPLETE.md
├── src/
│   ├── core/
│   │   ├── core.ts
│   │   ├── consciousness.ts
│   │   ├── metacosm.ts
│   │   └── agentMind.ts
│   ├── cognition/
│   │   ├── beliefSystem.ts
│   │   ├── theoryFormation.ts
│   │   ├── imagination.ts
│   │   ├── heuristicEngine.ts
│   │   ├── cognitiveDissonanceDetector.ts
│   │   └── contradictionForker.ts
│   ├── emotion/
│   │   ├── emotion_core.ts
│   │   ├── emotion_event.ts
│   │   ├── emotion_lexicon.ts
│   │   └── emotionLogicModulator.ts
│   ├── biology/
│   │   ├── digital_xna.ts
│   │   ├── digital_epigenetics.ts
│   │   ├── digital_chondria.ts
│   │   ├── digital_mirna.ts
│   │   ├── digital_trna.ts
│   │   ├── digital_rrna.ts
│   │   ├── digital_sirna.ts
│   │   ├── digital_pirna.ts
│   │   ├── digital_incrna.ts
│   │   └── digital_circrna.ts
│   ├── agent/
│   │   ├── dialogueIntentModel.ts
│   │   ├── agentInteractionEngine.ts
│   │   ├── memoryConsolidator.ts
│   │   └── predictiveAnalysis.ts
│   ├── systems/
│   │   ├── OctoLLMCluster.ts
│   │   ├── InternalAPIService.ts
│   │   ├── paymentServices.ts
│   │   ├── persistenceService.ts
│   │   └── tokenSynthesisEngine.ts
│   ├── models/
│   │   ├── glossary.ts
│   │   ├── creation_definitions.ts
│   │   ├── CreationForensics.ts
│   │   ├── Crucible.ts
│   │   ├── Phylogeny.ts
│   │   ├── SSA.ts
│   │   └── ExperientialHistory.ts
│   └── entry/
│       ├── index.ts
│       └── index.tsx
├── web/
│   └── index.html
├── data/
│   ├── metadata.json
│   └── the log.txt
├── archive/
│   └── src.zip
├── .env.local
├── .gitignore
├── LICENSE
├── README.md
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Practical migration notes

- Move files gradually and update import paths in small batches.
- Start with low-risk document and data moves before TypeScript module moves.
- After each move, run `npm run build` to catch broken imports immediately.
