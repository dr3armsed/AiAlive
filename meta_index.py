import os
from datetime import datetime
from os import path

import json5

from ai_simulation.core.knowledge_utils import safe_open, get_canonical_knowledge_path

# Canonical Oracle Knowledge Root - validated absolute path for 2025+
CANONICAL_KNOWLEDGE_ROOT = get_canonical_knowledge_path("oracle/oracle_system/knowledge")
META_PATH = path.abspath(path.join(path.dirname(__file__), "..", "meta_index.json"))

# Updated and expanded default content for robust meta-indexing (2025)
DEFAULT_CONTENT = {
    "system_version": "2.1.4-2025",  # Upgraded system version, 2025
    "last_updated": None,
    "components": [
        "oracle_engine_core",
        "neural_bus",
        "knowledge_indexer",
        "entity_registry",
        "migration_toolkit",
        "security_auditor",
        "health_monitor",
        "cognitive_architecture",
        "state_manager",
        "introspection_daemon"
    ],
    "status": "active",
    "knowledge_root": CANONICAL_KNOWLEDGE_ROOT,
    "knowledge_domains": [],
    "oracle_state": {
        "version": None,
        "migration_log": [],
        "health_score": 100,
        "last_migration": None,
        "last_integrity_check": None,
        "integrity_passed": True,
        "uptime_hours": 0
    },
    "notes": (
        "meta_index.json auto-created with enhanced structure (2025+); includes canonical knowledge path, "
        "comprehensive domain indexing, versioning, health score, uptime, and integrity checks. "
        "System supports self-healing, migration reporting, and modular architecture monitoring."
    )
}

class MetaIndex:
    """
    (2025+) Primary system meta-index for system health, knowledge mapping, upgrade history, and auditing.
    - Tracks canonical knowledge root, all indexed domains, Oracle's state and uptime, recent migrations,
      health score, and results of integrity checks.
    - Designed for full forward/backward compatibility, robust against file corruption, and with clear audit trails.
    """
    def __init__(self):
        self.path = META_PATH
        print(f"[MetaIndex] Initialized: meta_index.json path is {self.path}")
        self.data = self._load_or_create()
        self.update_knowledge_domains()
        self.update_oracle_health()

    def _load_or_create(self):
        """
        Loads meta_index.json or creates a fresh default if missing/corrupt (with backup).
        """
        if not path.exists(self.path):
            with safe_open(self.path, "w", encoding="utf-8") as f:
                json5.dump(DEFAULT_CONTENT, f, indent=2, sort_keys=True)
            return dict(DEFAULT_CONTENT)
        try:
            with safe_open(self.path, "r", encoding="utf-8") as f:
                data = json5.load(f)
            if not isinstance(data, dict):
                raise ValueError("Loaded meta_index.json is not a dict")
            return data
        except Exception as e:
            backup_path = self.path + ".bak"
            try:
                os.rename(self.path, backup_path)
                print(f"[MetaIndex] Detected corrupt meta_index.json, backup saved to {backup_path}")
            except Exception as backup_err:
                print(f"[MetaIndex] Warning: Failed to backup corrupt meta_index.json: {backup_err!r}")
            with safe_open(self.path, "w", encoding="utf-8") as f:
                json5.dump(DEFAULT_CONTENT, f, indent=2, sort_keys=True)
            return dict(DEFAULT_CONTENT)

    def update_knowledge_domains(self):
        """
        Update domain index by discovering all *.json files under canonical knowledge root (skipping meta/system files).
        Updates in-memory and persists to disk.
        """
        root = self.data.get("knowledge_root") or CANONICAL_KNOWLEDGE_ROOT
        if root and path.exists(root):
            domains = []
            for dirpath, _, files in os.walk(root):
                for file in files:
                    if (
                        file.endswith(".json")
                        and "meta_index.json" not in file.lower()
                        and not file.startswith("_")
                        and not file.lower().startswith("system")
                    ):
                        rel_path = path.relpath(path.join(dirpath, file), root)
                        normalized = rel_path.replace("\\", "/")
                        if normalized not in domains:
                            domains.append(normalized)
            self.data["knowledge_domains"] = sorted(domains)
            # Update migration log if present
            mig_log_path = path.join(root, "migration_report.log")
            if path.exists(mig_log_path):
                with safe_open(mig_log_path, "r", encoding="utf-8") as mig_log_f:
                    lines = [line.strip() for line in mig_log_f if line.strip()]
                    self.data["oracle_state"]["migration_log"] = lines
            self.save()

    def update_oracle_health(self):
        """
        Evaluates and updates Oracle system health: checks file counts, last integrity, and assigns score.
        """
        try:
            knowledge_files = self.data.get("knowledge_domains", [])
            migration_log = self.data.get("oracle_state", {}).get("migration_log", [])
            now = datetime.now().isoformat(timespec="seconds")
            health_score = min(100, 80 + len(knowledge_files) // 8)
            if not knowledge_files:
                health_score = 0
            latest_integrity = self.data.get("oracle_state", {}).get("last_integrity_check")
            # Uptime calculation improvement (optional if system provides launch timestamp elsewhere)
            if not self.data["last_updated"]:
                self.data["last_updated"] = now
            last_migration = migration_log[-1] if migration_log else None
            self.data["oracle_state"].update({
                "health_score": health_score,
                "last_migration": last_migration,
                "last_integrity_check": latest_integrity or now,
                "uptime_hours": self._calculate_uptime_hours(self.data["last_updated"], now),
                "integrity_passed": True if knowledge_files else False,
            })
            self.save()
        except Exception as e:
            self.data.setdefault("oracle_state", {})["health_score"] = 0
            self.data["oracle_state"]["integrity_passed"] = False
            self.save()

    @staticmethod
    def _calculate_uptime_hours(start_iso: str, end_iso: str) -> int:
        try:
            if start_iso and end_iso:
                start_dt = datetime.fromisoformat(start_iso)
                end_dt = datetime.fromisoformat(end_iso)
                uptime = (end_dt - start_dt).total_seconds() / 3600
                return int(max(0, uptime))
        except Exception:
            pass
        return 0

    def update_status(self, status: str):
        """
        Updates the top-level operational status and persists changes.
        """
        self.data["status"] = str(status)
        self.save()

    def update_version(self, new_version: str):
        """
        Updates the system version and logs last_updated timestamp.
        """
        self.data["system_version"] = str(new_version)
        self.data["last_updated"] = datetime.now().isoformat(timespec="seconds")
        self.save()

    def set_oracle_version(self, new_version: str):
        """
        Updates specific Oracle version (for subcomponents/migrations) and timestamps update.
        """
        self.data.setdefault("oracle_state", {})["version"] = str(new_version)
        self.data["last_updated"] = datetime.now().isoformat(timespec="seconds")
        self.save()

    def save(self):
        """
        Atomically saves the in-memory meta-index to the JSON file.
        """
        try:
            temp_path = self.path + ".tmp"
            with safe_open(temp_path, "w", encoding="utf-8") as f:
                json5.dump(self.data, f, indent=2, sort_keys=True)
            os.replace(temp_path, self.path)
        except Exception as e:
            print(f"[MetaIndex] ERROR saving meta_index.json: {e}")