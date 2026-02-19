#!/usr/bin/env python3
import json
import os
import re
import sys
import time
from typing import Any, Dict, Optional, Tuple

from runtime.dialogue import compose_dialogue_response
from runtime.entity_management import normalize_egregore
from runtime.persistence import load_runtime_state

try:
    from oracle import DecisionMatrix
except Exception:
    DecisionMatrix = None


STEERING_PATTERN = re.compile(r"^\[style=([^;\]]+);source=([^;\]]+);memoryDepth=(\d+)\]\s*(.*)$", re.IGNORECASE | re.DOTALL)


def derive_emotion(prompt: str) -> str:
    p = prompt.lower()
    if any(k in p for k in ["fear", "risk", "threat", "danger"]):
        return "vigilant"
    if any(k in p for k in ["love", "trust", "care", "wonder"]):
        return "warm"
    if any(k in p for k in ["why", "how", "what if", "explore"]):
        return "curious"
    return "focused"


def derive_theory_hint(prompt: str, emotion: str) -> str:
    text = (prompt or "").lower()
    corpus_present = os.path.exists("scripts/python/theory_formation.py")
    base = "theory-corpus-present" if corpus_present else "theory-corpus-missing"
    if any(token in text for token in ["why", "cause", "because", "explain"]):
        return f"{base}:causal-modeling"
    if any(token in text for token in ["future", "next", "trend", "forecast"]):
        return f"{base}:scenario-extrapolation"
    if emotion == "vigilant":
        return f"{base}:risk-boundary-analysis"
    return f"{base}:adaptive-hypothesis"


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


def parse_steering(prompt: str) -> Tuple[str, str, int, str]:
    match = STEERING_PATTERN.match(prompt.strip())
    if not match:
        return ("adaptive", "auto", 3, prompt)

    style_mode = match.group(1).strip().lower()
    source_mode = match.group(2).strip().lower()
    try:
        memory_depth = int(match.group(3))
    except ValueError:
        memory_depth = 3

    remainder = match.group(4).strip()

    if style_mode not in {"adaptive", "poetic", "tactical"}:
        style_mode = "adaptive"
    if source_mode not in {"auto", "external-first", "local-first"}:
        source_mode = "auto"

    memory_depth = max(1, min(10, memory_depth))
    return (style_mode, source_mode, memory_depth, remainder)


def resolve_source(source_mode: str) -> str:
    if source_mode == "local-first":
        return "python-bridge:ollama"
    if source_mode == "external-first":
        return "python-bridge:heuristic"
    return "python-bridge:heuristic" if os.getenv("RUNTIME_USE_OLLAMA", "0") != "1" else "python-bridge:ollama"


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


def build_artifact_hint(state: Dict[str, Dict[str, Any]]) -> str:
    artifacts = state.get("artifacts", {})
    heal_count = int(artifacts.get("heal_count", 0) or 0)
    patch_count = int(artifacts.get("patch_count", 0) or 0)
    has_unified = bool(artifacts.get("has_unified_patch", False))

    retrieval = artifacts.get("retrieval", {}) or {}
    retrieval_path = retrieval.get("path") or "none"
    retrieval_label = os.path.basename(str(retrieval_path)) if retrieval_path != "none" else "none"
    retrieval_excerpt = str(retrieval.get("excerpt") or "")
    if retrieval_excerpt:
        return (
            f"heals={heal_count},patches={patch_count},unified={str(has_unified).lower()},"
            f"retrieval={retrieval_label},excerpt={retrieval_excerpt}"
        )

    return (
        f"heals={heal_count},patches={patch_count},unified={str(has_unified).lower()},"
        f"retrieval={retrieval_label}"
    )


def main() -> None:
    started = time.perf_counter()
    raw = sys.stdin.read().strip()

    try:
        payload = parse_payload(raw)
    except json.JSONDecodeError:
        sys.stdout.write(json.dumps(error_result("invalid_json", started)))
        return

    raw_prompt = str(payload.get("prompt", "")).strip()
    style_mode, source_mode, memory_depth, prompt = parse_steering(raw_prompt)
    normalized = normalize_egregore(payload)
    name = normalized["name"]
    egregore_id = normalized["id"]

    state = load_runtime_state()
    desires = state["id"].get("desires", [])
    moral = state["superego"].get("moral_constraints", [])
    filter_strength = normalize_filter_strength(state["ego"].get("filter_strength", 0.5))

    emotion = derive_emotion(prompt)
    oracle_hint = resolve_oracle_hint(prompt)
    theory_hint = derive_theory_hint(prompt, emotion)
    artifact_hint = build_artifact_hint(state)

    response = compose_dialogue_response(
        name=name,
        egregore_id=egregore_id,
        prompt=prompt,
        emotion=emotion,
        id_desires=len(desires),
        superego_rules=len(moral),
        ego_filter=filter_strength,
        oracle_hint=oracle_hint,
        theory_hint=theory_hint,
        artifact_hint=artifact_hint,
        style_mode=style_mode,
        memory_depth=memory_depth,
    )

    elapsed_ms = int((time.perf_counter() - started) * 1000)
    source = resolve_source(source_mode)

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
