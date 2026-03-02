# Memory Pipeline Potentials

## Preserved snippet: pending dataset example construction

```ts
function toDatasetExample(event: RuntimeMemoryEvent): RuntimeDatasetExample {
  return {
    id: `example_${event.id}`,
    traceId: event.traceId,
    input: {
      egregoreId: event.egregoreId,
      egregoreName: event.egregoreName,
      userMessage: event.userMessage,
      source: event.source,
      styleMode: event.styleMode,
      sourceMode: event.sourceMode,
      memoryDepth: event.memoryDepth,
    },
    output: {
      egregoreMessage: event.egregoreMessage,
      emotion: event.signals?.emotion ?? null,
    },
    metadata: {
      createdAt: event.createdAt,
      approvalState: 'pending',
      split: 'unassigned',
    },
  };
}
```

## Why it leads to something else

- This is a bridge from runtime conversations to train/eval dataset formation.
- It should evolve into server-ingestion + versioned curation pipeline.

## Promotion criteria

- Replace browser-local storage with memory API adapter.
- Add quality scoring + dedup + redaction before split assignment.
