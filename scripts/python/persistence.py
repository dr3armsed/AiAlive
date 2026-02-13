import json
import os
from typing import Any, Dict


DEFAULT_STATE = {
    "id": {"desires": []},
    "ego": {"filter_strength": 0.5},
    "superego": {"moral_constraints": []},
    "anomaly": {"events": []},
}


def _load_json(path: str, default: Dict[str, Any]) -> Dict[str, Any]:
    if not os.path.exists(path):
        return default
    try:
        with open(path, "r", encoding="utf-8") as file:
            data = json.load(file)
            return data if isinstance(data, dict) else default
    except Exception:
        return default


def load_runtime_state() -> Dict[str, Dict[str, Any]]:
    """Load a consolidated runtime state snapshot from data/state."""
    return {
        "id": _load_json("data/state/id.json", DEFAULT_STATE["id"]),
        "ego": _load_json("data/state/ego.json", DEFAULT_STATE["ego"]),
        "superego": _load_json("data/state/superego.json", DEFAULT_STATE["superego"]),
        "anomaly": _load_json("data/state/anomaly_log.json5", DEFAULT_STATE["anomaly"]),
    }
