# Python Runtime Bridge Setup (Current Repo)

This guide reflects the **current AiAlive layout**, where Python is invoked through the Vite middleware route:

- Frontend calls `POST /api/runtime/dialogue`
- Vite runs `scripts/python/runtime_bridge.py`

## Prerequisites

- Node.js + npm installed
- Python 3 installed as `python3`
- Dependencies installed:

```bash
npm install
```

## Start the app

```bash
npm run dev -- --host 0.0.0.0 --port 3000
```

This launches Vite and enables the runtime bridge route.

## Verify bridge script directly

```bash
python3 scripts/python/runtime_bridge.py <<'EOF_JSON'
{"prompt":"Unknown, status?","egregore":{"id":"egregore_unknown","name":"Unknown"}}
EOF_JSON
```

Expected shape:

```json
{
  "source": "python-bridge:heuristic",
  "response": "...",
  "signals": {
    "emotion": "focused",
    "id_desire_count": 0,
    "superego_rule_count": 0,
    "ego_filter_strength": 0.5
  },
  "latencyMs": 0,
  "model": null
}
```

## Run validation checks

```bash
npm run build
npm run test:runtime
npm run test:integration
npm run test:bridge
npm run test:recovery
```

## Notes on current bridge composition

`runtime_bridge.py` delegates to `scripts/python/runtime/bridge.py`, which composes behavior from:

- `scripts/python/runtime/entity_management.py` (normalization)
- `scripts/python/runtime/persistence.py` (state loading + artifact retrieval context)
- `scripts/python/runtime/dialogue.py` (response composition)
`runtime_bridge.py` currently composes behavior from:

- `scripts/python/entity_management.py` (normalization)
- `scripts/python/persistence.py` (state loading)
- `scripts/python/dialogue.py` (response composition)
- `scripts/python/oracle.py` (DecisionMatrix hinting when importable)

If `RUNTIME_USE_OLLAMA=1` is set, the bridge source reports `python-bridge:ollama`; otherwise `python-bridge:heuristic`.
