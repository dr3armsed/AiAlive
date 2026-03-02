# What is needed for an internal API + Dataset + LLM + Logic stack

## 1) Internal API layer
- Runtime ingress API (already present for dialogue).
- New internal APIs for memory, dataset, model registry, and evaluations.
- AuthN/AuthZ + audit trail for write paths.

## 2) Dataset layer
- Event store (raw conversation turns, bridge signals, telemetry).
- Curated example store (quality scored, safety filtered).
- Versioned manifests and reproducible splits.

## 3) LLM layer
- Inference service (active model routing).
- Training jobs (fine-tune/adapter/RAG indexing).
- Model registry with promotion/rollback controls.

## 4) Logic layer
- Deterministic policy runtime for:
  - prompting templates,
  - memory write rules,
  - tool/bridge selection,
  - safety constraints.
- Feedback policy: how eval + telemetry update default behavior.

## 5) MLOps/observability
- Experiment tracking (model+dataset hash).
- Drift and regression monitors.
- Offline eval gates before online promotion.

## 6) Safety and governance
- PII redaction before training inclusion.
- Human approval queues for high-impact examples.
- Immutable audit logs for training lineage.
