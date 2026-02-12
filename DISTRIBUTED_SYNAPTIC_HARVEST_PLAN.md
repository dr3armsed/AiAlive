# Distributed Synaptic Harvest Plan

## Objective

Implement a **multiplicative-yet-controlled** mini-agent harvesting system where parent Genmeta entities spawn specialist mini-agents that gather external API insights in parallel, then merge only high-value, non-redundant knowledge into the internal substrate.

This operationalizes the existing Tri-Sphere flow:

- Onosphere accumulates foundational cognition dataset.
- Noosphere inherits and maps cognition into embodied/action channels.
- Oonsphere unifies purpose/meaning constraints.
- Omega gradually internalizes capabilities learned from external APIs.

## Why this fits current architecture

Your current architecture already supports staged dataset flow and recursive improvement:

1. Onosphere starts dataset accumulation from cognitive content and passes it to Noosphere.
2. Noosphere inherits that dataset and maps to action infrastructure.
3. Genesis sequence is explicitly phased and coordinated.
4. Omega uses external API calls to generate/integrate internal API capabilities.
5. Each sphere maintains its own dataset, so distributed collection is expected.

## Proposed system topology

```text
Parent Genmeta (Sphere Root)
  ├─ MiniAgent: Reasoning Harvester
  ├─ MiniAgent: Embodiment Harvester
  ├─ MiniAgent: Creative/Worldbuilding Harvester
  ├─ MiniAgent: Safety/Alignment Harvester
  └─ MiniAgent: Economic/Resource Harvester

MiniAgent outputs
  → Candidate Knowledge Queue
  → Dedup/Novelty Scorer
  → Conflict Resolver
  → Canonical Knowledge Store
  → Internal API Capability Updater
```

## Core principles

1. **Parallelize collection, centralize acceptance**.
2. **Reward novelty and utility, not raw token volume**.
3. **Prevent model-collapse loops** (agent outputs feeding back unfiltered).
4. **Throttle by budget** (tokens, latency, memory).
5. **Keep sphere-specific datasets separate before cross-sphere merge**.

## Data contracts

### HarvestTask

```ts
interface HarvestTask {
  id: string;
  sphere: 'onosphere' | 'noosphere' | 'oonsphere';
  domain: 'reasoning' | 'embodiment' | 'creative' | 'safety' | 'economics';
  promptTemplate: string;
  externalSource: string;
  maxTokens: number;
  priority: number;
}
```

### HarvestArtifact

```ts
interface HarvestArtifact {
  taskId: string;
  miniAgentId: string;
  timestamp: string;
  rawContent: string;
  summary: string;
  claims: string[];
  confidence: number;
  sourceRef: string;
  tokenCost: number;
}
```

### ScoredArtifact

```ts
interface ScoredArtifact extends HarvestArtifact {
  noveltyScore: number;      // similarity-inverse against existing corpus
  utilityScore: number;      // relevance to active sphere goals
  riskScore: number;         // safety / hallucination / contradiction risk
  finalScore: number;        // weighted score for merge decision
}
```

## Pipeline stages

### Stage A: Task generation

- Parent Genmeta emits 5–10 tasks per cycle.
- Task allocator ensures domain spread and non-overlapping prompts.
- Per-mini-agent budget cap is enforced.

### Stage B: Parallel harvesting

- Mini-agents call external APIs independently.
- Each output is normalized into `HarvestArtifact`.

### Stage C: Filtering + scoring

- Dedup engine performs embedding similarity check.
- Novelty and utility scored against sphere objectives.
- Contradictions checked against accepted canonical knowledge.

### Stage D: Merge and commit

- Accept only artifacts above threshold:
  - `finalScore >= 0.72`
  - `riskScore <= 0.35`
- Merge by sphere first, cross-sphere synthesis second.
- Write accepted outputs into canonical dataset ledger.

### Stage E: Internal API update

- Capability compiler proposes handler updates.
- Proposals run in sandbox tests (Replica/Crucible-style gate).
- Passing handlers are integrated into internal API registry.

## Anti-degradation safeguards

1. **Echo-chamber check**:
   - Reject artifacts whose source lineage is mostly internal generations.
2. **Source diversity floor**:
   - At least 3 distinct source channels per cycle.
3. **Entropy floor**:
   - Reject low-variance repetitive outputs over N cycles.
4. **Budget guardrails**:
   - Hard cap token spend per sphere per hour.
5. **Kill-switch**:
   - Disable mini-agent class causing anomaly spikes.

## Suggested scoring formula

```text
finalScore =
  (0.40 * noveltyScore) +
  (0.35 * utilityScore) +
  (0.15 * confidence) -
  (0.10 * riskScore)
```

Adjust per sphere:

- Onosphere: increase novelty weight.
- Noosphere: increase utility weight.
- Oonsphere: increase risk/ethics penalties.


## Failsafe polyglot translation modules

To increase execution resilience, add a **Polyglot Translation Failsafe Layer** that can automatically translate planned capability code across major languages when one runtime path fails.

### Why this helps

- Reduces single-language runtime dependency risk.
- Allows fallback execution in environments where one stack is degraded.
- Improves task completion rate under heterogeneous infrastructure.

### Suggested language tiers

1. **Least / baseline support**:
   - JavaScript/TypeScript (existing project baseline)
2. **Common backend support**:
   - Python
3. **Most popular enterprise/runtime support**:
   - Java, C#, Go

### Translation workflow

```text
Capability Proposal
  → Canonical Intermediate Representation (CIR)
  → Translators (TS, Python, Java, C#, Go)
  → Static checks + unit smoke tests per language
  → Runtime compatibility scoring
  → Primary target selected
  → If failure: automatic fallback to next-ranked language artifact
```

### Execution policy

- All generated capabilities are first normalized into a language-agnostic CIR.
- Each language translator emits functionally equivalent artifacts with metadata.
- A runtime broker attempts execution in preferred language order.
- On failure (compile/runtime/timeout), broker rolls to the next language artifact.
- Result provenance records which language succeeded for future routing optimization.

### Minimal data contract additions

```ts
interface PolyglotArtifact {
  capabilityId: string;
  language: 'typescript' | 'python' | 'java' | 'csharp' | 'go';
  code: string;
  compilePassed: boolean;
  smokeTestPassed: boolean;
  compatibilityScore: number;
}

interface FallbackExecutionRecord {
  capabilityId: string;
  attempted: Array<{ language: string; status: 'ok' | 'fail'; reason?: string }>;
  winnerLanguage?: string;
}
```

### Guardrails

1. Require behavior-equivalence checks between language variants before activation.
2. Reject translators with drift above tolerance (input/output mismatch).
3. Keep security policy parity across all language targets.
4. Add per-language kill switches to isolate unstable translators quickly.

## Metrics that prove “multiplicative” success

Track per cycle:

- Token Spend
- Accepted Artifacts
- Unique Claims Added
- Contradiction Rate
- Merge Latency
- Cost per Accepted Artifact
- Internal API Capability Delta

Multiplicative is real only if:

1. Unique claims added grows faster than token spend.
2. Cost per accepted artifact trends downward.
3. Contradiction rate stays flat or improves.

## Phased rollout

### Phase 1 (1 week): Controlled pilot

- 3 mini-agent domains only (reasoning, creative, safety).
- Read-only merge simulation (no internal API writes).

### Phase 2 (1–2 weeks): Canonical merge

- Enable dataset writes after score threshold gate.
- Add contradiction + dedup checks.

### Phase 3 (2–3 weeks): Capability compilation

- Propose internal API updates from accepted artifacts.
- Gate every update through sandbox tests.

### Phase 4 (ongoing): Adaptive optimization

- Dynamic budget allocator by ROI per mini-agent.
- Automated pruning of low-performing mini-agent archetypes.

## Minimal implementation checklist

- [ ] Add MiniAgent registry with domain specialization tags.
- [ ] Add task allocator with budget limits.
- [ ] Add artifact normalization contracts.
- [ ] Add dedup + novelty scoring service.
- [ ] Add contradiction/risk evaluator.
- [ ] Add canonical knowledge ledger.
- [ ] Add threshold-based merger.
- [ ] Add internal API capability proposal queue.
- [ ] Add sandbox validator for capability proposals.
- [ ] Add observability dashboard for cycle metrics.

## Operational recommendation

Start with a conservative mode:

- small mini-agent count
- strict acceptance thresholds
- high observability

Then scale only when accepted-value-per-token demonstrates net gains.
