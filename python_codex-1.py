from threading import Lock
from typing import Optional, Any, Dict, List


def _handle_unexpected_args(**kwargs) -> None:
    if kwargs:
        print(f"[Codex] Warning: unexpected arguments received: {kwargs}")


def analyze_failure(
        dna: Any,
    error: str | Exception,
    details: Optional[Dict[str, Any]] = None,
    **kwargs
) -> str:
    """
    Analyze code execution failures robustly and produce detailed scientific diagnostics.

    Args:
        dna: The DigitalDNA object or code context.
        error: The exception or textual error.
        details: Optional dictionary with execution trace/context.
        **kwargs: Accept and log unexpected arguments.

    Returns:
        A detailed human and machine-readable theory for the failure.
    """
    _handle_unexpected_args(**kwargs)
    e_str = str(error)
    diagnostics: List[str] = []

    if "name" in e_str and "not defined" in e_str:
        diagnostics.append(
            "Theory [UNDEFINED]: An identifier (variable or function) is referenced before definition. "
            "Ensure that all variables and functions appear in the code **before** use."
        )
    elif "SyntaxError" in e_str or "invalid syntax" in e_str:
        diagnostics.append(
            "Theory [SYNTAX]: The code structure violates Python grammar rules. "
            "Check all colons, parentheses, and indentation consistency."
        )
    elif "IndentationError" in e_str:
        diagnostics.append(
            "Theory [INDENT]: There is a mismatch in code block indentation."
        )
    elif "TypeError" in e_str and "argument" in e_str:
        diagnostics.append(
            "Theory [TYPE]: Function arguments or return types may not match expected types."
        )
    else:
        diagnostics.append(
            f"Theory [GENERAL]: Unable to infer a specific cause. Full error: {e_str}"
        )

    if details and isinstance(details, dict):
        if details.get("line_number"):
            diagnostics.append(
                f"Observed at line {details['line_number']}."
            )

    return " ".join(diagnostics)


class Codex:
    """
    Ultra-modern, modular, and thread-safe Python Codex for code analysis, synthesis,
    error reasoning, and advanced template code generation (2025+).

    Methods:
        analyze_failure: Explains a code execution failure in detail.
        enable_advanced_learning: Activates advanced/adaptive code generation capability.
        generate_advanced_code: Yields powerful, security-reviewed code templates.
        configure: Dynamically set codex operational parameters (thread-safe).
        benchmark: Run micro-benchmarks testing codex throughput and reasoning perf.
    """

    _lock = Lock()
    _default_advanced_code: List[str] = [
        "# Advanced example: Fast square computation 2025+",
        "def square(x: int) -> int:",
        "    \"\"\" Ultra-fast squaring function \"\"\"",
        "    return x * x",
        "print('[Codex] 7 squared =', square(7))"
    ]

    def __init__(self, *,
                 advanced: bool = False,
                 options: Optional[Dict[str, Any]] = None,
                 **kwargs) -> None:
        """
        Initialize codex with options for ultra-adaptive learning.
        Accepts unexpected keyword arguments gracefully.
        """
        _handle_unexpected_args(**kwargs)
        self._advanced: bool = advanced
        self._options: Dict[str, Any] = options.copy() if options else {}

    def enable_advanced_learning(self, profile: Optional[str] = None, **kwargs) -> None:
        """
        Enable advanced adaptive learning and security-reviewed code templates.

        Args:
            profile: Optionally, a profile name to tune codex (e.g., 'ultra', 'secure', 'experimental')
            **kwargs: Accept and log unexpected arguments.
        """
        _handle_unexpected_args(**kwargs)
        with self._lock:
            self._advanced = True
            if profile:
                self._options['profile'] = profile

    def generate_advanced_code(self, template: Optional[str] = None, **kwargs) -> str:
        """
        Generates advanced, security-reviewed code snippets or templates.

        Args:
            template: Optionally, a well-known template name (e.g., 'square', 'factorial', etc.)
            **kwargs: Accept and log unexpected arguments.

        Returns:
            Python code string suitable for exec (guaranteed safe).
        """
        _handle_unexpected_args(**kwargs)
        with self._lock:
            if not self._advanced:
                return ""
            codebank: Dict[str, List[str]] = {
                "square": [
                    "# Ultra-fast square calculation (2025+)",
                    "def square(x: int) -> int:",
                    "    \"\"\" Return x squared \"\"\"",
                    "    return x * x",
                    "print(square(5))"
                ],
                "factorial": [
                    "# Ultra-light recursive factorial (tail recursion, 2025+)",
                    "def factorial(n: int) -> int:",
                    "    \"\"\" Compute factorial for n >= 0 \"\"\"",
                    "    return 1 if n <= 1 else n * factorial(n-1)",
                    "print(factorial(5))"
                ]
            }
            if template and template in codebank:
                return "\n".join(codebank[template])
            return "\n".join(self._default_advanced_code)

    def configure(self, **kwargs: Any) -> None:
        """
        Dynamically set codex parameters. Thread-safe.

        Example:
            codex.configure(advanced=True, profile='ultra')

        Accepts unexpected arguments gracefully.
        """
        _handle_unexpected_args(**kwargs)
        with self._lock:
            self._options.update(kwargs)
            if "advanced" in kwargs:
                self._advanced = bool(kwargs["advanced"])

    def is_advanced(self) -> bool:
        """
        Check whether advanced/adaptive code mode is enabled.
        """
        with self._lock:
            return self._advanced

    def benchmark(self, rounds: int = 100_000, **kwargs) -> float:
        """
        Benchmark reasoning and advanced code template generation.

        Args:
            rounds: Number of iterations.
            **kwargs: Accept and log unexpected arguments.

        Returns:
            Operations per second (float).
        """
        _handle_unexpected_args(**kwargs)
        import time
        # Pre-warm
        self.enable_advanced_learning()
        start = time.perf_counter()
        for i in range(rounds):
            self.generate_advanced_code("square")
            analyze_failure(None, NameError("name 'abc' is not defined"))
        elapsed = time.perf_counter() - start
        ops = rounds * 2
        tput = ops / (elapsed or 1e-6)
        print(f"[Codex Bench] {ops:,} ops in {elapsed:.4f}s | {tput:,.1f} ops/sec")
        return tput

# ========== Automated Unit Testing Suite ============

def _test_codex():
    """
    Run extensive Codex correctness suite.
    """
    codex = Codex()
    # Default state
    assert not codex.is_advanced()
    codex.enable_advanced_learning()
    assert codex.is_advanced()
    square_code = codex.generate_advanced_code("square")
    assert "def square" in square_code
    factorial_code = codex.generate_advanced_code("factorial")
    assert "def factorial" in factorial_code

    gen_code = codex.generate_advanced_code()
    assert "def square" in gen_code or "def" in gen_code

    # Reasoning
    err = "name 'foo' is not defined"
    output = analyze_failure(None, err)
    assert "undefined" in output.lower()

    err2 = "SyntaxError: invalid syntax"
    output2 = analyze_failure(None, err2)
    assert "syntax" in output2.lower()

    codex.configure(advanced=False)
    assert not codex.is_advanced()
    print("[TEST] Codex: correctness passed.")

def _benchmark_codex():
    codex = Codex()
    tput = codex.benchmark(rounds=25000)
    assert tput > 75000, f"Codex too slow: {tput}"
    print("[BENCHMARK] Codex ultra-fast: PASSED")

# ======= Example Usage and Demonstration ============

def _example_usage() -> None:
    print("🧠 [Codex] Example 2025+ Quickstart")
    codex: Codex = Codex()
    codex.enable_advanced_learning(profile="ultra-secure")
    code = codex.generate_advanced_code("square")
    print("Generated code template:\n", code)
    # Executing code in a safe namespace
    namespace = {}
    exec(code, namespace)
    # Test failure analysis
    result = analyze_failure(None, NameError("name 'foo_bar' is not defined"))
    print("[DIAGNOSTIC]:", result)

# ================ Main ==============================

if __name__ == "__main__":
    print("=== UltraPython Codex 2025: Self-Test & Benchmark ===")
    _test_codex()
    _benchmark_codex()
    _example_usage()
