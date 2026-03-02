# Static-to-Persistent Migration Plan (Conversation -> Training Data)

## Current static behavior
- Runtime conversations are maintained in in-memory React state.
- Bridge generates deterministic responses/signals per turn.
- Substrate diagnostics are computed at runtime for visibility.

## Needed persistent behavior

### Step 1: Durable conversation storage
- Add persistence sink for every user/egregore turn.
- Store prompt, bridge response, source, signals, preferences, sensory snapshot, timestamps.

### Step 2: Event-to-dataset ingestion
- Batch/stream ingestion from conversation events into dataset staging.
- Deduplication + normalization + quality scoring.

### Step 3: Curation and approval
- Route examples through safety + quality gates.
- Label split (`train|validation|test`) and attach version metadata.

### Step 4: Training/eval loop
- Run training job against approved dataset version.
- Run offline eval suite and compare against baseline.
- Promote model only if eval thresholds pass.

### Step 5: Runtime model activation
- Switch active internal model version via model registry.
- Record model version in each future inference event.

## Minimum wiring changes
1. Add storage adapters for conversation/memory events.
2. Add ingestion service and dataset schema validators.
3. Add model/eval service stubs and promotion workflow.
4. Feed promoted model version into runtime dialogue adapter.
5. Add telemetry for dataset/model versions in runtime diagnostics.
