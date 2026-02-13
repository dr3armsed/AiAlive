"""
Ego: Central mediator and adaptive regulator of the psyche.
Tracks and updates goals, intentions, emotions, and self-assessments in real time, mediating between id, superego, and context.
Modernized as of 2025. Includes robust error handling, atomic file operations, extended validation, and an auditable decision/assessment log.
Note: While designed for reliability, always handle exceptions and validate data in production.
"""

import os
import threading
from datetime import datetime

import json5

try:
    from ...neural_bus.neural_bus import NeuralBus
except ImportError:
    NeuralBus = None

EGO_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ego.json"))

# Latest 2025-compliant structure for ego.json
_DEFAULT_EGO_CONTENT = {
    # ... (unchanged)
}

class Ego:
    """
    Ego: Central mediator between system drives, rules, and dynamic context.
    Enforces homeostasis, records decisions/emotions/self-assessment,
    and provides a transparent, up-to-date state as of 2025.
    Note: While designed for reliability, always handle exceptions and validate data in production.
    """

    _save_lock = threading.Lock()

    def __init__(self, path: str = None):
        self.path = path or EGO_PATH
        self.data = self._load_or_initialize()
        self.bus = NeuralBus(memory_reference=None)
        if self.data.get("last_updated") is None:
            self._update_last_updated(save=True)

    def _load_or_initialize(self):
        # Load existing or create new, fully validated by 2025 schema
        if not os.path.exists(self.path):
            self._atomic_save(_DEFAULT_EGO_CONTENT)
            return dict(_DEFAULT_EGO_CONTENT)
        try:
            with open(self.path, "r", encoding="utf-8") as f:
                data = json5.load(f)
            # Schema upgrade: ensure all default keys and nested keys exist
            upgraded = False
            for key, default_val in _DEFAULT_EGO_CONTENT.items():
                if key not in data:
                    data[key] = default_val
                    upgraded = True
                elif isinstance(default_val, dict):
                    for subkey, subval in default_val.items():
                        if subkey not in data[key]:
                            data[key][subkey] = subval
                            upgraded = True
            if upgraded:
                self._atomic_save(data)
            return data
        except (json5.JSONDecodeError, OSError) as e:
            # Backup corrupted, write default clean file
            backup_path = self.path + ".bak"
            try:
                os.rename(self.path, backup_path)
            except Exception as e2:
                import logging
                logging.getLogger("ego").error(f"Failed to backup corrupted ego file: {e2}", exc_info=True)
            self._atomic_save(_DEFAULT_EGO_CONTENT)
            return dict(_DEFAULT_EGO_CONTENT)
        except Exception as e:
            import logging
            logging.getLogger("ego").error(f"Failed to load ego file: {e}", exc_info=True)
            self._atomic_save(_DEFAULT_EGO_CONTENT)
            return dict(_DEFAULT_EGO_CONTENT)

    # ... (rest unchanged)
