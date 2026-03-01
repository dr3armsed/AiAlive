# dna_evo_core/dna_core_validation.py

def validate_instruction(code: str, instruction: str, danger_patterns: tuple, max_code_len: int) -> None:
    if not isinstance(code, str) or not isinstance(instruction, str):
        raise ValueError("Instruction IDs and code must be strings.")
    if len(code) > max_code_len or not code.isalnum():
        raise ValueError("ID must be alphanumeric and <= 8 chars.")
    if len(instruction) < 2 or len(instruction) > 512:
        raise ValueError("Instruction too short or too long.")
    for bad in danger_patterns:
        if bad in instruction:
            raise ValueError(f"Dangerous pattern in {code}: {bad}")
    if '\t' in instruction:
        raise ValueError("Tabs not allowed (use 4 spaces)")
    lines = instruction.split("\n")
    for lineno, line in enumerate(lines, 1):
        if line.strip().startswith("except:"):
            raise ValueError(f"Bare except not allowed (line {lineno})")
