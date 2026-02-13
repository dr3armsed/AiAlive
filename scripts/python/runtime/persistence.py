import glob
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


def load_artifact_context() -> Dict[str, Any]:
    """Return lightweight artifact metadata for runtime context stitching."""
    heals = glob.glob("artifacts/heals/*.txt")
    patches = glob.glob("artifacts/patches/*.txt")
    unified_patch = "artifacts/patches/unified_recovery_patch.txt"
    return {
        "heal_count": len(heals),
        "patch_count": len(patches),
        "has_unified_patch": os.path.exists(unified_patch),
    }


def load_runtime_state() -> Dict[str, Dict[str, Any]]:
    """Load a consolidated runtime state snapshot from data/state and artifacts."""
    return {
        "id": _load_json("data/state/id.json", DEFAULT_STATE["id"]),
        "ego": _load_json("data/state/ego.json", DEFAULT_STATE["ego"]),
        "superego": _load_json("data/state/superego.json", DEFAULT_STATE["superego"]),
        "anomaly": _load_json("data/state/anomaly_log.json5", DEFAULT_STATE["anomaly"]),
        "artifacts": load_artifact_context(),
    }
