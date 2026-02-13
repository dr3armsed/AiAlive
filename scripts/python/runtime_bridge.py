#!/usr/bin/env python3
import json
import os
import sys
import time
from typing import Any, Dict, Optional

from dialogue import compose_dialogue_response
from entity_management import normalize_egregore
from persistence import load_runtime_state

try:
    from oracle import DecisionMatrix
except Exception:
    DecisionMatrix = None


def derive_emotion(prompt: str) -> str:
    p = prompt.lower()
    if any(k in p for k in ["fear", "risk", "threat", "danger"]):
        return "vigilant"
    if any(k in p for k in ["love", "trust", "care", "wonder"]):
        return "warm"
    if any(k in p for k in ["why", "how", "what if", "explore"]):
        return "curious"
    return "focused"


def resolve_oracle_hint(prompt: str) -> Optional[str]:
    if DecisionMatrix is None:
        return None
    try:
        matrix = DecisionMatrix()
        outcome = matrix.select_optimal_action(prompt)
        return str(outcome)
    except Exception:
        return None


def normalize_filter_strength(raw_filter: Any) -> float:
    try:
        value = float(raw_filter)
    except (TypeError, ValueError):
        value = 0.5
    return max(0.0, min(1.0, value))


def parse_payload(raw: str) -> Dict[str, Any]:
    if not raw:
        return {}
    parsed = json.loads(raw)
    if isinstance(parsed, dict):
        return parsed
    return {}


def error_result(reason: str, started: float) -> Dict[str, Any]:
    elapsed_ms = int((time.perf_counter() - started) * 1000)
    return {
        "source": "python-bridge:error",
        "response": "",
        "signals": {
            "emotion": "focused",
            "id_desire_count": 0,
            "superego_rule_count": 0,
            "ego_filter_strength": 0.5,
        },
        "latencyMs": elapsed_ms,
        "model": None,
        "error": reason,
    }


def main() -> None:
    started = time.perf_counter()
    raw = sys.stdin.read().strip()

    try:
        payload = parse_payload(raw)
    except json.JSONDecodeError:
        sys.stdout.write(json.dumps(error_result("invalid_json", started)))
        return

    prompt = str(payload.get("prompt", "")).strip()
    normalized = normalize_egregore(payload)
    name = normalized["name"]
    egregore_id = normalized["id"]

    state = load_runtime_state()
    desires = state["id"].get("desires", [])
    moral = state["superego"].get("moral_constraints", [])
    filter_strength = normalize_filter_strength(state["ego"].get("filter_strength", 0.5))

    emotion = derive_emotion(prompt)
    oracle_hint = resolve_oracle_hint(prompt)

    response = compose_dialogue_response(
        name=name,
        egregore_id=egregore_id,
        prompt=prompt,
        emotion=emotion,
        id_desires=len(desires),
        superego_rules=len(moral),
        ego_filter=filter_strength,
        oracle_hint=oracle_hint,
    )

    elapsed_ms = int((time.perf_counter() - started) * 1000)
    source = "python-bridge:heuristic" if os.getenv("RUNTIME_USE_OLLAMA", "0") != "1" else "python-bridge:ollama"

    result: Dict[str, Any] = {
        "source": source,
        "response": response,
        "signals": {
            "emotion": emotion,
            "id_desire_count": len(desires),
            "superego_rule_count": len(moral),
            "ego_filter_strength": filter_strength,
        },
        "latencyMs": elapsed_ms,
        "model": None,
    }

    sys.stdout.write(json.dumps(result))


if __name__ == "__main__":
    main()
