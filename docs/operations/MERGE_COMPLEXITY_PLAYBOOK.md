# Merge Complexity Playbook

If GitHub says a PR is too complex to merge cleanly, split the change into stacked scope PRs.

## Quick workflow

1. Generate a scope map from the large commit:
   - `npm run merge:split-plan -- <commit-ish>`
   - Example: `npm run merge:split-plan -- aec6593`
2. Create one branch per scope and pull only that file set from the large commit.
3. Open small PRs in dependency order.

## Recommended scope order for this repository

1. `portable-docs`
2. `python-runtime-bridge`
3. `runtime-services`
4. `runtime-ui`
5. `planning-and-potentials`
6. `tests`
7. `integration-misc`

This ordering keeps low-risk infrastructure and docs first, then runtime internals, then UI, then tests.

## Why this helps

- Reduces merge conflict surface area.
- Makes reviewer load smaller and more deterministic.
- Lets partial value land even when one scope has conflict churn.
- Preserves exploratory branches (`Potentials/`) without blocking runtime-critical fixes.
