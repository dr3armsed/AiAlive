import glob
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional


DEFAULT_STATE = {
    "id": {"desires": []},
    "ego": {"filter_strength": 0.5},
    "superego": {"moral_constraints": []},
    "anomaly": {"events": []},
}


def _portable_data_root() -> Path:
    override = os.environ.get("GENMETA_PORTABLE_DATA")
    if override:
        return Path(override)
    return Path("data")


def _state_file(name: str, fallback: str) -> str:
    portable_candidate = _portable_data_root() / "state" / name
    if portable_candidate.exists():
        return str(portable_candidate)
    return fallback


def _artifact_glob(pattern: str) -> List[str]:
    return glob.glob(pattern)


def _load_json(path: str, default: Dict[str, Any]) -> Dict[str, Any]:
    if not os.path.exists(path):
        return default
    try:
        with open(path, "r", encoding="utf-8") as file:
            data = json.load(file)
            return data if isinstance(data, dict) else default
    except Exception:
        return default


def _read_artifact_excerpt(path: str, max_chars: int = 160) -> str:
    try:
        with open(path, "r", encoding="utf-8") as file:
            raw = file.read(max_chars * 2)
    except Exception:
        return ""

    compact = " ".join(raw.split())
    if len(compact) <= max_chars:
        return compact
    return f"{compact[: max_chars - 3]}..."


def _latest_artifact(paths: List[str]) -> Optional[str]:
    if not paths:
        return None
    return max(paths, key=lambda item: os.path.getmtime(item))


def load_artifact_context() -> Dict[str, Any]:
    """Return lightweight artifact metadata for runtime context stitching."""
    heals = _artifact_glob("artifacts/heals/*.txt")
    patches = _artifact_glob("artifacts/patches/*.txt")
    unified_patch = "artifacts/patches/unified_recovery_patch.txt"

    candidates = heals + patches
    latest = _latest_artifact(candidates)

    retrieval = {
        "path": latest,
        "excerpt": _read_artifact_excerpt(latest) if latest else "",
    }

    return {
        "heal_count": len(heals),
        "patch_count": len(patches),
        "has_unified_patch": os.path.exists(unified_patch),
        "retrieval": retrieval,
    }


def load_runtime_state() -> Dict[str, Dict[str, Any]]:
    """Load a consolidated runtime state snapshot from data/state and artifacts."""
    return {
        "id": _load_json(_state_file("id.json", "data/state/id.json"), DEFAULT_STATE["id"]),
        "ego": _load_json(_state_file("ego.json", "data/state/ego.json"), DEFAULT_STATE["ego"]),
        "superego": _load_json(
            _state_file("superego.json", "data/state/superego.json"),
            DEFAULT_STATE["superego"],
        ),
        "anomaly": _load_json(
            _state_file("anomaly_log.json5", "data/state/anomaly_log.json5"),
            DEFAULT_STATE["anomaly"],
        ),
        "artifacts": load_artifact_context(),
    }
