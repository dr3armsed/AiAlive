# Potentials Throughway

This directory preserves **branching code paths and future-oriented snippets** extracted from active/runtime code blocks.

## Purpose

- Keep high-potential but not-yet-fully-integrated logic discoverable.
- Prevent older/incompatible ideas from being silently overwritten or lost.
- Provide a staging area for promotion into active runtime modules once dependencies, safety gates, and interfaces are ready.

## How to use

1. Capture a snippet that "leads to something else" (future API, deeper world model, deferred UX mode, etc.).
2. Store it under an appropriate domain subfolder with context and promotion criteria.
3. Promote by copying/adapting into `src/` only after tests and contracts are in place.

## Layout

- `planning/` — architecture/API trajectories.
- `runtime/` — substrate/memory/world snippets with next-step potential.
- `python/` — bridge/runtime behaviors suited for expansion.
- `ui/` — advanced view experiments and diagnostics that may branch.
