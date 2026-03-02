# Advanced View Potentials

## Preserved snippet: conversation multi-view modes

```ts
type ConversationViewMode = 'thread' | 'timeline' | 'compact';
```

## Preserved snippet: systems multi-view modes

```ts
type SystemsViewMode = 'list' | 'cards';
```

## Preserved snippet: private-world visual mode switch

```ts
type WorldViewMode = 'summary' | 'isometric';
```

## Why this leads to something else

- These mode switches are the first step toward adaptive operator interfaces.
- They should eventually be persisted per user profile and gated by experience level.

## Promotion criteria

- Add global UI preference persistence.
- Add basic/advanced UX mode policy to avoid cognitive overload.
