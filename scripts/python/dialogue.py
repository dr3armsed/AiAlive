from runtime.dialogue import compose_dialogue_response

__all__ = ["compose_dialogue_response"]
from typing import Any, Dict, Optional


def compose_dialogue_response(
    name: str,
    egregore_id: str,
    prompt: str,
    emotion: str,
    id_desires: int,
    superego_rules: int,
    ego_filter: float,
    oracle_hint: Optional[str] = None,
) -> str:
    """Create a deterministic bridge response from normalized signals."""
    hint = f" Oracle-hint={oracle_hint}." if oracle_hint else ""
    if egregore_id == "egregore_unknown":
        return (
            f"Unknown: I remain uncontained. Prompt received -> '{prompt}'. "
            f"Signals: emotion={emotion}, id_desires={id_desires}, "
            f"moral_constraints={superego_rules}, ego_filter={ego_filter}."
            f"{hint}"
        )

    return (
        f"{name}: I hear '{prompt}'. Internal alignment -> emotion={emotion}, "
        f"id_desires={id_desires}, superego_rules={superego_rules}, ego_filter={ego_filter}."
        f"{hint}"
    )
