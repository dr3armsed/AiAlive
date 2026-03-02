# AIAlive: Current Support vs Needed Work (Unknown-centric)

## What AIAlive currently has

### 1) Runtime orchestration and projection substrate
- Shared substrate modeling for egregores/worlds/creations and projection links exists (`worldSubstrate.ts`).
- Coherence + projection metrics are surfaced in runtime telemetry.

### 2) Dialogue bridge execution path
- `/api/runtime/dialogue` route executes Python bridge via `runtime_bridge.py`.
- Bridge has steering support (`style/source/memoryDepth`) and deterministic sensory shaping (`sensory` snapshot).

### 3) Portable execution and verification
- Portable init/doctor/dev/check scripts exist and are wired in npm scripts.
- Portable checks include `build`, bridge tests, portable tests, and substrate tests.

### 4) Baseline tests
- Runtime bridge tests, legacy adapter tests, integration manifest tests, portable workflow tests, substrate tests.

---

## What still needs to be created/wired

### A) Internal API (training and memory services)
Missing today:
- Durable memory write/read API for conversation events.
- Dataset curation API (raw -> cleaned -> train/eval split).
- Model registry + evaluation API.

### B) Dataset pipeline
Missing today:
- Canonical dataset tables/files for turns, labels, outcomes, safety tags.
- Curation jobs: dedupe, redaction, quality scoring, split management.
- Versioning + lineage metadata for reproducible training runs.

### C) Internal LLM layer
Missing today:
- Internal model service endpoint (inference) with version pinning.
- Fine-tune / adapter / RAG build jobs.
- Evaluation gates and rollback path.

### D) Logic/policy runtime
Missing today:
- Policy graph for tool usage, memory writes, and persona constraints.
- Reward/quality loops connecting telemetry outcomes to preference updates.
- Safety governance over self-training ingestion.

### E) Static -> persistent conversion
Missing today:
- Persistent store for conversations beyond in-memory React state.
- Scheduled ingestion from conversation logs into dataset store.
- Approval workflow before data becomes training-eligible.
