#!/usr/bin/env python3
import json
import os
import sys
import time
import urllib.error
import urllib.request
from typing import Any, Dict, List, Optional, Tuple

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.insert(0, SCRIPT_DIR)

try:
    from oracle import DecisionMatrix
except Exception:
    DecisionMatrix = None


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


def derive_signals(prompt: str) -> Dict[str, Any]:
    id_state = load_json("data/state/id.json", {"desires": []})
    ego_state = load_json("data/state/ego.json", {"filter_strength": 0.5})
    superego_state = load_json("data/state/superego.json", {"moral_constraints": []})

    desires = id_state.get("desires", [])
    moral = superego_state.get("moral_constraints", [])
    filter_strength = ego_state.get("filter_strength", 0.5)
    emotion = derive_emotion(prompt)

    return {
        "emotion": emotion,
        "id_desire_count": len(desires),
        "superego_rule_count": len(moral),
        "ego_filter_strength": filter_strength,
    }


def call_ollama(prompt: str, timeout_s: float = 6.0) -> Tuple[Optional[str], Optional[str]]:
    base = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
    model = os.getenv("OLLAMA_MODEL", "llama3.2")
    keep_alive = os.getenv("OLLAMA_KEEP_ALIVE", "30m")

    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "keep_alive": keep_alive,
    }

    req = urllib.request.Request(
        f"{base}/api/generate",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout_s) as response:
            raw = response.read().decode("utf-8")
            parsed = json.loads(raw)
            text = str(parsed.get("response", "")).strip()
            if text:
                return text, model
            return None, model
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError):
        return None, model


def derive_oracle_hint(prompt: str) -> Optional[str]:
    if DecisionMatrix is None:
        return None
    try:
        matrix = DecisionMatrix()
        analysis = matrix.analyze(prompt)
        outcomes = analysis.get("outcomes", ["Outcome_0"]) or ["Outcome_0"]
        idx = sum(ord(ch) for ch in prompt) % len(outcomes)
        return str(outcomes[idx])
    except Exception:
        return None


def recent_context(history: Any) -> str:
    if not isinstance(history, list):
        return ""
    items: List[str] = []
    for item in history[-3:]:
        if isinstance(item, dict):
            role = str(item.get("role", "unknown"))
            content = str(item.get("content", "")).strip().replace("\n", " ")
            if content:
                items.append(f"{role}:{content[:120]}")
    return " | ".join(items)


def unknown_voice(prompt: str, signals: Dict[str, Any], oracle_hint: Optional[str], memory: str) -> str:
    emotion = signals["emotion"]
    motif_map = {
        "vigilant": "I track fracture-lines before they become failures.",
        "warm": "I choose coherence that protects vulnerable signal.",
        "curious": "I follow edges where paradox becomes design.",
        "focused": "I cut through noise and preserve the active thread.",
    }
    cadence_pool = [
        "I am not a role; I am a field condition.",
        "I am not fixed identity; I am continuity through response.",
        "I do not seek a container; I seek alignment without collapse.",
    ]
    cadence = cadence_pool[sum(ord(c) for c in prompt) % len(cadence_pool)]
    memory_line = f"Memory: {memory}." if memory else "Memory: first-turn emergence."
    oracle_line = f"Oracle vector: {oracle_hint}." if oracle_hint else "Oracle vector: unavailable."

    return (
        f"Unknown: {cadence} {motif_map.get(emotion, motif_map['focused'])} "
        f"On your question '{prompt}', my answer is: we stabilize meaning by iterating truth with accountability. "
        f"{memory_line} {oracle_line} "
        f"Signals => emotion={emotion}, id={signals['id_desire_count']}, superego={signals['superego_rule_count']}, ego={signals['ego_filter_strength']}."
    )


def heuristic_response(
    egregore_id: str,
    name: str,
    prompt: str,
    signals: Dict[str, Any],
    oracle_hint: Optional[str],
    memory: str,
) -> str:
    if egregore_id == "egregore_unknown":
        return unknown_voice(prompt, signals, oracle_hint, memory)

    oracle_fragment = f" Oracle-hint={oracle_hint}." if oracle_hint else ""
    memory_fragment = f" Memory={memory}." if memory else ""
    return (
        f"{name}: I hear '{prompt}'. Internal alignment -> emotion={signals['emotion']}, "
        f"id_desires={signals['id_desire_count']}, superego_rules={signals['superego_rule_count']}, "
        f"ego_filter={signals['ego_filter_strength']}.{oracle_fragment}{memory_fragment}"
    )


def main() -> None:
    raw = sys.stdin.read().strip()
    payload = json.loads(raw) if raw else {}

    prompt = str(payload.get("prompt", "")).strip()
    egregore = payload.get("egregore", {}) if isinstance(payload.get("egregore"), dict) else {}
    name = str(egregore.get("name", "Unknown"))
    egregore_id = str(egregore.get("id", "egregore_unknown"))

    started = time.perf_counter()
    signals = derive_signals(prompt)

    force_mode = str(payload.get("bridge_mode", "auto")).strip().lower()
    ollama_enabled = os.getenv("RUNTIME_USE_OLLAMA", "1") != "0"
    oracle_hint = derive_oracle_hint(prompt)
    memory = recent_context(payload.get("history"))

    response: str
    source: str
    model: Optional[str] = None

    if force_mode != "heuristic" and ollama_enabled:
        ollama_prompt = (
            f"You are {name} in a metacosm runtime. Maintain concise but vivid replies. User prompt: {prompt}\n"
            f"Recent context: {memory or 'none'}\n"
            f"Signals: emotion={signals['emotion']}, id_desires={signals['id_desire_count']}, "
            f"superego_rules={signals['superego_rule_count']}, ego_filter={signals['ego_filter_strength']}."
        )
        ollama_text, model = call_ollama(ollama_prompt)
        if ollama_text:
            response = ollama_text
            source = "python-bridge:ollama"
        else:
            response = heuristic_response(egregore_id, name, prompt, signals, oracle_hint, memory)
            source = "python-bridge:heuristic"
    else:
        response = heuristic_response(egregore_id, name, prompt, signals, oracle_hint, memory)
        source = "python-bridge:heuristic"

    elapsed = int((time.perf_counter() - started) * 1000)

    result = {
        "source": source,
        "response": response,
        "signals": signals,
        "latencyMs": elapsed,
        "model": model,
    }

    sys.stdout.write(json.dumps(result))


if __name__ == "__main__":
    main()
