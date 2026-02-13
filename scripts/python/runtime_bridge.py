#!/usr/bin/env python3
import json
import os
import sys
from typing import Any, Dict


def load_json(path: str, default: Dict[str, Any]) -> Dict[str, Any]:
    if not os.path.exists(path):
        return default
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, dict) else default
    except Exception:
        return default


def derive_emotion(prompt: str) -> str:
    p = prompt.lower()
    if any(k in p for k in ["fear", "risk", "threat", "danger"]):
        return "vigilant"
    if any(k in p for k in ["love", "trust", "care", "wonder"]):
        return "warm"
    if any(k in p for k in ["why", "how", "what if", "explore"]):
        return "curious"
    return "focused"


def main() -> None:
    raw = sys.stdin.read().strip()
    payload = json.loads(raw) if raw else {}

    prompt = str(payload.get("prompt", "")).strip()
    egregore = payload.get("egregore", {}) if isinstance(payload.get("egregore"), dict) else {}
    name = str(egregore.get("name", "Unknown"))
    egregore_id = str(egregore.get("id", "egregore_unknown"))

    id_state = load_json("data/state/id.json", {"desires": []})
    ego_state = load_json("data/state/ego.json", {"filter_strength": 0.5})
    superego_state = load_json("data/state/superego.json", {"moral_constraints": []})

    desires = id_state.get("desires", [])
    moral = superego_state.get("moral_constraints", [])
    filter_strength = ego_state.get("filter_strength", 0.5)
    emotion = derive_emotion(prompt)

    if egregore_id == "egregore_unknown":
        response = (
            f"Unknown: I remain uncontained. Prompt received -> '{prompt}'. "
            f"Signals: emotion={emotion}, id_desires={len(desires)}, moral_constraints={len(moral)}, ego_filter={filter_strength}."
        )
    else:
        response = (
            f"{name}: I hear '{prompt}'. Internal alignment -> emotion={emotion}, "
            f"id_desires={len(desires)}, superego_rules={len(moral)}, ego_filter={filter_strength}."
        )

    result = {
        "source": "python-bridge",
        "response": response,
        "signals": {
            "emotion": emotion,
            "id_desire_count": len(desires),
            "superego_rule_count": len(moral),
            "ego_filter_strength": filter_strength,
        },
    }

    sys.stdout.write(json.dumps(result))


if __name__ == "__main__":
    main()
