from runtime.entity_management import normalize_egregore

__all__ = ["normalize_egregore"]
from typing import Any, Dict


def normalize_egregore(payload: Dict[str, Any]) -> Dict[str, str]:
    """Normalize egregore identity payload into a predictable shape."""
    egregore = payload.get("egregore", {}) if isinstance(payload.get("egregore"), dict) else {}
    egregore_id = str(egregore.get("id", "egregore_unknown")).strip() or "egregore_unknown"
    name = str(egregore.get("name", "Unknown")).strip() or "Unknown"
    return {
        "id": egregore_id,
        "name": name,
    }
