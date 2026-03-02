# World Substrate Potentials

## Preserved snippet: coherence + projection health summary

```ts
export function summarizeSubstrateHealth(substrate: RuntimeWorldSubstrate): RuntimeSubstrateHealthSummary {
  const coherence = validateSubstrateCoherence(substrate);
  return {
    coherenceIssueCount: coherence.issues.length,
    linkedProjectionCount: countLinkedProjections(substrate),
    egregoreCount: substrate.egregores.length,
    worldCount: substrate.privateWorlds.length,
    creationCount: substrate.creations.length,
  };
}
```

## Preserved snippet: shared/private world transition guard

```ts
if (targetMode === 'private-world') {
  const ownsPrivateWorld = privateWorlds.some((world) => world.egregoreId === egregoreId);
  if (!ownsPrivateWorld) {
    return { ok: false, worldPresence, reason: 'private-world-missing' };
  }
}
```

## Why these lead to something else

- Health summary can become a governance/repair subsystem.
- Transition guards can become policy-governed access controls (permissions, trust, safety context).

## Promotion criteria

- Add room/zone topology validation.
- Surface transition failure reasons to UI and logs.
