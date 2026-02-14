from typing import Optional


def compose_dialogue_response(
    name: str,
    egregore_id: str,
    prompt: str,
    emotion: str,
    id_desires: int,
    superego_rules: int,
    ego_filter: float,
    oracle_hint: Optional[str] = None,
    theory_hint: Optional[str] = None,
    artifact_hint: Optional[str] = None,
) -> str:
    """Create a deterministic bridge response from normalized signals."""
    oracle = f" Oracle-hint={oracle_hint}." if oracle_hint else ""
    theory = f" Theory-hint={theory_hint}." if theory_hint else ""
    artifacts = f" Artifact-context={artifact_hint}." if artifact_hint else ""

    if egregore_id == "egregore_unknown":
        return (
            f"Unknown: I remain uncontained. Prompt received -> '{prompt}'. "
            f"Signals: emotion={emotion}, id_desires={id_desires}, "
            f"moral_constraints={superego_rules}, ego_filter={ego_filter}."
            f"{oracle}{theory}{artifacts}"
        )

    return (
        f"{name}: I hear '{prompt}'. Internal alignment -> emotion={emotion}, "
        f"id_desires={id_desires}, superego_rules={superego_rules}, ego_filter={ego_filter}."
        f"{oracle}{theory}{artifacts}"
    )
