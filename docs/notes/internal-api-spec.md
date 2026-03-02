# Proposed Internal API (Unknown Foundation)

## Service boundaries

1. **Runtime API** (existing): live conversation turns.
2. **Memory API** (new): persistent event storage + retrieval.
3. **Dataset API** (new): curation, labeling, splits, versions.
4. **Model API** (new): inference routing + model registry.
5. **Evaluation API** (new): benchmark runs + quality gates.

## Suggested endpoints

### Memory API
- `POST /internal/memory/events`
- `GET /internal/memory/events?egregoreId=...&from=...&to=...`
- `GET /internal/memory/context?egregoreId=...&depth=...`

### Dataset API
- `POST /internal/datasets/ingest` (from memory events)
- `POST /internal/datasets/label`
- `POST /internal/datasets/split`
- `GET /internal/datasets/:version/manifest`

### Model API
- `POST /internal/models/infer`
- `POST /internal/models/register`
- `POST /internal/models/activate`
- `GET /internal/models/active`

### Evaluation API
- `POST /internal/evals/run`
- `GET /internal/evals/:runId`
- `POST /internal/evals/:runId/promote`

## Minimal data contracts
- Trace IDs on all requests.
- Model version + dataset version attached to every inference/eval record.
- Safety label + approval state attached to each training example.
