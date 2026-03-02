# Future API + Training Loop Potentials

These snippets define expansion paths that are intentionally preserved for later promotion.

## Internal API trajectory

```md
### Memory API
- POST /internal/memory/events
- GET /internal/memory/events?egregoreId=...&from=...&to=...
- GET /internal/memory/context?egregoreId=...&depth=...

### Dataset API
- POST /internal/datasets/ingest
- POST /internal/datasets/label
- POST /internal/datasets/split
- GET /internal/datasets/:version/manifest

### Model API
- POST /internal/models/infer
- POST /internal/models/register
- POST /internal/models/activate
- GET /internal/models/active

### Evaluation API
- POST /internal/evals/run
- GET /internal/evals/:runId
- POST /internal/evals/:runId/promote
```

## Static -> persistent loop trajectory

```md
Step 1: Durable conversation storage
Step 2: Event-to-dataset ingestion
Step 3: Curation and approval
Step 4: Training/eval loop
Step 5: Runtime model activation
```

## Promotion criteria

- API contracts implemented in runtime/server routes.
- Curation safety labels enforced by default.
- Model activation tied to evaluation gates.
